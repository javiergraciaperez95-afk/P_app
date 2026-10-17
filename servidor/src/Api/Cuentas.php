<?php
declare(strict_types=1);

namespace Paglot\Api;

use Paglot\Bd;
use Paglot\Config;
use Paglot\Contrasenas;
use Paglot\Correo;
use Paglot\ErrorApi;
use Paglot\Eventos;
use Paglot\Limites;
use Paglot\Peticion;
use Paglot\Respuesta;
use Paglot\Seguridad;
use Paglot\Sesiones;
use Paglot\Tiempo;
use Paglot\Usuarios;
use Paglot\Validar;

/**
 * Crear la cuenta, confirmarla, entrar y recuperar la contraseña: todo lo que se hace SIN sesión.
 *
 * Regla de oro (plan, entradas 68–70 y 89): las respuestas no dicen si un correo tiene cuenta.
 * Registrarse o pedir un enlace responde siempre lo mismo; lo que cambia es el correo que llega.
 */
final class Cuentas
{
    /** POST /registro {correo, contrasena, nombre?, idioma?} → 202 */
    public static function registro(Peticion $p): Respuesta
    {
        $p->campos(['correo', 'contrasena', 'nombre', 'idioma']);
        Limites::golpe('registro_ip', $p->ip);
        $correo = Validar::correo($p->texto('correo'));
        $contrasena = (string) $p->texto('contrasena');
        $nombre = Validar::nombre($p->texto('nombre', false));
        $idioma = Validar::idioma($p->texto('idioma', false));
        Contrasenas::validarNueva($contrasena, $correo);
        $huella = Contrasenas::huella($contrasena);   // se calcula siempre: tarda lo mismo exista o no la cuenta

        $existente = Usuarios::porCorreo($correo);
        if ($existente && $existente['confirmado'] !== null) {
            Correo::enviar($correo, 'ya_registrado', $existente['idioma'], ['nombre' => $existente['nombre']]);
            Eventos::anotar('registro_repetido', $existente['id'], $p);
            return Respuesta::aceptado();
        }

        $ahora = Tiempo::bd();
        if ($existente) {
            // Cuenta sin confirmar: gana el último registro, y los enlaces anteriores dejan de valer
            // (van atados a la contraseña con la que se pidieron).
            $id = $existente['id'];
            Bd::ejecutar(
                'UPDATE usuarios SET hash = ?, nombre = ?, idioma = ?, actualizado = ? WHERE id = ? AND confirmado IS NULL',
                [$huella, $nombre, $idioma, $ahora, $id],
            );
        } else {
            $id = Seguridad::uuid();
            try {
                Bd::ejecutar(
                    'INSERT INTO usuarios (id, correo, hash, nombre, idioma, creado, actualizado) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [$id, $correo, $huella, $nombre, $idioma, $ahora, $ahora],
                );
            } catch (\PDOException $e) {
                if (($e->errorInfo[1] ?? 0) !== 1062) throw $e;
                return Respuesta::aceptado();   // otra petición lo acaba de registrar a la vez
            }
        }

        $token = self::crearToken($id, 'confirmar', (int) Config::ajuste('token_confirmar'), Usuarios::marcaContrasena($huella));
        Correo::enviar($correo, 'confirmar', $idioma, [
            'nombre' => $nombre,
            'enlace' => Correo::enlace('confirmar', $token),
            'horas'  => intdiv((int) Config::ajuste('token_confirmar'), 3600),
        ]);
        Eventos::anotar('registro', $id, $p);
        return Respuesta::aceptado();
    }

    /** POST /confirmar {token} → abre sesión: {token, caduca, usuario} */
    public static function confirmar(Peticion $p): Respuesta
    {
        $p->campos(['token']);
        Limites::golpe('token_ip', $p->ip);
        $token = Validar::tokenEnlace($p->texto('token'));

        $usuario = Bd::transaccion(static function () use ($token): array {
            $fila = self::tokenVigente($token, 'confirmar');
            $usuario = Usuarios::porId($fila['usuario_id']);
            if (!$usuario || !hash_equals((string) $fila['dato'], Usuarios::marcaContrasena($usuario['hash']))) {
                throw new ErrorApi(400, 'enlace_invalido');
            }
            Bd::ejecutar('UPDATE tokens SET usado = ? WHERE token_hash = ?', [Tiempo::bd(), $fila['token_hash']]);
            Bd::ejecutar('UPDATE usuarios SET confirmado = COALESCE(confirmado, ?), actualizado = ? WHERE id = ?', [Tiempo::bd(), Tiempo::bd(), $usuario['id']]);
            return Usuarios::obtener($usuario['id']);
        });

        Eventos::anotar('confirmado', $usuario['id'], $p);
        return Respuesta::ok(Sesiones::crear($usuario['id'], $p) + ['usuario' => Usuarios::publico($usuario)]);
    }

