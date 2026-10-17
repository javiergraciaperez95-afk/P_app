<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Los correos. Durante la petición solo se ponen en cola; se envían DESPUÉS de responder
 * (Correo::despachar), para que la respuesta tarde lo mismo haya o no correo que mandar
 * (así no se sabe si una cuenta existe por lo que tarda).
 * Si el envío falla, se guarda en correos_pendientes y se reintenta (plan, entrada 96).
 */
final class Correo
{
    private static array $cola = [];

    /**
     * Pone un correo en cola. Como mucho «correo_destino» correos por dirección y hora (plan, entrada 90):
     * los de más no se envían, en silencio (la respuesta a la app es la misma).
     * Devuelve false si no se va a enviar.
     */
    public static function enviar(string $para, string $plantilla, string $idioma, array $variables = []): bool
    {
        if (Limites::golpe('correo_destino', $para, false) > 0) return false;
        self::$cola[] = ['para' => $para, 'plantilla' => $plantilla] + Plantillas::componer($plantilla, $idioma, $variables)
            + ['enlace' => $variables['enlace'] ?? null];
        return true;
    }

    /** El enlace de un correo: va a la app, con el token detrás de «#». */
    public static function enlace(string $accion, string $token): string
    {
        return sprintf((string) Config::get('correo.enlace'), rawurlencode($accion), rawurlencode($token));
    }

    /** Envía lo que haya en cola. Se llama al final de cada petición, ya respondida. */
    public static function despachar(): void
    {
        $cola = self::$cola;
        self::$cola = [];
        foreach ($cola as $mensaje) {
            try {
                self::mandar($mensaje);
            } catch (\Throwable $e) {
                error_log('Correo no enviado (se reintentará): ' . $e->getMessage());
                self::guardarPendiente($mensaje);
            }
        }
    }

    /** Reintenta los pendientes (tareas/correos.php). Devuelve cuántos se han enviado. */
    public static function reintentarPendientes(): int
    {
        Bd::ejecutar('DELETE FROM correos_pendientes WHERE creado < ?', [Tiempo::bd(-86400)]);
        $enviados = 0;
        foreach (Bd::todos('SELECT * FROM correos_pendientes WHERE siguiente <= ? ORDER BY id LIMIT 50', [Tiempo::bd()]) as $f) {
            try {
                self::mandar(['para' => $f['para'], 'asunto' => $f['asunto'], 'texto' => $f['texto'], 'html' => $f['html'], 'plantilla' => '', 'enlace' => null]);
                Bd::ejecutar('DELETE FROM correos_pendientes WHERE id = ?', [$f['id']]);
                $enviados++;
            } catch (\Throwable $e) {
                // 5 min, 15 min, 1 h, 1 h…
                $espera = [300, 900, 3600][min((int) $f['intentos'], 2)];
                Bd::ejecutar('UPDATE correos_pendientes SET intentos = intentos + 1, siguiente = ? WHERE id = ?', [Tiempo::bd($espera), $f['id']]);
                error_log('Correo pendiente sin enviar: ' . $e->getMessage());
            }
        }
        return $enviados;
    }

    private static function guardarPendiente(array $m): void
    {
        try {
            Bd::ejecutar(
                'INSERT INTO correos_pendientes (para, asunto, texto, html, intentos, siguiente, creado) VALUES (?, ?, ?, ?, 1, ?, ?)',
                [$m['para'], $m['asunto'], $m['texto'], $m['html'], Tiempo::bd(300), Tiempo::bd()],
            );
        } catch (\Throwable $e) {
            error_log('Tampoco se pudo guardar el correo pendiente: ' . $e->getMessage());
        }
    }

    private static function mandar(array $m): void
    {
        match (Config::get('correo.modo')) {
            'archivo' => self::aArchivo($m),
            'resend'  => self::aResend($m),
            default   => throw new \RuntimeException('Modo de correo desconocido'),
        };
    }

    /** Para probar: cada correo es un .json en la carpeta «buzon». */
    private static function aArchivo(array $m): void
    {
        $carpeta = (string) Config::get('correo.buzon');
        if (!is_dir($carpeta) && !mkdir($carpeta, 0700, true) && !is_dir($carpeta)) throw new \RuntimeException('No se puede crear el buzón');
        $nombre = sprintf('%s/%s-%s.json', $carpeta, Tiempo::ahora()->format('Ymd-His-v'), bin2hex(random_bytes(4)));
        $json = json_encode($m, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        if (file_put_contents($nombre, $json, LOCK_EX) === false) throw new \RuntimeException('No se pudo escribir el correo');
    }

    /** Resend (https://resend.com/docs/api-reference/emails/send-email). La clave nunca sale en los errores. */
    private static function aResend(array $m): void
    {
        $c = curl_init((string) Config::get('correo.resend_url'));
        curl_setopt_array($c, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_PROTOCOLS      => Config::local() ? (CURLPROTO_HTTPS | CURLPROTO_HTTP) : CURLPROTO_HTTPS,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . Config::get('correo.resend_clave'),
                'Content-Type: application/json',
                'User-Agent: Paglot',
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'from'    => Config::get('correo.remitente'),
                'to'      => [$m['para']],
                'subject' => $m['asunto'],
                'html'    => $m['html'],
                'text'    => $m['texto'],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
        ]);
        $respuesta = curl_exec($c);
        $codigo = (int) curl_getinfo($c, CURLINFO_RESPONSE_CODE);
        $error = curl_error($c);
        if ($respuesta === false) throw new \RuntimeException('Resend no responde: ' . $error);
        if ($codigo < 200 || $codigo >= 300) throw new \RuntimeException("Resend respondió {$codigo}");
    }

    /** Olvida lo que haya en cola (la petición ha fallado). */
    public static function descartar(): void
    {
        self::$cola = [];
    }

    /** Para las pruebas. */
    public static function enCola(): array
    {
        return self::$cola;
    }
}
