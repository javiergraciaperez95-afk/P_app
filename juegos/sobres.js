// =====================================================================
// LOS SOBRES — juego para leer una explicación (bloque «explicacion»)
// ---------------------------------------------------------------------
// Cada trozo del texto llega dentro de un sobre cerrado. Se abre, se lee la carta y, al darle a
// «Entendido», la carta vuelve al sobre. Entonces llega una mini pregunta: «¿qué palabra clave salía
// aquí?», con 3 opciones (una negrita de ese trozo y negritas de otros). Si se falla, la tutora lo
// explica, se puede releer el sobre y ese sobre vuelve a salir al final. Las palabras acertadas se
// guardan en el buzón. Vale para cualquier idioma: solo usa el texto de la lección.
// =====================================================================

import { el, poner, textoConFormato } from '../js/dom.js';
import { trozosDe, negritasDe, normalizar } from './ayuda-trozos.js';

export const juego = {
  nombre: 'sobres',
  icono: '✉️',
  tipos: ['explicacion'],
  sirve: (bloque, ctx) => trozosDe(ctx.tr(bloque.texto)).filter(x => negritasDe(x).length).length >= 3,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const trozos = trozosDe(tr(bloque.texto)).map(texto => ({ texto, claves: negritasDe(texto) }));
  const cola = trozos.map((_, i) => i);
  const hechos = new Set();
  const repasados = new Set();
  const escena = el('div', { class: 'jg-sobres-escena' });
  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const buzon = el('ul', { class: 'jg-sobres-buzon', 'aria-label': t('jg.sobres.buzon') });
  const pintarCuenta = () => { cuenta.textContent = `${hechos.size} / ${trozos.length}`; };

  const sobre = (clase = '') => el('span', { class: `jg-sobres-sobre ${clase}`, 'aria-hidden': 'true' },
    el('span', { class: 'jg-sobres-solapa' }), el('span', { class: 'jg-sobres-sello' }, '♥'));

  /** Las opciones de la pregunta: una negrita de este trozo y dos de otros trozos. */
  function preguntar(x) {
    const propias = new Set(x.claves.map(normalizar));
    const ajenas = [];
    for (const otro of trozos) {
      if (otro === x) continue;
      for (const c of otro.claves) if (!propias.has(normalizar(c)) && !ajenas.some(a => normalizar(a) === normalizar(c))) ajenas.push(c);
    }
    const falsas = ctx.barajar(ajenas).slice(0, 2);
    if (!falsas.length) return null;
    const buena = ctx.alAzar(x.claves);
    return { buena, opciones: ctx.barajar([buena, ...falsas]), fallo: false, descartadas: new Set() };
  }

  function siguiente() {
    pintarCuenta();
    if (!cola.length) { fin(); return; }
    cerrado(cola.shift());
  }

  // ----- 1. El sobre cerrado -----
  function cerrado(i) {
    const abrir = el('button', { type: 'button', class: 'jg-sobres-cerrado', 'aria-label': t('jg.sobres.abrir') },
      sobre(), el('span', { class: 'jg-sobres-rotulo' }, t('jg.sobres.abrir')));
    abrir.addEventListener('click', () => {
      sonar('papel');
      abrir.firstChild.classList.add('abre');
      abrir.disabled = true;
      setTimeout(() => leer(i, trozos[i].claves.length ? preguntar(trozos[i]) : null), ctx.quieto ? 0 : 300);
    });
    pista.textContent = t('jg.sobres.pista');
    poner(escena, abrir);
    abrir.focus({ preventScroll: true });
  }

  // ----- 2. La carta abierta -----
  function leer(i, q) {
    const entendido = el('button', { type: 'button', class: 'es-boton jg-entendido' }, t('jg.entendido'));
    entendido.addEventListener('click', () => {
      sonar('cerrar');
      if (q) { pregunta(i, q); return; }
      hechos.add(i);
      sonar('tiza');
      siguiente();
    });
    pista.textContent = t('jg.sobres.leyendo');
    poner(escena,
      el('div', { class: 'jg-sobres-abierto' },
        sobre('abierto'),
        el('div', { class: 'jg-sobres-carta' }, textoConFormato(trozos[i].texto))),
      entendido);
    entendido.focus({ preventScroll: true });
  }

  // ----- 3. La pregunta, con la carta guardada -----
  function pregunta(i, q) {
    const opciones = q.opciones.map(texto => {
      const b = el('button', { type: 'button', class: 'es-boton es-boton-papel jg-sobres-opcion', disabled: q.descartadas.has(texto) }, texto);
      if (q.descartadas.has(texto)) b.classList.add('mal');
      b.addEventListener('click', () => responder(i, q, texto, b));
      return b;
    });
    const releer = el('button', { type: 'button', class: 'es-boton es-boton-papel jg-sobres-releer' }, `↺ ${t('jg.sobres.releer')}`);
    releer.addEventListener('click', () => { sonar('papel'); leer(i, q); });
    pista.textContent = '';
    poner(escena,
      el('div', { class: 'jg-sobres-cerrado quieto' }, sobre('cerrado'), el('span', { class: 'jg-sobres-rotulo' }, t('jg.sobres.pregunta'))),
      el('div', { class: 'jg-sobres-opciones', role: 'group', 'aria-label': t('jg.sobres.pregunta') }, opciones),
      releer);
  }

  function responder(i, q, texto, boton) {
    if (normalizar(texto) !== normalizar(q.buena)) {
      q.fallo = true;
      q.descartadas.add(texto);
      boton.disabled = true;
      boton.classList.add('mal', 'tiembla');
      sonar('mal');
      ctx.decir(t('jg.sobres.no'), 'pensando');
      return;
    }
    boton.classList.add('bien');
    sonar('moneda');
    ctx.decir(t('jg.sobres.bien'), 'contenta');
    hechos.add(i);
    buzon.append(el('li', {}, '✉ ', texto));
    if (q.fallo && !repasados.has(i)) { repasados.add(i); cola.push(i); ctx.decir(t('jg.sobres.vuelve'), 'contenta'); }
    for (const b of escena.querySelectorAll('.jg-sobres-opcion')) b.disabled = true;
    escena.querySelector('.jg-sobres-releer')?.remove();
    const otro = el('button', { type: 'button', class: 'es-boton jg-seguir' }, cola.length ? t('jg.sobres.otro') : t('jg.sobres.cerrar'));
    otro.addEventListener('click', () => { sonar('pagina'); siguiente(); });
    escena.append(otro);
    pintarCuenta();
    otro.focus({ preventScroll: true });
  }

  function fin() {
    poner(escena, el('p', { class: 'jg-sobres-fin' }, `🏆 ${t('jg.sobres.fin')}`));
    pista.textContent = '';
    sonar('aplausos');
    ctx.hecho();
  }

  siguiente();
  const nodo = el('div', { class: 'jg-sobres' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.sobres.titulo')), cuenta),
    pista,
    el('div', { class: 'jg-sobres-mesa' }, escena),
    buzon);
  return { nodo };
}
