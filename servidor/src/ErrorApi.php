<?php
declare(strict_types=1);

namespace Paglot;

/**
 * Un error que se le cuenta a la app: estado HTTP + un código corto que la app traduce con t('clave')
 * (plan, entrada 129). Nunca lleva detalles internos.
 */
final class ErrorApi extends \RuntimeException
{
    public function __construct(
        public readonly int $estado,
        public readonly string $codigo,
        public readonly array $extra = [],
        public readonly array $cabeceras = [],
    ) {
        parent::__construct($codigo, $estado);
    }

    public static function datos(string $campo, string $motivo = 'invalido'): self
    {
        return new self(400, 'datos_invalidos', ['campo' => $campo, 'motivo' => $motivo]);
    }

    public static function demasiados(int $segundos): self
    {
        $segundos = max(1, $segundos);
        return new self(429, 'demasiados', ['reintentar' => $segundos], ['Retry-After' => (string) $segundos]);
    }
}
