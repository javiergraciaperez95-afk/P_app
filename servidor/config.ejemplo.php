<?php
// Configuración de la API de Paglot.
//
// Copia este archivo como «config.php» (en esta misma carpeta, FUERA de publico/) y rellénalo.
// config.php NO se sube a GitHub (está en .gitignore): lleva las contraseñas.
// Otra ruta: la variable de entorno PAGLOT_CONFIG (la usan las pruebas).

return [
    // 'produccion' oculta todos los detalles de los errores; 'local' es para el ordenador.
    'entorno' => 'produccion',

    'bd' => [
        // En el servidor, «localhost» conecta por el socket (más rápido y sin abrir el puerto 3306).
        'dsn'        => 'mysql:host=localhost;dbname=paglot;charset=utf8mb4',
        'usuario'    => 'paglot_app',
        'contrasena' => 'CAMBIAR_POR_UNA_CONTRASENA_LARGA_Y_ALEATORIA',
        // Solo las tareas (limpieza, reenvío de correos) usan este otro usuario.
        'tareas_usuario'    => 'paglot_tareas',
        'tareas_contrasena' => 'CAMBIAR_POR_OTRA_CONTRASENA_LARGA_Y_ALEATORIA',
    ],

    // Webs que pueden llamar a la API desde el navegador (CORS). Nada de comodines.
    // La APK de Android (Capacitor) llama desde https://localhost; la de iOS, desde capacitor://localhost.
    'origenes' => [
        'https://paglot.app',
        'https://localhost',
        'capacitor://localhost',
    ],

    // IP de los proxys de confianza (p. ej. Cloudflare o Nginx en otra máquina). Si la petición llega
    // de una de ellas, la IP del usuario se toma de la cabecera indicada. Vacío = se usa REMOTE_ADDR.
    'proxys' => [],
    'cabecera_ip' => 'HTTP_X_FORWARDED_FOR',

    'correo' => [
        // 'resend' en el servidor; 'archivo' guarda cada correo como un .json en 'buzon' (para probar).
        'modo'      => 'resend',
        'remitente' => 'Paglot <hola@correo.paglot.app>',
        'resend_clave' => 'CAMBIAR_re_xxxxxxxx',      // solo permiso de enviar, limitada al dominio
        'resend_url'   => 'https://api.resend.com/emails',
        'buzon'        => __DIR__ . '/buzon',
        // Adónde llevan los enlaces de los correos. %1$s = acción (confirmar, recuperar, correo); %2$s = token.
        // Va detrás de «#»: así el token no llega nunca a ningún servidor ni aparece en sus registros.
        'enlace' => 'https://paglot.app/#/enlace/%1$s/%2$s',
    ],

    // Comprobar las contraseñas nuevas contra las filtradas (Have I Been Pwned, de forma anónima:
    // solo salen los 5 primeros caracteres de su huella SHA-1). Si no responde, no se bloquea a nadie.
    'pwned' => true,

    // Versión mínima de la app que se acepta (la app avisa de que hay que actualizar si es más vieja).
    'app_minima' => '1.0.0',

    // Registro de errores (fuera de la carpeta pública).
    'registro_errores' => __DIR__ . '/registros/errores.log',
];
