// Cuadro de diálogo de la tutora: texto con efecto máquina de escribir,
// páginas y expresiones.

import { crearSprite, EXPRESIONES_VALIDAS } from './tutor-sprite.js';
import { t } from './i18n.js';
import { enLinea, poner } from './dom.js';
import { pitidoVoz, sonar } from './sonidos.js';

const VELOCIDAD = 22; // milisegundos por letra
const EXPRESIONES_PASAJERAS = ['contenta', 'sorprendida', 'apurada', 'confundida'];

const caja = document.getElementById('tutora');
const texto = caja.querySelector('.tutora-texto');
const lector = caja.querySelector('.solo-lector');
const botonSiguiente = caja.querySelector('.tutora-siguiente');
const botonOcultar = caja.querySelector('.tutora-ocultar');
const canvas = caja.querySelector('.tutora-canvas');
const retrato = caja.querySelector('.tutora-retrato');

const sprite = crearSprite(canvas);
const sinAnimaciones = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let paginas = [];
let indice = 0;
let temporizador = null;
let volverANormal = null;
let escribiendo = false;
let textoCompleto = '';

function ponerExpresion(nombre) {
  sprite.expresion = EXPRESIONES_VALIDAS.includes(nombre) ? nombre : 'normal';
  canvas.setAttribute('aria-label', `${t('tutora.nombre')} (${t(`expresion.${sprite.expresion}`)})`);
}

/** Muestra «hasta» letras del texto, respetando las negritas. */
function pintarHasta(hasta) {
  const partes = textoCompleto.split(/(\*\*.+?\*\*)/g);
  let restantes = hasta;
  poner(texto);
  for (const parte of partes) {
    if (restantes <= 0) break;
    const negrita = parte.startsWith('**') && parte.endsWith('**');
    const limpio = negrita ? parte.slice(2, -2) : parte;
    const trozo = limpio.slice(0, restantes);
    restantes -= trozo.length;
    texto.append(negrita ? Object.assign(document.createElement('strong'), { textContent: trozo }) : trozo);
  }
  texto.scrollTop = texto.scrollHeight;
}

function mostrarSiguiente(visible) {
  // Si el botón tenía el foco y desaparece, el foco pasa al botón de ocultar.
  if (!visible && document.activeElement === botonSiguiente) botonOcultar.focus({ preventScroll: true });
  botonSiguiente.hidden = !visible;
}

function largoVisible(t) {
  return t.replace(/\*\*/g, '').length;
}

function terminarPagina() {
  clearTimeout(temporizador);
  escribiendo = false;
  sprite.hablando = false;
  texto.classList.remove('escribiendo');
  poner(texto, ...enLinea(textoCompleto));
  const hayMas = indice < paginas.length - 1;
  mostrarSiguiente(hayMas);
  if (!hayMas && EXPRESIONES_PASAJERAS.includes(sprite.expresion)) {
    clearTimeout(volverANormal);
    volverANormal = setTimeout(() => ponerExpresion('normal'), 6000);
  }
}

function mostrarPagina() {
  const pagina = paginas[indice];
  textoCompleto = pagina.texto;
  if (pagina.expresion) ponerExpresion(pagina.expresion);
  lector.textContent = textoCompleto.replace(/\*\*/g, '');
  mostrarSiguiente(indice < paginas.length - 1);

  if (sinAnimaciones) {
    terminarPagina();
    return;
  }

  escribiendo = true;
  sprite.hablando = true;
  texto.classList.add('escribiendo');
  const total = largoVisible(textoCompleto);
  let letras = 0;
  const paso = () => {
    letras += 1;
    pintarHasta(letras);
    if (letras % 3 === 1) pitidoVoz();
    if (letras >= total) {
      terminarPagina();
      return;
    }
    const ultima = textoCompleto.replace(/\*\*/g, '')[letras - 1];
    const pausa = '.!?'.includes(ultima) ? 160 : ',:'.includes(ultima) ? 80 : VELOCIDAD;
    temporizador = setTimeout(paso, pausa);
  };
  paso();
}

