// Arranque y navegación de Phuong App.
// Al abrir la app se pide el código de la cuenta (vistas/codigo.js); después:
//   #/inicio · #/lecciones · #/leccion/001 · #/ccse[/…] · #/dele[/…] · #/repaso · #/cuaderno · #/frases · #/reto ·
//   #/practica · #/prueba · #/perfil

import './suave.js'; // lo primero: en el móvil, todo se mueve suave
import './teclado.js'; // y al escribir, el teclado del móvil no descompone la pantalla
import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { descubrirLecciones, cargarIndice, cargarDiccionario, cargarLeccion, cargarCapitulos, cargarFrases } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste, aplicarComodidad, modoCalma } from './ajustes.js';
import { t, tr, aplicarIdioma, IDIOMAS, idioma, cambiarIdioma } from './i18n.js';
import { sonar, prepararVoces, callar } from './sonidos.js';
import { alCambiar, datosDanados } from './progress.js';
import { pintarCabecera, pendientesDeHoy } from './cabecera.js';
import { decir } from './tutor.js';
import { agrupar, pintarLecciones } from './vistas/lecciones.js';
import { pintarLeccion, cerrarFicha, ponerDiccionarioGlobal, ponerDiccionario } from './vistas/leccion.js';
import { pintarReto } from './vistas/reto.js';
import { pintarInicio } from './vistas/inicio.js';
import { pintarCodigo } from './vistas/codigo.js';
import { pintarPerdida } from './vistas/perdida.js';
import { paginarEnMovil, esMovil } from './paginas-movil.js';
import { iniciarLogros, comprobarLogros } from './logros.js';
import { iniciarNube } from './nube.js';
import { estaDentro, alCambiarCuenta } from './cuenta.js';
import { iniciarAvisos } from './avisos.js';
import { banderaIdioma } from './banderas-idioma.js';
import { curso } from './curso.js';
import './movil.js';
import './chispa.js';

const app = document.getElementById('app');
const menu = document.getElementById('menu');
const controlesCabecera = document.querySelector('.cabecera-botones');

// Los ajustes de la cabecera (idioma, sonido, tema, pausa) van en un desplegable «⚙», con el enlace al perfil.
const ajustesCabecera = el('details', { class: 'cabecera-ajustes' });
const abrirAjustes = el('summary', { class: 'btn' });
const panelAjustes = el('div', { class: 'cabecera-ajustes-panel' });
ajustesCabecera.append(abrirAjustes, panelAjustes);
const enlacePerfil = el('a', { class: 'btn ajustes-perfil', href: '#/perfil', onclick: () => { ajustesCabecera.open = false; } });
panelAjustes.append(...['.idioma-menu', '#btn-sonido', '#btn-tema', '#btn-calma'].map(s => controlesCabecera.querySelector(s)), enlacePerfil);
controlesCabecera.append(ajustesCabecera);
document.addEventListener('click', e => { if (!ajustesCabecera.contains(e.target)) ajustesCabecera.open = false; });
ajustesCabecera.addEventListener('keydown', e => {
  if (e.key === 'Escape') { cerrarIdiomas(); ajustesCabecera.open = false; abrirAjustes.focus(); }
});
ajustesCabecera.addEventListener('toggle', () => { if (!ajustesCabecera.open) cerrarIdiomas(); });

// Cinco pestañas: hoy, el curso, los dos exámenes de la nacionalidad y el repaso.
const SECCIONES = [
  { ruta: 'inicio', icono: 'casa', texto: 'ph.menu.inicio' },
  { ruta: 'lecciones', icono: 'libro', texto: 'menu.lecciones' },
  { ruta: 'ccse', icono: 'ccse', texto: 'ph.menu.ccse' },
  { ruta: 'dele', icono: 'dele', texto: 'ph.menu.dele' },
  { ruta: 'repaso', icono: 'repaso', texto: 'menu.repaso' },
];

// El código de las pantallas que no son el inicio, la lista ni la lección se pide al abrirlas.
const vista = (archivo, funcion) => import(`./vistas/${archivo}.js`).then(m => m[funcion]);

