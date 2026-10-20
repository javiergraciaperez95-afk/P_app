// =====================================================================
// LA TABLA — el bloque «tabla» (conjugaciones, pronombres, plurales…) en su paso del modo juego.
// Antes se saltaba (no había juego para él). Para no pasar sin leer, se toca cada fila: se ilumina con un
// «clic»; con todas tocadas (seis como mucho) se enciende «Entendido».
// En el móvil no se sale de la pantalla: las tablas anchas (cuatro columnas o más) se ven como una ficha por fila, con
// el nombre de cada columna al lado de su dato, y las largas van por páginas (◀ filas 1–5 de 12 ▶).
// =====================================================================

import { el, enLinea, poner } from '../js/dom.js';

export const juego = {
  nombre: 'tabla',
  icono: '📋',
  tipos: ['tabla'],
  sirve: bloque => Array.isArray(bloque.filas) && bloque.filas.length > 0,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const enMovil = window.matchMedia('(max-width: 700px)').matches;
  const anchoDatos = Math.max(...bloque.filas.map(f => f.length));
  // en muchas tablas de los cursos falta un encabezado: entonces no se ponen (saldrían corridos, con nombres que no son)
  const columnas = (bloque.columnas ?? []).length === anchoDatos ? bloque.columnas.map(c => tr(c)) : [];
  const ancha = enMovil && anchoDatos >= 4;
  const porPagina = enMovil ? (ancha ? 3 : 5) : 10;
  const paginas = Math.ceil(bloque.filas.length / porPagina);
  const necesarias = Math.min(bloque.filas.length, 6);
  const tocadas = new Set();
  let pagina = 0;

  const boton = el('button', { type: 'button', class: 'es-boton jg-entendido', disabled: true }, t('jg.entendido'));
  const atras = el('button', { type: 'button', class: 'es-boton es-boton-papel jg-tabla-paso', 'aria-label': t('idi.anterior') }, '◀');
  const alante = el('button', { type: 'button', class: 'es-boton es-boton-papel jg-tabla-paso', 'aria-label': t('idi.siguiente') }, '▶');
  const rango = el('span', { class: 'jg-tabla-rango' });
  const cuerpo = el('tbody', {});

  const filas = bloque.filas.map((fila, i) => {
    // cada dato lleva el nombre de su columna: en la ficha del móvil va al lado
    const nodo = el('tr', { class: 'jg-tabla-fila', tabindex: '0' },
      fila.map((c, k) => el('td', { 'data-col': columnas[k] ?? '' }, enLinea(tr(c)))));
    const tocar = () => {
      if (tocadas.has(i)) return;
      tocadas.add(i);
      nodo.classList.add('tocada');
      sonar('marcar');
      if (tocadas.size >= necesarias && boton.disabled) { boton.disabled = false; boton.classList.add('jg-listo'); }
      // tocadas todas las de esta página, la flecha avisa de que hay más
      const desde = pagina * porPagina;
      const enEsta = filas.slice(desde, desde + porPagina);
      if (pagina < paginas - 1 && enEsta.every(f => f.classList.contains('tocada'))) alante.classList.add('jg-listo');
    };
    nodo.addEventListener('click', tocar);
    nodo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(); } });
    return nodo;
  });

  function pintar() {
    const desde = pagina * porPagina;
    const hasta = Math.min(bloque.filas.length, desde + porPagina);
    poner(cuerpo, filas.slice(desde, hasta));
    rango.textContent = t('jg.tabla.filas', { desde: desde + 1, hasta, total: bloque.filas.length });
    atras.disabled = pagina === 0;
    alante.disabled = pagina === paginas - 1;
    alante.classList.remove('jg-listo');
  }
  atras.addEventListener('click', () => { if (pagina > 0) { pagina -= 1; sonar('pagina'); pintar(); } });
  alante.addEventListener('click', () => { if (pagina < paginas - 1) { pagina += 1; sonar('pagina'); pintar(); } });
  boton.addEventListener('click', () => {
    if (boton.disabled) return;
    boton.disabled = true;
    sonar('bien');
    ctx.hecho();
  });

  pintar();
  const nodo = el('div', { class: `jg-tabla${ancha ? ' ancha' : ''}` },
    bloque.titulo && el('h3', { class: 'jg-tabla-titulo' }, tr(bloque.titulo)),
    el('p', { class: 'jg-tabla-aviso' }, t('jg.tabla.toca')),
    el('div', { class: 'tabla-contenedor' },
      el('table', { class: 'tabla' },
        !ancha && columnas.length ? el('thead', {}, el('tr', {}, columnas.map(c => el('th', { scope: 'col' }, enLinea(c))))) : null,
        cuerpo)),
    paginas > 1 ? el('nav', { class: 'jg-tabla-paginas' }, atras, rango, alante) : null,
    bloque.nota && el('p', { class: 'aprox' }, enLinea(tr(bloque.nota))),
    boton);
  return { nodo };
}
