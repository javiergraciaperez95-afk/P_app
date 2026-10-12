// Configuración de Supabase (cuentas y progreso en la nube).
// Pega aquí la URL del proyecto y la clave PÚBLICA («anon» o «publishable»).
// Nunca pongas aquí la clave secreta («service_role» o «secret»).
// Si se dejan vacías, la app funciona igual, guardando solo en este navegador.

export const SUPABASE_URL = 'https://iuniglsiqnfvnotmfgdo.supabase.co';
export const SUPABASE_CLAVE_PUBLICA = 'sb_publishable_dZDATuXD7GFWilF-SnWXyw_KVWjyX4P';

// La tabla de cada curso está en js/cursos.js (campo «tabla»).

// Adónde vuelven los enlaces de los correos (confirmar cuenta, cambiar contraseña) cuando la app va instalada
// en un móvil. Tiene que estar también en Supabase → Authentication → URL Configuration → Redirect URLs.
export const ENLACE_APP = 'idiomasapp://auth';

// Dónde están los audios de las lecciones.
// - Vacío: dentro de la propia app (carpeta cursos/<id>/audio). La app pesa más, pero no necesita internet.
// - Una dirección: los audios se descargan de ahí la primera vez que se abre cada lección y se quedan guardados
//   en el dispositivo. Dentro debe haber una carpeta por curso (es/, fr/…) con su indice.json y sus .mp3.
//   Con Supabase Storage: 'https://TU-PROYECTO.supabase.co/storage/v1/object/public/audios'
export const AUDIOS_EN_LINEA = '';
