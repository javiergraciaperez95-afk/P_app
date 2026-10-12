// Análisis de frases en vietnamita: separar en palabras y explicarlas.
//
// En vietnamita cada sílaba va separada por un espacio, pero muchas palabras tienen
// 2 o más sílabas (học sinh, Việt Nam, Tây Ban Nha). Para agruparlas se busca, de
// izquierda a derecha, la palabra MÁS LARGA (hasta 4 sílabas) que exista en la
// lista "palabras" de la lección.

import { esc, nfc } from './util.js';
import { explicarPalabra, textoSonido, textoTonos } from './pronunciacion.js';

const MAX_SILABAS = 4;
const TOKEN = /_{2,}|[\p{L}\p{M}\p{N}]+/gu;

/** Forma de buscar una palabra: NFC, minúsculas y espacios simples. */
export function clave(texto) {
  return nfc(texto).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Divide una frase en segmentos:
 *  { tipo: 'palabra', texto, entrada }  (entrada = datos del diccionario o null)
 *  { tipo: 'otro', texto }              (espacios y signos)
 *  { tipo: 'hueco' }                    (___ en los ejercicios de completar)
 */
export function segmentar(texto, dic) {
  const toks = [];
  for (const m of texto.matchAll(TOKEN)) toks.push({ t: m[0], i: m.index, f: m.index + m[0].length });

  const segs = [];
  let pos = 0;
  let k = 0;
  while (k < toks.length) {
    const tok = toks[k];
    if (tok.i > pos) segs.push({ tipo: 'otro', texto: texto.slice(pos, tok.i) });

    if (tok.t.startsWith('_')) {
      segs.push({ tipo: 'hueco' });
      pos = tok.f;
      k++;
      continue;
    }

    let usados = 1;
    let entrada = null;
    for (let n = Math.min(MAX_SILABAS, toks.length - k); n >= 1; n--) {
      if (!seguidas(texto, toks, k, n)) continue;
      const e = dic.get(clave(toks.slice(k, k + n).map((x) => x.t).join(' ')));
      if (e) { entrada = e; usados = n; break; }
    }
    const fin = toks[k + usados - 1].f;
    segs.push({ tipo: 'palabra', texto: texto.slice(tok.i, fin), entrada });
    pos = fin;
    k += usados;
  }
  if (pos < texto.length) segs.push({ tipo: 'otro', texto: texto.slice(pos) });
  return segs;
}

/** ¿Las n sílabas desde k van seguidas, separadas solo por un espacio? */
function seguidas(texto, toks, k, n) {
  for (let j = k + 1; j < k + n; j++) {
    if (toks[j].t.startsWith('_')) return false;
    if (texto.slice(toks[j - 1].f, toks[j].i) !== ' ') return false;
  }
  return true;
}

/** HTML de una frase con cada palabra como botón (globo con traducción). */
export function htmlFrase(segs, textoHueco = '') {
  return segs.map((s) => {
    if (s.tipo === 'otro') return esc(s.texto);
    if (s.tipo === 'hueco') {
      return textoHueco
        ? `<span class="hueco lleno">${esc(textoHueco)}</span>`
        : '<span class="hueco" aria-label="hueco">?</span>';
    }
    if (!s.entrada) return `<span class="sin-datos">${esc(s.texto)}</span>`;
    const e = s.entrada;
    return `<button type="button" class="palabra" data-vi="${esc(e.vi)}" data-es="${esc(e.es)}" data-pron="${esc(e.pron)}" data-nota="${esc(e.nota)}" data-fonetica="${esc(e.fonetica || '')}">${esc(s.texto)}</button>`;
  }).join('');
}

/** Lo que dice la tutora al pulsar el sello de una frase (varias páginas). */
export function paginasFrase(f) {
  const palabras = f.segmentos.filter((s) => s.tipo === 'palabra');
  const paginas = [{ texto: `«${f.vi}»\nSignifica: ${f.es}`, expresion: 'normal' }];

  if (palabras.length > 1) {
    const lineas = palabras.map((s) => `${s.texto} → ${s.entrada ? s.entrada.es : '(no la tengo apuntada)'}`);
    paginas.push({ texto: 'Palabra por palabra:\n' + lineas.join('\n'), expresion: 'pensando' });
  }

  if (f.analisis?.length) {
    const lineas = f.analisis.map((a) => (a.funcion ? `${a.palabra} → ${a.funcion}` : a.palabra));
    paginas.push({ texto: 'Análisis de la frase:\n' + lineas.join('\n'), expresion: 'pensando' });
  }

  const pron = palabras.map((s) => s.entrada?.pron || '?').join(' · ');
  paginas.push({ texto: `Se pronuncia más o menos así:\n${pron}`, expresion: 'normal' });

  if (f.nota) paginas.push({ texto: f.nota, expresion: 'contenta' });
  return paginas;
}

/** Análisis sintáctico visible bajo la frase: fichas de colores por función. */
export function htmlAnalisis(analisis) {
  if (!analisis?.length) return '';
  return `<ul class="analisis" aria-label="Análisis sintáctico">${analisis.map((a) => `
    <li class="funcion funcion-${a.clase}"><span class="funcion-palabra" lang="vi">${esc(a.palabra)}</span>${a.funcion ? `<span class="funcion-nombre">${esc(a.funcion)}</span>` : ''}</li>`).join('')}
  </ul>`;
}

/** Lo que dice la tutora al pulsar una palabra del vocabulario: significado, sonido y tono. */
export function paginasPalabra(e) {
  let texto = `«${e.vi}»: ${e.es}.`;
  if (e.pron) texto += `\nSe pronuncia más o menos: ${e.pron}`;
  if (e.nota) texto += `\n${e.nota}`;
  return [{ texto, expresion: 'normal' }, ...paginasPronunciacion(e)];
}

/** Solo la pronunciación: el sonido y, aparte, el tono. */
export function paginasPronunciacion(e) {
  const ex = explicarPalabra(e.vi, e.fonetica);
  const paginas = [{ texto: `Cómo suena «${e.vi}»:\n${textoSonido(ex)}`, expresion: 'pensando' }];
  if (ex.tonos.length) paginas.push({ texto: `El tono:\n${textoTonos(ex)}`, expresion: 'normal' });
  return paginas;
}

/** Bloque visible «Cómo se pronuncia» (sonido + tono) para el vocabulario. */
export function htmlPronunciacion(e) {
  const ex = explicarPalabra(e.vi, e.fonetica);
  const sonido = ex.propio
    ? `<p>${esc(ex.propio)}</p>`
    : `<ul>${ex.sonido.map((s) => `<li><strong lang="vi">${esc(s.silaba)}</strong>: ${s.partes
      ? s.partes.map((p) => `<span class="pron-letras" lang="vi">${esc(p.letras)}</span> ${esc(p.texto)}`).join(' · ')
      : 'se lee casi como en español'}</li>`).join('')}</ul>`;
  const tonos = `<ul>${ex.tonos.map((t) => `<li><strong lang="vi">${esc(t.silaba)}</strong>: <span class="pron-flecha">${esc(t.flecha)}</span> ${esc(t.nombre)}, ${esc(t.texto)}</li>`).join('')}</ul>`;
  return `
    <details class="pron-detalle">
      <summary>Cómo se pronuncia</summary>
      <p class="pron-titulo">Sonido</p>${sonido}
      <p class="pron-titulo">Tono</p>${tonos}
    </details>`;
}
