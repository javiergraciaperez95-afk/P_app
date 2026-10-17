<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Registro y confirmación');

prueba('registrarse: 202, correo de confirmar y cuenta sin confirmar', function () {
    $r = espera(api('POST', '/api/v1/registro', ['correo' => '  Ana@Example.COM ', 'contrasena' => CLAVE, 'nombre' => 'Ana', 'idioma' => 'en']), 202);
    igual(['ok' => true], $r['json']);
    $u = Bd::uno('SELECT * FROM usuarios');
    igual('ana@example.com', $u['correo'], 'correo normalizado');
    igual(null, $u['confirmado'], 'sin confirmar');
    igual('en', $u['idioma']);
    verdad(str_starts_with($u['hash'], '$argon2id$'), 'contraseña con Argon2id');
    verdad(!str_contains($u['hash'], CLAVE), 'nunca la contraseña en claro');
    verdad((bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $u['id']), 'id UUID v4');
    $correo = ultimo_correo('ana@example.com', 'confirmar');
    igual('Confirm your Paglot account', $correo['asunto'], 'correo en el idioma de la persona');
    token_de($correo);
});

prueba('sin confirmar no se puede usar la cuenta', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    espera(entrar(), 403, 'sin_confirmar');
    espera(entrar('ana@example.com', 'otra contraseña cualquiera'), 401, 'credenciales');   // con la mala no se dice nada más
});

prueba('confirmar abre sesión y la cuenta queda confirmada', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE, 'nombre' => 'Ana']), 202);
    $r = espera(api('POST', '/api/v1/confirmar', ['token' => token_de(ultimo_correo('ana@example.com', 'confirmar'))]), 200);
    verdad((bool) preg_match('/^[A-Za-z0-9_-]{43}$/', $r['json']['token']), 'token de sesión de 43 caracteres');
    igual(true, $r['json']['usuario']['confirmado']);
    igual('Ana', $r['json']['usuario']['nombre']);
    verdad(!array_key_exists('hash', $r['json']['usuario']), 'la huella nunca sale');
    espera(api('GET', '/api/v1/yo', null, $r['json']['token']), 200);
    espera(entrar(), 200);
});

prueba('el enlace de confirmar solo vale una vez', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    $token = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    espera(api('POST', '/api/v1/confirmar', ['token' => $token]), 200);
    espera(api('POST', '/api/v1/confirmar', ['token' => $token]), 400, 'enlace_invalido');
});

prueba('enlaces falsos, mal formados o caducados no valen', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    espera(api('POST', '/api/v1/confirmar', ['token' => 'corto']), 400, 'enlace_invalido');
    espera(api('POST', '/api/v1/confirmar', ['token' => str_repeat('A', 43)]), 400, 'enlace_invalido');
    espera(api('POST', '/api/v1/confirmar', ['token' => str_repeat('A', 42) . '!']), 400, 'enlace_invalido');
    espera(api('POST', '/api/v1/confirmar', ['token' => "' OR 1=1 -- aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]), 400, 'enlace_invalido');
    $token = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    Bd::ejecutar('UPDATE tokens SET caduca = ?', [hace(1)]);
    espera(api('POST', '/api/v1/confirmar', ['token' => $token]), 400, 'enlace_invalido');
});

prueba('el token del enlace se guarda solo como huella', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    $token = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    $fila = Bd::uno('SELECT token_hash FROM tokens');
    igual(hash('sha256', $token, true), $fila['token_hash']);
    igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM tokens WHERE token_hash = ?", [$token])['n']);
});

prueba('registrarse con un correo que ya tiene cuenta: misma respuesta, otro correo y la contraseña no cambia', function () {
    cuenta();
    $r = espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => 'otra frase distinta y larga']), 202);
    $nueva = espera(api('POST', '/api/v1/registro', ['correo' => 'nueva@example.com', 'contrasena' => CLAVE]), 202);
    igual($nueva['crudo'], $r['crudo'], 'el cuerpo es idéntico');
    ultimo_correo('ana@example.com', 'ya_registrado');
    espera(entrar(), 200);
    espera(entrar('ana@example.com', 'otra frase distinta y larga'), 401, 'credenciales');
});

prueba('registrarse otra vez sin haber confirmado: gana el último y el enlace anterior deja de valer', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => 'la primera contraseña larga']), 202);
    $primero = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => 'la segunda contraseña larga']), 202);
    $segundo = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    verdad($primero !== $segundo, 'enlaces distintos');
    espera(api('POST', '/api/v1/confirmar', ['token' => $primero]), 400, 'enlace_invalido');
    espera(api('POST', '/api/v1/confirmar', ['token' => $segundo]), 200);
    espera(entrar('ana@example.com', 'la segunda contraseña larga'), 200);
    espera(entrar('ana@example.com', 'la primera contraseña larga'), 401, 'credenciales');
    igual(1, (int) Bd::uno('SELECT COUNT(*) AS n FROM usuarios')['n'], 'una sola cuenta');
});

