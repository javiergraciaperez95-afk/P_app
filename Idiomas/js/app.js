// Arranque y navegación.
// Rutas: #/lecciones · #/leccion/001 · #/practica · #/frases · #/cuaderno · #/repaso · #/perfil · #/idiomas · #/creditos
// Sin curso elegido solo existen la pantalla de elegir idioma y los créditos.

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { descubrirLecciones, cargarCapitulos, cargarFrases } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste } from './ajustes.js';
import { t, tr, aplicarIdioma, IDIOMAS, idioma, cambiarIdioma } from './i18n.js';
import { sonar, prepararVoces, precargarAudios } from './sonidos.js';
import { iniciarNube } from './sync.js';
import { tarjetas, alCambiar } from './progress.js';
import { tocaRepasar, esNueva } from './srs.js';
import { decir } from './tutor.js';
import { pintarLecciones } from './vistas/lecciones.js';
import { pintarLeccion, cerrarFicha, ponerDiccionarioGlobal } from './vistas/leccion.js';
import { pintarFrases } from './vistas/frases.js';
import { pintarCuaderno } from './vistas/cuaderno.js';
import { pintarRepaso } from './vistas/repaso.js';
import { pintarPerfil } from './vistas/perfil.js';
import { pintarPractica } from './vistas/practica.js';
import { pintarElegirCurso, pintarCreditos } from './vistas/cursos.js';
import { curso, hayCurso } from './curso.js';
import './movil.js';

const app = document.getElementById('app');
const menu = document.getElementById('menu');

const SECCIONES = [
  { ruta: 'lecciones', icono: 'libro' },
  { ruta: 'practica', icono: 'practica' },
  { ruta: 'frases', icono: 'frases' },
  { ruta: 'cuaderno', icono: 'cuaderno' },
  { ruta: 'repaso', icono: 'repaso' },
  { ruta: 'perfil', icono: 'perfil' },
];

const contenido = { resultados: [], capitulos: [], errorCapitulos: null, frases: null };
let limpiarVista = null;
let rutaActual = 'lecciones';

// ---------------------------------------------------------------------------
// Menú, idioma y tema
// ---------------------------------------------------------------------------

function pintarMenu() {
  poner(menu, el('ul', {}, SECCIONES.map(s => el('li', {},
    el('a', { href: `#/${s.ruta}`, 'data-ruta': s.ruta, class: 'menu-enlace' }, icono(s.icono), el('span', {}, t(`menu.${s.ruta}`)))))));
  marcarMenu(rutaActual);
  pintarAvisoRepaso();
}

/** Numerito rojo en «Repaso»: tarjetas que tocan hoy (pendientes + nuevas, como en la pantalla de repaso). */
function pintarAvisoRepaso() {
  const enlace = menu.querySelector('a[data-ruta="repaso"]');
  if (!enlace) return;
  const todas = tarjetas();
  const n = todas.filter(c => tocaRepasar(c.srs)).length + Math.min(20, todas.filter(c => esNueva(c.srs)).length);
  enlace.querySelector('.menu-aviso')?.remove();
  enlace.setAttribute('aria-label', n ? t('menu.repasoPendientes', { n }) : t('menu.repaso'));
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
  boton.setAttribute('aria-label', t(oscuro ? 'tema.aDiurno' : 'tema.aOscuro'));
  boton.title = boton.getAttribute('aria-label');
}

function pintarBotonSonido() {
  const boton = document.getElementById('btn-sonido');
  const on = Boolean(ajuste('efectos'));
  boton.setAttribute('aria-pressed', String(on));
  boton.setAttribute('aria-label', t(on ? 'sonido.silenciar' : 'sonido.activar'));
  boton.title = boton.getAttribute('aria-label');
}

