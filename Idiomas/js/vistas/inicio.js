// Pantalla de inicio (portada).
// 1. El escenario (con una universidad de fondo y su cielo de día o de noche): el logotipo, el nombre y el botón de empezar, con tres tutoras (español, inglés y chino)
//    que juegan con él: lo señalan, lo empujan, lo presentan… y la de chino, de pie encima, salta y lo hunde.
//    La de español es Lucía, la tutora del curso; las otras dos son compañeras de clase (js/amigas.js).
// 2. Cómo se aprende: cuatro carteles, cada uno con una tutora haciendo lo que cuenta.
// Las tutoras solo se mueven mientras se ven (IntersectionObserver).

import { el, poner } from '../dom.js';
import { t, locale } from '../i18n.js';
import { icono } from '../iconos.js';
import { curso } from '../curso.js';
import { hayProgreso } from '../progress.js';
import { TUTORAS, tutoraPorId } from '../amigas.js';
import { dibujoDe } from '../tutor-sprite.js';
import { SALTO_PISA } from '../tutora-base.js';
import { sonar } from '../sonidos.js';
import { universidad, sol, luna, nubes, maceta, aplique, ventana, banderines, mercado, farolillos, paseantes, curvaDeTela } from './inicio-decorado.js';

const CADA_ESCENA = 4200; // milisegundos entre una escenita del botón y la siguiente
const DURA_GLOBO = 1800;

// Cada cartel de «así se aprende» con el gesto que lo cuenta (se repite mientras se ve).
const CARACTERISTICAS = [
  { clave: 'f1', icono: 'libro', gestos: ['hojear', 'asentir'] },
  { clave: 'f2', icono: 'frases', gestos: ['pensar', 'senalar'] },
  { clave: 'f3', icono: 'estrellaLlena', gestos: ['escribir', 'pulgar'] },
  { clave: 'f4', icono: 'altavoz', escuchando: true, gestos: ['asentir'] },
];

const dibujos = new Map();
const dibujo = c => {
  if (!dibujos.has(c.id)) dibujos.set(c.id, dibujoDe(c));
  return dibujos.get(c.id);
};
const porId = tutoraPorId;

/**
 * Una tutora en su lienzo. Se enciende y se apaga con su zona; mientras no se ve no dibuja nada.
 * alto: filas del lienzo (64 normal; más si tiene que saltar sin cortarse la cabeza).
 */
function tutora(c, { clase = '', alto = 64, globo = true } = {}) {
  const canvas = el('canvas', { class: 'tutora-lienzo', width: 48, height: alto });
  const bocadillo = globo ? el('span', { class: 'inicio-globo', lang: c.lang }, c.hola) : null;
  const figura = el('div', { class: `inicio-figura ${clase}`.trim() }, bocadillo, canvas);
  const yo = { c, figura, canvas, sprite: null, dibujo: null, encendida: false, apagarGlobo: null };
  yo.cargar = () => { const quien = yo.c; return dibujo(quien).then(d => {
    if (yo.c !== quien) return yo; // mientras llegaba, ya se pidió otra (el teatro cambia deprisa)
    yo.dibujo = d;
    if (yo.encendida && !yo.sprite) yo.sprite = d.crearSprite(canvas);
    return yo;
  }).catch(() => { figura.hidden = true; }); };
  yo.encender = () => { yo.encendida = true; if (yo.dibujo && !yo.sprite) yo.sprite = yo.dibujo.crearSprite(canvas); };
  yo.apagar = () => {
    yo.encendida = false;
    yo.sprite?.parar();
    yo.sprite = null;
    clearTimeout(yo.apagarGlobo);
    figura.classList.remove('habla');
  };
  yo.gesto = (nombre, conGlobo = false) => {
    yo.sprite?.gesto(nombre);
    if (conGlobo && bocadillo) yo.decir();
  };
  yo.decir = () => {
    figura.classList.add('habla');
    clearTimeout(yo.apagarGlobo);
    yo.apagarGlobo = setTimeout(() => figura.classList.remove('habla'), DURA_GLOBO);
  };
  /** Cambia de tutora en el mismo lienzo (el teatro). */
  yo.cambiar = nueva => {
    yo.c = nueva;
    yo.sprite?.parar();
    yo.sprite = null;
    yo.dibujo = null;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (bocadillo) { bocadillo.textContent = nueva.hola; bocadillo.lang = nueva.lang; }
    return yo.cargar();
  };
  yo.cargar();
  return yo;
}

