// Arranque y navegación.
// Rutas: #/inicio · #/lecciones · #/leccion/001 · #/practica · #/frases · #/cuaderno · #/repaso · #/perfil · #/idiomas · #/creditos · #/legal · #/sobre · #/entrar · #/precios · #/bienvenida
// Sin curso elegido solo existen la pantalla de inicio, la de elegir idioma, los créditos, el aviso legal y «Sobre Paglot».

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { descubrirLecciones, cargarCapitulos, cargarFrases } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste } from './ajustes.js';
import { t, tr, aplicarIdioma, IDIOMAS, idioma, cambiarIdioma } from './i18n.js';
import { sonar, prepararVoces } from './sonidos.js';
import { iniciarNube, usuarioActual, alCambiarNube } from './sync.js';
import { tarjetas, alCambiar, hayProgreso } from './progress.js';
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
import { pintarInicio } from './vistas/inicio.js';
import { pintarLegal, pintarAvisoDeDatos } from './vistas/legal.js';
import { pintarSobre } from './vistas/sobre.js';
import { pintarEntrar } from './vistas/entrar.js';
import { pintarPrecios } from './vistas/precios.js';
import { pintarBienvenida, bienvenidaVista } from './vistas/bienvenida.js';
import { pintarPerdida } from './vistas/perdida.js';
import { curso, hayCurso, nombreDelCurso } from './curso.js';
import './movil.js';
import './chispa.js';

const app = document.getElementById('app');
const menu = document.getElementById('menu');
const controlesCabecera = document.querySelector('.cabecera-botones');
const ajustesCabecera = document.createElement('details');
ajustesCabecera.className = 'cabecera-ajustes';
const abrirAjustes = document.createElement('summary');
const panelAjustes = document.createElement('div');
panelAjustes.className = 'cabecera-ajustes-panel';
ajustesCabecera.append(abrirAjustes, panelAjustes);
const controlesAjustes = ['.idioma-menu', '#btn-sonido', '#btn-tema'].map(s => controlesCabecera.querySelector(s));
document.addEventListener('click', e => {
  if (!ajustesCabecera.contains(e.target)) ajustesCabecera.open = false;
});
ajustesCabecera.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cerrarIdiomas();
    ajustesCabecera.open = false;
    abrirAjustes.focus();
  }
});
ajustesCabecera.addEventListener('toggle', () => {
  if (!ajustesCabecera.open) cerrarIdiomas();
});

const SECCIONES = [
  { ruta: 'lecciones', icono: 'libro' },
  { ruta: 'practica', icono: 'practica' },
  { ruta: 'frases', icono: 'frases' },
  { ruta: 'cuaderno', icono: 'cuaderno' },
  { ruta: 'repaso', icono: 'repaso' },
  { ruta: 'perfil', icono: 'perfil' },
];

// Las pantallas generales de la app (no de un curso): llevan la marca de la app y no tienen menú de curso ni tutora.
const PORTADAS = ['inicio', 'sobre', 'entrar', 'precios'];

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

// La marca siempre es Paglot; dentro de un curso el idioma aparece debajo.
// Siempre lleva al inicio.
function pintarMarca() {
  const dentro = !document.body.classList.contains('en-inicio');
  document.body.classList.toggle('en-estudio', dentro);
  ajustesCabecera.open = false;
  abrirAjustes.textContent = `⚙ ${t('ajustes.titulo')}`;
  if (dentro) {
    controlesCabecera.append(ajustesCabecera);
    panelAjustes.append(...controlesAjustes);
  } else {
    controlesCabecera.append(...controlesAjustes);
    ajustesCabecera.remove();
  }
  const deCurso = hayCurso && !document.body.classList.contains('en-inicio');
  const nombre = document.getElementById('marca-nombre');
  nombre.textContent = t('app.nombre');
  nombre.removeAttribute('lang');
  document.getElementById('marca-bandera').innerHTML = deCurso ? curso.bandera : ''; // SVG del catálogo local de cursos.
  const subtitulo = document.getElementById('marca-subtitulo');
  subtitulo.textContent = deCurso ? nombreDelCurso(idioma()) : '';
  subtitulo.parentElement.hidden = !deCurso;
  document.getElementById('marca').title = t('inicio.titulo');
  pintarNavegacion();
  const boton = document.getElementById('btn-curso');
  boton.setAttribute('aria-label', t('cursos.cambiar'));
  boton.title = t('cursos.cambiar');
  boton.hidden = !hayCurso;
}

