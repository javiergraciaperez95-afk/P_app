// Pantalla «Frases»: frases útiles para hablar, agrupadas por bloques y tareas orales (A2).
// Cada frase se puede escuchar, guardar en el cuaderno y analizar.
// Modo práctica: «Tapar el holandés» difumina el holandés; se destapa tocándolo.

import { el, poner } from '../dom.js';
import { botonEscuchar, botonGuardar, analisisDesplegable } from '../comunes.js';
import { decir } from '../tutor.js';
import { sonar, pronunciarSeguido, callar, AYUDA_VOZ } from '../sonidos.js';
import { tarjetaError } from './lecciones.js';

let contador = 0;
let tapado = false;

function tarjetaFrase(f, origen) {
  const da = el('p', { class: 'frase-da', lang: 'nl', title: 'Toca para ver la frase' }, f.da);
  const tarjeta = el('li', { class: 'caja tarjeta-frase' },
    el('div', { class: 'tarjeta-frase-texto' },
      da,
      f.es && el('p', { class: 'frase-es' }, f.es),
      f.pron && el('p', { class: 'aprox' }, `Se pronuncia: ${f.pron} (aprox.)`),
      f.nota && el('p', { class: 'nota' }, f.nota),
      analisisDesplegable(f, `analisis-frase-${++contador}`)),
    el('div', { class: 'frase-acciones' },
      botonEscuchar(f.da),
      botonGuardar({ da: f.da, es: f.es, pron: f.pron, nota: f.nota, tipo: 'frase', origen })));
  da.addEventListener('click', () => tarjeta.classList.toggle('visto'));
  return tarjeta;
}

/** Botón que lee todas las frases de un grupo seguidas. */
function botonEscucharTodas(frases) {
  const boton = el('button', { type: 'button', class: 'boton boton-mini boton-principal' }, '▶ Escuchar todas');
  let sonando = false;
  boton.addEventListener('click', () => {
    if (sonando) { callar(); sonando = false; boton.textContent = '▶ Escuchar todas'; return; }
    const ok = pronunciarSeguido(frases.map(f => ({ texto: f.da })), {
      alAcabar: () => { sonando = false; boton.textContent = '▶ Escuchar todas'; },
    });
    if (!ok) { decir(AYUDA_VOZ, 'apurada'); return; }
    sonando = true;
    boton.textContent = '■ Parar';
  });
  return boton;
}

function seccionGrupo(g, categoria) {
  return el('details', { class: 'caja grupo-frases' },
    el('summary', {},
      el('span', { class: 'grupo-titulo' }, g.titulo),
      g.tarea && el('span', { class: 'grupo-tarea' }, g.tarea)),
    el('div', { class: 'botonera' },
      botonEscucharTodas(g.frases),
      g.leccion && el('a', { class: 'boton boton-mini', href: `#/leccion/${g.leccion}` }, `En la lección ${g.leccion} ▶`)),
    el('ul', { class: 'lista-frases' }, g.frases.map(f => tarjetaFrase(f, `Frases · ${categoria} · ${g.titulo}`))));
}

export function pintarFrases(app, { categorias, avisos, error }) {
  const indice = categorias.length > 1
    ? el('nav', { class: 'indice', 'aria-label': 'Bloques' },
      categorias.map((c, i) => el('a', { class: 'boton boton-mini', href: '#/frases', 'data-destino': `cat-${i}` }, c.titulo)))
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
    tapar.textContent = tapado ? '👁 Mostrar el holandés' : '🙈 Tapar el holandés';
    tapar.setAttribute('aria-pressed', String(tapado));
    app.classList.toggle('frases-tapadas', tapado);
    app.querySelectorAll('.tarjeta-frase.visto').forEach(t => t.classList.remove('visto'));
  };
  tapar.addEventListener('click', () => {
    tapado = !tapado;
    sonar('voltear');
    pintarTapar();
    if (tapado) decir('Holandés tapado. Lee la tarea y la traducción, di la frase en voz alta y toca el texto borroso para comprobar.', 'pensando');
  });

  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, 'Frases para hablar'),
      el('p', {}, 'Frases cortas para salir del paso: saludar, presentarse y pedir.'),
      el('p', { class: 'aprox' }, 'Cómo practicar: lee la tarea, tapa el holandés, di tus frases en voz alta y compara. La estrella las guarda en tu cuaderno.'),
      tapar),
    error && tarjetaError(error),
    avisos.length > 0 && el('details', { class: 'caja tarjeta-error' },
      el('summary', {}, `⚠ El archivo phrases/frases.json tiene ${avisos.length} aviso(s)`),
      el('ul', {}, avisos.map(a => el('li', {}, a)))),
    indice,
    categorias.map((c, i) => el('section', { class: 'categoria', id: `cat-${i}` },
      el('h2', { tabindex: '-1' }, c.titulo),
      c.descripcion && el('p', { class: 'aprox' }, c.descripcion),
      c.frases.length > 0 && el('ul', { class: 'lista-frases' }, c.frases.map(f => tarjetaFrase(f, `Frases · ${c.titulo}`))),
      c.grupos.map(g => seccionGrupo(g, c.titulo)))),
    !categorias.length && !error && el('p', { class: 'caja' }, 'Todavía no hay frases. Se añaden en phrases/frases.json.'));
  pintarTapar();

  decir('Aquí tienes frases para hablar. Abre una tarea, escucha y repite. Y si quieres subir el nivel, tapa el holandés.');
}
