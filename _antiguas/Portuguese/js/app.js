// Arranque y navegación.
// Rutas: #/lecciones · #/leccion/<id> · #/practica · #/frases · #/cuaderno · #/repaso · #/perfil
//
// La app enseña PORTUGUÉS (europeo). El idioma de la interfaz (inglés o vietnamita)
// se cambia en Perfil: al cambiarlo se vuelve a pintar la pantalla actual,
// sin tocar la ruta ni el progreso.

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { cargarCurso, cargarFrases, conVersion } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste } from './ajustes.js';
import { sonar, prepararVoces } from './sonidos.js';
import { iniciarNube } from './sync.js';
import { tarjetas, alCambiar } from './progress.js';
import { tocaRepasar, esNueva } from './srs.js';
import { decir, prepararTutora } from './tutor.js';
import { t, cargarIdiomas } from './i18n.js';
import { pintarLecciones } from './vistas/lecciones.js';
import { pintarLeccion, cerrarFicha, ponerDiccionarioGlobal } from './vistas/leccion.js';
import { pintarFrases } from './vistas/frases.js';
import { pintarCuaderno } from './vistas/cuaderno.js';
import { pintarRepaso } from './vistas/repaso.js';
import { pintarPerfil } from './vistas/perfil.js';
import { pintarPractica } from './vistas/practica.js';

const app = document.getElementById('app');
const menu = document.getElementById('menu');

const SECCIONES = [
  { ruta: 'lecciones', texto: 'nav.lessons', icono: 'libro' },
  { ruta: 'practica', texto: 'nav.practice', icono: 'practica' },
  { ruta: 'frases', texto: 'nav.phrases', icono: 'frases' },
  { ruta: 'cuaderno', texto: 'nav.notebook', icono: 'cuaderno' },
  { ruta: 'repaso', texto: 'nav.review', icono: 'repaso' },
  { ruta: 'perfil', texto: 'nav.profile', icono: 'perfil' },
];

const contenido = { unidades: [], resultados: [], errorCurso: null, avisosCurso: [], frases: null };
let limpiarVista = null;

// ---------------------------------------------------------------------------
// Menú, tema e idioma
// ---------------------------------------------------------------------------

function pintarMenu() {
  poner(menu, el('ul', {}, SECCIONES.map(s => el('li', {},
    el('a', { href: `#/${s.ruta}`, 'data-ruta': s.ruta, class: 'menu-enlace' }, icono(s.icono), el('span', {}, t(s.texto)))))));
  menu.setAttribute('aria-label', t('nav.sections'));
}

/** Numerito rojo en «Repaso»: tarjetas que tocan hoy (pendientes + nuevas, como en la pantalla de repaso). */
function pintarAvisoRepaso() {
  const enlace = menu.querySelector('a[data-ruta="repaso"]');
  if (!enlace) return;
  const todas = tarjetas();
  const n = todas.filter(c => tocaRepasar(c.srs)).length + Math.min(20, todas.filter(c => esNueva(c.srs)).length);
  enlace.querySelector('.menu-aviso')?.remove();
  enlace.setAttribute('aria-label', n ? t('nav.reviewDue', { n }) : t('nav.review'));
  if (n) enlace.append(el('span', { class: 'menu-aviso', 'aria-hidden': 'true' }, n > 99 ? '99+' : String(n)));
}

