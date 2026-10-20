// Botones que se repiten en varias pantallas: escuchar y guardar en el cuaderno.

import { el } from './dom.js';
import { icono } from './iconos.js';
import { t, tr, idioma, origenTarjeta } from './i18n.js';
import { pronunciar, sonar, ayudaVoz } from './sonidos.js';
import { estaEnCuaderno, guardarEnCuaderno, guardarVariasEnCuaderno, quitarDelCuaderno } from './progress.js';
import { decir } from './tutor.js';
import { LANG } from './curso.js';

/**
 * Al terminar una lección, sus palabras pasan al cuaderno y, con eso, al repaso. Con ellas van también unas pocas
 * frases cortas de la lección (las de traducir y ordenar, y los ejemplos y diálogos), con su traducción.
 * palabras: las propias de la lección (Map). Devuelve cuántas tarjetas se han añadido ahora.
 * Las fichas «ocultas» (nombres, palabra + partícula…) solo sirven para tocarlas en las frases: no se apuntan.
 */
export function apuntarPalabrasDeLeccion(leccion, palabras = leccion.palabras) {
  const origen = origenTarjeta('cuaderno.deLeccion', { id: leccion.id, titulo: leccion.titulo_es });
  const nuevas = guardarVariasEnCuaderno([
    ...[...palabras.values()].filter(v => !v.oculta).map(v => ({
      es: v.es, trad: v.trad, pron: v.pron, nota: v.nota || v.consejo,
      tipo: v.es.includes(' ') ? 'frase' : 'palabra', origen,
    })),
    ...frasesDeLeccion(leccion).map(f => ({ ...f, tipo: 'frase', origen })),
  ]);
  if (nuevas) window.dispatchEvent(new CustomEvent('cuaderno-cambiado', { detail: null }));
  return nuevas;
}

const FRASES_POR_LECCION = 6;
const PALABRAS_POR_FRASE = 8;

/** Las frases de la lección que merecen tarjeta: cortas, con traducción y sin huecos. Como mucho seis. */
function frasesDeLeccion(leccion) {
  const texto = x => String(typeof x === 'string' ? x : x?.es ?? '').trim();
  const lista = [];
  const meter = (es, trad) => {
    const frase = texto(es);
    const palabras = frase.split(/\s+/).length;
    if (!frase || !trad || frase.includes('_') || palabras < 2 || palabras > PALABRAS_POR_FRASE) return;
    if (lista.some(f => f.es === frase)) return;
    lista.push({ es: frase, trad });
  };
  const enMiIdioma = s => (s && String(s).trim() ? { [idioma()]: String(s).trim() } : null);
  for (const b of leccion.bloques ?? []) {
    if (b.tipo === 'traduccion') meter(b.frase, enMiIdioma(b.opciones?.find(o => o.correcta)?.texto));
    else if (b.tipo === 'ordenar') meter(b.frase, enMiIdioma(tr(b.traduccion)));
    else if (b.tipo === 'gramatica') for (const f of b.ejemplos ?? []) meter(f.es, f.trad);
    else if (b.tipo === 'dialogo' || b.tipo === 'texto') for (const f of b.frases ?? []) meter(f.es, f.trad);
  }
  return lista.slice(0, FRASES_POR_LECCION);
}

/** Botón 🔊 que lee el texto con la voz del dispositivo. Solo se ve si hay voz (clase «con-voz»). */
export function botonEscuchar(texto) {
  return el('button', {
    type: 'button',
    class: 'boton-icono con-voz',
    'aria-label': t('comun.escucharTexto', { texto }),
    title: t('comun.escuchar'),
    onclick: () => {
      if (!pronunciar(texto)) decir(ayudaVoz(), 'apurada');
    },
  }, icono('altavoz'));
}

/**
 * Botón ☆/★ que guarda o quita del cuaderno.
 * item: { es, trad, pron?, nota?, tipo, origen? } (trad y nota: texto o { en, vi }; origen: ver origenTarjeta en i18n.js)
 */
