<?php
declare(strict_types=1);

namespace Paglot;

/** Las horas, siempre en UTC y con milisegundos, en el formato de la base de datos. */
final class Tiempo
{
    public static function ahora(): \DateTimeImmutable
    {
        return new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
    }

    /** Ahora + $segundos (negativo para el pasado), listo para la base de datos. */
    public static function bd(int $segundos = 0): string
    {
        return self::ahora()->modify(sprintf('%+d seconds', $segundos))->format('Y-m-d H:i:s.v');
    }

    /** De la base de datos a ISO 8601 («2026-10-17T10:00:00.000Z»), que es lo que entiende JavaScript. */
    public static function iso(?string $bd): ?string
    {
        if ($bd === null) return null;
        $fecha = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s.v', $bd, new \DateTimeZone('UTC'))
            ?: new \DateTimeImmutable($bd, new \DateTimeZone('UTC'));
        return $fecha->format('Y-m-d\TH:i:s.v\Z');
    }

    /** Segundos que faltan hasta una hora de la base de datos (0 si ya pasó). */
    public static function faltan(string $bd): int
    {
        $fecha = new \DateTimeImmutable($bd, new \DateTimeZone('UTC'));
        return max(0, $fecha->getTimestamp() - self::ahora()->getTimestamp());
    }
}
