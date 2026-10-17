<?php
declare(strict_types=1);

grupo('HTTP, cabeceras y CORS');

prueba('salud responde y comprueba la base de datos', function () {
    $r = espera(api('GET', '/api/v1/salud'), 200);
    igual(true, $r['json']['ok']);
    igual(1, $r['json']['api']);
    verdad((bool) preg_match('/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/', $r['json']['hora']), 'hora en ISO 8601 UTC');
});

prueba('toda respuesta lleva las cabeceras de seguridad y no dice qué PHP es', function () {
    foreach ([api('GET', '/api/v1/salud'), api('GET', '/api/v1/no-existe'), api('POST', '/api/v1/entrar', '{roto')] as $r) {
        igual('no-store', $r['cab']['cache-control'] ?? null, 'Cache-Control');
        igual('nosniff', $r['cab']['x-content-type-options'] ?? null, 'nosniff');
        igual("default-src 'none'; frame-ancestors 'none'", $r['cab']['content-security-policy'] ?? null, 'CSP');
        igual('DENY', $r['cab']['x-frame-options'] ?? null, 'X-Frame-Options');
        igual('no-referrer', $r['cab']['referrer-policy'] ?? null, 'Referrer-Policy');
        verdad(!isset($r['cab']['x-powered-by']), 'sin X-Powered-By');
        igual('application/json; charset=utf-8', $r['cab']['content-type'] ?? null, 'Content-Type');
    }
});

prueba('rutas desconocidas: 404; fuera de /api/v1: 404', function () {
    espera(api('GET', '/api/v1/nada'), 404, 'no_encontrado');
    espera(api('GET', '/'), 404, 'no_encontrado');
    espera(api('GET', '/api/v2/salud'), 404, 'no_encontrado');
    espera(api('GET', '/api/v1/salud/../yo'), 404, 'no_encontrado');
    espera(api('GET', '/config.php'), 404, 'no_encontrado');
    espera(api('GET', '/../config.php'), 404, 'no_encontrado');
});

prueba('método equivocado: 405 con Allow', function () {
    $r = espera(api('DELETE', '/api/v1/salud'), 405, 'metodo');
    igual('GET', $r['cab']['allow'] ?? null);
    $r = espera(api('GET', '/api/v1/entrar'), 405, 'metodo');
    igual('POST', $r['cab']['allow'] ?? null);
});

prueba('CORS: el origen de la app recibe permiso exacto, nunca «*»', function () {
    $r = espera(api('OPTIONS', '/api/v1/entrar', null, null, [
        'Origin' => 'http://localhost:8100',
        'Access-Control-Request-Method' => 'POST',
        'Access-Control-Request-Headers' => 'content-type, authorization',
    ]), 204);
    igual('http://localhost:8100', $r['cab']['access-control-allow-origin'] ?? null);
    igual('Origin', $r['cab']['vary'] ?? null);
    verdad(str_contains($r['cab']['access-control-allow-headers'] ?? '', 'Authorization'), 'deja mandar Authorization');
    verdad(str_contains($r['cab']['access-control-allow-methods'] ?? '', 'PUT'), 'deja PUT');
    verdad(!isset($r['cab']['access-control-allow-credentials']), 'sin credenciales (no hay cookies)');

    $r = espera(api('GET', '/api/v1/salud', null, null, ['Origin' => 'http://localhost:8100']), 200);
    igual('http://localhost:8100', $r['cab']['access-control-allow-origin'] ?? null);
});

prueba('CORS: otra web se rechaza antes de hacer nada', function () {
    foreach (['https://malvada.example', 'http://localhost:8100.malvada.example', 'null', 'http://localhost:8101'] as $origen) {
        $r = espera(api('OPTIONS', '/api/v1/entrar', null, null, ['Origin' => $origen, 'Access-Control-Request-Method' => 'POST']), 403, 'origen');
        verdad(!isset($r['cab']['access-control-allow-origin']), "sin permiso para {$origen}");
    }
    // Ni siquiera llega a registrar a nadie.
    espera(api('POST', '/api/v1/registro', ['correo' => 'x@example.com', 'contrasena' => CLAVE], null, ['Origin' => 'https://malvada.example']), 403, 'origen');
    igual([], correos('x@example.com'), 'ningún correo enviado');
});

prueba('el cuerpo tiene que ser JSON (si no, 415) y un objeto', function () {
    espera(api('POST', '/api/v1/entrar', 'correo=a@b.c', null, ['Content-Type' => 'application/x-www-form-urlencoded']), 415, 'tipo_contenido');
    espera(api('POST', '/api/v1/entrar', '{"correo":"a@b.c"}', null, ['Content-Type' => 'text/plain']), 415, 'tipo_contenido');
    espera(api('POST', '/api/v1/entrar', '{roto'), 400, 'json_invalido');
    espera(api('POST', '/api/v1/entrar', '["a","b"]'), 400, 'json_invalido');
    espera(api('POST', '/api/v1/entrar', '"texto"'), 400, 'json_invalido');
    espera(api('POST', '/api/v1/entrar', str_repeat('[', 100) . str_repeat(']', 100)), 400, 'json_invalido');
    // application/json con charset también vale
    espera(api('POST', '/api/v1/entrar', '{"correo":"nadie@example.com","contrasena":"x"}', null, ['Content-Type' => 'application/json; charset=utf-8']), 401, 'credenciales');
});

prueba('cuerpos demasiado grandes: 413', function () {
    $r = api('POST', '/api/v1/entrar', '{"correo":"' . str_repeat('a', 2_100_000) . '"}');
    verdad(in_array($r['estado'], [413], true), 'estado 413, llegó ' . $r['estado']);
});

prueba('campos de más o del tipo equivocado: 400 datos_invalidos', function () {
    $r = espera(api('POST', '/api/v1/entrar', ['correo' => 'a@example.com', 'contrasena' => 'x', 'admin' => true]), 400, 'datos_invalidos');
    igual('admin', $r['json']['campo']);
    igual('sobra', $r['json']['motivo']);
    $r = espera(api('POST', '/api/v1/entrar', ['correo' => ['a@example.com'], 'contrasena' => 'x']), 400, 'datos_invalidos');
    igual('tipo', $r['json']['motivo']);
    $r = espera(api('POST', '/api/v1/entrar', ['correo' => 'a@example.com']), 400, 'datos_invalidos');
    igual('falta', $r['json']['motivo']);
});

prueba('el token nunca se acepta en la URL', function () {
    $c = cuenta();
    espera(api('GET', '/api/v1/yo?token=' . $c['token']), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo?access_token=' . $c['token']), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);
});
