<?php
// Pone el correo y la contraseña de la cuenta de desarrollador (número 78910021, todo desbloqueado, protegida).
//   php api/herramientas/cuenta-dev.php tu@correo.com "una contraseña larga"
// Solo se puede usar desde la consola del servidor (no desde la web: el .htaccess lo impide y aquí se comprueba).
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../inc/base.php';
[$_, $correo, $clave] = $argv + [null, '', ''];
if (!correo_valido((string) $correo) || mb_strlen((string) $clave) < 12) {
    fwrite(STDERR, "Uso: php api/herramientas/cuenta-dev.php correo contraseña (12 caracteres como mínimo)\n");
    exit(1);
}
sql('UPDATE usuarios SET correo = ?, clave = ?, verificado = 1 WHERE id = 78910021', [mb_strtolower($correo), password_hash($clave, PASSWORD_DEFAULT)]);
echo "Cuenta 78910021 lista: $correo\n";
