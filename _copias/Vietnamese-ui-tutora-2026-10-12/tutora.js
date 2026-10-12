// La tutora: cuadro de diálogo con efecto máquina de escribir + animación del sprite.
//
// Uso:  decir('Hola')                          → una página, expresión normal
//       decir(['Pág. 1', 'Pág. 2'], 'contenta')
//       decir([{ texto: '...', expresion: 'pensando' }, ...])

import { dibujarSprite } from './sprite.js';
import { sonido } from './sonido.js';

const MS_POR_LETRA = 22;
const MS_FOTOGRAMA = 90;
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

const el = {};
const estado = { expresion: 'normal', reaccion: null, respiro: false, parpadeo: false, boca: false, fase: 0 };
let paginas = [];
let indice = 0;
let escritas = 0;
let escribiendo = false;
let reloj = null;
let ultimaFirma = '';

export function iniciarTutora() {
  el.canvas = document.getElementById('tutora-canvas');
  el.ctx = el.canvas.getContext('2d');
  el.texto = document.getElementById('tutora-texto');
  el.lector = document.getElementById('tutora-lector');
  el.seguir = document.getElementById('tutora-seguir');

  el.boton = document.getElementById('tutora-boton');
  el.bocadillo = document.getElementById('tutora-bocadillo');
  el.boton.addEventListener('click', alTocar);

  el.seguir.addEventListener('click', avanzar);
  el.texto.addEventListener('click', avanzar);

  // Plegar el cuadro para leer con toda la pantalla; tocar a la tutora lo vuelve a abrir
  document.getElementById('tutora-plegar').addEventListener('click', () => plegar(true));
  let plegada = false;
  try { plegada = localStorage.getItem('vietlibro.tutoraPlegada') === '1'; } catch { /* sin acceso */ }
  plegar(plegada, false);

  programarParpadeo();
  requestAnimationFrame(animar);
}

let mudo = false;

/** Ejecuta algo (p. ej. repintar la pantalla) sin que la tutora interrumpa lo que está diciendo. */
export function enSilencio(fn) {
  mudo = true;
  try { fn(); } finally { mudo = false; }
}

/** Pliega (true) o despliega (false) el cuadro de diálogo de la tutora. */
export function plegar(si, guardar = true) {
  document.body.classList.toggle('tutora-plegada', si);
  el.boton.setAttribute('aria-label', si ? 'Mostrar lo que dice la tutora' : 'Tocar a la tutora');
  if (!si) el.boton.classList.remove('con-aviso');
  if (guardar) { try { localStorage.setItem('vietlibro.tutoraPlegada', si ? '1' : '0'); } catch { /* sin acceso */ } }
}

/** Abre el cuadro si estaba plegado (cuando el usuario pide una explicación). */
export function abrirTutora() {
  if (document.body.classList.contains('tutora-plegada')) plegar(false);
}

export function decir(contenido, expresion = 'normal') {
  if (mudo) return;
  if (document.body.classList.contains('tutora-plegada')) el.boton.classList.add('con-aviso');
  const lista = Array.isArray(contenido) ? contenido : [contenido];
  paginas = lista.map((p) => (typeof p === 'string' ? { texto: p, expresion } : { texto: p.texto, expresion: p.expresion || expresion }));
  indice = 0;
  mostrarPagina();
}

function mostrarPagina() {
  clearInterval(reloj);
  const p = paginas[indice];
  estado.expresion = p.expresion;
  el.lector.textContent = p.texto; // lectores de pantalla: el texto entero de golpe
  el.texto.scrollTop = 0;
  escritas = 0;

  if (sinMovimiento) {
    el.texto.textContent = p.texto;
    terminarPagina();
    return;
  }
  escribiendo = true;
  el.texto.textContent = '';
  actualizarBoton();
  reloj = setInterval(() => {
    escritas++;
    el.texto.textContent = p.texto.slice(0, escritas);
    if (escritas % 3 === 0) estado.boca = !estado.boca;
    if (escritas % 2 === 0 && /\p{L}/u.test(p.texto[escritas - 1])) sonido.voz();
    if (escritas >= p.texto.length) terminarPagina();
  }, MS_POR_LETRA);
}

function terminarPagina() {
  clearInterval(reloj);
  escribiendo = false;
  estado.boca = false;
  el.texto.textContent = paginas[indice].texto;
  actualizarBoton();
}

function avanzar() {
  if (escribiendo) { terminarPagina(); return; }
  if (indice < paginas.length - 1) {
    indice++;
    sonido.pagina();
    mostrarPagina();
  }
}

