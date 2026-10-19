// Pantalla «Frases»: frases útiles para hablar, agrupadas por bloques y tareas orales (A2).
// Cada frase se puede escuchar, guardar en el cuaderno y analizar.
// Modo práctica: «Tapar el español» difumina el español; se destapa tocándolo.

import { el, poner } from '../dom.js';
import { t, tr, origenTarjeta } from '../i18n.js';
import { botonEscuchar, botonGuardar, analisisDesplegable } from '../comunes.js';
import { decir } from '../tutor.js';
import { sonar, pronunciarSeguido, callar, ayudaVoz } from '../sonidos.js';
import { tarjetaError } from './lecciones.js';
import { LANG } from '../curso.js';
import { conCartel } from './carteles.js';

let contador = 0;
let tapado = false;

function tarjetaFrase(f, origen) {
  const es = el('p', { class: 'frase-es', lang: LANG, title: t('frases.tocaVer') }, f.es);
  const tarjeta = el('li', { class: 'caja tarjeta-frase' },
    el('div', { class: 'tarjeta-frase-texto' },
      es,
      f.trad && el('p', { class: 'frase-trad' }, tr(f.trad)),
      f.pron && el('p', { class: 'aprox' }, `${t('ficha.sePronuncia')} ${f.pron} ${t('comun.aprox')}`),
      f.nota && el('p', { class: 'nota' }, tr(f.nota)),
      analisisDesplegable(f, `analisis-frase-${++contador}`)),
    el('div', { class: 'frase-acciones' },
      botonEscuchar(f.es),
      botonGuardar({ es: f.es, trad: f.trad, pron: f.pron, nota: f.nota, tipo: 'frase', origen })));
  es.addEventListener('click', () => tarjeta.classList.toggle('visto'));
  return tarjeta;
}

/** Botón que lee todas las frases de un grupo seguidas. */
function botonEscucharTodas(frases) {
  const boton = el('button', { type: 'button', class: 'boton boton-mini boton-principal con-voz' }, t('frases.escucharTodas'));
  let sonando = false;
  boton.addEventListener('click', () => {
    if (sonando) { callar(); sonando = false; boton.textContent = t('frases.escucharTodas'); return; }
    const ok = pronunciarSeguido(frases.map(f => ({ texto: f.es })), {
      alAcabar: () => { sonando = false; boton.textContent = t('frases.escucharTodas'); },
    });
    if (!ok) { decir(ayudaVoz(), 'apurada'); return; }
    sonando = true;
    boton.textContent = t('comun.parar');
  });
  return boton;
}

/** Lo que va dentro de un bloque o de un grupo se pinta al abrirlo por primera vez (y se queda pintado). */
function pintarAlAbrir(desplegable, pintar) {
  let pintado = false;
  desplegable.addEventListener('toggle', () => {
    if (!desplegable.open || pintado) return;
    pintado = true;
    desplegable.append(...pintar().filter(Boolean));
  });
}

/** Las frases de una lista se pintan de 30 en 30: «Ver más» añade la siguiente tanda (así ninguna lista pesa de golpe). */
const TANDA = 30;

/** Lista de frases por tandas (ver TANDA). */
function listaFrases(frases, origen) {
  const lista = el('ul', { class: 'lista-frases' });
  const mas = el('button', { type: 'button', class: 'boton boton-mini frases-mas', 'data-sonido': 'pagina' });
  const bloque = el('div', {}, lista, mas);
  let pintadas = 0;
  const pintarTanda = () => {
    const hasta = Math.min(frases.length, pintadas + TANDA);
    lista.append(...frases.slice(pintadas, hasta).map(f => tarjetaFrase(f, origen)));
    pintadas = hasta;
    if (pintadas < frases.length) mas.textContent = t('frases.verMas', { n: Math.min(TANDA, frases.length - pintadas) });
    else mas.remove();
  };
  mas.addEventListener('click', pintarTanda);
  pintarTanda();
  return bloque;
}

