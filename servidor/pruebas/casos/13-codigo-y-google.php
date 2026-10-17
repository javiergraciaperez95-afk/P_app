<?php
declare(strict_types=1);

use Paglot\Bd;
use Paglot\Config;

grupo('Entrar con código y con Google');

/** Pide un código para ese correo y devuelve las 6 cifras que llegan. */
function pedir_codigo(string $correo = 'ana@example.com'): string
{
    espera(api('POST', '/api/v1/codigo', ['correo' => $correo, 'idioma' => 'es']), 202);
    $c = ultimo_correo($correo, 'codigo');
    if (!preg_match('/^\s+(\d{6})$/m', $c['texto'], $m)) falla('El correo no trae un código de 6 cifras');
    return $m[1];
}

function con_codigo(string $correo, string $codigo, array $extra = []): array
{
    return api('POST', '/api/v1/codigo/entrar', ['correo' => $correo, 'codigo' => $codigo] + $extra);
}

/** Una clave RSA nueva. En Windows, OpenSSL necesita su openssl.cnf (va con PHP, en extras/ssl). */
function clave_rsa(): OpenSSLAsymmetricKey
{
    $opciones = ['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA];
    $cnf = dirname(PHP_BINARY) . '/extras/ssl/openssl.cnf';
    if (is_file($cnf)) $opciones['config'] = $cnf;
    return openssl_pkey_new($opciones) ?: falla('No se pudo crear una clave RSA: ' . openssl_error_string());
}

/** Una clave RSA de prueba (Google de mentira): se publica en el archivo de claves que lee la API. */
function google_clave(): \OpenSSLAsymmetricKey
{
    static $clave = null;
    if ($clave !== null) return $clave;
    $clave = clave_rsa();
    $rsa = openssl_pkey_get_details($clave)['rsa'];
    $b64 = static fn (string $b): string => rtrim(strtr(base64_encode($b), '+/', '-_'), '=');
    file_put_contents((string) Config::get('google.claves_archivo'), json_encode(['keys' => [
        ['kty' => 'RSA', 'alg' => 'RS256', 'use' => 'sig', 'kid' => 'prueba-1', 'n' => $b64($rsa['n']), 'e' => $b64($rsa['e'])],
    ]]));
    return $clave;
}

/** Un ID token como los de Google, firmado con la clave de prueba (o con otra, para probar firmas falsas). */
function google_token(array $cambios = [], ?\OpenSSLAsymmetricKey $clave = null): string
{
    $b64 = static fn (string $b): string => rtrim(strtr(base64_encode($b), '+/', '-_'), '=');
    $datos = array_replace([
        'iss' => 'https://accounts.google.com',
        'aud' => 'cliente-de-prueba.apps.googleusercontent.com',
        'sub' => '1098765432101234567890',
        'email' => 'ana@example.com',
        'email_verified' => true,
        'name' => 'Ana García',
        'iat' => time(),
        'exp' => time() + 3600,
    ], $cambios);
    $cuerpo = $b64(json_encode(['alg' => 'RS256', 'kid' => 'prueba-1', 'typ' => 'JWT'])) . '.' . $b64(json_encode($datos));
    openssl_sign($cuerpo, $firma, $clave ?? google_clave(), OPENSSL_ALGO_SHA256);
    return $cuerpo . '.' . $b64($firma);
}

function con_google(string $token): array
{
    return api('POST', '/api/v1/google', ['credencial' => $token, 'idioma' => 'es']);
}

// --- Código por correo ---------------------------------------------------------------------------

prueba('el código crea la cuenta ya confirmada y sin contraseña', function () {
    $codigo = pedir_codigo();
    igual(null, Bd::uno("SELECT id FROM usuarios WHERE correo = 'ana@example.com'"), 'pedir el código no crea nada');
    $r = espera(con_codigo('ANA@example.com', $codigo, ['nombre' => 'Ana']), 200);
    igual(true, $r['json']['nueva']);
    igual(true, $r['json']['usuario']['confirmado']);
    igual(false, $r['json']['usuario']['contrasena']);
    igual('Ana', $r['json']['usuario']['nombre']);
    espera(api('GET', '/api/v1/yo', null, $r['json']['token']), 200);
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM codigos')['n'], 'el código se gasta');
});

prueba('la segunda vez entra en la misma cuenta; con espacios en el código también vale', function () {
    $a = espera(con_codigo('ana@example.com', pedir_codigo()), 200)['json'];
    $codigo = pedir_codigo();
    $b = espera(con_codigo('ana@example.com', substr($codigo, 0, 3) . ' ' . substr($codigo, 3)), 200)['json'];
    igual(false, $b['nueva']);
    igual($a['usuario']['id'], $b['usuario']['id']);
});

prueba('un código no vale dos veces, ni para otro correo', function () {
    $codigo = pedir_codigo();
    espera(con_codigo('otra@example.com', $codigo), 400, 'codigo_invalido');
    espera(con_codigo('ana@example.com', $codigo), 200);
    espera(con_codigo('ana@example.com', $codigo), 400, 'codigo_invalido');
});

prueba('solo vale el último código pedido', function () {
    $viejo = pedir_codigo();
    $nuevo = pedir_codigo();
    if ($viejo !== $nuevo) espera(con_codigo('ana@example.com', $viejo), 400, 'codigo_invalido');
    espera(con_codigo('ana@example.com', $nuevo), 200);
});

prueba('al 5.º fallo el código se gasta: ni el bueno sirve ya', function () {
    $codigo = pedir_codigo();
    $malo = $codigo === '000000' ? '111111' : '000000';
    for ($i = 1; $i <= 5; $i++) espera(con_codigo('ana@example.com', $malo), 400, 'codigo_invalido');
    espera(con_codigo('ana@example.com', $codigo), 400, 'codigo_invalido');
});

prueba('con 4 fallos aún vale el bueno', function () {
    $codigo = pedir_codigo();
    $malo = $codigo === '000000' ? '111111' : '000000';
    for ($i = 1; $i <= 4; $i++) espera(con_codigo('ana@example.com', $malo), 400, 'codigo_invalido');
    espera(con_codigo('ana@example.com', $codigo), 200);
});

prueba('más de 10 fallos por hora en un mismo correo: espera, aunque cada vez se pida un código nuevo y venga de otra IP', function () {
    $malo = static fn (string $bueno): string => $bueno === '000000' ? '111111' : '000000';
    $codigo = pedir_codigo();
    for ($i = 1; $i <= 5; $i++) espera(con_codigo('ana@example.com', $malo($codigo)), 400, 'codigo_invalido');
    Bd::ejecutar("DELETE FROM limites WHERE clave NOT LIKE 'codigo_fallo:%'");   // como si viniera de otra IP y fuera otra hora
    $codigo = pedir_codigo();
    for ($i = 1; $i <= 6; $i++) espera(con_codigo('ana@example.com', $malo($codigo)), 400, 'codigo_invalido');
    Bd::ejecutar("DELETE FROM limites WHERE clave NOT LIKE 'codigo_fallo:%'");
    $codigo = pedir_codigo();
    $r = espera(con_codigo('ana@example.com', $codigo), 429, 'demasiados');   // ni el bueno
    igual('3600', $r['cab']['retry-after'] ?? null, 'una hora');
    espera(con_codigo('luis@example.com', '123456'), 400, 'codigo_invalido');   // otro correo, aparte
});

prueba('acertar el código pone a cero los fallos', function () {
    $codigo = pedir_codigo();
    for ($i = 1; $i <= 4; $i++) espera(con_codigo('ana@example.com', $codigo === '000000' ? '111111' : '000000'), 400);
    espera(con_codigo('ana@example.com', $codigo), 200);
    igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM limites WHERE clave LIKE 'codigo_fallo:%'")['n']);
});

prueba('si el correo del código no sale (límite por dirección), el código anterior sigue valiendo y no hay otro', function () {
    $codigo = pedir_codigo();
    Bd::ejecutar("UPDATE limites SET cuenta = 99 WHERE clave LIKE 'correo_destino:%'");   // dirección ya «llena»
    espera(api('POST', '/api/v1/codigo', ['correo' => 'ana@example.com']), 202);
    espera(con_codigo('ana@example.com', $codigo), 200);
});

prueba('un código caducado no vale', function () {
    $codigo = pedir_codigo();
    Bd::ejecutar('UPDATE codigos SET caduca = ?', [hace(1)]);
    espera(con_codigo('ana@example.com', $codigo), 400, 'codigo_invalido');
});

prueba('códigos con forma rara: el mismo error, sin buscar nada', function () {
    pedir_codigo();
    foreach (['12345', '1234567', 'abcdef', ''] as $raro) espera(con_codigo('ana@example.com', $raro), 400, 'codigo_invalido');
});

prueba('pedir un código responde igual exista o no la cuenta', function () {
    espera(con_codigo('ana@example.com', pedir_codigo()), 200);
    $existe = espera(api('POST', '/api/v1/codigo', ['correo' => 'ana@example.com']), 202);
    $nadie = espera(api('POST', '/api/v1/codigo', ['correo' => 'nadie@example.com']), 202);
    igual($existe['crudo'], $nadie['crudo']);
});

prueba('más de 5 códigos por hora al mismo correo: no llegan más, y la respuesta no cambia', function () {
    for ($i = 1; $i <= 5; $i++) pedir_codigo();
    $antes = count(correos('ana@example.com'));
    espera(api('POST', '/api/v1/codigo', ['correo' => 'ana@example.com']), 202);
    igual($antes, count(correos('ana@example.com')), 'el 6.º no se envía');
});

prueba('el correo del código está en el idioma pedido y trae el código bien visible', function () {
    pedir_codigo();
    $c = ultimo_correo('ana@example.com', 'codigo');
    verdad(str_contains($c['asunto'], 'Tu código de Paglot'), 'en español');
    verdad((bool) preg_match('/letter-spacing:8px;[^>]*>\d{6}</', $c['html']), 'el código, grande en el HTML');
});

prueba('una cuenta sin confirmar con la contraseña de otro: el código la confirma y le quita esa contraseña', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => 'la puso un intruso']), 202);
    $r = espera(con_codigo('ana@example.com', pedir_codigo()), 200)['json'];
    igual(false, $r['nueva']);
    igual(false, $r['usuario']['contrasena']);
    espera(entrar('ana@example.com', 'la puso un intruso'), 401, 'credenciales');
});

