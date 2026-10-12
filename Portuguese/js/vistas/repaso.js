// Pantalla «Repaso»: tarjetas del cuaderno con repetición espaciada (estilo Anki).
// Atajos: Espacio o Enter para ver la respuesta; 1, 2, 3, 4 para valorar.

import { el, poner, barajar } from '../dom.js';
import { tarjetas, actualizarTarjeta, actividadDeHoy } from '../progress.js';
import { programar, textoEspera, esNueva, tocaRepasar, NOTAS } from '../srs.js';
import { botonEscuchar } from '../comunes.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { t, tr, lista } from '../i18n.js';

const NUEVAS_POR_SESION = 20;
const VOLVER_EN_SESION = 20 * 60 * 1000; // lo que vence en menos de 20 min vuelve a salir hoy

let direccion = 'pt-trad'; // pt-trad: se ve el portugués · trad-pt: se ve la traducción

function crearCola() {
  const ahora = Date.now();
  const todas = tarjetas();
  const pendientes = todas.filter(c => tocaRepasar(c.srs, ahora)).sort((a, b) => a.srs.vence - b.srs.vence);
  const nuevas = todas.filter(c => esNueva(c.srs)).sort((a, b) => a.creada - b.creada).slice(0, NUEVAS_POR_SESION);
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
    const pendientes = todas.filter(c => tocaRepasar(c.srs)).length;
    const nuevas = Math.min(NUEVAS_POR_SESION, todas.filter(c => esNueva(c.srs)).length);
    const hoy = actividadDeHoy();

    const selector = el('div', { class: 'filtros', role: 'group', 'aria-label': t('review.whichSide') },
      [['pt-trad', 'review.portugueseFirst'], ['trad-pt', 'review.translationFirst']].map(([clave, texto]) => {
        const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(direccion === clave) }, t(texto));
        b.addEventListener('click', () => {
          direccion = clave;
          selector.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        });
        return b;
      }));

    const hayAlgo = pendientes + nuevas > 0;
    const empezar = el('button', { type: 'button', class: 'boton boton-principal', disabled: !hayAlgo }, `${t('review.start')} ▶`);
    empezar.addEventListener('click', () => {
      cola = crearCola();
      resultado = { 1: 0, 2: 0, 3: 0, 4: 0 };
      sonar('voltear');
      siguiente();
    });

    poner(app,
      el('section', { class: 'intro-vista' },
        el('h1', {}, t('review.title')),
        el('p', {}, t('review.intro'))),
      el('section', { class: 'caja panel-repaso' },
        el('dl', { class: 'contadores' },
          el('div', {}, el('dt', {}, t('review.due')), el('dd', {}, String(pendientes))),
          el('div', {}, el('dt', {}, t('review.new')), el('dd', {}, String(nuevas))),
          el('div', {}, el('dt', {}, t('review.reviewedToday')), el('dd', {}, String(hoy.repasos)))),
        selector,
        empezar,
        !todas.length && el('p', {}, `${t('review.nothingYet')} `, el('a', { href: '#/frases' }, t('review.savePhrases')))),
    );

    if (!todas.length) decir(t('tutor.reviewNothing'), 'confundida');
    else if (!hayAlgo) decir(t('tutor.reviewAllDone'), 'contenta');
    else decir(t('tutor.reviewWaiting', { n: pendientes + nuevas }));
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
    const c = actual;
    const delante = direccion === 'pt-trad'
      ? el('p', { class: 'carta-pt', lang: 'pt-PT' }, c.pt)
      : el('p', { class: 'carta-trad' }, tr(c.trad));
    const detras = direccion === 'pt-trad'
      ? el('p', { class: 'carta-trad' }, tr(c.trad))
      : el('p', { class: 'carta-pt', lang: 'pt-PT' }, c.pt);

    const carta = el('div', { class: `carta ${mostrandoRespuesta ? 'girada' : ''}`, 'aria-live': 'polite' },
      el('p', { class: 'carta-etiqueta' }, `${t(esNueva(c.srs) ? 'review.new' : 'review.reviewCard')} · ${t(c.tipo === 'frase' ? 'notebook.phrase' : 'notebook.word')}`),
      delante,
      mostrandoRespuesta && el('hr'),
      mostrandoRespuesta && detras,
      mostrandoRespuesta && c.pron && el('p', { class: 'aprox' }, `${t('word.pronounced')} ${tr(c.pron)} (${t('word.approx')})`),
      mostrandoRespuesta && c.nota && el('p', { class: 'nota' }, tr(c.nota)),
      (direccion === 'pt-trad' || mostrandoRespuesta) && el('div', { class: 'carta-acciones' }, botonEscuchar(c.pt)));

    let acciones;
    if (!mostrandoRespuesta) {
      acciones = el('div', { class: 'acciones-repaso' },
        el('button', { type: 'button', class: 'boton boton-principal boton-grande', onclick: mostrar }, t('review.showAnswer'), el('span', { class: 'tecla' }, t('review.space'))));
    } else {
      acciones = el('div', { class: 'acciones-repaso notas' },
        NOTAS.map(n => el('button', {
          type: 'button',
          class: `boton nota-${n.nota}`,
          onclick: () => valorar(n.nota),
        },
        el('span', { class: 'nota-texto' }, t(n.clave)),
        el('span', { class: 'nota-espera' }, textoEspera(c.srs, n.nota)),
        el('span', { class: 'tecla' }, n.tecla))));
    }

    poner(app,
      el('div', { class: 'cabecera-repaso' },
        el('button', { type: 'button', class: 'boton boton-mini', onclick: () => { sonar('clic'); inicio(); } }, `◀ ${t('review.stop')}`),
        el('p', { class: 'aprox' }, t('review.left', { n: cola.length + 1 }))),
      carta,
      acciones,
      el('p', { class: 'aprox ayuda-teclas' }, t('review.shortcuts')));

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

    if (nota === 1) decir(alAzarMensaje(lista('tutor.reviewAgain')), 'pensando');
    else if (nota === 4) decir(alAzarMensaje(lista('tutor.reviewEasy')), 'contenta');
    siguiente();
  }

  function fin() {
    const total = resultado[1] + resultado[2] + resultado[3] + resultado[4];
    sonar('fin');
    poner(app,
      el('section', { class: 'caja final-leccion' },
        el('h1', {}, `✔ ${t('review.finished')}`),
        el('p', {}, t('review.reviewedCards', { n: total })),
        el('ul', { class: 'resumen-notas' },
          NOTAS.map(n => el('li', {}, `${t(n.clave)}: ${resultado[n.nota]}`))),
        el('button', { type: 'button', class: 'boton', onclick: inicio }, t('common.back')),
        el('a', { class: 'boton', href: '#/cuaderno' }, t('review.seeNotebook'))));
    app.querySelector('button')?.focus();
    decir(t('tutor.reviewFinished', { n: total }), 'contenta');
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
