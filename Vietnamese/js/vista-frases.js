// Pantalla «Frases útiles»: frases para hablar (nivel A2), por secciones y grupos plegables.
// Cada frase tiene altavoz y estrella ☆ para guardarla en el cuaderno (y repasarla).
// Cada grupo enlaza a la lección donde se practican esas frases.

import { esc } from './util.js';
import { htmlEstrella } from './marcar.js';
import { htmlAltavoz } from './voz.js';
import { decir, abrirTutora } from './tutora.js';
import { htmlPronunciacion, paginasPalabra } from './frases.js';
import { sonido } from './sonido.js';
import { SECCIONES } from './frases-utiles.js';

export const LECCION_FRASES = 'Frases útiles';

/** Quita tildes y tonos para buscar sin escribirlos. */
function sinMarcas(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

export function vistaFrases(raiz, lecciones = []) {
  let filtro = '';
  const abiertos = new Set(); // grupos abiertos a mano (se recuerdan al buscar y borrar)
  const titulos = new Map(lecciones.map((l) => [l.id, l.titulo]));

  const pintar = () => {
    const f = sinMarcas(filtro.trim());
    const secciones = SECCIONES
      .map((s) => ({
        ...s,
        grupos: s.grupos
          .map((g) => ({ ...g, frases: f ? g.frases.filter(([es, vi]) => sinMarcas(`${es} ${vi}`).includes(f)) : g.frases }))
          .filter((g) => g.frases.length),
      }))
      .filter((s) => s.grupos.length);
    raiz.querySelector('#frases-cuerpo').innerHTML = secciones.length
      ? secciones.map((s) => `
        <h2 class="frases-seccion">${esc(s.titulo)}</h2>
        ${s.grupos.map((g) => htmlGrupo(g, !!f || abiertos.has(g.titulo), titulos.get(g.leccion))).join('')}`).join('')
      : `<p class="caja">Ninguna frase coincide con «${esc(filtro)}».</p>`;
  };

  const total = SECCIONES.reduce((n, s) => n + s.grupos.reduce((m, g) => m + g.frases.length, 0), 0);
  raiz.innerHTML = `
    <section class="frases-utiles leccion">
      <h1 class="portada-titulo">Frases útiles</h1>
      <p class="pista">${total} frases para hablar con la familia · pulsa un tema para abrirlo · altavoz = escuchar (otra vez = despacio) · ☆ = guardar para repasar</p>
      <p class="pista">Truco: lee el tema, tapa las frases, di las tuyas en voz alta y compara.</p>
      <div class="cuaderno-buscar">
        <label class="sr-only" for="frases-buscar">Buscar frases</label>
        <input id="frases-buscar" class="campo" type="search" placeholder="Buscar (vietnamita o español, sin tildes vale)…" autocomplete="off">
      </div>
      <p class="frases-todo">
        <button type="button" class="btn btn-peq" data-accion="abrir">Abrir todo</button>
        <button type="button" class="btn btn-peq" data-accion="cerrar">Cerrar todo</button>
      </p>
      <div id="frases-cuerpo"></div>
    </section>`;
  raiz.querySelector('#frases-buscar').addEventListener('input', (e) => {
    filtro = e.target.value;
    pintar();
  });
  raiz.querySelector('.frases-todo').addEventListener('click', (e) => {
    const b = e.target.closest('[data-accion]');
    if (!b) return;
    sonido.clic();
    const abrir = b.dataset.accion === 'abrir';
    for (const d of raiz.querySelectorAll('.frases-grupo')) {
      d.open = abrir;
      if (abrir) abiertos.add(d.dataset.grupo); else abiertos.delete(d.dataset.grupo);
    }
  });
  pintar();

  const cuerpo = raiz.querySelector('#frases-cuerpo');
  // Recordar qué grupos se abren o cierran a mano (no mientras se busca: ahí se abren todos)
  cuerpo.addEventListener('toggle', (e) => {
    const d = e.target;
    if (!d.classList?.contains('frases-grupo') || filtro.trim()) return;
    if (d.open) abiertos.add(d.dataset.grupo); else abiertos.delete(d.dataset.grupo);
  }, true);

  // Pulsar una frase: la tutora explica su significado, el sonido y los tonos
  cuerpo.addEventListener('click', (e) => {
    const item = e.target.closest('.frase-util');
    if (!item) return;
    sonido.clic();
    abrirTutora();
    decir(paginasPalabra({ vi: limpiar(item.dataset.vi), es: item.dataset.es }));
  });

  decir('Frases para hablar con la familia, por temas. Abre un tema, escúchalas y márcalas con ☆ para repasarlas.');
}

/** Sin «…», «?» ni signos: solo las sílabas, para explicar cómo suenan. */
function limpiar(vi) {
  return vi.replace(/[…?!.,:]/g, ' ').replace(/\s+/g, ' ').trim();
}

function htmlGrupo(g, abierto, tituloLeccion) {
  return `
    <details class="capitulo frases-grupo" data-grupo="${esc(g.titulo)}"${abierto ? ' open' : ''}>
      <summary class="caja capitulo-cabecera">
        <span class="capitulo-titulo">${esc(g.titulo)}</span>
        <span class="capitulo-temas" lang="vi">${esc(g.frases[0][1])}</span>
        <span class="capitulo-progreso">${g.frases.length}</span>
      </summary>
      <div class="frases-grupo-cuerpo">
        ${tituloLeccion ? `<p class="frases-leccion">Se practica en <a href="#/leccion/${esc(g.leccion)}" lang="vi">${esc(tituloLeccion)}</a></p>` : ''}
        <ul class="vocab-lista">${g.frases.map(([es, vi]) => `
          <li class="vocab-celda">
            <span class="vocab-acciones">${htmlAltavoz(vi, vi)}${htmlEstrella({ vi, es }, LECCION_FRASES)}</span>
            <button type="button" class="btn vocab-item frase-util" data-vi="${esc(vi)}" data-es="${esc(es)}">
              <span class="vocab-vi" lang="vi">${esc(vi)}</span>
              <span class="vocab-es">${esc(es)}</span>
            </button>
            ${htmlPronunciacion({ vi: limpiar(vi) })}
          </li>`).join('')}
        </ul>
      </div>
    </details>`;
}