/** Los enlaces de la cabecera (Inicio · Entrar · Sobre Paglot): marca el de la pantalla abierta. */
function pintarNavegacion() {
  const aqui = location.hash.slice(2).split('/')[0] || (hayCurso ? 'lecciones' : 'inicio');
  for (const a of document.querySelectorAll('#cabecera-nav a')) {
    if (a.dataset.nav === aqui) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  // Con la sesión iniciada, «Entrar» pasa a llamarse «Cuenta».
  document.getElementById('nav-entrar').textContent = t(usuarioActual() ? 'cuenta.titulo' : 'entrar.titulo');
}
alCambiarNube(pintarNavegacion);

// Selector de idioma de la cabecera (lo que no esté traducido sale en inglés).
// Es un botón que despliega una lista propia (la del navegador no se puede vestir como el resto de la app).
const selectorIdioma = document.getElementById('sel-idioma');
const listaIdiomas = document.getElementById('lista-idiomas');

function pintarSelectorIdioma() {
  const actual = IDIOMAS.find(i => i.clave === idioma());
  poner(selectorIdioma, el('span', { lang: actual.clave }, actual.nombre), el('span', { class: 'sel-idioma-flecha', 'aria-hidden': 'true' }, '▾'));
  poner(listaIdiomas, IDIOMAS.map(i => el('button', {
    type: 'button', class: 'idioma-opcion', role: 'menuitemradio', lang: i.clave, 'aria-checked': String(i.clave === actual.clave),
    onclick: () => { sonar('clic'); cerrarIdiomas(); cambiarIdioma(i.clave); },
  }, el('span', { class: 'idioma-marca', 'aria-hidden': 'true' }, i.clave === actual.clave ? '✔' : ''), i.nombre)));
}

function abrirIdiomas() {
  listaIdiomas.hidden = false;
  selectorIdioma.setAttribute('aria-expanded', 'true');
  (listaIdiomas.querySelector('[aria-checked="true"]') ?? listaIdiomas.firstElementChild)?.focus();
}

function cerrarIdiomas({ foco = false } = {}) {
  if (listaIdiomas.hidden) return;
  listaIdiomas.hidden = true;
  selectorIdioma.setAttribute('aria-expanded', 'false');
  if (foco) selectorIdioma.focus();
}

pintarSelectorIdioma();
selectorIdioma.addEventListener('click', () => {
  sonar(listaIdiomas.hidden ? 'abrir' : 'cerrar');
  if (listaIdiomas.hidden) abrirIdiomas();
  else cerrarIdiomas();
});
// Se cierra al tocar fuera o con Escape; las flechas mueven por la lista.
document.addEventListener('click', e => { if (!e.target.closest('.idioma-menu')) cerrarIdiomas(); });
listaIdiomas.addEventListener('keydown', e => {
  const opciones = [...listaIdiomas.children];
  const i = opciones.indexOf(document.activeElement);
  if (e.key === 'Escape') cerrarIdiomas({ foco: true });
  else if (e.key === 'ArrowDown') opciones[(i + 1) % opciones.length].focus();
  else if (e.key === 'ArrowUp') opciones[(i - 1 + opciones.length) % opciones.length].focus();
  else if (e.key === 'Tab') cerrarIdiomas();
  else return;
  if (e.key !== 'Tab') e.preventDefault();
});

document.getElementById('btn-tema').addEventListener('click', () => {
  cambiarAjuste('tema', temaActual() === 'oscuro' ? 'claro' : 'oscuro');
  sonar('interruptor');
});
document.getElementById('btn-sonido').addEventListener('click', () => {
  const on = !ajuste('efectos');
  cambiarAjuste('efectos', on);
  if (on) sonar('interruptor');
});
window.addEventListener('tema-cambiado', pintarBotonTema);
window.addEventListener('efectos-cambiado', pintarBotonSonido);

// Al cambiar de idioma se repinta todo: cabecera, menú y la pantalla abierta.
window.addEventListener('idioma-cambiado', () => {
  pintarSelectorIdioma();
  pintarAvisoDeDatos();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();
  if (!hayCurso) { pintarSinCurso({ cambioDeIdioma: true }); return; }
  pintarMenu();
  navegar({ cambioDeIdioma: true });
});

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

alCambiar(pintarAvisoRepaso);
window.addEventListener('datos-sincronizados', pintarAvisoRepaso);
setInterval(pintarAvisoRepaso, 60 * 1000); // las tarjetas también vencen con el paso del tiempo

/** Una dirección que no existe o una lección que no se abre: la página perdida, con su propia tutora. */
function pintarNoEncontrada(texto) {
  titulo(t('perdida.titulo'));
  document.body.classList.add('sin-tutora', 'en-inicio'); // como una pantalla general: sin el menú del curso
  pintarMarca();
  limpiarVista = pintarPerdida(app, texto);
}

function titulo(texto) {
  document.title = [texto, hayCurso && curso.nativo, t('app.nombre')].filter(Boolean).join(' · ');
}

// Las lecciones del curso se cargan aparte, una sola vez: las pantallas generales (inicio, entrar, sobre…)
// no las necesitan y se pintan al momento, sin esperar.
let cargaDelCurso = null;
let cursoCargado = false;
function cargarCurso() {
  cargaDelCurso ??= (async () => {
    // Se espera a saber si el dispositivo tiene voz (segundo y medio como mucho): de eso depende qué ejercicios hay.
    const [resultados, { capitulos, error }] = await Promise.all([descubrirLecciones(), cargarCapitulos(), prepararVoces()]);
    Object.assign(contenido, { resultados, capitulos, errorCapitulos: error ?? null, sinConexion: Boolean(resultados.sinConexion) });
    ponerDiccionarioGlobal(resultados);
    cursoCargado = true;
  })();
  return cargaDelCurso;
}

/** Las pantallas que no dependen ni de la voz ni del progreso: repintarlas a media visita las reiniciaría (la bienvenida, los precios…). */
function enPantallaGeneral() {
  return [...PORTADAS, 'idiomas', 'creditos', 'legal', 'bienvenida'].includes(location.hash.slice(2).split('/')[0]);
}

let pase = 0; // para descartar una navegación si, mientras esperaba, se ha pedido otra
let bienvenidaOfrecida = false; // la bienvenida se ofrece sola una vez por sesión (y nunca más cuando se ha visto)

async function navegar({ cambioDeIdioma = false } = {}) {
  const estePase = ++pase;
  cerrarFicha();
  limpiarVista?.();
  limpiarVista = null;

  // Solo cuentan las rutas del tipo «#/algo»; cualquier otra cosa lleva a Lecciones.
  const hash = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
  const [ruta, parametro] = hash.split('/');
  let seccion = ruta || 'lecciones';
  // La primera vez que alguien sin progreso llega a sus lecciones, antes pasa por la bienvenida.
  if (seccion === 'lecciones' && !bienvenidaOfrecida && !bienvenidaVista() && !hayProgreso()) {
    history.replaceState(null, '', '#/bienvenida');
    seccion = 'bienvenida';
  }
  if (seccion === 'bienvenida') bienvenidaOfrecida = true;
  document.body.classList.toggle('en-bienvenida', seccion === 'bienvenida');
  rutaActual = seccion === 'leccion' ? 'lecciones' : seccion;
  document.body.classList.toggle('en-inicio', PORTADAS.includes(seccion));
  document.body.classList.toggle('sin-tutora', [...PORTADAS, 'idiomas', 'creditos', 'legal', 'bienvenida'].includes(seccion));
  pintarMarca();
  marcarMenu(rutaActual);
  pintarAvisoRepaso();

  // Las pantallas del curso necesitan sus lecciones: si aún están llegando, se espera con el logotipo.
  if (!cursoCargado && ![...PORTADAS, 'idiomas', 'creditos', 'legal'].includes(seccion)) {
    poner(app, el('div', { class: 'arranque' }, el('img', { class: 'arranque-logo', src: 'assets/logo.svg', alt: t('html.cargando'), width: 128, height: 128 })));
    await cargarCurso();
    if (estePase !== pase) return;
  }

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
  } else if (seccion === 'inicio') {
    document.title = t('app.nombre');
    limpiarVista = pintarInicio(app);
  } else if (seccion === 'idiomas') {
    titulo(t('cursos.titulo'));
    pintarElegirCurso(app);
  } else if (seccion === 'creditos') {
    titulo(t('creditos.titulo'));
    pintarCreditos(app);
  } else if (seccion === 'legal') {
    titulo(t('legal.titulo'));
    pintarLegal(app);
  } else if (seccion === 'sobre') {
    document.title = t('sobre.titulo');
    limpiarVista = pintarSobre(app);
  } else if (seccion === 'entrar') {
    titulo(t('entrar.titulo'));
    limpiarVista = pintarEntrar(app);
  } else if (seccion === 'precios') {
    titulo(t('precios.titulo'));
    limpiarVista = pintarPrecios(app);
  } else if (seccion === 'bienvenida') {
    titulo(t('bienvenida.titulo'));
    limpiarVista = pintarBienvenida(app, contenido);
  } else {
    pintarNoEncontrada('');
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

/** Sin curso elegido: la pantalla de inicio, la de elegir idioma o los créditos. */
function pintarSinCurso({ cambioDeIdioma = false } = {}) {
  limpiarVista?.();
  limpiarVista = null;
  const vista = { '#/creditos': 'creditos', '#/idiomas': 'idiomas', '#/legal': 'legal', '#/sobre': 'sobre', '#/entrar': 'entrar', '#/precios': 'precios', '#/inicio': 'inicio' }[location.hash]
    // Lo que no es una ruta («#/algo») no es una página perdida: son, por ejemplo, los datos que traen los enlaces de los correos.
    ?? (location.hash.length > 2 && location.hash.startsWith('#/') ? 'perdida' : 'inicio');
  document.body.classList.toggle('en-inicio', PORTADAS.includes(vista));
  pintarMarca();
  if (vista === 'creditos') {
    titulo(t('creditos.titulo'));
    pintarCreditos(app);
  } else if (vista === 'legal') {
    titulo(t('legal.titulo'));
    pintarLegal(app);
  } else if (vista === 'sobre') {
    document.title = t('sobre.titulo');
    limpiarVista = pintarSobre(app);
  } else if (vista === 'entrar') {
    titulo(t('entrar.titulo'));
    limpiarVista = pintarEntrar(app);
  } else if (vista === 'precios') {
    titulo(t('precios.titulo'));
    limpiarVista = pintarPrecios(app);
  } else if (vista === 'idiomas') {
    titulo(t('cursos.titulo'));
    pintarElegirCurso(app);
  } else if (vista === 'perdida') {
    titulo(t('perdida.titulo'));
    limpiarVista = pintarPerdida(app);
  } else {
    document.title = t('app.nombre');
    limpiarVista = pintarInicio(app);
  }
  if (!cambioDeIdioma) window.scrollTo(0, 0);
}

/**
 * Cada vez que se abre la app se empieza por la pantalla de inicio, con el botón para seguir con el curso de la última vez.
 * Solo al abrirla: no al recargar, ni al elegir curso, ni si se entra por un enlace a una pantalla concreta.
 */
function empezarPorInicio() {
  try {
    if (sessionStorage.getItem('idiomas-abierta')) return;
    sessionStorage.setItem('idiomas-abierta', '1');
  } catch {
    return; // sin almacenamiento no se sabe si es la primera pantalla: se va a las lecciones
  }
  if (location.hash === '' || location.hash === '#/') history.replaceState(null, '', '#/inicio');
}

/** Quita la pantalla de arranque (el logotipo que se ve mientras carga la app). */
function quitarArranque() {
  document.body.classList.remove('arrancando');
  pintarAvisoDeDatos();
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
    window.addEventListener('hashchange', () => pintarSinCurso());
    pintarSinCurso();
    quitarArranque();
    iniciarNube(); // para saber si ya hay una sesión iniciada
    return;
  }

  empezarPorInicio();
  pintarMenu();

  if (location.protocol === 'file:') {
    avisoArchivoLocal();
    quitarArranque();
    return;
  }

  window.addEventListener('hashchange', () => navegar());
  // Cuando llegan datos de la nube, se repinta la pantalla (salvo en mitad de un repaso).
  window.addEventListener('datos-sincronizados', () => {
    if (!location.hash.startsWith('#/repaso') && !enPantallaGeneral()) navegar();
  });
  // Si la voz aparece o desaparece (se instala una, se va la conexión), se repinta la pantalla en el mismo sitio:
  // cambian los ejercicios de oído. En un repaso o en un juego no se interrumpe.
  window.addEventListener('voz-cambiada', () => {
    if (location.hash.startsWith('#/repaso') || document.querySelector('.juego') || enPantallaGeneral()) return;
    const y = window.scrollY;
    navegar().then(() => window.scrollTo(0, y));
  });
  // Un clic en cualquier enlace del menú hace un pequeño sonido.
  menu.addEventListener('click', e => { if (e.target.closest('a')) sonar('pagina'); });

  // La primera pantalla se pinta ya; las lecciones del curso se van cargando mientras tanto.
  const primera = navegar();
  if (document.body.classList.contains('en-inicio')) quitarArranque();
  cargarCurso();
  await primera;
  quitarArranque();
  iniciarNube();
}

iniciar();