/** Enciende las tutoras de una zona solo mientras se ve, y llama a alVer/alDejar para sus relojes. */
function zona(elemento, tutoras, { alVer = () => {}, alDejar = () => {} } = {}) {
  let viendo = false;
  const ver = si => {
    if (si === viendo) return;
    viendo = si;
    if (si) { tutoras().forEach(x => x.encender()); alVer(); } else { alDejar(); tutoras().forEach(x => x.apagar()); }
  };
  if (!('IntersectionObserver' in window)) { ver(true); return { apagar: () => ver(false) }; }
  const observador = new IntersectionObserver(([e]) => ver(e.isIntersecting), { rootMargin: '60px' });
  observador.observe(elemento);
  return { apagar: () => { observador.disconnect(); ver(false); } };
}

/**
 * Las animaciones de CSS de una parte de la portada se quedan quietas mientras no se ve (como las del pie):
 * cada animación en marcha le cuesta trabajo al navegador en cada fotograma, se vea o no, y aquí hay cientos.
 */
function quietasFuera(partes) {
  if (!('IntersectionObserver' in window)) return () => {};
  const vigia = new IntersectionObserver(entradas => {
    for (const e of entradas) e.target.classList.toggle('quieta', !e.isIntersecting);
  }, { rootMargin: '60px' });
  for (const p of partes) if (p) vigia.observe(p);
  return () => vigia.disconnect();
}

function logo(clase, lado) {
  return el('img', { class: clase, src: 'assets/logo.svg', alt: '', width: lado, height: lado });
}

