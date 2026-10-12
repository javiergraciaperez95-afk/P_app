// Modo juego de una lección: la misma información, troceada en pasos cortos e interactivos.
// Un paso = la tutora dice algo breve + un tablero con una sola cosa que hacer.
// No se puede avanzar sin terminar el paso, pero se puede volver atrás cuando se quiera.
// El guion de cada lección está en juegos/NNN.json; los tipos de paso, en escenas.js.

import { el, poner, enLinea } from '../dom.js';
import { t, tr } from '../i18n.js';
import { crearSprite } from '../tutor-sprite.js';
import { escucharTutora } from '../tutor.js';
import { sonar, sonarAcierto, ponerMusica, pitidoVoz, callar } from '../sonidos.js';
import { chispas, confeti, flotar, animar } from './efectos.js';
import { marcarAbierta } from '../progress.js';
import { normalizarPalabra } from '../lessons.js';
import { ESCENAS as ESCENAS_A } from './escenas.js';
import { ESCENAS_B } from './escenas-b.js';
import { ESCENAS_C } from './escenas-c.js';
import { LANG } from '../curso.js';
import { clave } from '../curso.js';
import { ruta } from '../curso.js';
import { salirDelJuego } from '../movil.js';

const ESCENAS = { ...ESCENAS_A, ...ESCENAS_B, ...ESCENAS_C };

const CARPETA = ruta('juegos/');
const CLAVE = clave('juego');
const CLAVE_MUSICA = 'idiomas-juego-musica';
const ELOGIOS = ['¡Bien!', '¡Eso es!', '¡Genial!', '¡Olé!', '¡Perfecto!', '¡Muy bien!'];
const VERSION = new URL(import.meta.url).searchParams.get('v');
const conVersion = archivo => (VERSION && VERSION !== '__VERSION__' ? `${archivo}?v=${VERSION}` : archivo);

let indice = null; // lista de lecciones que tienen juego
const guiones = new Map();

/** ¿Tiene juego esta lección? Devuelve el guion o null. */
export async function cargarJuego(id) {
  try {
    indice ??= await fetch(conVersion(`${CARPETA}index.json`), { cache: 'no-cache' }).then(r => (r.ok ? r.json() : []));
  } catch {
    indice = [];
  }
  if (!indice.includes(id)) return null;
  if (!guiones.has(id)) {
    try {
      const guion = await fetch(conVersion(`${CARPETA}${id}.json`), { cache: 'no-cache' }).then(r => r.json());
      guiones.set(id, Array.isArray(guion.pasos) && guion.pasos.length ? guion : null);
    } catch {
      guiones.set(id, null);
    }
  }
  return guiones.get(id);
}

// ---------------------------------------------------------------------------
// Por dónde va cada lección (solo en este dispositivo)
// ---------------------------------------------------------------------------

function leerAvance(id) {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))?.[id] ?? { paso: 0, hechos: [] };
  } catch {
    return { paso: 0, hechos: [] };
  }
}

