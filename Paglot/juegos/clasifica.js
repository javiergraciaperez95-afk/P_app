// =====================================================================
// LAS CAJAS — juego para el vocabulario (bloque «vocabulario»)
// ---------------------------------------------------------------------
// Las palabras caen una a una y hay que tocar la caja donde van. Las cajas son los tipos de palabra
// (ficha.cat: sustantivo, verbo…) o, si todas son del mismo tipo, el género (ficha.genero: m / f / n).
// Si te equivocas, la caja tiembla, la tutora dice dónde va y la palabra vuelve a salir al final.
// Solo se usan los grupos con al menos dos palabras, y hacen falta dos grupos. Cae a su ritmo:
// no hay prisa. Vale para cualquier idioma: solo usa las fichas de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const GENEROS = ['m', 'f', 'n'];
const MAX_CAJAS = 4;
const MAX_PALABRAS = 8;

const usables = (bloque, ctx) => {
  const vistas = new Set();
  return (bloque.palabras ?? []).map(p => ctx.entrada(p)).filter(f => {
    if (!f || !f.es || f.propio || vistas.has(f.es)) return false;
    vistas.add(f.es);
    return true;
  });
};

/** { modo: 'cat'|'genero', cajas: [{ id, etiqueta, fichas }] } o null si no hay dos grupos de dos. */
function agrupar(bloque, ctx) {
  const fichas = usables(bloque, ctx);
  const por = (clave, valido) => {
    const mapa = new Map();
    for (const f of fichas) {
      const v = clave(f);
      if (!v || !valido(v)) continue;
      if (!mapa.has(v)) mapa.set(v, []);
      mapa.get(v).push(f);
    }
    return [...mapa].filter(([, l]) => l.length >= 2).sort((a, b) => b[1].length - a[1].length).slice(0, MAX_CAJAS);
  };
  let grupos = por(f => (typeof f.cat === 'string' ? f.cat.trim() : ''), () => true);
  if (grupos.length >= 2) return { modo: 'cat', cajas: grupos.map(([v, l]) => ({ id: v, etiqueta: v, fichas: l })) };
  grupos = por(f => String(f.genero ?? '').toLowerCase(), v => GENEROS.includes(v));
  if (grupos.length >= 2) return { modo: 'genero', cajas: grupos.map(([v, l]) => ({ id: v, etiqueta: ctx.t(`jg.clasifica.${v}`), fichas: l })) };
  return null;
}

export const juego = {
  nombre: 'clasifica',
  icono: '📦',
  tipos: ['vocabulario'],
  sirve(bloque, ctx) { return agrupar(bloque, ctx) !== null; },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const grupo = agrupar(bloque, ctx);
  if (!grupo) { ctx.hecho(); return { nodo: el('div', { class: 'jg-clasifica' }) }; }
  // como mucho 12 palabras, con al menos dos por caja
  const tope = Math.max(2, Math.floor(MAX_PALABRAS / grupo.cajas.length));
  const cajas = grupo.cajas.map(c => ({ ...c, fichas: ctx.barajar(c.fichas).slice(0, tope), puestas: 0 }));
  const palabras = ctx.barajar(cajas.flatMap(c => c.fichas.map(f => ({ f, caja: c }))));
  const cola = [...palabras];
  const total = palabras.length;
  let hechas = 0;
  const esperas = [];
  const luego = (ms, fn) => { esperas.push(setTimeout(fn, ctx.quieto ? 0 : ms)); };

  const pista = el('p', { class: 'jg-pista' });
  const cuenta = el('span', { class: 'jg-cuenta' });
  const caida = el('div', { class: 'jg-clasifica-caida', 'aria-live': 'polite' });
  const marcar = () => { cuenta.textContent = t('juego.cuenta', { n: hechas, total }); };
  const botones = cajas.map(c => {
    const lista = el('span', { class: 'jg-clasifica-dentro' });
    const boton = el('button', { type: 'button', class: 'jg-clasifica-caja', 'aria-label': t('jg.clasifica.caja', { nombre: c.etiqueta }) },
      el('span', { class: 'jg-clasifica-tapa' }, el('b', {}, c.etiqueta), el('i', { 'aria-hidden': 'true' }, '📦')),
      lista);
    c.boton = boton;
    c.lista = lista;
    return boton;
  });
  const fila = el('div', { class: `jg-clasifica-cajas jg-clasifica-n${cajas.length}` }, botones);

  let actual = null;
  let fallada = false;
  let ocupado = true;

  function siguiente() {
    marcar();
    if (!cola.length) { fin(); return; }
    actual = cola.shift();
    fallada = false;
    actual.vistas = (actual.vistas ?? 0) + 1;
    const { f } = actual;
    pista.textContent = grupo.modo === 'cat' ? t('jg.clasifica.pistaTipo') : t('jg.clasifica.pistaGenero');
    const oir = el('button', { type: 'button', class: 'jg-clasifica-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(f.es) }, '🔊');
    const carta = el('div', { class: 'jg-clasifica-palabra' },
      el('strong', { lang: ctx.LANG }, f.es),
      f.pron && el('em', {}, f.pron),
      el('span', {}, tr(f) || ''),
      oir);
    poner(caida, carta);
    actual.carta = carta;
    ctx.leerSiHayVoz(f.es);
    sonar('gota');
    ocupado = false;
  }

  cajas.forEach(c => {
    c.boton.addEventListener('click', () => {
      if (ocupado || !actual) return;
      if (actual.caja !== c) {
        sonar('mal');
        c.boton.classList.remove('tiembla'); void c.boton.offsetWidth; c.boton.classList.add('tiembla');
        actual.carta.classList.remove('tiembla'); void actual.carta.offsetWidth; actual.carta.classList.add('tiembla');
        if (!fallada) { fallada = true; if (!actual.vuelta) { actual.vuelta = true; cola.push(actual); } }
        ctx.decir(t('jg.clasifica.no', { palabra: actual.f.es, caja: actual.caja.etiqueta }), 'pensando');
        return;
      }
      ocupado = true;
      c.puestas += 1;
      sonar('cajon');
      c.lista.append(el('span', { class: 'jg-clasifica-chip', lang: ctx.LANG }, actual.f.es));
      c.boton.classList.add('recibe');
      luego(350, () => c.boton.classList.remove('recibe'));
      actual.carta.classList.add('entra-caja');
      if (!fallada || actual.vistas >= 2) hechas += 1;
      const termino = actual;
      luego(380, () => { termino.carta.remove(); siguiente(); });
    });
  });

  function fin() {
    pista.textContent = t('jg.clasifica.todas');
    cuenta.textContent = '✓';
    poner(caida);
    caida.hidden = true;
    sonar('aplausos');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-clasifica' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.clasifica.titulo')), cuenta),
    pista,
    el('div', { class: 'jg-clasifica-mesa' }, caida, fila));
  siguiente();
  return { nodo, apagar() { esperas.forEach(clearTimeout); } };
}
