// Cómo se pronuncia una palabra, explicado para hispanohablantes.
// Se genera solo a partir de la ortografía (el vietnamita se escribe casi como suena):
//   1) el SONIDO de cada sílaba: consonante inicial + vocal + final;
//   2) el TONO de cada sílaba, en una línea.
// Referencia: acento del norte (Hanói), con la variante del sur cuando cambia mucho.

const MARCAS_TONO = { '̀': 'huyen', '́': 'sac', '̉': 'hoi', '̃': 'nga', '̣': 'nang' };

export const TONOS = {
  ngang: { nombre: 'llano (ngang)', flecha: '→', texto: 'voz media y recta, sin subir ni bajar.' },
  huyen: { nombre: 'huyền', flecha: '↘', texto: 'empieza medio y baja suave, relajado.' },
  sac: { nombre: 'sắc', flecha: '↗', texto: 'empieza medio y sube con fuerza.' },
  hoi: { nombre: 'hỏi', flecha: '↘↗', texto: 'baja y vuelve a subir, como un «¿eh?» de duda.' },
  nga: { nombre: 'ngã', flecha: '~↗', texto: 'sube con un pequeño corte en la garganta a mitad.' },
  nang: { nombre: 'nặng', flecha: '↓', texto: 'grave y cortado: cae y se para de golpe.' },
};

const INICIALES = {
  ngh: '«ng» nasal, como la n de «tengo» pero al principio de la palabra',
  ng: '«ng» nasal, como la n de «tengo» pero al principio de la palabra',
  nh: 'como la «ñ»',
  ch: 'como la «ch» española, más suave',
  gh: 'g suave, como en «agua»',
  gi: 'en el norte, como una «z» que zumba (la «s» de «mismo»); en el sur, como «y»',
  kh: 'como la «j» de «jamón», pero más suave',
  ph: 'como la «f»',
  th: 't con un soplo de aire (como la t inglesa de «top»)',
  tr: 'en el norte, como «ch»; en el sur, «ch» con la lengua hacia atrás',
  qu: '«cu», como en «cuando»',
  b: 'b como en español, con los labios bien cerrados',
  c: 'c de «casa» (sonido k)',
  k: 'como la c de «casa»',
  d: 'en el norte, como una «z» que zumba (la «s» de «mismo»); en el sur, como «y»',
  đ: 'd española bien marcada, como en «dedo»',
  g: 'g suave, como en «agua»',
  h: 'h aspirada: como una «j» muy suave',
  l: 'l como en español',
  m: 'm como en español',
  n: 'n como en español',
  p: 'p como en español',
  r: 'en el norte, como una «z» que zumba; en el sur, una r suave',
  s: 'como una «s» (en el sur, más bien «sh»)',
  t: 't como en español, sin soplar aire',
  v: 'v con el labio de abajo tocando los dientes (como la v inglesa)',
  x: 'como una «s»',
};
const ORDEN_INICIALES = Object.keys(INICIALES).sort((a, b) => b.length - a.length);

const FINALES = {
  ch: 'termina en una «k» cortada, con la boca como sonriendo',
  nh: 'en el norte suena casi como «-ing»',
  ng: 'termina en «ng» nasal, como «tengo» sin la o',
  c: 'termina en una «k» que no se suelta (se corta el aire)',
  m: 'termina en «m», con los labios cerrados',
  n: 'termina en «n»',
  p: 'termina en una «p» que no se suelta (labios cerrados)',
  t: 'termina en una «t» que no se suelta',
};
const ORDEN_FINALES = ['ch', 'nh', 'ng', 'c', 'm', 'n', 'p', 't'];

const VOCALES = {
  a: 'a como en español',
  ă: 'una «a» corta y rápida',
  â: 'una «e» neutra muy corta, entre «a» y «e»',
  e: 'e muy abierta, casi «ea»',
  ê: 'e cerrada, como en «mesa»',
  i: 'i como en español',
  y: 'i como en español',
  o: 'o muy abierta, con la boca bien redonda',
  ô: 'o cerrada, como en «todo»',
  ơ: 'una «e» relajada y neutra, con la boca entreabierta',
  u: 'u como en español',
  ư: 'una «u» con los labios estirados, como sonriendo',
};

