<?php
// Lo primero que se carga: el cargador de clases, la configuración y los avisos de PHP convertidos en errores.
declare(strict_types=1);

namespace Paglot;

spl_autoload_register(static function (string $clase): void {
    if (!str_starts_with($clase, 'Paglot\\')) return;
    $ruta = __DIR__ . '/' . str_replace('\\', '/', substr($clase, 7)) . '.php';
    if (is_file($ruta)) require $ruta;
});

// Cualquier aviso de PHP (variable sin definir, conversión rara…) se trata como un error de verdad:
// mejor fallar con un 500 que seguir con datos a medias (plan de seguridad, entrada 130).
set_error_handler(static function (int $nivel, string $mensaje, string $archivo, int $linea): bool {
    if (!(error_reporting() & $nivel)) return false;
    throw new \ErrorException($mensaje, 0, $nivel, $archivo, $linea);
});

Config::cargar();
