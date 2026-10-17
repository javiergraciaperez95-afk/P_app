<?php
declare(strict_types=1);

namespace Paglot;

/** La petición que llega: método, ruta, IP, cabeceras y el cuerpo JSON (ya comprobado). */
final class Peticion
{
    public readonly string $metodo;
    public readonly string $ruta;
    public readonly string $ip;
    public readonly ?string $origen;
    public readonly string $agente;
    /** Parámetros sacados de la ruta (p. ej. el curso de /progreso/{curso}). */
    public array $parametros = [];

    private ?\stdClass $cuerpo = null;
    private bool $cuerpoLeido = false;

    public function __construct(private readonly array $servidor, private readonly ?string $crudo = null)
    {
        $this->metodo = strtoupper((string) ($servidor['REQUEST_METHOD'] ?? 'GET'));
        $ruta = parse_url((string) ($servidor['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
        $this->ruta = is_string($ruta) && $ruta !== '' ? rawurldecode($ruta) : '/';
        $this->ip = self::calcularIp($servidor);
        $origen = $servidor['HTTP_ORIGIN'] ?? null;
        $this->origen = is_string($origen) && $origen !== '' ? $origen : null;
        $this->agente = (string) ($servidor['HTTP_USER_AGENT'] ?? '');
    }

    public static function actual(): self
    {
        return new self($_SERVER);
    }

    /** La IP de quien llama. Solo se mira la cabecera del proxy si la petición viene de un proxy de confianza. */
    private static function calcularIp(array $s): string
    {
        $ip = (string) ($s['REMOTE_ADDR'] ?? '');
        $proxys = (array) Config::get('proxys', []);
        if ($ip !== '' && in_array($ip, $proxys, true)) {
            $cabecera = (string) ($s[(string) Config::get('cabecera_ip', 'HTTP_X_FORWARDED_FOR')] ?? '');
            // X-Forwarded-For: «cliente, proxy1, proxy2»: la buena es la última que no es de un proxy nuestro.
            foreach (array_reverse(array_map('trim', explode(',', $cabecera))) as $candidata) {
                if (filter_var($candidata, FILTER_VALIDATE_IP) && !in_array($candidata, $proxys, true)) return $candidata;
            }
        }
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }

    public function cabecera(string $nombre): ?string
    {
        $clave = 'HTTP_' . strtoupper(str_replace('-', '_', $nombre));
        $valor = $this->servidor[$clave] ?? null;
        if ($nombre === 'Content-Type') $valor ??= $this->servidor['CONTENT_TYPE'] ?? null;
        if ($nombre === 'Authorization') $valor ??= $this->servidor['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        return is_string($valor) ? $valor : null;
    }

    /** El token de la sesión («Authorization: Bearer …»). Nunca se acepta en la URL (plan, entrada 80). */
    public function token(): ?string
    {
        $cabecera = $this->cabecera('Authorization');
        if ($cabecera === null || !preg_match('/^Bearer ([A-Za-z0-9_-]{43})$/D', trim($cabecera), $m)) return null;
        return $m[1];
    }

    /**
     * El cuerpo de la petición como objeto JSON. Tiene que llegar como application/json (así el navegador
     * siempre pregunta antes por CORS), no pasar del tamaño máximo y ser un objeto.
     * Se decodifica a objetos (no a arrays) para no confundir {} con [].
     */
    public function cuerpo(): \stdClass
    {
        if ($this->cuerpoLeido) return $this->cuerpo ?? new \stdClass();
        $this->cuerpoLeido = true;

        $maximo = (int) Config::ajuste('cuerpo_max');
        $declarado = $this->servidor['CONTENT_LENGTH'] ?? null;
        if (is_numeric($declarado) && (int) $declarado > $maximo) throw new ErrorApi(413, 'demasiado_grande');

        $crudo = $this->crudo ?? (string) file_get_contents('php://input', false, null, 0, max(0, $maximo + 1));
        if (strlen($crudo) > $maximo) throw new ErrorApi(413, 'demasiado_grande');
        if (trim($crudo) === '') return $this->cuerpo = new \stdClass();

        $tipo = strtolower(trim(explode(';', (string) $this->cabecera('Content-Type'))[0]));
        if ($tipo !== 'application/json') throw new ErrorApi(415, 'tipo_contenido');

        try {
            $datos = json_decode($crudo, false, 64, JSON_THROW_ON_ERROR | JSON_BIGINT_AS_STRING);
        } catch (\JsonException) {
            throw new ErrorApi(400, 'json_invalido');
        }
        if (!$datos instanceof \stdClass) throw new ErrorApi(400, 'json_invalido');
        return $this->cuerpo = $datos;
    }

    /**
     * Solo se aceptan los campos que se esperan: uno de más es un error, no se ignora en silencio.
     * Devuelve el cuerpo.
     */
    public function campos(array $permitidos): \stdClass
    {
        $cuerpo = $this->cuerpo();
        foreach (array_keys(get_object_vars($cuerpo)) as $campo) {
            if (!in_array($campo, $permitidos, true)) throw ErrorApi::datos((string) $campo, 'sobra');
        }
        return $cuerpo;
    }

    /** Un campo de texto. $requerido = false: devuelve null si no viene. */
    public function texto(string $campo, bool $requerido = true): ?string
    {
        $cuerpo = $this->cuerpo();
        if (!property_exists($cuerpo, $campo) || $cuerpo->$campo === null) {
            if ($requerido) throw ErrorApi::datos($campo, 'falta');
            return null;
        }
        if (!is_string($cuerpo->$campo)) throw ErrorApi::datos($campo, 'tipo');
        return $cuerpo->$campo;
    }
}
