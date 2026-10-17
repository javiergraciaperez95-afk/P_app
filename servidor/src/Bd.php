<?php
declare(strict_types=1);

namespace Paglot;

use PDO;

/**
 * La conexión a la base de datos. Siempre consultas preparadas de verdad (plan, entradas 108 y 109):
 * nunca se pega texto que venga de fuera dentro de una consulta.
 */
final class Bd
{
    private static ?PDO $pdo = null;

    /** $tareas: conecta con el usuario de las tareas (limpieza, reenvío de correos). */
    public static function conectar(bool $tareas = false): PDO
    {
        if (self::$pdo) return self::$pdo;
        $pdo = new PDO(
            (string) Config::get('bd.dsn'),
            (string) Config::get($tareas ? 'bd.tareas_usuario' : 'bd.usuario'),
            (string) Config::get($tareas ? 'bd.tareas_contrasena' : 'bd.contrasena'),
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_STRINGIFY_FETCHES  => false,
                // Una sola consulta por llamada. PHP 8.4 movió la constante a Pdo\Mysql y la 8.5 avisa de la antigua.
                (class_exists(\Pdo\Mysql::class) ? \Pdo\Mysql::ATTR_MULTI_STATEMENTS : PDO::MYSQL_ATTR_MULTI_STATEMENTS) => false,
            ],
        );
        $pdo->exec("SET time_zone = '+00:00', NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        return self::$pdo = $pdo;
    }

    public static function uno(string $sql, array $parametros = []): ?array
    {
        $consulta = self::conectar()->prepare($sql);
        $consulta->execute($parametros);
        $fila = $consulta->fetch();
        $consulta->closeCursor();
        return $fila === false ? null : $fila;
    }

    public static function todos(string $sql, array $parametros = []): array
    {
        $consulta = self::conectar()->prepare($sql);
        $consulta->execute($parametros);
        return $consulta->fetchAll();
    }

    /** Devuelve cuántas filas ha cambiado. */
    public static function ejecutar(string $sql, array $parametros = []): int
    {
        $consulta = self::conectar()->prepare($sql);
        $consulta->execute($parametros);
        return $consulta->rowCount();
    }

    /**
     * Hace todo $fn dentro de una transacción: o se guarda todo o nada (plan, entrada 54).
     * Si ya hay una abierta, se suma a ella.
     */
    public static function transaccion(callable $fn): mixed
    {
        $pdo = self::conectar();
        if ($pdo->inTransaction()) return $fn();
        $pdo->beginTransaction();
        try {
            $resultado = $fn();
            $pdo->commit();
            return $resultado;
        } catch (\Throwable $e) {
            try {
                $pdo->rollBack();
            } catch (\PDOException) {
                // Ya no había transacción (MariaDB la deshace sola tras un interbloqueo): nada que deshacer.
            }
            throw $e;
        }
    }

    /**
     * Como transaccion(), pero si MariaDB la cancela por un interbloqueo (1213) o por esperar demasiado
     * un bloqueo (1205), la repite: es lo que hay que hacer según su documentación.
     */
    public static function transaccionReintentando(callable $fn, int $intentos = 3): mixed
    {
        // Dentro de otra transacción no se puede repetir solo un trozo: lo decide la de fuera.
        if (self::conectar()->inTransaction()) return $fn();
        for ($i = 1; ; $i++) {
            try {
                return self::transaccion($fn);
            } catch (\PDOException $e) {
                $codigo = $e->errorInfo[1] ?? 0;
                if (!in_array($codigo, [1213, 1205], true) || $i >= $intentos) throw $e;
                usleep(random_int(5_000, 30_000) * $i);
            }
        }
    }

    /** Para las pruebas: olvida la conexión. */
    public static function cerrar(): void
    {
        self::$pdo = null;
    }
}
