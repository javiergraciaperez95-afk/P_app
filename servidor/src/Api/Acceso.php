<?php
declare(strict_types=1);

namespace Paglot\Api;

use Paglot\Bd;
use Paglot\Config;
use Paglot\Correo;
use Paglot\ErrorApi;
use Paglot\Eventos;
use Paglot\Google;
use Paglot\Limites;
use Paglot\Peticion;
use Paglot\Respuesta;
use Paglot\Seguridad;
use Paglot\Sesiones;
use Paglot\Tiempo;
use Paglot\Usuarios;
use Paglot\Validar;

/**
 * Entrar sin contraseña: con un código de 6 cifras que llega por correo, o con Google.
 * En los dos casos el correo queda demostrado, así que entrar y crear la cuenta son lo mismo:
 * si no había cuenta, se crea ya confirmada.
 *
 * Igual que en Cuentas: pedir un código responde siempre lo mismo, exista o no la cuenta.
 */
final class Acceso
{
    /** POST /codigo {correo, idioma?} → 202. Manda el código (también si aún no hay cuenta). */
    public static function codigo(Peticion $p): Respuesta
    {
        $p->campos(['correo', 'idioma']);
        Limites::golpe('codigo_ip', $p->ip);
        $correo = Validar::correo($p->texto('correo'));
        $usuario = Usuarios::porCorreo($correo);
        $idioma = $usuario['idioma'] ?? Validar::idioma($p->texto('idioma', false));
        // Pasado el límite no llega otro código, en silencio: la respuesta no cambia.
        if (Limites::golpe('codigo_correo', $correo, false) > 0) return Respuesta::aceptado();

        $codigo = sprintf('%06d', random_int(0, 999999));
        $segundos = (int) Config::ajuste('codigo_duracion');
        $enviado = Correo::enviar($correo, 'codigo', $idioma, [
            'nombre'  => $usuario['nombre'] ?? '',
            'codigo'  => $codigo,
            'minutos' => intdiv($segundos, 60),
        ]);
        // Solo se guarda si de verdad sale el correo: un código que nadie recibe solo serviría para adivinarlo
        // (y quitaría el bueno que la persona está esperando).
        if ($enviado) {
            Bd::ejecutar(
                'REPLACE INTO codigos (correo, huella, intentos, creado, caduca) VALUES (?, ?, 0, ?, ?)',
                [$correo, self::huella($correo, $codigo), Tiempo::bd(), Tiempo::bd($segundos)],
            );
        }
        Eventos::anotar('codigo_pedido', $usuario['id'] ?? null, $p);
        return Respuesta::aceptado();
    }

    /** POST /codigo/entrar {correo, codigo, nombre?, idioma?} → {token, caduca, usuario, nueva} */
    public static function codigoEntrar(Peticion $p): Respuesta
    {
        $p->campos(['correo', 'codigo', 'nombre', 'idioma']);
        Limites::golpe('codigo_entrar_ip', $p->ip);
        $correo = Validar::correo($p->texto('correo'));
        $codigo = (string) preg_replace('/\D/', '', (string) $p->texto('codigo'));   // «482 913» también vale
        $nombre = Validar::nombre($p->texto('nombre', false));
        $idioma = Validar::idioma($p->texto('idioma', false));
        // Fallos por correo, con espera creciente: aunque se prueben códigos desde muchas IP distintas,
        // un mismo correo no admite más de unos pocos intentos por hora (plan, entrada 65).
        Limites::comprobar('codigo_fallo', $correo);

        // El fallo se apunta DENTRO de la transacción y el error se lanza FUERA, para que no se deshaga.
        $valido = strlen($codigo) === 6 && Bd::transaccion(static function () use ($correo, $codigo): bool {
            $fila = Bd::uno('SELECT * FROM codigos WHERE correo = ? FOR UPDATE', [$correo]);
            if ($fila === null || Tiempo::faltan($fila['caduca']) <= 0) return false;
            if (hash_equals($fila['huella'], self::huella($correo, $codigo))) {
                Bd::ejecutar('DELETE FROM codigos WHERE correo = ?', [$correo]);
                return true;
            }
            // Con 5 intentos por código, acertar al azar es 1 entre 200 000; luego hay que pedir otro.
            if ((int) $fila['intentos'] + 1 >= (int) Config::ajuste('codigo_intentos')) {
                Bd::ejecutar('DELETE FROM codigos WHERE correo = ?', [$correo]);
            } else {
                Bd::ejecutar('UPDATE codigos SET intentos = intentos + 1 WHERE correo = ?', [$correo]);
            }
            return false;
        });
        if (!$valido) {
            Limites::golpe('codigo_fallo', $correo, false);
            Eventos::anotar('codigo_fallo', null, $p);
            throw new ErrorApi(400, 'codigo_invalido');
        }

        Limites::reiniciar('codigo_fallo', $correo);
        [$usuario, $nueva] = self::cuentaConCorreo($correo, $nombre, $idioma);
        Eventos::anotar($nueva ? 'registro_codigo' : 'entrar_codigo', $usuario['id'], $p);
        return Respuesta::ok(Sesiones::crear($usuario['id'], $p) + ['usuario' => Usuarios::publico($usuario), 'nueva' => $nueva]);
    }

