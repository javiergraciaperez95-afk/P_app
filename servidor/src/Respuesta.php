<?php
declare(strict_types=1);

namespace Paglot;

/** Lo que se devuelve: siempre JSON, siempre con las cabeceras de seguridad. */
final class Respuesta
{
    public function __construct(
        public readonly int $estado,
        public readonly array|\stdClass|null $cuerpo = null,
        public array $cabeceras = [],
    ) {
    }

    public static function ok(array|\stdClass $cuerpo = ['ok' => true], int $estado = 200): self
    {
        return new self($estado, $cuerpo);
    }

    /** 202: «hecho, si procede» (p. ej. «si existe la cuenta, te hemos enviado un correo»). */
    public static function aceptado(): self
    {
        return new self(202, ['ok' => true]);
    }

    public static function vacia(int $estado = 204): self
    {
        return new self($estado);
    }

    public static function deError(ErrorApi $e): self
    {
        return new self($e->estado, ['error' => $e->codigo] + $e->extra, $e->cabeceras);
    }

    /** Cabeceras comunes a toda respuesta de la API (plan, entradas 32–35 y 131). */
    public static function cabecerasSeguridad(): array
    {
        $cabeceras = [
            'Cache-Control'           => 'no-store',
            'X-Content-Type-Options'  => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; frame-ancestors 'none'",
            'Referrer-Policy'         => 'no-referrer',
            'Cross-Origin-Resource-Policy' => 'same-origin',
            'X-Frame-Options'         => 'DENY',
        ];
        if (!Config::local()) $cabeceras['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
        return $cabeceras;
    }

    public function texto(): string
    {
        if ($this->cuerpo === null) return '';
        return json_encode($this->cuerpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR);
    }

    public function enviar(): void
    {
        $texto = $this->texto();
        http_response_code($this->estado);
        header_remove('X-Powered-By');
        foreach (self::cabecerasSeguridad() + $this->cabeceras as $nombre => $valor) {
            header("{$nombre}: {$valor}");
        }
        if ($this->cuerpo !== null) {
            header('Content-Type: application/json; charset=utf-8');
            header('Content-Length: ' . strlen($texto));
            echo $texto;
        }
    }
}