prueba('una cuenta confirmada con contraseña: el código también entra, y la contraseña sigue valiendo', function () {
    $c = cuenta();
    $r = espera(con_codigo('ana@example.com', pedir_codigo()), 200)['json'];
    igual($c['usuario']['id'], $r['usuario']['id']);
    igual(true, $r['usuario']['contrasena']);
    espera(entrar(), 200);
});

prueba('sin contraseña se puede poner la primera sin «actual», y luego entrar con ella', function () {
    $r = espera(con_codigo('ana@example.com', pedir_codigo()), 200)['json'];
    espera(api('POST', '/api/v1/yo/contrasena', ['nueva' => CLAVE], $r['token']), 200);
    espera(entrar(), 200);
    // Ya con contraseña, cambiarla vuelve a pedir la actual.
    espera(api('POST', '/api/v1/yo/contrasena', ['nueva' => 'otra frase bastante larga'], $r['token']), 400, 'datos_invalidos');
});

prueba('sin contraseña se puede borrar la cuenta (basta la sesión)', function () {
    $r = espera(con_codigo('ana@example.com', pedir_codigo()), 200)['json'];
    espera(api('DELETE', '/api/v1/yo', ['contrasena' => ''], $r['token']), 200);
    igual(null, Bd::uno("SELECT id FROM usuarios WHERE correo = 'ana@example.com'"));
});