prueba('enlace de confirmar atado a la contraseña: si cambia por otra vía, deja de valer', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    $token = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    Bd::ejecutar('UPDATE usuarios SET hash = ?', [password_hash('otra', PASSWORD_ARGON2ID)]);
    espera(api('POST', '/api/v1/confirmar', ['token' => $token]), 400, 'enlace_invalido');
});

prueba('correos no válidos', function () {
    foreach (['', 'sin-arroba', 'a@', '@b.com', 'a b@c.com', "a@b.com\nBcc: x@y.com", 'a@b..com', str_repeat('a', 250) . '@b.com', "a\u{202E}@b.com"] as $malo) {
        espera(api('POST', '/api/v1/registro', ['correo' => $malo, 'contrasena' => CLAVE]), 400, 'correo_invalido');
    }
    igual([], correos(), 'ningún correo enviado');
});

prueba('contraseñas: mínimo 8, máximo 128, ni comunes ni triviales; frases y Unicode sí', function () {
    $mal = [
        'corta12'            => 'contrasena_corta',
        str_repeat('x', 129) . 'yz' => 'contrasena_larga',
        'password1'          => 'contrasena_debil',
        'PASSWORD1'          => 'contrasena_debil',   // da igual mayúsculas
        'qwertyuiop'         => 'contrasena_debil',
        'aaaaaaaaaaaa'       => 'contrasena_debil',
        'abababababab'       => 'contrasena_debil',
        '        '           => 'contrasena_debil',
        'ana.garcia'         => 'contrasena_debil',   // igual que la parte de antes de la @
        'ana.garcia@example.com' => 'contrasena_debil',
    ];
    foreach ($mal as $contrasena => $error) {
        espera(api('POST', '/api/v1/registro', ['correo' => 'ana.garcia@example.com', 'contrasena' => (string) $contrasena]), 400, $error);
    }
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM usuarios')['n'], 'ninguna cuenta creada');
    $bien = ['mi gato se llama Bigotes', 'ñandú café 漢字 😀', 'Tr0mp3t@!', str_repeat('ab1', 42) . 'xy'];
    foreach ($bien as $i => $contrasena) {
        espera(api('POST', '/api/v1/registro', ['correo' => "bien{$i}@example.com", 'contrasena' => $contrasena]), 202);
    }
});

prueba('la contraseña se compara normalizada (é compuesta o descompuesta da igual)', function () {
    cuenta('ana@example.com', "caf\u{00E9} con leche y churros");
    espera(entrar('ana@example.com', "cafe\u{0301} con leche y churros"), 200);
});

prueba('el nombre se guarda limpio y como texto', function () {
    $c = cuenta('ana@example.com', CLAVE, "  <b>Ana</b>\u{202E}\u{200B}  la\tGrande  ");
    igual('<b>Ana</b> la Grande', $c['usuario']['nombre'], 'sin invisibles, espacios juntados, HTML tal cual (la app lo pinta como texto)');
    $c = cuenta('familia@example.com', CLAVE, "👨\u{200D}👩\u{200D}👧 Pérez");
    igual("👨\u{200D}👩\u{200D}👧 Pérez", $c['usuario']['nombre'], 'el que une emojis se respeta');
    espera(api('POST', '/api/v1/registro', ['correo' => 'largo@example.com', 'contrasena' => CLAVE, 'nombre' => str_repeat('n', 61)]), 400, 'datos_invalidos');
});

prueba('idioma desconocido: se guarda español', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE, 'idioma' => 'xx']), 202);
    igual('es', Bd::uno('SELECT idioma FROM usuarios')['idioma']);
    igual('Confirma tu cuenta de Paglot', ultimo_correo('ana@example.com')['asunto']);
});

prueba('reenviar la confirmación: solo a cuentas sin confirmar; respuesta siempre igual', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    $antes = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    $a = espera(api('POST', '/api/v1/confirmar/reenviar', ['correo' => 'ana@example.com']), 202);
    $nuevo = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    verdad($antes !== $nuevo, 'enlace nuevo');
    espera(api('POST', '/api/v1/confirmar', ['token' => $antes]), 400, 'enlace_invalido');   // solo vale el último
    espera(api('POST', '/api/v1/confirmar', ['token' => $nuevo]), 200);

    $n = count(correos());
    $b = espera(api('POST', '/api/v1/confirmar/reenviar', ['correo' => 'ana@example.com']), 202);   // ya confirmada
    $c = espera(api('POST', '/api/v1/confirmar/reenviar', ['correo' => 'nadie@example.com']), 202);
    igual($n, count(correos()), 'no se envía nada más');
    igual($a['crudo'], $b['crudo']);
    igual($a['crudo'], $c['crudo']);
});

prueba('dos registros a la vez con el mismo correo: una sola cuenta', function () {
    $rs = a_la_vez([
        ['POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE], null],
        ['POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE], null],
        ['POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE], null],
    ]);
    foreach ($rs as $r) espera($r, 202);
    igual(1, (int) Bd::uno('SELECT COUNT(*) AS n FROM usuarios')['n']);
});