// En el móvil ninguna pantalla se reparte ya en páginas del alto de la pantalla (js/paginas-movil.js): cortaban los
// bloques y dejaban huecos (perfil, cuaderno, frases). Todas se leen bajando.
const PAGINADAS = new Set();

/** Reparte unas piezas en diapositivas según lo que miden, sin partir ninguna (un título no se queda solo al final). */
function porAlto(piezas, { marco = 40, hueco = 12 } = {}) {
  const altoDePagina = () => parseFloat(document.documentElement.style.getPropertyValue('--pm-alto')) || window.innerHeight;
  const alto = altoDePagina() * 0.97;
  const paginas = [];
  let pagina = [];
  let usado = 0;
  let cajaActual = null;
  const trozos = piezas.filter(Boolean).flatMap(p => (p.getBoundingClientRect().height > alto / 2 && p.children.length > 1 && !p.hasAttribute('data-entera') ? filas(p) : [p]));
  for (const trozo of trozos) {
    const fila = [].concat(trozo);
    const caja = fila[0].closest('.caja') ?? fila[0];
    const mide = Math.max(...fila.map(f => f.getBoundingClientRect().height)) + hueco + (caja !== cajaActual ? marco : 0);
    if (pagina.length && usado + mide > alto) {
      const titulos = [];
      while (pagina.length && /^H[1-4]$/.test(pagina[pagina.length - 1].tagName)) titulos.unshift(pagina.pop());
      if (pagina.length) paginas.push(pagina);
      pagina = titulos;
      usado = titulos.reduce((n, x) => n + x.getBoundingClientRect().height + hueco, marco);
    }
    pagina.push(...fila);
    usado += mide;
    cajaActual = caja;
  }
  if (pagina.length) paginas.push(pagina);
  return paginas;
}
function filas(contenedor) {
  const grupos = new Map();
  for (const hijo of contenedor.children) {
    const arriba = Math.round(hijo.getBoundingClientRect().top);
    if (!grupos.has(arriba)) grupos.set(arriba, []);
    grupos.get(arriba).push(hijo);
  }
  return [...grupos.values()];
}
const DIAPOSITIVAS = {
  perfil: () => porAlto([...app.children].flatMap(c => (c.classList.contains('caja') ? [...c.children] : [c]))),
};

const contenido = { resultados: [], capitulos: [], errorCapitulos: null };
let limpiarVista = null;
let rutaActual = 'inicio';

// ---------------------------------------------------------------------------
// Menú, idioma y tema
// ---------------------------------------------------------------------------

function pintarMenu() {
  poner(menu, el('ul', {}, SECCIONES.map(s => el('li', {},
    el('a', { href: `#/${s.ruta}`, 'data-ruta': s.ruta, class: 'menu-enlace' }, icono(s.icono), el('span', {}, t(s.texto)))))));
  marcarMenu(rutaActual);
  pintarAvisoRepaso();
}

