// En el móvil las páginas de la web no se desplazan: el contenido se reparte en páginas del alto de la pantalla.
// Se buscan los bloques (bajando por dentro de los que son más altos que una página), se agrupan por su posición
// real y solo se enseñan los de la página actual; lo demás queda en display: none, así que sus animaciones no gastan.
// Si una página no cabe del todo, se encoge lo justo. Se pasa con la barra de abajo (◀ ● ▶), las flechas del teclado
// o deslizando el dedo de lado. Estilos en css/escenas.css (.pm-*).
import { el, poner } from './dom.js';
import { sonar } from './sonidos.js';

export const esMovil = () => window.matchMedia('(max-width: 700px)').matches;

const ENCOGER_MIN = 0.5;

/** Pagina el contenido de `app` (la vista ya pintada). Devuelve la función que lo deshace. */
export function paginarEnMovil(app) {
  // la vista suele ser un solo bloque; si son varios (título + secciones, como el perfil), se reparte la vista entera
  const raiz = app.childElementCount > 1 ? app : app.firstElementChild;
  if (!raiz) return () => {};
  document.documentElement.classList.add('pm-activo');
  let paginas = [];
  let actual = 0;
  let vivo = true;
  const nav = el('nav', { class: 'pm-nav', 'aria-label': 'Páginas' },
    el('button', { type: 'button', class: 'pm-atras', 'aria-label': '◀', onclick: () => ir(actual - 1) }, '◀'),
    el('span', { class: 'pm-puntos', 'aria-hidden': 'true' }),
    el('button', { type: 'button', class: 'pm-alante', 'aria-label': '▶', onclick: () => ir(actual + 1) }, '▶'));
  document.body.append(nav);

  const enFlujo = k => {
    const e = getComputedStyle(k);
    return e.display !== 'none' && e.position !== 'absolute' && e.position !== 'fixed' && k.offsetHeight > 0 && !k.matches('dialog, template, script, style');
  };
  // lo que la tutora flotante (con su bocadillo) asoma por encima de la barra de abajo: ese hueco no es de la página
  const tutora = document.querySelector('.tutora');
  const huecoTutora = () => {
    if (!tutora || document.body.matches('.tutora-oculta, .sin-tutora') || !tutora.offsetHeight) return 0;
    const borde = nav.hidden ? window.innerHeight : nav.getBoundingClientRect().top;
    return Math.max(0, borde - tutora.getBoundingClientRect().top + 6);
  };
  // el sitio que hay para una página: la pantalla menos la cabecera, la barra de abajo y la tutora
  const sitio = () => window.innerHeight - app.getBoundingClientRect().top - window.scrollY - nav.offsetHeight - 8 - huecoTutora();

  // lo decorativo (escondido a los lectores, o sin texto ni nada que pulsar) no es un bloque: se queda con su
  // contenedor y se estira con él (una escalera dibujada, un hueco, una tutora de adorno)
  const SUSTANCIA = 'img, svg, canvas, video, input, textarea, select, button, a, iframe';
  const decorado = k => k.getAttribute('aria-hidden') === 'true'
    || (!k.textContent.trim() && !k.matches(SUSTANCIA) && !k.querySelector(SUSTANCIA))
    || ([...k.children].length > 0 && !k.textContent.trim() && [...k.children].every(h => !enFlujo(h) || decorado(h)));

  const adornos = new Set();
  function bloquesDe(nodo, alto, lista) {
    for (const k of nodo.children) {
      if (getComputedStyle(k).display === 'contents') { bloquesDe(k, alto, lista); continue; } // no tiene caja: se mira dentro
      if (!enFlujo(k)) continue;
      if (decorado(k)) { adornos.add(k); lista.push(k); continue; }
      const hijos = [...k.children].filter(enFlujo);
      if (k.offsetHeight > alto * 0.85 && hijos.length) bloquesDe(k, alto, lista);
      else lista.push(k);
    }
    return lista;
  }

  function limpiar() {
    raiz.style.zoom = '';
    for (const k of raiz.querySelectorAll('.pm-oculto')) k.classList.remove('pm-oculto');
  }

  function repartir() {
    if (!vivo) return;
    const guardado = paginas[actual]?.bloques[0];
    limpiar();
    const alto = sitio();
    adornos.clear();
    const bloques = bloquesDe(raiz, alto, []);
    paginas = [];
    let pagina = null;
    let esperando = []; // un adorno va con el bloque que lo sigue, sin decidir dónde se corta
    for (const b of bloques) {
      if (adornos.has(b)) { esperando.push(b); continue; }
      // los adornos de otro contenedor se quedan en la página de antes
      const ajenos = esperando.filter(d => !d.parentElement.contains(b));
      if (ajenos.length && pagina) { pagina.bloques.push(...ajenos); esperando = esperando.filter(d => !ajenos.includes(d)); }
      const c = b.getBoundingClientRect();
      if (!pagina || (c.bottom - pagina.arriba > alto && pagina.bloques.length)) {
        pagina = { arriba: c.top, bloques: [] };
        paginas.push(pagina);
      }
      pagina.bloques.push(b, ...esperando);
      esperando = [];
    }
    if (esperando.length) { if (!pagina) paginas.push(pagina = { arriba: 0, bloques: [] }); pagina.bloques.push(...esperando); }
    // cada página sabe qué contenedores tiene que dejar a la vista
    for (const p of paginas) {
      p.vivos = new Set();
      for (const b of p.bloques) for (let n = b; n && n !== raiz; n = n.parentElement) p.vivos.add(n);
    }
    poner(nav.querySelector('.pm-puntos'), paginas.length > 12 ? el('b', {}) : paginas.map(() => el('i', {})));
    nav.hidden = paginas.length < 2;
    const vuelta = guardado ? paginas.findIndex(p => p.bloques.includes(guardado)) : -1;
    ir(vuelta >= 0 ? vuelta : Math.min(actual, paginas.length - 1), false);
  }

  function ir(n, conSonido = true) {
    if (!vivo || n < 0 || n >= paginas.length) return;
    if (conSonido && n !== actual) sonar('pagina');
    const sentido = n > actual ? 'der' : n < actual ? 'izq' : '';
    actual = n;
    const vivos = paginas[n].vivos;
    raiz.style.zoom = '';
    // se esconde todo lo que tiene bloques de otras páginas y no está en esta
    for (const p of paginas) for (const k of p.vivos) k.classList.toggle('pm-oculto', !vivos.has(k));
    window.scrollTo(0, 0);
    encoger();
    // la página nueva entra deslizándose desde el lado hacia el que se va (solo transform y opacity)
    if (sentido) {
      raiz.classList.remove('pm-entra-der', 'pm-entra-izq');
      void raiz.offsetWidth;
      raiz.classList.add(`pm-entra-${sentido}`);
    }
    const puntos = nav.querySelector('.pm-puntos');
    if (puntos.firstChild?.tagName === 'B') puntos.firstChild.textContent = `${n + 1} / ${paginas.length}`;
    else [...puntos.children].forEach((d, i) => d.classList.toggle('pm-ya', i === n));
    nav.querySelector('.pm-atras').disabled = n === 0;
    nav.querySelector('.pm-alante').disabled = n === paginas.length - 1;
  }

  // lo que ocupa de verdad la página ya puesta; si se pasa, se encoge todo lo de la vista
  function encoger() {
    const tope = window.innerHeight - nav.offsetHeight - 4 - huecoTutora();
    let zoom = 1;
    for (let vez = 0; vez < 4; vez++) {
      const abajo = Math.max(raiz.getBoundingClientRect().bottom, document.documentElement.scrollHeight - (nav.hidden ? 0 : nav.offsetHeight) - 4);
      const arriba = raiz.getBoundingClientRect().top;
      if (abajo <= tope + 1 || zoom <= ENCOGER_MIN) return;
      zoom = Math.max(ENCOGER_MIN, zoom * (tope - arriba) / (abajo - arriba));
      raiz.style.zoom = zoom.toFixed(3);
    }
  }

  // al pulsar algo que despliega o cambia de tamaño (una respuesta, una pestaña…), se vuelve a repartir
  let pendiente = 0;
  const luego = (ms = 60) => { clearTimeout(pendiente); pendiente = setTimeout(() => requestAnimationFrame(repartir), ms); };
  const alPulsar = () => luego(80);
  const alCambiar = () => { if (!document.activeElement?.matches('input, textarea, select')) luego(120); };
  const alTeclado = e => {
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight') ir(actual + 1);
    else if (e.key === 'ArrowLeft') ir(actual - 1);
  };
  let x0 = null;
  let y0 = 0;
  const alBajar = e => { x0 = e.clientX; y0 = e.clientY; };
  const alSubir = e => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) ir(actual + (dx < 0 ? 1 : -1));
  };
  app.addEventListener('click', alPulsar);
  // escribir en un buscador cambia lo que hay: se reparte cuando se deja de teclear
  const alEscribir = () => luego(250);
  app.addEventListener('input', alEscribir);
  app.addEventListener('pointerdown', alBajar);
  app.addEventListener('pointerup', alSubir);
  window.addEventListener('resize', alCambiar);
  window.addEventListener('keydown', alTeclado);
  document.fonts?.ready.then(() => luego(0));
  // si la tutora crece (su texto), se esconde o vuelve, cambia el sitio que queda
  let altoTutora = tutora?.offsetHeight ?? 0;
  const vigiaTutora = tutora && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
    if (Math.abs(tutora.offsetHeight - altoTutora) < 4) return;
    altoTutora = tutora.offsetHeight;
    luego(120);
  }) : null;
  vigiaTutora?.observe(tutora);
  // lo que se pinta un poco después (tutoras, imágenes, textos que llegan) cambia las medidas
  const tardes = [setTimeout(() => luego(0), 400), setTimeout(() => luego(0), 1500)];
  repartir();

  return () => {
    vivo = false;
    vigiaTutora?.disconnect();
    clearTimeout(pendiente);
    tardes.forEach(clearTimeout);
    app.removeEventListener('click', alPulsar);
    app.removeEventListener('input', alEscribir);
    app.removeEventListener('pointerdown', alBajar);
    app.removeEventListener('pointerup', alSubir);
    window.removeEventListener('resize', alCambiar);
    window.removeEventListener('keydown', alTeclado);
    limpiar();
    raiz.classList.remove('pm-entra-der', 'pm-entra-izq');
    nav.remove();
    document.documentElement.classList.remove('pm-activo');
  };
}
