<?php
declare(strict_types=1);

use Paglot\Api;
use Paglot\Bd;
use Paglot\Config;
use Paglot\Peticion;

grupo('Límites por IP y errores internos');

prueba('peticiones sin sesión: como mucho 120 por minuto y por IP', function () {
    for ($i = 1; $i <= 120; $i++) {
        $r = api('GET', '/api/v1/salud');
        if ($r['estado'] !== 200) falla("La petición {$i} ya ha sido rechazada ({$r['estado']})");
    }
    $r = espera(api('GET', '/api/v1/salud'), 429, 'demasiados');
    verdad((int) ($r['cab']['retry-after'] ?? 0) > 0, 'dice cuánto esperar');
});

prueba('probar tokens al azar también cuenta en el límite por IP', function () {
    for ($i = 1; $i <= 120; $i++) api('GET', '/api/v1/yo', null, rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '='));
    espera(api('GET', '/api/v1/yo', null, str_repeat('B', 43)), 429, 'demasiados');
});

prueba('con sesión se cuenta por persona, no por IP (una clase entera no se bloquea)', function () {
    $c = cuenta();
    for ($i = 1; $i <= 130; $i++) api('GET', '/api/v1/salud');   // la IP ya está «llena»…
    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);       // …pero con sesión se sigue pudiendo
});

prueba('error inesperado: 500 «interno» sin detalles, y queda apuntado sin la contraseña', function () {
    $registro = (string) Config::get('registro_errores');
    @unlink($registro);
    con_config(['bd' => ['dsn' => 'mysql:host=127.0.0.1;port=1;dbname=nada;charset=utf8mb4']], function () use ($registro) {
        $p = new Peticion(
            ['REQUEST_METHOD' => 'POST', 'REQUEST_URI' => '/api/v1/entrar', 'REMOTE_ADDR' => '127.0.0.1', 'CONTENT_TYPE' => 'application/json'],
            '{"correo":"ana@example.com","contrasena":"mi-secreto-que-no-debe-salir"}',
        );
        $r = Api::atender($p);
        igual(500, $r->estado);
        igual('{"error":"interno"}', $r->texto());
        $texto = (string) @file_get_contents($registro);
        verdad(str_contains($texto, 'POST /api/v1/entrar'), 'apuntado en el registro de errores');
        verdad(!str_contains($texto, 'mi-secreto-que-no-debe-salir'), 'la contraseña no aparece en el registro');

        $salud = Api::atender(new Peticion(['REQUEST_METHOD' => 'GET', 'REQUEST_URI' => '/api/v1/salud', 'REMOTE_ADDR' => '127.0.0.1']));
        igual(503, $salud->estado, 'salud avisa de que la base no responde');
    });
});

prueba('el registro de errores nunca lleva los argumentos (contraseñas), aunque PHP esté mal configurado', function () {
    $registro = (string) Config::get('registro_errores');
    @unlink($registro);
    $antes = ini_get('zend.exception_ignore_args');
    ini_set('zend.exception_ignore_args', '0');   // como si en el servidor se hubiera olvidado ese ajuste
    try {
        // Un fallo dentro de una función que recibe una contraseña (como Contrasenas::huella()).
        $falla = static function (string $contrasena): never { throw new RuntimeException('fallo de prueba'); };
        try {
            $falla('SECRETO123');
        } catch (RuntimeException $e) {
            $p = new Peticion(['REQUEST_METHOD' => 'POST', 'REQUEST_URI' => '/api/v1/entrar', 'REMOTE_ADDR' => '127.0.0.1']);
            (new ReflectionMethod(Api::class, 'apuntarError'))->invoke(null, $e, $p);
        }
        $texto = (string) @file_get_contents($registro);
        verdad(str_contains($texto, 'fallo de prueba') && str_contains($texto, '#0 '), 'el error y su traza están');
        verdad(!str_contains($texto, 'SECRETO123'), 'sin los argumentos de las llamadas');
    } finally {
        ini_set('zend.exception_ignore_args', (string) $antes);
    }
});

prueba('IP detrás de un proxy: solo se cree la cabecera si viene de un proxy de confianza', function () {
    $sinProxy = new Peticion(['REMOTE_ADDR' => '203.0.113.9', 'HTTP_X_FORWARDED_FOR' => '1.2.3.4']);
    igual('203.0.113.9', $sinProxy->ip, 'sin proxy configurado, la cabecera se ignora');
    con_config(['proxys' => ['10.0.0.2']], function () {
        igual('1.2.3.4', (new Peticion(['REMOTE_ADDR' => '10.0.0.2', 'HTTP_X_FORWARDED_FOR' => '9.9.9.9, 1.2.3.4']))->ip, 'la última que no es del proxy');
        igual('198.51.100.7', (new Peticion(['REMOTE_ADDR' => '198.51.100.7', 'HTTP_X_FORWARDED_FOR' => '1.2.3.4']))->ip, 'de quien no es proxy, no se cree');
        igual('10.0.0.2', (new Peticion(['REMOTE_ADDR' => '10.0.0.2', 'HTTP_X_FORWARDED_FOR' => 'basura']))->ip, 'cabecera rota: la del proxy');
    });
});