// El modo juego enseña a la tutora en su propio escenario: así se entera de lo que dice.
const oyentes = new Set();
export function escucharTutora(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

/**
 * Hace hablar a la tutora.
 * mensaje: un texto, o una lista de páginas (textos u objetos { texto, expresion }).
 */
export function decir(mensaje, expresion = 'normal') {
  for (const fn of oyentes) fn(mensaje, expresion);
  clearTimeout(volverANormal);
  clearTimeout(temporizador);
  const lista = Array.isArray(mensaje) ? mensaje : [mensaje];
  paginas = lista
    .filter(Boolean)
    .map(p => (typeof p === 'string' ? { texto: p } : p));
  if (paginas.length === 0) return;
  if (!paginas[0].expresion) paginas[0].expresion = expresion;
  indice = 0;
  mostrarPagina();
}

function avanzar() {
  if (escribiendo) {
    terminarPagina();
  } else if (indice < paginas.length - 1) {
    indice += 1;
    mostrarPagina();
  }
}

function pintarBotonOcultar() {
  const oculta = caja.classList.contains('oculta');
  botonOcultar.textContent = t(oculta ? 'tutora.mostrar' : 'tutora.ocultar');
  botonOcultar.setAttribute('aria-expanded', String(!oculta));
}

function ocultar(oculta) {
  if (!oculta && caja.classList.contains('oculta')) gesto(['asomarse', 'saludar']);
  caja.classList.toggle('oculta', oculta);
  document.body.classList.toggle('tutora-oculta', oculta);
  pintarBotonOcultar();
  try { localStorage.setItem('idiomas-tutora-oculta', oculta ? '1' : ''); } catch { /* sin almacenamiento */ }
}

// ---------------------------------------------------------------------------
// Tocar a la tutora
// ---------------------------------------------------------------------------

const alAzar = lista => lista[Math.floor(Math.random() * lista.length)];
const gesto = nombres => sprite.gesto?.(nombres); // los dibujos antiguos no tienen animaciones

let toques = 0;
let ultimoToque = 0;
let ultimaFrase = '';

function fraseNueva(lista) {
  const opciones = lista.filter(f => f !== ultimaFrase);
  ultimaFrase = opciones[Math.floor(Math.random() * opciones.length)];
  return ultimaFrase;
}

/** zona: 'cara' (también al usar el teclado) o 'cuerpo'. */
function tocar(zona) {
  const ahora = Date.now();
  toques = ahora - ultimoToque < 2500 ? toques + 1 : 1;
  ultimoToque = ahora;
  if (toques >= 4) {
    sprite.reaccionar('agobiada');
    gesto('caerse');
    sonar('mal');
    decir(fraseNueva(t('tutora.alInsistir')), sprite.expresion);
    toques = 0;
  } else if (zona === 'cara') {
    sprite.reaccionar('cosquillas');
    gesto(alAzar(['verguenza', 'vueltecita', 'guino']));
    sonar('risa');
    decir(fraseNueva(t('tutora.alTocarCara')), sprite.expresion);
  } else {
    sprite.reaccionar('cosquillas', 900);
    gesto(alAzar(['vueltecita', 'firma']));
    sonar('pagina');
    decir(fraseNueva(t('tutora.alTocarCuerpo')), sprite.expresion);
  }
}

retrato.addEventListener('click', e => {
  // Con ratón o dedo se mira dónde ha tocado; con teclado cuenta como la cara.
  const caja = canvas.getBoundingClientRect();
  const enCara = e.detail === 0 || (e.clientY - caja.top) / caja.height < 0.6;
  tocar(enCara ? 'cara' : 'cuerpo');
});

botonSiguiente.addEventListener('click', avanzar);
// Tocar el texto mientras se escribe lo completa de golpe.
texto.addEventListener('click', () => { if (escribiendo) terminarPagina(); });
botonOcultar.addEventListener('click', () => ocultar(!caja.classList.contains('oculta')));

try { if (localStorage.getItem('idiomas-tutora-oculta')) ocultar(true); } catch { /* sin almacenamiento */ }
pintarBotonOcultar();
ponerExpresion('normal');

window.addEventListener('idioma-cambiado', () => {
  pintarBotonOcultar();
  ponerExpresion(sprite.expresion);
});

// ---------------------------------------------------------------------------
// Lo que hace con el cuerpo: reacciona a lo que pasa, saluda al llegar y se entretiene si nadie hace nada
// ---------------------------------------------------------------------------

let aciertosSeguidos = 0;
let fallosSeguidos = 0;
let finVoz = null;

/** Cuántas lecciones lleva hoy (contando esta): a la tercera se acaba el día de estudio y brinda. */
function leccionesDeHoy() {
  const hoy = new Date().toLocaleDateString('sv');
  try {
    const [dia, n] = (localStorage.getItem('idiomas-tutora-hoy') || '').split(':');
    const total = (dia === hoy ? Number(n) || 0 : 0) + 1;
    localStorage.setItem('idiomas-tutora-hoy', `${hoy}:${total}`);
    return total;
  } catch {
    return 1;
  }
}

// sonidos.js avisa de cada efecto que suena y de cuándo lee algo en voz alta.
window.addEventListener('paglot-suceso', ({ detail }) => {
  switch (detail.nombre) {
    case 'bien':
      fallosSeguidos = 0;
      aciertosSeguidos = detail.racha ?? aciertosSeguidos + 1;
      if (aciertosSeguidos >= 3 && aciertosSeguidos % 3 === 0) gesto(alAzar(['pulgar', 'guino', 'cruzarBrazos']));
      else gesto(alAzar(['aplaudir', 'asentir']));
      break;
    case 'mal':
      aciertosSeguidos = 0;
      fallosSeguidos += 1;
      // a la segunda, en vez de solo decirlo, señala dónde mirar
      gesto(fallosSeguidos >= 2 ? 'senalar' : alAzar(['rascarse', 'negar']));
      break;
    case 'fin':
      aciertosSeguidos = 0;
      gesto(leccionesDeHoy() === 3 ? ['celebrar', 'brindar'] : ['celebrar', 'firma']);
      break;
    case 'guardar': gesto('escribir'); break;
    case 'voltear': if (Math.random() < 0.4) gesto('taparseOjos'); break;
    case 'pagina': if (Math.random() < 0.3) gesto('hojear'); break;
    case 'saludo': gesto('saludar'); break;
    case 'voz':
      sprite.escuchando = detail.suena;
      clearTimeout(finVoz);
      if (detail.suena) finVoz = setTimeout(() => { sprite.escuchando = false; }, 20000);
      break;
    default:
  }
});

// Al cambiar de pantalla: en el repaso te reta, en una lección hojea el libro y en las demás saluda (no a cada paso).
let ultimoSaludo = Date.now();
window.addEventListener('hashchange', () => {
  aciertosSeguidos = 0;
  fallosSeguidos = 0;
  const ruta = location.hash.slice(2).split('/')[0];
  if (ruta === 'repaso') gesto('cruzarBrazos');
  else if (ruta === 'leccion') gesto('hojear');
  else if (Date.now() - ultimoSaludo > 45000) { ultimoSaludo = Date.now(); gesto('saludar'); }
});

// Al abrir la app, y al volver a ella tras un rato, se asoma y saluda.
gesto(['asomarse', 'saludar']);
let ocultaDesde = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { ocultaDesde = Date.now(); return; }
  if (Date.now() - ocultaDesde > 60000) { ultimoSaludo = Date.now(); gesto(['asomarse', 'saludar']); }
  actividad();
});

// Si nadie toca nada: de vez en cuando hace algo pequeño y, tras un buen rato, se duerme hasta que vuelvas.
const ESPERAS = ['bostezo', 'estirarse', 'mirarLados', 'moverPie', 'mirarLados', 'pensar', 'firma'];
let ultimaActividad = Date.now();
let proximaEspera = 0;
function actividad() {
  ultimaActividad = Date.now();
  if (sprite.dormida) {
    sprite.dormida = false;
    gesto('respingo');
  }
}
for (const tipo of ['pointerdown', 'keydown', 'wheel', 'touchstart']) document.addEventListener(tipo, actividad, { passive: true, capture: true });
setInterval(() => {
  if (document.hidden || caja.classList.contains('oculta')) return;
  const quieta = Date.now() - ultimaActividad;
  if (quieta > 150000) { sprite.dormida = true; return; }
  if (quieta < 25000 || Date.now() < proximaEspera || escribiendo || sprite.escuchando || sprite.ocupada?.()) return;
  proximaEspera = Date.now() + 12000 + Math.random() * 13000;
  gesto(alAzar(ESPERAS));
}, 1000);
