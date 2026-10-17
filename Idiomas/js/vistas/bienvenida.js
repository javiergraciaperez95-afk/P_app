// Bienvenida (#/bienvenida): la primera vez, la tutora del curso enseña la app en un minuto.
// No es un vídeo ni unas diapositivas: cada cosa se hace de verdad, con una frase real del curso elegido.
//   1. dices cómo te llamas          4. guardas una palabra (la estrella vuela al cuaderno, y se guarda de verdad)
//   2. tocas palabras de una frase   5. respondes una pregunta (si fallas, vuelve)
//   3. pides que te la explique      6. y a la primera lección
// Ocupa toda la pantalla y nunca hay que desplazar. Dos lienzos dan vida a la escena: uno de fondo (motas que
// suben) y otro por delante (el fundido de píxeles entre pasos y el confeti).
// Los textos están en i18n/ (claves «bienvenida.*»).

import { el, poner, enLinea, barajar } from '../dom.js';
import { t, tr, tTodos } from '../i18n.js';
import { icono } from '../iconos.js';
import { curso, LANG } from '../curso.js';
import { crearSprite } from '../tutor-sprite.js';
import { sonar, pitidoVoz, pronunciar, hayVoz } from '../sonidos.js';
import { nombre, cambiarNombre, estaEnCuaderno, guardarEnCuaderno } from '../progress.js';
import { analizarFrase } from './leccion.js';

const CLAVE_VISTA = 'idiomas-bienvenida-vista';
const LETRA = 24;      // milisegundos por letra al escribir
const CELDA = 32;      // lado de los cuadros del fundido entre pasos
const MAX_PALABRAS = 3; // palabras que hay que tocar en la frase

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
// Los dos lienzos
// ---------------------------------------------------------------------------

const color = variable => getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#888';

/** Fondo: motas cuadradas que suben despacio y parpadean. Devuelve la función que lo para. */
export function fondoVivo(lienzo, quieto) {
  const ctx = lienzo.getContext('2d');
  let motas = [];
  let ultimo = 0;
  let cuadro = null;
  const tonos = () => [color('--fondo-punto'), color('--panel-hover'), color('--marca-oro'), color('--texto-suave')];
  let paleta = tonos();

  function ajustar() {
    lienzo.width = lienzo.clientWidth;
    lienzo.height = lienzo.clientHeight;
    const cuantas = Math.round((lienzo.width * lienzo.height) / 16000);
    motas = Array.from({ length: cuantas }, () => ({
      x: Math.random() * lienzo.width, y: Math.random() * lienzo.height,
      lado: Math.random() < 0.25 ? 6 : 4, v: 4 + Math.random() * 10, fase: Math.random() * 6.3,
      tono: Math.random() < 0.12 ? 2 : Math.floor(Math.random() * 2) + (Math.random() < 0.15 ? 2 : 0),
    }));
    pintar(0);
  }

  function pintar(dt) {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    for (const m of motas) {
      m.y -= m.v * dt;
      m.fase += dt * 1.6;
      if (m.y < -8) { m.y = lienzo.height + 8; m.x = Math.random() * lienzo.width; }
      ctx.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(m.fase));
      ctx.fillStyle = paleta[m.tono % paleta.length];
      ctx.fillRect(Math.round(m.x / 2) * 2, Math.round(m.y / 2) * 2, m.lado, m.lado);
    }
    ctx.globalAlpha = 1;
  }

  function fotograma(ahora) {
    cuadro = requestAnimationFrame(fotograma);
    if (ahora - ultimo < 66) return; // unos 15 por segundo: se mueve a saltitos, como todo aquí
    const dt = Math.min(0.2, (ahora - ultimo) / 1000);
    ultimo = ahora;
    pintar(dt);
  }

  const alCambiarTema = () => { paleta = tonos(); pintar(0); };
  window.addEventListener('resize', ajustar);
  window.addEventListener('tema-cambiado', alCambiarTema);
  ajustar();
  if (!quieto) cuadro = requestAnimationFrame(fotograma);
  return () => {
    cancelAnimationFrame(cuadro);
    window.removeEventListener('resize', ajustar);
    window.removeEventListener('tema-cambiado', alCambiarTema);
  };
}

