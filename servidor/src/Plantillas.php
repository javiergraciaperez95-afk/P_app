<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Los textos de los correos, en el idioma de la interfaz de cada persona (por ahora español e inglés;
 * los demás idiomas reciben el inglés hasta que se escriban).
 * Todo lo que viene de la persona (su nombre, un correo) se escapa antes de entrar en el HTML (plan, entrada 93).
 */
final class Plantillas
{
    private const TEXTOS = [
        'es' => [
            'codigo' => [
                'asunto' => 'Tu código de Paglot: {codigo}',
                'titulo' => 'Tu código',
                'parrafos' => ['Escribe este código en la app para entrar. Si aún no tienes cuenta, se creará.', 'Vale durante {minutos} minutos. Si no lo has pedido tú, puedes ignorar este correo.'],
                'destacado' => '{codigo}',
            ],
            'confirmar' => [
                'asunto' => 'Confirma tu cuenta de Paglot',
                'titulo' => '¡Ya casi está!',
                'parrafos' => ['Gracias por crear tu cuenta. Pulsa el botón para confirmar tu correo y empezar a guardar tu progreso en la nube.', 'El enlace vale durante {horas} horas.'],
                'boton' => 'Confirmar mi correo',
            ],
            'ya_registrado' => [
                'asunto' => 'Ya tienes una cuenta de Paglot',
                'titulo' => 'Ya tienes cuenta',
                'parrafos' => ['Alguien ha intentado crear una cuenta nueva con este correo, pero ya tienes una.', 'Si no recuerdas tu contraseña, en la app pulsa «He olvidado mi contraseña» y te mandaremos un enlace para poner una nueva.'],
            ],
            'recuperar' => [
                'asunto' => 'Pon una contraseña nueva en Paglot',
                'titulo' => 'Contraseña nueva',
                'parrafos' => ['Has pedido cambiar tu contraseña. Pulsa el botón para elegir una nueva.', 'El enlace vale durante {minutos} minutos y solo se puede usar una vez. Al cambiarla se cerrará la sesión en todos tus dispositivos.'],
                'boton' => 'Poner contraseña nueva',
            ],
            'contrasena_cambiada' => [
                'asunto' => 'Tu contraseña de Paglot ha cambiado',
                'titulo' => 'Contraseña cambiada',
                'parrafos' => ['La contraseña de tu cuenta se acaba de cambiar y hemos cerrado la sesión en los demás dispositivos.', 'Si no has sido tú, pide ahora mismo una contraseña nueva desde «He olvidado mi contraseña» y escríbenos.'],
            ],
            'correo_nuevo' => [
                'asunto' => 'Confirma tu nuevo correo en Paglot',
                'titulo' => 'Tu nuevo correo',
                'parrafos' => ['Has pedido que tu cuenta de Paglot use esta dirección. Pulsa el botón para confirmarlo.', 'El enlace vale durante {horas} horas.'],
                'boton' => 'Confirmar este correo',
            ],
            'correo_aviso' => [
                'asunto' => 'Se ha pedido cambiar el correo de tu cuenta de Paglot',
                'titulo' => 'Cambio de correo',
                'parrafos' => ['Se ha pedido que tu cuenta pase a usar la dirección {correo}. No cambiará hasta que se confirme desde ese correo.', 'Si no has sido tú, cambia tu contraseña cuanto antes.'],
            ],
            'correo_cambiado' => [
                'asunto' => 'El correo de tu cuenta de Paglot ha cambiado',
                'titulo' => 'Correo cambiado',
                'parrafos' => ['Tu cuenta ya usa la dirección {correo}. A partir de ahora los avisos llegarán allí.', 'Si no has sido tú, escríbenos respondiendo a este correo.'],
            ],
            'cuenta_borrada' => [
                'asunto' => 'Tu cuenta de Paglot se ha borrado',
                'titulo' => 'Hasta pronto',
                'parrafos' => ['Hemos borrado tu cuenta y todo tu progreso guardado en la nube. Lo que tuvieras en tus dispositivos sigue allí.', 'Si algún día quieres volver, te estaremos esperando.'],
            ],
        ],
        'en' => [
            'codigo' => [
                'asunto' => 'Your Paglot code: {codigo}',
                'titulo' => 'Your code',
                'parrafos' => ['Type this code in the app to sign in. If you don’t have an account yet, it will be created.', 'It works for {minutos} minutes. If you didn’t ask for it, you can ignore this email.'],
                'destacado' => '{codigo}',
            ],
            'confirmar' => [
                'asunto' => 'Confirm your Paglot account',
                'titulo' => 'Almost there!',
                'parrafos' => ['Thanks for creating your account. Press the button to confirm your email and start saving your progress in the cloud.', 'The link works for {horas} hours.'],
                'boton' => 'Confirm my email',
            ],
            'ya_registrado' => [
                'asunto' => 'You already have a Paglot account',
                'titulo' => 'You already have an account',
                'parrafos' => ['Someone tried to create a new account with this email, but you already have one.', 'If you don’t remember your password, tap “Forgot my password” in the app and we’ll send you a link to set a new one.'],
            ],
            'recuperar' => [
                'asunto' => 'Set a new Paglot password',
                'titulo' => 'New password',
                'parrafos' => ['You asked to change your password. Press the button to choose a new one.', 'The link works for {minutos} minutes and only once. Changing it will sign you out on all your devices.'],
                'boton' => 'Set a new password',
            ],
            'contrasena_cambiada' => [
                'asunto' => 'Your Paglot password has changed',
                'titulo' => 'Password changed',
                'parrafos' => ['Your account password has just been changed and we have signed you out on your other devices.', 'If it wasn’t you, ask for a new password right away with “Forgot my password” and write to us.'],
            ],
            'correo_nuevo' => [
                'asunto' => 'Confirm your new email on Paglot',
                'titulo' => 'Your new email',
                'parrafos' => ['You asked for your Paglot account to use this address. Press the button to confirm it.', 'The link works for {horas} hours.'],
                'boton' => 'Confirm this email',
            ],
            'correo_aviso' => [
                'asunto' => 'A change of email was requested for your Paglot account',
                'titulo' => 'Email change',
                'parrafos' => ['Someone asked for your account to use the address {correo}. Nothing changes until it is confirmed from that inbox.', 'If it wasn’t you, change your password as soon as possible.'],
            ],
            'correo_cambiado' => [
                'asunto' => 'Your Paglot account email has changed',
                'titulo' => 'Email changed',
                'parrafos' => ['Your account now uses the address {correo}. From now on, notices will go there.', 'If it wasn’t you, write to us by replying to this email.'],
            ],
            'cuenta_borrada' => [
                'asunto' => 'Your Paglot account has been deleted',
                'titulo' => 'See you soon',
                'parrafos' => ['We have deleted your account and all the progress saved in the cloud. Whatever was on your devices is still there.', 'If you ever want to come back, we’ll be here.'],
            ],
        ],
    ];