    /** POST /google {credencial, idioma?} → {token, caduca, usuario, nueva} */
    public static function google(Peticion $p): Respuesta
    {
        $p->campos(['credencial', 'idioma']);
        Limites::golpe('google_ip', $p->ip);
        $datos = Google::verificar((string) $p->texto('credencial'));
        $nombre = Validar::nombre(mb_substr($datos['nombre'], 0, (int) Config::ajuste('nombre_max'), 'UTF-8'));
        $idioma = Validar::idioma($p->texto('idioma', false));

        [$usuario, $nueva] = self::cuentaConCorreo($datos['correo'], $nombre, $idioma, $datos['sub'], $datos['propio']);
        Eventos::anotar($nueva ? 'registro_google' : 'entrar_google', $usuario['id'], $p);
        return Respuesta::ok(Sesiones::crear($usuario['id'], $p) + ['usuario' => Usuarios::publico($usuario), 'nueva' => $nueva]);
    }

    /**
     * POST /yo/google {credencial} (con sesión) → {usuario}. Enlaza Google a la cuenta abierta: después se
     * puede entrar con Google aunque el correo no sea de Gmail. La sesión ya demuestra quién es.
     */
    public static function enlazarGoogle(Peticion $p, array $s): Respuesta
    {
        $p->campos(['credencial']);
        Limites::golpe('google_ip', $p->ip);
        $datos = Google::verificar((string) $p->texto('credencial'));
        $id = $s['usuario']['id'];
        Bd::transaccion(static function () use ($datos, $id): void {
            $otro = Bd::uno('SELECT id FROM usuarios WHERE google_sub = ? FOR UPDATE', [$datos['sub']]);
            if ($otro && $otro['id'] !== $id) throw new ErrorApi(409, 'google_en_uso');
            Bd::ejecutar('UPDATE usuarios SET google_sub = ?, actualizado = ? WHERE id = ?', [$datos['sub'], Tiempo::bd(), $id]);
        });
        Eventos::anotar('google_enlazado', $id, $p);
        return Respuesta::ok(['usuario' => Usuarios::publico(Usuarios::obtener($id))]);
    }

    // -----------------------------------------------------------------------------------------------

    /**
     * La cuenta de un correo ya demostrado (por código o por Google), creándola si no existe.
     * Devuelve [usuario, ¿nueva?].
     *
     * Una cuenta SIN CONFIRMAR con ese correo la pudo crear cualquiera (no hacía falta tener el correo):
     * se confirma, pero se le quita la contraseña, que no la puso el dueño del correo.
     */
    private static function cuentaConCorreo(string $correo, string $nombre, string $idioma, ?string $googleSub = null, bool $correoPropio = true): array
    {
        for ($intento = 0; ; $intento++) {
            try {
                return Bd::transaccion(static function () use ($correo, $nombre, $idioma, $googleSub, $correoPropio): array {
                    $ahora = Tiempo::bd();
                    if ($googleSub !== null) {
                        $porGoogle = Bd::uno('SELECT * FROM usuarios WHERE google_sub = ? FOR UPDATE', [$googleSub]);
                        if ($porGoogle) return [$porGoogle, false];
                    }
                    $u = Bd::uno('SELECT * FROM usuarios WHERE correo = ? FOR UPDATE', [$correo]);
                    if ($u) {
                        // Con Google y un correo que Google no gestiona, no se entra en una cuenta que ya existe:
                        // hay que entrar antes con el código o la contraseña y enlazarla (POST /yo/google).
                        if ($googleSub !== null && !$correoPropio) throw new ErrorApi(409, 'google_enlazar');
                        if ($u['confirmado'] === null) {
                            Bd::ejecutar("UPDATE usuarios SET hash = '', confirmado = ?, actualizado = ? WHERE id = ?", [$ahora, $ahora, $u['id']]);
                            Bd::ejecutar("DELETE FROM tokens WHERE usuario_id = ? AND tipo = 'confirmar'", [$u['id']]);
                        }
                        if ($googleSub !== null && $u['google_sub'] === null) {
                            Bd::ejecutar('UPDATE usuarios SET google_sub = ?, actualizado = ? WHERE id = ?', [$googleSub, $ahora, $u['id']]);
                        }
                        return [Usuarios::obtener($u['id']), false];
                    }
                    $id = Seguridad::uuid();
                    Bd::ejecutar(
                        "INSERT INTO usuarios (id, correo, hash, google_sub, nombre, idioma, confirmado, creado, actualizado) VALUES (?, ?, '', ?, ?, ?, ?, ?, ?)",
                        [$id, $correo, $googleSub, $nombre, $idioma, $ahora, $ahora, $ahora],
                    );
                    return [Usuarios::obtener($id), true];
                });
            } catch (\PDOException $e) {
                // Dos peticiones han creado la misma cuenta a la vez: la segunda la encuentra ya hecha.
                if (($e->errorInfo[1] ?? 0) !== 1062 || $intento >= 2) throw $e;
            }
        }
    }

    /** Huella del código, con el secreto del servidor y atada al correo. */
    private static function huella(string $correo, string $codigo): string
    {
        return Seguridad::hmac('codigo' . "\0" . $correo . "\0" . $codigo);
    }
}
