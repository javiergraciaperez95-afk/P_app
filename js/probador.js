// El probador de juegos (herramienta interna; sus textos van solo en español): salta de lección en lección, cada vez de
// un idioma al azar, para probar los juegos con los que se estudian las lecciones.
//   · Se abre con siete toques seguidos en el logo de la cabecera (o con #/desarrollador): la pantalla js/vistas/probador.js
//     enseña todos los juegos y «Todo al azar».
//   · Con un juego elegido, solo salen lecciones con un bloque que ese juego sabe jugar, y se empieza en ese paso
//     (lo fuerza «paglot-juego-forzado», que lee juegos/catalogo.js). Los pasos se pueden saltar sin terminarlos.
//   · Mientras está en marcha, una barrita arriba dice el idioma, la lección y el juego que hay en pantalla, con «Otra»
//     y «Salir». Al salir vuelve el curso de antes.
// Cambiar de idioma obliga a recargar la app (el curso se fija al arrancar): por eso cada «Otra» recarga.
// Las lecciones que se juegan cuentan en el progreso de este dispositivo como cualquier otra.

import { CURSOS } from './cursos.js';
import { curso, hayCurso, lenguaDelAlumno, paraQuien, idiomasDe } from './curso.js';
import { CLAVE_AJUSTES } from './ajustes.js';
import { activarDesarrollador } from './desarrollador.js';
import { el } from './dom.js';
import { sonar } from './sonidos.js';

const CLAVE = 'paglot-probador';        // sessionStorage: { juego, tipos, cursoOriginal, idiomaOriginal, intentos }
const FORZADO = 'paglot-juego-forzado'; // localStorage, lo lee juegos/catalogo.js
const CLAVE_CURSO = 'idiomas-curso';    // el curso elegido (js/curso.js)
const MAX_INTENTOS = 8;                 // lecciones seguidas en las que el juego pedido puede no salir
const TOQUES = 7;                       // en el logo, para abrirlo

const leer = () => { try { return JSON.parse(sessionStorage.getItem(CLAVE)) ?? null; } catch { return null; } };
const guardar = estado => { try { sessionStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento */ } };
const azar = lista => lista[Math.floor(Math.random() * lista.length)];

/** true mientras el probador está en marcha (la lección se abre siempre en modo juego). */
export const probadorActivo = () => Boolean(leer());
/** El juego que se está probando (null: todo al azar). */
export const juegoProbado = () => leer()?.juego ?? null;

// ----- Un aviso corto abajo -----
let aviso = null;
function avisar(texto, ms = 2600) {
  aviso?.remove();
  aviso = el('p', { class: 'probador-aviso', role: 'status' }, texto);
  document.body.append(aviso);
  const este = aviso;
  setTimeout(() => este.remove(), ms);
}

// ----- Elegir la siguiente lección -----
// Las lecciones están en una carpeta por idioma del alumno (cursos/<curso>/<es|en|vi>/); las de lessons/ son las antiguas.
const CARPETAS = ['es', 'en', 'vi'];
async function leccionesDe(c) {
  for (const l of CARPETAS) {
    const r = await fetch(`${c.carpeta}/${l}/indice.json`, { cache: 'no-cache' }).catch(() => null);
    if (r?.ok) return (await r.json()).lecciones.map(x => x.id);
  }
  const r = await fetch(`${c.carpeta}/indice/lecciones.json`, { cache: 'no-cache' });
  return r.ok ? (await r.json()).lecciones.map(l => l.id) : [];
}
async function tiposDe(c, id) {
  for (const l of CARPETAS) {
    const r = await fetch(`${c.carpeta}/${l}/${id}.json`).catch(() => null);
    if (r?.ok) return ((await r.json()).etapas ?? []).flatMap(e => e.piezas.map(p => p.tipo));
  }
  const r = await fetch(`${c.carpeta}/lessons/${id}.json`);
  if (!r.ok) return [];
  return ((await r.json()).bloques ?? []).map(b => (b.esTexto ? 'texto' : b.tipo));
}

