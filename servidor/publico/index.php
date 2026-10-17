<?php
// La única puerta de entrada de la API. Es el único archivo de la carpeta pública:
// el código, la configuración y los registros están fuera, donde Nginx no los sirve.
declare(strict_types=1);

try {
    require dirname(__DIR__) . '/src/arranque.php';
} catch (\Throwable $e) {
    // Sin configuración no se puede ni registrar bien: respuesta mínima y nada más.
    error_log('Paglot no arranca: ' . $e->getMessage());
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo '{"error":"mantenimiento"}';
    return;
}

$respuesta = Paglot\Api::atender(Paglot\Peticion::actual());
$respuesta->enviar();

// Los correos se envían después de responder: con PHP-FPM la respuesta ya ha salido y nadie espera.
if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
try {
    Paglot\Correo::despachar();
} catch (\Throwable $e) {
    error_log('Fallo al despachar correos: ' . $e->getMessage());
}