function guardarAvance(id, avance) {
  try {
    const todo = JSON.parse(localStorage.getItem(CLAVE)) ?? {};
    todo[id] = avance;
    localStorage.setItem(CLAVE, JSON.stringify(todo));
  } catch { /* sin almacenamiento: se juega igual, pero no se recuerda */ }
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------

/**
 * Pinta el juego. alLibro(): cambia a la vista de libro.
 * Devuelve una función para limpiar al salir de la pantalla.
 */
export function pintarJuego(contenedor, resultado, guion, { siguiente, alLibro, diccionario }) {
  // palabras: con el diccionario entero (para buscar cualquiera); propias: solo las de esta lección.
  const leccion = { ...resultado.leccion, propias: resultado.leccion.palabras, palabras: new Map([...diccionario, ...resultado.leccion.palabras]) };
  const pasos = guion.pasos;
  const avance = leerAvance(leccion.id);
  avance.hechos = avance.hechos.filter(i => i < pasos.length);
  let actual = Math.min(avance.paso, pasos.length - 1);
  let limpiarEscena = null;
  const sinAnimaciones = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  marcarAbierta(leccion.id);
  document.body.classList.add('modo-juego');

  // ---- La tutora en escena -------------------------------------------------
  const canvas = el('canvas', { class: 'juego-canvas', width: '48', height: '60', role: 'img', 'aria-label': t('tutora.nombre') });
  const sprite = crearSprite(canvas);
  const bocadillo = el('p', { class: 'juego-bocadillo-texto' });
  const lector = el('p', { class: 'solo-lector', 'aria-live': 'polite' });
  let temporizador = null;

  /** La tutora dice algo en su bocadillo. deGolpe: sin efecto de máquina de escribir. */
  function decir(texto, cara = 'normal', { deGolpe = false } = {}) {
    clearTimeout(temporizador);
    const completo = String(tr(texto) ?? '');
    sprite.expresion = cara;
    lector.textContent = completo.replace(/\*\*/g, '');
    const acabar = () => {
      clearTimeout(temporizador);
      sprite.hablando = false;
      bocadillo.classList.remove('escribiendo');
      poner(bocadillo, ...enLinea(completo));
    };
    if (deGolpe || sinAnimaciones || !completo) { acabar(); return; }

    const partes = completo.split(/(\*\*.+?\*\*)/g);
    const total = completo.replace(/\*\*/g, '').length;
    let letras = 0;
    sprite.hablando = true;
    bocadillo.classList.add('escribiendo');
    bocadillo.onclick = acabar; // tocar el texto lo completa
    const paso = () => {
      letras += 2;
      let quedan = letras;
      poner(bocadillo);
      for (const parte of partes) {
        if (quedan <= 0) break;
        const negrita = parte.startsWith('**') && parte.endsWith('**');
        const trozo = (negrita ? parte.slice(2, -2) : parte).slice(0, quedan);
        quedan -= trozo.length;
        bocadillo.append(negrita ? el('strong', {}, trozo) : trozo);
      }
      if (letras % 6 === 0) pitidoVoz();
      if (letras >= total) acabar();
      else temporizador = setTimeout(paso, 28);
    };
    paso();
  }

  canvas.addEventListener('click', () => { sprite.reaccionar('cosquillas', 900); sonar('risa'); });

  // ---- Aciertos, fallos y racha ---------------------------------------------
  // Las escenas avisan con bien(nodo) y mal(nodo); de aquí salen el sonido, las chispas y la racha.
  const marcadorRacha = el('span', { class: 'juego-racha', hidden: true });
  let racha = 0;
  function pintarRacha() {
    marcadorRacha.hidden = racha < 2;
    marcadorRacha.textContent = t('juego.racha', { n: racha });
    if (racha >= 2) animar(marcadorRacha, 'brinca');
  }
  function bien(nodo) {
    racha += 1;
    sonarAcierto(racha);
    const donde = nodo?.isConnected ? nodo : canvas;
    chispas(donde, 10 + Math.min(racha, 6) * 3);
    flotar(donde, ELOGIOS[Math.floor(Math.random() * ELOGIOS.length)]);
    animar(canvas, 'salta');
    pintarRacha();
  }
  function mal(nodo) {
    racha = 0;
    sonar('mal');
    animar(nodo, 'tiembla');
    pintarRacha();
  }

  // ---- Música de fondo (se recuerda si se apagó) ------------------------------
  let quiereMusica = true;
  try { quiereMusica = localStorage.getItem(CLAVE_MUSICA) !== 'no'; } catch { /* sin almacenamiento */ }
  const botonMusica = el('button', { type: 'button', class: 'boton boton-mini juego-musica', 'aria-label': t('juego.musica') });
  const pintarMusica = () => {
    botonMusica.textContent = quiereMusica ? '🎵' : '🔇';
    botonMusica.setAttribute('aria-pressed', String(quiereMusica));
  };
  // El navegador no deja sonar nada hasta el primer toque: se intenta en cada toque hasta que arranca.
  const arrancarMusica = () => { if (quiereMusica) ponerMusica(true); };
  botonMusica.addEventListener('click', () => {
    quiereMusica = !quiereMusica;
    try { localStorage.setItem(CLAVE_MUSICA, quiereMusica ? 'si' : 'no'); } catch { /* sin almacenamiento */ }
    ponerMusica(quiereMusica);
    pintarMusica();
  });
  pintarMusica();
  contenedor.addEventListener('pointerdown', arrancarMusica);

  // Lo que la tutora diría en su cuadro de siempre (p. ej. al corregir un ejercicio) sale aquí.
  const dejarDeEscuchar = escucharTutora((mensaje, cara) => {
    const paginas = [].concat(mensaje).filter(Boolean).map(p => (typeof p === 'string' ? p : p.texto));
    decir(paginas.join(' '), cara);
  });

  // ---- Estructura ----------------------------------------------------------
  const camino = el('ol', { class: 'juego-camino', 'aria-label': t('juego.camino') });
  const etapa = el('p', { class: 'juego-etapa' });
  const tablero = el('div', { class: 'caja juego-tablero' });
  const atras = el('button', { type: 'button', class: 'boton boton-mini' }, t('juego.atras'));
  const adelante = el('button', { type: 'button', class: 'boton boton-principal boton-grande juego-adelante' }, t('juego.siguiente'));
  const contador = el('span', { class: 'aprox' });

  const cabecera = el('header', { class: 'cabecera-leccion juego-cabecera' },
    // Salir del juego pregunta antes (el avance queda guardado, pero un toque sin querer no debe sacarte).
    el('a', { class: 'boton boton-mini volver', href: '#/lecciones', onclick: async e => {
      e.preventDefault();
      if (await salirDelJuego()) location.hash = '#/lecciones';
    } }, `◀ ${t('menu.lecciones')}`),
    el('button', { type: 'button', class: 'boton boton-mini', onclick: alLibro }, t('juego.verLibro')),
    botonMusica,
    el('p', { class: 'etiqueta-bloque' }, t('leccion.numero', { id: leccion.id })),
    el('h1', { class: 'titulo-es', lang: LANG }, leccion.titulo_es));

  const escena = el('div', { class: 'caja juego-escena' },
    el('div', { class: 'juego-retrato' }, canvas),
    el('div', { class: 'juego-bocadillo' }, el('p', { class: 'juego-quien' }, el('span', { class: 'tutora-nombre' }, t('tutora.nombre')), marcadorRacha), bocadillo, lector));

  poner(contenedor,
    el('section', { class: 'juego' },
      cabecera, camino, etapa, escena, tablero,
      el('div', { class: 'juego-pie' }, atras, contador, adelante)));

  /** Algunos pasos sacan a la tutora a su propia escena: entonces se esconde su retrato. */
  const retrato = visible => escena.classList.toggle('sin-retrato', !visible);

  // ---- Pasos ---------------------------------------------------------------
  function pintarCamino() {
    poner(camino, pasos.map((p, i) => {
      const hecho = avance.hechos.includes(i);
      const abierto = hecho || i === 0 || avance.hechos.includes(i - 1);
      const nuevaEtapa = i === 0 || tr(pasos[i - 1].etapa) !== tr(p.etapa);
      return el('li', { class: `juego-tramo${nuevaEtapa ? ' inicio-etapa' : ''}` },
        el('button', {
          type: 'button',
          class: `juego-punto${hecho ? ' hecho' : ''}${i === actual ? ' actual' : ''}`,
          disabled: !abierto,
          'aria-label': t('juego.irAPaso', { n: i + 1, etapa: tr(p.etapa) }),
          'aria-current': i === actual ? 'step' : null,
          onclick: () => irA(i),
        }, hecho ? '★' : ''));
    }));
  }

  function completar() {
    if (!avance.hechos.includes(actual)) {
      avance.hechos.push(actual);
      guardarAvance(leccion.id, avance);
      sonar('paso');
      confeti(actual === pasos.length - 1 ? 110 : 36);
    }
    pintarCamino();
    adelante.disabled = false;
    adelante.classList.add('listo');
    if (actual < pasos.length - 1) adelante.focus({ preventScroll: true });
  }

  function irA(i) {
    limpiarEscena?.();
    limpiarEscena = null;
    callar();
    actual = i;
    avance.paso = i;
    guardarAvance(leccion.id, avance);

    const paso = pasos[i];
    const ultimo = i === pasos.length - 1;
    pintarCamino();
    etapa.textContent = tr(paso.etapa) ?? '';
    contador.textContent = t('juego.paso', { n: i + 1, total: pasos.length });
    atras.disabled = i === 0;
    adelante.hidden = ultimo;
    adelante.disabled = !avance.hechos.includes(i);
    adelante.classList.toggle('listo', !adelante.disabled);
    tablero.className = `caja juego-tablero escena-${paso.tipo}`;
    animar(tablero, 'entra');
    poner(tablero);

    retrato(true);
    const crear = ESCENAS[paso.tipo];
    if (!crear) {
      poner(tablero, el('p', { class: 'aviso-bloque' }, t('juego.tipoDesconocido', { tipo: paso.tipo })));
      completar();
      return;
    }
    if (paso.dice) decir(paso.dice, paso.cara ?? 'normal');
    limpiarEscena = crear({
      paso, leccion, tablero, decir, completar, siguiente, alLibro, bien, mal, retrato,
      yaHecho: avance.hechos.includes(i),
      palabra: clave => leccion.palabras.get(normalizarPalabra(clave)) ?? null,
      reiniciar: () => {
        avance.hechos = [];
        guardarAvance(leccion.id, avance);
        irA(0);
      },
    }) ?? null;
    tablero.scrollTop = 0; // el juego ocupa la pantalla entera: no hay página que desplazar
  }

  atras.addEventListener('click', () => { sonar('pagina'); irA(actual - 1); });
  adelante.addEventListener('click', () => { sonar('pagina'); irA(actual + 1); });

  irA(actual);
  arrancarMusica();

  return () => {
    limpiarEscena?.();
    clearTimeout(temporizador);
    dejarDeEscuchar();
    contenedor.removeEventListener('pointerdown', arrancarMusica);
    ponerMusica(false);
    sprite.parar();
    callar();
    document.body.classList.remove('modo-juego');
  };
}
