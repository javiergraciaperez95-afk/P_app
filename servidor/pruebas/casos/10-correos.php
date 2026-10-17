<?php
declare(strict_types=1);

use Paglot\Bd;
use Paglot\Config;
use Paglot\Correo;
use Paglot\Plantillas;

grupo('Correos y plantillas');

/** Carga una configuración igual a la de pruebas pero con cambios; la deja como estaba al terminar. */
function con_config(array $cambios, callable $fn): void
{
    $original = (string) getenv('PAGLOT_CONFIG');
    $config = array_replace_recursive(require $original, $cambios);
    $temporal = dirname($original) . '/config-temporal-' . bin2hex(random_bytes(6)) . '.php';
    file_put_contents($temporal, '<?php return ' . var_export($config, true) . ';');
    try {
        Config::cargar($temporal);
        Bd::cerrar();
        $fn();
    } finally {
        Correo::descartar();
        Config::cargar($original);
        Bd::cerrar();
        Bd::conectar(true);   // las pruebas siguen con el usuario de las tareas
        @unlink($temporal);
    }
}

function falso_resend(string $modo = 'ok'): string
{
    $dir = (string) getenv('FALSO_RESEND_DIR');
    file_put_contents($dir . '/modo.txt', $modo);
    @unlink($dir . '/peticiones.jsonl');
    return $dir;
}

function peticiones_resend(): array
{
    $archivo = getenv('FALSO_RESEND_DIR') . '/peticiones.jsonl';
    if (!is_file($archivo)) return [];
    return array_map(fn ($l) => json_decode($l, true), array_filter(explode("\n", (string) file_get_contents($archivo))));
}

prueba('todas las plantillas existen en español e inglés; los otros idiomas reciben inglés', function () {
    foreach (Plantillas::NOMBRES as $p) {
        foreach (['es', 'en'] as $idioma) {
            $c = Plantillas::componer($p, $idioma, ['nombre' => 'Ana', 'enlace' => 'https://paglot.app/#/enlace/x/y', 'horas' => 48, 'minutos' => 60, 'correo' => 'a***@b.com', 'codigo' => '123456']);
            verdad($c['asunto'] !== '' && str_contains($c['html'], '</html>') && str_contains($c['texto'], 'Paglot'), "{$p}/{$idioma} completa");
            verdad(!preg_match('/\{[a-z]+\}/', $c['texto'] . $c['html']), "{$p}/{$idioma}: sin marcadores sin cambiar");
        }
        igual(Plantillas::componer($p, 'en')['asunto'], Plantillas::componer($p, 'ja')['asunto'], "{$p}: japonés → inglés por ahora");
    }
});

prueba('lo que escribe la persona se escapa en el HTML y no rompe el texto', function () {
    $c = Plantillas::componer('confirmar', 'es', [
        'nombre' => '<script>alert(1)</script><a href="https://malvada.example">pulsa</a>',
        'enlace' => 'https://paglot.app/#/enlace/confirmar/abc"onmouseover="x',
        'horas'  => 48,
    ]);
    verdad(!str_contains($c['html'], '<script>') && str_contains($c['html'], '&lt;script&gt;'), 'nombre escapado');
    verdad(!str_contains($c['html'], 'href="https://malvada'), 'sin enlaces inyectados');
    verdad(!str_contains($c['html'], '"onmouseover="'), 'el enlace no rompe el atributo');
    $c = Plantillas::componer('confirmar', 'es', ['nombre' => "Ana\r\nBcc: todos@example.com", 'horas' => 1]);
    verdad(!str_contains($c['texto'], "Ana\r\n") && str_contains($c['texto'], 'Ana Bcc:'), 'sin saltos de línea inyectados');
});

prueba('Resend: la petición va bien formada y con la clave', function () {
    falso_resend('ok');
    con_config(['correo' => ['modo' => 'resend', 'resend_url' => 'http://127.0.0.1:8182/emails', 'resend_clave' => 're_prueba_123']], function () {
        Correo::enviar('ana@example.com', 'confirmar', 'es', ['nombre' => 'Ana', 'enlace' => 'https://paglot.app/#/enlace/confirmar/abc', 'horas' => 48]);
        Correo::despachar();
    });
    $ps = peticiones_resend();
    igual(1, count($ps), 'una petición a Resend');
    igual('POST', $ps[0]['metodo']);
    igual('Bearer re_prueba_123', $ps[0]['autorizacion']);
    $cuerpo = json_decode($ps[0]['cuerpo'], true);
    igual(['ana@example.com'], $cuerpo['to']);
    igual('Confirma tu cuenta de Paglot', $cuerpo['subject']);
    verdad(str_contains($cuerpo['html'], 'https://paglot.app/#/enlace/confirmar/abc') && str_contains($cuerpo['text'], 'Ana'), 'html y texto');
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM correos_pendientes')['n']);
});

prueba('Resend falla: el correo se guarda y se reintenta después', function () {
    falso_resend('fallo');
    con_config(['correo' => ['modo' => 'resend', 'resend_url' => 'http://127.0.0.1:8182/emails', 'resend_clave' => 're_prueba_123']], function () {
        Correo::enviar('ana@example.com', 'recuperar', 'es', ['nombre' => 'Ana', 'enlace' => 'https://paglot.app/#/enlace/recuperar/abc', 'minutos' => 60]);
        Correo::despachar();
        igual(1, (int) Bd::uno('SELECT COUNT(*) AS n FROM correos_pendientes')['n'], 'guardado para reintentar');
        $p = Bd::uno('SELECT * FROM correos_pendientes');
        verdad(!str_contains(json_encode($p), 're_prueba_123'), 'la clave de Resend no se guarda');

        // Aún no toca reintentar.
        igual(0, Correo::reintentarPendientes());
        Bd::ejecutar('UPDATE correos_pendientes SET siguiente = ?', [hace(1)]);
        igual(0, Correo::reintentarPendientes(), 'sigue fallando');
        igual(2, (int) Bd::uno('SELECT intentos FROM correos_pendientes')['intentos']);

        file_put_contents(getenv('FALSO_RESEND_DIR') . '/modo.txt', 'ok');
        Bd::ejecutar('UPDATE correos_pendientes SET siguiente = ?', [hace(1)]);
        igual(1, Correo::reintentarPendientes(), 'ahora sí');
        igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM correos_pendientes')['n']);
    });
});

prueba('si la petición falla, no sale ningún correo a medias', function () {
    // Cambiar el correo con la contraseña mala: ni enlace ni aviso.
    $c = cuenta();
    $antes = count(correos());
    espera(api('POST', '/api/v1/yo/correo', ['contrasena' => 'mala', 'nuevo' => 'nuevo@example.com'], $c['token']), 403);
    igual($antes, count(correos()));
});
