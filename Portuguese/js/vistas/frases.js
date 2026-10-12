// Pantalla «Frases»: frases útiles para hablar, agrupadas por categorías y tareas orales.
// Cada frase se puede escuchar, guardar en el cuaderno y analizar.
// Modo práctica: «Tapar el portugués» difumina el portugués; se destapa tocándolo.

import { el, poner } from '../dom.js';
import { botonEscuchar, botonGuardar, analisisDesplegable } from '../comunes.js';
import { decir } from '../tutor.js';
import { sonar, pronunciarSeguido, callar, ayudaVoz } from '../sonidos.js';
import { tarjetaError, listaAvisos } from './lecciones.js';
import { t, tr } from '../i18n.js';

let contador = 0;
let tapado = false;

function tarjetaFrase(f, origen) {
  const pt = el('p', { class: 'frase-pt', lang: 'pt-PT', title: t('phrases.tapToReveal') }, f.pt);
  const tarjeta = el('li', { class: 'caja tarjeta-frase' },
    el('div', { class: 'tarjeta-frase-texto' },
      pt,
      f.trad && el('p', { class: 'frase-trad' }, tr(f.trad)),
      f.pron && el('p', { class: 'aprox' }, `${t('word.pronounced')} ${tr(f.pron)} (${t('word.approx')})`),
      f.notas.map(n => el('p', { class: 'nota' }, tr(n))),
      analisisDesplegable(f, `analisis-frase-${++contador}`)),
    el('div', { class: 'frase-acciones' },
      botonEscuchar(f.pt),
      botonGuardar({ pt: f.pt, trad: f.trad, pron: f.pron, nota: f.notas[0], tipo: 'frase', origen })));
  pt.addEventListener('click', () => tarjeta.classList.toggle('visto'));
  return tarjeta;
}

/** Botón que lee todas las frases de un grupo seguidas. */
function botonEscucharTodas(frases) {
  const textoBoton = () => `▶ ${t('phrases.listenAll')}`;
  const boton = el('button', { type: 'button', class: 'boton boton-mini boton-principal' }, textoBoton());
  let sonando = false;
  boton.addEventListener('click', () => {
    if (sonando) { callar(); sonando = false; boton.textContent = textoBoton(); return; }
    const ok = pronunciarSeguido(frases.map(f => ({ texto: f.pt })), {
      alAcabar: () => { sonando = false; boton.textContent = textoBoton(); },
    });
    if (!ok) { decir(ayudaVoz(), 'apurada'); return; }
    sonando = true;
    boton.textContent = `■ ${t('common.stop')}`;
  });
  return boton;
}

function seccionGrupo(g, categoria) {
  return el('details', { class: 'caja grupo-frases' },
    el('summary', {},
      el('span', { class: 'grupo-titulo' }, tr(g.titulo)),
      g.tarea && el('span', { class: 'grupo-tarea' }, tr(g.tarea))),
    el('div', { class: 'botonera' },
      botonEscucharTodas(g.frases),
      g.leccion && el('a', { class: 'boton boton-mini', href: `#/leccion/${g.leccion}` }, `${t('phrases.inLesson')} ▶`)),
    el('ul', { class: 'lista-frases' }, g.frases.map(f => tarjetaFrase(f, `${t('nav.phrases')} · ${categoria} · ${tr(g.titulo)}`))));
}

export function pintarFrases(app, { categorias, avisos, error }) {
  const indice = categorias.length > 1
    ? el('nav', { class: 'indice', 'aria-label': t('phrases.categories') },
      categorias.map((c, i) => el('a', { class: 'boton boton-mini', href: '#/frases', 'data-destino': `cat-${i}` }, tr(c.titulo))))
    : null;

  // Los enlaces del índice desplazan la página sin cambiar la ruta.
  indice?.addEventListener('click', e => {
    const destino = e.target.closest('a')?.dataset.destino;
    if (!destino) return;
    e.preventDefault();
    const seccion = document.getElementById(destino);
    seccion?.scrollIntoView({ behavior: 'smooth' });
    seccion?.querySelector('h2')?.focus();
  });

  const tapar = el('button', { type: 'button', class: 'boton', 'aria-pressed': String(tapado) });
  const pintarTapar = () => {
    tapar.textContent = tapado ? `👁 ${t('phrases.showPortuguese')}` : `🙈 ${t('phrases.hidePortuguese')}`;
    tapar.setAttribute('aria-pressed', String(tapado));
    app.classList.toggle('frases-tapadas', tapado);
    app.querySelectorAll('.tarjeta-frase.visto').forEach(x => x.classList.remove('visto'));
  };
  tapar.addEventListener('click', () => {
    tapado = !tapado;
    sonar('voltear');
    pintarTapar();
    if (tapado) decir(t('tutor.phrasesHidden'), 'pensando');
  });

  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, t('phrases.title')),
      el('p', {}, t('phrases.intro')),
      el('p', { class: 'aprox' }, t('phrases.howTo')),
      tapar),
    error && tarjetaError(error, 'phrases/frases.json'),
    listaAvisos(avisos, 'phrases/frases.json'),
    indice,
    categorias.map((c, i) => el('section', { class: 'categoria', id: `cat-${i}` },
      el('h2', { tabindex: '-1' }, tr(c.titulo)),
      c.descripcion && el('p', { class: 'aprox' }, tr(c.descripcion)),
      c.frases.length > 0 && el('ul', { class: 'lista-frases' }, c.frases.map(f => tarjetaFrase(f, `${t('nav.phrases')} · ${tr(c.titulo)}`))),
      c.grupos.map(g => seccionGrupo(g, tr(c.titulo))))),
    !categorias.length && !error && el('p', { class: 'caja' }, t('phrases.empty')));
  pintarTapar();

  decir(t('tutor.phrasesIntro'));
}
