// =====================================================================
// EL SUBRAYADOR — juego para leer una explicación o la gramática (bloques «explicacion» y «gramatica»)
// ---------------------------------------------------------------------
// El texto sale a trozos, sobre una hoja. En cada trozo hay que pasar el rotulador fosforito por las
// palabras en negrita (las palabras clave; tres como mucho): se tocan una a una y se quedan subrayadas. Tocar otra
// cosa no castiga: la tutora recuerda qué hay que buscar. Hasta que no están todas subrayadas no sale
// «Entendido». Si un trozo no trae negritas, basta con leerlo y entenderlo. En gramática, al final,
// salen los ejemplos con su análisis. Vale para cualquier idioma: solo usa el texto de la lección.
// =====================================================================

import { el, textoConFormato } from '../js/dom.js';
import { trozosDe, negritasDe, ejemploNodo } from './ayuda-trozos.js';

export const juego = {
  nombre: 'subrayador',
  icono: '🖍️',
  tipos: ['explicacion', 'gramatica'],
  sirve: (bloque, ctx) => negritasDe(ctx.tr(bloque.texto)).length >= 2,
};

/** Convierte las palabras en pulsables: las negritas en botones «clave», el resto en palabras sueltas. */
function preparar(fragmento) {
  const claves = [];
  for (const s of [...fragmento.querySelectorAll('strong')]) {
    const boton = el('button', { type: 'button', class: 'jg-subrayador-clave' }, s.textContent);
    s.replaceWith(boton);
    claves.push(boton);
  }
  const recorrido = document.createTreeWalker(fragmento, NodeFilter.SHOW_TEXT);
  const textos = [];
  while (recorrido.nextNode()) textos.push(recorrido.currentNode);
  for (const tn of textos) {
    if (tn.parentNode.closest?.('button')) continue;
    const partes = tn.textContent.split(/(\s+)/).filter(Boolean);
    tn.replaceWith(...partes.map(p => (/^\s+$/.test(p) ? p : el('span', { class: 'jg-subrayador-w' }, p))));
  }
  return claves;
}

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const trozos = trozosDe(tr(bloque.texto));
  const ejemplos = bloque.ejemplos ?? [];
  const total = trozos.length + ejemplos.length;
  const lista = el('div', { class: 'jg-subrayador-lista' });
  const pista = el('p', { class: 'jg-pista' }, t('jg.subrayador.pista'));
  const cuenta = el('span', { class: 'jg-cuenta' });
  const marcadas = el('span', { class: 'jg-subrayador-marcadas', 'aria-live': 'polite' });
  const boton = el('button', { type: 'button', class: 'es-boton jg-entendido', hidden: true }, t('jg.entendido'));
  let n = 0;
  let faltan = 0;
  let fallos = 0;
  let solo = null;

  function mostrar() {
    for (const h of lista.children) h.classList.add('vieja');
    let hoja;
    faltan = 0;
    if (n < trozos.length) {
      const fragmento = textoConFormato(trozos[n]);
      const claves = preparar(fragmento);
      // con muchas negritas basta con tres (las demás se pueden subrayar igual)
      const hacia = Math.min(3, claves.length);
      faltan = hacia;
      hoja = el('div', { class: 'jg-subrayador-hoja' }, fragmento);
      marcadas.textContent = hacia ? t('jg.subrayador.marcadas', { n: 0, total: hacia }) : '';
      if (hacia) {
        pista.textContent = t('jg.subrayador.pista');
        for (const c of claves) {
          c.addEventListener('click', () => {
            if (c.classList.contains('marcada')) return;
            c.classList.add('marcada');
            if (faltan <= 0) { sonar('marcar'); return; }
            faltan -= 1;
            marcadas.textContent = t('jg.subrayador.marcadas', { n: hacia - faltan, total: hacia });
            if (faltan > 0) { sonar('marcar'); return; }
            sonar('moneda');
            pista.textContent = t('jg.subrayador.listo');
            boton.hidden = false;
            boton.focus({ preventScroll: true });
            // con todo subrayado ya se ha leído: el siguiente trozo sale solo, sin otro toque
            clearTimeout(solo);
            solo = setTimeout(() => { if (nodo.isConnected && !boton.hidden && faltan === 0) boton.click(); }, ctx.quieto ? 300 : 750);
          });
        }
        boton.hidden = true;
      } else {
        pista.textContent = t('jg.subrayador.sinClaves');
        boton.hidden = false;
      }
      hoja.addEventListener('click', e => {
        const w = e.target.closest('.jg-subrayador-w');
        if (!w) return;
        sonar('mal');
        w.classList.remove('tiembla');
        void w.offsetWidth;
        w.classList.add('tiembla');
        fallos += 1;
        if (fallos % 2 === 1) ctx.decir(t('jg.subrayador.no'), 'apurada');
      });
    } else {
      const e = ejemplos[n - trozos.length];
      hoja = ejemploNodo(e, ctx, `jg-sub-${bloque.id ?? 'g'}-${n}`, 'jg-subrayador-hoja');
      marcadas.textContent = '';
      pista.textContent = t('jg.subrayador.ejemplos');
      boton.hidden = false;
      ctx.leerSiHayVoz(e.es);
    }
    n += 1;
    cuenta.textContent = `${n} / ${total}`;
    lista.append(hoja);
    hoja.scrollIntoView?.({ block: 'nearest', behavior: ctx.quieto ? 'auto' : 'smooth' });
  }

  boton.addEventListener('click', () => {
    clearTimeout(solo);
    if (faltan > 0 || boton.hidden) return;
    sonar('tiza');
    if (n >= total) {
      boton.hidden = true;
      marcadas.textContent = '';
      pista.textContent = '';
      sonar('aplausos');
      lista.lastChild?.classList.add('vieja');
      ctx.hecho();
      return;
    }
    mostrar();
  });

  mostrar();
  const nodo = el('div', { class: 'jg-subrayador' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.subrayador.titulo')), cuenta),
    pista,
    el('div', { class: 'jg-subrayador-mesa' }, lista, el('div', { class: 'jg-subrayador-pie' }, el('span', { class: 'jg-subrayador-rotulador', 'aria-hidden': 'true' }), marcadas, boton)));
  return { nodo, apagar: () => clearTimeout(solo) };
}
