<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Cambiar el correo');

prueba('cambiar el correo: enlace al nuevo, aviso al antiguo, y no cambia hasta confirmar', function () {
    $c = cuenta('ana.garcia@example.com');
    espera(api('POST', '/api/v1/yo/correo', ['contrasena' => CLAVE, 'nuevo' => 'Ana.Nueva@Example.com'], $c['token']), 202);
    igual('ana.garcia@example.com', Bd::uno('SELECT correo FROM usuarios')['correo'], 'todavía no ha cambiado');
    $aviso = ultimo_correo('ana.garcia@example.com', 'correo_aviso');
    verdad(str_contains($aviso['texto'], 'a***@example.com') && !str_contains($aviso['texto'], 'ana.nueva'), 'el aviso no enseña la dirección entera');

    $token = token_de(ultimo_correo('ana.nueva@example.com', 'correo_nuevo'));
    $r = espera(api('POST', '/api/v1/yo/correo/confirmar', ['token' => $token]), 200);
    igual('ana.nueva@example.com', $r['json']['usuario']['correo']);
    ultimo_correo('ana.garcia@example.com', 'correo_cambiado');
    espera(entrar('ana.nueva@example.com'), 200);
    espera(entrar('ana.garcia@example.com'), 401, 'credenciales');
    espera(api('POST', '/api/v1/yo/correo/confirmar', ['token' => $token]), 400, 'enlace_invalido');
});

prueba('pide la contraseña; mismo correo no; correo ya usado: misma respuesta y no se envía nada', function () {
    $c = cuenta('ana@example.com');
    cuenta('luis@example.com');
    espera(api('POST', '/api/v1/yo/correo', ['contrasena' => 'no es', 'nuevo' => 'otro@example.com'], $c['token']), 403, 'contrasena_incorrecta');
    espera(api('POST', '/api/v1/yo/correo', ['contrasena' => CLAVE, 'nuevo' => 'ANA@example.com'], $c['token']), 400, 'correo_igual');
    espera(api('POST', '/api/v1/yo/correo', ['contrasena' => CLAVE, 'nuevo' => 'no-vale'], $c['token']), 400, 'correo_invalido');
    $antes = count(correos('luis@example.com'));
    $ocupado = espera(api('POST', '/api/v1/yo/correo', ['contrasena' => CLAVE, 'nuevo' => 'luis@example.com'], $c['token']), 202);
    $libre = espera(api('POST', '/api/v1/yo/correo', ['contrasena' => CLAVE, 'nuevo' => 'libre@example.com'], $c['token']), 202);
    igual($ocupado['crudo'], $libre['crudo']);
    igual($antes, count(correos('luis@example.com')), 'a Luis no le llega nada');
});

prueba('si el correo nuevo se ocupa entre medias: 409 y nada cambia', function () {
    $c = cuenta('ana@example.com');
    espera(api('POST', '/api/v1/yo/correo', ['contrasena' => CLAVE, 'nuevo' => 'nuevo@example.com'], $c['token']), 202);
    $token = token_de(ultimo_correo('nuevo@example.com', 'correo_nuevo'));
    cuenta('nuevo@example.com');
    espera(api('POST', '/api/v1/yo/correo/confirmar', ['token' => $token]), 409, 'correo_en_uso');
    igual(1, (int) Bd::uno("SELECT COUNT(*) AS n FROM usuarios WHERE correo = 'ana@example.com'")['n']);
});
