<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Límites de intentos (plan, entradas 65–67, 71, 90 y 126).
 *
 * Cada tipo tiene [máximo, ventana]. Quien se pasa espera; si vuelve a pasarse, espera el doble,
 * y así hasta «espera_maxima» (espera creciente). Nunca se bloquea una cuenta para siempre:
 * eso permitiría a cualquiera dejar fuera a otra persona.
 * Las claves se guardan como huella con el secreto del servidor: ni correos ni IP a la vista.
 */
final class Limites
{
    /**
     * Cuenta un intento. Si ya se ha pasado del límite, lanza 429 (salvo con $lanzar = false,
     * que solo apunta: sirve para contar fallos sin cambiar la respuesta del que falla).
     * Devuelve los segundos que hay que esperar (0 = puede seguir).
     */
    public static function golpe(string $tipo, string $valor, bool $lanzar = true): int
    {
        [$maximo, $ventana] = self::regla($tipo);
        $clave = self::clave($tipo, $valor);

        // La fila se crea FUERA de la transacción: si dos peticiones la estrenan a la vez dentro de una,
        // se quedan esperándose la una a la otra (interbloqueo).
        Bd::ejecutar('INSERT IGNORE INTO limites (clave, inicio, cuenta) VALUES (?, ?, 0)', [$clave, Tiempo::bd()]);
        $espera = Bd::transaccionReintentando(static function () use ($clave, $maximo, $ventana): int {
            $fila = Bd::uno('SELECT inicio, cuenta, nivel, bloqueado_hasta FROM limites WHERE clave = ? FOR UPDATE', [$clave]);
            if ($fila === null) {
                // Justo entre medias alguien ha acertado y ha borrado el contador (reiniciar): se vuelve a crear.
                Bd::ejecutar('INSERT IGNORE INTO limites (clave, inicio, cuenta) VALUES (?, ?, 0)', [$clave, Tiempo::bd()]);
                $fila = Bd::uno('SELECT inicio, cuenta, nivel, bloqueado_hasta FROM limites WHERE clave = ? FOR UPDATE', [$clave])
                    ?? throw new \RuntimeException('No se pudo crear el contador de límites');
            }

            if ($fila['bloqueado_hasta'] !== null && Tiempo::faltan($fila['bloqueado_hasta']) > 0) {
                return Tiempo::faltan($fila['bloqueado_hasta']);
            }
            $nivel = (int) $fila['nivel'];
            $cuenta = (int) $fila['cuenta'] + 1;
            $inicio = $fila['inicio'];
            if (self::segundosDesde($inicio) >= $ventana) {
                // Ventana nueva. La espera creciente se olvida si ha pasado un día tranquilo.
                if (self::segundosDesde($inicio) > 86400) $nivel = 0;
                $cuenta = 1;
                $inicio = Tiempo::bd();
            }
            if ($cuenta > $maximo) {
                $nivel = min($nivel + 1, 20);
                $segundos = (int) min($ventana * 2 ** ($nivel - 1), (int) Config::ajuste('espera_maxima'));
                Bd::ejecutar(
                    'UPDATE limites SET inicio = ?, cuenta = 0, nivel = ?, bloqueado_hasta = ? WHERE clave = ?',
                    [Tiempo::bd(), $nivel, Tiempo::bd($segundos), $clave],
                );
                return $segundos;
            }
            Bd::ejecutar(
                'UPDATE limites SET inicio = ?, cuenta = ?, nivel = ?, bloqueado_hasta = NULL WHERE clave = ?',
                [$inicio, $cuenta, $nivel, $clave],
            );
            return 0;
        });

        if ($espera > 0 && $lanzar) throw ErrorApi::demasiados($espera);
        return $espera;
    }

    /** Lanza 429 si está esperando, sin contar este intento. */
    public static function comprobar(string $tipo, string $valor): void
    {
        $fila = Bd::uno('SELECT bloqueado_hasta FROM limites WHERE clave = ?', [self::clave($tipo, $valor)]);
        if ($fila && $fila['bloqueado_hasta'] !== null) {
            $faltan = Tiempo::faltan($fila['bloqueado_hasta']);
            if ($faltan > 0) throw ErrorApi::demasiados($faltan);
        }
    }

    /** Tras un acierto (p. ej. entrar bien), se olvidan los fallos. */
    public static function reiniciar(string $tipo, string $valor): void
    {
        Bd::ejecutar('DELETE FROM limites WHERE clave = ?', [self::clave($tipo, $valor)]);
    }

    private static function regla(string $tipo): array
    {
        $reglas = Config::ajuste('limites');
        if (!isset($reglas[$tipo])) throw new \LogicException("Límite desconocido: {$tipo}");
        return [(int) $reglas[$tipo][0], (int) $reglas[$tipo][1]];
    }

    private static function clave(string $tipo, string $valor): string
    {
        return $tipo . ':' . substr(Seguridad::hmac($tipo . "\0" . $valor), 0, 64);
    }

    private static function segundosDesde(string $bd): int
    {
        $fecha = new \DateTimeImmutable($bd, new \DateTimeZone('UTC'));
        return Tiempo::ahora()->getTimestamp() - $fecha->getTimestamp();
    }
}
