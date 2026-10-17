// Pequeños detalles para llamar la atención: todo lo que se puede pulsar responde.
// - Al pasar el ratón por encima: un saltito mínimo y un sonido muy, muy suave.
// - Al pulsar: un rebote, unas chispas de píxeles donde se ha tocado y un «bip» (si la pieza no suena ya por su cuenta).
// Se hace aquí, de una vez para toda la app, escuchando en el documento: las pantallas no tienen que saber nada.
// El aspecto está en css/styles.css (clases «rozado», «pulsado» y «chispa»).

import { sonar, sonoHace } from './sonidos.js';

// Lo que se considera «pulsable».
const PULSABLE = 'a[href], button, select, summary, label.campo-casilla, .boton, .btn, .inicio-figura, .sobre-actriz, [role="button"]';
const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

function pulsableDe(nodo) {
  const pieza = nodo instanceof Element ? nodo.closest(PULSABLE) : null;
  if (pieza?.closest('[data-sin-efectos]')) return null;
  if (pieza?.closest('body.en-estudio .cabecera')) return null;
  return pieza && !pieza.disabled && pieza.getAttribute('aria-disabled') !== 'true' ? pieza : null;
}

/** Lanza una animación corta poniendo una clase y quitándola al terminar. */
function animar(pieza, clase) {
  if (quieto.matches) return;
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
  if (e.pointerType !== 'mouse') return;
  const pieza = pulsableDe(e.target);
  if (pieza === rozada) return; // moverse por dentro de la misma pieza no cuenta
  rozada = pieza;
  if (!pieza) return;
  // Las tutoras no se mueven al pasar por encima (queda raro): solo suenan. Al pulsarlas sí reaccionan.
  if (!pieza.matches('.inicio-figura, .sobre-actriz')) animar(pieza, 'rozado');
  sonar('roce');
});

// ----- Pulsar -----
const COLORES = ['#f4c84a', '#fff4dc', '#ff9aa8', '#8fd8ff'];

function chispas(x, y) {
  if (quieto.matches) return;
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
  if (!pieza) return;
  animar(pieza, 'pulsado');
  // Con el teclado no hay punto de toque: las chispas salen del centro de la pieza.
  const caja = pieza.getBoundingClientRect();
  const conPuntero = e.clientX || e.clientY;
  chispas(conPuntero ? e.clientX : caja.left + caja.width / 2, conPuntero ? e.clientY : caja.top + caja.height / 2);
  // Muchas piezas ya hacen su propio sonido al pulsarlas; las que no, hacen un «bip».
  if (sonoHace() > 80) sonar('clic');
});
