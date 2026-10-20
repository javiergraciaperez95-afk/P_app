// Supabase: en local, las cuentas y el progreso (ver js/servidor.js y _herramientas/supabase-cuentas-v2.sql); en el hosting, la segunda llave de los pagos.
// Solo la clave PÚBLICA («publishable»); nunca la secreta. Si se dejan vacías, la app guarda solo en el dispositivo.

export const SUPABASE_URL = 'https://iuniglsiqnfvnotmfgdo.supabase.co';
// Captcha de los formularios (Cloudflare Turnstile, js/captcha.js). Esta es la clave de PRUEBAS de Cloudflare (deja
// pasar siempre): al publicar, cámbiala por la del sitio (dash.cloudflare.com → Turnstile → paglot.eu) y pon la secreta
// en el servidor (api/config.php), que es quien comprueba el token.
export const TURNSTILE_CLAVE = '1x00000000000000000000AA';
export const SUPABASE_CLAVE_PUBLICA = 'sb_publishable_dZDATuXD7GFWilF-SnWXyw_KVWjyX4P';

// Quién responde de la app y de los datos: sale en la página «Aviso legal y privacidad» (#/legal).
// Lo que se deje vacío aparece como «pendiente de completar». Hay que rellenarlo antes de publicar la app.
export const TITULAR = {
  nombre: '',     // nombre y apellidos (o el nombre de la empresa)
  nif: '',        // NIF / DNI
  direccion: '',  // domicilio o, como mínimo, ciudad y país
  correo: '',     // correo de contacto para peticiones sobre los datos
};
// Fecha de la última vez que se cambió el aviso legal (cámbiala al tocar sus textos).
export const LEGAL_ACTUALIZADO = '20-10-2026';

// ----- Ayudar sin suscribirse: los botones de Patreon y Buy Me a Coffee encima de los precios (#/precios) -----
// Vacíos hasta que existan las páginas de verdad: mientras, el botón dice «Muy pronto».
export const APOYO = {
  patreon: '',
  cafe: '',
};

// ----- Precios (pantalla #/precios). Todavía no se cobra nada ni se aplica el límite: es el plan. -----
// Lecciones nuevas que se pueden empezar cada día en el plan gratis.
export const LECCIONES_GRATIS_AL_DIA = 3;
// Rondas de «Práctica» al día en el plan gratis.
export const PRACTICAS_GRATIS_AL_DIA = 1;
// Palabras que se pueden guardar a mano (con la estrella) en el plan gratis. Las de las lecciones terminadas no cuentan.
export const CUADERNO_GRATIS = 50;
// El repaso no se limita nunca: es lo que hace que lo estudiado se quede.
// Precios en euros por zona (según el poder adquisitivo; orientativos: el de verdad se pone en la tienda, en la moneda
// de cada país). Plus: el plan barato, que solo paga los gastos. Max: todo + 6 libros del idioma (impresos en las zonas
// A y B; en PDF en C y D, donde enviar papel no sale a cuenta). Un país que no esté en ninguna lista va a la zona B.
// Plan de negocio: Documents/Paglot/Documentación/Paglot_Plan_de_Negocio.pdf
export const ZONAS = {
  A: {
    plusMes: 4.99, plusAno: 39.99, familia: 79, fundadores: 99, maxMes: 14.99, maxAno: 129, libros: 'impresos',
    paises: ['US', 'GB', 'DE', 'FR', 'IT', 'NL', 'SE', 'NO', 'DK', 'JP', 'AU', 'CA', 'CH', 'AT', 'BE', 'IE', 'FI', 'ES', 'KR', 'NZ', 'SG', 'IL', 'LU', 'IS'],
  },
  B: {
    plusMes: 2.99, plusAno: 23.99, familia: 47.99, fundadores: 59, maxMes: 8.99, maxAno: 77.99, libros: 'impresos',
    paises: ['PT', 'PL', 'GR', 'RO', 'CZ', 'HU', 'CL', 'UY', 'SK', 'SI', 'EE', 'LV', 'LT', 'HR', 'TW', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'CY', 'MT', 'HK'],
  },
  C: {
    plusMes: 1.99, plusAno: 15.99, familia: 31.99, fundadores: 39, maxMes: 5.99, maxAno: 51.99, libros: 'pdf',
    paises: ['MX', 'BR', 'TR', 'CN', 'TH', 'AR', 'CO', 'PE', 'RU', 'UA', 'MY', 'ZA', 'CR', 'DO', 'EC', 'GT', 'BG', 'RS', 'KZ', 'PA'],
  },
  D: {
    plusMes: 0.99, plusAno: 7.99, familia: 15.99, fundadores: 19, maxMes: 2.99, maxAno: 25.99, libros: 'pdf',
    paises: ['VN', 'ID', 'IN', 'PH', 'EG', 'NG', 'PK', 'BD', 'KE', 'MA', 'DZ', 'TN', 'LK', 'NP', 'GH', 'ET', 'TZ', 'UG', 'BO', 'VE'],
  },
};
// Precios del informe de mercado (_notas/INFORME_MERCADO_2026-10-19, cap. 3.3), puestos el 20-10-2026. Con false, las
// páginas de pago vuelven a decir «Precio por anunciar».
export const PRECIOS_VISIBLES = true;
// Plazas del plan «Fundadores» (Plus para siempre con un solo pago).
export const PLAZAS_FUNDADORES = 500;

// ----- Escuelas y empresas (#/escuelas, #/empresas): se factura directamente, sin pasar por las tiendas. -----
// Plan: Documents/Paglot/Documentación/Paglot_Plan_Escuelas_y_Empresas.pdf. Precios sin IVA.
// Las licencias son Plus anual de la zona con el descuento del tramo («desde» = alumnos o personas mínimas).
// Lo que va en euros (cursos a medida) es el precio de la zona A: en las demás se escala igual que Plus.
export const ESCUELAS = {
  tramos: [{ desde: 20, descuento: 0.25 }, { desde: 100, descuento: 0.4 }, { desde: 500, descuento: 0.55 }],
  unidadMedida: 1200, // 10 lecciones con el temario del centro; un 40 % menos si deja publicarla para todos
};
export const EMPRESAS = {
  tramos: [{ desde: 5, descuento: 0.2 }, { desde: 25, descuento: 0.35 }, { desde: 100, descuento: 0.5 }],
  maxDescuento: 0.3,  // Max Empresa, desde 5 personas
  unidadSector: 1500,  // 10 lecciones de su sector, con una lengua de explicación
  unidadCedida: 900,  // si deja publicarla, sin datos internos
  lenguaExtra: 150,   // cada lengua de explicación más
};

