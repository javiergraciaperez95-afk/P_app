// =====================================================================
// MODO JUEGO A PARTIR DE LA LECCIÓN (para cualquier curso)
// ---------------------------------------------------------------------
// No hay guion escrito a mano: cada bloque del JSON v2 se convierte en un paso jugable.
//   explicación / gramática → la pizarra (se lee a trozos)
//   diálogo                 → el teatro       (juegos/teatro.js)
//   vocabulario             → las cartas      (juegos/cartas.js)
//   lectura                 → la linterna     (juegos/linterna.js)
//   test, huecos, ordenar…  → el ejercicio de siempre, uno por paso
// Pensado para TDAH: una sola cosa cada vez, todo responde, nada se completa solo, y
// no se avanza sin terminar el paso (pero siempre se puede volver atrás).
//
// Cada juego es un módulo que exporta crear(bloque, ctx) → { nodo, apagar? } y llama a
// ctx.hecho() cuando el paso está completo. Así los juegos valen para cualquier idioma:
// solo leen los datos de la lección.
// =====================================================================

import { el, poner, barajar, alAzar } from '../js/dom.js';
import { t, tr } from '../js/i18n.js';
import { decir } from '../js/tutor.js';
import { sonar, pronunciar, hayVoz, ayudaVoz, callar } from '../js/sonidos.js';
import { marcarAbierta, marcarTerminada, registrarRespuesta, anotarPaso, anotarPerfecta, racha } from '../js/progress.js';
import { apuntarPalabrasDeLeccion, analisisDesplegable } from '../js/comunes.js';
import { normalizarPalabra } from '../js/lessons.js';
import { analizarFrase, botonPalabra } from '../js/vistas/leccion.js';
import { crearElenco } from '../js/vistas/elenco.js';
import { LANG, clave } from '../js/curso.js';
import { elegir, probar } from './catalogo.js';
import { esDesarrollador } from '../js/desarrollador.js';
import { confeti } from '../js/fiesta.js';
import './lista.js';

const EJERCICIOS = ['test', 'huecos', 'ordenar', 'escribir'];
const CLAVE_AVANCE = clave('juego2');
const CLAVE_ESTRELLAS = clave('estrellas');
const quieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// La app guarda la lectura como un diálogo con «esTexto»: aquí se le devuelve su nombre.
const tipoDe = b => (b.esTexto ? 'texto' : b.tipo);

/** Una lección tiene este modo juego si trae los bloques de la estructura fija. */
export function hayJuego(leccion) {
  const tipos = new Set(leccion.bloques.map(tipoDe));
  return ['dialogo', 'vocabulario', 'texto'].every(x => tipos.has(x));
}

// ----- Por dónde va (en este dispositivo) -----
function leerAvance(id) {
  try { return JSON.parse(localStorage.getItem(CLAVE_AVANCE))?.[id] ?? { paso: 0, hechos: [] }; } catch { return { paso: 0, hechos: [] }; }
}
// ----- Estrellas: 3 si se falla poco, 2 si algo más, 1 si cuesta. Se guarda la mejor de cada lección. -----
const estrellasPorFallos = fallos => (fallos <= 2 ? 3 : fallos <= 6 ? 2 : 1);
function leerEstrellas() {
  try { return JSON.parse(localStorage.getItem(CLAVE_ESTRELLAS)) ?? {}; } catch { return {}; }
}
/** Todas las estrellas: { id de lección: mejores estrellas }. */
export function todasLasEstrellas() {
  return leerEstrellas();
}
/** Las mejores estrellas (1–3) que se han sacado en una lección, o 0. */
export function estrellasDe(id) {
  return leerEstrellas()[id] ?? 0;
}
function guardarEstrellas(id, n) {
  const todas = leerEstrellas();
  const antes = todas[id] ?? 0;
  if (n > antes) {
    todas[id] = n;
    try { localStorage.setItem(CLAVE_ESTRELLAS, JSON.stringify(todas)); } catch { /* sin almacenamiento */ }
  }
  return antes;
}

/** Por dónde va el modo juego de una lección: { paso, hechos: [índices], total? } (total: los pasos que tiene, con el final). */
export function avanceJuego(id) {
  return leerAvance(id);
}
function guardarAvance(id, avance) {
  try {
    const todo = JSON.parse(localStorage.getItem(CLAVE_AVANCE) ?? '{}');
    todo[id] = avance;
    localStorage.setItem(CLAVE_AVANCE, JSON.stringify(todo));
  } catch { /* sin almacenamiento: se juega igual */ }
}

