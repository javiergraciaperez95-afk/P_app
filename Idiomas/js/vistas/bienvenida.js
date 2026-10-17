// Bienvenida (#/bienvenida): la primera vez, la tutora del curso enseña la app en un minuto.
// No es un vídeo ni unas diapositivas: cada cosa se hace de verdad, con una frase real del curso elegido.
//   1. rellenas tu carné de estudiante     4. guardas una palabra (la estrella vuela al cuaderno, y se guarda de verdad)
//   2. tocas palabras de una frase         5. eliges el camino bueno en un poste de cruce (si fallas, vuelve)
//   3. pides que te la explique (el sello)  6. y a la primera lección
// Es un paseo: el camino lleva a la academia de la portada, y con cada paso hecho la tutora camina y la academia
// se acerca. Arriba, un caminito con seis banderas por el que avanza una tutora pequeña. Abajo, el cuadro de
// diálogo, con la tutora de pie encima. Ocupa toda la pantalla y nunca hay que desplazar.
// Un lienzo por delante pone el confeti. Colores en css/bienvenida.css; textos en i18n/ (claves «bienvenida.*»).

import { el, poner, enLinea, barajar } from '../dom.js';
import { t, tr, origenTarjeta } from '../i18n.js';
import { icono } from '../iconos.js';
import { curso, LANG } from '../curso.js';
import { crearSprite } from '../tutor-sprite.js';
import { sonar, pitidoVoz, pronunciar, hayVoz } from '../sonidos.js';
import { nombre, cambiarNombre, estaEnCuaderno, guardarEnCuaderno } from '../progress.js';
import { analizarFrase } from './leccion.js';
import { sol, luna, nubes, universidad, dibujoPixel, conContorno } from './inicio-decorado.js';
import { lienzo } from './elenco.js';

const CLAVE_VISTA = 'idiomas-bienvenida-vista';
const LETRA = 24;      // milisegundos por letra al escribir
const MAX_PALABRAS = 3; // palabras que hay que tocar en la frase
const PASEO = 760;     // lo que tarda la tutora en llegar al paso siguiente

/** true si ya se ha visto (o saltado) la bienvenida en este dispositivo. */
export function bienvenidaVista() {
  try { return Boolean(localStorage.getItem(CLAVE_VISTA)); } catch { return true; }
}

function marcarVista() {
  try { localStorage.setItem(CLAVE_VISTA, '1'); } catch { /* sin almacenamiento */ }
}

// ---------------------------------------------------------------------------
// La frase de ejemplo: se busca en las primeras lecciones del curso
// ---------------------------------------------------------------------------

const vale = entrada => entrada && !entrada.oculta && tr(entrada.trad);

/** Una frase corta de un diálogo con dos o más palabras que tengan ficha. Si no hay, tres palabras sueltas. */
function elegirEjemplo(resultados) {
  const lecciones = resultados.filter(r => !r.error).slice(0, 8).map(r => r.leccion);
  let mejor = null;
  lecciones.forEach((leccion, n) => {
    for (const bloque of leccion.bloques) {
      if (bloque.tipo !== 'dialogo') continue;
      for (const frase of bloque.frases) {
        if (!tr(frase.trad) || frase.es.length > 46) continue;
        const trozos = analizarFrase(frase.es, leccion.palabras);
        const distintas = new Set(trozos.filter(x => vale(x.entrada)).map(x => x.entrada.es)).size;
        if (distintas < 2) continue;
        const nota = Math.min(distintas, MAX_PALABRAS) * 100 - frase.es.length - n * 20;
        if (!mejor || nota > mejor.nota) mejor = { nota, frase, trozos, leccion };
      }
    }
  });
  if (mejor) return mejor;
  // Cursos que empiezan por el alfabeto: sin frase, se enseñan tres palabras sueltas.
  for (const leccion of lecciones) {
    const sueltas = [...leccion.palabras.values()].filter(vale).slice(0, MAX_PALABRAS);
    if (sueltas.length >= 2) {
      const trozos = sueltas.flatMap((entrada, i) => (i ? [{ texto: '   ' }, { texto: entrada.es, entrada }] : [{ texto: entrada.es, entrada }]));
      return { frase: null, trozos, leccion };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Los dibujos del paseo (prefijo «bv»; colores en css/bienvenida.css)
// ---------------------------------------------------------------------------

/** Un árbol redondo: copa (h, H clara, g sombra) y tronco (n). */
function rejillaArbol(semilla) {
  const W = 30;
  const H = 40;
  const { g, R, filas } = lienzo(W, H);
  R(13, 26, 4, 14, 'n'); R(15, 26, 2, 14, 'N');
  let s = semilla;
  const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const [cx, cy, r] of [[15, 14, 12], [8, 19, 7], [22, 19, 7], [15, 7, 7]]) {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H || Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > r) continue;
        g[y][x] = 'h';
      }
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g[y][x] !== 'h') continue;
      if (x + y < 20 && azar() < 0.7) g[y][x] = 'H';
      else if (y > 20 && azar() < 0.6) g[y][x] = 'g';
      else if (azar() < 0.06) g[y][x] = 'H';
    }
  }
  return conContorno(filas());
}