// El idioma de la interfaz (idiomas-ajustes → idioma). Si el curso que toca no está explicado en el de ahora (o es el
// mismo: español con la interfaz en español), se cambia a uno que el curso tenga: así siempre hay idioma tuyo e idioma
// que se estudia. Los juegos de gramática solo están en el curso de español, por eso no se puede dejar fuera.
function leerAjustes() { try { return JSON.parse(localStorage.getItem(CLAVE_AJUSTES)) ?? {}; } catch { return {}; } }
function ponerIdioma(valor) {
  try { localStorage.setItem(CLAVE_AJUSTES, JSON.stringify({ ...leerAjustes(), idioma: valor })); } catch { /* sin almacenamiento */ }
}

/** Un idioma y una lección al azar (con un bloque que el juego pedido sepa jugar); la app se recarga en ella. */
export async function siguienteLeccion() {
  const estado = leer();
  if (!estado) return;
  // Los cursos en orden al azar; de cada uno se miran unas lecciones. Un curso en el que el juego pedido no sale se
  // apunta (estado.sin) y no se vuelve a mirar: la gramática, por ejemplo, solo está en el curso de español.
  const sin = estado.juego ? (estado.sin?.[estado.juego] ?? []) : [];
  const cursos = [...CURSOS].filter(c => !c.proximamente && !sin.includes(c.id)).sort(() => Math.random() - 0.5);
  const apuntarSin = c => { estado.sin = { ...estado.sin, [estado.juego]: [...sin, c.id] }; sin.push(c.id); guardar(estado); };
  for (const c of cursos) {
    const ids = await leccionesDe(c).catch(() => []);
    if (!ids.length) continue;
    let id = azar(ids);
    let tipo = null;
    if (estado.juego) {
      for (let vez = 0; vez < 4 && !tipo; vez++) {
        if (vez) id = azar(ids);
        const tipos = await tiposDe(c, id).catch(() => []);
        tipo = estado.tipos.find(x => tipos.includes(x)) ?? null;
      }
      if (!tipo) { apuntarSin(c); continue; }
    }
    // la interfaz en tu idioma si el curso lo tiene; si no, en uno que tenga
    const tuya = estado.idiomaOriginal === 'auto' || !estado.idiomaOriginal ? lenguaDelAlumno() : estado.idiomaOriginal;
    ponerIdioma(paraQuien(c, tuya) === 'si' ? estado.idiomaOriginal ?? 'auto' : idiomasDe(c)[0]);
    try {
      localStorage.setItem(CLAVE_CURSO, c.id);
      localStorage.setItem('idiomas-modo-leccion', 'juego'); // cada lección empieza jugando; el 📖 sigue llevando al libro
      localStorage.setItem(FORZADO, JSON.stringify(estado.juego ? { [tipo]: estado.juego, empezar: tipo, saltar: true } : { saltar: true }));
    } catch { /* sin almacenamiento no se puede cambiar de curso */ }
    location.hash = `#/leccion/${id}`;
    location.reload();
    return;
  }
  avisar('No encuentro ninguna lección para ese juego.');
}

/** Pone en marcha el probador con un juego (o null: todo al azar) y salta a la primera lección. */
export function empezarProbador(juego = null, tipos = []) {
  activarDesarrollador();
  const antes = leer();
  guardar({
    juego, tipos, intentos: 0, fallos: {}, sin: antes?.sin ?? {}, // lo aprendido de qué cursos no tienen cada juego
    cursoOriginal: antes ? antes.cursoOriginal : (hayCurso ? curso.id : null),
    idiomaOriginal: antes ? antes.idiomaOriginal : (leerAjustes().idioma ?? 'auto'),
  });
  sonar('abrir');
  avisar('Buscando una lección…');
  siguienteLeccion();
}

