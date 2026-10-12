// Pantalla «Lecciones»: las lecciones agrupadas por capítulos.

import { el, poner } from '../dom.js';
import { resumenLeccion, hayProgreso, nombre } from '../progress.js';
import { decir } from '../tutor.js';
import { sonar } from '../sonidos.js';

const ESTADOS = {
  nueva: { icono: '○', texto: 'Nueva' },
  curso: { icono: '◐', texto: 'En curso' },
  terminada: { icono: '✔', texto: 'Terminada' },
};

function barra(hechos, total) {
  const bloques = Math.max(total, 1);
  return el('span', { class: 'barra', 'aria-hidden': 'true' },
    Array.from({ length: bloques }, (_, i) => el('span', { class: i < hechos ? 'llena' : '' })));
}

export function tarjetaError(error, archivo) {
  return el('section', { class: 'caja tarjeta-error', role: 'alert' },
    el('h2', {}, `⚠ ${error.titulo}`),
    archivo && el('p', {}, 'Archivo: ', el('code', {}, archivo)),
    el('ul', {}, error.detalles.map(d => el('li', {}, typeof d === 'string' ? d : el('code', {}, d.codigo)))),
    el('p', { class: 'aprox' }, 'El resto de la aplicación funciona con normalidad.'));
}

function tarjetaLeccion(resultado) {
  if (resultado.error) return el('li', {}, tarjetaError(resultado.error, resultado.archivo));

  const { leccion } = resultado;
  const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
  const estado = ESTADOS[r.estado];
  return el('li', {}, el('a', { class: `caja tarjeta-leccion es-${r.estado}`, href: `#/leccion/${leccion.id}` },
    el('span', { class: 'tarjeta-numero', 'aria-hidden': 'true' }, leccion.id),
    el('span', { class: 'tarjeta-da', lang: 'sv' }, leccion.titulo_da),
    el('span', { class: 'tarjeta-es' }, leccion.titulo_es),
    el('span', { class: 'tarjeta-estado' },
      el('span', { class: `estado-${r.estado}` }, `${estado.icono} ${estado.texto}`),
      barra(r.completados, r.total),
      el('span', {}, `${r.completados}/${r.total} ejercicios`),
      resultado.avisos.length ? el('span', { class: 'aviso-bloque' }, `⚠ ${resultado.avisos.length} aviso(s)`) : null)));
}

/** Agrupa por «capitulo». Las lecciones sin capítulo van al final. */
function agrupar(resultados, capitulos) {
  const grupos = new Map();
  for (const c of capitulos) grupos.set(String(c.numero), { capitulo: c, lecciones: [] });
  for (const r of resultados) {
    const clave = r.leccion?.capitulo != null ? String(r.leccion.capitulo) : 'sin';
    if (!grupos.has(clave)) grupos.set(clave, { capitulo: clave === 'sin' ? null : { numero: clave }, lecciones: [] });
    grupos.get(clave).lecciones.push(r);
  }
  const lista = [...grupos.values()].filter(g => g.lecciones.length);
  // Primero los capítulos numéricos en orden; luego los de nombre (p. ej. «muestra»); «sin capítulo» al final.
  const peso = g => (!g.capitulo ? [2, 0] : /^\d+$/.test(String(g.capitulo.numero)) ? [0, Number(g.capitulo.numero)] : [1, 0]);
  return lista
    .map((g, i) => ({ g, i, p: peso(g) }))
    .sort((a, b) => a.p[0] - b.p[0] || a.p[1] - b.p[1] || a.i - b.i)
    .map(x => x.g);
}

// Capítulos plegados: se recuerdan en este navegador.
const CLAVE_PLEGADOS = 'sueco-capitulos-plegados';

function leerPlegados() {
  try { return new Set(JSON.parse(localStorage.getItem(CLAVE_PLEGADOS)) ?? []); } catch { return new Set(); }
}

function guardarPlegados(plegados) {
  try { localStorage.setItem(CLAVE_PLEGADOS, JSON.stringify([...plegados])); } catch { /* sin almacenamiento */ }
}