/** Una farola del camino: hierro (l) y el farol (y). */
const FAROLA = (() => {
  const { R, filas } = lienzo(9, 36);
  R(2, 0, 5, 1, 'l'); R(1, 1, 7, 7, 'l'); R(2, 2, 2, 5, 'y'); R(5, 2, 2, 5, 'y'); R(2, 8, 5, 1, 'l');
  R(3, 9, 3, 24, 'l'); R(3, 9, 1, 24, 'L');
  R(1, 33, 7, 3, 'l');
  return conContorno(filas());
})();

/** Las flores sueltas del prado. */
const FLORES = (() => {
  const { R, filas } = lienzo(14, 7);
  R(1, 0, 3, 3, 'f'); R(2, 1, 1, 1, 'y'); R(2, 3, 1, 4, 'g');
  R(8, 2, 3, 3, 'F'); R(9, 3, 1, 1, 'y'); R(9, 5, 1, 2, 'g'); R(5, 5, 2, 2, 'g'); R(12, 4, 1, 3, 'g');
  return conContorno(filas());
})();

/** El cuaderno abierto (la estrella vuela aquí): tapas rojas, dos páginas con renglones y la cinta. */
const CUADERNO = (() => {
  const { R, filas } = lienzo(40, 26);
  R(0, 4, 40, 22, 'r'); R(0, 24, 40, 2, 'R');
  R(2, 2, 17, 21, 'p'); R(21, 2, 17, 21, 'p'); R(19, 2, 2, 22, 'R');
  for (let y = 6; y < 21; y += 3) { R(4, y, 13, 1, 'b'); R(23, y, 13, 1, 'b'); }
  R(31, 0, 3, 8, 'o'); R(31, 8, 1, 1, 'o'); R(33, 8, 1, 1, 'o');
  return conContorno(filas());
})();

/** El sello de goma: mango de madera, cuerpo y la goma roja. */
const SELLO = (() => {
  const { R, filas } = lienzo(20, 26);
  R(6, 0, 8, 2, 'n'); R(5, 2, 10, 7, 'n'); R(5, 2, 2, 7, 'N'); R(8, 9, 4, 6, 'n');
  R(1, 15, 18, 5, 'l'); R(1, 15, 18, 1, 'L');
  R(2, 20, 16, 4, 'r'); R(2, 23, 16, 1, 'R');
  return conContorno(filas());
})();

// los iconos de las seis banderas del caminito de arriba
const ICONOS_PASO = {
  nombre: ['.kkkkk.', 'kpppppk', 'kpkkkpk', 'kpppppk', 'kpkkppk', 'kpppppk', '.kkkkk.'],
  toca: ['.......', 'kk..kk.', 'k.k.k.k', 'kkk.kk.', 'k.k.k.k', 'k.k.kk.', '.......'],
  explica: ['..kkk..', '.k...k.', '.....k.', '....k..', '...k...', '.......', '...k...'],
  guarda: ['...k...', '..kkk..', 'kkkkkkk', '.kkkkk.', '..kkk..', '.kk.kk.', 'kk...kk'],
  prueba: ['...k...', 'kkkkkk.', 'kkkkkkk', 'kkkkkk.', '...k...', '...k...', '..kkk..'],
  fin: ['..kkk..', '.kkkkk.', 'kkkkkkk', 'kk.k.kk', 'kkkkkkk', 'kk...kk', 'kk...kk'],
};

/** El recorte del camino: un trapecio con los bordes a escalones (de la academia hasta abajo). */
function recorteCamino() {
  const filas = 40;
  const izq = [];
  const der = [];
  for (let i = 0; i <= filas; i++) {
    const p = i / filas;
    const medio = 3 + 47 * p ** 1.15; // medio ancho, en % del ancho
    const y = (p * 100).toFixed(2);
    const ySig = (Math.min(1, (i + 1) / filas) * 100).toFixed(2);
    izq.push(`${(50 - medio).toFixed(2)}% ${y}%`, `${(50 - medio).toFixed(2)}% ${ySig}%`);
    der.unshift(`${(50 + medio).toFixed(2)}% ${ySig}%`, `${(50 + medio).toFixed(2)}% ${y}%`);
  }
  return `polygon(${[...izq, ...der].join(', ')})`;
}

// ---------------------------------------------------------------------------
// El confeti (un lienzo por delante de todo)
// ---------------------------------------------------------------------------

