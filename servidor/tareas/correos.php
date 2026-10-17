<?php
// Reintenta los correos que no salieron a la primera (cron, cada 5 minutos).
//
//   php tareas/correos.php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/src/arranque.php';

Paglot\Bd::conectar(true);
printf("Correos reenviados: %d\n", Paglot\Correo::reintentarPendientes());