export function botonGuardar(item, { conTexto = false } = {}) {
  const boton = el('button', { type: 'button', class: conTexto ? 'boton boton-mini boton-guardar' : 'boton-icono boton-guardar' });

  function pintar() {
    const guardada = estaEnCuaderno(item.es);
    boton.setAttribute('aria-pressed', String(guardada));
    boton.setAttribute('aria-label', t(guardada ? 'comun.quitarDe' : 'comun.guardarEn', { texto: item.es }));
    boton.title = t(guardada ? 'comun.quitarCuaderno' : 'comun.guardarCuaderno');
    boton.replaceChildren(icono(guardada ? 'estrellaLlena' : 'estrella'));
    if (conTexto) boton.append(' ', t(guardada ? 'comun.enTuCuaderno' : 'comun.guardarCuaderno'));
  }

  boton.addEventListener('click', () => {
    if (estaEnCuaderno(item.es)) {
      quitarDelCuaderno(item.es);
      sonar('quitar');
    } else {
      guardarEnCuaderno(item);
      sonar('guardar');
      decir(t('comun.apuntado', { texto: item.es }), 'contenta');
    }
    pintar();
    // Otros botones de la misma palabra en pantalla se actualizan también.
    window.dispatchEvent(new CustomEvent('cuaderno-cambiado', { detail: item.es }));
  });
  const alCambiarCuaderno = e => {
    if (!boton.isConnected) window.removeEventListener('cuaderno-cambiado', alCambiarCuaderno);
    else if (e.detail === item.es || e.detail === null) pintar(); // null: han cambiado varias a la vez
  };
  window.addEventListener('cuaderno-cambiado', alCambiarCuaderno);

  pintar();
  return boton;
}

// ---------------------------------------------------------------------------
// Análisis sintáctico
// ---------------------------------------------------------------------------

// Palabras clave de cada función, en los idiomas en que se puede escribir el análisis.
const FUNCIONES = [
  ['fn-pregunta', ['interrog', 'question', 'nghi vấn', 'để hỏi', '疑问', '问句']],
  ['fn-negacion', ['negaci', 'negation', 'negative', 'phủ định', '否定']],
  ['fn-sujeto', ['sujeto', 'subject', 'chủ ngữ', '主语']],
  ['fn-verbo', ['verbo', 'infinitivo', 'verb', 'infinitive', 'động từ', '动词']],
  ['fn-complemento', ['complemento', 'atributo', 'objeto', 'object', 'complement', 'tân ngữ', 'bổ ngữ', 'vị ngữ', '宾语', '补语', '表语']],
];

/** Tipo de función, para dar a cada parte su color (además del texto). Mira todos los idiomas del texto. */
function claseFuncion(funcion) {
  const f = (typeof funcion === 'object' && funcion ? Object.values(funcion).join(' ') : String(funcion)).toLowerCase();
  return FUNCIONES.find(([, claves]) => claves.some(c => f.includes(c)))?.[0] ?? 'fn-otro';
}

/** Las partes de la frase en fila, cada una con su función debajo. */
export function filaAnalisis(analisis) {
  return el('ol', { class: 'analisis', 'aria-label': t('analisis.titulo') },
    analisis.map(p => el('li', { class: `analisis-parte ${claseFuncion(p.funcion)}` },
      el('span', { class: 'analisis-es', lang: LANG }, p.texto),
      el('span', { class: 'analisis-funcion' }, tr(p.funcion)))));
}

/** Botón «Análisis» que despliega la fila de análisis debajo de la frase. */
export function analisisDesplegable(frase, id) {
  if (!frase.analisis) return null;
  const panel = el('div', { class: 'analisis-panel', id, hidden: true },
    filaAnalisis(frase.analisis),
    frase.estructura && el('p', { class: 'analisis-estructura' }, tr(frase.estructura)));
  const boton = el('button', { type: 'button', class: 'boton boton-mini boton-analisis', 'aria-expanded': 'false', 'aria-controls': id }, `▸ ${t('analisis.boton')}`);
  boton.addEventListener('click', () => {
    const abrir = panel.hidden;
    panel.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    boton.textContent = `${abrir ? '▾' : '▸'} ${t('analisis.boton')}`;
    sonar('pagina');
  });
  return el('div', { class: 'analisis-bloque' }, boton, panel);
}

/** Versión en texto para que la tutora la lea. */
export function textoAnalisis(frase) {
  if (!frase.analisis) return null;
  const partes = frase.analisis.map(p => `**${p.texto}** → ${tr(p.funcion)}`).join('\n');
  return `${t('analisis.titulo')}:\n${partes}${frase.estructura ? `\n${tr(frase.estructura)}` : ''}`;
}
