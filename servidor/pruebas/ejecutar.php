<?php
// Ejecuta todas las pruebas de la API. No se lanza a mano: lo hace local/probar.sh, que antes arranca
// dos copias de la API (para probar carreras de verdad) y el Resend de mentira.
//
//   php pruebas/ejecutar.php [texto]   ← con texto, solo los casos cuyo nombre lo contenga
declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/src/arranque.php';
require __DIR__ . '/marco.php';

use Paglot\Bd;
use Paglot\Config;

if (Config::get('bd.dsn') === null || !str_contains((string) Config::get('bd.dsn'), 'paglot_pruebas')) {
    fwrite(STDERR, "Las pruebas borran la base: solo se ejecutan contra paglot_pruebas.\n");
    exit(2);
}
Bd::conectar(true);   // las pruebas miran y preparan la base con el usuario de las tareas

foreach (glob(__DIR__ . '/casos/*.php') ?: [] as $archivo) require $archivo;

$filtro = $argv[1] ?? '';
$bien = 0;
$fallos = [];
$grupo = null;
$inicio = hrtime(true);
foreach (Pruebas::$casos as [$g, $nombre, $fn]) {
    if ($filtro !== '' && !str_contains(mb_strtolower($g . ' ' . $nombre), mb_strtolower($filtro))) continue;
    if ($g !== $grupo) { echo "\n  {$g}\n"; $grupo = $g; }
    limpiar();
    $t = hrtime(true);
    try {
        $fn();
        $bien++;
        printf("    \033[32m✔\033[0m %s \033[2m(%d ms)\033[0m\n", $nombre, (hrtime(true) - $t) / 1e6);
    } catch (\Throwable $e) {
        $fallos[] = [$g, $nombre, $e];
        printf("    \033[31m✘ %s\033[0m\n      %s\n", $nombre, $e instanceof FalloPrueba ? $e->getMessage() : $e::class . ': ' . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ')');
    }
}
limpiar();

printf(
    "\n  %d pruebas, %d comprobaciones, %.1f s — %s\n\n",
    $bien + count($fallos),
    Pruebas::$comprobaciones,
    (hrtime(true) - $inicio) / 1e9,
    $fallos === [] ? "\033[32mtodo bien\033[0m" : "\033[31m" . count($fallos) . ' con fallos' . "\033[0m",
);
exit($fallos === [] ? 0 : 1);
