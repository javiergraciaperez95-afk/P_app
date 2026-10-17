<?php
declare(strict_types=1);

namespace Paglot\Api;

use Paglot\Bd;
use Paglot\Config;
use Paglot\Contrasenas;
use Paglot\Correo;
use Paglot\ErrorApi;
use Paglot\Eventos;
use Paglot\Foto;
use Paglot\Limites;
use Paglot\Peticion;
use Paglot\Progreso;
use Paglot\Respuesta;
use Paglot\Sesiones;
use Paglot\Tiempo;
use Paglot\Usuarios;
use Paglot\Validar;

/**
 * Todo lo que se hace CON sesión. $s = ['sesion' => fila, 'usuario' => fila] (Sesiones::requerir).
 * El usuario sale SIEMPRE del token, nunca de lo que mande la app (plan, entradas 98 y 99).
 */
final class Perfil
{
    /** GET /yo → {usuario} */
    public static function yo(Peticion $p, array $s): Respuesta
    {
        return Respuesta::ok(['usuario' => Usuarios::publico($s['usuario'])]);
    }

    /** PATCH /yo {nombre?, foto?, idioma?} → {usuario}. foto: null la quita. */
    public static function cambiar(Peticion $p, array $s): Respuesta
    {
        $cuerpo = $p->campos(['nombre', 'foto', 'idioma']);
        $cambios = [];
        if (property_exists($cuerpo, 'nombre')) $cambios['nombre'] = Validar::nombre($p->texto('nombre'));
        if (property_exists($cuerpo, 'idioma')) {
            $idioma = $p->texto('idioma');
            if (!in_array($idioma, Config::IDIOMAS, true)) throw ErrorApi::datos('idioma');
            $cambios['idioma'] = $idioma;
        }
        if (property_exists($cuerpo, 'foto')) {
            if ($cuerpo->foto === null) $cambios['foto'] = null;
            elseif (is_string($cuerpo->foto)) $cambios['foto'] = Foto::procesar($cuerpo->foto);
            else throw ErrorApi::datos('foto', 'tipo');
        }
        if ($cambios === []) throw ErrorApi::datos('cuerpo', 'vacio');

        $sets = [];
        $valores = [];
        foreach ($cambios as $columna => $valor) {   // las columnas salen de la lista de arriba, nunca de la petición
            $sets[] = "{$columna} = ?";
            $valores[] = $valor;
        }
        $valores[] = Tiempo::bd();
        $valores[] = $s['usuario']['id'];
        Bd::ejecutar('UPDATE usuarios SET ' . implode(', ', $sets) . ', actualizado = ? WHERE id = ?', $valores);
        return Respuesta::ok(['usuario' => Usuarios::publico(Usuarios::obtener($s['usuario']['id']))]);
    }

    /** POST /yo/contrasena {actual, nueva} → cierra las demás sesiones (plan, entradas 73 y 78). */
    public static function contrasena(Peticion $p, array $s): Respuesta
    {
        $p->campos(['actual', 'nueva']);
        $u = $s['usuario'];
        // Sin contraseña (cuenta de código o de Google) se pone la primera: basta la sesión.
        $actual = (string) $p->texto('actual', $u['hash'] !== '');
        $nueva = (string) $p->texto('nueva');
        self::verificar($p, $u, $actual);
        if ($u['hash'] !== '' && Validar::nfc($nueva) === Validar::nfc($actual)) throw new ErrorApi(400, 'contrasena_igual');
        Contrasenas::validarNueva($nueva, $u['correo']);
        $huella = Contrasenas::huella($nueva);

        Bd::transaccion(static function () use ($u, $huella, $s): void {
            Bd::ejecutar('UPDATE usuarios SET hash = ?, actualizado = ? WHERE id = ?', [$huella, Tiempo::bd(), $u['id']]);
            Bd::ejecutar("DELETE FROM tokens WHERE usuario_id = ? AND tipo = 'recuperar' AND usado IS NULL", [$u['id']]);
            Sesiones::cerrarTodas($u['id'], $s['sesion']['id']);
        });
        Correo::enviar($u['correo'], 'contrasena_cambiada', $u['idioma'], ['nombre' => $u['nombre']]);
        Eventos::anotar('contrasena_cambiada', $u['id'], $p);
        return Respuesta::ok();
    }

    /**
     * POST /yo/correo {contrasena, nuevo} → 202. Manda el enlace al correo nuevo y avisa al antiguo
     * (plan, entrada 74). Si el nuevo ya tiene cuenta, no se manda nada (y la respuesta es la misma).
     */
    public static function correo(Peticion $p, array $s): Respuesta
    {
        $p->campos(['contrasena', 'nuevo']);
        $u = $s['usuario'];
        self::verificar($p, $u, (string) $p->texto('contrasena'));
        $nuevo = Validar::correo($p->texto('nuevo'));
        if ($nuevo === $u['correo']) throw new ErrorApi(400, 'correo_igual');
        if (!Usuarios::porCorreo($nuevo)) {
            $token = Cuentas::crearToken($u['id'], 'correo', (int) Config::ajuste('token_correo'), $nuevo);
            Correo::enviar($nuevo, 'correo_nuevo', $u['idioma'], [
                'nombre' => $u['nombre'],
                'enlace' => Correo::enlace('correo', $token),
                'horas'  => intdiv((int) Config::ajuste('token_correo'), 3600),
            ]);
            Correo::enviar($u['correo'], 'correo_aviso', $u['idioma'], ['nombre' => $u['nombre'], 'correo' => Cuentas::ocultar($nuevo)]);
        }
        Eventos::anotar('correo_pedido', $u['id'], $p);
        return Respuesta::aceptado();
    }

