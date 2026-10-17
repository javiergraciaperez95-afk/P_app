<?php
// Un «Resend» de mentira para las pruebas: apunta cada petición en un archivo y responde lo que se le diga.
// Lo arranca pruebas/ejecutar.php con «php -S 127.0.0.1:8182 falso-resend.php».
declare(strict_types=1);

$carpeta = getenv('FALSO_RESEND_DIR') ?: sys_get_temp_dir();
$modo = @file_get_contents($carpeta . '/modo.txt') ?: 'ok';

file_put_contents($carpeta . '/peticiones.jsonl', json_encode([
    'metodo'        => $_SERVER['REQUEST_METHOD'] ?? '',
    'ruta'          => $_SERVER['REQUEST_URI'] ?? '',
    'autorizacion'  => $_SERVER['HTTP_AUTHORIZATION'] ?? '',
    'tipo'          => $_SERVER['CONTENT_TYPE'] ?? '',
    'cuerpo'        => file_get_contents('php://input'),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX);

header('Content-Type: application/json');
if ($modo === 'fallo') {
    http_response_code(500);
    echo '{"message":"fallo de prueba"}';
} else {
    echo '{"id":"falso-123"}';
}