// La marca de la cabecera: el nombre del idioma que se estudia y su bandera.
function pintarMarca() {
  const nombre = document.getElementById('marca-nombre');
  nombre.textContent = hayCurso ? curso.nativo : t('app.nombre');
  if (hayCurso) nombre.lang = curso.lang;
  document.getElementById('marca-bandera').innerHTML = hayCurso ? curso.bandera : ''; // dibujo fijo de js/cursos.js
  document.getElementById('marca-subtitulo').textContent = hayCurso ? t('html.subtitulo') : '';
  const boton = document.getElementById('btn-curso');
  boton.setAttribute('aria-label', t('cursos.cambiar'));
  boton.title = t('cursos.cambiar');
  boton.hidden = !hayCurso;
}

// Selector de idioma de la cabecera (lo que no esté traducido sale en inglés).
const selectorIdioma = document.getElementById('sel-idioma');
poner(selectorIdioma, IDIOMAS.map(i => el('option', { value: i.clave, lang: i.clave }, i.nombre)));
selectorIdioma.value = idioma();
selectorIdioma.addEventListener('change', () => {
  sonar('clic');
  cambiarIdioma(selectorIdioma.value);
});

document.getElementById('btn-tema').addEventListener('click', () => {
  cambiarAjuste('tema', temaActual() === 'oscuro' ? 'claro' : 'oscuro');
  sonar('clic');
});
document.getElementById('btn-sonido').addEventListener('click', () => {
  const on = !ajuste('efectos');
  cambiarAjuste('efectos', on);
  if (on) sonar('clic');
});
window.addEventListener('tema-cambiado', pintarBotonTema);
window.addEventListener('efectos-cambiado', pintarBotonSonido);

// Al cambiar de idioma se repinta todo: cabecera, menú y la pantalla abierta.
window.addEventListener('idioma-cambiado', () => {
  selectorIdioma.value = idioma();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();
  if (!hayCurso) { pintarSinCurso(); return; }
  pintarMenu();
  navegar({ cambioDeIdioma: true });
});

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

alCambiar(pintarAvisoRepaso);
window.addEventListener('datos-sincronizados', pintarAvisoRepaso);
setInterval(pintarAvisoRepaso, 60 * 1000); // las tarjetas también vencen con el paso del tiempo

function pintarNoEncontrada(texto) {
  poner(app, el('section', { class: 'caja' },
    el('h1', {}, t('app.noEncontradaTitulo')),
    el('p', {}, texto),
    el('a', { class: 'boton', href: '#/lecciones' }, t('comun.volverLecciones'))));
  decir(t('app.noEncontradaTutora'), 'confundida');
}

function titulo(texto) {
  document.title = `${texto} · ${hayCurso ? curso.nativo : t('app.nombre')}`;
}

async function navegar({ cambioDeIdioma = false } = {}) {
  cerrarFicha();
  limpiarVista?.();
  limpiarVista = null;

  // Solo cuentan las rutas del tipo «#/algo»; cualquier otra cosa lleva a Lecciones.
  const hash = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
  const [ruta, parametro] = hash.split('/');
  const seccion = ruta || 'lecciones';
  rutaActual = seccion === 'leccion' ? 'lecciones' : seccion;
  document.body.classList.toggle('sin-tutora', seccion === 'idiomas' || seccion === 'creditos');
  marcarMenu(rutaActual);
  pintarAvisoRepaso();

  if (seccion === 'leccion') {
    const i = contenido.resultados.findIndex(r => r.id === parametro);
    const resultado = contenido.resultados[i];
    if (!resultado || resultado.error) {
      pintarNoEncontrada(t('app.leccionNoAbre', { id: parametro }));
    } else {
      const siguiente = contenido.resultados.slice(i + 1).find(r => !r.error)?.id ?? null;
      titulo(resultado.leccion.titulo_es || tr(resultado.leccion.titulo));
      limpiarVista = pintarLeccion(app, resultado, siguiente);
      // Si los audios están en línea, se bajan ya los de esta lección y las dos siguientes.
      precargarAudios(contenido.resultados.slice(i, i + 3).map(r => r.leccion).filter(Boolean));
    }
  } else if (seccion === 'lecciones') {
    titulo(t('menu.lecciones'));
    if (contenido.sinConexion) avisoSinConexion();
    else pintarLecciones(app, contenido);
  } else if (seccion === 'practica') {
    titulo(t('menu.practica'));
    pintarPractica(app, contenido);
  } else if (seccion === 'frases') {
    titulo(t('menu.frases'));
    contenido.frases ??= await cargarFrases();
    pintarFrases(app, contenido.frases);
  } else if (seccion === 'cuaderno') {
    titulo(t('menu.cuaderno'));
    pintarCuaderno(app);
  } else if (seccion === 'repaso') {
    titulo(t('menu.repaso'));
    limpiarVista = pintarRepaso(app);
  } else if (seccion === 'perfil') {
    titulo(t('menu.perfil'));
    pintarPerfil(app, contenido);
  } else if (seccion === 'idiomas') {
    titulo(t('cursos.titulo'));
    pintarElegirCurso(app);
  } else if (seccion === 'creditos') {
    titulo(t('creditos.titulo'));
    pintarCreditos(app);
  } else {
    pintarNoEncontrada(t('app.noExiste'));
  }

  // Al cambiar de idioma no se mueve la página ni el foco: solo cambian los textos.
  if (!cambioDeIdioma) {
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
}

function avisoSinConexion() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, t('app.sinConexionTitulo')),
    el('p', {}, t('app.sinConexionTexto')),
    el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))));
  decir(t('app.sinConexionTutora'), 'confundida');
}

