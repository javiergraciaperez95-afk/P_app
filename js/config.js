// Supabase: donde se guarda el progreso de cada cuenta (ver js/nube.js y Para_lodriga/paglot-cuentas.sql).
// Solo la clave PÚBLICA («publishable»); nunca la secreta. Si se dejan vacías, la app guarda solo en el dispositivo.

export const SUPABASE_URL = 'https://iuniglsiqnfvnotmfgdo.supabase.co';
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
export const LEGAL_ACTUALIZADO = '19-10-2026';

// ----- Ayudar sin suscribirse: los botones de Patreon y Buy Me a Coffee encima de los precios (#/precios) -----
// FICTICIOS de momento: cámbialos por las páginas de verdad cuando existan.
export const APOYO = {
  patreon: 'https://www.patreon.com/paglot-ejemplo',
  cafe: 'https://www.buymeacoffee.com/paglot-ejemplo',
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
    plusMes: 2.49, plusAno: 14.99, familia: 24.99, fundadores: 39.99, maxMes: 34.99, maxAno: 399, libros: 'impresos',
    paises: ['US', 'GB', 'DE', 'FR', 'IT', 'NL', 'SE', 'NO', 'DK', 'JP', 'AU', 'CA', 'CH', 'AT', 'BE', 'IE', 'FI', 'ES', 'KR', 'NZ', 'SG', 'IL', 'LU', 'IS'],
  },
  B: {
    plusMes: 1.49, plusAno: 8.99, familia: 14.99, fundadores: 24.99, maxMes: 21.99, maxAno: 249, libros: 'impresos',
    paises: ['PT', 'PL', 'GR', 'RO', 'CZ', 'HU', 'CL', 'UY', 'SK', 'SI', 'EE', 'LV', 'LT', 'HR', 'TW', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'CY', 'MT', 'HK'],
  },
  C: {
    plusMes: 0.99, plusAno: 5.99, familia: 9.99, fundadores: 14.99, maxMes: 13.99, maxAno: 149, libros: 'pdf',
    paises: ['MX', 'BR', 'TR', 'CN', 'TH', 'AR', 'CO', 'PE', 'RU', 'UA', 'MY', 'ZA', 'CR', 'DO', 'EC', 'GT', 'BG', 'RS', 'KZ', 'PA'],
  },
  D: {
    plusMes: 0.49, plusAno: 2.99, familia: 4.99, fundadores: 7.99, maxMes: 8.99, maxAno: 99, libros: 'pdf',
    paises: ['VN', 'ID', 'IN', 'PH', 'EG', 'NG', 'PK', 'BD', 'KE', 'MA', 'DZ', 'TN', 'LK', 'NP', 'GH', 'ET', 'TZ', 'UG', 'BO', 'VE'],
  },
};
// Los precios no se enseñan hasta el informe de mercado (decisión del 19-10-2026): las páginas de pago dicen «Precio por anunciar».
export const PRECIOS_VISIBLES = false;
// Plazas del plan «Fundadores» (Plus para siempre con un solo pago).
export const PLAZAS_FUNDADORES = 2000;

// ----- Escuelas y empresas (#/escuelas, #/empresas): se factura directamente, sin pasar por las tiendas. -----
// Plan: Documents/Paglot/Documentación/Paglot_Plan_Escuelas_y_Empresas.pdf. Precios sin IVA.
// Las licencias son Plus anual de la zona con el descuento del tramo («desde» = alumnos o personas mínimas).
// Lo que va en euros (cursos a medida) es el precio de la zona A: en las demás se escala igual que Plus.
export const ESCUELAS = {
  tramos: [{ desde: 20, descuento: 0.5 }, { desde: 100, descuento: 0.6 }, { desde: 500, descuento: 0.7 }],
  unidadMedida: 450, // 10 lecciones con el temario del centro; la mitad si deja publicarla para todos
};
export const EMPRESAS = {
  tramos: [{ desde: 5, descuento: 0.2 }, { desde: 25, descuento: 0.35 }, { desde: 100, descuento: 0.5 }],
  maxDescuento: 0.3,  // Max Empresa, desde 5 personas
  unidadSector: 900,  // 10 lecciones de su sector, con una lengua de explicación
  unidadCedida: 540,  // si deja publicarla, sin datos internos
  lenguaExtra: 150,   // cada lengua de explicación más
};

