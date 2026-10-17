<?php
declare(strict_types=1);

namespace Paglot;

/**
 * La configuración (config.php) y los ajustes con sus valores por defecto.
 * Los ajustes se pueden cambiar en config.php, dentro de 'ajustes' (las pruebas lo hacen).
 */
final class Config
{
    /** Valores por defecto. Duraciones en segundos salvo que el nombre diga otra cosa. */
    private const AJUSTES = [
        'sesion_duracion'       => 30 * 86400,   // la sesión caduca a los 30 días sin usarla…
        'sesion_maxima'         => 180 * 86400,  // …y a los 180 días en cualquier caso
        'sesion_renovar_cada'   => 3600,         // como mucho se alarga una vez por hora (menos escrituras)
        'token_confirmar'       => 48 * 3600,
        'token_recuperar'       => 3600,
        'token_correo'          => 24 * 3600,
        'codigo_duracion'       => 600,          // el código de 6 cifras vale 10 minutos…
        'codigo_intentos'       => 5,            // …y se gasta al 5.º fallo
        'contrasena_min'        => 8,
        'contrasena_max'        => 128,
        'nombre_max'            => 60,
        'cuerpo_max'            => 2_000_000,    // bytes de una petición
        'progreso_max'          => 1_500_000,    // bytes del JSON de progreso de un curso
        'foto_lado'             => 96,           // la app ya la manda así; el servidor la vuelve a generar
        'foto_max'              => 500_000,      // bytes de la imagen recibida (la app manda unos 5 KB)
        'foto_max_px'           => 1024,         // ancho o alto máximo (evita «bombas» de descompresión)
        'historial_cada'        => 3600,         // copia del progreso anterior, como mucho una por hora y curso
        'espera_maxima'         => 86400,        // tope de la espera creciente
        // [máximo, ventana]: cuántas veces se puede hacer algo en esa ventana.
        // Los de IP son generosos a propósito: una clase entera (Paglot Schools) sale por la misma IP.
        // Lo que protege cada cuenta es el límite por correo y por persona, que sí es estricto.
        'limites' => [
            'ip'              => [120, 60],    // peticiones SIN sesión, por IP (las de con sesión cuentan por persona)
            'usuario'         => [240, 60],    // cualquier petición con sesión, por persona
            'entrar_correo'   => [5, 900],     // contraseñas fallidas por correo (espera creciente)
            'entrar_ip'       => [100, 900],   // intentos de entrar por IP
            'registro_ip'     => [30, 3600],
            'correo_destino'  => [3, 3600],    // correos enviados a una misma dirección
            'recuperar_ip'    => [30, 3600],   // pedir enlaces de recuperar o de confirmar, por IP
            'token_ip'        => [60, 900],    // enlaces de correo probados por IP
            'contrasena_usuario' => [5, 900],  // contraseña actual fallida (cambiarla, borrar…)
            'guardar'         => [30, 60],     // guardados de progreso por persona y curso
            'codigo_correo'   => [5, 3600],    // códigos pedidos para un mismo correo
            'codigo_ip'       => [30, 3600],   // códigos pedidos por IP
            'codigo_entrar_ip' => [60, 900],   // códigos probados por IP
            'codigo_fallo'    => [10, 3600],   // códigos fallidos por correo (espera creciente: 1 h, 2 h, 4 h…)
            'google_ip'       => [60, 900],    // entradas con Google por IP
        ],
    ];

    /** Idiomas de la interfaz (js/i18n/): el idioma de los correos. */
    public const IDIOMAS = ['es', 'en', 'pt', 'vi', 'zh', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'id'];

    /** Cursos (campo «id» de Idiomas/js/cursos.js). Lista cerrada: nada fuera de ella (plan, entrada 101). */
    public const CURSOS = [
        'en', 'es', 'fr', 'de', 'ja', 'it', 'ko', 'zh', 'pt', 'ru', 'tr',
        'nl', 'sv', 'el', 'pl', 'no', 'vi', 'id', 'da', 'ro', 'th',
    ];

    private static array $datos = [];

    public static function cargar(?string $ruta = null): void
    {
        $ruta ??= getenv('PAGLOT_CONFIG') ?: dirname(__DIR__) . '/config.php';
        if (!is_file($ruta)) {
            throw new \RuntimeException('Falta el archivo de configuración: ' . basename($ruta));
        }
        $datos = require $ruta;
        if (!is_array($datos)) throw new \RuntimeException('La configuración no devuelve un array');
        foreach (['bd', 'origenes', 'correo', 'secreto'] as $clave) {
            if (!array_key_exists($clave, $datos)) throw new \RuntimeException("Falta «{$clave}» en la configuración");
        }
        if (!is_string($datos['secreto']) || strlen($datos['secreto']) < 32) {
            throw new \RuntimeException('«secreto» tiene que tener al menos 32 caracteres');
        }
        self::$datos = $datos;
    }

    /** Un valor de config.php con «a.b.c». */
    public static function get(string $clave, mixed $porDefecto = null): mixed
    {
        $valor = self::$datos;
        foreach (explode('.', $clave) as $parte) {
            if (!is_array($valor) || !array_key_exists($parte, $valor)) return $porDefecto;
            $valor = $valor[$parte];
        }
        return $valor;
    }

    public static function ajuste(string $nombre): mixed
    {
        $propios = self::$datos['ajustes'] ?? [];
        if ($nombre === 'limites') return array_replace(self::AJUSTES['limites'], $propios['limites'] ?? []);
        if (!array_key_exists($nombre, self::AJUSTES)) throw new \LogicException("Ajuste desconocido: {$nombre}");
        return $propios[$nombre] ?? self::AJUSTES[$nombre];
    }

    public static function local(): bool
    {
        return self::get('entorno') === 'local';
    }
}
