// Pantalla «Mi cuaderno»: las palabras guardadas con ★ y su estado de repaso.

import { esc } from './util.js';
import * as cuaderno from './cuaderno.js';
import { inicioDia, formatoDias, enAprendizaje } from './srs.js';
import { htmlEstrella } from './marcar.js';
import { decir } from './tutora.js';
import { htmlAltavoz } from './voz.js';

/** Quita tildes y tonos para buscar sin tener que escribirlos («chao» encuentra «chào»). */
function sinMarcas(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

export function vistaCuaderno(raiz) {
  let filtro = '';

  const pintarLista = () => {
    const caja = raiz.querySelector('#cuaderno-cuerpo');
    if (!caja) return;
    const todas = cuaderno.lista().sort((a, b) => b.anadida - a.anadida);
    const c = cuaderno.contar();
    const pendientes = c.nuevas + c.aprendiendo + c.repasos;
    const f = sinMarcas(filtro.trim());
    const vistas = f ? todas.filter((t) => sinMarcas(`${t.vi} ${t.es}`).includes(f)) : todas;

    if (!todas.length) {
      raiz.querySelector('#cuaderno-buscar-caja').hidden = true;
      caja.innerHTML = `
        <div class="caja">
          <p><strong>Tu cuaderno está vacío.</strong></p>
          <p>Para guardar una palabra, tócala en cualquier frase y pulsa <strong>☆ Guardar</strong> en el globo, o pulsa la estrella ☆ de la lista de vocabulario.</p>
          <a class="btn" href="#/">Ir a las lecciones</a>
        </div>`;
      return;
    }
    raiz.querySelector('#cuaderno-buscar-caja').hidden = false;
    caja.innerHTML = `
      <div class="caja cuaderno-resumen">
        <p>${todas.length} ${todas.length === 1 ? 'palabra guardada' : 'palabras guardadas'}</p>
        ${htmlContadores(c)}
        <a class="btn ${pendientes ? 'btn-acento' : ''}" href="#/repaso">${pendientes ? `Repasar ahora (${pendientes})` : 'Nada que repasar hoy'}</a>
      </div>
      ${vistas.length
        ? `<ul class="cuaderno-lista">${vistas.map(htmlTarjeta).join('')}</ul>`
        : `<p class="caja">Ninguna palabra coincide con «${esc(filtro)}».</p>`}`;
  };

  raiz.innerHTML = `
    <section class="cuaderno">
      <h1 class="portada-titulo">Mi cuaderno</h1>
      <div class="cuaderno-buscar" id="cuaderno-buscar-caja">
        <label class="sr-only" for="cuaderno-buscar">Buscar en el cuaderno</label>
        <input id="cuaderno-buscar" class="campo" type="search" placeholder="Buscar (vietnamita o español, sin tildes vale)…" autocomplete="off">
      </div>
      <div id="cuaderno-cuerpo"></div>
    </section>`;
  raiz.querySelector('#cuaderno-buscar').addEventListener('input', (e) => {
    filtro = e.target.value;
    pintarLista();
  });
  pintarLista();

  decir(cuaderno.lista().length
    ? 'Aquí guardas las palabras que quieres recordar. Yo me encargo de preguntártelas justo antes de que se te olviden.'
    : 'Tu cuaderno está vacío. Marca con ☆ las palabras que quieras recordar y aquí las tendrás.');

  document.addEventListener('cuaderno-cambio', pintarLista);
  return () => document.removeEventListener('cuaderno-cambio', pintarLista);
}

/** Los tres números de Anki: nuevas (azul), aprendiendo (rojo), repasar (verde). */
export function htmlContadores(c) {
  return `
    <p class="contadores">
      <span class="c-nuevas">${c.nuevas} <small>nuevas</small></span>
      <span class="c-aprendiendo">${c.aprendiendo} <small>aprendiendo</small></span>
      <span class="c-repaso">${c.repasos} <small>para repasar</small></span>
    </p>`;
}

function htmlTarjeta(t) {
  return `
    <li class="caja cuaderno-item">
      <div class="cuaderno-palabra">
        <span class="vocab-vi" lang="vi">${esc(t.vi)}</span>
        ${t.pron ? `<span class="vocab-pron">[${esc(t.pron)}]</span>` : ''}
        <span class="vocab-es">${esc(t.es)}</span>
        ${t.ejemplo?.vi ? `<span class="cuaderno-ejemplo"><span lang="vi">${esc(t.ejemplo.vi)}</span>${t.ejemplo.es ? ` — ${esc(t.ejemplo.es)}` : ''}</span>` : ''}
      </div>
      <div class="cuaderno-estado">
        ${htmlEstado(t.srs)}
        ${t.leccion ? `<span class="pista">${/^\d+$/.test(t.leccion) ? 'Lección ' : ''}${esc(t.leccion)}</span>` : ''}
      </div>
      <span class="vocab-acciones">${htmlAltavoz(t.vi, t.vi)}${htmlEstrella(t, t.leccion)}</span>
    </li>`;
}

function htmlEstado(s) {
  if (s.estado === 'nueva') return '<span class="chip chip-nueva">Nueva</span>';
  if (enAprendizaje(s)) return '<span class="chip chip-aprendiendo">Aprendiendo</span>';
  const dias = Math.round((s.vence - inicioDia(Date.now())) / 86400000);
  const cuando = dias <= 0 ? 'hoy' : dias === 1 ? 'mañana' : `en ${formatoDias(dias)}`;
  const madura = s.intervalo >= 21;
  return `<span class="chip ${madura ? 'chip-madura' : 'chip-joven'}">${madura ? 'Madura' : 'Joven'}</span>
    <span class="pista">Próximo repaso: ${cuando}</span>`;
}
