// =====================================================================
// EL DETECTIVE — juego para la gramática (bloque «gramatica»)
// ---------------------------------------------------------------------
// Primero se lee la explicación a trozos. Luego, en cada ejemplo, la tutora pide una pista del
// análisis de la frase («Toca: sujeto») y el alumno toca una palabra que esté dentro de ese trozo.
// Hay 2 o 3 pistas por ejemplo. Si se toca otra palabra, la tutora dice qué era esa palabra y se
// sigue buscando; la pista fallada vuelve a salir al final. Las pistas resueltas quedan en el
// expediente. Vale para cualquier idioma: usa las funciones (ya traducidas) del análisis.
// =====================================================================

import { el, poner } from '../js/dom.js';
import { lectura, unidades, tramos } from './ayuda-trozos.js';

/** Las pistas posibles de un ejemplo: una por función distinta, con las palabras que le corresponden. */
function pistasDe(e, ctx) {
  const total = unidades(e.es).length;
  const todos = tramos(e).filter(x => x.fin >= x.ini);
  const grupos = new Map();
  for (const x of todos) {
    const etiqueta = String(ctx.tr(x.funcion) ?? '').trim();
    if (!etiqueta) continue;
    const g = grupos.get(etiqueta) ?? { etiqueta, palabras: new Set(), trozos: [] };
    for (let i = x.ini; i <= x.fin; i++) g.palabras.add(i);
    g.trozos.push(x.texto);
    grupos.set(etiqueta, g);
  }
  // una pista que abarca toda la frase no enseña nada
  return [...grupos.values()].filter(g => g.palabras.size < total);
}

