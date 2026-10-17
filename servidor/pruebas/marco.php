<?php
// Lo necesario para escribir las pruebas: registrar casos, comprobar, llamar a la API y mirar la base y el buzón.
// Sin librerías de fuera a propósito (plan de seguridad, entrada 179).
declare(strict_types=1);

use Paglot\Bd;
use Paglot\Config;

final class FalloPrueba extends \RuntimeException {}

final class Pruebas
{
    /** @var array<int, array{0:string,1:string,2:callable}> */
    public static array $casos = [];
    public static string $grupo = '';
    public static int $comprobaciones = 0;
}

function grupo(string $nombre): void { Pruebas::$grupo = $nombre; }

function prueba(string $nombre, callable $fn): void
{
    Pruebas::$casos[] = [Pruebas::$grupo, $nombre, $fn];
}

function falla(string $mensaje): never { throw new FalloPrueba($mensaje); }

function verdad(mixed $condicion, string $mensaje = 'debería ser verdad'): void
{
    Pruebas::$comprobaciones++;
    if ($condicion !== true) falla($mensaje);
}

function igual(mixed $esperado, mixed $real, string $que = ''): void
{
    Pruebas::$comprobaciones++;
    if ($esperado !== $real) {
        falla(($que !== '' ? "{$que}: " : '') . 'se esperaba ' . exportar($esperado) . ' y llegó ' . exportar($real));
    }
}

function exportar(mixed $v): string
{
    $t = is_string($v) ? '"' . $v . '"' : json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
    return mb_strlen((string) $t) > 300 ? mb_substr((string) $t, 0, 300) . '…' : (string) $t;
}

/** Comprueba estado y, si se da, el código de error. Devuelve la respuesta. */
function espera(array $r, int $estado, ?string $error = null): array
{
    Pruebas::$comprobaciones++;
    if ($r['estado'] !== $estado || ($error !== null && ($r['json']['error'] ?? null) !== $error)) {
        falla("se esperaba {$estado}" . ($error ? " «{$error}»" : '') . " y llegó {$r['estado']}: " . exportar($r['crudo']));
    }
    return $r;
}

// ---------------------------------------------------------------------------------------------
// La API por HTTP
// ---------------------------------------------------------------------------------------------

function api(string $metodo, string $ruta, mixed $cuerpo = null, ?string $token = null, array $cabeceras = []): array
{
    $c = curl_init(rtrim((string) getenv('PAGLOT_API'), '/') . $ruta);
    $h = [];
    if ($cuerpo !== null) {
        $texto = is_string($cuerpo) ? $cuerpo : json_encode($cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR);
        curl_setopt($c, CURLOPT_POSTFIELDS, $texto);
        if (!array_key_exists('Content-Type', $cabeceras)) $h[] = 'Content-Type: application/json';
    }
    if ($token !== null) $h[] = 'Authorization: Bearer ' . $token;
    foreach ($cabeceras as $nombre => $valor) $h[] = "{$nombre}: {$valor}";
    $h[] = 'Expect:';   // sin «100-continue» en cuerpos grandes
    curl_setopt_array($c, [
        CURLOPT_CUSTOMREQUEST  => $metodo,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => true,
        CURLOPT_HTTPHEADER     => $h,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_PATH_AS_IS     => true,   // la ruta tal cual, con sus /../ (curl la «arreglaría»)
    ]);
    $todo = curl_exec($c);
    if ($todo === false) falla('La API no responde: ' . curl_error($c));
    $tamCabecera = (int) curl_getinfo($c, CURLINFO_HEADER_SIZE);
    return respuesta((int) curl_getinfo($c, CURLINFO_RESPONSE_CODE), substr($todo, 0, $tamCabecera), substr($todo, $tamCabecera));
}

function respuesta(int $estado, string $cabeceraCruda, string $cuerpo): array
{
    $cab = [];
    foreach (explode("\r\n", $cabeceraCruda) as $linea) {
        if (str_contains($linea, ':')) {
            [$k, $v] = explode(':', $linea, 2);
            $cab[strtolower(trim($k))] = trim($v);
        }
    }
    return [
        'estado' => $estado,
        'cab'    => $cab,
        'crudo'  => $cuerpo,
        'json'   => $cuerpo === '' ? null : json_decode($cuerpo, true),
        'obj'    => $cuerpo === '' ? null : json_decode($cuerpo, false),
    ];
}

/**
 * Varias peticiones a la vez (para probar carreras). Cada una: [método, ruta, cuerpo, token].
 * Se reparten entre las dos copias de la API: el servidor de pruebas de PHP atiende de una en una,
 * así que solo con dos procesos distintos hay carrera de verdad en la base de datos.
 */
