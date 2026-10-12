// Arranque y navegación.
// Rutas: #/lecciones · #/leccion/001 · #/practica · #/frases · #/cuaderno · #/repaso · #/perfil

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { descubrirLecciones, cargarCapitulos, cargarFrases } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste } from './ajustes.js';
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
  { ruta: 'lecciones', texto: 'Lecciones', icono: 'libro' },
  { ruta: 'practica', texto: 'Práctica', icono: 'practica' },
  { ruta: 'frases', texto: 'Frases', icono: 'frases' },
  { ruta: 'cuaderno', texto: 'Cuaderno', icono: 'cuaderno' },
  { ruta: 'repaso', texto: 'Repaso', icono: 'repaso' },
  { ruta: 'perfil', texto: 'Perfil', icono: 'perfil' },
];

const contenido = { resultados: [], capitulos: [], errorCapitulos: null, frases: null };
let limpiarVista = null;

// ---------------------------------------------------------------------------
// Menú y tema
// ---------------------------------------------------------------------------

function pintarMenu() {
  poner(menu, el('ul', {}, SECCIONES.map(s => el('li', {},
    el('a', { href: `#/${s.ruta}`, 'data-ruta': s.ruta, class: 'menu-enlace' }, icono(s.icono), el('span', {}, s.texto))))));
}

/** Numerito rojo en «Repaso»: tarjetas que tocan hoy (pendientes + nuevas, como en la pantalla de repaso). */
function pintarAvisoRepaso() {
  const enlace = menu.querySelector('a[data-ruta="repaso"]');
  if (!enlace) return;
  const todas = tarjetas();
  const n = todas.filter(t => tocaRepasar(t.srs)).length + Math.min(20, todas.filter(t => esNueva(t.srs)).length);
  enlace.querySelector('.menu-aviso')?.remove();
  enlace.setAttribute('aria-label', n ? `Repaso: ${n} pendientes hoy` : 'Repaso');
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
  boton.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  boton.title = boton.getAttribute('aria-label');
}

function pintarBotonSonido() {
  const boton = document.getElementById('btn-sonido');
  const on = Boolean(ajuste('efectos'));
  boton.setAttribute('aria-pressed', String(on));
  boton.setAttribute('aria-label', on ? 'Silenciar sonidos' : 'Activar sonidos');
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
window.addEventListener('tema-cambiado', pintarBotonTema);
window.addEventListener('efectos-cambiado', pintarBotonSonido);

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

alCambiar(pintarAvisoRepaso);
window.addEventListener('datos-sincronizados', pintarAvisoRepaso);
setInterval(pintarAvisoRepaso, 60 * 1000); // las tarjetas también vencen con el paso del tiempo

function pintarNoEncontrada(texto) {
  poner(app, el('section', { class: 'caja' },
    el('h1', {}, 'Página no encontrada'),
    el('p', {}, texto),
    el('a', { class: 'boton', href: '#/lecciones' }, '◀ Volver a las lecciones')));
  decir('Mmm… eso no lo encuentro. ¿Seguro que existe?', 'confundida');
}

async function navegar() {
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
    const i = contenido.resultados.findIndex(r => r.id === parametro);
    const resultado = contenido.resultados[i];
    if (!resultado || resultado.error) {
      pintarNoEncontrada(`No se puede abrir la lección ${parametro}.`);
    } else {
      const siguiente = contenido.resultados.slice(i + 1).find(r => !r.error)?.id ?? null;
      document.title = `${resultado.leccion.titulo_da} · Polski`;
      pintarLeccion(app, resultado, siguiente);
    }
  } else if (seccion === 'lecciones') {
    document.title = 'Lecciones · Polski';
    if (contenido.sinConexion) avisoSinConexion();
    else pintarLecciones(app, contenido);
  } else if (seccion === 'practica') {
    document.title = 'Práctica · Polski';
    pintarPractica(app, contenido);
  } else if (seccion === 'frases') {
    document.title = 'Frases · Polski';
    contenido.frases ??= await cargarFrases();
    pintarFrases(app, contenido.frases);
  } else if (seccion === 'cuaderno') {
    document.title = 'Cuaderno · Polski';
    pintarCuaderno(app);
  } else if (seccion === 'repaso') {
    document.title = 'Repaso · Polski';
    limpiarVista = pintarRepaso(app);
  } else if (seccion === 'perfil') {
    document.title = 'Perfil · Polski';
    pintarPerfil(app, contenido);
  } else {
    pintarNoEncontrada('Esta dirección no existe.');
  }

  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

function avisoSinConexion() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, '⚠ No se han podido cargar las lecciones'),
    el('p', {}, 'Parece que no hay conexión a internet (o el servidor local está apagado).'),
    el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, '⟳ Volver a intentarlo')));
  decir('No consigo llegar a las lecciones. Revisa la conexión y vuelve a intentarlo.', 'confundida');
}

function avisoArchivoLocal() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, '⚠ Abre la web con el servidor local'),
    el('p', {}, 'Has abierto index.html directamente y el navegador no deja leer las lecciones así.'),
    el('p', {}, 'En Windows: haz doble clic en ', el('code', {}, 'start-server.cmd'), ' (está en la carpeta principal del proyecto).')));
  decir('Así no puedo leer las lecciones. Haz doble clic en «start-server.cmd» y nos vemos ahí.', 'apurada');
}

async function iniciar() {
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

  window.addEventListener('hashchange', navegar);
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