/** Numerito en «Repaso»: tarjetas que tocan hoy. */
function pintarAvisoRepaso() {
  const enlace = menu.querySelector('a[data-ruta="repaso"]');
  if (!enlace) return;
  const n = pendientesDeHoy();
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

function pintarBotonCalma() {
  const boton = document.getElementById('btn-calma');
  const quieto = modoCalma();
  boton.setAttribute('aria-pressed', String(quieto));
  boton.setAttribute('aria-label', t(quieto ? 'calma.mover' : 'calma.pausar'));
  boton.title = boton.getAttribute('aria-label');
  boton.classList.toggle('pausado', quieto);
}

function pintarBotonSonido() {
  const boton = document.getElementById('btn-sonido');
  const on = Boolean(ajuste('efectos'));
  boton.setAttribute('aria-pressed', String(on));
  boton.setAttribute('aria-label', t(on ? 'sonido.silenciar' : 'sonido.activar'));
  boton.title = boton.getAttribute('aria-label');
}

function pintarMarca() {
  document.body.classList.add('en-estudio');
  ajustesCabecera.open = false;
  abrirAjustes.textContent = '⚙';
  abrirAjustes.setAttribute('aria-label', t('ajustes.titulo'));
  abrirAjustes.title = t('ajustes.titulo');
  poner(enlacePerfil, icono('perfil'), t('menu.perfil'));
  document.getElementById('marca').title = t('ph.menu.inicio');
  pintarCabecera();
}

// Selector de idioma de la interfaz: vietnamita o español.
const selectorIdioma = document.getElementById('sel-idioma');
const listaIdiomas = document.getElementById('lista-idiomas');

function pintarSelectorIdioma() {
  const actual = IDIOMAS.find(i => i.clave === idioma());
  poner(selectorIdioma,
    banderaIdioma(actual.clave),
    el('span', { lang: actual.clave, class: 'sel-idioma-nombre' }, actual.nombre),
    el('span', { class: 'sel-idioma-flecha', 'aria-hidden': 'true' }, '▾'));
  selectorIdioma.title = actual.nombre;
  poner(listaIdiomas, IDIOMAS.map(i => {
    const seleccionado = i.clave === actual.clave;
    return el('button', {
      type: 'button', class: 'idioma-opcion', role: 'menuitemradio', lang: i.clave, 'aria-checked': String(seleccionado),
      onclick: () => { sonar('clic'); cerrarIdiomas(); cambiarIdioma(i.clave); },
    }, el('span', { class: 'idioma-marca idioma-marca-bandera', 'aria-hidden': 'true' }, banderaIdioma(i.clave)),
    el('span', { class: 'idioma-opcion-nombre' }, i.nombre),
    seleccionado ? el('span', { class: 'idioma-opcion-detalle', 'aria-hidden': 'true' }, '✓') : null);
  }));
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
selectorIdioma.addEventListener('click', () => {
  sonar(listaIdiomas.hidden ? 'abrir' : 'cerrar');
  if (listaIdiomas.hidden) abrirIdiomas();
  else cerrarIdiomas();
});
document.addEventListener('click', e => { if (!e.target.closest('.idioma-menu')) cerrarIdiomas(); });
listaIdiomas.addEventListener('keydown', e => {
  const opciones = [...listaIdiomas.children];
  const i = opciones.indexOf(document.activeElement);
  if (e.key === 'Escape') cerrarIdiomas({ foco: true });
  else if (e.key === 'ArrowDown') opciones[Math.min(opciones.length - 1, i + 1)].focus();
  else if (e.key === 'ArrowUp') opciones[Math.max(0, i - 1)].focus();
  else if (e.key === 'Tab') cerrarIdiomas();
  else return;
  if (e.key !== 'Tab') e.preventDefault();
});

document.getElementById('btn-tema').addEventListener('click', () => {
  cambiarAjuste('tema', temaActual() === 'oscuro' ? 'claro' : 'oscuro');
  sonar('interruptor');
});
document.getElementById('btn-calma').addEventListener('click', () => {
  cambiarAjuste('calma', !modoCalma());
  pintarBotonCalma();
});
document.getElementById('btn-sonido').addEventListener('click', () => {
  const on = !ajuste('efectos');
  cambiarAjuste('efectos', on);
  if (on) sonar('interruptor');
  else callar();
});
window.addEventListener('tema-cambiado', pintarBotonTema);
window.addEventListener('efectos-cambiado', pintarBotonSonido);
window.addEventListener('comodidad-cambiada', pintarBotonCalma);

// Al cambiar de idioma se repinta todo: cabecera, menú y la pantalla abierta.
window.addEventListener('idioma-cambiado', () => {
  pintarSelectorIdioma();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();
  pintarBotonCalma();
  pintarMenu();
  navegar({ cambioDeIdioma: true });
});

// ---------------------------------------------------------------------------
// Las lecciones del curso
// ---------------------------------------------------------------------------

alCambiar(pintarAvisoRepaso);
setInterval(pintarAvisoRepaso, 60 * 1000); // las tarjetas también vencen con el paso del tiempo
window.addEventListener('guardado-fallido', () => decir(t('app.guardadoFallido'), 'apurada'));

function titulo(texto) {
  document.title = [texto, 'Phuong App'].filter(Boolean).join(' · ');
}

function pintarNoEncontrada(texto) {
  titulo(t('perdida.titulo'));
  limpiarVista = pintarPerdida(app, texto);
}

// Las lecciones se cargan una sola vez (con índice basta un archivo para la lista; cada lección, al abrirla).
let cargaDelCurso = null;
let cursoCargado = false;
function cargarCurso() {
  cargaDelCurso ??= (async () => {
    contenido.voces = prepararVoces();
    const [indice, { capitulos, error }] = await Promise.all([cargarIndice(), cargarCapitulos()]);
    const resultados = indice ?? await descubrirLecciones();
    Object.assign(contenido, { resultados, capitulos, errorCapitulos: error ?? null, sinConexion: Boolean(resultados.sinConexion) });
    cursoCargado = true;
    comprobarLogros();
  })();
  return cargaDelCurso;
}

// El diccionario del curso pesa mucho: solo lo piden la lección y el cuaderno, o se trae cuando el móvil está libre.
let cargaDelDiccionario = null;
function cargarElDiccionario() {
  cargaDelDiccionario ??= cargarDiccionario().then(async mapa => {
    if (mapa) { ponerDiccionario(mapa); return; }
    await cargarCurso();
    ponerDiccionarioGlobal(contenido.resultados);
  });
  return cargaDelDiccionario;
}
const cuandoEsteLibre = fn => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 2000));

