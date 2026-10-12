// Pantalla «Lecciones»: las lecciones agrupadas por unidades (lessons/curso.json).

import { el, poner } from '../dom.js';
import { resumenLeccion, hayProgreso, nombre } from '../progress.js';
import { decir } from '../tutor.js';
import { sonar } from '../sonidos.js';
import { t, tr } from '../i18n.js';
import { textoAviso } from '../lessons.js';

const ICONOS_ESTADO = { nueva: '○', curso: '◐', terminada: '✔' };

function barra(hechos, total) {
  const bloques = Math.max(total, 1);
  return el('span', { class: 'barra', 'aria-hidden': 'true' },
    Array.from({ length: bloques }, (_, i) => el('span', { class: i < hechos ? 'llena' : '' })));
}

/** Tarjeta de error de carga (archivo con fallos de formato, etc.). */
export function tarjetaError(error, archivo) {
  return el('section', { class: 'caja tarjeta-error', role: 'alert' },
    el('h2', {}, `⚠ ${textoAviso(error.titulo, t)}`),
    archivo && el('p', {}, `${t('errors.file')} `, el('code', {}, archivo)),
    el('ul', {}, error.detalles.map(d => el('li', {}, d.codigo !== undefined ? el('code', {}, d.codigo) : textoAviso(d, t)))),
    el('p', { class: 'aprox' }, t('errors.restWorks')));
}

/** Lista desplegable de avisos de un archivo. */
export function listaAvisos(avisos, archivo) {
  if (!avisos?.length) return null;
  return el('details', { class: 'caja tarjeta-error' },
    el('summary', {}, `⚠ ${t('errors.fileWarnings', { archivo, n: avisos.length })}`),
    el('ul', {}, avisos.map(a => el('li', {}, textoAviso(a, t)))));
}

function tarjetaLeccion(resultado, numero) {
  if (resultado.error) return el('li', {}, tarjetaError(resultado.error, resultado.archivo));

  const { leccion } = resultado;
  const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
  return el('li', {}, el('a', { class: `caja tarjeta-leccion es-${r.estado}`, href: `#/leccion/${leccion.id}` },
    el('span', { class: 'tarjeta-numero', 'aria-hidden': 'true' }, String(numero)),
    el('span', { class: 'tarjeta-pt', lang: 'pt-PT' }, leccion.titulo),
    el('span', { class: 'tarjeta-trad' }, tr(leccion.subtitulo)),
    el('span', { class: 'tarjeta-estado' },
      el('span', { class: `estado-${r.estado}` }, `${ICONOS_ESTADO[r.estado]} ${t(`lessons.status.${r.estado}`)}`),
      barra(r.completados, r.total),
      el('span', {}, t('lessons.exercisesDone', { hechos: r.completados, total: r.total })),
      resultado.avisos.length ? el('span', { class: 'aviso-bloque' }, `⚠ ${t('lessons.warnings', { n: resultado.avisos.length })}`) : null)));
}

// Unidades plegadas: se recuerdan en este navegador.
const CLAVE_PLEGADAS = 'ola-unidades-plegadas';

function leerPlegadas() {
  try { return new Set(JSON.parse(localStorage.getItem(CLAVE_PLEGADAS)) ?? []); } catch { return new Set(); }
}

function guardarPlegadas(plegadas) {
  try { localStorage.setItem(CLAVE_PLEGADAS, JSON.stringify([...plegadas])); } catch { /* sin almacenamiento */ }
}

function seccionUnidad(unidad, resultados) {
  const lecciones = unidad.lecciones.map(id => resultados.find(r => r.id === id)).filter(Boolean);
  const validas = lecciones.filter(r => r.leccion);
  const terminadas = validas.filter(r => resumenLeccion(r.leccion.id, r.leccion.idsEjercicios).terminada).length;
  const idLista = `unidad-${unidad.id}`;
  const lista = el('ul', { class: 'lista-lecciones', id: idLista }, lecciones.map((r, i) => tarjetaLeccion(r, i + 1)));

  const boton = el('button', { type: 'button', class: 'capitulo-boton', 'aria-controls': idLista },
    el('span', { class: 'capitulo-flecha', 'aria-hidden': 'true' }),
    el('span', { class: 'capitulo-titulo' }, `${t('lessons.unit', { n: unidad.numero })} · `, el('span', { lang: 'pt-PT' }, unidad.titulo)),
    el('span', { class: 'capitulo-contador' }, `${terminadas}/${validas.length}`));

  const seccion = el('section', { class: 'capitulo' },
    el('header', { class: 'capitulo-cabecera' },
      el('h2', {}, boton),
      unidad.subtitulo && el('p', { class: 'capitulo-trad' }, tr(unidad.subtitulo)),
      unidad.descripcion && el('p', { class: 'aprox' }, tr(unidad.descripcion)),
      el('p', { class: 'capitulo-progreso' }, t('lessons.lessonsFinished', { hechas: terminadas, total: validas.length }))),
    lista);

  function aplicar(plegada) {
    seccion.classList.toggle('plegado', plegada);
    lista.hidden = plegada;
    boton.setAttribute('aria-expanded', String(!plegada));
  }

  boton.addEventListener('click', () => {
    const plegadas = leerPlegadas();
    const plegar = !plegadas.has(unidad.id);
    if (plegar) plegadas.add(unidad.id);
    else plegadas.delete(unidad.id);
    guardarPlegadas(plegadas);
    sonar('pagina');
    aplicar(plegar);
  });

  aplicar(leerPlegadas().has(unidad.id));
  return seccion;
}

function botonesPlegarTodo(unidades) {
  const accion = plegar => () => {
    guardarPlegadas(new Set(plegar ? unidades.map(u => u.id) : []));
    sonar('pagina');
    window.dispatchEvent(new Event('hashchange'));
  };
  return el('div', { class: 'botonera plegar-todo' },
    el('button', { type: 'button', class: 'boton boton-mini', onclick: accion(true) }, `▸ ${t('lessons.collapseAll')}`),
    el('button', { type: 'button', class: 'boton boton-mini', onclick: accion(false) }, `▾ ${t('lessons.expandAll')}`));
}

export function pintarLecciones(app, { unidades, resultados, errorCurso, avisosCurso }) {
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, t('lessons.title')),
      el('p', {}, t('lessons.intro'))),
    errorCurso && tarjetaError(errorCurso, 'lessons/curso.json'),
    listaAvisos(avisosCurso, 'lessons/curso.json'),
    unidades.length > 1 && botonesPlegarTodo(unidades),
    unidades.length
      ? unidades.map(u => seccionUnidad(u, resultados))
      : !errorCurso && el('p', { class: 'caja' }, t('lessons.empty')));

  const quien = nombre() ? `, ${nombre()}` : '';
  decir(hayProgreso() ? t('tutor.welcomeBack', { quien }) : t('tutor.welcome'));
}
