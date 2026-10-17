<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Comprobaciones de lo que llega de fuera. Todas se repiten aquí aunque la app ya las haga
 * (plan, entrada 121): la app se puede trucar.
 */
final class Validar
{
    /** Correo normalizado (NFC, minúsculas, sin espacios). Lanza «correo_invalido». */
    public static function correo(?string $correo): string
    {
        if ($correo === null) throw ErrorApi::datos('correo', 'falta');
        $correo = trim(self::nfc($correo));
        $correo = mb_strtolower($correo, 'UTF-8');
        if ($correo === ''
            || strlen($correo) > 254
            || preg_match('/[\s\p{C}]/u', $correo)          // ni espacios ni caracteres de control (plan, entrada 111)
            || filter_var($correo, FILTER_VALIDATE_EMAIL, FILTER_FLAG_EMAIL_UNICODE) === false
        ) {
            throw new ErrorApi(400, 'correo_invalido');
        }
        return $correo;
    }

    /**
     * Nombre para mostrar: sin caracteres de control ni invisibles (salvo el que une emojis),
     * espacios juntados y como mucho «nombre_max» caracteres (plan, entradas 113 y 114).
     * Se guarda como texto: la app lo pinta siempre con textContent.
     */
    public static function nombre(?string $nombre): string
    {
        if ($nombre === null) return '';
        $nombre = self::nfc($nombre);
        // Primero los espacios de cualquier tipo (tabulador, salto de línea…) pasan a ser un espacio normal;
        // después se quitan los caracteres de control e invisibles que queden.
        $nombre = (string) preg_replace('/[\s\x{2028}\x{2029}\x{00A0}\x{3000}]+/u', ' ', $nombre);
        $nombre = (string) preg_replace('/(?!\x{200D})[\p{Cc}\p{Cf}\p{Co}\p{Cn}]/u', '', $nombre);
        $nombre = trim((string) preg_replace('/ {2,}/', ' ', $nombre));
        if (mb_strlen($nombre, 'UTF-8') > (int) Config::ajuste('nombre_max')) throw ErrorApi::datos('nombre', 'largo');
        return $nombre;
    }

    /** Idioma de la interfaz; si no es uno de los 12, el español. */
    public static function idioma(?string $idioma): string
    {
        return in_array($idioma, Config::IDIOMAS, true) ? $idioma : 'es';
    }

    public static function curso(string $curso): string
    {
        if (!in_array($curso, Config::CURSOS, true)) throw new ErrorApi(404, 'curso');
        return $curso;
    }

    /** Un token de los enlaces del correo. Si no tiene la forma correcta, ni se busca. */
    public static function tokenEnlace(?string $token): string
    {
        if ($token === null || !Seguridad::esToken($token)) throw new ErrorApi(400, 'enlace_invalido');
        return $token;
    }

    public static function nfc(string $texto): string
    {
        if (!mb_check_encoding($texto, 'UTF-8')) throw new ErrorApi(400, 'json_invalido');
        $normal = \Normalizer::normalize($texto, \Normalizer::FORM_C);
        return $normal === false ? $texto : $normal;
    }
}
