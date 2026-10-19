// Pequeños detalles para llamar la atención: todo lo que se puede pulsar responde.
// - Al pasar el ratón por encima: un saltito mínimo y un sonido muy, muy suave.
// - Al pulsar: un rebote, unas chispas de píxeles donde se ha tocado y un «bip» (si la pieza no suena ya por su cuenta).
// Se hace aquí, de una vez para toda la app, escuchando en el documento: las pantallas no tienen que saber nada.
// - Cada pieza puede pedir su propio sonido con data-sonido="campana" (los nombres están en sonidos.js); si no,
//   se adivina por lo que es: un desplegable se abre o se cierra, una casilla se marca, una opción se elige…
// - Al escribir suena un golpecito de máquina de escribir y las barras deslizantes suben de nota con el valor.
// El aspecto está en css/styles.css (clases «rozado», «pulsado» y «chispa»).

import { sonar, sonoHace, haySonido } from './sonidos.js';

// Lo que se considera «pulsable».
const PULSABLE = 'a[href], button, select, summary, label.campo-casilla, .boton, .btn, .inicio-figura, .sobre-actriz, .es-tutora, [role="button"]';
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
// el modo calma (html.modo-calma, js/ajustes.js) apaga todo esto: animaciones, chispas y sonidos de adorno
const calma = () => document.documentElement.classList.contains('modo-calma');
const quieto = () => reducir.matches || calma();

function pulsableDe(nodo) {
  const pieza = nodo instanceof Element ? nodo.closest(PULSABLE) : null;
  if (pieza?.closest('[data-sin-efectos]')) return null;
  if (pieza?.closest('body.en-estudio .cabecera')) return null;
  return pieza && !pieza.disabled && pieza.getAttribute('aria-disabled') !== 'true' ? pieza : null;
}

/** Lanza una animación corta poniendo una clase y quitándola al terminar. */
function animar(pieza, clase) {
  if (quieto()) return;
  pieza.classList.remove(clase);
  void pieza.offsetWidth; // para que vuelva a empezar si ya la tenía
  pieza.classList.add(clase);
  // Se quita con un reloj y no al acabar la animación: con la pestaña oculta las animaciones no terminan.
  clearTimeout(pieza[`_${clase}`]);
  pieza[`_${clase}`] = setTimeout(() => pieza.classList.remove(clase), 300);
}

// ----- Pasar por encima (solo con ratón) -----
let rozada = null;
document.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse' || calma()) return;
  const pieza = pulsableDe(e.target);
  if (pieza === rozada) return; // moverse por dentro de la misma pieza no cuenta
  rozada = pieza;
  if (!pieza) return;
  // Las tutoras no se mueven al pasar por encima (queda raro): solo suenan. Al pulsarlas sí reaccionan.
  if (!pieza.matches('.inicio-figura, .sobre-actriz, .es-tutora')) animar(pieza, 'rozado');
  sonar('roce');
});

// ----- Pulsar -----
const COLORES = ['#f4c84a', '#fff4dc', '#ff9aa8', '#8fd8ff'];

function chispas(x, y) {
  if (quieto()) return;
  for (let i = 0; i < 6; i++) {
    const angulo = (Math.PI * 2 * i) / 6 + Math.random() * 0.6;
    const lejos = 18 + Math.random() * 16;
    const chispa = document.createElement('span');
    chispa.className = 'chispa';
    chispa.style.left = `${x}px`;
    chispa.style.top = `${y}px`;
    chispa.style.background = COLORES[i % COLORES.length];
    chispa.style.setProperty('--dx', `${Math.round(Math.cos(angulo) * lejos)}px`);
    chispa.style.setProperty('--dy', `${Math.round(Math.sin(angulo) * lejos)}px`);
    setTimeout(() => chispa.remove(), 450);
    document.body.append(chispa);
  }
}

document.addEventListener('click', e => {
  const pieza = pulsableDe(e.target);
  if (!pieza || calma()) return;
  animar(pieza, 'pulsado');
  // Con el teclado no hay punto de toque: las chispas salen del centro de la pieza.
  const caja = pieza.getBoundingClientRect();
  const conPuntero = e.clientX || e.clientY;
  chispas(conPuntero ? e.clientX : caja.left + caja.width / 2, conPuntero ? e.clientY : caja.top + caja.height / 2);
  // Muchas piezas ya hacen su propio sonido al pulsarlas; las que no, suenan según lo que son.
  const sonido = sonoHace() > 80 && sonidoDe(pieza, e.target);
  if (sonido) sonar(sonido);
});

/** El sonido que le toca a una pieza que no suena por su cuenta. */
function sonidoDe(pieza, objetivo) {
  const pedido = objetivo.closest?.('[data-sonido]')?.dataset.sonido;
  if (pedido && haySonido(pedido)) return pedido;
  // el clic llega antes de que el desplegable cambie: si ahora está abierto, se va a cerrar
  if (pieza.matches('summary')) return pieza.parentElement?.open ? 'cerrar' : 'abrir';
  if (pieza.matches('select')) return 'abrir';
  // en una etiqueta, el clic que cuenta es el que llega a la casilla (ya marcada o desmarcada)
  if (objetivo.matches?.('input[type="radio"]')) return 'elegir';
  if (objetivo.matches?.('input[type="checkbox"]')) return objetivo.checked ? 'marcar' : 'desmarcar';
  if (pieza.matches('label') && pieza.querySelector('input')) return null;
  if (pieza.hasAttribute('aria-expanded')) return pieza.getAttribute('aria-expanded') === 'true' ? 'cerrar' : 'abrir';
  if (pieza.hasAttribute('aria-pressed') || pieza.getAttribute('role') === 'tab') return 'elegir';
  if (pieza.matches('a[target="_blank"]')) return 'abrir';
  if (pieza.matches('a[href^="#/"]')) return 'pagina';
  return 'clic';
}

// ----- Escribir y deslizar -----
const ESCRIBIBLE = 'textarea, input:not([type]), input[type="text"], input[type="email"], input[type="search"], input[type="password"], input[type="number"], input[type="tel"], input[type="url"], [contenteditable="true"]';
let ultimaTecla = 0;
let ultimaBarra = 0;
document.addEventListener('input', e => {
  const campo = e.target;
  if (!(campo instanceof Element) || campo.closest('[data-sin-efectos]') || calma()) return;
  const ahora = performance.now();
  if (campo.matches('input[type="range"]')) {
    if (ahora - ultimaBarra < 45) return;
    ultimaBarra = ahora;
    const min = Number(campo.min) || 0;
    const max = Number(campo.max) || 100;
    sonar('deslizar', { valor: (Number(campo.value) - min) / (max - min || 1) });
    return;
  }
  if (!campo.matches(ESCRIBIBLE) || ahora - ultimaTecla < 35) return;
  ultimaTecla = ahora;
  const tipo = e.inputType ?? '';
  if (tipo.startsWith('delete')) sonar('borrar');
  else if (e.data === ' ') sonar('espacio');
  else if (tipo.startsWith('insert')) sonar('tecla');
});

// Los desplegables nativos: al cambiar de opción suena como una opción elegida.
document.addEventListener('change', e => {
  if (e.target instanceof HTMLSelectElement && !e.target.closest('[data-sin-efectos]') && !calma() && sonoHace() > 80) sonar('elegir');
});
