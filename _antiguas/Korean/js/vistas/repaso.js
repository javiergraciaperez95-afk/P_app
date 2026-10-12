// Pantalla «Repaso»: tarjetas del cuaderno con repetición espaciada (estilo Anki).
// Atajos: Espacio o Enter para ver la respuesta; 1, 2, 3, 4 para valorar.

import { el, poner, barajar } from '../dom.js';
import { tarjetas, actualizarTarjeta, actividadDeHoy } from '../progress.js';
import { programar, textoEspera, esNueva, tocaRepasar, NOTAS } from '../srs.js';
import { botonEscuchar } from '../comunes.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';

const NUEVAS_POR_SESION = 20;
const VOLVER_EN_SESION = 20 * 60 * 1000; // lo que vence en menos de 20 min vuelve a salir hoy

let direccion = 'da-es'; // da-es: se ve el coreano · es-da: se ve el español

function crearCola() {
  const ahora = Date.now();
  const todas = tarjetas();
  const pendientes = todas.filter(t => tocaRepasar(t.srs, ahora)).sort((a, b) => a.srs.vence - b.srs.vence);
  const nuevas = todas.filter(t => esNueva(t.srs)).sort((a, b) => a.creada - b.creada).slice(0, NUEVAS_POR_SESION);
  // Se mezclan un poco para que no salgan siempre en el mismo orden.
  return [...barajar(pendientes), ...nuevas];
}

