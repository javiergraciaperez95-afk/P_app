<?php
declare(strict_types=1);

namespace Paglot;

/** Las cuentas en la base de datos. */
final class Usuarios
{
    public static function porId(string $id): ?array
    {
        return Bd::uno('SELECT * FROM usuarios WHERE id = ?', [$id]);
    }

    /** La cuenta, que tiene que existir (si se ha borrado a la vez, la sesión ya no vale). */
    public static function obtener(string $id): array
    {
        return self::porId($id) ?? throw new ErrorApi(401, 'sin_sesion');
    }

    public static function porCorreo(string $correo): ?array
    {
        return Bd::uno('SELECT * FROM usuarios WHERE correo = ?', [$correo]);
    }

    /** Lo que se le enseña a la app de una cuenta. Nunca la huella de la contraseña (plan, entrada 128). */
    public static function publico(array $u): array
    {
        return [
            'id'         => $u['id'],
            'correo'     => $u['correo'],
            'nombre'     => $u['nombre'],
            'foto'       => $u['foto'] === null ? null : Foto::aUrl($u['foto']),
            'idioma'     => $u['idioma'],
            'confirmado' => $u['confirmado'] !== null,
            'creado'     => Tiempo::iso($u['creado']),
        ];
    }

    /** Guarda una huella nueva (p. ej. al pasar de bcrypt a Argon2id) sin tocar nada más. */
    public static function cambiarHuella(string $id, string $huella): void
    {
        Bd::ejecutar('UPDATE usuarios SET hash = ?, actualizado = ? WHERE id = ?', [$huella, Tiempo::bd(), $id]);
    }

    /**
     * Huella corta de la huella de la contraseña. Va en los enlaces de confirmar: si la contraseña cambia
     * (alguien se vuelve a registrar con el mismo correo), los enlaces anteriores dejan de valer.
     */
    public static function marcaContrasena(string $huella): string
    {
        return substr(Seguridad::hmac('contrasena' . "\0" . $huella), 0, 32);
    }
}
