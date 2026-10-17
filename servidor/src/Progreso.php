<?php
declare(strict_types=1);

namespace Paglot;

/**
 * El progreso de cada curso: el mismo JSON que guarda la app en el navegador (js/progress.js).
 *
 * La app sigue siendo quien junta los datos de varios dispositivos (unirDatos). El servidor guarda
 * con «versión»: si la versión que manda la app no es la última, responde 409 con lo que hay ahora;
 * la app lo junta y vuelve a guardar. Así nadie pisa a nadie (plan, entradas 55 y 137).
 */
final class Progreso
{
    /** Las partes que puede tener (js/progress.js, vacio()); «juego» está previsto (plan, entrada 144). */
    private const PARTES = ['version', 'reiniciado', 'perfil', 'lecciones', 'cuaderno', 'actividad', 'juego'];
    private const MAPAS = ['lecciones', 'cuaderno', 'actividad', 'juego'];

    public static function obtener(string $usuarioId, string $curso): array
    {
        $fila = Bd::uno('SELECT datos, version, actualizado FROM progreso WHERE usuario_id = ? AND curso = ?', [$usuarioId, $curso]);
        return [
            'datos'       => $fila ? self::decodificar($fila['datos']) : null,
            'version'     => $fila ? (int) $fila['version'] : 0,
            'actualizado' => $fila ? Tiempo::iso($fila['actualizado']) : null,
        ];
    }

    /** Guarda si $version es la última. Devuelve ['version' => nueva, 'actualizado' => …]. */
    public static function guardar(string $usuarioId, string $curso, mixed $datos, mixed $version): array
    {
        if (!is_int($version) || $version < 0) throw ErrorApi::datos('version', 'tipo');
        $datos = self::validar($datos);
        $texto = self::codificar($datos);
        if (strlen($texto) > (int) Config::ajuste('progreso_max')) throw new ErrorApi(413, 'demasiado_grande');

        try {
            return Bd::transaccionReintentando(static fn (): array => self::guardarEnTransaccion($usuarioId, $curso, $datos, $texto, $version));
        } catch (\PDOException $e) {
            // Dos dispositivos estrenando el curso a la vez: el segundo choca con la clave primaria.
            if (($e->errorInfo[1] ?? 0) === 1062) throw self::conflicto($usuarioId, $curso);
            throw $e;
        }
    }

    private static function guardarEnTransaccion(string $usuarioId, string $curso, \stdClass $datos, string $texto, int $version): array
    {
        $fila = Bd::uno(
            'SELECT datos, version FROM progreso WHERE usuario_id = ? AND curso = ? FOR UPDATE',
            [$usuarioId, $curso],
        );
        $ultima = $fila ? (int) $fila['version'] : 0;
        if ($version !== $ultima) {
            throw new ErrorApi(409, 'conflicto', ['datos' => $fila ? self::decodificar($fila['datos']) : null, 'version' => $ultima]);
        }
        $ahora = Tiempo::bd();
        if (!$fila) {
            Bd::ejecutar(
                'INSERT INTO progreso (usuario_id, curso, datos, version, actualizado) VALUES (?, ?, ?, 1, ?)',
                [$usuarioId, $curso, $texto, $ahora],
            );
            return ['version' => 1, 'actualizado' => Tiempo::iso($ahora)];
        }

        $anterior = self::decodificar($fila['datos']);
        self::comprobarRetroceso($anterior, $datos);

        // Copia de lo anterior, como mucho una por hora y curso (plan, entrada 134).
        $ultimaCopia = Bd::uno(
            'SELECT MAX(guardado) AS g FROM progreso_historial WHERE usuario_id = ? AND curso = ?',
            [$usuarioId, $curso],
        )['g'] ?? null;
        if ($ultimaCopia === null || $ultimaCopia < Tiempo::bd(-(int) Config::ajuste('historial_cada'))) {
            Bd::ejecutar(
                'INSERT INTO progreso_historial (usuario_id, curso, datos, version, guardado) VALUES (?, ?, ?, ?, ?)',
                [$usuarioId, $curso, $fila['datos'], $ultima, $ahora],
            );
        }

        Bd::ejecutar(
            'UPDATE progreso SET datos = ?, version = version + 1, actualizado = ? WHERE usuario_id = ? AND curso = ?',
            [$texto, $ahora, $usuarioId, $curso],
        );
        return ['version' => $ultima + 1, 'actualizado' => Tiempo::iso($ahora)];
    }