function a_la_vez(array $peticiones): array
{
    $multi = curl_multi_init();
    $manejadores = [];
    $apis = array_values(array_filter([getenv('PAGLOT_API'), getenv('PAGLOT_API2')]));
    foreach ($peticiones as $i => [$metodo, $ruta, $cuerpo, $token]) {
        $c = curl_init(rtrim((string) $apis[$i % count($apis)], '/') . $ruta);
        curl_setopt_array($c, [
            CURLOPT_CUSTOMREQUEST  => $metodo,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER         => true,
            CURLOPT_POSTFIELDS     => json_encode($cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Authorization: Bearer ' . $token, 'Expect:'],
        ]);
        curl_multi_add_handle($multi, $c);
        $manejadores[$i] = $c;
    }
    do {
        $estado = curl_multi_exec($multi, $activas);
        if ($activas) curl_multi_select($multi, 1.0);
    } while ($activas && $estado === CURLM_OK);
    $resultados = [];
    foreach ($manejadores as $i => $c) {
        $todo = (string) curl_multi_getcontent($c);
        $tam = (int) curl_getinfo($c, CURLINFO_HEADER_SIZE);
        $resultados[$i] = respuesta((int) curl_getinfo($c, CURLINFO_RESPONSE_CODE), substr($todo, 0, $tam), substr($todo, $tam));
        curl_multi_remove_handle($multi, $c);
    }
    return $resultados;
}

// ---------------------------------------------------------------------------------------------
// Base de datos, buzón y atajos
// ---------------------------------------------------------------------------------------------

/** Deja la base de pruebas vacía y el buzón limpio. Se hace antes de cada caso. */
function limpiar(): void
{
    foreach (['eventos', 'limites', 'correos_pendientes', 'progreso_historial', 'progreso', 'tokens', 'sesiones', 'usuarios'] as $tabla) {
        Bd::ejecutar("DELETE FROM {$tabla}");
    }
    foreach (glob(buzon() . '/*.json') ?: [] as $archivo) unlink($archivo);
}

function buzon(): string
{
    return (string) Config::get('correo.buzon');
}

/**
 * La API envía los correos DESPUÉS de responder. Para no leer el buzón antes de tiempo, se manda
 * una petición vacía (OPTIONS, que no hace nada) a cada copia: como atienden de una en una,
 * cuando contestan, la petición anterior ya ha terminado del todo y su correo está escrito.
 */
function asentar(): void
{
    foreach (array_filter([getenv('PAGLOT_API'), getenv('PAGLOT_API2')]) as $base) {
        $c = curl_init(rtrim((string) $base, '/') . '/api/v1/salud');
        curl_setopt_array($c, [CURLOPT_CUSTOMREQUEST => 'OPTIONS', CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
        curl_exec($c);
    }
}

/** Los correos del buzón (los más viejos primero), opcionalmente solo los de una dirección. */
function correos(?string $para = null): array
{
    asentar();
    $archivos = glob(buzon() . '/*.json') ?: [];
    sort($archivos);
    $lista = array_map(static fn (string $a): array => json_decode((string) file_get_contents($a), true), $archivos);
    return array_values(array_filter($lista, static fn (array $c): bool => $para === null || $c['para'] === $para));
}

function ultimo_correo(string $para, ?string $plantilla = null): array
{
    $lista = array_values(array_filter(correos($para), static fn (array $c): bool => $plantilla === null || $c['plantilla'] === $plantilla));
    if ($lista === []) falla("No ha llegado ningún correo" . ($plantilla ? " «{$plantilla}»" : '') . " a {$para}");
    return end($lista);
}

/** El token que va en el enlace de un correo. */
function token_de(array $correo): string
{
    if (!preg_match('~#/enlace/[a-z]+/([A-Za-z0-9_-]{43})$~', (string) $correo['enlace'], $m)) falla('El correo no trae un enlace válido');
    return $m[1];
}

const CLAVE = 'una frase larga de prueba';

/** Crea una cuenta y la confirma. Devuelve ['token' => sesión, 'usuario' => …]. */
function cuenta(string $correo = 'ana@example.com', string $contrasena = CLAVE, string $nombre = 'Ana'): array
{
    espera(api('POST', '/api/v1/registro', ['correo' => $correo, 'contrasena' => $contrasena, 'nombre' => $nombre]), 202);
    $r = espera(api('POST', '/api/v1/confirmar', ['token' => token_de(ultimo_correo($correo, 'confirmar'))]), 200);
    return ['token' => $r['json']['token'], 'usuario' => $r['json']['usuario']];
}

function entrar(string $correo = 'ana@example.com', string $contrasena = CLAVE): array
{
    return api('POST', '/api/v1/entrar', ['correo' => $correo, 'contrasena' => $contrasena]);
}

/** Progreso mínimo válido con $n lecciones, como lo genera la app. */
function progreso(int $lecciones = 1, array $extra = []): \stdClass
{
    $d = json_decode('{"version":2,"reiniciado":0,"perfil":{"nombre":"Ana","t":1},"lecciones":{},"cuaderno":{},"actividad":{}}');
    for ($i = 1; $i <= $lecciones; $i++) {
        $id = sprintf('%03d', $i);
        $d->lecciones->$id = json_decode('{"terminada":true,"abierta":true,"ejercicios":{"e1":{"intentos":1,"bien":true}},"t":' . (1700000000000 + $i) . '}');
    }
    foreach ($extra as $k => $v) $d->$k = $v;
    return $d;
}

/** Cambia horas en la base para «viajar en el tiempo» (p. ej. caducar una sesión). */
function hace(int $segundos): string
{
    return \Paglot\Tiempo::bd(-$segundos);
}