function avisoArchivoLocal() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, t('app.archivoLocalTitulo')),
    el('p', {}, t('app.archivoLocalTexto')),
    el('p', {}, t('app.archivoLocalWindows'), ' ', el('code', {}, 'start-server.cmd'))));
  decir(t('app.archivoLocalTutora'), 'apurada');
}

/** Sin curso elegido: la pantalla de elegir idioma, o los créditos. */
function pintarSinCurso() {
  const creditos = location.hash === '#/creditos';
  titulo(t(creditos ? 'creditos.titulo' : 'cursos.titulo'));
  if (creditos) pintarCreditos(app);
  else pintarElegirCurso(app);
  window.scrollTo(0, 0);
}

/**
 * Cada vez que se abre la app se empieza por «Elige el idioma», con el curso de la última vez marcado.
 * Solo al abrirla: no al recargar, ni al elegir curso, ni si se entra por un enlace a una pantalla concreta.
 */
function empezarPorElegirIdioma() {
  try {
    if (sessionStorage.getItem('idiomas-abierta')) return;
    sessionStorage.setItem('idiomas-abierta', '1');
  } catch {
    return; // sin almacenamiento no se sabe si es la primera pantalla: se va a las lecciones
  }
  if (location.hash === '' || location.hash === '#/') history.replaceState(null, '', '#/idiomas');
}

async function iniciar() {
  aplicarIdioma();
  aplicarTema();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();

  if (!hayCurso) {
    try { sessionStorage.setItem('idiomas-abierta', '1'); } catch { /* sin almacenamiento */ }
    document.body.classList.add('sin-curso', 'sin-tutora');
    window.addEventListener('hashchange', pintarSinCurso);
    pintarSinCurso();
    return;
  }

  empezarPorElegirIdioma();
  pintarMenu();
  prepararVoces();

  if (location.protocol === 'file:') {
    avisoArchivoLocal();
    return;
  }

  const [resultados, { capitulos, error }] = await Promise.all([descubrirLecciones(), cargarCapitulos()]);
  Object.assign(contenido, { resultados, capitulos, errorCapitulos: error ?? null, sinConexion: Boolean(resultados.sinConexion) });
  ponerDiccionarioGlobal(resultados);

  window.addEventListener('hashchange', () => navegar());
  // Cuando llegan datos de la nube, se repinta la pantalla (salvo en mitad de un repaso).
  window.addEventListener('datos-sincronizados', () => {
    if (!location.hash.startsWith('#/repaso')) navegar();
  });
  // Un clic en cualquier enlace del menú hace un pequeño sonido.
  menu.addEventListener('click', e => { if (e.target.closest('a')) sonar('pagina'); });

  await navegar();
  iniciarNube();
}

iniciar();
