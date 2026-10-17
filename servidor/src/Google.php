<?php
declare(strict_types=1);

namespace Paglot;

/**
 * «Continuar con Google»: la app recibe de Google un token firmado (un JWT, el «ID token») y lo manda aquí.
 * Se comprueba la firma con las claves públicas de Google y lo que dice el token: que es para Paglot
 * (aud = uno de nuestros clientes), que lo ha emitido Google, que no ha caducado y que el correo está verificado.
 * Sin librerías: el JWT es RS256 y basta OpenSSL (https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
 *
 * config.php:
 *   'google' => [
 *       'clientes' => ['123-abc.apps.googleusercontent.com'],   // el ID de cliente web (también lo usa la APK)
 *       'claves_archivo' => null,   // solo para las pruebas: un JWKS en un archivo, en vez de pedirlo a Google
 *   ]
 * Sin 'clientes', entrar con Google está apagado (503 «google_desactivado»).
 */
final class Google
{
    private const CLAVES_URL = 'https://www.googleapis.com/oauth2/v3/certs';
    private const EMISORES = ['accounts.google.com', 'https://accounts.google.com'];

    /**
     * Lo que importa del token: ['sub', 'correo', 'nombre', 'propio']. Si algo no cuadra, «google_invalido».
     * 'propio': el correo lo gestiona Google (Gmail, o una cuenta de empresa con «hd»), así que es seguro que
     * es de quien entra. Con otros dominios, Google solo comprobó el correo una vez y la persona puede haber
     * perdido ese dominio: Google recomienda no enlazar cuentas existentes solo por ese correo.
     */
    public static function verificar(string $jwt): array
    {
        $clientes = (array) Config::get('google.clientes', []);
        if ($clientes === []) throw new ErrorApi(503, 'google_desactivado');

        $partes = explode('.', $jwt);
        if (count($partes) !== 3 || strlen($jwt) > 8192) throw new ErrorApi(401, 'google_invalido');
        $cabecera = json_decode(self::base64url($partes[0]), true);
        $datos = json_decode(self::base64url($partes[1]), true);
        $firma = self::base64url($partes[2]);
        if (!is_array($cabecera) || !is_array($datos) || ($cabecera['alg'] ?? '') !== 'RS256' || !is_string($cabecera['kid'] ?? null)) {
            throw new ErrorApi(401, 'google_invalido');
        }

        // Google cambia sus claves cada pocos días: si no está la del token, se vuelven a pedir una vez.
        $clave = self::claves(false)[$cabecera['kid']] ?? self::claves(true)[$cabecera['kid']] ?? null;
        if ($clave === null || openssl_verify($partes[0] . '.' . $partes[1], $firma, $clave, OPENSSL_ALGO_SHA256) !== 1) {
            throw new ErrorApi(401, 'google_invalido');
        }

        $ahora = Tiempo::ahora()->getTimestamp();
        $aud = (array) ($datos['aud'] ?? []);
        $verificado = ($datos['email_verified'] ?? false) === true || ($datos['email_verified'] ?? '') === 'true';
        if (!in_array($datos['iss'] ?? '', self::EMISORES, true)
            || array_intersect($aud, $clientes) === []
            || !is_int($datos['exp'] ?? null) || $datos['exp'] < $ahora - 60
            || (is_int($datos['iat'] ?? null) && $datos['iat'] > $ahora + 300)
            || !is_string($datos['sub'] ?? null) || $datos['sub'] === '' || strlen($datos['sub']) > 255
            || !is_string($datos['email'] ?? null) || !$verificado
        ) {
            throw new ErrorApi(401, 'google_invalido');
        }
        $correo = Validar::correo($datos['email']);
        $dominio = substr($correo, (int) strrpos($correo, '@') + 1);
        $propio = in_array($dominio, ['gmail.com', 'googlemail.com'], true)
            || (is_string($datos['hd'] ?? null) && $datos['hd'] !== '' && strtolower($datos['hd']) === $dominio);
        return ['sub' => $datos['sub'], 'correo' => $correo, 'nombre' => is_string($datos['name'] ?? null) ? $datos['name'] : '', 'propio' => $propio];
    }

