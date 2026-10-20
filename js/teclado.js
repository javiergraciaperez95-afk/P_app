// El teclado del móvil. Al salir, la ventana se encoge (en la APK, Capacitor deja la app encima del teclado; en algunos
// navegadores, igual). Si la app se recolocara a ese alto, todo se descompondría: la bienvenida se aplasta, las
// diapositivas se reparten de nuevo en trocitos… Así que mientras se escribe la app se queda como estaba:
//   · --alto-app es el alto de la pantalla SIN teclado (lo usan el CSS y las diapositivas en vez de 100dvh e innerHeight);
//   · html.teclado mientras está abierto: lo que va pegado abajo (la barra de diapositivas, la tutora) se aparta;
//   · el campo en el que se escribe sube a la vista si el teclado lo tapa.

const EDITABLE = 'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]), textarea, select, [contenteditable]';
const raiz = document.documentElement;
const escribiendo = () => Boolean(document.activeElement?.matches?.(EDITABLE));

let alto = window.innerHeight;
let ancho = window.innerWidth;

/** El alto de la pantalla sin el teclado: lo que hay que usar para medir o repartir la página. */
export const altoPantalla = () => alto;
/** true mientras el teclado está abierto (la ventana es más baja que la pantalla). */
export const tecladoAbierto = () => raiz.classList.contains('teclado');

function medir() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  // el alto solo se cree cuando no se escribe, cuando crece o cuando se gira la pantalla (cambia el ancho)
  if (!escribiendo() || h > alto || Math.abs(w - ancho) > 40) alto = h;
  ancho = w;
  raiz.style.setProperty('--alto-app', `${alto}px`);
  raiz.classList.toggle('teclado', escribiendo() && h < alto - 80);
}

let espera = 0;
let subida = null; // la pantalla fija que se ha subido para dejar ver el campo
function bajar() {
  if (!subida) return;
  subida.style.removeProperty('translate');
  subida = null;
}

/** Tras abrirse el teclado, el campo se centra en lo que queda a la vista (si ya se ve, no se mueve). Si va en una
 *  pantalla fija (la bienvenida, un diálogo), que no se desplaza, la pantalla entera sube lo justo. */
function aLaVista(campo) {
  clearTimeout(espera);
  espera = setTimeout(() => {
    if (document.activeElement !== campo || !tecladoAbierto()) return;
    const visible = window.innerHeight - 12;
    let c = campo.getBoundingClientRect();
    if (c.top >= 8 && c.bottom <= visible) return;
    campo.scrollIntoView({ block: 'center' });
    c = campo.getBoundingClientRect();
    if (c.bottom <= visible) return;
    let fija = campo.parentElement;
    while (fija && fija !== document.body && getComputedStyle(fija).position !== 'fixed') fija = fija.parentElement;
    if (!fija || fija === document.body) return;
    bajar();
    subida = fija;
    fija.style.translate = `0 ${-Math.ceil(c.bottom - visible + c.height)}px`;
  }, 280);
}

window.addEventListener('resize', () => {
  medir();
  if (tecladoAbierto()) aLaVista(document.activeElement);
  else bajar();
});
document.addEventListener('focusin', e => { if (e.target.matches?.(EDITABLE)) aLaVista(e.target); });
// al soltar el campo, el teclado se va: se mide cuando ya no hay nada enfocado
document.addEventListener('focusout', () => setTimeout(() => { medir(); if (!tecladoAbierto()) bajar(); }, 0));
medir();
