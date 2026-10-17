<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Sesiones con token opaco (plan, entradas 75–86): aleatorio, enviado en «Authorization: Bearer»,
 * guardado solo como huella, con caducidad que se alarga con el uso y un tope absoluto.
 * Se puede anular al momento (cerrar sesión, cambiar la contraseña, cerrar en todos los dispositivos).
 */
final class Sesiones
{
    /** Abre una sesión nueva: siempre un token nuevo (plan, entrada 84). */
    public static function crear(string $usuarioId, Peticion $p): array
    {
        $token = Seguridad::token();
        $caduca = Tiempo::bd((int) Config::ajuste('sesion_duracion'));
        Bd::ejecutar(
            'INSERT INTO sesiones (id, usuario_id, token_hash, creada, usada, caduca, dispositivo, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [Seguridad::idPublico(), $usuarioId, Seguridad::huella($token), Tiempo::bd(), Tiempo::bd(), $caduca, self::dispositivo($p->agente), $p->ip],
        );
        Bd::ejecutar('UPDATE usuarios SET ultimo_acceso = ? WHERE id = ?', [Tiempo::bd(), $usuarioId]);
        return ['token' => $token, 'caduca' => Tiempo::iso($caduca)];
    }

    /**
     * La sesión de esta petición, con su cuenta: ['sesion' => fila, 'usuario' => fila], o null.
     * Comprueba la caducidad y el tope, y la alarga si hace tiempo que no se alargaba.
     */
    public static function deLaPeticion(Peticion $p): ?array
    {
        $token = $p->token();
        if ($token === null) return null;
        $sesion = Bd::uno(
            'SELECT * FROM sesiones WHERE token_hash = ? AND caduca > ? AND creada > ?',
            [Seguridad::huella($token), Tiempo::bd(), Tiempo::bd(-(int) Config::ajuste('sesion_maxima'))],
        );
        if (!$sesion) return null;
        $usuario = Usuarios::porId($sesion['usuario_id']);
        if (!$usuario || $usuario['confirmado'] === null) return null;

        $desde = (new \DateTimeImmutable($sesion['usada'], new \DateTimeZone('UTC')))->getTimestamp();
        if (Tiempo::ahora()->getTimestamp() - $desde >= (int) Config::ajuste('sesion_renovar_cada')) {
            $tope = (new \DateTimeImmutable($sesion['creada'], new \DateTimeZone('UTC')))
                ->modify('+' . (int) Config::ajuste('sesion_maxima') . ' seconds')->format('Y-m-d H:i:s.v');
            $caduca = min(Tiempo::bd((int) Config::ajuste('sesion_duracion')), $tope);
            Bd::ejecutar('UPDATE sesiones SET usada = ?, caduca = ?, ip = ? WHERE id = ?', [Tiempo::bd(), $caduca, $p->ip, $sesion['id']]);
            Bd::ejecutar('UPDATE usuarios SET ultimo_acceso = ? WHERE id = ?', [Tiempo::bd(), $usuario['id']]);
            $sesion['caduca'] = $caduca;
        }
        return ['sesion' => $sesion, 'usuario' => $usuario];
    }

    public static function requerir(Peticion $p): array
    {
        return self::deLaPeticion($p) ?? throw new ErrorApi(401, 'sin_sesion');
    }

    public static function cerrar(string $id): void
    {
        Bd::ejecutar('DELETE FROM sesiones WHERE id = ?', [$id]);
    }

    /** Cierra todas las sesiones de la cuenta, menos (si se dice) una. */
    public static function cerrarTodas(string $usuarioId, ?string $menos = null): int
    {
        if ($menos === null) return Bd::ejecutar('DELETE FROM sesiones WHERE usuario_id = ?', [$usuarioId]);
        return Bd::ejecutar('DELETE FROM sesiones WHERE usuario_id = ? AND id <> ?', [$usuarioId, $menos]);
    }

    /** Las sesiones abiertas, para que la persona vea dónde ha entrado (plan, entrada 85). */
    public static function listar(string $usuarioId, string $actual): array
    {
        $filas = Bd::todos(
            'SELECT id, creada, usada, caduca, dispositivo FROM sesiones WHERE usuario_id = ? AND caduca > ? ORDER BY usada DESC',
            [$usuarioId, Tiempo::bd()],
        );
        return array_map(static fn (array $s): array => [
            'id'          => $s['id'],
            'dispositivo' => $s['dispositivo'],
            'creada'      => Tiempo::iso($s['creada']),
            'usada'       => Tiempo::iso($s['usada']),
            'caduca'      => Tiempo::iso($s['caduca']),
            'actual'      => $s['id'] === $actual,
        ], $filas);
    }

    /** Un nombre corto y legible del dispositivo a partir del User-Agent («Chrome en Android»…). */
    public static function dispositivo(string $agente): string
    {
        $agente = (string) preg_replace('/[\p{C}]/u', '', mb_substr($agente, 0, 400, 'UTF-8'));
        $sistemas = ['Android' => 'Android', 'iPhone' => 'iPhone', 'iPad' => 'iPad', 'Windows' => 'Windows',
            'Mac OS X' => 'Mac', 'CrOS' => 'ChromeOS', 'Linux' => 'Linux'];
        $navegadores = ['Edg/' => 'Edge', 'OPR/' => 'Opera', 'Firefox/' => 'Firefox', 'SamsungBrowser/' => 'Samsung Internet',
            'Chrome/' => 'Chrome', 'Safari/' => 'Safari'];
        $sistema = '';
        foreach ($sistemas as $marca => $nombre) if (str_contains($agente, $marca)) { $sistema = $nombre; break; }
        $navegador = '';
        foreach ($navegadores as $marca => $nombre) if (str_contains($agente, $marca)) { $navegador = $nombre; break; }
        if (str_contains($agente, '; wv)')) $navegador = 'App Paglot';
        if ($sistema === '' && $navegador === '') return mb_substr($agente, 0, 120, 'UTF-8');
        return trim($navegador . ($navegador && $sistema ? ' · ' : '') . $sistema);
    }
}
