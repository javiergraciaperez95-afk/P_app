// Botones que se repiten en varias pantallas: escuchar y guardar en el cuaderno.

import { el } from './dom.js';
import { icono } from './iconos.js';
import { pronunciar, sonar, ayudaVoz } from './sonidos.js';
import { estaEnCuaderno, guardarEnCuaderno, quitarDelCuaderno } from './progress.js';
import { decir } from './tutor.js';
import { t, tr } from './i18n.js';
import { GRAMATICA } from './lessons.js';

/** Botón 🔊 que lee el texto en portugués. */
export function botonEscuchar(texto) {
  return el('button', {
    type: 'button',
    class: 'boton-icono',
    'aria-label': t('common.listenTo', { texto }),
    title: t('common.listen'),
    onclick: () => {
      if (!pronunciar(texto)) decir(ayudaVoz(), 'apurada');
    },
  }, icono('altavoz'));
}

/**
 * Botón ☆/★ que guarda o quita del cuaderno.
 * item: { pt, trad, pron?, nota?, tipo, origen? }
 */
export function botonGuardar(item, { conTexto = false } = {}) {
  const boton = el('button', { type: 'button', class: conTexto ? 'boton boton-mini boton-guardar' : 'boton-icono boton-guardar' });

  function pintar() {
    const guardada = estaEnCuaderno(item.pt);
    boton.setAttribute('aria-pressed', String(guardada));
    boton.setAttribute('aria-label', t(guardada ? 'notebook.removeItem' : 'notebook.saveItem', { texto: item.pt }));
    boton.title = t(guardada ? 'notebook.remove' : 'notebook.save');
    boton.replaceChildren(icono(guardada ? 'estrellaLlena' : 'estrella'));
    if (conTexto) boton.append(` ${t(guardada ? 'notebook.inYourNotebook' : 'notebook.save')}`);
  }

  boton.addEventListener('click', () => {
    if (estaEnCuaderno(item.pt)) {
      quitarDelCuaderno(item.pt);
      sonar('quitar');
    } else {
      guardarEnCuaderno(item);
      sonar('guardar');
      decir(t('tutor.saved', { texto: item.pt }), 'contenta');
    }
    pintar();
    // Otros botones de la misma palabra en pantalla se actualizan también.
    window.dispatchEvent(new CustomEvent('cuaderno-cambiado', { detail: item.pt }));
  });
  const alCambiarCuaderno = e => {
    if (!boton.isConnected) window.removeEventListener('cuaderno-cambiado', alCambiarCuaderno);
    else if (e.detail === item.pt) pintar();
  };
  window.addEventListener('cuaderno-cambiado', alCambiarCuaderno);

  pintar();
  return boton;
}

// ---------------------------------------------------------------------------
// Gramática y análisis de la frase
// ---------------------------------------------------------------------------

/** Nombre de una función o tipo de palabra: clave conocida («verbo») o texto libre / { en, vi }. */
export function nombreGramatical(valor) {
  if (typeof valor === 'string' && GRAMATICA.includes(valor)) return t(`grammar.${valor}`);
  return tr(valor);
}

/** Tipo de función, para dar a cada parte su color (además del texto). */
function claseFuncion(funcion) {
  const clave = typeof funcion === 'string' ? funcion : '';
  if (clave === 'interrogativo') return 'fn-pregunta';
  if (clave === 'negacion') return 'fn-negacion';
  if (clave === 'sujeto' || clave === 'pronombre') return 'fn-sujeto';
  if (clave === 'verbo' || clave === 'infinitivo' || clave === 'reflexivo') return 'fn-verbo';
  if (['complemento', 'atributo', 'objeto', 'sustantivo', 'nombre'].includes(clave)) return 'fn-complemento';
  return 'fn-otro';
}

function textoFuncion(parte) {
  const glosa = parte.glosa ? ` (${tr(parte.glosa)})` : '';
  return `${nombreGramatical(parte.funcion)}${glosa}`;
}

/** Las partes de la frase en fila, cada una con su función debajo. */
export function filaAnalisis(analisis) {
  return el('ol', { class: 'analisis', 'aria-label': t('analysis.label') },
    analisis.map(p => el('li', { class: `analisis-parte ${claseFuncion(p.funcion)}` },
      el('span', { class: 'analisis-pt', lang: 'pt-PT' }, p.texto),
      el('span', { class: 'analisis-funcion' }, textoFuncion(p)))));
}

/** Botón «Análisis» que despliega la fila de análisis debajo de la frase. */
export function analisisDesplegable(frase, id) {
  if (!frase.analisis) return null;
  const panel = el('div', { class: 'analisis-panel', id, hidden: true },
    filaAnalisis(frase.analisis),
    frase.estructura && el('p', { class: 'analisis-estructura' }, tr(frase.estructura)));
  const boton = el('button', { type: 'button', class: 'boton boton-mini boton-analisis', 'aria-expanded': 'false', 'aria-controls': id }, `▸ ${t('analysis.button')}`);
  boton.addEventListener('click', () => {
    const abrir = panel.hidden;
    panel.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    boton.textContent = `${abrir ? '▾' : '▸'} ${t('analysis.button')}`;
    sonar('pagina');
  });
  return el('div', { class: 'analisis-bloque' }, boton, panel);
}

/** Versión en texto para que la tutora la lea. */
export function textoAnalisis(frase) {
  if (!frase.analisis) return null;
  const partes = frase.analisis.map(p => `**${p.texto}** → ${textoFuncion(p)}`).join('\n');
  return `${t('analysis.title')}\n${partes}${frase.estructura ? `\n${tr(frase.estructura)}` : ''}`;
}