    /**
     * kid → clave pública (PEM). Se guardan en un archivo mientras Google diga que valen (Cache-Control).
     * $renovar (llega un kid que no conocemos): se vuelven a pedir, pero como mucho una vez cada 5 minutos.
     * Si no, cualquiera mandando tokens con un kid inventado haría que pidiéramos las claves a Google cada vez.
     */
    private static function claves(bool $renovar): array
    {
        static $enMemoria = null;
        $archivo = Config::get('google.claves_archivo');
        if (is_string($archivo)) return self::aPem((string) file_get_contents($archivo));
        if ($enMemoria !== null && !$renovar) return $enMemoria;

        $cache = (string) Config::get('google.cache', dirname(__DIR__) . '/registros/google-claves.json');
        $guardado = is_file($cache) ? json_decode((string) file_get_contents($cache), true) : null;
        $vigente = is_array($guardado) && ($guardado['hasta'] ?? 0) > time();
        $reciente = is_array($guardado) && ($guardado['pedidas'] ?? 0) > time() - 300;
        if (is_array($guardado) && ((!$renovar && $vigente) || ($renovar && $reciente))) {
            return $enMemoria = self::aPem((string) $guardado['jwks']);
        }

        $c = curl_init((string) Config::get('google.claves_url', self::CLAVES_URL));
        $cabeceras = [];
        curl_setopt_array($c, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_PROTOCOLS      => Config::local() ? (CURLPROTO_HTTPS | CURLPROTO_HTTP) : CURLPROTO_HTTPS,
            CURLOPT_HEADERFUNCTION => static function ($c, string $linea) use (&$cabeceras): int {
                $cabeceras[] = $linea;
                return strlen($linea);
            },
        ]);
        $jwks = curl_exec($c);
        if (!is_string($jwks) || (int) curl_getinfo($c, CURLINFO_RESPONSE_CODE) !== 200) {
            error_log('Google: no se pudieron descargar las claves');
            // Se apunta el intento igualmente, para no volver a llamar en cada petición mientras Google no responde.
            @file_put_contents($cache, json_encode(['pedidas' => time()] + (is_array($guardado) ? $guardado : ['hasta' => 0, 'jwks' => '{"keys":[]}'])), LOCK_EX);
            // Mejor las de antes (aunque hayan caducado) que dejar a todo el mundo fuera.
            return $enMemoria = is_array($guardado) ? self::aPem((string) $guardado['jwks']) : [];
        }
        $segundos = 3600;
        foreach ($cabeceras as $linea) {
            if (preg_match('/^cache-control:.*max-age=(\d+)/i', $linea, $m)) $segundos = min((int) $m[1], 86400);
        }
        @file_put_contents($cache, json_encode(['hasta' => time() + $segundos, 'pedidas' => time(), 'jwks' => $jwks]), LOCK_EX);
        return $enMemoria = self::aPem($jwks);
    }

    /** Un JWKS (las claves en JSON, con su módulo «n» y exponente «e») a claves PEM que entiende OpenSSL. */
    private static function aPem(string $jwks): array
    {
        $datos = json_decode($jwks, true);
        $claves = [];
        foreach (is_array($datos['keys'] ?? null) ? $datos['keys'] : [] as $k) {
            if (($k['kty'] ?? '') !== 'RSA' || !is_string($k['kid'] ?? null) || !is_string($k['n'] ?? null) || !is_string($k['e'] ?? null)) continue;
            $rsa = self::asn1(0x30, self::entero(self::base64url($k['n'])) . self::entero(self::base64url($k['e'])));
            $algoritmo = self::asn1(0x30, "\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x01\x05\x00");   // rsaEncryption, NULL
            $der = self::asn1(0x30, $algoritmo . self::asn1(0x03, "\x00" . $rsa));
            $claves[$k['kid']] = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
        }
        return $claves;
    }

    private static function entero(string $bytes): string
    {
        $bytes = ltrim($bytes, "\x00");
        if ($bytes === '' || ord($bytes[0]) > 0x7f) $bytes = "\x00" . $bytes;
        return self::asn1(0x02, $bytes);
    }

    private static function asn1(int $tipo, string $contenido): string
    {
        $largo = strlen($contenido);
        if ($largo < 0x80) return chr($tipo) . chr($largo) . $contenido;
        $bytes = ltrim(pack('N', $largo), "\x00");
        return chr($tipo) . chr(0x80 | strlen($bytes)) . $bytes . $contenido;
    }

    private static function base64url(string $texto): string
    {
        return (string) base64_decode(strtr($texto, '-_', '+/') . str_repeat('=', (4 - strlen($texto) % 4) % 4), false);
    }
}