const GRUPOS = {
  ia: '«ia», con la a muy suave', iê: '«ie»', yê: '«ie»', ya: '«ia», con la a suave',
  ua: '«ua», con la a suave', uô: '«uo»', ưa: 'ư (u sonriendo) + una a suave', ươ: 'ư (u sonriendo) + ơ',
  oa: '«ua»', oă: '«ua» corta', oe: '«ue»', uê: '«ue», con la e cerrada', uy: '«ui»',
  ai: '«ai»', ao: '«ao», casi «au»', au: 'a corta + u («au» rápido)', âu: '«eu» con la e neutra, rápido',
  ay: 'a corta + i («ai» rápido)', ây: '«ei» con la e neutra', eo: '«eo», con la e abierta',
  êu: '«eu», con la e cerrada', iu: '«iu»', oi: '«oi», con la o abierta', ôi: '«oi», con la o cerrada',
  ơi: 'ơ + i («ei» relajado)', ui: '«ui»', ưi: 'ư (u sonriendo) + i', uôi: '«uoi»',
  ươi: 'ư + ơ + i (como «uei» con la u sonriendo)', iêu: '«ieu»', yêu: '«ieu»', oai: '«uai»',
  oay: '«uai» rápido', uya: '«uia»', uyê: '«uie»', ưu: 'ư (u sonriendo) + u', ươu: 'ư + ơ + u',
};

/** Quita la marca de tono: devuelve la sílaba sin tono (en minúsculas) y el tono. */
export function separarTono(silaba) {
  let tono = 'ngang';
  let base = '';
  for (const ch of silaba.normalize('NFD')) {
    if (MARCAS_TONO[ch]) tono = MARCAS_TONO[ch];
    else base += ch;
  }
  return { base: base.normalize('NFC').toLowerCase(), tono };
}

/** Divide una sílaba en inicial + vocal + final. Devuelve null si no parece vietnamita. */
function analizarSilaba(base) {
  let inicial = '';
  let resto = base;
  if (base === 'gi') return { inicial: 'gi', vocal: 'i', final: '' };
  for (const ini of ORDEN_INICIALES) {
    if (resto.startsWith(ini) && resto.length > ini.length) {
      inicial = ini;
      resto = resto.slice(ini.length);
      break;
    }
  }
  let final = '';
  for (const fin of ORDEN_FINALES) {
    if (resto.endsWith(fin) && resto.length > fin.length) {
      final = fin;
      resto = resto.slice(0, -fin.length);
      break;
    }
  }
  if (!resto || ![...resto].every((ch) => VOCALES[ch])) return null;
  return { inicial, vocal: resto, final };
}

export function esSilabaVietnamita(silaba) {
  const { base } = separarTono(String(silaba).replace(/[^\p{L}\p{M}]/gu, ''));
  return !!base && !!analizarSilaba(base);
}

function textoVocal(v) {
  if (GRUPOS[v]) return GRUPOS[v];
  if (v.length === 1) return VOCALES[v];
  return [...v].map((ch) => `${ch}: ${VOCALES[ch]}`).join('; ');
}

/**
 * Explicación completa de una palabra.
 * Devuelve { sonido: [{ silaba, partes: [{ letras, texto }] }], tonos: [{ silaba, ...TONOS[x] }], propio }
 * `propio` es la explicación escrita a mano en la lección (si la hay), que sustituye a la automática del sonido.
 */
export function explicarPalabra(vi, propio = '') {
  const silabas = String(vi).trim().split(/\s+/).filter(Boolean);
  const sonido = [];
  const tonos = [];
  for (const s of silabas) {
    const { base, tono } = separarTono(s.replace(/[^\p{L}\p{M}]/gu, ''));
    if (!base) continue;
    const a = analizarSilaba(base);
    if (!a) { sonido.push({ silaba: s, partes: null }); continue; } // p. ej. un nombre extranjero: sin tono
    tonos.push({ silaba: s, ...TONOS[tono] });
    const partes = [];
    if (a.inicial) partes.push({ letras: a.inicial, texto: INICIALES[a.inicial] });
    partes.push({ letras: a.vocal, texto: textoVocal(a.vocal) });
    if (a.final) {
      let t = FINALES[a.final];
      if (a.final === 'ng' && /[oôu]$/.test(a.vocal)) t += '; tras «o», «ô» o «u», además se cierran los labios';
      partes.push({ letras: `-${a.final}`, texto: t });
    }
    sonido.push({ silaba: s, partes });
  }
  return { sonido, tonos, propio: String(propio || '').trim() };
}

/** Texto plano (para la tutora). */
export function textoSonido(ex) {
  if (ex.propio) return ex.propio;
  return ex.sonido.map((s) => (s.partes
    ? `${s.silaba}: ${s.partes.map((p) => `${p.letras} → ${p.texto}`).join(' · ')}`
    : `${s.silaba}: se lee casi como en español`)).join('\n');
}

export function textoTonos(ex) {
  return ex.tonos.map((t) => `${t.silaba}: ${t.flecha} ${t.nombre}, ${t.texto}`).join('\n');
}