    /** Lo que llevan todos los correos de cada idioma. */
    private const COMUNES = [
        'es' => [
            '_saludo'      => 'Hola, {nombre}:',
            '_saludo_solo' => '¡Hola!',
            '_pie'         => 'Este correo lo envía Paglot porque alguien ha usado esta dirección en la app. Si no has sido tú, puedes ignorarlo.',
            '_enlace_texto' => 'Si el botón no funciona, copia este enlace en el navegador:',
        ],
        'en' => [
            '_saludo'      => 'Hi {nombre},',
            '_saludo_solo' => 'Hi!',
            '_pie'         => 'Paglot sent this email because someone used this address in the app. If it wasn’t you, you can ignore it.',
            '_enlace_texto' => 'If the button doesn’t work, copy this link into your browser:',
        ],
    ];

    public const NOMBRES = ['codigo', 'confirmar', 'ya_registrado', 'recuperar', 'contrasena_cambiada', 'correo_nuevo', 'correo_aviso', 'correo_cambiado', 'cuenta_borrada'];

    /**
     * Compone un correo: ['asunto', 'texto', 'html'].
     * $variables: textos sueltos (se escapan); 'enlace' es la dirección del botón.
     */
    public static function componer(string $plantilla, string $idioma, array $variables = []): array
    {
        $idioma = isset(self::TEXTOS[$idioma]) ? $idioma : 'en';
        $textos = self::COMUNES[$idioma];
        $p = self::TEXTOS[$idioma][$plantilla] ?? throw new \LogicException("Plantilla desconocida: {$plantilla}");
        $enlace = $variables['enlace'] ?? null;
        unset($variables['enlace']);

        $poner = static function (string $texto, bool $html) use ($variables): string {
            $cambios = [];
            foreach ($variables as $clave => $valor) {
                $valor = self::unaLinea((string) $valor);
                $cambios['{' . $clave . '}'] = $html ? self::e($valor) : $valor;
            }
            return strtr($html ? self::e($texto) : $texto, $html ? self::escaparLlaves($cambios) : $cambios);
        };

        $nombre = trim((string) ($variables['nombre'] ?? ''));
        $saludo = $nombre !== '' ? $textos['_saludo'] : $textos['_saludo_solo'];

        // --- Texto plano ---
        $lineas = [$poner($saludo, false), ''];
        if (isset($p['destacado'])) { $lineas[] = '    ' . $poner($p['destacado'], false); $lineas[] = ''; }
        foreach ($p['parrafos'] as $parrafo) { $lineas[] = $poner($parrafo, false); $lineas[] = ''; }
        if (!isset($p['boton'])) $enlace = null;   // las plantillas de aviso no llevan botón
        if ($enlace !== null) { $lineas[] = $p['boton'] . ':'; $lineas[] = $enlace; $lineas[] = ''; }
        $lineas[] = '— Paglot';
        $lineas[] = '';
        $lineas[] = $textos['_pie'];
        $texto = implode("\n", $lineas);

        // --- HTML (tablas y estilos en línea: es lo que entienden todos los programas de correo) ---
        $parrafos = '';
        foreach ($p['parrafos'] as $parrafo) {
            $parrafos .= '<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#f2ecf7;">' . $poner($parrafo, true) . '</p>';
        }
        if (isset($p['destacado'])) {
            // El código, grande y separado del texto, para leerlo de un vistazo y copiarlo bien.
            $parrafos = '<p style="margin:0 0 20px;padding:16px;background:#15121d;border-radius:10px;text-align:center;font-size:34px;font-weight:800;letter-spacing:8px;color:#f4c84a;font-family:ui-monospace,Menlo,Consolas,monospace;">'
                . $poner($p['destacado'], true) . '</p>' . $parrafos;
        }
        $boton = '';
        if ($enlace !== null) {
            $href = self::e($enlace);
            $boton = '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:#f4c84a;border-radius:10px;">'
                . '<a href="' . $href . '" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:700;color:#1a1424;text-decoration:none;">' . self::e($p['boton']) . '</a>'
                . '</td></tr></table>'
                . '<p style="margin:0 0 8px;font-size:13px;color:#b9aec8;">' . self::e($textos['_enlace_texto']) . '</p>'
                . '<p style="margin:0 0 16px;font-size:13px;word-break:break-all;"><a href="' . $href . '" style="color:#8fd8ff;">' . $href . '</a></p>';
        }
        $html = '<!doctype html><html lang="' . self::e($idioma) . '"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark">'
            . '<title>' . $poner($p['asunto'], true) . '</title></head>'
            . '<body style="margin:0;padding:0;background:#15121d;font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#15121d;"><tr><td align="center" style="padding:32px 16px;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#231e30;border-radius:16px;border:2px solid #3b3256;">'
            . '<tr><td style="padding:28px 28px 8px;font-size:22px;font-weight:800;color:#f4c84a;letter-spacing:1px;">Paglot</td></tr>'
            . '<tr><td style="padding:8px 28px 28px;">'
            . '<h1 style="margin:0 0 16px;font-size:22px;color:#ffd98a;">' . self::e($p['titulo']) . '</h1>'
            . '<p style="margin:0 0 16px;font-size:16px;color:#f2ecf7;">' . $poner($saludo, true) . '</p>'
            . $parrafos . $boton
            . '</td></tr></table>'
            . '<p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#b9aec8;">' . self::e($textos['_pie']) . '</p>'
            . '</td></tr></table></body></html>';

        return ['asunto' => $poner($p['asunto'], false), 'texto' => $texto, 'html' => $html];
    }

    private static function e(string $texto): string
    {
        return htmlspecialchars($texto, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
    }

    /** Las llaves de los marcadores no cambian al escapar, pero así no hay sorpresas si algún día lo hacen. */
    private static function escaparLlaves(array $cambios): array
    {
        $resultado = [];
        foreach ($cambios as $clave => $valor) $resultado[self::e($clave)] = $valor;
        return $resultado;
    }

    /** Nada de saltos de línea dentro de un valor (ni en el asunto ni en el texto). */
    private static function unaLinea(string $texto): string
    {
        return trim((string) preg_replace('/[\r\n\t\p{Zl}\p{Zp}]+/u', ' ', $texto));
    }
}