const completas = new Map();
/** La lección entera de un resultado de la lista (la lista solo trae el resumen). */
function leccionCompleta(resultado) {
  if (resultado.error || resultado.leccion?.bloques) return Promise.resolve(resultado);
  const clave = `${idioma()}|${resultado.id}`;
  if (!completas.has(clave)) {
    completas.set(clave, cargarLeccion(resultado.id).then(r => {
      if (r.leccion) r.leccion.numero_curso = resultado.leccion.numero_curso;
      else completas.delete(clave);
      return r;
    }));
  }
  return completas.get(clave);
}

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

let pase = 0; // para descartar una navegación si, mientras esperaba, se ha pedido otra
let pendienteTrasEntrar = null;

function ponerCabeceraVisible(dentro) {
  document.body.classList.toggle('bloqueada', !dentro);
  document.body.classList.toggle('sin-tutora', !dentro);
}

async function navegar({ cambioDeIdioma = false } = {}) {
  const estePase = ++pase;
  cerrarFicha();
  limpiarVista?.();
  limpiarVista = null;
  callar();

  // Sin el código no se ve nada: primero, la puerta.
  if (!estaDentro()) {
    if (location.hash && location.hash !== '#/codigo') pendienteTrasEntrar = location.hash;
    ponerCabeceraVisible(false);
    document.title = 'Phuong App';
    limpiarVista = pintarCodigo(app, {
      alEntrar: () => {
        ponerCabeceraVisible(true);
        const destino = pendienteTrasEntrar ?? '#/inicio';
        pendienteTrasEntrar = null;
        if (location.hash === destino) navegar(); else location.hash = destino;
        iniciarNube();
      },
    });
    quitarArranque();
    return;
  }
  ponerCabeceraVisible(true);

  const hash = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
  const [ruta, ...parametros] = hash.split('/');
  const seccion = !ruta || ruta === 'codigo' ? 'inicio' : ruta;
  const parametro = parametros[0];
  document.body.classList.toggle('en-leccion', seccion === 'leccion');
  rutaActual = seccion === 'leccion' ? 'lecciones' : seccion;
  marcarMenu(rutaActual);
  pintarAvisoRepaso();
  pintarCabecera();

  // Casi todo necesita las lecciones (el inicio, para saber cuál toca): si aún llegan, se espera con el logotipo.
  if (!cursoCargado) {
    poner(app, el('div', { class: 'arranque' }, el('img', { class: 'arranque-logo', src: 'assets/logo.svg', alt: t('html.cargando'), width: 128, height: 128 })));
    await cargarCurso();
    if (estePase !== pase) return;
  }
  // Lo que se practica depende de si hay voz: esas pantallas esperan a saberlo.
  if (['lecciones', 'leccion', 'practica', 'dele', 'ccse'].includes(seccion)) {
    await contenido.voces;
    if (estePase !== pase) return;
  }
  if (['leccion', 'cuaderno'].includes(seccion)) {
    await cargarElDiccionario();
    if (estePase !== pase) return;
  } else {
    cuandoEsteLibre(cargarElDiccionario);
  }

  const esperar = async promesa => { const v = await promesa; return estePase === pase ? v : null; };

  if (seccion === 'inicio') {
    titulo(t('ph.menu.inicio'));
    limpiarVista = pintarInicio(app, contenido);
  } else if (seccion === 'leccion') {
    const i = contenido.resultados.findIndex(r => r.id === parametro);
    const resultado = contenido.resultados[i] && await leccionCompleta(contenido.resultados[i]);
    if (estePase !== pase) return;
    if (!resultado || resultado.error || !resultado.leccion) {
      pintarNoEncontrada(t(resultado?.sinConexion ? 'app.leccionSinConexion' : 'app.leccionNoAbre', { id: parametro }));
    } else {
      const enOrden = agrupar(contenido.resultados, contenido.capitulos).flatMap(g => g.lecciones).filter(r => !r.error);
      const k = enOrden.findIndex(r => r.id === parametro);
      const siguiente = (k >= 0 ? enOrden[k + 1]?.id : contenido.resultados.slice(i + 1).find(r => !r.error)?.id) ?? null;
      titulo(resultado.leccion.titulo_es || tr(resultado.leccion.titulo));
      limpiarVista = pintarLeccion(app, resultado, siguiente);
    }
  } else if (seccion === 'lecciones') {
    titulo(t('menu.lecciones'));
    if (contenido.sinConexion && !contenido.resultados.length) avisoSinConexion();
    else limpiarVista = pintarLecciones(app, contenido);
  } else if (seccion === 'ccse') {
    titulo('CCSE');
    const pintar = await esperar(vista('ccse', 'pintarCcse'));
    if (!pintar) return;
    const apagar = await pintar(app, parametros);
    if (estePase === pase) limpiarVista = apagar; else apagar?.();
  } else if (seccion === 'dele') {
    titulo('DELE');
    const pintar = await esperar(vista('dele', 'pintarDele'));
    if (!pintar) return;
    const apagar = await pintar(app, parametros, contenido);
    if (estePase === pase) limpiarVista = apagar; else apagar?.();
  } else if (seccion === 'prueba') {
    titulo(t('prueba.titulo'));
    const pintar = await esperar(vista('prueba', 'pintarPrueba'));
    if (!pintar) return;
    limpiarVista = pintar(app, { ...contenido, leccionCompleta });
  } else if (seccion === 'practica') {
    titulo(t('menu.practica'));
    const pintar = await esperar(vista('practica', 'pintarPractica'));
    if (!pintar) return;
    pintar(app, { ...contenido, leccionCompleta });
  } else if (seccion === 'frases') {
    titulo(t('menu.frases'));
    contenido.frases ??= await cargarFrases();
    if (estePase !== pase) return;
    const pintar = await esperar(vista('frases', 'pintarFrases'));
    if (!pintar) return;
    pintar(app, contenido.frases);
  } else if (seccion === 'cuaderno') {
    titulo(t('menu.cuaderno'));
    const pintar = await esperar(vista('cuaderno', 'pintarCuaderno'));
    if (!pintar) return;
    pintar(app);
  } else if (seccion === 'repaso') {
    titulo(t('menu.repaso'));
    const pintar = await esperar(vista('repaso', 'pintarRepaso'));
    if (!pintar) return;
    limpiarVista = pintar(app);
  } else if (seccion === 'reto') {
    titulo(t('reto.titulo'));
    limpiarVista = pintarReto(app);
  } else if (seccion === 'perfil') {
    titulo(t('menu.perfil'));
    const pintar = await esperar(vista('perfil', 'pintarPerfil'));
    if (!pintar) return;
    pintar(app, contenido);
  } else {
    pintarNoEncontrada('');
  }

  if (estePase === pase && PAGINADAS.has(seccion) && esMovil()) {
    const deshacer = paginarEnMovil(app, { fijas: DIAPOSITIVAS[seccion] });
    const antes = limpiarVista;
    limpiarVista = () => { deshacer(); antes?.(); };
  }
  quitarArranque();

  // Al cambiar de idioma no se mueve la página ni el foco: solo cambian los textos.
  if (!cambioDeIdioma) {
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
    app.classList.remove('vista-entra');
    void app.offsetWidth;
    app.classList.add('vista-entra');
  }
}