// ----- Lo que comparten todos los juegos -----
function crearContexto(leccion, palabras) {
  const vocab = new Set((leccion.bloques.find(b => b.tipo === 'vocabulario')?.palabras ?? []).map(normalizarPalabra));
  return {
    leccion, palabras, vocab, LANG, t, tr, sonar, decir, quieto: quieto(),
    entrada: clave => palabras.get(normalizarPalabra(clave)),
    oir(texto) { if (!pronunciar(texto)) decir(ayudaVoz(), 'apurada'); },
    leerSiHayVoz(texto) { if (hayVoz()) pronunciar(texto); },
    /**
     * La frase con sus palabras pulsables (abren la ficha con pron y «?»).
     * Devuelve { nodo, botones: [{ boton, entrada }] } y propone la «palabra que brilla»:
     * una del vocabulario de la lección o, si no hay, la más larga.
     */
    frase(texto) {
      const botones = [];
      const nodo = el('span', { class: 'jg-frase', lang: LANG },
        analizarFrase(texto, palabras).map(trozo => {
          if (!trozo.entrada) return trozo.texto;
          const boton = botonPalabra(trozo.texto, trozo.entrada);
          botones.push({ boton, entrada: trozo.entrada });
          return boton;
        }));
      const delVocab = botones.filter(b => vocab.has(normalizarPalabra(b.entrada.es)));
      const lista = delVocab.length ? delVocab : botones;
      const clave = [...lista].sort((a, b) => b.entrada.es.length - a.entrada.es.length)[0] ?? null;
      return { nodo, botones, clave };
    },
    barajar, alAzar,
    /** Todas las fichas de la lección (sin nombres propios), para opciones y distractores. */
    fichas: () => [...leccion.palabras.values()],
    /** Todas las frases de estudio de la lección ({ es, trad, analisis, quien? }), para distractores. */
    frases: () => leccion.bloques.flatMap(b => b.frases ?? b.ejemplos ?? []).filter(f => f.es),
    /** Apunta el resultado de un ejercicio (cuenta para el progreso de la lección). */
    registrar: (bloque, acierto) => registrarRespuesta(leccion.id, bloque.id, acierto),
    /** Botón «Análisis» con la sintaxis de la frase (si la tiene). */
    analisis: (frase, id) => analisisDesplegable(frase, id),
  };
}