export function pintarRepaso(app) {
  let cola = [];
  let resultado = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let actual = null;
  let mostrandoRespuesta = false;
  let alTeclear = null;

  function inicio() {
    actual = null;
    const todas = tarjetas();
    const pendientes = todas.filter(t => tocaRepasar(t.srs)).length;
    const nuevas = Math.min(NUEVAS_POR_SESION, todas.filter(t => esNueva(t.srs)).length);
    const hoy = actividadDeHoy();

    const selector = el('div', { class: 'filtros', role: 'group', 'aria-label': 'Qué lado ver primero' },
      [['da-es', 'Coreano → español'], ['es-da', 'Español → coreano']].map(([clave, texto]) => {
        const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(direccion === clave) }, texto);
        b.addEventListener('click', () => {
          direccion = clave;
          selector.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        });
        return b;
      }));

    const hayAlgo = pendientes + nuevas > 0;
    const empezar = el('button', { type: 'button', class: 'boton boton-principal', disabled: !hayAlgo }, 'Empezar repaso ▶');
    empezar.addEventListener('click', () => {
      cola = crearCola();
      resultado = { 1: 0, 2: 0, 3: 0, 4: 0 };
      sonar('voltear');
      siguiente();
    });

    poner(app,
      el('section', { class: 'intro-vista' },
        el('h1', {}, 'Repaso'),
        el('p', {}, 'Mira la tarjeta, intenta recordar la respuesta y luego valora lo bien que la sabías. Cuanto mejor la sepas, más tarde volverá a salir.')),
      el('section', { class: 'caja panel-repaso' },
        el('dl', { class: 'contadores' },
          el('div', {}, el('dt', {}, 'Para repasar'), el('dd', {}, String(pendientes))),
          el('div', {}, el('dt', {}, 'Nuevas'), el('dd', {}, String(nuevas))),
          el('div', {}, el('dt', {}, 'Repasadas hoy'), el('dd', {}, String(hoy.repasos)))),
        selector,
        empezar,
        !todas.length && el('p', {}, 'Todavía no tienes nada en el cuaderno. ', el('a', { href: '#/frases' }, 'Guarda algunas frases'), ' o palabras de las lecciones.')),
    );

    if (!todas.length) decir('Para repasar necesito material. Guarda palabras con la estrella ☆ y aquí te espero.', 'confundida');
    else if (!hayAlgo) decir('¡Todo al día! No te toca repasar nada más hoy. Disfruta, que te lo has ganado.', 'contenta');
    else decir(`Tienes ${pendientes + nuevas} tarjetas esperándote. ¿Empezamos? Yo ya estoy lista, como siempre.`);
  }

  function siguiente() {
    actual = cola.shift() ?? null;
    if (!actual) {
      fin();
      return;
    }
    mostrandoRespuesta = false;
    pintarTarjeta();
  }

  function pintarTarjeta() {
    const t = actual;
    const delante = direccion === 'da-es'
      ? el('p', { class: 'carta-da', lang: 'ko' }, t.da)
      : el('p', { class: 'carta-es' }, t.es);
    const detras = direccion === 'da-es'
      ? el('p', { class: 'carta-es' }, t.es)
      : el('p', { class: 'carta-da', lang: 'ko' }, t.da);

    const carta = el('div', { class: `carta ${mostrandoRespuesta ? 'girada' : ''}`, 'aria-live': 'polite' },
      el('p', { class: 'carta-etiqueta' }, esNueva(t.srs) ? 'Nueva' : 'Repaso', ` · ${t.tipo === 'frase' ? 'frase' : 'palabra'}`),
      delante,
      mostrandoRespuesta && el('hr'),
      mostrandoRespuesta && detras,
      mostrandoRespuesta && t.pron && el('p', { class: 'aprox' }, `Se pronuncia: ${t.pron} (aprox.)`),
      mostrandoRespuesta && t.nota && el('p', { class: 'nota' }, t.nota),
      (direccion === 'da-es' || mostrandoRespuesta) && el('div', { class: 'carta-acciones' }, botonEscuchar(t.da)));

    let acciones;
    if (!mostrandoRespuesta) {
      acciones = el('div', { class: 'acciones-repaso' },
        el('button', { type: 'button', class: 'boton boton-principal boton-grande', onclick: mostrar }, 'Mostrar respuesta', el('span', { class: 'tecla' }, 'Espacio')));
    } else {
      acciones = el('div', { class: 'acciones-repaso notas' },
        NOTAS.map(n => el('button', {
          type: 'button',
          class: `boton nota-${n.nota}`,
          onclick: () => valorar(n.nota),
        },
        el('span', { class: 'nota-texto' }, n.texto),
        el('span', { class: 'nota-espera' }, textoEspera(t.srs, n.nota)),
        el('span', { class: 'tecla' }, n.tecla))));
    }

    poner(app,
      el('div', { class: 'cabecera-repaso' },
        el('button', { type: 'button', class: 'boton boton-mini', onclick: () => { sonar('clic'); inicio(); } }, '◀ Terminar'),
        el('p', { class: 'aprox' }, `Quedan ${cola.length + 1}`)),
      carta,
      acciones,
      el('p', { class: 'aprox ayuda-teclas' }, 'Atajos: Espacio para ver la respuesta · 1 2 3 4 para valorar'));

    // Con la respuesta visible, el foco va a «Bien» (como en Anki: Espacio = Bien).
    app.querySelector(mostrandoRespuesta ? '.nota-3' : '.acciones-repaso button')?.focus({ preventScroll: true });
  }

  function mostrar() {
    if (mostrandoRespuesta || !actual) return;
    mostrandoRespuesta = true;
    sonar('voltear');
    pintarTarjeta();
  }

  function valorar(nota) {
    if (!mostrandoRespuesta || !actual) return;
    const nuevo = programar(actual.srs, nota);
    actualizarTarjeta(actual.id, nuevo);
    actual.srs = nuevo;
    resultado[nota] += 1;
    sonar(nota === 1 ? 'mal' : 'bien');
    if (nuevo.vence - Date.now() < VOLVER_EN_SESION) cola.push(actual);

    if (nota === 1) decir(alAzarMensaje(['No pasa nada, la verás otra vez dentro de un momento.', 'Esta se resiste… ¡pero yo más!', 'Tranquilidad: equivocarse también es aprender.']), 'pensando');
    else if (nota === 4) decir(alAzarMensaje(['¡Fácil! Se nota quién te enseña.', '¡Perfecta! Esta ya es tuya.']), 'contenta');
    siguiente();
  }

  function fin() {
    const total = resultado[1] + resultado[2] + resultado[3] + resultado[4];
    sonar('fin');
    poner(app,
      el('section', { class: 'caja final-leccion' },
        el('h1', {}, '✔ ¡Repaso terminado!'),
        el('p', {}, `Has repasado ${total} ${total === 1 ? 'tarjeta' : 'tarjetas'}.`),
        el('ul', { class: 'resumen-notas' },
          NOTAS.map(n => el('li', {}, `${n.texto}: ${resultado[n.nota]}`))),
        el('button', { type: 'button', class: 'boton', onclick: inicio }, 'Volver'),
        el('a', { class: 'boton', href: '#/cuaderno' }, 'Ver el cuaderno')));
    app.querySelector('button')?.focus();
    decir(`¡Repaso terminado! ${total} tarjetas. La constancia es la clave, y tú la tienes. Bueno, y una tutora excelente.`, 'contenta');
  }

  alTeclear = e => {
    if (!actual || e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    // Enter y Espacio sobre otro botón (Terminar, Escuchar…) hacen lo de ese botón.
    if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('button, a') && !e.target.closest('.acciones-repaso')) return;
    if (!mostrandoRespuesta && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      mostrar();
    } else if (mostrandoRespuesta && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      valorar(Number(e.key));
    }
  };
  document.addEventListener('keydown', alTeclear);

  inicio();
  // Al salir de la pantalla se quitan los atajos de teclado.
  return () => document.removeEventListener('keydown', alTeclear);
}

function alAzarMensaje(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}