/** Un grupo (una tarea): sus frases solo se pintan al abrirlo. */
function seccionGrupo(g, categoria) {
  const grupo = el('details', { class: 'caja grupo-frases' },
    el('summary', {},
      el('span', { class: 'grupo-titulo' }, tr(g.titulo)),
      g.tarea && el('span', { class: 'grupo-tarea' }, tr(g.tarea))));
  pintarAlAbrir(grupo, () => [
    el('div', { class: 'botonera' },
      botonEscucharTodas(g.frases),
      g.leccion && el('a', { class: 'boton boton-mini', href: `#/leccion/${g.leccion}` }, t('frases.enLeccion', { id: g.leccion }))),
    listaFrases(g.frases, origenDe(categoria, g.titulo)),
  ]);
  return grupo;
}

/** Un bloque (categoría): su título es el desplegable; dentro, sus frases y grupos (solo al abrirlo, plegado al principio). */
function seccionCategoria(c, i) {
  const seccion = el('details', { class: 'categoria', id: `cat-${i}` },
    el('summary', {}, el('h2', { tabindex: '-1' }, tr(c.titulo))));
  pintarAlAbrir(seccion, () => [
    c.descripcion && el('p', { class: 'aprox' }, tr(c.descripcion)),
    c.frases.length > 0 && listaFrases(c.frases, origenDe(c.titulo)),
    ...c.grupos.map(g => seccionGrupo(g, c.titulo)),
  ]);
  return seccion;
}

/** «Frases · Categoría · Grupo» (se guarda en el cuaderno y se traduce al enseñarlo). */
function origenDe(...partes) {
  return origenTarjeta('menu.frases', null, partes);
}

export function pintarFrases(app, { categorias, avisos, error }) {
  const indice = categorias.length > 1
    ? el('nav', { class: 'indice', 'aria-label': t('frases.bloques') },
      categorias.map((c, i) => el('a', { class: 'boton boton-mini', href: '#/frases', 'data-destino': `cat-${i}` }, tr(c.titulo))))
    : null;

  // Los enlaces del índice desplazan la página sin cambiar la ruta.
  indice?.addEventListener('click', e => {
    const destino = e.target.closest('a')?.dataset.destino;
    if (!destino) return;
    e.preventDefault();
    const seccion = document.getElementById(destino);
    if (seccion) seccion.open = true; // si el bloque está plegado, se despliega (y se pintan sus frases)
    seccion?.scrollIntoView({ behavior: 'smooth' });
    seccion?.querySelector('h2')?.focus();
  });

  const tapar = el('button', { type: 'button', class: 'boton', 'aria-pressed': String(tapado) });
  const pintarTapar = () => {
    tapar.textContent = t(tapado ? 'frases.mostrarEspanol' : 'frases.taparEspanol');
    tapar.setAttribute('aria-pressed', String(tapado));
    app.classList.toggle('frases-tapadas', tapado);
    app.querySelectorAll('.tarjeta-frase.visto').forEach(t => t.classList.remove('visto'));
  };
  tapar.addEventListener('click', () => {
    tapado = !tapado;
    sonar('voltear');
    pintarTapar();
    if (tapado) decir(t('frases.tapadoTutora'), 'pensando');
  });

  poner(app,
    conCartel(el('section', { class: 'intro-vista' },
      el('h1', {}, t('frases.titulo')),
      el('p', {}, t('frases.intro')),
      el('p', { class: 'aprox' }, t('frases.comoPracticar')),
      tapar), 'frases'),
    error && tarjetaError(error),
    avisos.length > 0 && el('details', { class: 'caja tarjeta-error' },
      el('summary', {}, t('comun.avisosArchivo', { archivo: 'phrases/frases.json', n: avisos.length })),
      el('ul', {}, avisos.map(a => el('li', {}, a)))),
    indice,
    categorias.map((c, i) => seccionCategoria(c, i)),
    !categorias.length && !error && el('p', { class: 'caja' }, t('frases.ninguna')));
  pintarTapar();

  decir(t(categorias.length ? 'frases.tutora' : 'frases.tutoraSinFrases'));
}
