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

// ----- Precios (pantalla #/precios). Todavía no se cobra nada ni se aplica el límite: es el plan. -----
// Lecciones nuevas que se pueden empezar cada día en el plan gratis.
export const LECCIONES_GRATIS_AL_DIA = 3;
// Precio en euros según el país (orientativo: el de verdad se pone en la tienda, en la moneda de cada país).
// Un país que no esté en ninguna lista paga el escalón «medio».
export const PRECIOS = {
  alto: { mes: 3.99, ano: 29.99, siempre: 79.99, paises: ['US', 'GB', 'DE', 'FR', 'IT', 'NL', 'SE', 'NO', 'DK', 'JP', 'AU', 'CA', 'CH', 'AT', 'BE', 'IE', 'FI'] },
  medio: { mes: 2.99, ano: 19.99, siempre: 54.99, paises: ['ES', 'PT', 'PL', 'KR', 'GR', 'RO', 'CZ', 'HU', 'CL', 'UY'] },
  bajo: { mes: 1.49, ano: 9.99, siempre: 27.99, paises: ['BR', 'MX', 'TR', 'TH', 'AR', 'CO', 'PE', 'CN', 'RU', 'UA', 'MY', 'ZA'] },
  minimo: { mes: 0.99, ano: 5.99, siempre: 15.99, paises: ['VN', 'ID', 'IN', 'PH', 'EG', 'NG', 'PK', 'BD'] },
};

// Adónde vuelven los enlaces de los correos (confirmar cuenta, cambiar contraseña) cuando la app va instalada
// en un móvil. Tiene que estar también en Supabase → Authentication → URL Configuration → Redirect URLs.
export const ENLACE_APP = 'idiomasapp://auth';
