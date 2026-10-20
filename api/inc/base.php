<?php
// Lo común de la API: configuración, base de datos, respuestas JSON, CORS, límites de peticiones y sesiones.
declare(strict_types=1);

function config(?string $clave = null)
{
    static $c = null;
    if ($c === null) {
        $ruta = __DIR__ . '/../config.php';
        if (!is_file($ruta)) responder(['error' => 'sin-configurar'], 500);
        $c = require $ruta;
    }
    return $clave === null ? $c : ($c[$clave] ?? null);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $d = config('db');
        $pdo = new PDO($d['dsn'], $d['usuario'], $d['clave'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET time_zone = '+00:00'");
    }
    return $pdo;
}

/** Una consulta con parámetros (nunca se pega texto del usuario en el SQL). */
function sql(string $consulta, array $datos = []): PDOStatement
{
    $s = db()->prepare($consulta);
    $s->execute($datos);
    return $s;
}

function responder(array $datos, int $estado = 200): void
{
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Un fallo para la app: un código corto que ella traduce (no textos). */
function fallo(string $codigo, int $estado = 400): void
{
    responder(['error' => $codigo], $estado);
}

function cors(): void
{
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origen !== '' && in_array($origen, config('origenes'), true)) {
        header("Access-Control-Allow-Origin: $origen");
        header('Vary: Origin');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Max-Age: 86400');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
}

/** El cuerpo JSON de la petición (como mucho 3 MB). */
function entrada(): array
{
    static $e = null;
    if ($e === null) {
        $crudo = file_get_contents('php://input', false, null, 0, 3_000_000) ?: '';
        $e = json_decode($crudo, true);
        if (!is_array($e)) $e = [];
    }
    return $e;
}

function texto(string $campo, int $largo = 254): string
{
    $v = entrada()[$campo] ?? '';
    return is_string($v) ? mb_substr(trim($v), 0, $largo) : '';
}

function ip(): string
{
    return $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/** Como mucho $veces peticiones de esta acción por IP cada $segundos; si no, 429. */
function limitar(string $accion, int $veces, int $segundos): void
{
    $ventana = intdiv(time(), $segundos);
    $clave = hash('sha256', ip() . "|$accion|$ventana", true);
    sql('INSERT INTO limites (clave, cuenta, caduca) VALUES (?, 1, FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE cuenta = cuenta + 1',
        [$clave, ($ventana + 1) * $segundos]);
    $n = (int) sql('SELECT cuenta FROM limites WHERE clave = ?', [$clave])->fetchColumn();
    if ($n > $veces) fallo('demasiado-seguido', 429);
}

function huella(string $texto): string
{
    return hash('sha256', $texto, true);
}

function token(): string
{
    return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
}

function correo_valido(string $c): bool
{
    return strlen($c) <= 254 && filter_var($c, FILTER_VALIDATE_EMAIL) !== false;
}

// ----- Sesiones -----
const DIAS_SESION = 90;

function abrir_sesion(int $usuario): string
{
    $t = token();
    sql('INSERT INTO sesiones (huella, usuario_id, caduca) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL ' . DIAS_SESION . ' DAY)', [huella($t), $usuario]);
    sql('UPDATE usuarios SET visto = UTC_TIMESTAMP() WHERE id = ?', [$usuario]);
    return $t;
}

/** El usuario de la sesión (cabecera «Authorization: Bearer …»), o null. */
function usuario_actual(): ?array
{
    static $u = false;
    if ($u !== false) return $u;
    $u = null;
    $cabecera = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+([A-Za-z0-9_-]{20,})$/', $cabecera, $m)) {
        $u = sql('SELECT u.* FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.huella = ? AND s.caduca > UTC_TIMESTAMP()',
            [huella($m[1])])->fetch() ?: null;
    }
    return $u;
}

function exigir_usuario(): array
{
    $u = usuario_actual();
    if (!$u) fallo('sin-sesion', 401);
    return $u;
}

/** Un número de cuenta nuevo de 8 cifras (sin empezar por 0 y sin chocar con ninguno). */
function numero_nuevo(): int
{
    do {
        $n = random_int(10_000_000, 99_999_999);
    } while (sql('SELECT 1 FROM usuarios WHERE id = ?', [$n])->fetchColumn());
    return $n;
}
