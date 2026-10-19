// =====================================================================
// LA TABLA — el bloque «tabla» (conjugaciones, pronombres, plurales…) en su paso del modo juego.
// Antes se saltaba (no había juego para él). Para no pasar sin leer, se toca cada fila: se ilumina con un
// «clic»; con todas tocadas (seis como mucho) se enciende «Entendido».
// =====================================================================

import { el, enLinea } from '../js/dom.js';

export const juego = {
  nombre: 'tabla',
  icono: '📋',
  tipos: ['tabla'],
  sirve: bloque => Array.isArray(bloque.filas) && bloque.filas.length > 0,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const necesarias = Math.min(bloque.filas.length, 6);
  const tocadas = new Set();
  const boton = el('button', { type: 'button', class: 'es-boton jg-entendido', disabled: true }, t('jg.entendido'));
  const filas = bloque.filas.map((fila, i) => {
    const nodo = el('tr', { class: 'jg-tabla-fila', tabindex: '0' }, fila.map(c => el('td', {}, enLinea(tr(c)))));
    const tocar = () => {
      if (tocadas.has(i)) return;
      tocadas.add(i);
      nodo.classList.add('tocada');
      sonar('marcar');
      if (tocadas.size >= necesarias && boton.disabled) { boton.disabled = false; boton.classList.add('jg-listo'); }
    };
    nodo.addEventListener('click', tocar);
    nodo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(); } });
    return nodo;
  });
  boton.addEventListener('click', () => {
    if (boton.disabled) return;
    boton.disabled = true;
    sonar('bien');
    ctx.hecho();
  });
  const nodo = el('div', { class: 'jg-tabla' },
    bloque.titulo && el('h3', { class: 'jg-tabla-titulo' }, tr(bloque.titulo)),
    el('p', { class: 'jg-tabla-aviso' }, t('jg.tabla.toca')),
    el('div', { class: 'tabla-contenedor' },
      el('table', { class: 'tabla' },
        bloque.columnas && el('thead', {}, el('tr', {}, bloque.columnas.map(c => el('th', { scope: 'col' }, enLinea(tr(c)))))),
        el('tbody', {}, filas))),
    bloque.nota && el('p', { class: 'aprox' }, enLinea(tr(bloque.nota))),
    boton);
  return { nodo };
}