    /** DELETE /yo {contrasena} → borra la cuenta y todo lo suyo (plan, entradas 107 y 192). */
    public static function borrar(Peticion $p, array $s): Respuesta
    {
        $p->campos(['contrasena']);
        $u = $s['usuario'];
        self::verificar($p, $u, (string) $p->texto('contrasena'));
        Bd::ejecutar('DELETE FROM usuarios WHERE id = ?', [$u['id']]);   // sesiones, enlaces y progreso se van en cascada
        Correo::enviar($u['correo'], 'cuenta_borrada', $u['idioma'], ['nombre' => $u['nombre']]);
        Eventos::anotar('cuenta_borrada', $u['id'], $p);
        return Respuesta::ok();
    }

    /** GET /yo/exportar → todo lo que hay guardado de la cuenta (plan, entrada 191). */
    public static function exportar(Peticion $p, array $s): Respuesta
    {
        $u = $s['usuario'];
        return Respuesta::ok([
            'exportado' => Tiempo::iso(Tiempo::bd()),
            'usuario'   => Usuarios::publico($u) + ['ultimo_acceso' => Tiempo::iso($u['ultimo_acceso'])],
            'sesiones'  => Sesiones::listar($u['id'], $s['sesion']['id']),
            'progreso'  => (object) Progreso::todos($u['id']),
        ]);
    }

    /** GET /sesiones → {sesiones} */
    public static function sesiones(Peticion $p, array $s): Respuesta
    {
        return Respuesta::ok(['sesiones' => Sesiones::listar($s['usuario']['id'], $s['sesion']['id'])]);
    }

    /** DELETE /sesiones/{id} → cierra esa sesión (solo si es de esta cuenta). */
    public static function cerrarSesion(Peticion $p, array $s): Respuesta
    {
        $id = (string) ($p->parametros['id'] ?? '');
        $borradas = Bd::ejecutar('DELETE FROM sesiones WHERE id = ? AND usuario_id = ?', [$id, $s['usuario']['id']]);
        if ($borradas === 0) throw new ErrorApi(404, 'no_encontrado');
        return Respuesta::ok();
    }

    /** POST /salir → cierra esta sesión (plan, entrada 77). */
    public static function salir(Peticion $p, array $s): Respuesta
    {
        Sesiones::cerrar($s['sesion']['id']);
        Eventos::anotar('salir', $s['usuario']['id'], $p);
        return Respuesta::ok();
    }

    /** POST /salir/todas → cierra todas las sesiones, esta también (plan, entrada 79). */
    public static function salirTodas(Peticion $p, array $s): Respuesta
    {
        Sesiones::cerrarTodas($s['usuario']['id']);
        Eventos::anotar('salir_todas', $s['usuario']['id'], $p);
        return Respuesta::ok();
    }

    /** GET /progreso/{curso} → {datos|null, version, actualizado} */
    public static function leerProgreso(Peticion $p, array $s): Respuesta
    {
        $curso = Validar::curso((string) $p->parametros['curso']);
        return Respuesta::ok(Progreso::obtener($s['usuario']['id'], $curso));
    }

    /** PUT /progreso/{curso} {datos, version} → {version, actualizado} o 409 {error: conflicto, datos, version} */
    public static function guardarProgreso(Peticion $p, array $s): Respuesta
    {
        $curso = Validar::curso((string) $p->parametros['curso']);
        $cuerpo = $p->campos(['datos', 'version']);
        Limites::golpe('guardar', $s['usuario']['id'] . ':' . $curso);
        return Respuesta::ok(Progreso::guardar($s['usuario']['id'], $curso, $cuerpo->datos ?? null, $cuerpo->version ?? null));
    }

    /** DELETE /progreso/{curso} {contrasena} → borra la copia de la nube de ese curso. */
    public static function borrarProgreso(Peticion $p, array $s): Respuesta
    {
        $curso = Validar::curso((string) $p->parametros['curso']);
        $p->campos(['contrasena']);
        self::verificar($p, $s['usuario'], (string) $p->texto('contrasena'));
        Progreso::borrar($s['usuario']['id'], $curso);
        Eventos::anotar('progreso_borrado', $s['usuario']['id'], $p, ['curso' => $curso]);
        return Respuesta::ok();
    }

    /**
     * Pide la contraseña actual antes de algo serio. Con límite de fallos por persona: quien coja
     * un móvil desbloqueado no puede probar contraseñas sin fin. Fallo = 403 (no 401: la sesión sigue).
     */
    private static function verificar(Peticion $p, array $u, string $contrasena): void
    {
        // Las cuentas sin contraseña (código o Google) no tienen nada que comprobar: basta la sesión.
        if ($u['hash'] === '') return;
        Limites::comprobar('contrasena_usuario', $u['id']);
        $resultado = strlen($contrasena) > 4096 ? false : Contrasenas::comprobar($contrasena, $u['hash']);
        if ($resultado === false) {
            Limites::golpe('contrasena_usuario', $u['id'], false);
            Eventos::anotar('contrasena_fallo', $u['id'], $p);
            throw new ErrorApi(403, 'contrasena_incorrecta');
        }
        if (is_string($resultado)) Usuarios::cambiarHuella($u['id'], $resultado);
        Limites::reiniciar('contrasena_usuario', $u['id']);
    }
}
