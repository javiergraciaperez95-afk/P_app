<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Atiende una petición de principio a fin: CORS, la ruta y los errores.
 * Cualquier fallo inesperado se apunta en el registro y la app recibe un 500 sin detalles (plan, entradas 37 y 130).
 */
final class Api
{
    public static function atender(Peticion $p): Respuesta
    {
        try {
            $cors = self::cors($p);
            if ($p->metodo === 'OPTIONS') {
                $respuesta = Respuesta::vacia(204);
            } else {
                $respuesta = Rutas::atender($p);
            }
        } catch (ErrorApi $e) {
            $cors ??= [];
            Correo::descartar();   // si algo ha fallado, no sale ningún correo a medias
            $respuesta = Respuesta::deError($e);
        } catch (\Throwable $e) {
            $cors ??= [];
            Correo::descartar();
            self::apuntarError($e, $p);
            $respuesta = new Respuesta(500, ['error' => 'interno']);
        }
        $respuesta->cabeceras += $cors;
        return $respuesta;
    }

    /**
     * CORS con lista cerrada (plan, entradas 122–125). Sin «*» y sin reflejar cualquier origen.
     * Una petición de un navegador desde otra web se rechaza antes de hacer nada.
     * Sin cabecera Origin (curl, la vigilancia) no hay CORS que aplicar.
     */
    private static function cors(Peticion $p): array
    {
        if ($p->origen === null) return [];
        if (!in_array($p->origen, (array) Config::get('origenes', []), true)) throw new ErrorApi(403, 'origen');
        $cabeceras = [
            'Access-Control-Allow-Origin' => $p->origen,
            'Vary'                        => 'Origin',
            'Access-Control-Expose-Headers' => 'Retry-After',
        ];
        if ($p->metodo === 'OPTIONS') {
            $cabeceras += [
                'Access-Control-Allow-Methods' => Rutas::METODOS,
                'Access-Control-Allow-Headers' => 'Authorization, Content-Type',
                'Access-Control-Max-Age'       => '600',
            ];
        }
        return $cabeceras;
    }

    private static function apuntarError(\Throwable $e, Peticion $p): void
    {
        // Ni el cuerpo de la petición ni las cabeceras: podrían llevar contraseñas o tokens (plan, entrada 169).
        // La traza se escribe a mano, SIN los argumentos de cada llamada: si PHP los incluyera
        // (zend.exception_ignore_args desactivado), saldría p. ej. la contraseña de la base al conectar.
        $traza = '';
        foreach ($e->getTrace() as $i => $paso) {
            $traza .= sprintf("#%d %s:%s %s%s%s()\n", $i, $paso['file'] ?? '?', $paso['line'] ?? '?', $paso['class'] ?? '', $paso['type'] ?? '', $paso['function']);
        }
        $texto = sprintf(
            "[%s] %s %s · %s: %s en %s:%d\n%s",
            Tiempo::ahora()->format('Y-m-d H:i:s'),
            $p->metodo,
            $p->ruta,
            $e::class,
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $traza,
        );
        $archivo = (string) Config::get('registro_errores', '');
        if ($archivo !== '' && (is_dir(dirname($archivo)) || @mkdir(dirname($archivo), 0700, true))) {
            @file_put_contents($archivo, $texto, FILE_APPEND | LOCK_EX);
        } else {
            error_log($texto);
        }
    }
}
