// Configuración de Supabase (cuentas y progreso en la nube).
// Pega aquí la URL del proyecto y la clave PÚBLICA («anon» o «publishable»).
// Nunca pongas aquí la clave secreta («service_role» o «secret»).
// Si se dejan vacías, la app funciona igual, guardando solo en este navegador.

export const SUPABASE_URL = 'https://iuniglsiqnfvnotmfgdo.supabase.co';
export const SUPABASE_CLAVE_PUBLICA = 'sb_publishable_dZDATuXD7GFWilF-SnWXyw_KVWjyX4P';

// La tabla de cada curso está en js/cursos.js (campo «tabla»).

// Quién responde de la app y de los datos: sale en la página «Aviso legal y privacidad» (#/legal).
// Lo que se deje vacío aparece como «pendiente de completar». Hay que rellenarlo antes de publicar la app.
export const TITULAR = {
  nombre: '',     // nombre y apellidos (o el nombre de la empresa)
  nif: '',        // NIF / DNI
  direccion: '',  // domicilio o, como mínimo, ciudad y país
  correo: '',     // correo de contacto para peticiones sobre los datos
};
// Fecha de la última vez que se cambió el aviso legal (cámbiala al tocar sus textos).
export const LEGAL_ACTUALIZADO = '13-10-2026';

// Adónde vuelven los enlaces de los correos (confirmar cuenta, cambiar contraseña) cuando la app va instalada
// en un móvil. Tiene que estar también en Supabase → Authentication → URL Configuration → Redirect URLs.
export const ENLACE_APP = 'idiomasapp://auth';