/** Lo apaga, devuelve el curso de antes y vuelve a la pantalla del probador. */
export function salirDelProbador() {
  const estado = leer();
  try {
    sessionStorage.removeItem(CLAVE);
    localStorage.removeItem(FORZADO);
    if (estado?.cursoOriginal) localStorage.setItem(CLAVE_CURSO, estado.cursoOriginal);
    else if (estado) localStorage.removeItem(CLAVE_CURSO);
    if (estado) ponerIdioma(estado.idiomaOriginal ?? 'auto');
  } catch { /* sin almacenamiento */ }
  location.hash = '#/desarrollador';
  location.reload();
}

// ----- La barrita de arriba, en las lecciones -----
let barra = null;
let texto = null;
function ponerBarra() {
  const enLeccion = location.hash.startsWith('#/leccion/');
  document.body.classList.toggle('con-probador', Boolean(leer()) && enLeccion);
  if (!leer() || !enLeccion) { barra?.remove(); barra = null; return; }
  if (barra) return;
  texto = el('span', { class: 'probador-texto' }, `🧪 ${curso.nativo}`);
  barra = el('div', { class: 'probador-barra', role: 'region', 'aria-label': 'Probador de juegos' },
    texto,
    el('button', { type: 'button', onclick: () => { sonar('pagina'); siguienteLeccion(); } }, '🎲 Otra'),
    el('button', { type: 'button', onclick: () => { sonar('cerrar'); salirDelProbador(); } }, '✕'));
  document.body.append(barra);
}

if (leer()) {
  addEventListener('hashchange', ponerBarra);
  ponerBarra();
  // juegos/motor.js avisa de cada paso: qué juego hay en pantalla y cuáles tiene la lección
  addEventListener('paglot-paso', ({ detail }) => {
    const estado = leer();
    if (!estado) return;
    ponerBarra();
    if (texto) {
      texto.textContent = detail.final
        ? `🧪 ${curso.nativo} · L. ${detail.leccion} · 🏁`
        : `🧪 ${curso.nativo} · L. ${detail.leccion} · ${detail.icono} ${detail.nombre} · ${detail.actual + 1}/${detail.total}`;
    }
    if (!detail.primero) return;
    // el juego pedido no le sirve a esta lección (le falta algo, o hace falta voz): a por otra
    if (estado.juego && !detail.nombres.includes(estado.juego)) {
      if ((estado.intentos ?? 0) >= MAX_INTENTOS) {
        guardar({ ...estado, intentos: 0 });
        avisar(`«${estado.juego}» no ha salido en ${MAX_INTENTOS} lecciones seguidas (¿hace falta voz en este dispositivo?).`, 5000);
        return;
      }
      // dos lecciones de un curso sin el juego (a clasifica le faltan tipos o géneros en muchos cursos): el curso no se
      // vuelve a mirar para este juego
      const fallos = { ...estado.fallos, [curso.id]: (estado.fallos?.[curso.id] ?? 0) + 1 };
      const sin = estado.sin?.[estado.juego] ?? [];
      const nuevoSin = fallos[curso.id] >= 2 && !sin.includes(curso.id) ? { ...estado.sin, [estado.juego]: [...sin, curso.id] } : estado.sin;
      guardar({ ...estado, intentos: (estado.intentos ?? 0) + 1, fallos, sin: nuevoSin });
      avisar(`Esta lección no sirve para «${estado.juego}»: a por otra…`);
      siguienteLeccion();
    } else if (estado.intentos) guardar({ ...estado, intentos: 0 });
  });
}

// ----- La entrada oculta: siete toques seguidos en el logo de la cabecera -----
let toques = [];
document.addEventListener('click', e => {
  if (!e.target.closest?.('#marca')) return;
  const ahora = Date.now();
  toques = toques.filter(x => ahora - x < 3000);
  toques.push(ahora);
  if (toques.length >= TOQUES) {
    toques = [];
    e.preventDefault();
    activarDesarrollador();
    sonar('fanfarria');
    location.hash = '#/desarrollador';
  } else if (toques.length >= 4) {
    avisar(`${TOQUES - toques.length} más para el modo desarrollador`, 1200);
  }
}, true);
