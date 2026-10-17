<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Perfil, contraseña y borrar la cuenta');

prueba('cambiar nombre e idioma', function () {
    $c = cuenta();
    $r = espera(api('PATCH', '/api/v1/yo', ['nombre' => '  Ana   María ', 'idioma' => 'fr'], $c['token']), 200);
    igual('Ana María', $r['json']['usuario']['nombre']);
    igual('fr', $r['json']['usuario']['idioma']);
    espera(api('PATCH', '/api/v1/yo', ['idioma' => 'xx'], $c['token']), 400, 'datos_invalidos');
    espera(api('PATCH', '/api/v1/yo', new stdClass(), $c['token']), 400, 'datos_invalidos');
    espera(api('PATCH', '/api/v1/yo', ['correo' => 'otro@example.com'], $c['token']), 400, 'datos_invalidos');   // el correo no se cambia así
    espera(api('PATCH', '/api/v1/yo', ['nombre' => 42], $c['token']), 400, 'datos_invalidos');
    igual('ana@example.com', Bd::uno('SELECT correo FROM usuarios')['correo']);
});

prueba('cambiar la contraseña: pide la actual y cierra las demás sesiones', function () {
    $c = cuenta();
    $otra = espera(entrar(), 200)['json']['token'];
    espera(api('POST', '/api/v1/yo/contrasena', ['actual' => 'no es la actual', 'nueva' => 'mi contraseña nueva y larga'], $c['token']), 403, 'contrasena_incorrecta');
    espera(api('POST', '/api/v1/yo/contrasena', ['actual' => CLAVE, 'nueva' => CLAVE], $c['token']), 400, 'contrasena_igual');
    espera(api('POST', '/api/v1/yo/contrasena', ['actual' => CLAVE, 'nueva' => 'password1'], $c['token']), 400, 'contrasena_debil');
    espera(api('POST', '/api/v1/yo/contrasena', ['actual' => CLAVE, 'nueva' => 'mi contraseña nueva y larga'], $c['token']), 200);

    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);        // esta sigue
    espera(api('GET', '/api/v1/yo', null, $otra), 401, 'sin_sesion'); // las demás, fuera
    espera(entrar(), 401, 'credenciales');
    espera(entrar('ana@example.com', 'mi contraseña nueva y larga'), 200);
    ultimo_correo('ana@example.com', 'contrasena_cambiada');
});

prueba('probar la contraseña actual tiene límite (403 no cierra la sesión)', function () {
    $c = cuenta();
    for ($i = 1; $i <= 6; $i++) {
        espera(api('POST', '/api/v1/yo/contrasena', ['actual' => "intento {$i}", 'nueva' => 'mi contraseña nueva y larga'], $c['token']), 403, 'contrasena_incorrecta');
    }
    espera(api('POST', '/api/v1/yo/contrasena', ['actual' => CLAVE, 'nueva' => 'mi contraseña nueva y larga'], $c['token']), 429, 'demasiados');
    espera(api('DELETE', '/api/v1/yo', ['contrasena' => CLAVE], $c['token']), 429, 'demasiados');
    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);   // la sesión sigue viva
});

prueba('borrar la cuenta: pide la contraseña y se lleva todo lo suyo', function () {
    $c = cuenta();
    $luis = cuenta('luis@example.com');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(3), 'version' => 0], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(2), 'version' => 0], $luis['token']), 200);
    espera(api('DELETE', '/api/v1/yo', ['contrasena' => 'no es'], $c['token']), 403, 'contrasena_incorrecta');
    espera(api('DELETE', '/api/v1/yo', null, $c['token']), 400, 'datos_invalidos');
    espera(api('DELETE', '/api/v1/yo', ['contrasena' => CLAVE], $c['token']), 200);

    $id = $c['usuario']['id'];
    foreach (['usuarios' => 'id', 'sesiones' => 'usuario_id', 'tokens' => 'usuario_id', 'progreso' => 'usuario_id', 'progreso_historial' => 'usuario_id'] as $tabla => $col) {
        igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM {$tabla} WHERE {$col} = ?", [$id])['n'], "nada en {$tabla}");
    }
    igual(1, (int) Bd::uno("SELECT COUNT(*) AS n FROM eventos WHERE tipo = 'cuenta_borrada' AND usuario_id = ?", [$id])['n'], 'el aviso queda');
    espera(api('GET', '/api/v1/yo', null, $c['token']), 401, 'sin_sesion');
    ultimo_correo('ana@example.com', 'cuenta_borrada');
    espera(api('GET', '/api/v1/progreso/es', null, $luis['token']), 200);   // lo de los demás, intacto
    igual(2, count((array) api('GET', '/api/v1/progreso/es', null, $luis['token'])['obj']->datos->lecciones));
    // Se puede volver a registrar con el mismo correo.
    cuenta();
});

prueba('descargar mis datos: todo lo mío y nada interno', function () {
    $c = cuenta();
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(2), 'version' => 0], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/fr', ['datos' => progreso(1), 'version' => 0], $c['token']), 200);
    $r = espera(api('GET', '/api/v1/yo/exportar', null, $c['token']), 200);
    igual('ana@example.com', $r['json']['usuario']['correo']);
    igual(['es', 'fr'], array_keys($r['json']['progreso']));
    igual(1, count($r['json']['sesiones']));
    foreach (['hash', 'token_hash', '$argon2id'] as $interno) verdad(!str_contains($r['crudo'], $interno), "sin {$interno}");
});
