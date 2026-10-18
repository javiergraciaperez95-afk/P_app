// =====================================================================
// LAS PUERTAS — juego para el ejercicio de elegir (bloque «test»)
// ---------------------------------------------------------------------
// La pregunta cuelga arriba, en un cartel, y cada opción es una puerta de un pasillo. Se abre una:
// si es la buena, sale la luz con su premio y la tutora explica por qué; si no, la puerta se cierra de
// golpe, queda marcada, la tutora explica por qué esa no era y se prueba otra. Cada intento se apunta.
// Vale para cualquier idioma: solo usa la pregunta y las opciones del bloque.
// =====================================================================

import { el, poner, enLinea } from '../js/dom.js';

export const juego = {
  nombre: 'puertas',
  icono: '🚪',
  tipos: ['test'],
  sirve: bloque => Array.isArray(bloque.opciones) && bloque.opciones.length >= 2 && bloque.opciones.some(o => o.correcta),
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, alAzar } = ctx;
  const temporizadores = new Set();
  const luego = (fn, ms) => {
    if (ctx.quieto) { fn(); return; }
    const id = setTimeout(() => { temporizadores.delete(id); fn(); }, ms);
    temporizadores.add(id);
  };
  const opciones = ctx.barajar(bloque.opciones);
  const largas = opciones.some(o => String(tr(o.texto)).length > 22);
  const correcta = bloque.opciones.find(o => o.correcta);
  let resuelto = false;

  const pista = el('p', { class: 'jg-pista' }, t('jg.puertas.pista'));
  const nota = el('p', { class: 'jg-puertas-nota', 'aria-live': 'polite', hidden: true });
  const puertas = new Map();

  const fila = el('div', { class: `jg-puertas-fila ${largas ? 'largas' : ''}` }, opciones.map(opcion => {
    const texto = tr(opcion.texto);
    const puerta = el('button', { type: 'button', class: 'jg-puertas-puerta' },
      el('span', { class: 'jg-puertas-luz', 'aria-hidden': 'true' },
        el('span', { class: 'jg-puertas-rayos' }),
        el('span', { class: 'jg-puertas-premio' }, '⭐'),
        el('span', { class: 'jg-puertas-texto' }, texto)),
      el('span', { class: 'jg-puertas-hoja' },
        el('span', { class: 'jg-puertas-placa' }, texto),
        el('span', { class: 'jg-puertas-pomo' })));
    puerta.addEventListener('click', () => abrir(opcion, puerta));
    puertas.set(opcion, puerta);
    return puerta;
  }));

  function abrir(opcion, puerta) {
    if (resuelto || puerta.classList.contains('probada')) return;
    sonar('puerta');
    if (opcion.correcta) {
      resuelto = true;
      ctx.registrar(bloque, true);
      puerta.classList.add('abierta');
      for (const p of puertas.values()) { p.disabled = true; if (p !== puerta) p.classList.add('apagada'); }
      luego(() => { sonar('bien'); sonar('confeti'); }, 250);
      pista.textContent = t('jg.puertas.premio');
      const explicacion = tr(opcion.explicacion);
      ctx.decir([alAzar(t('ej.felicitaciones')), explicacion].filter(Boolean).join(' '), 'contenta');
      if (explicacion) mostrarNota(explicacion);
      ctx.hecho();
      return;
    }
    ctx.registrar(bloque, false);
    puerta.classList.remove('cierra');
    void puerta.offsetWidth;
    puerta.classList.add('cierra', 'probada');
    puerta.setAttribute('aria-disabled', 'true');
    luego(() => sonar('mal'), 300);
    pista.textContent = t('jg.puertas.otra');
    const explicacion = `${alAzar(t('ej.animosError'))} ${tr(opcion.explicacion)}`.trim();
    ctx.decir(explicacion, 'pensando');
    mostrarNota(explicacion);
  }

  function mostrarNota(texto) {
    nota.hidden = false;
    poner(nota, enLinea(texto));
  }

  const pregunta = tr(bloque.pregunta);
  const nodo = el('div', { class: 'jg-puertas' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, t('jg.puertas.titulo'))),
    pista,
    el('div', { class: 'jg-puertas-cartel' },
      pregunta && el('p', { class: 'jg-puertas-pregunta' }, enLinea(pregunta)),
      bloque.frase && el('p', { class: 'jg-puertas-frase', lang: ctx.LANG }, bloque.frase)),
    el('div', { class: 'jg-puertas-pasillo' }, fila, el('span', { class: 'jg-puertas-suelo', 'aria-hidden': 'true' })),
    nota);
  return { nodo, apagar: () => { for (const id of temporizadores) clearTimeout(id); temporizadores.clear(); } };
}
