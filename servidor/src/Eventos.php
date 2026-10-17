<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Apunta lo importante (plan, entradas 168–175): entradas, fallos, cambios de contraseña o correo,
 * borrados… NUNCA contraseñas, tokens ni el contenido del progreso.
 * Si falla al apuntar, no rompe la petición: lo deja en el registro de errores.
 */
final class Eventos
{
    public static function anotar(string $tipo, ?string $usuarioId, Peticion $p, array $detalle = []): void
    {
        try {
            $texto = $detalle === [] ? '' : json_encode($detalle, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            Bd::ejecutar(
                'INSERT INTO eventos (fecha, tipo, usuario_id, ip, detalle) VALUES (?, ?, ?, ?, ?)',
                [Tiempo::bd(), $tipo, $usuarioId, $p->ip, mb_substr($texto, 0, 500, 'UTF-8')],
            );
        } catch (\Throwable $e) {
            error_log('No se pudo anotar el evento ' . $tipo . ': ' . $e->getMessage());
        }
    }
}
