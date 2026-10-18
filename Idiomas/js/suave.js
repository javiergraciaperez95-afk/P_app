// En el móvil todo se mueve suave. En el ordenador Paglot va «a saltos» (steps), como un juego de píxeles; en el
// móvil esos saltos se notan a tirones, así que al arrancar se repasan las hojas de estilo y cada steps() pasa a una
// curva suave. Así vale para todas las pantallas, también las que se añadan más adelante, sin tocar cada regla.
// Con «reducir movimiento» no se cambia nada (allí casi todo va quieto).

export const movilSuave = window.matchMedia('(max-width: 700px)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ida y vuelta (flotar, latir, parpadear): acelera y frena sin parones bruscos
const CURVA_VAIVEN = 'cubic-bezier(.37, 0, .63, 1)';
// lo que llega o responde al dedo: sale rápido y frena con cariño
const CURVA_LLEGADA = 'cubic-bezier(.22, 1, .36, 1)';

/** Una curva steps(n) pasada a suave: los recorridos largos (muchos pasos) van constantes, lo demás con vaivén. */
function curvaPara(valor, esTransicion) {
  const m = /steps\(\s*(\d+)/.exec(valor);
  if (!m) return valor;
  if (esTransicion) return CURVA_LLEGADA;
  return Number(m[1]) >= 8 ? 'linear' : CURVA_VAIVEN;
}

/** Separa una lista por comas sin partir lo que va entre paréntesis. */
function partir(lista) {
  const trozos = [];
  let hondo = 0;
  let desde = 0;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] === '(') hondo++;
    else if (lista[i] === ')') hondo--;
    else if (lista[i] === ',' && !hondo) { trozos.push(lista.slice(desde, i).trim()); desde = i + 1; }
  }
  trozos.push(lista.slice(desde).trim());
  return trozos;
}

function suavizarEstilo(estilo) {
  // los atajos con var() o calc() no reparten sus partes hasta que se usan: se cambia el texto del atajo entero
  for (const [propiedad, esTransicion] of [['animation', false], ['transition', true]]) {
    const valor = estilo.getPropertyValue(propiedad);
    if (!valor.includes('steps(') || !valor.includes('var(')) continue;
    estilo.setProperty(propiedad, valor.replace(/steps\([^)]*\)/g, s => curvaPara(s, esTransicion)), estilo.getPropertyPriority(propiedad));
  }
  for (const [propiedad, esTransicion] of [['animation-timing-function', false], ['transition-timing-function', true]]) {
    const valor = estilo.getPropertyValue(propiedad);
    if (!valor.includes('steps(')) continue;
    const nuevo = partir(valor).map(v => curvaPara(v, esTransicion)).join(', ');
    estilo.setProperty(propiedad, nuevo, estilo.getPropertyPriority(propiedad));
  }
  // lo que quede (un atajo con var() seguido de otra parte suelta): se reescribe el texto de la regla, en su orden
  if (estilo.cssText.includes('steps(')) {
    estilo.cssText = estilo.cssText.replace(/(^|;)(\s*)([\w-]+)(\s*:\s*)([^;]*)/g, (todo, antes, hueco, propiedad, dos, valor) =>
      (valor.includes('steps(') ? antes + hueco + propiedad + dos + valor.replace(/steps\([^)]*\)/g, s => curvaPara(s, propiedad.startsWith('transition'))) : todo));
  }
}

function repasar(reglas) {
  for (const regla of reglas) {
    if (regla.style) suavizarEstilo(regla.style); // reglas normales y fotogramas de @keyframes
    if (regla.cssRules) repasar(regla.cssRules); // @media, @supports, @keyframes…
  }
}

/** Pasa a suave todas las hojas de estilo cargadas (solo en el móvil). */
export function suavizarHojas() {
  if (!movilSuave) return;
  for (const hoja of document.styleSheets) {
    try { repasar(hoja.cssRules); } catch { /* hojas de otro sitio (las fuentes): no se pueden leer */ }
  }
}

/** Para las animaciones de JS (Element.animate): en el móvil, la versión suave de una curva steps(). */
export const suavizar = (curva, esTransicion = false) => (movilSuave ? curvaPara(curva, esTransicion) : curva);

if (movilSuave) {
  document.documentElement.classList.add('movil-suave');
  suavizarHojas();
  // por si alguna hoja termina de cargar después
  window.addEventListener('load', suavizarHojas, { once: true });
}