    /** POST /confirmar/reenviar {correo} → 202 */
    public static function reenviar(Peticion $p): Respuesta
    {
        $p->campos(['correo']);
        Limites::golpe('recuperar_ip', $p->ip);
        $correo = Validar::correo($p->texto('correo'));
        $usuario = Usuarios::porCorreo($correo);
        if ($usuario && $usuario['confirmado'] === null) {
            $token = self::crearToken($usuario['id'], 'confirmar', (int) Config::ajuste('token_confirmar'), Usuarios::marcaContrasena($usuario['hash']));
            Correo::enviar($correo, 'confirmar', $usuario['idioma'], [
                'nombre' => $usuario['nombre'],
                'enlace' => Correo::enlace('confirmar', $token),
                'horas'  => intdiv((int) Config::ajuste('token_confirmar'), 3600),
            ]);
        }
        return Respuesta::aceptado();
    }

    /** POST /entrar {correo, contrasena} → {token, caduca, usuario} */
    public static function entrar(Peticion $p): Respuesta
    {
        $p->campos(['correo', 'contrasena']);
        Limites::golpe('entrar_ip', $p->ip);
        $correo = Validar::correo($p->texto('correo'));
        $contrasena = (string) $p->texto('contrasena');
        Limites::comprobar('entrar_correo', $correo);

        $usuario = Usuarios::porCorreo($correo);
        $resultado = false;
        if ($usuario === null || strlen($contrasena) > 4096) {
            Contrasenas::perderTiempo($contrasena);
        } else {
            $resultado = Contrasenas::comprobar($contrasena, $usuario['hash']);
        }
        if ($resultado === false) {
            Limites::golpe('entrar_correo', $correo, false);
            Eventos::anotar('entrar_fallo', $usuario['id'] ?? null, $p);
            throw new ErrorApi(401, 'credenciales');
        }
        if (is_string($resultado)) Usuarios::cambiarHuella($usuario['id'], $resultado);
        // Solo se dice «sin confirmar» a quien ha acertado la contraseña: no revela nada a nadie más.
        if ($usuario['confirmado'] === null) throw new ErrorApi(403, 'sin_confirmar');

        Limites::reiniciar('entrar_correo', $correo);
        Eventos::anotar('entrar', $usuario['id'], $p);
        return Respuesta::ok(Sesiones::crear($usuario['id'], $p) + ['usuario' => Usuarios::publico(Usuarios::obtener($usuario['id']))]);
    }

    /** POST /recuperar {correo} → 202 */
    public static function recuperar(Peticion $p): Respuesta
    {
        $p->campos(['correo']);
        Limites::golpe('recuperar_ip', $p->ip);
        $correo = Validar::correo($p->texto('correo'));
        $usuario = Usuarios::porCorreo($correo);
        if ($usuario) {
            $token = self::crearToken($usuario['id'], 'recuperar', (int) Config::ajuste('token_recuperar'));
            Correo::enviar($correo, 'recuperar', $usuario['idioma'], [
                'nombre'  => $usuario['nombre'],
                'enlace'  => Correo::enlace('recuperar', $token),
                'minutos' => intdiv((int) Config::ajuste('token_recuperar'), 60),
            ]);
            Eventos::anotar('recuperar_pedido', $usuario['id'], $p);
        }
        return Respuesta::aceptado();
    }

    /**
     * POST /recuperar/nueva {token, contrasena} → abre sesión: {token, caduca, usuario}
     * Cierra todas las demás sesiones (plan, entrada 78). Si la cuenta no estaba confirmada, queda
     * confirmada: quien abre el enlace demuestra que el correo es suyo.
     */
    public static function nuevaContrasena(Peticion $p): Respuesta
    {
        $p->campos(['token', 'contrasena']);
        Limites::golpe('token_ip', $p->ip);
        $token = Validar::tokenEnlace($p->texto('token'));
        $contrasena = (string) $p->texto('contrasena');

        // Primero se comprueba la contraseña nueva: una contraseña débil no gasta el enlace.
        $previo = self::tokenVigente($token, 'recuperar', false);
        $usuario = Usuarios::porId($previo['usuario_id']) ?? throw new ErrorApi(400, 'enlace_invalido');
        Contrasenas::validarNueva($contrasena, $usuario['correo']);
        $huella = Contrasenas::huella($contrasena);

        Bd::transaccion(static function () use ($token, $usuario, $huella): void {
            $fila = self::tokenVigente($token, 'recuperar');
            $ahora = Tiempo::bd();
            Bd::ejecutar('UPDATE tokens SET usado = ? WHERE token_hash = ?', [$ahora, $fila['token_hash']]);
            Bd::ejecutar(
                'UPDATE usuarios SET hash = ?, confirmado = COALESCE(confirmado, ?), actualizado = ? WHERE id = ?',
                [$huella, $ahora, $ahora, $usuario['id']],
            );
            Bd::ejecutar("DELETE FROM tokens WHERE usuario_id = ? AND tipo IN ('recuperar', 'confirmar') AND usado IS NULL", [$usuario['id']]);
            Sesiones::cerrarTodas($usuario['id']);
        });

        Limites::reiniciar('entrar_correo', $usuario['correo']);
        Correo::enviar($usuario['correo'], 'contrasena_cambiada', $usuario['idioma'], ['nombre' => $usuario['nombre']]);
        Eventos::anotar('contrasena_recuperada', $usuario['id'], $p);
        $usuario = Usuarios::obtener($usuario['id']);
        return Respuesta::ok(Sesiones::crear($usuario['id'], $p) + ['usuario' => Usuarios::publico($usuario)]);
    }