/** Pinta la lección como juego. Devuelve la función que lo limpia todo al salir. */
export function pintarJuegoDeLeccion(contenedor, leccion, { palabras, siguiente, alLibro }) {
  marcarAbierta(leccion.id);
  const pasos = [];
  // El número de la lección decide qué juego le toca a cada bloque (ver catalogo.js).
  const n = Number(leccion.orden_curso ?? leccion.numero_curso ?? parseInt(leccion.id, 10)) || 0;
  const vistos = {};
  const ctxEleccion = crearContexto(leccion, palabras);
  let numeroEjercicio = 0;
  for (const b of leccion.bloques) {
    if (b.error) continue;
    const tipo = tipoDe(b);
    const k = vistos[tipo] = (vistos[tipo] ?? -1) + 1;
    const juego = elegir(tipo, b, ctxEleccion, n, k);
    if (!juego) continue;
    const numero = EJERCICIOS.includes(tipo) ? ++numeroEjercicio : 0;
    pasos.push({ bloque: b, icono: juego.icono, nombre: juego.nombre, crear: juego.crear, numero });
  }
  const avance = leerAvance(leccion.id);
  const hechos = new Set(avance.hechos);
  const dev = esDesarrollador(); // todo cuenta como hecho y los hitos llevan a su paso
  const estaHecho = i => dev || hechos.has(i);
  let actual = Math.min(avance.paso, pasos.length);
  // fallos de esta partida (cada juego hace sonar «mal» al fallar): deciden las estrellas del final
  let fallos = avance.fallos ?? 0;
  // una lección ya terminada se vuelve a jugar entera, como una partida nueva (si no, se podría saltar hasta
  // el final y sacar tres estrellas sin jugar)
  if (actual >= pasos.length) { actual = 0; fallos = 0; hechos.clear(); }
  const guardar = () => guardarAvance(leccion.id, { paso: actual, hechos: [...hechos], total: pasos.length, fallos });
  // en la memoria, voltear dos cartas que no casan es explorar, no fallar: no cuenta
  const NO_CUENTAN = new Set(['memoria']);
  const alSuceso = ({ detail }) => {
    if (detail.nombre !== 'mal' || actual >= pasos.length || NO_CUENTAN.has(pasos[actual]?.nombre)) return;
    fallos += 1;
    guardar();
  };
  window.addEventListener('paglot-suceso', alSuceso);
  // en una prueba se empieza en el primer paso del tipo pedido
  const empezar = probar().empezar;
  if (empezar) actual = Math.max(0, pasos.findIndex(p => tipoDe(p.bloque) === empezar));
  if (Number.isInteger(probar().paso)) actual = probar().paso;
  let apagarPaso = null;
  const elenco = crearElenco();

  const camino = el('ol', { class: 'jg-camino', 'aria-label': t('juego.camino') });
  const escenario = el('div', { class: 'jg-escenario' });
  const atras = el('button', { type: 'button', class: 'es-boton es-boton-papel' }, t('juego.atras'));
  const adelante = el('button', { type: 'button', class: 'es-boton' }, t('juego.siguiente'));
  const raiz = el('article', { class: 'jg escena-web' },
    el('header', { class: 'jg-cabecera' },
      el('a', { class: 'es-boton es-boton-papel jg-volver', href: '#/lecciones' }, `◀ ${t('menu.lecciones')}`),
      el('div', { class: 'jg-titulo' },
        el('p', { class: 'jg-numero' }, t('leccion.numero', { id: leccion.numero_curso })),
        el('h1', { lang: LANG }, leccion.titulo_es),
        leccion.titulo && el('p', { class: 'jg-titulo-trad' }, tr(leccion.titulo))),
      el('button', { type: 'button', class: 'es-boton es-boton-papel jg-libro', onclick: alLibro }, t('juego.verLibro'))),
    camino,
    escenario,
    el('nav', { class: 'jg-pie' }, atras, adelante));

  function pintarCamino() {
    poner(camino, [...pasos, { icono: '🏁' }].map((p, i) => el('li', {
      class: `jg-hito ${i === actual ? 'actual' : ''} ${estaHecho(i) || (i === pasos.length && actual === pasos.length) ? 'hecho' : ''}`,
      'aria-current': i === actual ? 'step' : null,
      onclick: dev ? () => { sonar('paso'); ir(i); } : null,
      style: dev ? 'cursor:pointer' : null,
    }, el('span', { 'aria-hidden': 'true' }, p.icono), el('span', { class: 'solo-lector' }, t('juego.paso', { n: i + 1, total: pasos.length + 1 })))));
    // en el móvil los pasos van en una fila que se desliza: el actual se pone en el centro (sin mover la página)
    const hito = camino.querySelector('.jg-hito.actual');
    if (hito && camino.scrollWidth > camino.clientWidth) camino.scrollLeft = hito.offsetLeft - camino.clientWidth / 2 + hito.offsetWidth / 2;
  }

  // lo que se apunta al terminar, una sola vez por partida (volver atrás desde el final y avanzar otra vez no
  // vuelve a contar la lección para las misiones de hoy)
  let resultado = null;
  function final() {
    if (!resultado) {
      marcarTerminada(leccion.id);
      const nuevasAhora = apuntarPalabrasDeLeccion(leccion, leccion.palabras);
      const sacadas = estrellasPorFallos(fallos);
      const previas = guardarEstrellas(leccion.id, sacadas);
      if (sacadas === 3) anotarPerfecta();
      resultado = { nuevas: nuevasAhora, estrellas: sacadas, antes: previas };
    }
    const { nuevas, estrellas, antes } = resultado;
    const dias = racha();
    sonar('fanfarria');
    decir([t(estrellas === 3 ? 'jg.fin.tutora3' : estrellas === 2 ? 'jg.fin.tutora2' : 'jg.fin.tutora1'), nuevas ? t('leccion.apuntadas', { n: nuevas }) : null].filter(Boolean).join(' '), 'contenta');
    // las estrellas salen una a una, cada una con su moneda; las que no se ganan quedan vacías
    const fila = el('div', { class: 'jg-final-estrellas', role: 'img', 'aria-label': t('jg.fin.estrellas', { n: estrellas }) },
      [1, 2, 3].map(k => el('span', { class: `jg-estrella${k <= estrellas ? ' ganada' : ''}`, style: `--k:${k}`, 'aria-hidden': 'true' }, '★')));
    if (!quieto()) [1, 2, 3].slice(0, estrellas).forEach(k => setTimeout(() => sonar('moneda'), 450 + k * 380));
    const dato = (icono, valor, texto, clase = '') => el('li', { class: `jg-final-dato ${clase}` },
      el('span', { class: 'jg-final-icono', 'aria-hidden': 'true' }, icono),
      el('strong', {}, String(valor)), el('span', {}, texto));
    return el('div', { class: 'jg-final es-papel' },
      el('p', { class: 'jg-final-copa', 'aria-hidden': 'true' }, '🏆'),
      el('h2', {}, t('jg.fin.titulo')),
      fila,
      estrellas > antes && antes > 0 ? el('p', { class: 'jg-final-record' }, t('jg.fin.record')) : null,
      el('ul', { class: 'jg-final-datos' },
        dato('✖', fallos, t('jg.fin.fallos', { n: fallos })),
        dato('📒', nuevas, t('jg.fin.palabras', { n: nuevas })),
        dato('🔥', dias, t('jg.fin.racha', { n: dias }), 'racha')),
      el('p', {}, t('jg.fin.texto')),
      el('div', { class: 'jg-final-botones' },
        siguiente ? el('a', { class: 'es-boton es-boton-grande', href: `#/leccion/${siguiente}`, 'data-sonido': 'puerta' }, t('leccion.siguiente')) : el('a', { class: 'es-boton es-boton-grande', href: '#/lecciones' }, t('comun.volverLecciones')),
        el('a', { class: 'es-boton es-boton-papel', href: '#/lecciones' }, t('jg.fin.mapa')),
        el('a', { class: 'es-boton es-boton-papel', href: '#/repaso' }, t('leccion.repasarAhora'))));
  }

  function ir(i) {
    callar();
    apagarPaso?.();
    apagarPaso = null;
    actual = Math.max(0, Math.min(pasos.length, i));
    guardar();
    pintarCamino();
    atras.disabled = actual === 0;
    if (actual === pasos.length) {
      adelante.hidden = true;
      poner(escenario, final());
      setTimeout(() => confeti(escenario.querySelector('.jg-final-copa'), 34), 250);
      return;
    }
    adelante.hidden = false;
    const paso = pasos[actual];
    const n = actual;
    adelante.disabled = !estaHecho(n) && !probar().saltar; // en una prueba se puede pasar sin terminar
    const ctx = crearContexto(leccion, palabras);
    ctx.elenco = elenco;
    ctx.numeroEjercicio = paso.numero;
    ctx.hecho = () => {
      if (hechos.has(n)) return;
      hechos.add(n);
      anotarPaso();
      guardar();
      if (n === actual) {
        adelante.disabled = false;
        adelante.classList.add('jg-listo');
        pintarCamino();
      }
    };
    adelante.classList.remove('jg-listo');
    const { nodo, apagar } = paso.crear(paso.bloque, ctx);
    apagarPaso = apagar ?? null;
    poner(escenario, el('section', { class: `jg-paso jg-paso-${tipoDe(paso.bloque)} jg-juego-${paso.nombre}` }, nodo));
    if (!ctx.quieto) escenario.firstChild.classList.add('entra');
    raiz.scrollIntoView?.({ block: 'start', behavior: 'auto' });
  }

  atras.addEventListener('click', () => { sonar('pagina'); ir(actual - 1); });
  adelante.addEventListener('click', () => {
    if (adelante.disabled && !probar().saltar) return;
    sonar('paso');
    ir(actual + 1);
  });

  poner(contenedor, raiz);
  elenco.vigilar(escenario);
  ir(actual);
  if (actual === 0) decir(leccion.intro ? tr(leccion.intro) : t('leccion.introTutora', { titulo: leccion.titulo_es }));
  return () => { callar(); apagarPaso?.(); elenco.apagar(); window.removeEventListener('paglot-suceso', alSuceso); };
}
