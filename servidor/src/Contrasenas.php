<?php
declare(strict_types=1);

namespace Paglot;

/** Guardar y comprobar contraseñas (plan, entradas 60–64). */
final class Contrasenas
{
    /** Huella para guardar: Argon2id con los parámetros por defecto de PHP (64 MB, 4 pasadas). */
    public static function huella(string $contrasena): string
    {
        return password_hash(Validar::nfc($contrasena), PASSWORD_ARGON2ID);
    }

    /**
     * ¿Es la contraseña de esta huella? Las cuentas que vengan de Supabase traen bcrypt hecho sin normalizar
     * el texto, así que se prueba también tal cual.
     * Devuelve la huella nueva si hay que mejorarla (plan, entrada 61), true si vale tal cual, false si no.
     */
    public static function comprobar(string $contrasena, string $huella): string|bool
    {
        $normal = Validar::nfc($contrasena);
        if (password_verify($normal, $huella)) {
            return password_needs_rehash($huella, PASSWORD_ARGON2ID) ? self::huella($contrasena) : true;
        }
        if ($normal !== $contrasena && password_verify($contrasena, $huella)) return self::huella($contrasena);
        return false;
    }

    /**
     * Para que tarde lo mismo exista o no la cuenta (plan, entrada 69): se calcula una huella de relleno.
     */
    public static function perderTiempo(string $contrasena): void
    {
        // Huella fija con los mismos parámetros que las de verdad (de una contraseña aleatoria que nadie sabe).
        // Fija a propósito: calcularla en cada petición costaría el doble y delataría que la cuenta no existe.
        password_verify(Validar::nfc($contrasena), self::RELLENO);
    }

    private const RELLENO = '$argon2id$v=19$m=65536,t=4,p=1$UGhvS3ZTelpuVUdKUVFQMg$VUuricEuR2ysKUDK/vMBfuzwzA+n3c4mYYr/hZ+/w0c';

    /**
     * Comprueba una contraseña NUEVA. Lanza «contrasena_corta», «contrasena_larga» o «contrasena_debil».
     * Permite frases largas, espacios y cualquier carácter: nada de reglas de símbolos obligatorios.
     */
    public static function validarNueva(string $contrasena, string $correo = ''): void
    {
        $normal = Validar::nfc($contrasena);
        $largo = mb_strlen($normal, 'UTF-8');
        if ($largo < (int) Config::ajuste('contrasena_min')) {
            throw new ErrorApi(400, 'contrasena_corta', ['minimo' => (int) Config::ajuste('contrasena_min')]);
        }
        if ($largo > (int) Config::ajuste('contrasena_max')) {
            throw new ErrorApi(400, 'contrasena_larga', ['maximo' => (int) Config::ajuste('contrasena_max')]);
        }
        $minus = mb_strtolower($normal, 'UTF-8');
        $local = $correo !== '' ? explode('@', $correo)[0] : '';
        if (trim($normal) === ''
            || self::esComun($minus)
            || ($correo !== '' && ($minus === $correo || $minus === $local))
            || count(array_unique(mb_str_split($normal, 1, 'UTF-8'))) < 3   // «aaaaaaaa», «abababab»
            || self::filtrada($normal)
        ) {
            throw new ErrorApi(400, 'contrasena_debil');
        }
    }

    private static function esComun(string $minusculas): bool
    {
        static $lista = null;
        if ($lista === null) {
            $lineas = file(dirname(__DIR__) . '/datos/contrasenas-comunes.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $lista = array_flip($lineas ?: []);
        }
        return isset($lista[$minusculas]);
    }

    /**
     * Have I Been Pwned por rangos: solo salen los 5 primeros caracteres de la huella SHA-1, nunca la
     * contraseña. Si el servicio no responde en 3 segundos, no se bloquea a nadie.
     */
    private static function filtrada(string $contrasena): bool
    {
        if (!Config::get('pwned', false) || !function_exists('curl_init')) return false;
        $sha1 = strtoupper(sha1($contrasena));
        $c = curl_init('https://api.pwnedpasswords.com/range/' . substr($sha1, 0, 5));
        curl_setopt_array($c, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 3,
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_HTTPHEADER     => ['Add-Padding: true', 'User-Agent: Paglot'],
            CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS,
        ]);
        $respuesta = curl_exec($c);
        $codigo = (int) curl_getinfo($c, CURLINFO_RESPONSE_CODE);
        if (!is_string($respuesta) || $codigo !== 200) return false;
        $resto = substr($sha1, 5);
        foreach (explode("\n", $respuesta) as $linea) {
            [$sufijo, $veces] = array_pad(explode(':', trim($linea)), 2, '0');
            if (hash_equals($resto, $sufijo) && (int) $veces > 0) return true;
        }
        return false;
    }
}