/** El trío del botón: las tres tutoras y su escenita (la usan la portada grande y la del móvil). */
function crearTrio(despues, zonas) {
  const es = tutora(porId('es'), { clase: 'boton-izq' });
  const en = tutora(porId('en'), { clase: 'boton-der' });
  const zh = tutora(porId('zh'), { clase: 'boton-arriba', alto: 78 });

  const empezar = el('a', {
    class: 'inicio-empezar',
    href: '#/lecciones',
    onclick: () => sonar('pagina'),
  }, el('span', {}, hayProgreso() ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')));
  const plataforma = el('div', { class: 'inicio-plataforma' }, zh.figura, empezar);

  /** El botón reacciona: se hunde (pisado), se aprieta (apretujado) o brilla. */
  const boton = (clase, ms) => {
    plataforma.classList.remove(clase);
    void plataforma.offsetWidth; // para que la animación vuelva a empezar
    plataforma.classList.add(clase);
    despues(ms, () => plataforma.classList.remove(clase));
  };

  // Las escenitas, una detrás de otra y siempre en el mismo orden.
  const ESCENAS = [
    // le invitan a pulsarlo, cada una en su idioma
    () => { es.gesto('invitarDer', true); despues(650, () => en.gesto('invitarIzq', true)); despues(300, () => zh.gesto('saludar')); },
    // la de arriba salta y lo hunde; a las otras les pilla por sorpresa
    () => {
      zh.gesto('saltarBoton');
      const pisa = 1700 * SALTO_PISA;
      despues(pisa, () => boton('pisado', 260));
      despues(pisa + 40, () => { es.gesto('respingo'); en.gesto('respingo'); });
      despues(pisa + 900, () => { es.gesto('aplaudir'); en.gesto('aplaudir'); });
    },
    // lo empujan desde los dos lados y la de arriba se tambalea
    () => {
      es.gesto('empujarDer'); en.gesto('empujarIzq');
      boton('apretujado', 2100);
      despues(200, () => zh.sprite?.reaccionar('agobiada', 1800));
    },
    // ¡tachán!
    () => { es.gesto('presentarDer'); en.gesto('presentarIzq'); zh.gesto('celebrar'); boton('brilla', 1600); },
    // lo señalan con el dedo
    () => { es.gesto('senalarAbajoDer'); en.gesto('senalarAbajoIzq'); despues(400, () => zh.gesto('pulgar', true)); },
  ];
  let escena = 0;
  let relojEscenas = null;
  const siguienteEscena = () => {
    if (document.hidden) return;
    ESCENAS[escena % ESCENAS.length]();
    escena++;
  };

  // Al pasar por el botón lo señalan todas; al tocar a una, hace su gesto propio y dice hola.
  empezar.addEventListener('pointerenter', () => { es.gesto('senalarAbajoDer'); en.gesto('senalarAbajoIzq'); zh.gesto('pulgar'); });
  for (const x of [es, en, zh]) {
    x.figura.addEventListener('click', () => { sonar('saludo'); x.gesto('firma', true); });
  }

  const nodo = el('div', { class: 'inicio-trio' }, universidad(), es.figura, plataforma, en.figura);
  for (const x of [es, en, zh]) x.figura.setAttribute('aria-hidden', 'true');
  zonas.push(zona(nodo, () => [es, en, zh], {
    alVer: () => { despues(500, siguienteEscena); relojEscenas = setInterval(siguienteEscena, CADA_ESCENA); },
    alDejar: () => clearInterval(relojEscenas),
  }));
  return { nodo, parar: () => clearInterval(relojEscenas) };
}

/** En el móvil la portada cabe en una sola pantalla, sin scroll (lo decide también app.js: sin pie). */
export const inicioMovil = () => window.matchMedia('(max-width: 700px)').matches;

/**
 * La portada en el móvil: las mismas partes que en la web (el escenario del botón, la pancarta del mercado, el
 * pasillo y el pie), cada una en su diapositiva y sin scroll. Se pasan con los botones de abajo, con los
 * puntos o deslizando el dedo; la primera lleva su propio botón «Saber más».
 * Devuelve la función que deshace lo que ha movido (el pie vuelve a su sitio).
 */
function diapositivas(contenedor, { escenario, pancarta, pasillo }) {
  // la primera: el escenario del botón y, abajo, «Saber más»
  escenario.append(el('div', { class: 'inicio-elige' },
    el('div', { class: 'inicio-elige-fila' },
      el('button', { type: 'button', class: 'inicio-flecha inicio-flecha-der', onclick: () => ir(1) },
        t('inicio.saberMas'), ' ', el('span', { 'aria-hidden': 'true' }, '▶')))));
  // la segunda: la pancarta del mercado, con el mismo cielo que el escenario
  const mercadoPag = el('section', { class: 'inicio-escenario inicio-escenario-bajo' }, pancarta);
  // la última: el pie de la web de verdad (con sus tutoras que charlan), prestado mientras dura la portada
  const pie = document.getElementById('pie-sitio');
  const hueco = document.createComment('pie');
  pie.before(hueco);
  const piePag = el('section', { class: 'inicio-pie-pag' }, pie);

  const quietaDelTodo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paginas = [escenario, mercadoPag, pasillo, piePag];
  for (const pg of paginas) pg.classList.add('inicio-pag');
  const pista = el('div', { class: 'inicio-pista', style: `width:${paginas.length * 100}%` }, paginas);
  const atras = el('button', { type: 'button', class: 'inicio-flecha inicio-flecha-izq', onclick: () => ir(pagina - 1) },
    el('span', { 'aria-hidden': 'true' }, '◀'), ' ', t('inicio.volver'));
  const adelante = el('button', { type: 'button', class: 'inicio-flecha inicio-flecha-der', onclick: () => ir(pagina + 1) });
  const puntos = paginas.map((_, n) => el('button', { type: 'button', class: 'inicio-punto', 'aria-label': String(n + 1), onclick: () => ir(n) }));
  const barra = el('nav', { class: 'inicio-barra', hidden: true }, atras, el('div', { class: 'inicio-puntos' }, puntos), adelante);
  let pagina = 0;
  // Solo la diapositiva a la vista y sus vecinas se pintan (content-visibility): las demás no cuestan layout, pintura ni animaciones.
  const mostrarCerca = () => paginas.forEach((pg, k) => pg.classList.toggle('lejos', Math.abs(k - pagina) > 1));
  const sitioDe = n => (n ? -n * 100 / paginas.length : 0);
  function ir(n) {
    n = Math.max(0, Math.min(paginas.length - 1, n));
    if (n !== pagina) sonar('pagina');
    // un salto de más de una diapositiva no pasa por las del medio (estarían sin pintar): la pista se desvanece,
    // cambia de sitio y vuelve a aparecer
    const lejos = Math.abs(n - pagina) > 1 && !quietaDelTodo;
    if (lejos) {
      const fuera = pista.animate([{ offset: 1, opacity: 0 }], { duration: 160, easing: 'ease-in', fill: 'forwards' });
      fuera.finished.then(() => {
        pista.style.transition = 'none';
        colocarPagina(n);
        void pista.offsetWidth;
        pista.style.transition = '';
        fuera.cancel();
        pista.animate([{ offset: 0, opacity: 0 }], { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      }).catch(() => {});
      return;
    }
    pista.style.transition = '';
    colocarPagina(n);
  }
  let cercaLuego = 0;
  function colocarPagina(n) {
    pagina = n;
    // la de destino ya está pintada (era vecina); las vecinas nuevas se pintan cuando la pista ha llegado,
    // para que pintarlas no frene el arranque del deslizamiento
    paginas[n].classList.remove('lejos');
    clearTimeout(cercaLuego);
    cercaLuego = setTimeout(mostrarCerca, 680);
    pista.style.transform = n ? `translateX(${sitioDe(n)}%)` : '';
    paginas.forEach((pg, k) => { pg.inert = k !== n; });
    puntos.forEach((pt, k) => pt.classList.toggle('actual', k === n));
    barra.hidden = n === 0; // la primera ya lleva su propio «Saber más»
    adelante.style.visibility = n === paginas.length - 1 ? 'hidden' : '';
    poner(adelante, t('inicio.siguiente'), ' ', el('span', { 'aria-hidden': 'true' }, '▶'));
  }
  ir(0);
  // «Volver arriba» del pie vuelve a la primera diapositiva
  pie.querySelector('[data-pie-subir]')?.addEventListener('click', () => ir(0));
  // deslizar el dedo de un lado a otro también pasa de diapositiva
  let x0 = null;
  let y0 = null;
  let tirando = false;
  let marco = 0;
  pista.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; tirando = false; }, { passive: true });
  pista.addEventListener('touchmove', e => {
    if (x0 === null || quietaDelTodo) return;
    const dx = e.touches[0].clientX - x0;
    const dy = e.touches[0].clientY - y0;
    if (!tirando) {
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { x0 = null; return; }
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      tirando = true;
      pista.style.transition = 'none';
    }
    const tope = (dx > 0 && pagina === 0) || (dx < 0 && pagina === paginas.length - 1);
    const mover = tope ? dx * 0.2 : dx * 0.85;
    cancelAnimationFrame(marco);
    marco = requestAnimationFrame(() => { pista.style.transform = `translateX(calc(${sitioDe(pagina)}% + ${mover.toFixed(1)}px))`; });
  }, { passive: true });
  const soltar = e => {
    if (x0 === null) return;
    const dx = (e.changedTouches?.[0]?.clientX ?? x0) - x0;
    const dy = (e.changedTouches?.[0]?.clientY ?? y0) - y0;
    x0 = null;
    cancelAnimationFrame(marco);
    pista.style.transition = '';
    if (tirando) {
      tirando = false;
      const destino = pagina + (dx < 0 ? 1 : -1);
      if (Math.abs(dx) > 56 && destino >= 0 && destino < paginas.length) ir(destino);
      else colocarPagina(pagina); // vuelve a su sitio, con la misma curva
      return;
    }
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) ir(pagina + (dx < 0 ? 1 : -1));
  };
  pista.addEventListener('touchend', soltar, { passive: true });
  pista.addEventListener('touchcancel', soltar, { passive: true });

  // Cada parte conserva su diseño: si no cabe en el alto de la pantalla, se encoge lo justo (zoom) en vez de recortarse.
  const ajustes = [mercadoPag, pasillo, piePag].map(pg => {
    const ajuste = el('div', { class: 'inicio-ajuste' }, [...pg.childNodes]);
    pg.append(ajuste);
    return { pg, ajuste };
  });
  const encajar = () => {
    for (const pg of paginas) pg.classList.remove('lejos'); // para medirlas hay que pintarlas
    for (const { pg, ajuste } of ajustes) {
      const estilo = getComputedStyle(pg);
      const alto = pg.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom);
      ajuste.style.zoom = '1';
      const natural = ajuste.getBoundingClientRect().height;
      ajuste.style.zoom = natural > alto && alto > 0 ? String(Math.max(.5, Math.floor(alto / natural * 100) / 100)) : '';
    }
    mostrarCerca();
  };
  const portada = el('div', { class: 'inicio inicio-movil' }, pista, barra);
  // un foco o un gesto no pueden desplazar la pista a mano: solo se mueve con los botones
  portada.addEventListener('scroll', () => { portada.scrollLeft = 0; portada.scrollTop = 0; });
  poner(contenedor, portada);
  const vigia = 'ResizeObserver' in window ? new ResizeObserver(encajar) : null;
  vigia?.observe(pista);
  requestAnimationFrame(encajar);
  document.fonts?.ready.then(encajar);
  return () => { vigia?.disconnect(); hueco.replaceWith(pie); };
}