/** Primer plano: el fundido de cuadros entre pasos y el confeti. */
export function efectos(lienzo, quieto) {
  const ctx = lienzo.getContext('2d');
  let confeti = [];
  let cortina = null; // { orden, columnas, hasta, tapando, inicio, dura, alAcabar }
  let cuadro = null;
  let ultimo = 0;
  let parado = false;

  const ajustar = () => { lienzo.width = lienzo.clientWidth; lienzo.height = lienzo.clientHeight; };
  ajustar();
  window.addEventListener('resize', ajustar);

  function arrancar() {
    if (cuadro === null && !parado) { ultimo = performance.now(); cuadro = requestAnimationFrame(fotograma); }
  }

  function fotograma(ahora) {
    cuadro = null;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    if (cortina) {
      const avance = Math.min(1, (ahora - cortina.inicio) / cortina.dura);
      const hasta = Math.round(avance * cortina.orden.length);
      const [desde, fin] = cortina.tapando ? [0, hasta] : [hasta, cortina.orden.length];
      for (let i = desde; i < fin; i++) {
        const celda = cortina.orden[i];
        ctx.fillStyle = cortina.tonos[celda % 7 === 0 ? 1 : 0];
        ctx.fillRect((celda % cortina.columnas) * CELDA, Math.floor(celda / cortina.columnas) * CELDA, CELDA, CELDA);
      }
      if (avance >= 1) {
        const { alAcabar } = cortina;
        if (cortina.tapando) {
          cortina = { ...cortina, tapando: false, inicio: ahora, alAcabar: cortina.alDestapar };
          alAcabar();
        } else {
          cortina = null;
          alAcabar();
        }
      }
    }

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
    if (cortina || confeti.length) arrancar();
  }

  return {
    /** Tapa la pantalla con cuadros (en diagonal y a trompicones), llama a «cambiar» y la destapa. */
    fundido(cambiar) {
      return new Promise(resolver => {
        if (quieto || parado || !lienzo.width) { cambiar(); resolver(); return; }
        const columnas = Math.ceil(lienzo.width / CELDA);
        const filas = Math.ceil(lienzo.height / CELDA);
        const orden = Array.from({ length: columnas * filas }, (_, i) => i)
          .map(i => ({ i, peso: ((i % columnas) + Math.floor(i / columnas)) / (columnas + filas) + Math.random() * 0.3 }))
          .sort((a, b) => a.peso - b.peso).map(x => x.i);
        // Cada mitad se hace una sola vez, la dispare la animación o el reloj de seguridad
        // (con la pestaña en segundo plano el navegador no anima, y la bienvenida no debe quedarse tapada).
        let cambiado = false;
        let resuelto = false;
        const cambiarUnaVez = () => { if (!cambiado) { cambiado = true; cambiar(); } };
        const resolverUnaVez = () => { if (!resuelto) { resuelto = true; resolver(); } };
        cortina = {
          orden, columnas, tapando: true, inicio: performance.now(), dura: 260,
          tonos: [color('--fondo'), color('--panel-2')], alAcabar: cambiarUnaVez, alDestapar: resolverUnaVez,
        };
        arrancar();
        setTimeout(() => {
          if (resuelto) return;
          cortina = null;
          ctx.clearRect(0, 0, lienzo.width, lienzo.height);
          cambiarUnaVez();
          resolverUnaVez();
        }, 1200);
      });
    },
    /** Una explosión de cuadraditos desde un punto de la pantalla. */
    confeti(x, y, cuantos = 26, fuerza = 1) {
      if (quieto || parado) return;
      const caja = lienzo.getBoundingClientRect();
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

  const ejemplo = elegirEjemplo(resultados);
  const primera = resultados.find(r => !r.error)?.id ?? null;
  // Las palabras con ficha de la frase, sin repetir, y las que hay que tocar.
  const fichas = [];
  for (const trozo of ejemplo?.trozos ?? []) {
    if (vale(trozo.entrada) && !fichas.includes(trozo.entrada)) fichas.push(trozo.entrada);
  }
  const pedidas = fichas.slice(0, MAX_PALABRAS);
  const estrella = pedidas[0] ?? null; // la palabra que se guarda y la que luego se pregunta

  // ----- El escenario -----
  const lienzoFondo = el('canvas', { class: 'bv-fondo', 'aria-hidden': 'true' });
  const lienzoEfectos = el('canvas', { class: 'bv-efectos', 'aria-hidden': 'true' });
  const progreso = el('ol', { class: 'bv-progreso' });
  const escena = el('div', { class: 'bv-escena' });
  const texto = el('p', { class: 'bv-texto', 'aria-hidden': 'true' });
  const lector = el('p', { class: 'solo-lector', 'aria-live': 'polite' });
  const siguiente = el('button', { type: 'button', class: 'boton boton-principal bv-siguiente', hidden: true }, t('tutora.siguiente'));
  const canvas = el('canvas', { class: 'bv-tutora-dibujo', width: 48, height: 64, role: 'img', 'aria-label': t('tutora.nombre') });
  const tutora = el('button', { type: 'button', class: 'bv-tutora', 'aria-label': t('tutora.tocar') }, el('span', { class: 'sobre-salto' }, canvas));
  const dialogo = el('div', { class: 'bv-dialogo caja' },
    tutora,
    el('p', { class: 'tutora-nombre' }, t('tutora.nombrePropio')),
    texto, lector,
    el('div', { class: 'bv-dialogo-pie' }, siguiente));
  const saltar = el('button', { type: 'button', class: 'boton boton-mini bv-saltar' }, t('bienvenida.saltar'), ' ✕');
  const raiz = el('section', { class: 'bienvenida', 'aria-label': t('bienvenida.titulo') },
    lienzoFondo,
    el('header', { class: 'bv-barra' }, progreso, saltar),
    escena,
    dialogo,
    lienzoEfectos);
  poner(contenedor, raiz);

  apagar.push(fondoVivo(lienzoFondo, quieto));
  const fx = efectos(lienzoEfectos, quieto);
  apagar.push(() => fx.parar());

  const sprite = crearSprite(canvas);
  apagar.push(() => sprite.parar?.());
  tutora.addEventListener('click', () => { sonar('saludo'); sprite.reaccionar('cosquillas', 900); });

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
    return new Promise(resolver => {
      let n = 0;
      let reloj = null;
      const acabar = () => {
        if (!escribiendo || escribiendo.acabar !== acabar) return;
        clearInterval(reloj);
        escribiendo = null;
        sprite.hablando = false;
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
    siguiente.focus({ preventScroll: true });
  }
  siguiente.addEventListener('click', () => {
    if (siguiente.hidden) return;
    siguiente.hidden = true;
    avanzar?.();
  });

  function pintarProgreso() {
    poner(progreso, pasos.map((_, i) => el('li', { class: i < indice ? 'hecho' : i === indice ? 'actual' : '' })));
    progreso.setAttribute('aria-label', t('bienvenida.paso', { n: indice + 1, total: pasos.length }));
  }

  async function ir(i) {
    if (!encendida) return;
    indice = i;
    avanzar = () => ir(i + 1);
    await fx.fundido(() => {
      escribiendo?.acabar();
      poner(escena);
      poner(texto);
      siguiente.hidden = true;
      siguiente.classList.remove('bv-listo');
      escena.className = 'bv-escena';
      pintarProgreso();
    });
    if (encendida) pasos[i]();
  }

  function terminar(destino) {
    marcarVista();
    sonar('pagina');
    location.hash = destino;
  }
  saltar.addEventListener('click', () => terminar('#/lecciones'));

  // La frase, con sus palabras tocables. alTocar(entrada, boton) se llama con cada una.
  function fraseTocable(alTocar) {
    const botones = [];
    const linea = el('p', { class: 'bv-frase', lang: LANG }, ejemplo.trozos.map(trozo => {
      if (!vale(trozo.entrada)) return trozo.texto;
      const boton = el('button', { type: 'button', class: 'bv-palabra', onclick: () => alTocar?.(trozo.entrada, boton) }, trozo.texto);
      boton.disabled = !alTocar;
      botones.push({ boton, entrada: trozo.entrada });
      return boton;
    }));
    return { linea, botones };
  }

  // 1. El nombre
  async function pasoNombre() {
    const campo = el('input', { type: 'text', class: 'bv-campo', maxlength: '40', autocomplete: 'nickname', placeholder: t('perfil.tuNombre'), 'aria-label': t('perfil.tuNombre'), value: nombre() });
    const responder = async conNombre => {
      const dicho = conNombre ? campo.value.trim() : '';
      if (conNombre && !dicho) { campo.focus(); formulario.classList.add('bv-tiembla'); setTimeout(() => formulario.classList.remove('bv-tiembla'), 400); sonar('mal'); return; }
      if (dicho) cambiarNombre(dicho);
      formulario.hidden = true;
      sonar('bien');
      fx.confeti(...centroDe(tutora), 18, 0.7);
      sprite.reaccionar('contenta', 1200);
      await decir(dicho ? t('bienvenida.nombre.encantada', { nombre: dicho }) : t('bienvenida.nombre.misterio'), 'contenta');
      listo();
    };
    const formulario = el('form', { class: 'bv-nombre', onsubmit: e => { e.preventDefault(); responder(true); } },
      campo,
      el('div', { class: 'bv-botones' },
        el('button', { type: 'submit', class: 'boton boton-principal' }, t('bienvenida.nombre.ok')),
        el('button', { type: 'button', class: 'boton boton-mini', onclick: () => responder(false) }, t('bienvenida.nombre.no'))));
    poner(escena,
      el('img', { class: 'bv-logo', src: 'assets/logo.svg', alt: '', width: 96, height: 96 }),
      el('p', { class: 'bv-marca', 'aria-hidden': 'true' }, 'Pa', el('span', {}, 'glot')),
      formulario);
    await decir(t('bienvenida.nombre.pregunta'));
    if (window.matchMedia('(pointer: fine)').matches) campo.focus({ preventScroll: true });
  }

  // 2. Tocar las palabras
  async function pasoToca() {
    const vistas = new Set();
    const glosas = el('ul', { class: 'bv-glosas' });
    const cuenta = el('p', { class: 'bv-cuenta' });
    const pintarCuenta = () => { cuenta.textContent = `${vistas.size} / ${pedidas.length}`; };
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
        decir(t('bienvenida.toca.bien'), 'contenta').then(listo);
      }
    });
    botones.find(b => pedidas.includes(b.entrada))?.boton.classList.add('pista');
    pintarCuenta();
    poner(escena, linea, cuenta, glosas);
    await decir(t('bienvenida.toca.pide'));
  }

  // 3. Pedir la explicación de la frase
  async function pasoExplica() {
    const { linea } = fraseTocable(null);
    const traduccion = el('p', { class: 'bv-traduccion', hidden: true }, tr(ejemplo.frase.trad));
    const sello = el('button', { type: 'button', class: 'bv-sello pista', 'aria-label': t('frase.explicar') }, '?');
    sello.addEventListener('click', async () => {
      if (sello.disabled) return;
      sello.disabled = true;
      sello.classList.remove('pista');
      sonar('pagina');
      if (hayVoz()) pronunciar(ejemplo.frase.es);
      traduccion.hidden = false;
      sprite.reaccionar('pensando', 1200);
      await decir(t('frase.significa', { frase: ejemplo.frase.es, trad: tr(ejemplo.frase.trad) }), 'pensando');
      await espera(900);
      if (!encendida) return;
      await decir(t('bienvenida.explica.bien'), 'contenta');
      listo();
    });
    poner(escena, el('div', { class: 'bv-con-sello' }, linea, sello), traduccion);
    await decir(t('bienvenida.explica.pide'));
  }

  // 4. Guardar una palabra: la estrella vuela hasta el cuaderno
  async function pasoGuarda() {
    const contador = el('span', { class: 'bv-contador' }, '0');
    const cuaderno = el('div', { class: 'bv-cuaderno' }, icono('cuaderno', 'icono bv-cuaderno-icono'), el('span', {}, t('menu.cuaderno')), contador);
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
          origen: tTodos('cuaderno.deLeccion', { id: ejemplo.leccion.numero_curso, titulo: ejemplo.leccion.titulo_es }),
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
      const alto = Math.min(y0, y1) - 110;
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
    poner(escena,
      cuaderno,
      el('div', { class: 'bv-ficha caja' },
        el('div', {}, el('p', { class: 'bv-ficha-palabra', lang: LANG }, estrella.es), el('p', { class: 'bv-ficha-trad' }, tr(estrella.trad))),
        boton));
    await decir(t('bienvenida.guarda.pide'));
  }

  // 5. Una pregunta: si se falla, vuelve
  async function pasoPrueba() {
    const correcta = tr(estrella.trad);
    const otras = barajar([...ejemplo.leccion.palabras.values()].filter(v => vale(v) && tr(v.trad) !== correcta)).slice(0, 2).map(v => tr(v.trad));
    const opciones = el('div', { class: 'bv-opciones' });
    const preguntar = () => {
      poner(opciones, barajar([correcta, ...otras]).map(opcion => el('button', {
        type: 'button', class: 'boton bv-opcion',
        onclick: async e => {
          const pulsado = e.currentTarget;
          for (const b of opciones.children) b.disabled = true;
          if (opcion === correcta) {
            pulsado.classList.add('bv-acierto');
            sonar('fin');
            fx.confeti(...centroDe(pulsado), 40, 1.2);
            sprite.reaccionar('contenta', 1500);
            await decir(t('bienvenida.prueba.bien'), 'contenta');
            listo();
          } else {
            pulsado.classList.add('bv-fallo', 'bv-tiembla');
            sonar('mal');
            sprite.reaccionar('apurada', 1200);
            await decir(t('bienvenida.prueba.mal'), 'apurada');
            await espera(700);
            if (encendida) { sonar('voltear'); preguntar(); }
          }
        },
      }, opcion)));
    };
    preguntar();
    poner(escena, el('p', { class: 'bv-frase bv-pregunta', lang: LANG }, estrella.es), opciones);
    if (hayVoz()) pronunciar(estrella.es);
    await decir(t('bienvenida.prueba.pide', { palabra: estrella.es }));
  }

  // 6. Final
  async function pasoFin() {
    marcarVista();
    saltar.hidden = true;
    const quien = nombre();
    const empezar = el('button', { type: 'button', class: 'boton boton-principal boton-grande', onclick: () => terminar(primera ? `#/leccion/${primera}` : '#/lecciones') }, t('bienvenida.fin.empezar'));
    poner(escena,
      el('img', { class: 'bv-logo bv-logo-fin', src: 'assets/logo.svg', alt: '', width: 96, height: 96 }),
      el('h1', { class: 'bv-titulo' }, quien ? t('bienvenida.fin.tituloNombre', { nombre: quien }) : t('bienvenida.fin.titulo')),
      el('div', { class: 'bv-botones' },
        empezar,
        el('button', { type: 'button', class: 'boton', onclick: () => terminar('#/lecciones') }, t('bienvenida.fin.lecciones'))));
    sonar('paso');
    sprite.reaccionar('contenta', 1800);
    // Fuegos artificiales: varias tandas de confeti por la pantalla.
    const caja = raiz.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      espera(i * 260).then(() => encendida && fx.confeti(caja.left + caja.width * (0.15 + Math.random() * 0.7), caja.top + caja.height * (0.15 + Math.random() * 0.35), 30, 1.1));
    }
    await decir(t('bienvenida.fin.dice'), 'contenta');
    empezar.classList.add('bv-listo');
    empezar.focus({ preventScroll: true });
  }

  // Sin frase de ejemplo (curso sin diálogos al principio) no hay paso de explicación; sin palabras, solo nombre y final.
  const pasos = [pasoNombre];
  if (pedidas.length) pasos.push(pasoToca);
  if (ejemplo?.frase) pasos.push(pasoExplica);
  if (estrella) pasos.push(pasoGuarda, pasoPrueba);
  pasos.push(pasoFin);

  // ----- Arranque: la tutora entra andando y empieza -----
  pintarProgreso();
  avanzar = () => ir(1);
  (async () => {
    if (!quieto) {
      tutora.classList.add('bv-entra', 'anda');
      await espera(1150);
      tutora.classList.remove('bv-entra', 'anda');
      if (!encendida) return;
      sprite.reaccionar('contenta', 900);
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