    /**
     * Una app con un fallo no puede vaciar el progreso de la nube (plan, entrada 135): si lo nuevo tiene
     * menos de la mitad de lecciones y palabras que lo guardado, solo se acepta si es un reinicio
     * (la app pone «reiniciado» a la hora del reinicio).
     */
    private static function comprobarRetroceso(\stdClass $antes, \stdClass $ahora): void
    {
        $total = static fn (\stdClass $d): int => count(get_object_vars($d->lecciones ?? new \stdClass()))
            + count(get_object_vars($d->cuaderno ?? new \stdClass()));
        $tenia = $total($antes);
        $tiene = $total($ahora);
        $reinicio = ($ahora->reiniciado ?? 0) > ($antes->reiniciado ?? 0);
        if ($tenia >= 10 && $tiene * 2 < $tenia && !$reinicio) {
            throw new ErrorApi(409, 'retroceso', ['tenia' => $tenia, 'tiene' => $tiene]);
        }
    }

    public static function borrar(string $usuarioId, string $curso): void
    {
        Bd::transaccion(static function () use ($usuarioId, $curso): void {
            Bd::ejecutar('DELETE FROM progreso WHERE usuario_id = ? AND curso = ?', [$usuarioId, $curso]);
            Bd::ejecutar('DELETE FROM progreso_historial WHERE usuario_id = ? AND curso = ?', [$usuarioId, $curso]);
        });
    }

    /** Todos los cursos de una cuenta (para «descargar mis datos»). */
    public static function todos(string $usuarioId): array
    {
        $cursos = [];
        foreach (Bd::todos('SELECT curso, datos, version, actualizado FROM progreso WHERE usuario_id = ? ORDER BY curso', [$usuarioId]) as $f) {
            $cursos[$f['curso']] = ['datos' => self::decodificar($f['datos']), 'version' => (int) $f['version'], 'actualizado' => Tiempo::iso($f['actualizado'])];
        }
        return $cursos;
    }

    /**
     * Comprueba la forma del progreso (plan, entrada 116): un objeto con versión 2 y solo las partes
     * conocidas, cada una del tipo que toca. Lo que no encaja se rechaza; no se guarda «a ver qué pasa».
     */
    public static function validar(mixed $datos): \stdClass
    {
        if (!$datos instanceof \stdClass) throw ErrorApi::datos('datos', 'tipo');
        foreach (get_object_vars($datos) as $parte => $valor) {
            if (!in_array($parte, self::PARTES, true)) throw ErrorApi::datos("datos.{$parte}", 'sobra');
        }
        if (($datos->version ?? null) !== 2) throw ErrorApi::datos('datos.version', 'invalido');
        if (property_exists($datos, 'reiniciado')
            && (!(is_int($datos->reiniciado) || is_float($datos->reiniciado)) || $datos->reiniciado < 0)) {
            throw ErrorApi::datos('datos.reiniciado', 'tipo');
        }
        if (property_exists($datos, 'perfil')) {
            if (!$datos->perfil instanceof \stdClass) throw ErrorApi::datos('datos.perfil', 'tipo');
            if (property_exists($datos->perfil, 'nombre') && !is_string($datos->perfil->nombre)) {
                throw ErrorApi::datos('datos.perfil.nombre', 'tipo');
            }
            self::comprobarMarca($datos->perfil, 'datos.perfil');
        }
        foreach (self::MAPAS as $mapa) {
            if (!property_exists($datos, $mapa)) continue;
            if (!$datos->$mapa instanceof \stdClass) throw ErrorApi::datos("datos.{$mapa}", 'tipo');
            if ($mapa === 'juego') continue;   // su forma aún no está decidida: basta con que sea un objeto
            foreach (get_object_vars($datos->$mapa) as $clave => $entrada) {
                if (strlen((string) $clave) > 200) throw ErrorApi::datos("datos.{$mapa}", 'clave');
                if (!$entrada instanceof \stdClass) throw ErrorApi::datos("datos.{$mapa}.{$clave}", 'tipo');
                self::comprobarMarca($entrada, "datos.{$mapa}.{$clave}");
            }
        }
        return $datos;
    }

    /** «t» es la hora del último cambio de cada entrada (milisegundos, como Date.now()). */
    private static function comprobarMarca(\stdClass $entrada, string $campo): void
    {
        if (property_exists($entrada, 't') && (!(is_int($entrada->t) || is_float($entrada->t)) || $entrada->t < 0)) {
            throw ErrorApi::datos("{$campo}.t", 'tipo');
        }
    }

    private static function conflicto(string $usuarioId, string $curso): ErrorApi
    {
        $actual = self::obtener($usuarioId, $curso);
        return new ErrorApi(409, 'conflicto', ['datos' => $actual['datos'], 'version' => $actual['version']]);
    }

    public static function codificar(\stdClass $datos): string
    {
        return json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR);
    }

    private static function decodificar(string $texto): \stdClass
    {
        $datos = json_decode($texto, false, 512, JSON_THROW_ON_ERROR | JSON_BIGINT_AS_STRING);
        return $datos instanceof \stdClass ? $datos : new \stdClass();
    }
}
