// Configuración de Supabase (cuentas y progreso en la nube).
// Pega aquí la URL del proyecto y la clave PÚBLICA («anon» o «publishable»).
// Nunca pongas aquí la clave secreta («service_role» o «secret»).
// Si se dejan vacías, la app funciona igual, guardando solo en este navegador.

export const SUPABASE_URL = '';
export const SUPABASE_CLAVE_PUBLICA = '';

// Tabla propia de esta app (ver supabase/esquema.sql). No es «public.progress».
// Vacío a propósito: el progreso se queda en este navegador y no se mezcla con las otras apps.
export const SUPABASE_TABLA = 'sueco_progreso';
