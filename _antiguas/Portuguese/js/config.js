// Configuración de Supabase (cuentas y progreso en la nube) de la app de portugués.
//
// Pega aquí la «Project URL» y la clave PÚBLICA («anon» o «publishable») de TU proyecto
// de Supabase (panel → Project Settings → API). Son públicas por diseño: la seguridad
// la ponen las políticas RLS de supabase/esquema.sql.
// NUNCA pongas aquí la clave secreta («service_role» o «secret»).
//
// Si se dejan vacías, la app funciona igual y guarda el progreso solo en este navegador.
// Las tablas que usa están en supabase/esquema.sql (prefijo «portuguese_»); no tocan
// las de ninguna otra app (por ejemplo, «dansk_progreso» de la app de danés).

export const SUPABASE_URL = '';
export const SUPABASE_CLAVE_PUBLICA = '';