function avisoSinConexion() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, t('app.sinConexionTitulo')),
    el('p', {}, t('app.sinConexionTexto')),
    el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))));
  decir(t('app.sinConexionTutora'), 'confundida');
}

/** Quita la pantalla de arranque (el logotipo que se ve mientras carga la app). */
function quitarArranque() {
  document.body.classList.remove('arrancando');
}

function hayAlmacenamiento() {
  try { localStorage.setItem('phuong-prueba-almacen', '1'); localStorage.removeItem('phuong-prueba-almacen'); return true; } catch { return false; }
}

function iniciar() {
  aplicarIdioma();
  aplicarTema();
  aplicarComodidad();
  if (!hayAlmacenamiento()) {
    poner(app, el('section', { class: 'caja tarjeta-error', role: 'alert' },
      el('h1', {}, t('app.sinAlmacenamientoTitulo')), el('p', {}, t('app.sinAlmacenamientoTexto')),
      el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))));
    quitarArranque();
    return;
  }
  pintarSelectorIdioma();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();
  pintarBotonCalma();
  pintarMenu();
  iniciarLogros(() => {
    const niveles = new Map((contenido.capitulos ?? []).map(c => [String(c.numero), c.nivel]));
    return contenido.resultados.filter(r => r.leccion).map(r => ({ id: r.leccion.id, nivel: niveles.get(String(r.leccion.capitulo)) }));
  });

  window.addEventListener('hashchange', () => navegar());
  // Las diapositivas del móvil se deciden al pintar: al cruzar ese ancho se vuelve a pintar (una lección a medias no se corta).
  window.matchMedia('(max-width: 700px)').addEventListener('change', () => {
    if (!document.body.classList.contains('en-leccion') && !document.querySelector('[data-examen-en-curso]')) navegar();
  });
  // Si la voz aparece o desaparece, se repinta la pantalla en el mismo sitio (en un repaso, un juego o un examen, no).
  window.addEventListener('voz-cambiada', () => {
    if (/^#\/(repaso|ccse|dele|codigo)/.test(location.hash) || document.querySelector('.juego, [data-examen-en-curso]') || !estaDentro()) return;
    const y = window.scrollY;
    navegar().then(() => window.scrollTo(0, y));
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) sonar('pagina'); });

  // Las lecciones se van cargando ya, mientras se escribe el código.
  cargarCurso();
  navegar();
  iniciarAvisos();
  if (estaDentro()) iniciarNube();
  // «Bloquear» (en el perfil) vuelve a la puerta
  alCambiarCuenta(c => { if (!c) { location.hash = '#/codigo'; navegar(); } });
  if (datosDanados().length) setTimeout(() => decir(t('app.datosDanados'), 'confundida'), 1500);
  // si de la nube llega progreso nuevo, se repinta la pantalla (salvo en mitad de una lección, un repaso, un reto o un examen)
  window.addEventListener('datos-sincronizados', () => {
    if (!/^#\/(leccion|repaso|reto|ccse\/|dele\/)/.test(location.hash) && estaDentro()) navegar({ cambioDeIdioma: true });
    pintarAvisoRepaso();
  });
}

iniciar();
