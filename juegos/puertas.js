// =====================================================================
// LA LLAVE — juego para el ejercicio de elegir (bloques «test» y «traduccion»). Se llama «puertas» por dentro.
// ---------------------------------------------------------------------
// Rehecho desde cero (19-10): antes cada opción era una puerta de un pasillo y, con respuestas largas, las puertas se
// tumbaban y parecían cajones; no se entendía qué había que hacer.
// Ahora: arriba, la pregunta junto a una puerta cerrada con su cerradura; debajo, una llave por respuesta, con el texto
// entero. Se elige una llave: si es la buena, la puerta se abre y sale la luz con su estrella, y la tutora explica por
// qué; si no, la cerradura no gira (la puerta tiembla), la llave queda tachada, la tutora explica por qué esa no era y se
// prueba otra. Cada intento se apunta. Vale para cualquier idioma: solo usa la pregunta y las opciones del bloque.
// =====================================================================

import { el, poner, enLinea } from '../js/dom.js';

export const juego = {
  nombre: 'puertas',
  icono: '🔑',
  tipos: ['test', 'traduccion'],
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
  let resuelto = false;

  const pista = el('p', { class: 'jg-pista' }, t('jg.puertas.pista'));
  const nota = el('p', { class: 'jg-puertas-nota', 'aria-live': 'polite', hidden: true });
  const puerta = el('div', { class: 'jg-puertas-marco', 'aria-hidden': 'true' },
    el('span', { class: 'jg-puertas-luz' }, el('span', { class: 'jg-puertas-premio' }, '⭐')),
    el('span', { class: 'jg-puertas-hoja' },
      el('span', { class: 'jg-puertas-panel' }), el('span', { class: 'jg-puertas-panel' }),
      el('span', { class: 'jg-puertas-cerradura' })));

  const llaves = opciones.map(opcion => {
    const llave = el('button', { type: 'button', class: 'jg-puertas-llave' },
      el('span', { class: 'jg-puertas-icono', 'aria-hidden': 'true' }, '🔑'),
      el('span', { class: 'jg-puertas-texto', lang: ctx.LANG }, enLinea(tr(opcion.texto))));
    llave.addEventListener('click', () => probar(opcion, llave));
    return llave;
  });

  function golpe(clase) {
    puerta.classList.remove(clase);
    void puerta.offsetWidth;
    puerta.classList.add(clase);
  }

  function probar(opcion, llave) {
    if (resuelto || llave.classList.contains('no-gira')) return;
    sonar('llave');
    if (opcion.correcta) {
      resuelto = true;
      ctx.registrar(bloque, true);
      llave.classList.add('buena');
      puerta.classList.add('abierta');
      for (const l of llaves) l.disabled = true;
      luego(() => { sonar('puerta'); sonar('bien'); }, 250);
      pista.textContent = t('jg.puertas.premio');
      const explicacion = tr(opcion.explicacion);
      ctx.decir([alAzar(t('ej.felicitaciones')), explicacion].filter(Boolean).join(' '), 'contenta');
      if (explicacion) mostrarNota(explicacion);
      ctx.hecho();
      return;
    }
    ctx.registrar(bloque, false);
    llave.classList.add('no-gira');
    llave.setAttribute('aria-disabled', 'true');
    golpe('traba');
    luego(() => sonar('mal'), 200);
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
    el('div', { class: 'jg-puertas-escena' },
      puerta,
      el('div', { class: 'jg-puertas-cartel' },
        pregunta && el('p', { class: 'jg-puertas-pregunta' }, enLinea(pregunta)),
        bloque.frase && el('p', { class: 'jg-puertas-frase', lang: ctx.LANG }, bloque.frase))),
    el('div', { class: 'jg-puertas-llaves', role: 'group', 'aria-label': t('jg.puertas.pista') }, llaves),
    nota);
  return { nodo, apagar: () => { for (const id of temporizadores) clearTimeout(id); temporizadores.clear(); } };
}
