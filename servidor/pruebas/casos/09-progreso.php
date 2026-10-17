<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Progreso');

prueba('sin nada guardado: datos null y versión 0', function () {
    $c = cuenta();
    $r = espera(api('GET', '/api/v1/progreso/es', null, $c['token']), 200);
    igual(['datos' => null, 'version' => 0, 'actualizado' => null], $r['json']);
});

prueba('guardar y leer: llega exactamente lo mismo ({} sigue siendo {}, Unicode y decimales intactos)', function () {
    $c = cuenta();
    $d = progreso(2);
    $d->perfil->nombre = '日本語 😀 «Ana»';
    $d->cuaderno->{'hola-mundo'} = json_decode('{"es":"hola","t":1700000000000.5,"caja":0,"vacio":{}}');
    $d->actividad->{'2026-10-17'} = json_decode('{"ejercicios":3,"repasos":0,"t":1700000000001}');
    $r = espera(api('PUT', '/api/v1/progreso/es', ['datos' => $d, 'version' => 0], $c['token']), 200);
    igual(1, $r['json']['version']);
    $leido = espera(api('GET', '/api/v1/progreso/es', null, $c['token']), 200);
    igual(json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION), json_encode($leido['obj']->datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION), 'idéntico');
    verdad(str_contains($leido['crudo'], '"vacio":{}'), 'el objeto vacío no se convierte en []');
    igual(1, $leido['json']['version']);
});

prueba('cada curso por separado', function () {
    $c = cuenta();
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(3), 'version' => 0], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/ja', ['datos' => progreso(1), 'version' => 0], $c['token']), 200);
    igual(3, count((array) api('GET', '/api/v1/progreso/es', null, $c['token'])['obj']->datos->lecciones));
    igual(1, count((array) api('GET', '/api/v1/progreso/ja', null, $c['token'])['obj']->datos->lecciones));
    igual(null, api('GET', '/api/v1/progreso/fr', null, $c['token'])['json']['datos']);
});

prueba('curso que no existe: 404', function () {
    $c = cuenta();
    espera(api('GET', '/api/v1/progreso/xx', null, $c['token']), 404, 'curso');
    espera(api('PUT', '/api/v1/progreso/zz', ['datos' => progreso(), 'version' => 0], $c['token']), 404, 'curso');
    espera(api('GET', '/api/v1/progreso/ES', null, $c['token']), 404, 'no_encontrado');
    espera(api('GET', '/api/v1/progreso/es%27%20OR%201=1', null, $c['token']), 404, 'no_encontrado');
    espera(api('GET', '/api/v1/progreso/', null, $c['token']), 404, 'no_encontrado');
});

prueba('nadie ve ni toca el progreso de otro', function () {
    $ana = cuenta('ana@example.com');
    $luis = cuenta('luis@example.com');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(5), 'version' => 0], $ana['token']), 200);
    igual(null, espera(api('GET', '/api/v1/progreso/es', null, $luis['token']), 200)['json']['datos']);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1), 'version' => 0], $luis['token']), 200);
    igual(5, count((array) api('GET', '/api/v1/progreso/es', null, $ana['token'])['obj']->datos->lecciones), 'lo de Ana intacto');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1), 'version' => 1, 'usuario_id' => $ana['usuario']['id']], $luis['token']), 400, 'datos_invalidos');
});

prueba('versión vieja: 409 con lo que hay ahora, para juntarlo', function () {
    $c = cuenta();
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(2), 'version' => 0], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(3), 'version' => 1], $c['token']), 200);
    $r = espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(4), 'version' => 1], $c['token']), 409, 'conflicto');
    igual(2, $r['json']['version']);
    igual(3, count($r['json']['datos']['lecciones']), 'trae lo guardado');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(4), 'version' => 0], $c['token']), 409, 'conflicto');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(4), 'version' => 2], $c['token']), 200);
});

prueba('dos dispositivos guardando a la vez: uno gana y el otro recibe el conflicto (nadie pisa a nadie)', function () {
    $c = cuenta();
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(2), 'version' => 0], $c['token']), 200);
    $rs = a_la_vez([
        ['PUT', '/api/v1/progreso/es', ['datos' => progreso(3), 'version' => 1], $c['token']],
        ['PUT', '/api/v1/progreso/es', ['datos' => progreso(4), 'version' => 1], $c['token']],
        ['PUT', '/api/v1/progreso/es', ['datos' => progreso(5), 'version' => 1], $c['token']],
        ['PUT', '/api/v1/progreso/es', ['datos' => progreso(6), 'version' => 1], $c['token']],
    ]);
    $estados = array_map(fn ($r) => $r['estado'], $rs);
    sort($estados);
    igual([200, 409, 409, 409], $estados);
    igual(2, (int) Bd::uno('SELECT version FROM progreso')['version']);

    // Y estrenando un curso a la vez: tampoco se pisan.
    $rs = a_la_vez([
        ['PUT', '/api/v1/progreso/fr', ['datos' => progreso(1), 'version' => 0], $c['token']],
        ['PUT', '/api/v1/progreso/fr', ['datos' => progreso(2), 'version' => 0], $c['token']],
        ['PUT', '/api/v1/progreso/fr', ['datos' => progreso(3), 'version' => 0], $c['token']],
    ]);
    $estados = array_map(fn ($r) => $r['estado'], $rs);
    sort($estados);
    igual([200, 409, 409], $estados);
});

