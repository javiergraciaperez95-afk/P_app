// =====================================================================
// AL RESCATE — juego para leer un texto (bloque «texto», la lectura literaria)
// ---------------------------------------------------------------------
// En cada frase falta una palabra importante (una del vocabulario de la lección si la hay; si no, la
// más larga). Hay que rescatarla: se elige entre tres cuál encaja en el hueco. Si se elige mal, la
// opción se apaga, la tutora lo explica y se sigue probando; la frase volverá más tarde. Al acertar,
// el hueco se llena y se ve la frase entera con su traducción.
// Vale para cualquier idioma: solo usa las frases y las fichas de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const RE_PALABRA = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const MAX = 8;
const OPCIONES = 3;

/** Dónde está en el texto la palabra que brilla de ctx.frase: { antes, palabra, despues, entrada }. */
function huecoDe(f, ctx) {
  const { nodo, clave } = ctx.frase(f.es);
  if (!clave) return null;
  let pos = 0;
  for (const hijo of nodo.childNodes) {
    if (hijo === clave.boton) {
      const palabra = clave.boton.textContent;
      return { f, antes: f.es.slice(0, pos), palabra, despues: f.es.slice(pos + palabra.length), entrada: clave.entrada };
    }
    pos += hijo.textContent.length;
  }
  return null;
}

export const juego = {
  nombre: 'rescate',
  icono: '🛟',
  tipos: ['texto'],
  sirve: (bloque, ctx) => (bloque.frases ?? []).filter(f => f.es && huecoDe(f, ctx)).length >= 2,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, LANG } = ctx;
  const todas = (bloque.frases ?? []).filter(f => f.es);
  const posibles = todas.map(f => huecoDe(f, ctx)).filter(Boolean);
  const elegidas = posibles.length > MAX ? ctx.barajar(posibles).slice(0, MAX).sort((a, b) => todas.indexOf(a.f) - todas.indexOf(b.f)) : posibles;
  const total = elegidas.length;
  const cola = [...elegidas];
  let hechas = 0;
  let acabado = false;
  const minus = x => x.toLocaleLowerCase(LANG);
  const mayus = x => x.charAt(0).toLocaleUpperCase(LANG) + x.slice(1);

  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const mesa = el('div', { class: 'jg-rescate-mesa' });

  /** Dos palabras que no encajan: otras fichas de la lección (o, si faltan, palabras de otras frases). */
  function distractores(h) {
    const propias = new Set((h.f.es.match(RE_PALABRA) ?? []).map(minus));
    const mismas = h.palabra.split(/\s+/).length;
    const valen = x => x && !propias.has(minus(x)) && minus(x) !== minus(h.palabra);
    let fichas = ctx.fichas().map(x => x.es).filter(valen);
    let ideales = fichas.filter(x => x.split(/\s+/).length === mismas);
    let lista = [...new Set((ideales.length >= 2 ? ideales : fichas).map(minus))];
    if (lista.length < OPCIONES - 1) {
      const sueltas = todas.filter(f => f !== h.f).flatMap(f => f.es.match(RE_PALABRA) ?? []).filter(x => x.length >= 3 && valen(x));
      lista = [...new Set([...lista, ...sueltas.map(minus)])];
    }
    const eleccion = ctx.barajar(lista).slice(0, OPCIONES - 1);
    // misma mayúscula inicial que la palabra que falta
    const grande = h.palabra !== minus(h.palabra) && h.palabra.charAt(0) !== minus(h.palabra).charAt(0);
    return eleccion.map(x => (grande ? mayus(x) : x));
  }

  function presentar() {
    const h = cola.shift();
    let fallada = false;
    cuenta.textContent = `${hechas} / ${total}`;
    pista.textContent = t('jg.rescate.pista');

    const hueco = el('span', { class: 'jg-rescate-hueco', lang: LANG }, el('span', { class: 'solo-lector' }, t('jg.rescate.hueco')), '?');
    const frase = el('p', { class: 'jg-rescate-frase', lang: LANG }, ctx.frase(h.antes).nodo, hueco, ctx.frase(h.despues).nodo);
    const opciones = ctx.barajar([h.palabra, ...distractores(h)]);
    const botones = opciones.map(texto => {
      const b = el('button', { type: 'button', class: 'jg-rescate-opcion', lang: LANG }, texto);
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (texto === h.palabra) {
          for (const o of botones) o.disabled = true;
          b.classList.add('buena');
          hueco.classList.add('lleno');
          poner(hueco, h.palabra);
          sonar('moneda');
          resolver(h, fallada);
        } else {
          fallada = true;
          b.disabled = true;
          b.classList.add('mala');
          sonar('mal');
          ctx.decir(t('jg.rescate.no', { palabra: texto }), 'pensando');
        }
      });
      return b;
    });
    poner(mesa, frase, el('div', { class: 'jg-rescate-opciones' }, botones));
    ctx.leerSiHayVoz(h.antes.trim().length ? h.antes : h.f.es);
  }

  function resolver(h, fallada) {
    hechas += fallada ? 0 : 1;
    if (fallada) cola.push(h);
    cuenta.textContent = `${hechas} / ${total}`;
    pista.textContent = t('jg.rescate.ok');
    const trad = tr(h.f.trad);
    const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, cola.length ? t('jg.rescate.otra') : t('jg.rescate.terminar'));
    seguir.addEventListener('click', () => { sonar('pagina'); if (cola.length) presentar(); else fin(); });
    mesa.querySelector('.jg-rescate-opciones')?.replaceWith(el('div', { class: 'jg-rescate-resuelta' },
      trad && el('p', { class: 'jg-trad' }, trad),
      h.entrada && tr(h.entrada) && el('p', { class: 'jg-rescate-sentido' }, el('b', { lang: LANG }, h.entrada.es), ` = ${tr(h.entrada)}`),
      el('div', { class: 'jg-herramientas' }, el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(h.f.es) }, `🔊 ${t('comun.escuchar')}`)),
      seguir));
    ctx.leerSiHayVoz(h.f.es);
    seguir.focus({ preventScroll: true });
  }

  function fin() {
    if (acabado) return;
    acabado = true;
    cuenta.textContent = `${total} / ${total}`;
    pista.textContent = t('jg.rescate.fin');
    poner(mesa, el('p', { class: 'jg-rescate-premio' }, '🛟'));
    sonar('fanfarria');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-rescate' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.rescate.titulo')), cuenta),
    pista,
    mesa);
  if (total) presentar(); else ctx.hecho();
  return { nodo };
}
