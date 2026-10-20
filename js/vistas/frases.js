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

/** Baja (o sube) la página hasta el elemento despacio y frenando al final, dejándolo justo debajo de la cabecera. */
function deslizarHasta(elemento) {
  const cabecera = document.querySelector('.cabecera')?.getBoundingClientRect().bottom ?? 0;
  const desde = window.scrollY;
  const hasta = Math.max(0, desde + elemento.getBoundingClientRect().top - cabecera - 12);
  const distancia = hasta - desde;
  if (Math.abs(distancia) < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.scrollTo(0, hasta); return; }
  const duracion = Math.min(1100, 450 + Math.abs(distancia) * 0.25);
  const inicio = performance.now();
  const suave = x => 1 - Math.pow(1 - x, 3);
  const paso = ahora => {
    const x = Math.min(1, (ahora - inicio) / duracion);
    window.scrollTo(0, desde + distancia * suave(x));
    if (x < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

/** Lo que va dentro de un bloque o de un grupo se pinta al abrirlo por primera vez (y se queda pintado). */
function pintarAlAbrir(desplegable, pintar) {
  let pintado = false;
  let animacion = null;
  const titulo = () => desplegable.querySelector(':scope > summary');
  const quieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Abrir y cerrar crece y mengua de verdad (la altura, poco a poco), en vez de aparecer de golpe.
  const animar = (desde, hasta, alAcabar) => {
    animacion?.cancel();
    desplegable.style.overflow = 'hidden';
    animacion = desplegable.animate({ height: [`${desde}px`, `${hasta}px`] }, { duration: Math.min(650, 260 + Math.abs(hasta - desde) * 0.35), easing: 'cubic-bezier(.25, .8, .25, 1)' });
    animacion.onfinish = () => { animacion = null; desplegable.style.overflow = ''; alAcabar?.(); };
    animacion.oncancel = () => { desplegable.style.overflow = ''; };
  };
  desplegable.addEventListener('click', e => {
    const s = titulo();
    if (!s || !s.contains(e.target) || e.target.closest('a, button:not(summary)')) return;
    e.preventDefault();
    if (quieto()) { desplegable.open = !desplegable.open; return; }
    const antes = desplegable.offsetHeight;
    if (desplegable.open && !animacion) {
      // cerrar: mengua hasta el título y entonces se cierra
      animar(antes, s.offsetHeight + (desplegable.offsetHeight - desplegable.clientHeight), () => { desplegable.open = false; });
    } else if (!desplegable.open) {
      desplegable.open = true; // el «toggle» pinta lo de dentro
      const despues = desplegable.offsetHeight;
      animar(antes, despues, () => llevarALaVista(s));
    }
  });
  desplegable.addEventListener('toggle', () => {
    if (!desplegable.open || pintado) return;
    pintado = true;
    desplegable.append(...pintar().filter(Boolean));
  });
  // al acabar de abrirse, si el título se ha ido arriba, se baja hasta él despacio
  function llevarALaVista(s) {
    const arriba = s.getBoundingClientRect().top;
    const cabecera = document.querySelector('.cabecera')?.getBoundingClientRect().bottom ?? 0;
    if (arriba < cabecera + 8 || arriba > window.innerHeight * 0.75) {
      deslizarHasta(s);
    }
  }
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
    if (!seccion) return;
    seccion.open = true; // si el bloque está plegado, se despliega (y se pintan sus frases)
    // el foco sin mover la página (antes, el foco hacía saltar de golpe hasta el bloque)
    seccion.querySelector('h2')?.focus({ preventScroll: true });
    deslizarHasta(seccion);
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
