<?php
declare(strict_types=1);

namespace Paglot;

use Paglot\Api\Acceso;
use Paglot\Api\Cuentas;
use Paglot\Api\Perfil;

/**
 * Todas las rutas de la API, en una sola tabla. Todo cuelga de /api/v1 (plan, entrada 132):
 * si un día cambia la forma, se hace /api/v2 y las APK antiguas siguen funcionando.
 */
final class Rutas
{
    public const PREFIJO = '/api/v1';

    /** [método, ruta (con {parámetros}), función, ¿necesita sesión?] */
    private static function tabla(): array
    {
        return [
            ['GET',    '/salud',               [self::class, 'salud'],              false],
            ['POST',   '/registro',            [Cuentas::class, 'registro'],        false],
            ['POST',   '/confirmar',           [Cuentas::class, 'confirmar'],       false],
            ['POST',   '/confirmar/reenviar',  [Cuentas::class, 'reenviar'],        false],
            ['POST',   '/entrar',              [Cuentas::class, 'entrar'],          false],
            ['POST',   '/recuperar',           [Cuentas::class, 'recuperar'],       false],
            ['POST',   '/recuperar/nueva',     [Cuentas::class, 'nuevaContrasena'], false],
            ['POST',   '/yo/correo/confirmar', [Cuentas::class, 'confirmarCorreo'], false],
            ['POST',   '/codigo',              [Acceso::class, 'codigo'],           false],
            ['POST',   '/codigo/entrar',       [Acceso::class, 'codigoEntrar'],     false],
            ['POST',   '/google',              [Acceso::class, 'google'],           false],

            ['GET',    '/yo',                  [Perfil::class, 'yo'],               true],
            ['PATCH',  '/yo',                  [Perfil::class, 'cambiar'],          true],
            ['DELETE', '/yo',                  [Perfil::class, 'borrar'],           true],
            ['POST',   '/yo/contrasena',       [Perfil::class, 'contrasena'],       true],
            ['POST',   '/yo/correo',           [Perfil::class, 'correo'],           true],
            ['POST',   '/yo/google',           [Acceso::class, 'enlazarGoogle'],    true],
            ['GET',    '/yo/exportar',         [Perfil::class, 'exportar'],         true],
            ['GET',    '/sesiones',            [Perfil::class, 'sesiones'],         true],
            ['DELETE', '/sesiones/{id}',       [Perfil::class, 'cerrarSesion'],     true],
            ['POST',   '/salir',               [Perfil::class, 'salir'],            true],
            ['POST',   '/salir/todas',         [Perfil::class, 'salirTodas'],       true],
            ['GET',    '/progreso/{curso}',    [Perfil::class, 'leerProgreso'],     true],
            ['PUT',    '/progreso/{curso}',    [Perfil::class, 'guardarProgreso'],  true],
            ['DELETE', '/progreso/{curso}',    [Perfil::class, 'borrarProgreso'],   true],
        ];
    }

    /** Lo que puede valer cada parámetro de ruta. Nada fuera de esto llega a ninguna función. */
    private const PARAMETROS = [
        'id'    => '[A-Za-z0-9_-]{22}',
        'curso' => '[a-z]{2,3}',
    ];

    public const METODOS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';

    public static function atender(Peticion $p): Respuesta
    {
        if (!str_starts_with($p->ruta, self::PREFIJO . '/')) throw new ErrorApi(404, 'no_encontrado');
        $ruta = substr($p->ruta, strlen(self::PREFIJO));

        $permitidos = [];
        foreach (self::tabla() as [$metodo, $patron, $funcion, $conSesion]) {
            $regex = '#^' . preg_replace_callback('/\{(\w+)\}/', static fn (array $m): string => '(?P<' . $m[1] . '>' . self::PARAMETROS[$m[1]] . ')', $patron) . '$#D';
            if (!preg_match($regex, $ruta, $coincidencias)) continue;
            if ($metodo !== $p->metodo) { $permitidos[] = $metodo; continue; }

            $p->parametros = array_filter($coincidencias, 'is_string', ARRAY_FILTER_USE_KEY);
            if (!$conSesion) {
                try {
                    Limites::golpe('ip', $p->ip);
                } catch (\PDOException $e) {
                    // Sin base de datos no se puede contar; /salud sigue igualmente para poder avisar (503).
                    if ($patron !== '/salud') throw $e;
                }
                return $funcion($p);
            }
            $sesion = Sesiones::deLaPeticion($p);
            if ($sesion === null) {
                Limites::golpe('ip', $p->ip);   // probar tokens al azar también cuenta
                throw new ErrorApi(401, 'sin_sesion');
            }
            Limites::golpe('usuario', $sesion['usuario']['id']);
            return $funcion($p, $sesion);
        }
        if ($permitidos !== []) {
            throw new ErrorApi(405, 'metodo', [], ['Allow' => implode(', ', array_unique($permitidos))]);
        }
        throw new ErrorApi(404, 'no_encontrado');
    }

    /** GET /salud: para la vigilancia externa (plan, entrada 171). Comprueba que la base responde. */
    public static function salud(Peticion $p): Respuesta
    {
        try {
            Bd::uno('SELECT 1 AS ok');
        } catch (\Throwable $e) {
            error_log('Salud: la base de datos no responde: ' . $e->getMessage());
            throw new ErrorApi(503, 'sin_base_de_datos');
        }
        return Respuesta::ok(['ok' => true, 'api' => 1, 'app_minima' => (string) Config::get('app_minima', '1.0.0'), 'hora' => Tiempo::iso(Tiempo::bd())]);
    }
}
