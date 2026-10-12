// Botones que se repiten en varias pantallas: escuchar y guardar en el cuaderno.

import { el } from './dom.js';
import { icono } from './iconos.js';
import { pronunciar, sonar, AYUDA_VOZ } from './sonidos.js';
import { estaEnCuaderno, guardarEnCuaderno, quitarDelCuaderno } from './progress.js';
import { decir } from './tutor.js';

/** Botón 🔊 que lee el texto en ruso. */
export function botonEscuchar(texto) {
  return el('button', {
    type: 'button',
    class: 'boton-icono',
    'aria-label': `Escuchar: ${texto}`,
    title: 'Escuchar',
    onclick: () => {
      if (!pronunciar(texto)) decir(AYUDA_VOZ, 'apurada');
    },
  }, icono('altavoz'));
}

/**
 * Botón ☆/★ que guarda o quita del cuaderno.
 * item: { da, es, pron?, nota?, tipo, origen? }
 */
export function botonGuardar(item, { conTexto = false } = {}) {
  const boton = el('button', { type: 'button', class: conTexto ? 'boton boton-mini boton-guardar' : 'boton-icono boton-guardar' });

  function pintar() {
    const guardada = estaEnCuaderno(item.da);
    boton.setAttribute('aria-pressed', String(guardada));
    boton.setAttribute('aria-label', guardada ? `Quitar «${item.da}» del cuaderno` : `Guardar «${item.da}» en el cuaderno`);
    boton.title = guardada ? 'Quitar del cuaderno' : 'Guardar en el cuaderno';
    boton.replaceChildren(icono(guardada ? 'estrellaLlena' : 'estrella'));
    if (conTexto) boton.append(guardada ? ' En tu cuaderno' : ' Guardar en el cuaderno');
  }

  boton.addEventListener('click', () => {
    if (estaEnCuaderno(item.da)) {
      quitarDelCuaderno(item.da);
      sonar('quitar');
    } else {
      guardarEnCuaderno(item);
      sonar('guardar');
      decir(`¡Apuntado! «${item.da}» ya está en tu cuaderno. Lo repasaremos en «Repaso».`, 'contenta');
    }
    pintar();
    // Otros botones de la misma palabra en pantalla se actualizan también.
    window.dispatchEvent(new CustomEvent('cuaderno-cambiado', { detail: item.da }));
  });
  const alCambiarCuaderno = e => {
    if (!boton.isConnected) window.removeEventListener('cuaderno-cambiado', alCambiarCuaderno);
    else if (e.detail === item.da) pintar();
  };
  window.addEventListener('cuaderno-cambiado', alCambiarCuaderno);

  pintar();
  return boton;
}

// ---------------------------------------------------------------------------
// Análisis sintáctico
// ---------------------------------------------------------------------------

/** Tipo de función, para dar a cada parte su color (además del texto). */
function claseFuncion(funcion) {
  const f = funcion.toLowerCase();
  if (f.includes('interrog')) return 'fn-pregunta';
  if (f.includes('negaci')) return 'fn-negacion';
  if (f.includes('sujeto')) return 'fn-sujeto';
  if (f.includes('verbo') || f.includes('infinitivo')) return 'fn-verbo';
  if (f.includes('complemento') || f.includes('atributo') || f.includes('objeto')) return 'fn-complemento';
  return 'fn-otro';
}

/** Las partes de la frase en fila, cada una con su función debajo. */
export function filaAnalisis(analisis) {
  return el('ol', { class: 'analisis', 'aria-label': 'Análisis de la frase' },
    analisis.map(p => el('li', { class: `analisis-parte ${claseFuncion(p.funcion)}` },
      el('span', { class: 'analisis-da', lang: 'ru' }, p.texto),
      el('span', { class: 'analisis-funcion' }, p.funcion))));
}

/** Botón «Análisis» que despliega la fila de análisis debajo de la frase. */
export function analisisDesplegable(frase, id) {
  if (!frase.analisis) return null;
  const panel = el('div', { class: 'analisis-panel', id, hidden: true },
    filaAnalisis(frase.analisis),
    frase.estructura && el('p', { class: 'analisis-estructura' }, frase.estructura));
  const boton = el('button', { type: 'button', class: 'boton boton-mini boton-analisis', 'aria-expanded': 'false', 'aria-controls': id }, '▸ Análisis');
  boton.addEventListener('click', () => {
    const abrir = panel.hidden;
    panel.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    boton.textContent = abrir ? '▾ Análisis' : '▸ Análisis';
    sonar('pagina');
  });
  return el('div', { class: 'analisis-bloque' }, boton, panel);
}

/** Versión en texto para que la tutora la lea. */
export function textoAnalisis(frase) {
  if (!frase.analisis) return null;
  const partes = frase.analisis.map(p => `**${p.texto}** → ${p.funcion}`).join('\n');
  return `Análisis de la frase:\n${partes}${frase.estructura ? `\n${frase.estructura}` : ''}`;
}