function actualizarBoton() {
  const quedan = indice < paginas.length - 1;
  el.seguir.hidden = !quedan;
  if (quedan) el.seguir.textContent = `Seguir ▶ ${indice + 1}/${paginas.length}`;
}

// ---------- Reacciones al tocarla ----------

const REACCIONES_CARA = [
  { expresion: 'sorprendida', texto: '¡Eh! ¿Me acabas de tocar la cara?' },
  { expresion: 'guino', texto: 'Ya lo sé: soy adorable.' },
  { expresion: 'apurada', texto: '¡Oye, que me despeinas!' },
  { expresion: 'contenta', texto: 'Jiji, ¡cosquillas!' },
  { expresion: 'pensando', texto: '¿Tengo algo en la cara?' },
  { expresion: 'guino', texto: 'Una profesora tan guapa merece atención, lo entiendo.' },
];
const REACCIONES_CUERPO = [
  { expresion: 'contenta', texto: 'Este libro es mi tesoro.' },
  { expresion: 'guino', texto: 'Sigue estudiando, que te vigilo.' },
  { expresion: 'sorprendida', texto: '¿Quieres que te preste el libro? Ni hablar.' },
];
const PESADO = { expresion: 'apurada', texto: '¡Vale, vale! ¡Que ya me has tocado bastante!' };

let indiceCara = 0;
let indiceCuerpo = 0;
let toquesSeguidos = 0;
let ultimoToque = 0;
let finReaccion = null;
let finBocadillo = null;

function alTocar(e) {
  if (document.body.classList.contains('tutora-plegada')) { plegar(false); sonido.clic(); return; }
  // ¿Dónde ha tocado? Pasamos el clic a píxeles del dibujo (56 x 64).
  const r = el.canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 56;
  const y = ((e.clientY - r.top) / r.height) * 64;
  const conTeclado = e.detail === 0; // Enter/espacio: cuenta como la cara
  const enCara = conTeclado || (y >= 9 && y <= 40 && x >= 11 && x <= 45);

  const ahora = performance.now();
  toquesSeguidos = ahora - ultimoToque < 900 ? toquesSeguidos + 1 : 1;
  ultimoToque = ahora;

  let reaccion;
  if (toquesSeguidos >= 6) reaccion = PESADO;
  else if (enCara) reaccion = REACCIONES_CARA[indiceCara++ % REACCIONES_CARA.length];
  else reaccion = REACCIONES_CUERPO[indiceCuerpo++ % REACCIONES_CUERPO.length];

  bocadillo(reaccion.texto, reaccion.expresion);
  sonido.reaccion();
}

/**
 * Reacción rápida: frase corta en el bocadillo + gesto + saltito,
 * sin borrar lo que esté explicando en el cuadro de diálogo.
 */
export function bocadillo(texto, expresion = 'contenta') {
  estado.reaccion = expresion;
  clearTimeout(finReaccion);
  finReaccion = setTimeout(() => { estado.reaccion = null; }, 1600);

  el.bocadillo.textContent = texto;
  el.bocadillo.hidden = false;
  clearTimeout(finBocadillo);
  finBocadillo = setTimeout(() => { el.bocadillo.hidden = true; }, 2600);

  el.boton.classList.remove('salta');
  void el.boton.offsetWidth; // reinicia la animación
  el.boton.classList.add('salta');
}

/** Cambia el gesto sin decir nada (p. ej. durante el repaso). */
export function ponerExpresion(expresion) {
  estado.expresion = expresion;
}

function programarParpadeo() {
  setTimeout(() => {
    estado.parpadeo = true;
    setTimeout(() => { estado.parpadeo = false; programarParpadeo(); }, 130);
  }, 2200 + Math.random() * 3200);
}

let ultimoFotograma = 0;
function animar(t) {
  requestAnimationFrame(animar);
  if (t - ultimoFotograma < MS_FOTOGRAMA) return;
  ultimoFotograma = t;

  estado.respiro = !sinMovimiento && (t % 2800) > 1400;
  estado.fase = Math.floor(t / 450) % 2;
  const expresion = estado.reaccion || estado.expresion;
  const firma = `${expresion}|${estado.respiro}|${estado.parpadeo}|${estado.boca}|${estado.fase}`;
  if (firma === ultimaFirma) return;
  ultimaFirma = firma;
  dibujarSprite(el.ctx, { ...estado, expresion });
}