prueba('forma del progreso: lo que no encaja se rechaza', function () {
    $c = cuenta();
    $malos = [
        'versión 1'               => json_decode('{"version":1,"lecciones":{}}'),
        'sin versión'             => json_decode('{"lecciones":{}}'),
        'parte desconocida'       => json_decode('{"version":2,"admin":true}'),
        'lecciones como lista'    => json_decode('{"version":2,"lecciones":[]}'),
        'entrada que no es objeto' => json_decode('{"version":2,"lecciones":{"001":"terminada"}}'),
        't negativo'              => json_decode('{"version":2,"lecciones":{"001":{"t":-5}}}'),
        't de texto'              => json_decode('{"version":2,"cuaderno":{"a":{"t":"ayer"}}}'),
        'reiniciado de texto'     => json_decode('{"version":2,"reiniciado":"0"}'),
        'perfil que no es objeto' => json_decode('{"version":2,"perfil":"Ana"}'),
        'nombre que no es texto'  => json_decode('{"version":2,"perfil":{"nombre":5}}'),
        'clave enorme'            => json_decode('{"version":2,"lecciones":{"' . str_repeat('x', 300) . '":{"t":1}}}'),
        'datos lista'             => [],
        'datos texto'             => 'hola',
    ];
    foreach ($malos as $que => $datos) {
        $r = api('PUT', '/api/v1/progreso/es', ['datos' => $datos, 'version' => 0], $c['token']);
        verdad($r['estado'] === 400 && $r['json']['error'] === 'datos_invalidos', "{$que}: 400 datos_invalidos, llegó {$r['estado']} {$r['crudo']}");
    }
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(), 'version' => '0'], $c['token']), 400, 'datos_invalidos');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(), 'version' => -1], $c['token']), 400, 'datos_invalidos');
    espera(api('PUT', '/api/v1/progreso/es', ['version' => 0], $c['token']), 400, 'datos_invalidos');
    // «juego» (previsto) se acepta como objeto
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1, ['juego' => json_decode('{"leccion-1":{"paso":2,"hechos":[1,2]}}')]), 'version' => 0], $c['token']), 200);
    igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM progreso WHERE JSON_EXTRACT(datos, '$.admin') IS NOT NULL")['n']);
});

prueba('progreso demasiado grande: 413', function () {
    $c = cuenta();
    $d = progreso();
    for ($i = 0; $i < 9000; $i++) $d->cuaderno->{"p{$i}"} = json_decode('{"es":"' . str_repeat('a', 150) . '","t":1}');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => $d, 'version' => 0], $c['token']), 413, 'demasiado_grande');
});

prueba('una app con un fallo no puede vaciar la nube; un reinicio de verdad sí', function () {
    $c = cuenta();
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(20), 'version' => 0], $c['token']), 200);
    $r = espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(3), 'version' => 1], $c['token']), 409, 'retroceso');
    igual(20, $r['json']['tenia']);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(0), 'version' => 1], $c['token']), 409, 'retroceso');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(12), 'version' => 1], $c['token']), 200);   // más de la mitad: normal
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(0, ['reiniciado' => 1800000000000]), 'version' => 2], $c['token']), 200);
    // Con poco progreso no se aplica (empezar de cero es normal al principio)
    espera(api('PUT', '/api/v1/progreso/fr', ['datos' => progreso(5), 'version' => 0], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/fr', ['datos' => progreso(0), 'version' => 1], $c['token']), 200);
});

prueba('copia de lo anterior: como mucho una por hora y curso', function () {
    $c = cuenta();
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1), 'version' => 0], $c['token']), 200);
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM progreso_historial')['n'], 'lo primero no tiene anterior');
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(2), 'version' => 1], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(3), 'version' => 2], $c['token']), 200);
    $copias = Bd::todos('SELECT datos, version FROM progreso_historial');
    igual(1, count($copias), 'una copia en la primera hora');
    igual(1, (int) $copias[0]['version'], 'es la versión anterior');
    Bd::ejecutar('UPDATE progreso_historial SET guardado = ?', [hace(3700)]);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(4), 'version' => 3], $c['token']), 200);
    igual(2, (int) Bd::uno('SELECT COUNT(*) AS n FROM progreso_historial')['n'], 'otra tras una hora');
});

prueba('borrar el progreso de un curso: pide la contraseña y borra también sus copias', function () {
    $c = cuenta();
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1), 'version' => 0], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(2), 'version' => 1], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/fr', ['datos' => progreso(1), 'version' => 0], $c['token']), 200);
    espera(api('DELETE', '/api/v1/progreso/es', ['contrasena' => 'no es'], $c['token']), 403, 'contrasena_incorrecta');
    espera(api('DELETE', '/api/v1/progreso/es', ['contrasena' => CLAVE], $c['token']), 200);
    igual(null, api('GET', '/api/v1/progreso/es', null, $c['token'])['json']['datos']);
    igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM progreso_historial WHERE curso = 'es'")['n']);
    verdad(api('GET', '/api/v1/progreso/fr', null, $c['token'])['json']['datos'] !== null, 'el otro curso sigue');
});

prueba('como mucho 30 guardados por minuto y curso', function () {
    $c = cuenta();
    $v = 0;
    for ($i = 1; $i <= 30; $i++) {
        $v = espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1), 'version' => $v], $c['token']), 200)['json']['version'];
    }
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1), 'version' => $v], $c['token']), 429, 'demasiados');
    espera(api('PUT', '/api/v1/progreso/fr', ['datos' => progreso(1), 'version' => 0], $c['token']), 200);   // otro curso, aparte
});