    /** POST /yo/correo/confirmar {token} → {usuario}. No hace falta sesión: el enlace basta. */
    public static function confirmarCorreo(Peticion $p): Respuesta
    {
        $p->campos(['token']);
        Limites::golpe('token_ip', $p->ip);
        $token = Validar::tokenEnlace($p->texto('token'));

        [$antes, $despues] = Bd::transaccion(static function () use ($token): array {
            $fila = self::tokenVigente($token, 'correo');
            $antes = Usuarios::porId($fila['usuario_id']) ?? throw new ErrorApi(400, 'enlace_invalido');
            $nuevo = (string) $fila['dato'];
            if (Usuarios::porCorreo($nuevo)) throw new ErrorApi(409, 'correo_en_uso');
            $ahora = Tiempo::bd();
            try {
                Bd::ejecutar('UPDATE usuarios SET correo = ?, actualizado = ? WHERE id = ?', [$nuevo, $ahora, $antes['id']]);
            } catch (\PDOException $e) {
                if (($e->errorInfo[1] ?? 0) === 1062) throw new ErrorApi(409, 'correo_en_uso');
                throw $e;
            }
            Bd::ejecutar('UPDATE tokens SET usado = ? WHERE token_hash = ?', [$ahora, $fila['token_hash']]);
            Bd::ejecutar("DELETE FROM tokens WHERE usuario_id = ? AND tipo = 'correo' AND usado IS NULL", [$antes['id']]);
            return [$antes, Usuarios::obtener($antes['id'])];
        });

        Correo::enviar($antes['correo'], 'correo_cambiado', $antes['idioma'], ['nombre' => $antes['nombre'], 'correo' => self::ocultar($despues['correo'])]);
        Eventos::anotar('correo_cambiado', $antes['id'], $p);
        return Respuesta::ok(['usuario' => Usuarios::publico($despues)]);
    }

    // -----------------------------------------------------------------------------------------------

    /**
     * Crea un enlace de un solo uso. Los anteriores del mismo tipo sin usar dejan de valer:
     * solo vale el último que se ha pedido.
     */
    public static function crearToken(string $usuarioId, string $tipo, int $segundos, ?string $dato = null): string
    {
        $token = Seguridad::token();
        Bd::transaccion(static function () use ($token, $usuarioId, $tipo, $segundos, $dato): void {
            Bd::ejecutar('DELETE FROM tokens WHERE usuario_id = ? AND tipo = ? AND usado IS NULL', [$usuarioId, $tipo]);
            Bd::ejecutar(
                'INSERT INTO tokens (token_hash, usuario_id, tipo, dato, creado, caduca) VALUES (?, ?, ?, ?, ?, ?)',
                [Seguridad::huella($token), $usuarioId, $tipo, $dato, Tiempo::bd(), Tiempo::bd($segundos)],
            );
        });
        return $token;
    }

    /** La fila del enlace si vale (sin usar, sin caducar y del tipo esperado); si no, «enlace_invalido». */
    private static function tokenVigente(string $token, string $tipo, bool $bloquear = true): array
    {
        $fila = Bd::uno(
            'SELECT * FROM tokens WHERE token_hash = ? AND tipo = ? AND usado IS NULL AND caduca > ?' . ($bloquear ? ' FOR UPDATE' : ''),
            [Seguridad::huella($token), $tipo, Tiempo::bd()],
        );
        return $fila ?? throw new ErrorApi(400, 'enlace_invalido');
    }

    /** «ana.garcia@gmail.com» → «a***@gmail.com»: para avisar sin enseñar la dirección entera. */
    public static function ocultar(string $correo): string
    {
        [$local, $dominio] = array_pad(explode('@', $correo, 2), 2, '');
        return mb_substr($local, 0, 1, 'UTF-8') . '***@' . $dominio;
    }
}