export function efectos(lienzoFx, quieto) {
  const ctx = lienzoFx.getContext('2d');
  let confeti = [];
  let cuadro = null;
  let ultimo = 0;
  let parado = false;

  const ajustar = () => { lienzoFx.width = lienzoFx.clientWidth; lienzoFx.height = lienzoFx.clientHeight; };
  ajustar();
  window.addEventListener('resize', ajustar);

  function arrancar() {
    if (cuadro === null && !parado) { ultimo = performance.now(); cuadro = requestAnimationFrame(fotograma); }
  }

  function fotograma(ahora) {
    cuadro = null;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    ctx.clearRect(0, 0, lienzoFx.width, lienzoFx.height);
    confeti = confeti.filter(p => p.vida > 0);
    for (const p of confeti) {
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vida -= dt;
      ctx.globalAlpha = Math.min(1, p.vida * 3);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, p.lado, p.lado);
    }
    ctx.globalAlpha = 1;
    if (confeti.length) arrancar();
  }

  return {
    /** Una explosión de cuadraditos desde un punto de la pantalla. */
    confeti(x, y, cuantos = 26, fuerza = 1) {
      if (quieto || parado) return;
      const caja = lienzoFx.getBoundingClientRect();
      const tonos = ['#f4c84a', '#fff4dc', '#ff9aa8', '#8fd8ff', '#6fd38c', '#e2464e'];
      for (let i = 0; i < cuantos; i++) {
        const angulo = Math.random() * Math.PI * 2;
        const v = (120 + Math.random() * 300) * fuerza;
        confeti.push({
          x: x - caja.left, y: y - caja.top, vx: Math.cos(angulo) * v, vy: Math.sin(angulo) * v - 220 * fuerza,
          lado: Math.random() < 0.3 ? 8 : 6, color: tonos[i % tonos.length], vida: 0.7 + Math.random() * 0.7,
        });
      }
      arrancar();
    },
    parar() {
      parado = true;
      cancelAnimationFrame(cuadro);
      window.removeEventListener('resize', ajustar);
    },
  };
}

// ---------------------------------------------------------------------------
// La bienvenida
// ---------------------------------------------------------------------------

/**
 * Pinta la bienvenida. Devuelve una función que la apaga: hay que llamarla al salir.
 * contenido.resultados: las lecciones cargadas del curso.
 */
