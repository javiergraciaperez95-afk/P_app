// Pantalla «Repaso»: tarjetas del cuaderno con repetición espaciada (estilo Anki).
// Atajos: Espacio o Enter para ver la respuesta; 1, 2, 3, 4 para valorar.

import { el, poner, barajar, alAzar } from '../dom.js';
import { t, tr } from '../i18n.js';
import { tarjetas, actualizarTarjeta, actividadDeHoy } from '../progress.js';
import { programar, textoEspera, esNueva, tocaRepasar, NOTAS } from '../srs.js';
import { botonEscuchar } from '../comunes.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { LANG } from '../curso.js';

const NUEVAS_POR_SESION = 20;
const VOLVER_EN_SESION = 20 * 60 * 1000; // lo que vence en menos de 20 min vuelve a salir hoy

let direccion = 'es-trad'; // es-trad: se ve el español · trad-es: se ve la traducción

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

    const selector = el('div', { class: 'filtros', role: 'group', 'aria-label': t('repaso.ladoPrimero') },
      [['es-trad', t('repaso.esTrad')], ['trad-es', t('repaso.tradEs')]].map(([clave, texto]) => {
        const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(direccion === clave) }, texto);
        b.addEventListener('click', () => {
          direccion = clave;
          selector.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        });
        return b;
      }));

    const hayAlgo = pendientes + nuevas > 0;
    const empezar = el('button', { type: 'button', class: 'boton boton-principal', disabled: !hayAlgo }, t('repaso.empezar'));
    empezar.addEventListener('click', () => {
      cola = crearCola();
      resultado = { 1: 0, 2: 0, 3: 0, 4: 0 };
      sonar('voltear');
      siguiente();
    });

    poner(app,
      el('section', { class: 'intro-vista' },
        el('h1', {}, t('menu.repaso')),
        el('p', {}, t('repaso.intro'))),
      el('section', { class: 'caja panel-repaso' },
        el('dl', { class: 'contadores' },
          el('div', {}, el('dt', {}, t('repaso.paraRepasar')), el('dd', {}, String(pendientes))),
          el('div', {}, el('dt', {}, t('repaso.nuevas')), el('dd', {}, String(nuevas))),
          el('div', {}, el('dt', {}, t('repaso.hoy')), el('dd', {}, String(hoy.repasos)))),
        selector,
        empezar,
        !todas.length && el('p', {}, `${t('repaso.vacio1')} `, el('a', { href: '#/frases' }, t('repaso.vacio2')), ` ${t('repaso.vacio3')}`)),
    );

    if (!todas.length) decir(t('repaso.tutoraVacio'), 'confundida');
    else if (!hayAlgo) decir(t('repaso.tutoraAlDia'), 'contenta');
    else decir(t('repaso.tutoraEsperando', { n: pendientes + nuevas }));
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
    const espanol = el('p', { class: 'carta-es', lang: LANG }, c.es);
    const traduccion = el('p', { class: 'carta-trad' }, tr(c.trad));
    const [delante, detras] = direccion === 'es-trad' ? [espanol, traduccion] : [traduccion, espanol];

    const carta = el('div', { class: `carta ${mostrandoRespuesta ? 'girada' : ''}`, 'aria-live': 'polite' },
      el('p', { class: 'carta-etiqueta' }, `${t(esNueva(c.srs) ? 'repaso.etiquetaNueva' : 'repaso.etiquetaRepaso')} · ${t(c.tipo === 'frase' ? 'tipo.frase' : 'tipo.palabra')}`),
      delante,
      mostrandoRespuesta && el('hr'),
      mostrandoRespuesta && detras,
      mostrandoRespuesta && c.pron && el('p', { class: 'aprox' }, `${t('ficha.sePronuncia')} ${c.pron} ${t('comun.aprox')}`),
      mostrandoRespuesta && c.nota && el('p', { class: 'nota' }, tr(c.nota)),
      (direccion === 'es-trad' || mostrandoRespuesta) && el('div', { class: 'carta-acciones' }, botonEscuchar(c.es)));

    let acciones;
    if (!mostrandoRespuesta) {
      acciones = el('div', { class: 'acciones-repaso' },
        el('button', { type: 'button', class: 'boton boton-principal boton-grande', onclick: mostrar }, t('repaso.mostrar'), el('span', { class: 'tecla' }, t('repaso.espacio'))));
    } else {
      acciones = el('div', { class: 'acciones-repaso notas' },
        NOTAS.map(n => el('button', {
          type: 'button',
          class: `boton nota-${n.nota}`,
          onclick: () => valorar(n.nota),
        },
        el('span', { class: 'nota-texto' }, t(n.texto)),
        el('span', { class: 'nota-espera' }, textoEspera(c.srs, n.nota)),
        el('span', { class: 'tecla' }, n.tecla))));
    }

    poner(app,
      el('div', { class: 'cabecera-repaso' },
        el('button', { type: 'button', class: 'boton boton-mini', onclick: () => { sonar('clic'); inicio(); } }, t('repaso.terminar')),
        el('p', { class: 'aprox' }, t('repaso.quedan', { n: cola.length + 1 }))),
      carta,
      acciones,
      el('p', { class: 'aprox ayuda-teclas' }, t('repaso.atajos')));

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

    if (nota === 1) decir(alAzar(t('repaso.otraVezTutora')), 'pensando');
    else if (nota === 4) decir(alAzar(t('repaso.facilTutora')), 'contenta');
    siguiente();
  }

  function fin() {
    const total = resultado[1] + resultado[2] + resultado[3] + resultado[4];
    sonar('fin');
    poner(app,
      el('section', { class: 'caja final-leccion' },
        el('h1', {}, t('repaso.finTitulo')),
        el('p', {}, t('repaso.finTexto', { n: total })),
        el('ul', { class: 'resumen-notas' },
          NOTAS.map(n => el('li', {}, `${t(n.texto)}: ${resultado[n.nota]}`))),
        el('button', { type: 'button', class: 'boton', onclick: inicio }, t('comun.volver')),
        el('a', { class: 'boton', href: '#/cuaderno' }, t('repaso.verCuaderno'))));
    app.querySelector('button')?.focus();
    decir(t('repaso.finTutora', { n: total }), 'contenta');
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