export const juego = {
  nombre: 'detective',
  icono: '🔎',
  tipos: ['gramatica'],
  sirve: (bloque, ctx) => (bloque.ejemplos ?? []).some(e => e?.es && pistasDe(e, ctx).length >= 2),
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const casos = (bloque.ejemplos ?? []).filter(e => e?.es && pistasDe(e, ctx).length >= 2);
  const cola = casos.map((_, i) => i);
  const hechos = new Set();
  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const cuerpo = el('div', { class: 'jg-detective-cuerpo' });
  const pintarCuenta = () => { cuenta.textContent = `${hechos.size} / ${casos.length}`; };

  const leer = lectura(bloque, ctx, () => alFin(), 'jg-detective-lectura');

  function siguiente() {
    pintarCuenta();
    if (!cola.length) { fin(); return; }
    caso(cola.shift());
  }

  function caso(k) {
    const e = casos[k];
    const palabras = unidades(e.es);
    const todas = tramos(e).filter(x => x.fin >= x.ini);
    const posibles = ctx.barajar(pistasDe(e, ctx));
    const nPistas = Math.min(posibles.length, posibles.length >= 3 ? ctx.alAzar([2, 3]) : 2);
    const pistas = posibles.slice(0, nPistas);
    const cola2 = [...pistas];
    const repetidas = new Set();
    const falladas = new Set();
    let actual = null;
    let bloqueado = false;

    const frase = el('p', { class: 'jg-detective-frase', lang: ctx.LANG });
    const botones = palabras.map((texto, i) => {
      const b = el('button', { type: 'button', class: 'jg-detective-palabra', 'data-i': String(i) }, texto);
      b.addEventListener('click', () => tocar(i, b));
      return b;
    });
    frase.append(...botones.flatMap((b, i) => (i ? [' ', b] : [b])));
    const peticion = el('p', { class: 'jg-detective-peticion', 'aria-live': 'polite' });
    const expediente = el('ul', { class: 'jg-detective-expediente', 'aria-label': t('jg.detective.expediente') });

    /** Lo que es una palabra en el análisis: el trozo más pequeño que la contiene. */
    function queEs(i) {
      const dentro = todas.filter(x => x.ini <= i && i <= x.fin).sort((a, b) => (a.fin - a.ini) - (b.fin - b.ini));
      return dentro.length ? String(tr(dentro[0].funcion)) : null;
    }

    function preguntar() {
      actual = cola2.shift();
      for (const b of botones) b.classList.remove('pillada');
      peticion.textContent = '';
      peticion.append(el('span', { 'aria-hidden': 'true' }, '🔎 '), t('jg.detective.toca', { funcion: actual.etiqueta }));
      pista.textContent = t('jg.detective.consigna');
      bloqueado = false;
    }

    function tocar(i, boton) {
      if (bloqueado || !actual) return;
      if (actual.palabras.has(i)) {
        bloqueado = true;
        sonar('moneda');
        for (const j of actual.palabras) botones[j].classList.add('pillada');
        ctx.decir(t('jg.detective.bien'), 'contenta');
        expediente.append(el('li', {}, el('b', {}, `${actual.etiqueta}: `), el('span', { lang: ctx.LANG }, actual.trozos.join(' · '))));
        if (falladas.has(actual) && !repetidas.has(actual)) { repetidas.add(actual); cola2.push(actual); }
        setTimeout(() => { if (cola2.length) preguntar(); else resuelto(); }, ctx.quieto ? 0 : 650);
        return;
      }
      falladas.add(actual);
      sonar('mal');
      boton.classList.remove('tiembla');
      void boton.offsetWidth;
      boton.classList.add('tiembla');
      const que = queEs(i);
      ctx.decir(que
        ? t('jg.detective.era', { palabra: palabras[i].replace(/[\p{P}\p{S}]+$/u, ''), funcion: que, pedida: actual.etiqueta })
        : t('jg.detective.ninguna', { palabra: palabras[i].replace(/[\p{P}\p{S}]+$/u, ''), pedida: actual.etiqueta }), 'apurada');
    }

    function resuelto() {
      hechos.add(k);
      pintarCuenta();
      for (const b of botones) b.classList.remove('pillada');
      peticion.textContent = '';
      pista.textContent = '';
      sonar('sello');
      const ultimo = !cola.length;
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, ultimo ? t('jg.detective.fin') : t('jg.detective.otra'));
      seguir.addEventListener('click', () => { sonar('pagina'); siguiente(); });
      const f = ctx.frase(e.es);
      poner(cuerpo,
        el('div', { class: 'jg-detective-caso' },
          el('p', { class: 'jg-detective-resuelta' }, `🕵️ ${t('jg.detective.resuelto')}`),
          el('p', { class: 'jg-detective-frase' }, f.nodo, ' ', el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(e.es) }, '🔊')),
          e.trad && el('p', { class: 'jg-trad' }, tr(e.trad)),
          ctx.analisis(e, `jg-detective-${bloque.id ?? 'g'}-${k}`),
          expediente),
        seguir);
      ctx.leerSiHayVoz(e.es);
      seguir.focus({ preventScroll: true });
    }

    poner(cuerpo,
      el('div', { class: 'jg-detective-caso' },
        e.trad && el('p', { class: 'jg-detective-trad' }, tr(e.trad)),
        frase, peticion, expediente));
    preguntar();
    sonar('buscar');
  }

  function fin() {
    poner(cuerpo, el('p', { class: 'jg-detective-final' }, `🏆 ${t('jg.detective.terminado')}`));
    pista.textContent = '';
    sonar('aplausos');
    ctx.hecho();
  }

  const mesa = el('div', { class: 'jg-detective-mesa', hidden: true }, cuerpo);
  const cab = el('header', { class: 'jg-encabezado', hidden: true }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.detective.titulo')), cuenta);
  const nodo = el('div', { class: 'jg-detective' }, leer.nodo, cab, pista, mesa);
  function alFin() {
    sonar('timbre');
    leer.nodo.hidden = true;
    cab.hidden = false;
    mesa.hidden = false;
    siguiente();
  }
  if (leer.vacia) alFin();
  return { nodo };
}
