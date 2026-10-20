<?php
// Configuración del servidor de Paglot. Copia este archivo como «config.php» (en esta misma carpeta) y rellénalo.
// config.php NO se sube a GitHub (.gitignore) y el .htaccess impide que se lea desde fuera.
return [
    // Base de datos MySQL / MariaDB (la que da el hosting). Importa antes api/esquema.sql.
    'db' => [
        'dsn' => 'mysql:host=localhost;dbname=paglot;charset=utf8mb4',
        'usuario' => 'paglot',
        'clave' => 'CAMBIAR',
    ],

    // Desde dónde se puede llamar a la API (la web y la app de Android, que se abre como https://localhost).
    'origenes' => ['https://paglot.eu', 'https://www.paglot.eu', 'https://localhost', 'capacitor://localhost'],

    // Resend (resend.com): la clave de la API y el remitente (el dominio paglot.eu tiene que estar verificado en Resend).
    'resend' => [
        'clave' => 're_CAMBIAR',
        'remitente' => 'Paglot <hola@paglot.eu>',
        'responder_a' => 'hola@paglot.eu',
        'contacto_a' => 'hola@paglot.eu',   // adónde llegan los mensajes del formulario de contacto
    ],

    // Cloudflare Turnstile (el captcha del contacto): la clave SECRETA. La pública va en js/config.js.
    // La de pruebas «1x0000000000000000000000000000000AA» deja pasar siempre.
    'turnstile_secreta' => '1x0000000000000000000000000000000AA',

    // Supabase: la doble comprobación de los pagos. La URL y la clave «service_role» (secreta: solo aquí, nunca en la app).
    'supabase' => [
        'url' => 'https://iuniglsiqnfvnotmfgdo.supabase.co',
        'clave_servicio' => 'CAMBIAR',
    ],

    // Stripe (los cobros de la web). Clave secreta y la del webhook (Developers → Webhooks → paglot.eu/api/?r=pagos/stripe).
    'stripe' => [
        'secreta' => 'sk_test_CAMBIAR',
        'webhook' => 'whsec_CAMBIAR',
    ],

    // La Hucha: cuánto da cada anuncio visto (en céntimos) y la clave compartida con la red de anuncios para firmar
    // la recompensa (verificación en el servidor: SSV). Sin red de anuncios configurada, la Hucha no suma nada.
    'hucha' => [
        'centimos_por_anuncio' => 1,
        'clave_ssv' => 'CAMBIAR',
        'anuncios_al_dia' => 20,
    ],

    // Plazas del plan Fundadores (en cuanto se venden todas, se cierra solo).
    'plazas_fundadores' => 500,

    // Precios en céntimos por zona (los mismos que js/config.js, ZONAS). El servidor cobra estos, no los que diga la app.
    'precios' => [
        'A' => ['plus-mes' => 499, 'plus-ano' => 3999, 'max-mes' => 1499, 'max-ano' => 12900, 'familia-ano' => 7900, 'fundadores' => 9900],
        'B' => ['plus-mes' => 299, 'plus-ano' => 2399, 'max-mes' => 899, 'max-ano' => 7799, 'familia-ano' => 4799, 'fundadores' => 5900],
        'C' => ['plus-mes' => 199, 'plus-ano' => 1599, 'max-mes' => 599, 'max-ano' => 5199, 'familia-ano' => 3199, 'fundadores' => 3900],
        'D' => ['plus-mes' => 99, 'plus-ano' => 799, 'max-mes' => 299, 'max-ano' => 2599, 'familia-ano' => 1599, 'fundadores' => 1900],
    ],

    // La web, para los enlaces de los correos.
    'web' => 'https://paglot.eu',
];
