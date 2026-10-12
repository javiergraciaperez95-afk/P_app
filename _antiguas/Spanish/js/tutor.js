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
  caja.classList.toggle('oculta', oculta);
  document.body.classList.toggle('tutora-oculta', oculta);
  pintarBotonOcultar();
  try { localStorage.setItem('espanol-tutora-oculta', oculta ? '1' : ''); } catch { /* sin almacenamiento */ }
}

// ---------------------------------------------------------------------------
// Tocar a la tutora
// ---------------------------------------------------------------------------

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
    sonar('mal');
    decir(fraseNueva(t('tutora.alInsistir')), sprite.expresion);
    toques = 0;
  } else if (zona === 'cara') {
    sprite.reaccionar('cosquillas');
    sonar('risa');
    decir(fraseNueva(t('tutora.alTocarCara')), sprite.expresion);
  } else {
    sprite.reaccionar('cosquillas', 900);
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

try { if (localStorage.getItem('espanol-tutora-oculta')) ocultar(true); } catch { /* sin almacenamiento */ }
pintarBotonOcultar();
ponerExpresion('normal');

window.addEventListener('idioma-cambiado', () => {
  pintarBotonOcultar();
  ponerExpresion(sprite.expresion);
});
