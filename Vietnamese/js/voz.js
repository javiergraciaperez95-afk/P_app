// Pronunciación en voz alta con la voz del navegador (speechSynthesis, vietnamita).
// Solo para palabras y frases, nunca para párrafos de explicación.
// Cualquier botón con data-hablar="texto" funciona solo.
// Pulsar el mismo botón otra vez en menos de 4 segundos lo repite despacio.

import { esc } from './util.js';
import { decir, bocadillo, abrirTutora } from './tutora.js';

let vozVi = null;
let ultimo = { texto: '', cuando: 0 };
let avisado = false;

const soportado = 'speechSynthesis' in window;

function buscarVoz() {
  if (!soportado) return;
  const voces = speechSynthesis.getVoices();
  const vi = voces.filter((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith('vi'));
  vozVi = vi.find((v) => /natural|online/i.test(v.name)) || vi.find((v) => /google/i.test(v.name)) || vi[0] || null;
}

/** Las voces llegan con retraso en algunos navegadores: espera un poco antes de darlas por perdidas. */
function esperarVoces() {
  if (!soportado || speechSynthesis.getVoices().length) return Promise.resolve();
  return new Promise((resolve) => {
    const listo = () => { speechSynthesis.removeEventListener('voiceschanged', listo); resolve(); };
    speechSynthesis.addEventListener('voiceschanged', listo);
    setTimeout(listo, 1500);
  });
}

export async function hablar(texto) {
  const limpio = String(texto || '').replace(/_{2,}/g, ' ').trim();
  if (!limpio) return;
  const ahora = Date.now();
  const lento = ultimo.texto === limpio && ahora - ultimo.cuando < 4000;
  ultimo = { texto: limpio, cuando: lento ? 0 : ahora };

  if (soportado && !vozVi) { await esperarVoces(); buscarVoz(); }
  if (!vozVi) { hablarEnLinea(limpio, lento); return; }

  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(limpio);
  u.voice = vozVi;
  u.lang = vozVi.lang;
  u.rate = lento ? 0.55 : 0.9;
  speechSynthesis.speak(u);
  if (lento) bocadillo('Otra vez, más despacito.', 'normal');
}

/**
 * Sin voz vietnamita instalada: se usa la voz en línea de Google Translate.
 * (Necesita internet; el index.html lleva «referrer: no-referrer» para que la acepte.)
 */
let audioEnLinea = null;
function hablarEnLinea(texto, lento) {
  if (audioEnLinea) audioEnLinea.pause();
  const a = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(texto.slice(0, 200))}`);
  a.playbackRate = lento ? 0.6 : 1;
  a.addEventListener('error', avisarSinVoz, { once: true });
  audioEnLinea = a;
  a.play().then(() => { if (lento) bocadillo('Otra vez, más despacito.', 'normal'); }).catch(avisarSinVoz);
}

function avisarSinVoz() {
  abrirTutora();
  if (avisado) {
    bocadillo('Sigo sin voz vietnamita en este navegador. Mira mis instrucciones de antes.', 'apurada');
    return;
  }
  avisado = true;
  decir([
    { texto: '¡Vaya! Este navegador no tiene ninguna voz en vietnamita, así que no puedo leerte en voz alta.', expresion: 'apurada' },
    { texto: 'Lo más fácil: abre la web con Microsoft Edge. Trae voces vietnamitas muy naturales (por ejemplo «HoaiMy») y funciona a la primera.', expresion: 'normal' },
    { texto: 'En Windows también puedes instalarla: Configuración → Hora e idioma → Voz → Agregar voces → Vietnamita. Después cierra y vuelve a abrir el navegador.', expresion: 'pensando' },
    { texto: 'En Android: Ajustes → Idioma → Salida de texto a voz → Motor de Google → instala el vietnamita. En iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Vietnamita.', expresion: 'normal' },
  ]);
}

/** Botón de altavoz pixel. */
export function htmlAltavoz(texto, etiqueta = '') {
  return `<button type="button" class="altavoz" data-hablar="${esc(texto)}" aria-label="Escuchar${etiqueta ? ': ' + esc(etiqueta) : ''}" title="Escuchar (pulsa otra vez para oírlo despacio)">${ICONO}</button>`;
}

const ICONO = `<svg viewBox="0 0 10 9" width="20" height="18" aria-hidden="true" shape-rendering="crispEdges">
  <rect x="0" y="3" width="2" height="3" fill="currentColor"/><rect x="2" y="2" width="1" height="5" fill="currentColor"/>
  <rect x="3" y="1" width="1" height="7" fill="currentColor"/><rect x="4" y="0" width="1" height="9" fill="currentColor"/>
  <rect x="6" y="3" width="1" height="3" fill="currentColor"/><rect x="7" y="1" width="1" height="1" fill="currentColor"/>
  <rect x="8" y="2" width="1" height="5" fill="currentColor"/><rect x="7" y="7" width="1" height="1" fill="currentColor"/>
</svg>`;

export function iniciarVoz() {
  if (soportado) {
    buscarVoz();
    speechSynthesis.addEventListener('voiceschanged', buscarVoz);
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-hablar]');
    if (!btn) return;
    e.stopPropagation();
    hablar(btn.dataset.hablar);
  }, true);
}