// --- Google --------------------------------------------------------------------------------------

prueba('Google: crea la cuenta confirmada, con el nombre de Google', function () {
    $r = espera(con_google(google_token()), 200)['json'];
    igual(true, $r['nueva']);
    igual(true, $r['usuario']['google']);
    igual(false, $r['usuario']['contrasena']);
    igual('Ana García', $r['usuario']['nombre']);
    igual('ana@example.com', $r['usuario']['correo']);
    $otra = espera(con_google(google_token()), 200)['json'];
    igual(false, $otra['nueva']);
    igual($r['usuario']['id'], $otra['usuario']['id']);
});

prueba('Google: si cambia el correo en Google, sigue siendo la misma cuenta (por «sub»)', function () {
    $a = espera(con_google(google_token()), 200)['json'];
    $b = espera(con_google(google_token(['email' => 'ana.nueva@example.com'])), 200)['json'];
    igual($a['usuario']['id'], $b['usuario']['id']);
});

prueba('Google: con un Gmail que ya tiene cuenta, entra en ella y la enlaza', function () {
    $c = cuenta('ana@gmail.com');
    $r = espera(con_google(google_token(['email' => 'ana@gmail.com'])), 200)['json'];
    igual($c['usuario']['id'], $r['usuario']['id']);
    igual(true, $r['usuario']['google']);
    igual(true, $r['usuario']['contrasena'], 'la contraseña sigue');
    espera(entrar('ana@gmail.com'), 200);
});

prueba('Google: con un correo de empresa de Google («hd» igual al dominio) también se enlaza', function () {
    $c = cuenta('ana@miempresa.es');
    $r = espera(con_google(google_token(['email' => 'ana@miempresa.es', 'hd' => 'miempresa.es'])), 200)['json'];
    igual($c['usuario']['id'], $r['usuario']['id']);
    espera(con_google(google_token(['sub' => '2', 'email' => 'ana@miempresa.es', 'hd' => 'otra.es'])), 409, 'google_enlazar');
});

prueba('Google: con un correo de otro dominio que ya tiene cuenta, NO entra: hay que entrar antes y enlazarlo', function () {
    $c = cuenta('ana@example.com');
    espera(con_google(google_token()), 409, 'google_enlazar');
    igual(null, Bd::uno('SELECT google_sub FROM usuarios')['google_sub'], 'sin enlazar');
    $r = espera(api('POST', '/api/v1/yo/google', ['credencial' => google_token()], $c['token']), 200)['json'];
    igual(true, $r['usuario']['google']);
    $g = espera(con_google(google_token()), 200)['json'];   // ya enlazada: entra por «sub»
    igual($c['usuario']['id'], $g['usuario']['id']);
});

