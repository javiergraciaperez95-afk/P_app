// En el móvil las páginas de la web no se desplazan: el contenido se reparte en páginas del alto de la pantalla.
// Se buscan los bloques (bajando por dentro de los que son más altos que una página), se agrupan por su posición
// real y solo se enseñan los de la página actual; lo demás queda en display: none, así que sus animaciones no gastan.
// Si una página no cabe del todo, se encoge lo justo. Se pasa con la barra de abajo (◀ ● ▶), las flechas del teclado
// o deslizando el dedo de lado. Estilos en css/escenas.css (.pm-*).
import { el, poner } from './dom.js';
import { sonar } from './sonidos.js';
import { t } from './i18n.js';

export const esMovil = () => window.matchMedia('(max-width: 700px)').matches;

const ENCOGER_MIN = 0.5;

/** Pagina el contenido de `app` (la vista ya pintada). Devuelve la función que lo deshace.
 *  Con `fijas` (una función que da las páginas: un bloque o una lista de bloques cada una), cada página va entera, sin partirla: si no cabe,
 *  se encoge (así la portada son pocas diapositivas grandes en vez de muchos trocitos). */
export function paginarEnMovil(app, { fijas = null } = {}) {
  // la vista suele ser un solo bloque; si son varios (título + secciones, como el perfil), se reparte la vista entera
  const raiz = app.childElementCount > 1 ? app : app.firstElementChild;
  if (!raiz) return () => {};
  document.documentElement.classList.add('pm-activo');
  let paginas = [];
  let actual = 0;
  let vivo = true;
  const nav = el('nav', { class: 'pm-nav', 'aria-label': t('pm.diapositivas') },
    el('button', { type: 'button', class: 'pm-atras', 'aria-label': t('idi.anterior'), onclick: () => ir(actual - 1) }, '◀'),
    el('span', { class: 'pm-puntos', 'aria-hidden': 'true' }),
    el('button', { type: 'button', class: 'pm-alante', 'aria-label': t('idi.siguiente'), onclick: () => ir(actual + 1) }, '▶'));
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
    // el alto de una página, para que el CSS pueda llenar la pantalla en vez de dejar huecos (--pm-alto)
    document.documentElement.style.setProperty('--pm-alto', `${Math.floor(alto)}px`);
    adornos.clear();
    const bloques = fijas ? [] : bloquesDe(raiz, alto, []);
    paginas = fijas ? fijas().map(g => ({ arriba: 0, bloques: [].concat(g).filter(k => k && enFlujo(k)) })).filter(p => p.bloques.length) : [];
    let pagina = null;
    let esperando = []; // un adorno va con el bloque que lo sigue, sin decidir dónde se corta
    // Lo que añaden arriba y abajo los contenedores de un bloque (relleno y borde de su caja, de la caja de su caja…):
    // al enseñar solo unos bloques del medio, la caja sigue poniendo su relleno de arriba y de abajo. Sin contarlo, las
    // páginas salían unos píxeles más altas que la pantalla y se encogían (modo libro en un móvil de 322×645).
    const marcos = new Map();
    const marco = n => {
      if (!n || n === raiz.parentElement) return 0;
      if (!marcos.has(n)) {
        const e = getComputedStyle(n);
        marcos.set(n, parseFloat(e.paddingTop) + parseFloat(e.paddingBottom) + parseFloat(e.borderTopWidth) + parseFloat(e.borderBottomWidth)
          + marco(n.parentElement));
      }
      return marcos.get(n);
    };
    for (const b of bloques) {
      if (adornos.has(b)) { esperando.push(b); continue; }
      // los adornos de otro contenedor se quedan en la página de antes
      const ajenos = esperando.filter(d => !d.parentElement.contains(b));
      if (ajenos.length && pagina) { pagina.bloques.push(...ajenos); esperando = esperando.filter(d => !ajenos.includes(d)); }
      const c = b.getBoundingClientRect();
      if (!pagina || (c.bottom - pagina.arriba + marco(b.parentElement) > alto && pagina.bloques.length)) {
        pagina = { arriba: c.top, bloques: [] };
        paginas.push(pagina);
      }
      pagina.bloques.push(b, ...esperando);
      esperando = [];
    }
    if (esperando.length) { if (!pagina) paginas.push(pagina = { arriba: 0, bloques: [] }); pagina.bloques.push(...esperando); }
    // cada página sabe qué contenedores tiene que dejar a la vista
    for (const p of paginas) p.vivos = vivosDe(p.bloques);
    pintarPuntos();
    const vuelta = guardado ? paginas.findIndex(p => p.bloques.includes(guardado)) : -1;
    ir(vuelta >= 0 ? vuelta : Math.min(actual, paginas.length - 1), false);
  }

  function pintarPuntos() {
    poner(nav.querySelector('.pm-puntos'), paginas.length > 12 ? el('b', {}) : paginas.map(() => el('i', {})));
    nav.hidden = paginas.length < 2;
  }

  const vivosDe = bloques => {
    const vivos = new Set();
    for (const b of bloques) for (let n = b; n && n !== raiz; n = n.parentElement) vivos.add(n);
    return vivos;
  };

  // se esconde todo lo que tiene bloques de otras páginas y no está en esta
  function ensenar(n) {
    const vivos = paginas[n].vivos;
    raiz.style.zoom = '';
    for (const p of paginas) for (const k of p.vivos) k.classList.toggle('pm-oculto', !vivos.has(k));
  }

  // hasta dónde puede llegar una página: la barra de abajo y la tutora no son suyas
  const tope = () => window.innerHeight - nav.offsetHeight - 4 - huecoTutora();

  // Si la página ya puesta no cabe y tiene varios bloques, los que se salen pasan a una página nueva justo detrás (lo
  // calculado al repartir puede quedarse corto: márgenes que se juntan, la cabecera de una tabla…). Así solo se encoge
  // cuando un bloque, él solo, no cabe en la pantalla.
  function partirSiNoCabe(n) {
    if (fijas) return false; // las diapositivas fijas (escenas dibujadas) van enteras
    const p = paginas[n];
    const reales = p.bloques.filter(b => !adornos.has(b));
    const limite = tope() + 1;
    let fuera = reales.findIndex((b, i) => i > 0 && b.getBoundingClientRect().bottom > limite);
    // si ningún bloque se sale pero la página sí (el relleno de abajo de su caja), se va el último
    if (fuera < 0 && reales.length > 1 && raiz.getBoundingClientRect().bottom > limite) fuera = reales.length - 1;
    if (fuera < 0) return false;
    const corte = p.bloques.indexOf(reales[fuera]);
    const nueva = { arriba: 0, bloques: p.bloques.slice(corte) };
    p.bloques = p.bloques.slice(0, corte);
    p.vivos = vivosDe(p.bloques);
    nueva.vivos = vivosDe(nueva.bloques);
    paginas.splice(n + 1, 0, nueva);
    pintarPuntos();
    return true;
  }

  function ir(n, conSonido = true) {
    if (!vivo || n < 0 || n >= paginas.length) return;
    if (conSonido && n !== actual) sonar('pagina');
    const sentido = n > actual ? 'der' : n < actual ? 'izq' : '';
    actual = n;
    ensenar(n);
    window.scrollTo(0, 0);
    for (let vez = 0; vez < 6 && partirSiNoCabe(n); vez++) ensenar(n);
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

  // lo que ocupa de verdad la página ya puesta; si se pasa, se encoge todo lo de la vista. La tutora que habla no cuenta:
  // tapa un momento lo de abajo y se pliega (tutor.js); encoger la página por ella la hacía saltar al plegarse.
  function encoger() {
    const limite = window.innerHeight - nav.offsetHeight - 4;
    let zoom = 1;
    for (let vez = 0; vez < 4; vez++) {
      // solo la caja de la vista: lo que una animación de entrada desplaza un momento (transform) no cuenta
      const abajo = raiz.getBoundingClientRect().bottom;
      const arriba = raiz.getBoundingClientRect().top;
      if (abajo <= limite + 1 || zoom <= ENCOGER_MIN) return;
      zoom = Math.max(ENCOGER_MIN, zoom * (limite - arriba) / (abajo - arriba));
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
  const tardes = [setTimeout(() => luego(0), 400), setTimeout(() => luego(0), 1500), setTimeout(() => luego(0), 3000)];
  if (document.readyState !== 'complete') window.addEventListener('load', () => luego(0), { once: true });
  // y la entrada de la vista (vista-entra) la desplaza mientras dura: al acabar, se mide de nuevo
  const alAcabarEntrada = e => { if (e.target === raiz) luego(0); };
  app.addEventListener('animationend', alAcabarEntrada);
  // una pantalla puede pedir ir a una diapositiva: elemento.dispatchEvent(new CustomEvent('pm-ir', { bubbles: true, detail: 0 }))
  const alPedirIr = e => ir(Number(e.detail) || 0);
  app.addEventListener('pm-ir', alPedirIr);
  repartir();

  return () => {
    vivo = false;
    document.documentElement.style.removeProperty('--pm-alto');
    vigiaTutora?.disconnect();
    clearTimeout(pendiente);
    tardes.forEach(clearTimeout);
    app.removeEventListener('click', alPulsar);
    app.removeEventListener('animationend', alAcabarEntrada);
    app.removeEventListener('pm-ir', alPedirIr);
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