function marcarMenu(ruta) {
  for (const a of menu.querySelectorAll('a')) {
    if (a.dataset.ruta === ruta) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

function pintarBotonTema() {
  const boton = document.getElementById('btn-tema');
  const oscuro = temaActual() === 'oscuro';
  boton.textContent = oscuro ? '☀' : '☾';
  boton.setAttribute('aria-label', t(oscuro ? 'header.toLight' : 'header.toDark'));
  boton.title = boton.getAttribute('aria-label');
}

function pintarBotonSonido() {
  const boton = document.getElementById('btn-sonido');
  const on = Boolean(ajuste('efectos'));
  boton.setAttribute('aria-pressed', String(on));
  boton.setAttribute('aria-label', t(on ? 'header.mute' : 'header.unmute'));
  boton.title = boton.getAttribute('aria-label');
}

document.getElementById('btn-tema').addEventListener('click', () => {
  cambiarAjuste('tema', temaActual() === 'oscuro' ? 'claro' : 'oscuro');
  sonar('clic');
});
document.getElementById('btn-sonido').addEventListener('click', () => {
  const on = !ajuste('efectos');
  cambiarAjuste('efectos', on);
  if (on) sonar('clic');
});

window.addEventListener('idioma-cambiado', () => {
  pintarMenu();
  pintarBotonTema();
  pintarBotonSonido();
  // Se repinta la pantalla actual en el nuevo idioma: misma ruta, mismo progreso.
  navegar({ desplazar: false });
});

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

alCambiar(pintarAvisoRepaso);
window.addEventListener('datos-sincronizados', pintarAvisoRepaso);
setInterval(pintarAvisoRepaso, 60 * 1000); // las tarjetas también vencen con el paso del tiempo

function titulo(texto) {
  document.title = `${texto} · ${t('app.name')}`;
}

function pintarNoEncontrada(texto) {
  poner(app, el('section', { class: 'caja' },
    el('h1', {}, t('notFound.title')),
    el('p', {}, texto),
    el('a', { class: 'boton', href: '#/lecciones' }, `◀ ${t('lesson.backToLessons')}`)));
  decir(t('tutor.notFound'), 'confundida');
}

/** Unidad, posición y siguiente lección de una lección (según lessons/curso.json). */
function contextoLeccion(id) {
  const unidad = contenido.unidades.find(u => u.lecciones.includes(id)) ?? null;
  const orden = contenido.unidades.flatMap(u => u.lecciones);
  const validas = new Set(contenido.resultados.filter(r => r.leccion).map(r => r.id));
  const siguiente = orden.slice(orden.indexOf(id) + 1).find(x => validas.has(x)) ?? null;
  return { unidad, numero: unidad ? unidad.lecciones.indexOf(id) + 1 : 1, siguiente };
}

async function navegar({ desplazar = true } = {}) {
  cerrarFicha();
  limpiarVista?.();
  limpiarVista = null;

  // Solo cuentan las rutas del tipo «#/algo»; cualquier otra cosa lleva a Lecciones.
  const hash = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
  const [ruta, parametro] = hash.split('/');
  const seccion = ruta || 'lecciones';
  marcarMenu(seccion === 'leccion' ? 'lecciones' : seccion);
  pintarAvisoRepaso();

  if (seccion === 'leccion') {
    const resultado = contenido.resultados.find(r => r.id === parametro);
    if (!resultado || resultado.error) {
      titulo(t('notFound.title'));
      pintarNoEncontrada(t('notFound.lesson', { id: parametro ?? '' }));
    } else {
      titulo(resultado.leccion.titulo);
      pintarLeccion(app, resultado, contextoLeccion(resultado.id));
    }
  } else if (seccion === 'lecciones') {
    titulo(t('nav.lessons'));
    if (contenido.sinConexion) avisoSinConexion();
    else pintarLecciones(app, contenido);
  } else if (seccion === 'practica') {
    titulo(t('nav.practice'));
    pintarPractica(app, contenido);
  } else if (seccion === 'frases') {
    titulo(t('nav.phrases'));
    contenido.frases ??= await cargarFrases();
    pintarFrases(app, contenido.frases);
  } else if (seccion === 'cuaderno') {
    titulo(t('nav.notebook'));
    pintarCuaderno(app);
  } else if (seccion === 'repaso') {
    titulo(t('nav.review'));
    limpiarVista = pintarRepaso(app);
  } else if (seccion === 'perfil') {
    titulo(t('nav.profile'));
    pintarPerfil(app, contenido);
  } else {
    titulo(t('notFound.title'));
    pintarNoEncontrada(t('notFound.address'));
  }

  if (desplazar) {
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
}

function avisoSinConexion() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, `⚠ ${t('errors.offlineTitle')}`),
    el('p', {}, t('errors.offlineText')),
    el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, `⟳ ${t('common.tryAgain')}`)));
  decir(t('tutor.offline'), 'confundida');
}

function avisoArchivoLocal() {
  // Sin servidor no se pueden leer ni los idiomas: el aviso va en los dos idiomas a la vez.
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, '⚠ Please open the app through the local server'),
    el('p', {}, 'You opened index.html directly, and the browser does not allow reading the lessons this way. Run ', el('code', {}, 'npm start'), ' or double-click ', el('code', {}, 'start-server.cmd'), '.'),
    el('h2', { lang: 'vi' }, '⚠ Hãy mở ứng dụng qua máy chủ cục bộ'),
    el('p', { lang: 'vi' }, 'Bạn đã mở trực tiếp index.html nên trình duyệt không cho đọc các bài học. Hãy chạy ', el('code', {}, 'npm start'), ' hoặc nhấp đúp vào ', el('code', {}, 'start-server.cmd'), '.')));
}

async function iniciar() {
  aplicarTema();

  if (location.protocol === 'file:') {
    avisoArchivoLocal();
    return;
  }

  try {
    await cargarIdiomas(conVersion);
  } catch (e) {
    console.error(e);
    poner(app, el('p', { class: 'caja tarjeta-error' }, '⚠ Could not load the interface languages (locales/en.json, locales/vi.json). / Không tải được ngôn ngữ giao diện.'));
    return;
  }

  // A partir de aquí ya hay textos: los botones de la cabecera se pueden rotular.
  window.addEventListener('tema-cambiado', pintarBotonTema);
  window.addEventListener('efectos-cambiado', pintarBotonSonido);
  pintarBotonTema();
  pintarBotonSonido();
  pintarMenu();
  prepararTutora();
  prepararVoces();

  const curso = await cargarCurso();
  Object.assign(contenido, {
    unidades: curso.unidades,
    resultados: curso.resultados,
    errorCurso: curso.error ?? null,
    avisosCurso: curso.avisosCurso ?? [],
    sinConexion: Boolean(curso.sinConexion),
  });
  ponerDiccionarioGlobal(curso.resultados);

  window.addEventListener('hashchange', () => navegar());
  // Cuando llegan datos de la nube, se repinta la pantalla (salvo en mitad de un repaso).
  window.addEventListener('datos-sincronizados', () => {
    if (!location.hash.startsWith('#/repaso')) navegar({ desplazar: false });
  });
  // Un clic en cualquier enlace del menú hace un pequeño sonido.
  menu.addEventListener('click', e => { if (e.target.closest('a')) sonar('pagina'); });

  await navegar();
  iniciarNube();
}

iniciar();
