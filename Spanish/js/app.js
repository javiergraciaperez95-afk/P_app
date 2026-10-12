// Arranque y navegación.
// Rutas: #/lecciones · #/leccion/001 · #/practica · #/frases · #/cuaderno · #/repaso · #/perfil

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { descubrirLecciones, cargarCapitulos, cargarFrases } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste } from './ajustes.js';
import { t, tr, aplicarIdioma, IDIOMAS, idioma, cambiarIdioma } from './i18n.js';
import { sonar, prepararVoces } from './sonidos.js';
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
  pintarBotonTema();
  pintarBotonSonido();
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
  document.title = `${texto} · Español`;
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

async function iniciar() {
  aplicarIdioma();
  aplicarTema();
  pintarBotonTema();
  pintarBotonSonido();
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