function seccionCapitulo({ capitulo, lecciones }, i) {
  const validas = lecciones.filter(r => r.leccion);
  const terminadas = validas.filter(r => resumenLeccion(r.leccion.id, r.leccion.idsEjercicios).terminada).length;
  // Si el «numero» no es un número (p. ej. "muestra"), se muestra solo el título.
  const numerico = capitulo && /^\d+$/.test(String(capitulo.numero));
  const titulo = !capitulo
    ? 'Otras lecciones'
    : numerico
      ? `Capítulo ${capitulo.numero}${capitulo.titulo_es ? ` · ${capitulo.titulo_es}` : ''}`
      : capitulo.titulo_es || String(capitulo.numero);
  const clave = capitulo ? String(capitulo.numero) : 'sin';
  const idLista = `capitulo-${i}`;
  const lista = el('ul', { class: 'lista-lecciones', id: idLista }, lecciones.map(tarjetaLeccion));

  const boton = el('button', { type: 'button', class: 'capitulo-boton', 'aria-controls': idLista },
    el('span', { class: 'capitulo-flecha', 'aria-hidden': 'true' }),
    el('span', { class: 'capitulo-titulo' }, titulo),
    el('span', { class: 'capitulo-contador' }, `${terminadas}/${validas.length}`));

  const seccion = el('section', { class: 'capitulo' },
    el('header', { class: 'capitulo-cabecera' },
      el('h2', {}, boton),
      capitulo?.titulo_da && el('p', { class: 'capitulo-da', lang: 'sv' }, capitulo.titulo_da),
      capitulo?.descripcion && el('p', { class: 'aprox' }, capitulo.descripcion),
      el('p', { class: 'capitulo-progreso' }, `${terminadas}/${validas.length} lecciones terminadas`)),
    lista);

  function aplicar(plegado) {
    seccion.classList.toggle('plegado', plegado);
    lista.hidden = plegado;
    boton.setAttribute('aria-expanded', String(!plegado));
  }

  boton.addEventListener('click', () => {
    const plegados = leerPlegados();
    const plegar = !plegados.has(clave);
    if (plegar) plegados.add(clave);
    else plegados.delete(clave);
    guardarPlegados(plegados);
    sonar('pagina');
    aplicar(plegar);
  });

  aplicar(leerPlegados().has(clave));
  return seccion;
}

function botonesPlegarTodo(grupos) {
  const todos = grupos.map(g => (g.capitulo ? String(g.capitulo.numero) : 'sin'));
  const accion = plegar => () => {
    guardarPlegados(new Set(plegar ? todos : []));
    sonar('pagina');
    window.dispatchEvent(new Event('hashchange'));
  };
  return el('div', { class: 'botonera plegar-todo' },
    el('button', { type: 'button', class: 'boton boton-mini', onclick: accion(true) }, '▸ Plegar todos'),
    el('button', { type: 'button', class: 'boton boton-mini', onclick: accion(false) }, '▾ Desplegar todos'));
}

export function pintarLecciones(app, { resultados, capitulos, errorCapitulos }) {
  const grupos = agrupar(resultados, capitulos);
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, 'Lecciones'),
      el('p', {}, 'Cada lección es como un capítulo de un libro: explicaciones, diálogos, vocabulario y ejercicios.')),
    errorCapitulos && tarjetaError(errorCapitulos, 'lessons/capitulos.json'),
    grupos.length > 1 && botonesPlegarTodo(grupos),
    grupos.length
      ? grupos.map(seccionCapitulo)
      : el('p', { class: 'caja' }, 'No se ha encontrado ninguna lección en la carpeta «lessons».'));

  const quien = nombre() ? `, ${nombre()}` : '';
  decir(hayProgreso()
    ? `¡Hej${quien}! Has vuelto. Sabía que no podrías resistirte a mis clases. ¿Seguimos?`
    : '¡Hej! Soy tu tutora de sueco. Bueno, la mejor tutora de sueco, pero no quiero presumir. Elige una lección y empezamos.');
}
