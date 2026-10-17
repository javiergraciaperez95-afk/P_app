<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Recuperar la contraseña');

prueba('pedir el enlace: misma respuesta exista o no la cuenta; solo llega correo si existe', function () {
    cuenta();
    $si = espera(api('POST', '/api/v1/recuperar', ['correo' => 'ANA@example.com']), 202);
    $no = espera(api('POST', '/api/v1/recuperar', ['correo' => 'nadie@example.com']), 202);
    igual($si['crudo'], $no['crudo']);
    $correo = ultimo_correo('ana@example.com', 'recuperar');
    verdad(str_contains($correo['texto'], '60 minutos'), 'dice cuánto dura');
    igual([], correos('nadie@example.com'));
});

prueba('poner la contraseña nueva: entra y cierra TODAS las sesiones anteriores', function () {
    $c = cuenta();
    $otra = espera(entrar(), 200)['json']['token'];
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    $token = token_de(ultimo_correo('ana@example.com', 'recuperar'));
    $r = espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $token, 'contrasena' => 'la contraseña recuperada'], null), 200);
    espera(api('GET', '/api/v1/yo', null, $r['json']['token']), 200);
    espera(api('GET', '/api/v1/yo', null, $c['token']), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, $otra), 401, 'sin_sesion');
    espera(entrar('ana@example.com', 'la contraseña recuperada'), 200);
    espera(entrar(), 401, 'credenciales');
    ultimo_correo('ana@example.com', 'contrasena_cambiada');
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $token, 'contrasena' => 'otra contraseña más']), 400, 'enlace_invalido');
});

prueba('una contraseña débil no gasta el enlace', function () {
    cuenta();
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    $token = token_de(ultimo_correo('ana@example.com', 'recuperar'));
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $token, 'contrasena' => 'corta']), 400, 'contrasena_corta');
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $token, 'contrasena' => 'password1']), 400, 'contrasena_debil');
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $token, 'contrasena' => 'ahora sí una buena']), 200);
});

prueba('el enlace caduca a la hora y solo vale el último', function () {
    cuenta();
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    $primero = token_de(ultimo_correo('ana@example.com', 'recuperar'));
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    $segundo = token_de(ultimo_correo('ana@example.com', 'recuperar'));
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $primero, 'contrasena' => 'ahora sí una buena']), 400, 'enlace_invalido');
    Bd::ejecutar('UPDATE tokens SET caduca = ?', [hace(1)]);
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $segundo, 'contrasena' => 'ahora sí una buena']), 400, 'enlace_invalido');
});

prueba('un enlace de confirmar no sirve para recuperar (ni al revés)', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    $confirmar = token_de(ultimo_correo('ana@example.com', 'confirmar'));
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => $confirmar, 'contrasena' => 'ahora sí una buena']), 400, 'enlace_invalido');
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    $recuperar = token_de(ultimo_correo('ana@example.com', 'recuperar'));
    espera(api('POST', '/api/v1/confirmar', ['token' => $recuperar]), 400, 'enlace_invalido');
});

prueba('recuperar una cuenta sin confirmar la deja confirmada', function () {
    espera(api('POST', '/api/v1/registro', ['correo' => 'ana@example.com', 'contrasena' => CLAVE]), 202);
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => token_de(ultimo_correo('ana@example.com', 'recuperar')), 'contrasena' => 'ahora sí una buena']), 200);
    verdad(Bd::uno('SELECT confirmado FROM usuarios')['confirmado'] !== null, 'confirmada');
    espera(entrar('ana@example.com', 'ahora sí una buena'), 200);
});

prueba('recuperar quita la espera por contraseñas fallidas', function () {
    cuenta();
    for ($i = 1; $i <= 7; $i++) entrar('ana@example.com', "fallo {$i}");
    espera(entrar(), 429, 'demasiados');
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    espera(api('POST', '/api/v1/recuperar/nueva', ['token' => token_de(ultimo_correo('ana@example.com', 'recuperar')), 'contrasena' => 'ahora sí una buena']), 200);
    espera(entrar('ana@example.com', 'ahora sí una buena'), 200);
});

prueba('como mucho 3 correos por dirección y hora (nadie puede bombardear a otro)', function () {
    cuenta();   // ya manda 1 (confirmar)
    for ($i = 0; $i < 6; $i++) espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    igual(3, count(correos('ana@example.com')), 'confirmar + 2 de recuperar, y ya');
});
