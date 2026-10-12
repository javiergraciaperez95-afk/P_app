// Pantalla inicial: lista de lecciones.

import { esc, alAzar, htmlBarra } from './util.js';
import { estaHecha, estadoEjercicio } from './progreso.js';
import { htmlErrores } from './vista-errores.js';
import { decir } from './tutora.js';
import { T } from './textos.js';
import { perfil } from './perfil.js';
import { contar } from './cuaderno.js';

let primeraVez = true;

export function vistaInicio(raiz, lecciones) {
  const hechas = lecciones.filter((l) => estaHecha(l.id)).length;
  const conErrores = lecciones.filter((l) => l.errores.length);
  const siguiente = lecciones.find((l) => !l.roto && !estaHecha(l.id));

  raiz.innerHTML = `
    <section class="portada">
      <h1 class="portada-titulo">Mis lecciones</h1>
      ${lecciones.length ? `
        <p class="resumen">${hechas} de ${lecciones.length} terminadas</p>
        ${htmlBarra(hechas, lecciones.length, 'Lecciones terminadas')}
        ${siguiente ? `
          <a class="caja continuar" href="#/leccion/${esc(siguiente.id)}">
            <span class="continuar-etiqueta">${hechas ? 'Continuar' : 'Empezar'} ▶</span>
            <span><span class="vi" lang="vi">${esc(siguiente.titulo)}</span> <span class="es">· Lección ${esc(siguiente.id)}</span></span>
          </a>` : ''}
        <div class="capitulos-barra">
          <button type="button" class="btn btn-peq" id="btn-capitulos">Desplegar todo</button>
        </div>
        ${agruparPorCapitulo(lecciones).map((g) => htmlCapitulo(g, siguiente)).join('')}
      ` : `<p class="caja">Todavía no hay lecciones. Añade <code>lecciones/001.json</code>.</p>`}
      ${conErrores.map((l) => htmlErrores(l)).join('')}
    </section>`;

  activarBotonCapitulos(raiz);

  if (!lecciones.length) decir(T.sinLecciones, 'apurada');
  else if (conErrores.length) decir(T.errores, 'apurada');
  else {
    const { nombre } = perfil();
    const pendientes = Object.values(contar()).reduce((a, b) => a + b, 0);
    const paginas = primeraVez ? [...T.bienvenida] : [alAzar(T.inicio)];
    if (nombre) paginas.unshift({ texto: `¡Xin chào, ${nombre}!`, expresion: 'contenta' });
    if (pendientes) paginas.push(`Por cierto: tienes ${pendientes} ${pendientes === 1 ? 'palabra' : 'palabras'} esperando en el repaso.`);
    decir(paginas);
  }
  primeraVez = false;
}

/** Un solo botón: despliega todos los capítulos o, si ya lo están todos, los pliega. */
function activarBotonCapitulos(raiz) {
  const boton = raiz.querySelector('#btn-capitulos');
  if (!boton) return;
  const capitulos = [...raiz.querySelectorAll('.capitulo')];
  const todosAbiertos = () => capitulos.every((c) => c.open);
  const actualizar = () => { boton.textContent = todosAbiertos() ? 'Plegar todo' : 'Desplegar todo'; };
  boton.addEventListener('click', () => {
    const abrir = !todosAbiertos();
    for (const c of capitulos) c.open = abrir;
    actualizar();
  });
  // Si se abre o cierra un capítulo a mano, el botón se pone al día
  for (const c of capitulos) c.addEventListener('toggle', actualizar);
  actualizar();
}

/**
 * Capítulo del libro según el título: «Bài 4 · …» o «Chữ viết và phát âm 4» → 4.
 * Las lecciones sin número se quedan en el capítulo de la anterior.
 */
function agruparPorCapitulo(lecciones) {
  const grupos = [];
  let actual = null;
  for (const lec of lecciones) {
    const m = /^(?:Bài|Chữ viết và phát âm)\s+(\d+)/.exec(lec.titulo || '');
    const cap = m ? m[1] : actual?.cap ?? '';
    if (!actual || actual.cap !== cap) {
      actual = { cap, lecciones: [] };
      grupos.push(actual);
    }
    actual.lecciones.push(lec);
  }
  return grupos;
}

function htmlCapitulo(g, siguiente) {
  const hechas = g.lecciones.filter((l) => estaHecha(l.id)).length;
  const total = g.lecciones.length;
  const abierto = g.lecciones.includes(siguiente);
  return `
    <details class="capitulo"${abierto ? ' open' : ''}>
      <summary class="caja capitulo-cabecera">
        <span class="capitulo-titulo">${g.cap ? `Capítulo ${esc(g.cap)}` : 'Otras lecciones'}</span>
        <span class="capitulo-temas">${g.lecciones.map((l) => esc(temaCorto(l))).join(' · ')}</span>
        <span class="capitulo-progreso ${hechas === total ? 'estado-hecha' : ''}">${hechas === total ? '✓ ' : ''}${hechas}/${total}</span>
      </summary>
      <ol class="lista-lecciones">${g.lecciones.map(htmlTarjeta).join('')}</ol>
    </details>`;
}

/** «Lección 4: ¿cuándo?, la rutina y el futuro» → «¿cuándo?, la rutina y el futuro» */
function temaCorto(l) {
  return String(l.tituloEs || l.titulo).replace(/^Lección \d+:\s*/, '').replace(/^Escritura y pronunciación \((\d+)\).*/, 'Pronunciación');
}

function htmlTarjeta(lec) {
  let estado = '';
  if (lec.roto) estado = '<span class="estado estado-error">⚠ con errores</span>';
  else if (estaHecha(lec.id)) estado = '<span class="estado estado-hecha">✓ Hecha</span>';
  else {
    const ejercicios = lec.bloques.filter((b) => b.esEjercicio);
    const resueltos = ejercicios.filter((b) => estadoEjercicio(lec.id, b.idEj)?.resuelto).length;
    if (resueltos) estado = `<span class="estado">${resueltos}/${ejercicios.length} ejercicios</span>`;
    if (lec.errores.length) estado += '<span class="estado estado-error">⚠ revisar</span>';
  }
  return `
    <li>
      <a class="caja tarjeta" href="#/leccion/${esc(lec.id)}">
        <span class="num">${esc(lec.id)}</span>
        <span class="vi" lang="vi">${esc(lec.titulo)}</span>
        <span class="es">${esc(String(lec.tituloEs).replace(/^Lección \d+:\s*/, ''))}</span>
        ${estado ? `<span class="estados">${estado}</span>` : ''}
      </a>
    </li>`;
}
