// En qué país está la persona, para enseñarle los precios de su zona en la web.
// Se adivina con la ZONA HORARIA y el IDIOMA configurados en su dispositivo: no se usa la ubicación exacta
// ni la dirección IP, no se guarda y no sale del navegador. Así lo explica el aviso legal («legal.region.*»).
// En la app, el precio lo pone la tienda (Google Play o App Store) según la cuenta de cada uno.

import { ZONAS } from './config.js';

// Zona horaria → país (las más habituales; el resto cae en el idioma del navegador).
const PAIS_POR_HUSO = {
  'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES', 'Africa/Ceuta': 'ES', 'Europe/Lisbon': 'PT', 'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE', 'Europe/Luxembourg': 'LU', 'Europe/Zurich': 'CH', 'Europe/Vienna': 'AT', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Atlantic/Reykjavik': 'IS', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Bratislava': 'SK',
  'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG', 'Europe/Athens': 'GR', 'Europe/Ljubljana': 'SI', 'Europe/Zagreb': 'HR',
  'Europe/Belgrade': 'RS', 'Europe/Tallinn': 'EE', 'Europe/Riga': 'LV', 'Europe/Vilnius': 'LT', 'Europe/Malta': 'MT', 'Asia/Nicosia': 'CY',
  'Europe/Istanbul': 'TR', 'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Europe/Moscow': 'RU', 'Asia/Yekaterinburg': 'RU', 'Asia/Novosibirsk': 'RU',
  'Asia/Vladivostok': 'RU', 'Asia/Almaty': 'KZ',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Phoenix': 'US', 'America/Los_Angeles': 'US',
  'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Detroit': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/Mexico_City': 'MX', 'America/Monterrey': 'MX',
  'America/Tijuana': 'MX', 'America/Cancun': 'MX', 'America/Guatemala': 'GT', 'America/Costa_Rica': 'CR', 'America/Panama': 'PA',
  'America/Santo_Domingo': 'DO', 'America/Bogota': 'CO', 'America/Lima': 'PE', 'America/Guayaquil': 'EC', 'America/Caracas': 'VE',
  'America/La_Paz': 'BO', 'America/Santiago': 'CL', 'America/Argentina/Buenos_Aires': 'AR', 'America/Buenos_Aires': 'AR',
  'America/Montevideo': 'UY', 'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Manaus': 'BR', 'America/Recife': 'BR',
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW', 'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN',
  'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID', 'Asia/Manila': 'PH', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Colombo': 'LK', 'Asia/Kathmandu': 'NP', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Jerusalem': 'IL', 'Asia/Tel_Aviv': 'IL',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU',
  'Pacific/Auckland': 'NZ', 'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE', 'Africa/Casablanca': 'MA', 'Africa/Algiers': 'DZ',
  'Africa/Tunis': 'TN', 'Africa/Accra': 'GH', 'Africa/Addis_Ababa': 'ET', 'Africa/Dar_es_Salaam': 'TZ', 'Africa/Kampala': 'UG',
  'Africa/Johannesburg': 'ZA',
};
// Si tampoco hay zona horaria conocida, se supone por el idioma.
const PAIS_POR_IDIOMA = { vi: 'VN', id: 'ID', pt: 'BR', es: 'ES', en: 'US', zh: 'CN', ja: 'JP', ko: 'KR', de: 'DE', fr: 'FR', it: 'IT', tr: 'TR', th: 'TH', ru: 'RU', pl: 'PL' };

/** El país (código de dos letras) que se deduce del dispositivo, o '' si no se sabe. */
export function paisProbable() {
  let huso = '';
  try { huso = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''; } catch { /* navegador viejo */ }
  if (PAIS_POR_HUSO[huso]) return PAIS_POR_HUSO[huso];
  const [lengua, region] = (navigator.language ?? '').split('-');
  return (region ?? PAIS_POR_IDIOMA[lengua?.toLowerCase()] ?? '').toUpperCase();
}

/** Los precios de la zona de esa persona (si no se sabe, los de la zona B). */
export function preciosDeSuZona() {
  const pais = paisProbable();
  return ZONAS[Object.keys(ZONAS).find(z => ZONAS[z].paises.includes(pais)) ?? 'B'];
}

/** La letra de la zona de esa persona (A, B, C o D; si no se sabe, la B). El servidor cobra el precio de esa zona. */
export function zonaDeSuPais() {
  const pais = paisProbable();
  return Object.keys(ZONAS).find(z => ZONAS[z].paises.includes(pais)) ?? 'B';
}
