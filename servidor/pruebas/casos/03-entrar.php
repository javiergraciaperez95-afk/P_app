<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Entrar y fuerza bruta');

prueba('entrar bien: sesión nueva, guardada solo como huella', function () {
    cuenta();
    $r = espera(entrar('  ANA@example.com '), 200);
    $token = $r['json']['token'];
    verdad((bool) preg_match('/^\d{4}-\d\d-\d\dT/', $r['json']['caduca']), 'dice cuándo caduca');
    igual('ana@example.com', $r['json']['usuario']['correo']);
    $fila = Bd::uno('SELECT * FROM sesiones WHERE token_hash = ?', [hash('sha256', $token, true)]);
    verdad($fila !== null, 'la sesión está, por su huella');
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM sesiones WHERE token_hash = ?', [$token])['n'], 'el token no se guarda tal cual');
    verdad(Bd::uno("SELECT COUNT(*) AS n FROM eventos WHERE tipo = 'entrar'")['n'] >= 1, 'queda anotado');
});

prueba('cada entrada da un token distinto', function () {
    cuenta();
    $a = espera(entrar(), 200)['json']['token'];
    $b = espera(entrar(), 200)['json']['token'];
    verdad($a !== $b, 'tokens distintos');
    espera(api('GET', '/api/v1/yo', null, $a), 200);
    espera(api('GET', '/api/v1/yo', null, $b), 200);
});

prueba('contraseña mala y correo inexistente: exactamente la misma respuesta', function () {
    cuenta();
    $mala = espera(entrar('ana@example.com', 'no es esta contraseña'), 401, 'credenciales');
    $nadie = espera(entrar('nadie@example.com', 'no es esta contraseña'), 401, 'credenciales');
    igual($mala['crudo'], $nadie['crudo']);
});

prueba('el tiempo de respuesta no delata si la cuenta existe', function () {
    cuenta();
    $medir = static function (string $correo): float {
        $t = hrtime(true);
        entrar($correo, 'no es esta contraseña');
        return (hrtime(true) - $t) / 1e6;
    };
    $medir('ana@example.com'); $medir('nadie@example.com');   // calentar
    $existe = []; $noExiste = [];
    for ($i = 0; $i < 4; $i++) { $existe[] = $medir('ana@example.com'); $noExiste[] = $medir("nadie{$i}@example.com"); }
    sort($existe); sort($noExiste);
    $a = $existe[1]; $b = $noExiste[1];
    verdad(abs($a - $b) < max($a, $b) * 0.5, sprintf('tiempos parecidos (existe %.0f ms, no existe %.0f ms)', $a, $b));
});

prueba('con 5 fallos aún se entra con la buena, y acertar pone el contador a cero', function () {
    cuenta();
    for ($i = 1; $i <= 5; $i++) espera(entrar('ana@example.com', "fallo número {$i}"), 401, 'credenciales');
    espera(entrar(), 200);
    for ($i = 1; $i <= 5; $i++) espera(entrar('ana@example.com', "fallo nuevo {$i}"), 401, 'credenciales');
    espera(entrar(), 200);
});

prueba('el 6.º fallo activa la espera: ni con la buena se entra', function () {
    cuenta();
    for ($i = 1; $i <= 6; $i++) espera(entrar('ana@example.com', "fallo número {$i}"), 401, 'credenciales');
    espera(entrar(), 429, 'demasiados');
    espera(entrar('ana@example.com', 'otro fallo más'), 429, 'demasiados');   // no se cuenta ni se alarga
    $faltan = \Paglot\Tiempo::faltan(Bd::uno("SELECT bloqueado_hasta FROM limites WHERE clave LIKE 'entrar_correo:%'")['bloqueado_hasta']);
    verdad($faltan > 890 && $faltan <= 900, "sigue en 15 minutos (faltan {$faltan} s)");
});

prueba('espera creciente: 15 min la primera vez, 30 la segunda; con la buena después, se olvida', function () {
    cuenta();
    for ($i = 1; $i <= 6; $i++) entrar('ana@example.com', "fallo {$i}");
    $r = espera(entrar(), 429, 'demasiados');
    igual('900', $r['cab']['retry-after'] ?? null, 'primera espera: 15 minutos');
    igual('900', (string) $r['json']['reintentar']);

    // Pasa la espera: se puede volver a intentar.
    Bd::ejecutar('UPDATE limites SET bloqueado_hasta = ?, inicio = ?', [hace(1), hace(901)]);
    for ($i = 1; $i <= 6; $i++) entrar('ana@example.com', "otro fallo {$i}");
    $r = espera(entrar(), 429, 'demasiados');
    igual('1800', $r['cab']['retry-after'] ?? null, 'segunda espera: el doble');

    Bd::ejecutar('UPDATE limites SET bloqueado_hasta = ?, inicio = ?', [hace(1), hace(1801)]);
    espera(entrar(), 200);
    igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM limites WHERE clave LIKE 'entrar_correo:%'")['n'], 'acertar borra los fallos');
});

prueba('la espera de una cuenta no afecta a otra', function () {
    cuenta('ana@example.com');
    cuenta('luis@example.com');
    for ($i = 1; $i <= 7; $i++) entrar('ana@example.com', "fallo {$i}");
    espera(entrar('ana@example.com'), 429, 'demasiados');
    espera(entrar('luis@example.com'), 200);
});

prueba('los límites no guardan ni correos ni IP a la vista', function () {
    cuenta();
    entrar('ana@example.com', 'fallo');
    foreach (Bd::todos('SELECT clave FROM limites') as $f) {
        verdad(!str_contains($f['clave'], 'ana') && !str_contains($f['clave'], '127.0.0.1'), 'clave sin datos: ' . $f['clave']);
    }
});

prueba('cuentas que vienen de Supabase (bcrypt) entran y pasan a Argon2id', function () {
    $c = cuenta();
    $bcrypt = str_replace('$2y$', '$2a$', password_hash('mi contraseña de supabase', PASSWORD_BCRYPT, ['cost' => 10]));
    Bd::ejecutar('UPDATE usuarios SET hash = ?', [$bcrypt]);
    espera(entrar('ana@example.com', 'mi contraseña de supabase'), 200);
    verdad(str_starts_with(Bd::uno('SELECT hash FROM usuarios')['hash'], '$argon2id$'), 'huella mejorada');
    espera(entrar('ana@example.com', 'mi contraseña de supabase'), 200);
});

prueba('contraseñas absurdamente largas al entrar: no se calculan', function () {
    cuenta();
    $t = hrtime(true);
    espera(entrar('ana@example.com', str_repeat('x', 100_000)), 401, 'credenciales');
    verdad((hrtime(true) - $t) / 1e9 < 5, 'responde rápido');
});
