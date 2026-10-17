<?php
declare(strict_types=1);

namespace Paglot;

/** Números aleatorios, tokens y huellas. Todo con random_bytes() (plan, entrada 75). */
final class Seguridad
{
    /** Un token de 256 bits en base64url: 43 caracteres. Es lo que viaja; en la base solo va su huella. */
    public static function token(): string
    {
        return self::base64url(random_bytes(32));
    }

    /** Huella SHA-256 (binaria, 32 bytes) de un token: es lo que se guarda y lo que se busca. */
    public static function huella(string $token): string
    {
        return hash('sha256', $token, true);
    }

    public static function esToken(mixed $valor): bool
    {
        return is_string($valor) && preg_match('/^[A-Za-z0-9_-]{43}$/D', $valor) === 1;
    }

    /** Id público corto (22 caracteres) para cosas que se enseñan, como las sesiones. */
    public static function idPublico(): string
    {
        return self::base64url(random_bytes(16));
    }

    /** UUID versión 4 (aleatorio): los ids de las cuentas no se pueden adivinar (plan, entrada 100). */
    public static function uuid(): string
    {
        $b = random_bytes(16);
        $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
        $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
    }

    /** Huella con el secreto del servidor: para guardar algo sin guardarlo tal cual (IP, correos en los límites). */
    public static function hmac(string $valor): string
    {
        return hash_hmac('sha256', $valor, (string) Config::get('secreto'));
    }

    private static function base64url(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }
}
