<?php
declare(strict_types=1);

use Paglot\Bd;
use Paglot\Config;

grupo('Base de datos, permisos, tareas y registros');

/** Conexión como el usuario de la API (paglot_app), para comprobar lo que NO puede hacer. */
function como_app(): \PDO
{
    return new \PDO((string) Config::get('bd.dsn'), (string) Config::get('bd.usuario'), (string) Config::get('bd.contrasena'), [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
}

function prohibido(\PDO $pdo, string $sql): void
{
    try {
        $pdo->exec($sql);
    } catch (\PDOException) {
        Pruebas::$comprobaciones++;
        return;
    }
    falla("El usuario de la API ha podido hacer: {$sql}");
}

prueba('el usuario de la API no puede leer ni borrar eventos, ni cambiar tablas, ni tocar otras bases', function () {
    $pdo = como_app();
    prohibido($pdo, 'SELECT * FROM eventos');
    prohibido($pdo, 'DELETE FROM eventos');
    prohibido($pdo, 'UPDATE eventos SET tipo = 1');
    prohibido($pdo, 'DROP TABLE usuarios');
    prohibido($pdo, 'ALTER TABLE usuarios ADD COLUMN x INT');
    prohibido($pdo, 'CREATE TABLE x (a INT)');
    prohibido($pdo, 'TRUNCATE TABLE usuarios');
    prohibido($pdo, 'SELECT * FROM mysql.user');
    prohibido($pdo, 'SELECT * FROM mysql.global_priv');
    // Leer archivos del disco: sin el permiso FILE, MariaDB devuelve NULL en vez de dar error.
    igual(null, $pdo->query("SELECT LOAD_FILE('C:/Windows/win.ini') AS x")->fetch(PDO::FETCH_ASSOC)['x'], 'no puede leer archivos del disco');
    prohibido($pdo, "SELECT 1 INTO OUTFILE 'C:/Windows/Temp/paglot-prueba.txt'");
    prohibido($pdo, 'GRANT ALL ON *.* TO CURRENT_USER');
    // Lo suyo sí
    $pdo->exec("INSERT INTO eventos (fecha, tipo) VALUES (NOW(3), 'prueba')");
    Pruebas::$comprobaciones++;
});

prueba('en la base nunca hay contraseñas ni tokens en claro', function () {
    $c = cuenta();
    espera(api('POST', '/api/v1/recuperar', ['correo' => 'ana@example.com']), 202);
    $enlace = token_de(ultimo_correo('ana@example.com', 'recuperar'));
    entrar('ana@example.com', 'contraseña equivocada a propósito');
    $todo = '';
    foreach (['usuarios', 'sesiones', 'tokens', 'eventos', 'limites', 'correos_pendientes'] as $tabla) {
        foreach (Bd::todos("SELECT * FROM {$tabla}") as $fila) $todo .= json_encode(array_map(fn ($v) => is_string($v) && !mb_check_encoding($v, 'UTF-8') ? bin2hex($v) : $v, $fila), JSON_UNESCAPED_UNICODE);
    }
    foreach ([CLAVE, 'contraseña equivocada a propósito', $c['token'], $enlace] as $secreto) {
        verdad(!str_contains($todo, $secreto), 'no aparece: ' . mb_substr($secreto, 0, 6) . '…');
    }
});

prueba('los eventos importantes quedan anotados, sin datos de más', function () {
    $c = cuenta();
    entrar('ana@example.com', 'mala');
    espera(api('POST', '/api/v1/yo/contrasena', ['actual' => CLAVE, 'nueva' => 'otra frase nueva larga'], $c['token']), 200);
    $tipos = array_column(Bd::todos('SELECT tipo FROM eventos ORDER BY id'), 'tipo');
    foreach (['registro', 'confirmado', 'entrar_fallo', 'contrasena_cambiada'] as $tipo) verdad(in_array($tipo, $tipos, true), "evento {$tipo}");
    $fila = Bd::uno("SELECT * FROM eventos WHERE tipo = 'entrar_fallo'");
    igual('127.0.0.1', $fila['ip']);
    igual('', $fila['detalle']);
});

prueba('limpieza nocturna: borra lo caducado y nada más', function () {
    $c = cuenta('ana@example.com');
    espera(api('POST', '/api/v1/registro', ['correo' => 'vieja@example.com', 'contrasena' => CLAVE]), 202);
    espera(api('POST', '/api/v1/registro', ['correo' => 'reciente@example.com', 'contrasena' => CLAVE]), 202);
    Bd::ejecutar("UPDATE usuarios SET creado = ? WHERE correo = 'vieja@example.com'", [hace(8 * 86400)]);
    $caducada = espera(entrar(), 200)['json']['token'];
    Bd::ejecutar('UPDATE sesiones SET caduca = ? WHERE token_hash = ?', [hace(10), hash('sha256', $caducada, true)]);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(1), 'version' => 0], $c['token']), 200);
    espera(api('PUT', '/api/v1/progreso/es', ['datos' => progreso(2), 'version' => 1], $c['token']), 200);
    Bd::ejecutar('UPDATE progreso_historial SET guardado = ?', [hace(15 * 86400)]);
    Bd::ejecutar("INSERT INTO eventos (fecha, tipo) VALUES (?, 'viejo'), (?, 'nuevo')", [hace(91 * 86400), hace(10)]);

    $salida = shell_exec_seguro(php_hijo(dirname(__DIR__, 2) . '/tareas/limpieza.php'));
    verdad(str_contains($salida, 'Limpieza terminada'), 'la tarea termina: ' . $salida);

    igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM usuarios WHERE correo = 'vieja@example.com'")['n'], 'sin confirmar de hace 8 días: fuera');
    igual(1, (int) Bd::uno("SELECT COUNT(*) AS n FROM usuarios WHERE correo = 'reciente@example.com'")['n'], 'sin confirmar reciente: se queda');
    igual(1, (int) Bd::uno("SELECT COUNT(*) AS n FROM usuarios WHERE correo = 'ana@example.com'")['n'], 'la confirmada se queda');
    espera(api('GET', '/api/v1/yo', null, $c['token']), 200);
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM sesiones WHERE caduca < NOW(3)')['n'], 'sesiones caducadas fuera');
    igual(0, (int) Bd::uno('SELECT COUNT(*) AS n FROM progreso_historial')['n'], 'copias de hace 15 días fuera');
    igual(1, (int) Bd::uno('SELECT COUNT(*) AS n FROM progreso')['n'], 'el progreso se queda');
    igual(0, (int) Bd::uno("SELECT COUNT(*) AS n FROM eventos WHERE tipo = 'viejo'")['n'], 'eventos de hace 91 días fuera');
    igual(1, (int) Bd::uno("SELECT COUNT(*) AS n FROM eventos WHERE tipo = 'nuevo'")['n'], 'los recientes se quedan');
});

/** El mismo PHP que corre las pruebas, con sus extensiones, para lanzar una tarea. */
function php_hijo(string $script): array
{
    $orden = [PHP_BINARY, '-n', '-d', 'extension_dir=' . ini_get('extension_dir'), '-d', 'date.timezone=UTC'];
    foreach (['curl', 'gd', 'intl', 'mbstring', 'openssl', 'pdo_mysql', 'sodium'] as $ext) array_push($orden, '-d', "extension={$ext}");
    $orden[] = $script;
    return $orden;
}

/** Ejecuta un programa sin pasar por la shell (sin inyección posible) y devuelve lo que escribe. */
function shell_exec_seguro(array $orden): string
{
    $entorno = getenv();
    $p = proc_open($orden, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $tuberias, null, $entorno);
    if (!is_resource($p)) falla('No se pudo ejecutar ' . implode(' ', $orden));
    $salida = stream_get_contents($tuberias[1]) . stream_get_contents($tuberias[2]);
    proc_close($p);
    return (string) $salida;
}