/**
 * Pinta la portada. Devuelve una función que la apaga (las tutoras dejan de moverse):
 * hay que llamarla al salir de la pantalla.
 */
export function pintarInicio(contenedor) {
  const movil = inicioMovil();
  const relojes = new Set();
  const despues = (ms, fn) => { const r = setTimeout(() => { relojes.delete(r); fn(); }, ms); relojes.add(r); };
  const zonas = [];

  // =====================================================================
  // 1. El escenario del botón
  // =====================================================================
  const trio = crearTrio(despues, zonas);

  const numero = n => n.toLocaleString(locale());
  const otras = TUTORAS.filter(c => !['es', 'en', 'zh'].includes(c.id));
  for (let i = otras.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otras[i], otras[j]] = [otras[j], otras[i]];
  }
  const dato = (n, clave) => el('li', {}, el('strong', {}, numero(n)), el('span', {}, t(`inicio.dato.${clave}`)));

  // ----- La pancarta: una tela colgada entre dos palos que sujetan dos tutoras -----
  const pancarta = (() => {
    const izq = tutora(otras[4 % otras.length], { clase: 'pancarta-tutora' });
    const der = tutora(otras[5 % otras.length], { clase: 'pancarta-tutora' });
    izq.figura.setAttribute('aria-hidden', 'true');
    der.figura.setAttribute('aria-hidden', 'true');
    const curva = curvaDeTela();
    const lado = (x, cual) => el('div', { class: `pancarta-lado lado-${cual}` }, el('span', { class: 'pancarta-palo', 'aria-hidden': 'true' }), x.figura);
    const nodo = el('div', { class: 'inicio-bajo' },
      // el fondo: el cielo (nubes de día, estrellas de noche), el mercado nocturno y los farolillos
      el('div', { class: 'inicio-cielo mercado-cielo', 'aria-hidden': 'true' }, nubes()),
      mercado(),
      paseantes(),
      farolillos(),
      el('div', { class: 'pancarta-escena' },
        lado(izq, 'izq'),
        el('div', { class: 'pancarta-centro' },
          // la tela cuelga de las puntas de los palos y se comba por el centro (el borde lo pone un filtro que sigue la curva)
          el('div', { class: 'pancarta-caja' },
          el('div', { class: 'pancarta-borde' }, el('div', { class: 'pancarta', style: `clip-path: ${curva.tela}` },
            el('p', { class: 'inicio-texto' }, t('inicio.texto')),
            el('ul', { class: 'inicio-datos' },
              dato(curso.lecciones, 'lecciones')))),
          el('span', { class: 'pancarta-flecos', 'aria-hidden': 'true', style: `clip-path: ${curva.flecos}` }))),
        lado(der, 'der')),
      el('div', { class: 'pancarta-suelo', 'aria-hidden': 'true' }));
    // de vez en cuando saludan con la mano libre, se guiñan o asienten (sin soltar el palo)
    const GESTOS = { izq: ['saludarI', 'guino', 'asentir', 'pensar'], der: ['saludar', 'pulgar', 'asentir', 'guino'] };
    let turno = 0;
    let reloj = null;
    const gesto = () => {
      if (document.hidden) return;
      const quien = turno % 2 ? der : izq;
      const lista = GESTOS[turno % 2 ? 'der' : 'izq'];
      quien.gesto(lista[Math.floor(turno / 2) % lista.length], turno % 4 === 0);
      turno++;
    };
    const sujetar = () => { if (izq.sprite) izq.sprite.sujeta = 'D'; if (der.sprite) der.sprite.sujeta = 'I'; };
    for (const x of [izq, der]) x.figura.addEventListener('click', () => { sonar('saludo'); x.gesto(x === izq ? 'saludarI' : 'saludar', true); });
    zonas.push(zona(nodo, () => [izq, der], {
      alVer: () => { sujetar(); despues(200, sujetar); despues(900, sujetar); reloj = setInterval(() => { sujetar(); gesto(); }, 2600); },
      alDejar: () => clearInterval(reloj),
    }));
    return { nodo };
  })();

  const escenario = el('section', { class: 'inicio-escenario' },
    // el cielo: de día, sol y nubes; de noche, luna y estrellas (lo decide el CSS según el tema)
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, sol(), luna(), nubes()),
    el('div', { class: 'inicio-cabeza' },
      logo('inicio-logo', 160),
      el('h1', { class: 'inicio-nombre', 'aria-label': t('app.nombre') },
        el('span', { 'aria-hidden': 'true' }, 'Pa'), el('span', { class: 'inicio-nombre-oro', 'aria-hidden': 'true' }, 'glot')),
      el('p', { class: 'inicio-lema' }, t('inicio.lema'))),
    trio.nodo,
    el('div', { class: 'inicio-suelo', 'aria-hidden': 'true' }),
    movil ? null : pancarta.nodo);

  // =====================================================================
  // 2. Así se aprende: el pasillo de la universidad. Cada cosa va en un tablón de corcho y, debajo,
  //    una tutora pasea de un lado a otro; cuando llega a su sitio se para y hace lo que cuenta su tablón.
  // =====================================================================
  const quieta = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PASO = 3;        // píxeles por paso
  const CADA_PASO = 90;  // milisegundos entre paso y paso
  const tramos = CARACTERISTICAS.map((f, i) => {
    const x = tutora(otras[i % otras.length], { clase: 'pasillo-tutora', globo: false });
    x.figura.setAttribute('aria-hidden', 'true');
    // en el suelo, junto a la pilastra, una maceta (la última punta lleva otra)
    const paseo = el('div', { class: 'pasillo-paseo' }, maceta(i), i === CARACTERISTICAS.length - 1 ? maceta(i + 1) : null, x.figura);
    // el paseo: anda hasta un punto, se para, hace su gesto y vuelve a echar a andar
    let pos = null;
    let destino = 0;
    let parada = 0;
    let paso = 0;
    let reloj = null;
    const sitio = () => Math.max(0, paseo.clientWidth - x.figura.offsetWidth);
    const nuevoDestino = () => {
      const ancho = sitio();
      let d;
      do { d = Math.round(Math.random() * ancho / PASO) * PASO; } while (Math.abs(d - pos) < ancho / 4 && ancho > 40);
      destino = d;
    };
    const mover = () => {
      if (document.hidden || !x.sprite) return;
      if (pos === null) { pos = Math.round(sitio() / 2 / PASO) * PASO; nuevoDestino(); }
      pos = Math.min(pos, sitio());
      if (parada > 0) {
        parada -= CADA_PASO;
        x.sprite.andando = false;
        return;
      }
      if (pos === destino) {
        // llega: se para y hace lo de su tablón
        x.sprite.andando = false;
        x.sprite.escuchando = Boolean(f.escuchando);
        x.gesto(f.gestos[paso % f.gestos.length]);
        paso++;
        parada = 2800;
        nuevoDestino();
        return;
      }
      x.sprite.escuchando = false;
      x.sprite.andando = true;
      pos += Math.sign(destino - pos) * Math.min(PASO, Math.abs(destino - pos));
      x.figura.style.transform = `translateX(${pos}px)`;
    };
    // sin movimiento: no pasea; se queda en medio y hace su gesto de vez en cuando
    const repetirQuieta = () => {
      if (!x.sprite) return;
      x.figura.style.transform = `translateX(${Math.round(sitio() / 2)}px)`;
      x.sprite.escuchando = Boolean(f.escuchando);
      x.gesto(f.gestos[paso++ % f.gestos.length]);
    };
    const tramo = el('li', { class: 'pasillo-tramo' },
      aplique(), i === CARACTERISTICAS.length - 1 ? aplique() : null,
      el('div', { class: 'tablon' },
        el('span', { class: 'tablon-chincheta', 'aria-hidden': 'true' }),
        el('div', { class: 'tablon-papel' },
          el('h3', {}, icono(f.icono, 'icono inicio-icono'), t(`inicio.${f.clave}.titulo`)),
          el('p', {}, t(`inicio.${f.clave}.texto`)))),
      paseo);
    x.figura.addEventListener('click', () => { sonar('saludo'); parada = 2400; if (x.sprite) x.sprite.andando = false; x.gesto('firma'); });
    zonas.push(zona(tramo, () => [x], {
      alVer: () => {
        if (quieta) { despues(300 + i * 250, repetirQuieta); reloj = setInterval(repetirQuieta, 3200); return; }
        parada = 400 + i * 700; // no echan a andar todas a la vez
        reloj = setInterval(mover, CADA_PASO);
      },
      alDejar: () => clearInterval(reloj),
    }));
    return tramo;
  });

  const pasilloSeccion = el('section', { class: 'inicio-pasillo' },
    banderines(), ventana('izq'), ventana('der'),
    el('h2', { class: 'pasillo-letrero' }, el('span', {}, t('inicio.comoTitulo'))),
    el('ul', { class: 'pasillo-tramos' }, tramos));
  let desmontar = () => {};
  if (movil) desmontar = diapositivas(contenedor, { escenario, pancarta: pancarta.nodo, pasillo: pasilloSeccion });
  else poner(contenedor, el('div', { class: 'inicio' }, escenario, pasilloSeccion));
  const despertar = quietasFuera(['.inicio-cielo', '.inicio-cabeza', '.inicio-trio', '.inicio-bajo', '.inicio-pasillo']
    .map(sel => contenedor.querySelector(sel)));

  return () => {
    desmontar();
    despertar();
    for (const r of relojes) clearTimeout(r);
    trio.parar();
    for (const z of zonas) z.apagar();
  };
}