export function pintarBienvenida(contenedor, { resultados }) {
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apagar = [];
  const relojes = new Set();
  let encendida = true;
  const espera = ms => new Promise(resolver => {
    const r = setTimeout(() => { relojes.delete(r); resolver(); }, ms);
    relojes.add(r);
  });
  const dibujo = (rejilla, clase) => dibujoPixel(rejilla, clase, 'bv');

  const ejemplo = elegirEjemplo(resultados);
  const primera = resultados.find(r => !r.error)?.id ?? null;
  // Las palabras con ficha de la frase, sin repetir, y las que hay que tocar.
  const fichas = [];
  for (const trozo of ejemplo?.trozos ?? []) {
    if (vale(trozo.entrada) && !fichas.includes(trozo.entrada)) fichas.push(trozo.entrada);
  }
  const pedidas = fichas.slice(0, MAX_PALABRAS);
  const estrella = pedidas[0] ?? null; // la palabra que se guarda y la que luego se pregunta

  // ----- El paisaje: cielo, academia al fondo, prado, camino, árboles y farolas -----
  const camino = el('div', { class: 'bv-camino' });
  camino.style.clipPath = recorteCamino();
  const decorado = (rejilla, clase, x, y, escala) => {
    const nodo = el('span', { class: `bv-cosa ${clase}`, style: `--x:${x};--y:${y};--e:${escala}` }, dibujo(rejilla, 'bv-cosa-dibujo'));
    return nodo;
  };
  const paisaje = el('div', { class: 'bv-paisaje', 'aria-hidden': 'true' },
    el('div', { class: 'inicio-cielo' }, sol(), luna(), nubes()),
    el('span', { class: 'bv-montes' }),
    el('div', { class: 'bv-academia' }, universidad(), el('span', { class: 'bv-puerta-luz' })),
    el('span', { class: 'bv-prado' }),
    camino,
    decorado(rejillaArbol(3), 'bv-arbol', -1.6, 0.7, 0.7),
    decorado(rejillaArbol(7), 'bv-arbol', 1.75, 0.6, 0.62),
    decorado(rejillaArbol(11), 'bv-arbol bv-lejano', -0.95, 0.88, 0.42),
    decorado(rejillaArbol(5), 'bv-arbol bv-lejano', 1.05, 0.9, 0.38),
    decorado(FAROLA, 'bv-farola', -0.86, 0.6, 0.9),
    decorado(FAROLA, 'bv-farola', 0.9, 0.56, 0.95),
    decorado(FLORES, 'bv-flores', -1.25, 0.25, 1.2),
    decorado(FLORES, 'bv-flores', 1.3, 0.3, 1.1),
    decorado(FLORES, 'bv-flores', -2.2, 0.12, 1.4));

  // ----- La barra: el caminito de las banderas y «Saltar» -----
  const lienzoMini = el('canvas', { class: 'bv-mini-dibujo', width: 48, height: 64 });
  const mini = el('span', { class: 'bv-mini', 'aria-hidden': 'true' }, lienzoMini);
  const progreso = el('ol', { class: 'bv-progreso' });
  const ruta = el('div', { class: 'bv-ruta' }, progreso, mini);
  const saltar = el('button', { type: 'button', class: 'bv-saltar' }, t('bienvenida.saltar'), el('span', { 'aria-hidden': 'true' }, ' ✕'));

  // ----- El escenario y el diálogo -----
  const escena = el('div', { class: 'bv-escena' });
  const texto = el('p', { class: 'bv-texto', 'aria-hidden': 'true' });
  const lector = el('p', { class: 'solo-lector', 'aria-live': 'polite' });
  const siguiente = el('button', { type: 'button', class: 'es-boton bv-siguiente', hidden: true }, t('tutora.siguiente'));
  const canvas = el('canvas', { class: 'bv-tutora-dibujo', width: 48, height: 64, role: 'img', 'aria-label': t('tutora.nombre') });
  const tutora = el('button', { type: 'button', class: 'bv-tutora', 'aria-label': t('tutora.tocar') }, canvas);
  const dialogo = el('div', { class: 'bv-dialogo' },
    tutora,
    el('p', { class: 'bv-nombre-tutora' }, t('tutora.nombrePropio')),
    texto, lector,
    el('span', { class: 'bv-sigue', 'aria-hidden': 'true' }),
    el('div', { class: 'bv-dialogo-pie' }, siguiente));
  const lienzoEfectos = el('canvas', { class: 'bv-efectos', 'aria-hidden': 'true' });
  const raiz = el('section', { class: 'bienvenida escena-web', 'aria-label': t('bienvenida.titulo') },
    paisaje,
    el('header', { class: 'bv-barra' }, ruta, saltar),
    escena,
    dialogo,
    lienzoEfectos);
  poner(contenedor, raiz);

  const fx = efectos(lienzoEfectos, quieto);
  apagar.push(() => fx.parar());

  const sprite = crearSprite(canvas);
  const spriteMini = crearSprite(lienzoMini);
  apagar.push(() => { sprite.parar?.(); spriteMini.parar?.(); });
  tutora.addEventListener('click', () => { sonar('saludo'); sprite.reaccionar('cosquillas', 900); sprite.gesto('saludar'); });

  const centroDe = nodo => {
    const caja = nodo.getBoundingClientRect();
    return [caja.left + caja.width / 2, caja.top + caja.height / 2];
  };

  // ----- La tutora habla: escribe letra a letra, con su pitido -----
  let escribiendo = null; // { acabar }
  function decir(frase, expresion = 'normal') {
    escribiendo?.acabar();
    sprite.expresion = expresion;
    lector.textContent = frase.replaceAll('**', '');
    const limpio = frase.replaceAll('**', '');
    dialogo.classList.add('escribe');
    return new Promise(resolver => {
      let n = 0;
      let reloj = null;
      const acabar = () => {
        if (!escribiendo || escribiendo.acabar !== acabar) return;
        clearInterval(reloj);
        escribiendo = null;
        sprite.hablando = false;
        dialogo.classList.remove('escribe');
        poner(texto, enLinea(frase));
        resolver();
      };
      escribiendo = { acabar };
      if (quieto) { acabar(); return; }
      sprite.hablando = true;
      texto.textContent = '';
      reloj = setInterval(() => {
        n += 1;
        texto.textContent = limpio.slice(0, n);
        if (n % 3 === 0) pitidoVoz();
        if (n >= limpio.length) acabar();
      }, LETRA);
      apagar.push(() => clearInterval(reloj));
    });
  }
  // Tocar el cuadro de diálogo termina de escribir de golpe.
  dialogo.addEventListener('click', e => { if (!e.target.closest('button')) escribiendo?.acabar(); });

  // ----- Los pasos -----
  let indice = 0;
  let avanzar = null; // lo que hace «Siguiente» en el paso actual

  /** El paso está hecho: aparece «Siguiente». */
  function listo() {
    siguiente.hidden = false;
    siguiente.classList.add('bv-listo');
    dialogo.classList.add('con-boton');
    siguiente.focus({ preventScroll: true });
  }
  siguiente.addEventListener('click', () => {
    if (siguiente.hidden) return;
    siguiente.hidden = true;
    dialogo.classList.remove('con-boton');
    avanzar?.();
  });

  function pintarProgreso() {
    poner(progreso, pasos.map((paso, i) => el('li', { class: `bv-bandera ${i < indice ? 'hecho' : i === indice ? 'actual' : ''}` },
      dibujo(ICONOS_PASO[paso.icono], 'bv-bandera-icono'))));
    progreso.setAttribute('aria-label', t('bienvenida.paso', { n: indice + 1, total: pasos.length }));
    raiz.style.setProperty('--p', String(indice));
    raiz.style.setProperty('--pasos', String(pasos.length - 1));
  }

  /** Pasar al paso i: lo de ahora se va, la tutora camina (y la academia se acerca) y llega lo nuevo. */
  async function ir(i) {
    if (!encendida) return;
    indice = i;
    avanzar = () => ir(i + 1);
    escribiendo?.acabar();
    siguiente.hidden = true;
    siguiente.classList.remove('bv-listo');
    dialogo.classList.remove('con-boton');
    if (!quieto) {
      escena.classList.add('se-va');
      await espera(220);
      if (!encendida) return;
    }
    poner(escena);
    poner(texto);
    escena.className = 'bv-escena';
    pintarProgreso();
    if (!quieto) {
      raiz.classList.add('camina');
      sprite.andando = true;
      spriteMini.andando = true;
      sonar('paso');
      await espera(PASEO);
      sprite.andando = false;
      spriteMini.andando = false;
      raiz.classList.remove('camina');
      if (!encendida) return;
      escena.classList.add('llega');
      espera(500).then(() => escena.classList.remove('llega'));
    }
    pasos[i]();
  }

  function terminar(destino) {
    marcarVista();
    sonar('pagina');
    location.hash = destino;
  }
  saltar.addEventListener('click', () => terminar('#/lecciones'));

  /** El cartel de madera del camino, clavado en dos postes. */
  const cartel = (...hijos) => el('div', { class: 'bv-cartel' }, el('div', { class: 'bv-cartel-tabla' }, hijos), el('span', { class: 'bv-cartel-postes', 'aria-hidden': 'true' }));

  // La frase, con sus palabras tocables. alTocar(entrada, boton) se llama con cada una.
  function fraseTocable(alTocar) {
    const botones = [];
    const nodos = [];
    for (const trozo of ejemplo.trozos) {
      if (!vale(trozo.entrada)) {
        // la puntuación que va pegada a una palabra no se queda sola al principio de la línea
        const pegada = trozo.texto.match(/^[.,;:!?…»)」。、！？]+/u)?.[0];
        const anterior = nodos[nodos.length - 1];
        if (pegada && anterior instanceof HTMLElement) {
          nodos[nodos.length - 1] = el('span', { class: 'bv-junto' }, anterior, pegada);
          if (trozo.texto.length > pegada.length) nodos.push(trozo.texto.slice(pegada.length));
        } else nodos.push(trozo.texto);
        continue;
      }
      const boton = el('button', { type: 'button', class: 'bv-palabra', onclick: () => alTocar?.(trozo.entrada, boton) }, trozo.texto);
      boton.disabled = !alTocar;
      botones.push({ boton, entrada: trozo.entrada });
      nodos.push(boton);
    }
    const linea = el('p', { class: 'bv-frase', lang: LANG }, nodos);
    return { linea, botones };
  }

  // 1. El carné de estudiante
  async function pasoNombre() {
    const inicial = el('span', { class: 'bv-carne-inicial' }, nombre() ? [...nombre().trim()][0].toUpperCase() : '?');
    const campo = el('input', { type: 'text', id: 'bv-nombre', class: 'bv-campo', maxlength: '40', autocomplete: 'nickname', placeholder: t('perfil.tuNombre'), value: nombre() });
    campo.addEventListener('input', () => { inicial.textContent = campo.value.trim() ? [...campo.value.trim()][0].toUpperCase() : '?'; });
    const sello = el('span', { class: 'bv-carne-sello', 'aria-hidden': 'true' }, el('b', {}, 'Paglot'), el('i', {}, '★'));
    const responder = async conNombre => {
      const dicho = conNombre ? campo.value.trim() : '';
      if (conNombre && !dicho) { campo.focus(); carne.classList.add('bv-tiembla'); espera(400).then(() => carne.classList.remove('bv-tiembla')); sonar('mal'); return; }
      if (dicho) cambiarNombre(dicho);
      inicial.textContent = dicho ? [...dicho][0].toUpperCase() : '★';
      campo.readOnly = true;
      botones.hidden = true;
      carne.classList.add('sellado');
      sonar('bien');
      espera(quieto ? 0 : 260).then(() => fx.confeti(...centroDe(sello), 22, 0.8));
      sprite.reaccionar('contenta', 1200);
      sprite.gesto('aplaudir');
      await decir(dicho ? t('bienvenida.nombre.encantada', { nombre: dicho }) : t('bienvenida.nombre.misterio'), 'contenta');
      listo();
    };
    const botones = el('div', { class: 'bv-botones' },
      el('button', { type: 'submit', class: 'es-boton' }, t('bienvenida.nombre.ok')),
      el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => responder(false) }, t('bienvenida.nombre.no')));
    const carne = el('form', { class: 'bv-carne', onsubmit: e => { e.preventDefault(); responder(true); } },
      el('header', { class: 'bv-carne-cabecera' },
        el('img', { src: 'assets/logo.svg', alt: '', width: 30, height: 30 }),
        el('span', { class: 'bv-carne-marca' }, 'Pa', el('b', {}, 'glot')),
        el('span', { class: 'bv-carne-titulo' }, t('bienvenida.carne.titulo'))),
      el('div', { class: 'bv-carne-cuerpo' },
        el('div', { class: 'bv-carne-foto', 'aria-hidden': 'true' }, inicial),
        el('div', { class: 'bv-carne-datos' },
          el('label', { for: 'bv-nombre', class: 'bv-carne-etiqueta' }, t('bienvenida.carne.nombre')),
          campo,
          el('p', { class: 'bv-carne-dato' }, el('span', { class: 'bv-carne-etiqueta' }, t('bienvenida.carne.curso')), el('span', {}, t('bienvenida.carne.idioma'))),
          el('p', { class: 'bv-carne-dato' }, el('span', { class: 'bv-carne-etiqueta' }, t('bienvenida.carne.tutora')), el('span', {}, t('tutora.nombrePropio'))))),
      el('span', { class: 'bv-carne-banda', 'aria-hidden': 'true' }),
      sello,
      botones);
    poner(escena, carne);
    await decir(t('bienvenida.nombre.pregunta'));
    if (window.matchMedia('(pointer: fine)').matches && !campo.readOnly) campo.focus({ preventScroll: true });
  }

  // 2. Tocar las palabras: la frase está en un cartel; cada palabra vista cuelga debajo en una etiqueta
  async function pasoToca() {
    const vistas = new Set();
    const glosas = el('ul', { class: 'bv-glosas' });
    const cuenta = el('p', { class: 'bv-cuenta', 'aria-live': 'polite' });
    const pintarCuenta = () => {
      poner(cuenta, pedidas.map(p => el('i', { class: vistas.has(p) ? 'vista' : '' })), el('span', { class: 'solo-lector' }, `${vistas.size} / ${pedidas.length}`));
    };
    const { linea, botones } = fraseTocable((entrada, boton) => {
      if (hayVoz()) pronunciar(entrada.es);
      boton.classList.add('vista');
      boton.classList.remove('pista');
      if (vistas.has(entrada)) { sonar('clic'); return; }
      vistas.add(entrada);
      sonar('voltear');
      sprite.reaccionar('contenta', 600);
      glosas.append(el('li', { class: 'bv-glosa' },
        el('strong', { lang: LANG }, entrada.es), el('span', {}, tr(entrada.trad)), entrada.pron && el('em', {}, entrada.pron)));
      pintarCuenta();
      const quedan = botones.find(b => pedidas.includes(b.entrada) && !vistas.has(b.entrada));
      if (quedan) { quedan.boton.classList.add('pista'); return; }
      if (pedidas.every(p => vistas.has(p)) && !cuenta.dataset.hecho) {
        cuenta.dataset.hecho = '1';
        sonar('bien');
        fx.confeti(...centroDe(linea), 22);
        sprite.gesto('pulgar');
        decir(t('bienvenida.toca.bien'), 'contenta').then(listo);
      }
    });
    botones.find(b => pedidas.includes(b.entrada))?.boton.classList.add('pista');
    pintarCuenta();
    poner(escena, cartel(linea, cuenta), glosas);
    await decir(t('bienvenida.toca.pide'));
  }

  // 3. Pedir la explicación: se estampa el sello «?» y sale la traducción en una tira de papel
  async function pasoExplica() {
    const { linea } = fraseTocable(null);
    const traduccion = el('p', { class: 'bv-traduccion', hidden: true }, el('span', { class: 'bv-tinta', 'aria-hidden': 'true' }, '?'), el('span', {}, tr(ejemplo.frase.trad)));
    const sello = el('button', { type: 'button', class: 'bv-sello pista', 'aria-label': t('frase.explicar') },
      dibujo(SELLO, 'bv-sello-dibujo'), el('span', { class: 'bv-sello-signo', 'aria-hidden': 'true' }, '?'));
    sello.addEventListener('click', async () => {
      if (sello.disabled) return;
      sello.disabled = true;
      sello.classList.remove('pista');
      sello.classList.add('estampa');
      sonar('pagina');
      if (hayVoz()) pronunciar(ejemplo.frase.es);
      await espera(quieto ? 0 : 380);
      traduccion.hidden = false;
      fx.confeti(...centroDe(traduccion), 14, 0.6);
      sprite.gesto('pensar');
      await decir(t('frase.significa', { frase: ejemplo.frase.es, trad: tr(ejemplo.frase.trad) }), 'pensando');
      await espera(900);
      if (!encendida) return;
      sprite.gesto('guino');
      await decir(t('bienvenida.explica.bien'), 'contenta');
      listo();
    });
    poner(escena, el('div', { class: 'bv-con-sello' }, cartel(linea), sello), traduccion);
    await decir(t('bienvenida.explica.pide'));
  }

  // 4. Guardar una palabra: la estrella vuela hasta el cuaderno abierto
  async function pasoGuarda() {
    const contador = el('span', { class: 'bv-contador' }, '0');
    const cuaderno = el('div', { class: 'bv-cuaderno' },
      dibujo(CUADERNO, 'bv-cuaderno-dibujo'),
      el('span', { class: 'bv-cuaderno-nombre' }, icono('cuaderno', 'icono'), t('menu.cuaderno'), contador));
    const boton = el('button', { type: 'button', class: 'bv-estrella pista', 'aria-label': t('comun.guardarEn', { texto: estrella.es }) }, icono('estrella', 'icono'));
    boton.addEventListener('click', () => {
      if (boton.disabled) return;
      boton.disabled = true;
      boton.classList.remove('pista');
      boton.replaceChildren(icono('estrellaLlena', 'icono'));
      sonar('guardar');
      if (!estaEnCuaderno(estrella.es)) {
        guardarEnCuaderno({
          es: estrella.es, trad: estrella.trad, pron: estrella.pron, nota: estrella.nota || estrella.consejo, tipo: estrella.es.includes(' ') ? 'frase' : 'palabra',
          origen: origenTarjeta('cuaderno.deLeccion', { id: ejemplo.leccion.numero_curso, titulo: ejemplo.leccion.titulo_es }),
        });
        window.dispatchEvent(new CustomEvent('cuaderno-cambiado', { detail: null }));
      }
      let llegada = false;
      const llegar = () => {
        if (llegada || !encendida) return;
        llegada = true;
        contador.textContent = '1';
        cuaderno.classList.add('bv-bote');
        sonar('bien');
        fx.confeti(...centroDe(cuaderno), 24);
        sprite.reaccionar('contenta', 1200);
        sprite.gesto('aplaudir');
        decir(t('bienvenida.guarda.bien'), 'contenta').then(listo);
      };
      if (quieto) { llegar(); return; }
      // La estrella sale del botón y vuela en arco hasta el cuaderno, dejando un rastro de chispas.
      const [x0, y0] = centroDe(boton);
      const [x1, y1] = centroDe(cuaderno);
      const vuela = el('span', { class: 'bv-vuela', 'aria-hidden': 'true' }, icono('estrellaLlena', 'icono'));
      raiz.append(vuela);
      const inicio = performance.now();
      const dura = 750;
      const alto = Math.min(y0, y1) - 120;
      const volar = ahora => {
        if (!encendida) { vuela.remove(); return; }
        const p = Math.min(1, (ahora - inicio) / dura);
        const s = p * p * (3 - 2 * p); // sale despacio y llega despacio
        const x = (1 - s) ** 2 * x0 + 2 * (1 - s) * s * ((x0 + x1) / 2) + s ** 2 * x1;
        const y = (1 - s) ** 2 * y0 + 2 * (1 - s) * s * alto + s ** 2 * y1;
        vuela.style.transform = `translate(${Math.round(x / 2) * 2}px, ${Math.round(y / 2) * 2}px) rotate(${Math.round(p * 8) * 45}deg)`;
        if (Math.random() < 0.5) fx.confeti(x, y, 1, 0.25);
        if (p < 1) requestAnimationFrame(volar);
        else { vuela.remove(); llegar(); }
      };
      requestAnimationFrame(volar);
      espera(dura + 700).then(() => { vuela.remove(); llegar(); }); // por si el navegador no está animando
    });
    poner(escena, el('div', { class: 'bv-guarda' },
      cuaderno,
      cartel(el('div', { class: 'bv-ficha' },
        el('div', {}, el('p', { class: 'bv-ficha-palabra', lang: LANG }, estrella.es), el('p', { class: 'bv-ficha-trad' }, tr(estrella.trad))),
        boton))));
    await decir(t('bienvenida.guarda.pide'));
  }

  // 5. Una pregunta en un poste de cruce: cada flecha es una respuesta; si se falla, vuelve
  async function pasoPrueba() {
    const correcta = tr(estrella.trad);
    const otras = barajar([...ejemplo.leccion.palabras.values()].filter(v => vale(v) && tr(v.trad) !== correcta)).slice(0, 2).map(v => tr(v.trad));
    const flechas = el('div', { class: 'bv-flechas' });
    const preguntar = () => {
      poner(flechas, barajar([correcta, ...otras]).map((opcion, i) => el('button', {
        type: 'button', class: `bv-flecha ${i % 2 ? 'a-la-izquierda' : ''}`,
        onclick: async e => {
          const pulsado = e.currentTarget;
          for (const b of flechas.children) b.disabled = true;
          if (opcion === correcta) {
            pulsado.classList.add('bv-acierto');
            sonar('fin');
            fx.confeti(...centroDe(pulsado), 40, 1.2);
            sprite.reaccionar('contenta', 1500);
            sprite.gesto('celebrar');
            await decir(t('bienvenida.prueba.bien'), 'contenta');
            listo();
          } else {
            pulsado.classList.add('bv-fallo', 'bv-tiembla');
            sonar('mal');
            sprite.reaccionar('apurada', 1200);
            sprite.gesto('rascarse');
            await decir(t('bienvenida.prueba.mal'), 'apurada');
            await espera(700);
            if (encendida) { sonar('voltear'); preguntar(); }
          }
        },
      }, el('span', {}, opcion))));
    };
    preguntar();
    poner(escena, el('div', { class: 'bv-poste' },
      el('p', { class: 'bv-poste-cartel bv-frase', lang: LANG }, estrella.es),
      flechas,
      el('span', { class: 'bv-poste-palo', 'aria-hidden': 'true' })));
    if (hayVoz()) pronunciar(estrella.es);
    await decir(t('bienvenida.prueba.pide', { palabra: estrella.es }));
  }

  // 6. Final: la pancarta delante de la academia y fuegos artificiales
  async function pasoFin() {
    marcarVista();
    saltar.hidden = true;
    raiz.classList.add('final');
    const quien = nombre();
    const empezar = el('button', { type: 'button', class: 'es-boton es-boton-grande', onclick: () => terminar(primera ? `#/leccion/${primera}` : '#/lecciones') }, t('bienvenida.fin.empezar'));
    poner(escena,
      el('div', { class: 'bv-pancarta' },
        el('span', { class: 'bv-pancarta-palos', 'aria-hidden': 'true' }),
        el('h1', { class: 'bv-titulo' }, quien ? t('bienvenida.fin.tituloNombre', { nombre: quien }) : t('bienvenida.fin.titulo')),
        el('span', { class: 'bv-banderines', 'aria-hidden': 'true' })),
      el('div', { class: 'bv-botones' },
        empezar,
        el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => terminar('#/lecciones') }, t('bienvenida.fin.lecciones'))));
    sonar('paso');
    sprite.reaccionar('contenta', 1800);
    sprite.gesto('celebrar');
    // Fuegos artificiales: varias tandas de confeti por el cielo.
    const caja = raiz.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      espera(i * 300).then(() => encendida && fx.confeti(caja.left + caja.width * (0.12 + Math.random() * 0.76), caja.top + caja.height * (0.12 + Math.random() * 0.3), 30, 1.1));
    }
    await decir(t('bienvenida.fin.dice'), 'contenta');
    empezar.classList.add('bv-listo');
    empezar.focus({ preventScroll: true });
  }

  // Sin frase de ejemplo (curso sin diálogos al principio) no hay paso de explicación; sin palabras, solo nombre y final.
  pasoNombre.icono = 'nombre';
  pasoToca.icono = 'toca';
  pasoExplica.icono = 'explica';
  pasoGuarda.icono = 'guarda';
  pasoPrueba.icono = 'prueba';
  pasoFin.icono = 'fin';
  const pasos = [pasoNombre];
  if (pedidas.length) pasos.push(pasoToca);
  if (ejemplo?.frase) pasos.push(pasoExplica);
  if (estrella) pasos.push(pasoGuarda, pasoPrueba);
  pasos.push(pasoFin);

  // ----- Arranque: la tutora llega andando por el camino y empieza -----
  pintarProgreso();
  avanzar = () => ir(1);
  (async () => {
    if (!quieto) {
      tutora.classList.add('bv-entra');
      sprite.andando = true;
      await espera(1150);
      sprite.andando = false;
      tutora.classList.remove('bv-entra');
      if (!encendida) return;
      sprite.reaccionar('contenta', 900);
      sprite.gesto('saludar');
      sonar('saludo');
    }
    pasoNombre();
  })();

  return () => {
    encendida = false;
    escribiendo = null;
    for (const r of relojes) clearTimeout(r);
    for (const f of apagar) f();
  };
}
