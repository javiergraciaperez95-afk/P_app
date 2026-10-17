<?php
// Limpieza nocturna (cron, p. ej. a las 3:30): borra lo caducado para que las tablas no crezcan sin fin
// (plan de seguridad, entradas 58, 72, 134, 174). Usa el usuario de las tareas, no el de la API.
//
//   php tareas/limpieza.php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/src/arranque.php';

use Paglot\Bd;
use Paglot\Tiempo;

Bd::conectar(true);

$pasos = [
    'sesiones caducadas'          => ['DELETE FROM sesiones WHERE caduca < ?', [Tiempo::bd()]],
    'códigos caducados'           => ['DELETE FROM codigos WHERE caduca < ?', [Tiempo::bd()]],
    'enlaces caducados o usados'  => ['DELETE FROM tokens WHERE caduca < ? OR usado < ?', [Tiempo::bd(-86400), Tiempo::bd(-86400)]],
    'límites viejos'              => ['DELETE FROM limites WHERE inicio < ? AND (bloqueado_hasta IS NULL OR bloqueado_hasta < ?)', [Tiempo::bd(-2 * 86400), Tiempo::bd()]],
    'copias de progreso (14 días)' => ['DELETE FROM progreso_historial WHERE guardado < ?', [Tiempo::bd(-14 * 86400)]],
    'eventos (90 días)'           => ['DELETE FROM eventos WHERE fecha < ?', [Tiempo::bd(-90 * 86400)]],
    'cuentas sin confirmar (7 días)' => ['DELETE FROM usuarios WHERE confirmado IS NULL AND creado < ?', [Tiempo::bd(-7 * 86400)]],
    'correos pendientes (24 h)'   => ['DELETE FROM correos_pendientes WHERE creado < ?', [Tiempo::bd(-86400)]],
];

$total = 0;
foreach ($pasos as $nombre => [$sql, $parametros]) {
    $n = Bd::ejecutar($sql, $parametros);
    $total += $n;
    printf("%-32s %d\n", $nombre, $n);
}
printf("Limpieza terminada: %d filas borradas.\n", $total);
