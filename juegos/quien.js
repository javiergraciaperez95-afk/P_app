// =====================================================================
// ¿QUIÉN LO DIJO? — juego para un diálogo (bloque «dialogo»)
// ---------------------------------------------------------------------
// Sale una frase del diálogo y, debajo, los personajes (cada uno es una tutora pintada, con su nombre).
// Hay que tocar a quien la dijo. Un fallo no castiga: ese personaje se apaga, la tutora dice qué
// significa la frase para pensar quién la diría, y la frase vuelve a salir al final. Al acertar se ve la
// traducción y el personaje se alegra. Las palabras de la frase son pulsables y 🔊 la lee.
// Vale para cualquier idioma: solo usa los datos de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const MAX_PERSONAJES = 4;
const MAX_RONDAS = 5;

/** Las frases que se pueden preguntar: de uno de los (como mucho cuatro) personajes y sin ambigüedad. */
function preguntables(bloque) {
  const frases = (bloque.frases ?? []).filter(f => f.es && f.quien);
  const nombres = [...new Set(frases.map(f => f.quien))].slice(0, MAX_PERSONAJES);
  // la misma frase dicha por dos personajes distintos no tiene una sola respuesta
  const dicha = new Map();
  for (const f of frases) dicha.set(f.es, new Set([...(dicha.get(f.es) ?? []), f.quien]));
  const lista = frases.filter(f => nombres.includes(f.quien) && dicha.get(f.es).size === 1);
  // y una frase repetida se pregunta una sola vez
  const vistas = new Set();
  return { nombres, lista: lista.filter(f => !vistas.has(f.es) && vistas.add(f.es)) };
}

export const juego = {
  nombre: 'quien',
  icono: '🕵️',
  tipos: ['dialogo'],
  sirve(bloque) {
    const { nombres, lista } = preguntables(bloque);
    return nombres.length >= 2 && lista.length >= 2;
  },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, elenco } = ctx;
  const { nombres, lista } = preguntables(bloque);
  // unas cuantas frases (si el diálogo es largo), de personajes distintos si se puede
  const rondas = ctx.barajar(lista).slice(0, MAX_RONDAS);
  const total = rondas.length;
  const cola = [...rondas];
  const resueltas = new Set();

  const cuenta = el('span', { class: 'jg-cuenta' }, `0 / ${total}`);
  const pista = el('p', { class: 'jg-pista', 'aria-live': 'polite' });
  const bocadillo = el('div', { class: 'jg-quien-frase', 'aria-live': 'polite' });
  const seguir = el('button', { type: 'button', class: 'es-boton jg-quien-seguir', hidden: true }, t('jg.quien.otra'));

  // una tutora distinta por personaje; encima de cada una, un botón invisible con su nombre
  let actual = null;      // { f, resuelta, fallada }
  const papeles = new Map(nombres.map((nombre, i) => {
    const yo = elenco.tutora(i === 0 ? elenco.protagonista() : elenco.otra(), `jg-quien-actor jg-quien-actor-${i + 1}`);
    const toque = el('button', { type: 'button', class: 'jg-quien-toque', 'aria-label': nombre });
    const caja = el('div', { class: 'jg-quien-papel' }, yo.figura, el('span', { class: 'jg-quien-nombre' }, nombre), toque);
    toque.addEventListener('click', () => elegir(nombre, caja, yo));
    return [nombre, { yo, caja }];
  }));
  const reparto = el('div', { class: `jg-quien-reparto n${nombres.length}`, role: 'group', 'aria-label': t('jg.quien.personajes') },
    [...papeles.values()].map(p => p.caja));

  function ronda() {
    const f = cola[0];
    actual = { f, resuelta: false, fallada: false };
    seguir.hidden = true;
    seguir.classList.remove('jg-listo');
    cuenta.textContent = `${resueltas.size} / ${total}`;
    for (const { caja, yo } of papeles.values()) {
      caja.classList.remove('descartado', 'acierto');
      yo.figura.classList.remove('jg-habla');
    }
    const { nodo } = ctx.frase(f.es);
    const trad = el('p', { class: 'jg-trad', hidden: true }, tr(f.trad));
    poner(bocadillo,
      el('p', { class: 'jg-linea', }, nodo),
      el('div', { class: 'jg-herramientas' }, el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(f.es) }, '🔊')),
      trad);
    if (!ctx.quieto) { bocadillo.classList.remove('sale'); void bocadillo.offsetWidth; bocadillo.classList.add('sale'); }
    pista.textContent = t('jg.quien.pregunta');
    ctx.leerSiHayVoz(f.es);
  }

  function elegir(nombre, caja, yo) {
    if (!actual || actual.resuelta || caja.classList.contains('descartado')) return;
    const { f } = actual;
    if (nombre === f.quien) {
      actual.resuelta = true;
      caja.classList.add('acierto');
      yo.figura.classList.add('jg-habla');
      yo.gesto('presentar');
      yo.reaccionar('contenta', 1200);
      sonar('bien');
      resueltas.add(f.es);
      cola.shift();
      cuenta.textContent = `${resueltas.size} / ${total}`;
      const trad = bocadillo.querySelector('.jg-trad');
      if (trad) trad.hidden = false;
      // los demás se apagan un poco: habla quien habla
      for (const [n, p] of papeles) if (n !== nombre) p.caja.classList.add('descartado');
      if (cola.length) {
        pista.textContent = t('jg.quien.bien', { quien: nombre });
        seguir.hidden = false;
        seguir.classList.add('jg-listo');
        seguir.focus({ preventScroll: true });
      } else {
        pista.textContent = t('jg.quien.fin');
        sonar('fanfarria');
        ctx.hecho();
      }
      return;
    }
    // un fallo: ese personaje se apaga y la frase vuelve al final
    caja.classList.add('descartado');
    caja.classList.remove('tiembla'); void caja.offsetWidth; caja.classList.add('tiembla');
    yo.reaccionar('pensando', 900);
    sonar('mal');
    ctx.decir(tr(f.trad) ? t('jg.quien.mal', { trad: tr(f.trad) }) : t('jg.quien.malSola'), 'pensando');
    if (!actual.fallada) { actual.fallada = true; cola.push(f); }
  }

  seguir.addEventListener('click', () => { sonar('pagina'); ronda(); });

  const nodo = el('div', { class: 'jg-quien-juego' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.quien.titulo')), cuenta),
    el('div', { class: 'jg-quien-escena es-limite' },
      bocadillo,
      reparto,
      el('span', { class: 'jg-quien-suelo', 'aria-hidden': 'true' })),
    pista,
    el('div', { class: 'jg-quien-pie' }, seguir));
  ronda();
  elenco.vigilar(nodo);
  return { nodo };
}
