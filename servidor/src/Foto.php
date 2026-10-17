<?php
declare(strict_types=1);

namespace Paglot;

/**
 * La foto de perfil (plan, entradas 140–143). Llega como «data:image/…;base64,…» y NUNCA se guarda tal cual:
 * se comprueba qué es de verdad, se vuelve a dibujar con GD en un cuadrado pequeño y se guarda como JPEG.
 * Así no puede llevar código dentro (SVG, archivos disfrazados) ni datos de ubicación (EXIF).
 */
final class Foto
{
    private const TIPOS = [IMAGETYPE_JPEG => 'jpeg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];

    /** Devuelve el JPEG nuevo (bytes). Lanza «foto_invalida» o «demasiado_grande». */
    public static function procesar(string $dataUrl): string
    {
        if (!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$#D', $dataUrl, $m)) {
            throw new ErrorApi(400, 'foto_invalida');
        }
        if (strlen($m[2]) > (int) (Config::ajuste('foto_max') * 4 / 3) + 4) throw new ErrorApi(413, 'demasiado_grande');
        $bytes = base64_decode($m[2], true);
        if ($bytes === false || $bytes === '') throw new ErrorApi(400, 'foto_invalida');
        if (strlen($bytes) > (int) Config::ajuste('foto_max')) throw new ErrorApi(413, 'demasiado_grande');

        // Primero se mira la cabecera de la imagen, sin descomprimirla.
        $info = @getimagesizefromstring($bytes);
        if ($info === false || !isset(self::TIPOS[$info[2]])) throw new ErrorApi(400, 'foto_invalida');
        [$ancho, $alto] = $info;
        $maxPx = (int) Config::ajuste('foto_max_px');
        if ($ancho < 1 || $alto < 1 || $ancho > $maxPx || $alto > $maxPx) throw new ErrorApi(400, 'foto_invalida');

        $original = self::abrir($bytes);
        $lado = min($ancho, $alto);
        $destino = max(1, (int) Config::ajuste('foto_lado'));
        $nueva = imagecreatetruecolor($destino, $destino);
        // Fondo blanco: las PNG/WebP con transparencia no se ven negras al pasarlas a JPEG.
        $blanco = imagecolorallocate($nueva, 255, 255, 255);
        if ($blanco === false) throw new \RuntimeException('GD no puede reservar el color blanco');
        imagefill($nueva, 0, 0, $blanco);
        imagecopyresampled($nueva, $original, 0, 0, intdiv($ancho - $lado, 2), intdiv($alto - $lado, 2), $destino, $destino, $lado, $lado);

        ob_start();
        imagejpeg($nueva, null, 85);
        $jpeg = (string) ob_get_clean();
        if ($jpeg === '') throw new \RuntimeException('GD no ha generado la foto');
        return $jpeg;
    }

    public static function aUrl(string $jpeg): string
    {
        return 'data:image/jpeg;base64,' . base64_encode($jpeg);
    }

    private static function abrir(string $bytes): \GdImage
    {
        // GD avisa con warnings ante imágenes rotas: se convierten en «foto_invalida», no en un 500.
        set_error_handler(static fn (): bool => true);
        try {
            $imagen = imagecreatefromstring($bytes);
        } finally {
            restore_error_handler();
        }
        if (!$imagen instanceof \GdImage) throw new ErrorApi(400, 'foto_invalida');
        return $imagen;
    }
}
