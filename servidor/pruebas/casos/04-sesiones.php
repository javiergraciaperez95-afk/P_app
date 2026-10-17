<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Sesiones');

prueba('sin token, token falso o mal escrito: 401', function () {
    cuenta();
    espera(api('GET', '/api/v1/yo'), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, str_repeat('A', 43)), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, null, ['Authorization' => 'Basic YW5hOmNsYXZl']), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, null, ['Authorization' => 'Bearer']), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, null, ['Authorization' => 'Bearer ' . str_repeat('A', 44)]), 401, 'sin_sesion');
});

prueba('sesión caducada: 401', function () {
    $c = cuenta();
    Bd::ejecutar('UPDATE sesiones SET caduca = ?', [hace(1)]);
    espera(api('GET', '/api/v1/yo', null, $c['token']), 401, 'sin_sesion');
});

prueba('tope de 180 días aunque se use todos los días', function () {
    $c = cuenta();
    Bd::ejecutar('UPDATE sesiones SET creada = ?, caduca = ?', [hace(181 * 86400), \Paglot\Tiempo::bd(86400)]);
    espera(api('GET', '/api/v1/yo', null, $c['token']), 401, 'sin_sesion');
});

prueba('la sesión se alarga con el uso (como mucho una vez por hora) sin pasar del tope', function () {
    $c = cuenta();
    Bd::ejecutar('UPDATE sesiones SET usada = ?, caduca = ?', [hace(7200), \Paglot\Tiempo::bd(3600)]);
    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);
    $faltan = \Paglot\Tiempo::faltan(Bd::uno('SELECT caduca FROM sesiones')['caduca']);
    verdad($faltan > 29 * 86400, 'alargada a 30 días');

    // Cerca del tope de 180 días, se alarga solo hasta el tope.
    Bd::ejecutar('UPDATE sesiones SET creada = ?, usada = ?, caduca = ?', [hace(179 * 86400), hace(7200), \Paglot\Tiempo::bd(3600)]);
    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);
    $faltan = \Paglot\Tiempo::faltan(Bd::uno('SELECT caduca FROM sesiones')['caduca']);
    verdad($faltan <= 86400 + 5 && $faltan > 86000, "solo hasta el tope (faltan {$faltan} s)");

    // Usada hace poco: no se reescribe.
    $antes = Bd::uno('SELECT usada FROM sesiones')['usada'];
    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);
    igual($antes, Bd::uno('SELECT usada FROM sesiones')['usada'], 'sin escrituras de más');
});

prueba('salir: ese token deja de valer, los demás no', function () {
    $c = cuenta();
    $otro = espera(entrar(), 200)['json']['token'];
    espera(api('POST', '/api/v1/salir', null, $c['token']), 200);
    espera(api('GET', '/api/v1/yo', null, $c['token']), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, $otro), 200);
});

prueba('salir en todos los dispositivos', function () {
    $c = cuenta();
    $otro = espera(entrar(), 200)['json']['token'];
    espera(api('POST', '/api/v1/salir/todas', null, $c['token']), 200);
    espera(api('GET', '/api/v1/yo', null, $c['token']), 401, 'sin_sesion');
    espera(api('GET', '/api/v1/yo', null, $otro), 401, 'sin_sesion');
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM sesiones')['n']);
});

prueba('lista de sesiones y cerrar una concreta', function () {
    $c = cuenta();
    $otro = api('POST', '/api/v1/entrar', ['correo' => 'ana@example.com', 'contrasena' => CLAVE], null, [
        'User-Agent' => 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',
    ])['json']['token'];
    $lista = espera(api('GET', '/api/v1/sesiones', null, $c['token']), 200)['json']['sesiones'];
    igual(2, count($lista));
    $actual = array_values(array_filter($lista, fn ($s) => $s['actual']));
    igual(1, count($actual), 'una es la actual');
    $ajena = array_values(array_filter($lista, fn ($s) => !$s['actual']))[0];
    igual('App Paglot · Android', $ajena['dispositivo']);
    verdad(!array_key_exists('ip', $ajena) && !array_key_exists('token_hash', $ajena), 'sin datos internos');

    espera(api('DELETE', '/api/v1/sesiones/' . $ajena['id'], null, $c['token']), 200);
    espera(api('GET', '/api/v1/yo', null, $otro), 401, 'sin_sesion');
    espera(api('DELETE', '/api/v1/sesiones/' . $ajena['id'], null, $c['token']), 404, 'no_encontrado');
});

prueba('no se pueden cerrar sesiones de otra cuenta', function () {
    $ana = cuenta('ana@example.com');
    $luis = cuenta('luis@example.com');
    $idLuis = Bd::uno('SELECT s.id FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE u.correo = ?', ['luis@example.com'])['id'];
    espera(api('DELETE', '/api/v1/sesiones/' . $idLuis, null, $ana['token']), 404, 'no_encontrado');
    espera(api('GET', '/api/v1/yo', null, $luis['token']), 200);
});

prueba('borrar la cuenta desde otro lado invalida la sesión al momento', function () {
    $c = cuenta();
    Bd::ejecutar('DELETE FROM usuarios');
    espera(api('GET', '/api/v1/yo', null, $c['token']), 401, 'sin_sesion');
});