prueba('Google: enlazar pide sesión, y una cuenta de Google no se enlaza a dos cuentas', function () {
    espera(api('POST', '/api/v1/yo/google', ['credencial' => google_token()]), 401, 'sin_sesion');
    $ana = cuenta('ana@example.com');
    $luis = cuenta('luis@example.com');
    espera(api('POST', '/api/v1/yo/google', ['credencial' => google_token()], $ana['token']), 200);
    espera(api('POST', '/api/v1/yo/google', ['credencial' => google_token()], $luis['token']), 409, 'google_en_uso');
    espera(api('POST', '/api/v1/yo/google', ['credencial' => google_token([], clave_rsa())], $luis['token']), 401, 'google_invalido');
    espera(api('POST', '/api/v1/yo/google', ['credencial' => google_token()], $ana['token']), 200);   // volver a enlazar la misma: bien
});

prueba('Google: una cuenta nueva con un correo de cualquier dominio sí se crea', function () {
    $r = espera(con_google(google_token(['email' => 'nueva@example.org'])), 200)['json'];
    igual(true, $r['nueva']);
});

prueba('Google: tokens falsos, ajenos, caducados o sin correo verificado no entran', function () {
    $otraClave = clave_rsa();
    espera(con_google(google_token([], $otraClave)), 401, 'google_invalido');
    espera(con_google(google_token(['aud' => 'otra-app.apps.googleusercontent.com'])), 401, 'google_invalido');
    espera(con_google(google_token(['iss' => 'https://malvado.example'])), 401, 'google_invalido');
    espera(con_google(google_token(['exp' => time() - 3600])), 401, 'google_invalido');
    espera(con_google(google_token(['email_verified' => false])), 401, 'google_invalido');
    espera(con_google('no.es.un-token'), 401, 'google_invalido');
    espera(con_google('basura'), 401, 'google_invalido');
    // El cuerpo cambiado (otro correo) con la firma de antes.
    [$c, , $f] = explode('.', google_token());
    $cuerpo = rtrim(strtr(base64_encode(json_encode(['iss' => 'https://accounts.google.com', 'aud' => 'cliente-de-prueba.apps.googleusercontent.com', 'sub' => '1', 'email' => 'jefe@example.com', 'email_verified' => true, 'exp' => time() + 3600])), '+/', '-_'), '=');
    espera(con_google("{$c}.{$cuerpo}.{$f}"), 401, 'google_invalido');
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM usuarios')['n'], 'no se ha creado ninguna cuenta');
});

prueba('Google: una cuenta sin confirmar con ese Gmail queda confirmada y sin la contraseña de otro', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@gmail.com', 'contrasena' => 'la puso un intruso']), 202);
    $r = espera(con_google(google_token(['email' => 'ana@gmail.com'])), 200)['json'];
    igual(true, $r['usuario']['confirmado']);
    igual(false, $r['usuario']['contrasena']);
});

prueba('Google: un token con una clave inventada no hace pedir las claves a Google cada vez', function () {
    falso_resend('ok');
    $cache = dirname((string) Config::get('registro_errores')) . '/google-claves-prueba.json';
    @mkdir(dirname($cache), 0700, true);
    @unlink($cache);
    con_config(['google' => ['claves_archivo' => null, 'claves_url' => 'http://127.0.0.1:8182/certs', 'cache' => $cache]], function () use ($cache) {
        $intentar = static function (): void {
            [$c, $d, $f] = explode('.', google_token());
            $cabecera = rtrim(strtr(base64_encode(json_encode(['alg' => 'RS256', 'kid' => 'inventada-' . bin2hex(random_bytes(4))])), '+/', '-_'), '=');
            try {
                \Paglot\Google::verificar("{$cabecera}.{$d}.{$f}");
                falla('Un token con una clave desconocida ha valido');
            } catch (\Paglot\ErrorApi $e) {
                igual('google_invalido', $e->codigo);
            }
        };
        for ($i = 0; $i < 5; $i++) $intentar();
        igual(1, count(peticiones_resend()), 'una sola petición de claves en 5 intentos');
        // Pasados 5 minutos, sí se vuelve a pedir (Google cambia sus claves de vez en cuando).
        $guardado = json_decode((string) file_get_contents($cache), true);
        $guardado['pedidas'] = time() - 400;
        file_put_contents($cache, json_encode($guardado));
        $intentar();
        igual(2, count(peticiones_resend()), 'otra petición pasados 5 minutos');
    });
    @unlink($cache);
});
