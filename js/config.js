// Supabase: donde se guarda el progreso de la cuenta (ver js/nube.js y _herramientas/supabase-phuong.sql).
// Solo la clave PÚBLICA («publishable»); nunca la secreta. Si se dejan vacías, la app guarda solo en el dispositivo.
export const SUPABASE_URL = 'https://iuniglsiqnfvnotmfgdo.supabase.co';
export const SUPABASE_CLAVE_PUBLICA = 'sb_publishable_dZDATuXD7GFWilF-SnWXyw_KVWjyX4P';

// La cuenta es un código de 4 cifras. Aquí solo va su huella (SHA-256 de «phuong-app:<código>»), con la que la app
// lo comprueba también sin conexión; el servidor lo comprueba otra vez con la suya.
export const HUELLA_CODIGO = '2168246d691b8c1df3ee8123e8c1b06994222d6982281689c192d439a612cdfa';
export const CIFRAS_CODIGO = 4;
