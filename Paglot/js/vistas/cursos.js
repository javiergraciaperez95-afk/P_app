// Pantalla «¡Elige el idioma a estudiar!» (un teatro donde las tutoras se presentan) y la pantalla de créditos.

import { el, poner } from '../dom.js';
import { t, tr, idioma, locale } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, elegirCurso, nombreCurso, NOMBRES_TUTORAS } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { VOCES, OTROS } from '../creditos.js';
import { sol, luna, nubes } from './inicio-decorado.js';

function bandera(c) {
  const hueco = el('span', { class: 'curso-bandera', 'aria-hidden': 'true' });
  hueco.innerHTML = c.bandera; // dibujo fijo que viene de js/cursos.js
  return hueco;
}

const nombreEn = nombreCurso;

// ---------------------------------------------------------------------------
// «Elige el idioma» (#/idiomas): una función de teatro. Se abre el telón y las tutoras van saliendo al escenario
// una a una: entran andando, se presentan con el saludo de su idioma, el programa de mano cuenta cuántos lo
// hablan, dónde es oficial y un dato curioso, y la tutora pregunta «¿Empezamos?». Se pasa de una a otra con las
// flechas (o el teclado, o deslizando), o eligiendo su retrato en el programa de abajo.
// ---------------------------------------------------------------------------

// Hablantes (millones, nativos y no nativos, redondeado) y países donde es oficial: unos cuantos y el total.
const HABLANTES = {
  en: 1500, es: 600, fr: 320, de: 135, ja: 125, it: 68, ko: 82, zh: 1140, pt: 265, ru: 255, tr: 90,
  nl: 25, sv: 13, el: 13, pl: 41, no: 5, vi: 86, id: 250, da: 6, ro: 25, th: 70,
};
const PAISES = {
  en: [['GB', 'US', 'IE', 'CA', 'AU'], 59], es: [['ES', 'MX', 'CO', 'AR', 'PE'], 20], fr: [['FR', 'BE', 'CH', 'CA', 'SN'], 29],
  de: [['DE', 'AT', 'CH', 'LI', 'LU'], 6], ja: [['JP'], 1], it: [['IT', 'SM', 'CH', 'VA'], 4], ko: [['KR', 'KP'], 2],
  zh: [['CN', 'TW', 'SG'], 3], pt: [['PT', 'BR', 'AO', 'MZ', 'CV'], 9], ru: [['RU', 'BY', 'KZ', 'KG'], 4], tr: [['TR', 'CY'], 2],
  nl: [['NL', 'BE', 'SR'], 3], sv: [['SE', 'FI'], 2], el: [['GR', 'CY'], 2], pl: [['PL'], 1], no: [['NO'], 1], vi: [['VN'], 1],
  id: [['ID'], 1], da: [['DK'], 1], ro: [['RO', 'MD'], 2], th: [['TH'], 1],
};

/** «Es lengua oficial en España, México, Colombia, Argentina y 16 países más», con los nombres en el idioma de la app. */
function textoPaises(c) {
  const [codigos, total] = PAISES[c.id] ?? [[], 0];
  if (!codigos.length) return null;
  let nombres;
  try {
    const regiones = new Intl.DisplayNames([locale()], { type: 'region' });
    nombres = codigos.slice(0, 4).map(x => regiones.of(x));
  } catch { return null; }
  if (total > nombres.length) nombres.push(t('idi.masPaises', { n: total - nombres.length }));
  let lista;
  try { lista = new Intl.ListFormat(locale(), { type: 'conjunction' }).format(nombres); } catch { lista = nombres.join(', '); }
  return t('idi.oficial', { paises: lista });
}

/** El retrato de una tutora para el programa: la cabeza y los hombros, quieta. */
function camafeo(c, n) {
  const canvas = el('canvas', { class: 'ti-camafeo-cara', width: 32, height: 32, 'aria-hidden': 'true' });
  const libre = window.requestIdleCallback ?? (fn => setTimeout(fn, 1));
  setTimeout(() => libre(() => pintarCamafeo(c, canvas), { timeout: 800 }), 700 + n * 40);
  return canvas;
}
function pintarCamafeo(c, canvas) {
  dibujoDe(c).then(dibujo => {
    const rejilla = dibujo.rejilla('normal');
    const arriba = rejilla.findIndex(fila => fila.some(Boolean));
    const ctx = canvas.getContext('2d');
    rejilla.forEach((fila, y) => fila.forEach((color, x) => {
      if (color) { ctx.fillStyle = color; ctx.fillRect(x - 8, y - arriba + 1, 1, 1); }
    }));
  }).catch(() => {});
}

/** La bandera de un curso (dibujo fijo que viene de js/cursos.js). */
function banderaSola(c, clase) {
  const hueco = el('span', { class: clase, 'aria-hidden': 'true' });
  hueco.innerHTML = c.bandera;
  return hueco;
}

export function pintarElegirCurso(contenedor) {
  const apagar = [];
  let encendida = true;
  const despues = (ms, fn) => { const id = setTimeout(() => { if (encendida) fn(); }, ms); apagar.push(() => clearTimeout(id)); return id; };
  const esperar = ms => new Promise(r => despues(ms, r));
  const i18n = idioma();
  const numero = n => new Intl.NumberFormat(locale()).format(n);
  let actual = Math.max(0, hayCurso ? CURSOS.findIndex(c => c.id === curso.id) : 0);

  // ----- la actriz: un solo lienzo; cambia de dibujo cada vez que sale una tutora nueva -----
  const lienzo = el('canvas', { class: 'tutora-lienzo', width: 48, height: 64 });
  const globo = el('span', { class: 'ti-globo', 'aria-live': 'polite' });
  const actriz = el('div', { class: 'ti-actriz fuera-izq', 'aria-hidden': 'true' }, el('span', { class: 'ti-foco' }), globo, lienzo);
  let sprite = null;
  const dibujos = new Map();
  const dibujoDeCurso = c => { if (!dibujos.has(c.id)) dibujos.set(c.id, dibujoDe(c)); return dibujos.get(c.id); };
  apagar.push(() => sprite?.parar());
  actriz.addEventListener('click', () => { sonar('saludo'); sprite?.reaccionar('cosquillas', 900); sprite?.gesto('firma'); });

  const decir = (...partes) => { poner(globo, ...partes); actriz.classList.add('habla'); };
  const silencio = () => actriz.classList.remove('habla');

  // ----- el programa de mano: lo que cuenta la tutora -----
  const cartel = el('div', { class: 'ti-cartel sale' });
  function contenidoCartel(c, n) {
    const estudiando = hayCurso && c.id === curso.id;
    const pronto = Boolean(c.proximamente);
    const hablantes = HABLANTES[c.id];
    const paises = textoPaises(c);
    const empezar = estudiando
      ? el('a', { class: 'ti-boton', href: '#/lecciones', onclick: () => sonar('pagina') }, t('cursos.volver', { curso: c.nativo }))
      : el('button', { type: 'button', class: 'ti-boton', disabled: pronto, onclick: () => empezarCon(c) }, pronto ? t('cursos.pronto') : t('idi.si'));
    return [
      el('div', { class: 'ti-cartel-cabeza' },
        el('span', { class: 'ti-cartel-numero' }, t('idi.numero', { n: String(n + 1).padStart(2, '0') })),
        banderaSola(c, 'ti-cartel-bandera')),
      el('h2', { class: 'ti-cartel-nombre', lang: c.lang }, c.nativo),
      el('p', { class: 'ti-cartel-traducido' }, nombreEn(c, i18n), estudiando ? el('span', { class: 'ti-aqui' }, t('cursos.estudiando')) : null),
      el('ul', { class: 'ti-datos' },
        hablantes ? el('li', { class: 'ti-dato-gente', style: '--n:0' }, t('idi.hablantes', { n: numero(hablantes), w: numero(hablantes * 100) })) : null,
        paises ? el('li', { class: 'ti-dato-mundo', style: '--n:1' }, paises) : null,
        el('li', { class: 'ti-dato-libro', style: '--n:2' }, t('cursos.lecciones', { n: c.lecciones }))),
      el('div', { class: 'ti-sabias', style: '--n:3' }, el('b', {}, t('idi.sabias')), ' ', t(`idi.dato.${c.id}`)),
      el('div', { class: 'ti-cartel-botones', style: '--n:4' }, empezar)];
  }
  function pintarCartel(c, n) {
    poner(cartel, ...contenidoCartel(c, n));
    cartel.classList.remove('entra', 'sale');
    void cartel.offsetWidth;
    cartel.classList.add('entra');
  }
  // En el móvil el programa de mano va debajo de la tutora y cada idioma ocupa distinto: se le da el alto del
  // más largo, para que el teatro no cambie de tamaño al pasar de una tutora a otra.
  let anchoMedido = 0;
  function medirCartel() {
    if (innerWidth === anchoMedido) return;
    anchoMedido = innerWidth;
    cartel.style.minHeight = '';
    if (getComputedStyle(cartel).position === 'absolute') return; // en el ordenador flota sobre el escenario
    const antes = [...cartel.childNodes];
    let mayor = 0;
    CURSOS.forEach((c, n) => { poner(cartel, ...contenidoCartel(c, n)); mayor = Math.max(mayor, cartel.offsetHeight); });
    poner(cartel, ...antes);
    cartel.style.minHeight = `${mayor}px`;
  }

  // ----- la función: sale la tutora de antes y entra la nueva -----
  let ocupada = false;
  let pendiente = null;
  let turnoPresentacion = 0;
  async function presentar(n, desde = 'izq') {
    if (ocupada) { pendiente = [n, desde]; return; }
    ocupada = true;
    const turno = ++turnoPresentacion;
    const c = CURSOS[n];
    actual = n;
    marcarCamafeo();
    silencio();
    cartel.classList.add('sale');
    // la de antes se va andando por el lado contrario al que llega la nueva
    if (sprite) {
      sprite.andando = true;
      actriz.classList.add(desde === 'izq' ? 'fuera-der' : 'fuera-izq');
      await esperar(500);
      sprite?.parar();
      sprite = null;
    }
    if (!encendida) return;
    // la nueva aparece fuera del escenario, sin transición, y entra andando hasta su sitio
    actriz.classList.add('sin-paso');
    actriz.classList.remove('fuera-der', 'fuera-izq');
    actriz.classList.add(desde === 'izq' ? 'fuera-izq' : 'fuera-der');
    void actriz.offsetWidth;
    actriz.classList.remove('sin-paso');
    try {
      const dibujo = await dibujoDeCurso(c);
      if (!encendida) return;
      sprite = dibujo.crearSprite(lienzo);
    } catch { /* sin dibujo: el programa sale igual */ }
    if (sprite) sprite.andando = true;
    sonar('pasos');
    actriz.classList.remove('fuera-izq', 'fuera-der');
    await esperar(600);
    if (!encendida) return;
    if (sprite) sprite.andando = false;
    sprite?.gesto('saludar');
    sonar('saludo');
    decir(el('span', { lang: c.lang }, c.hola), ' ', t('idi.soy', { nombre: NOMBRES_TUTORAS[c.id] ?? '', idioma: nombreEn(c, i18n) }));
    pintarCartel(c, n);
    ocupada = false;
    despues(2600, () => {
      if (turno !== turnoPresentacion || ocupada) return;
      decir(t('idi.empezamos'));
      sprite?.gesto('invitarDer');
    });
    if (pendiente) { const [m, d] = pendiente; pendiente = null; presentar(m, d); }
  }
  const siguiente = () => { sonar('flecha'); presentar((actual + 1) % CURSOS.length, 'der'); };
  const anterior = () => { sonar('flecha'); presentar((actual - 1 + CURSOS.length) % CURSOS.length, 'izq'); };

  // ----- ¡Empezamos!: aplausos, la tutora lo celebra y se elige el curso -----
  function empezarCon(c) {
    sonar('fanfarria');
    despues(500, () => sonar('aplausos'));
    sprite?.gesto('celebrar');
    decir(t('idi.si'));
    teatro.classList.add('aplaude');
    despues(1500, () => elegirCurso(c.id));
  }

  // ----- el programa de abajo: un camafeo por tutora -----
  const camafeos = CURSOS.map((c, n) => {
    const b = el('button', { type: 'button', class: 'ti-camafeo', 'aria-label': `${c.nativo} · ${nombreEn(c, i18n)}`, title: nombreEn(c, i18n) },
      el('span', { class: 'ti-camafeo-marco' }, camafeo(c, n)),
      banderaSola(c, 'ti-camafeo-bandera'),
      el('span', { class: 'ti-camafeo-nombre', lang: c.lang }, c.nativo));
    b.addEventListener('click', () => {
      if (n === actual) return;
      sonar('voltear');
      presentar(n, n > actual ? 'der' : 'izq');
    });
    return b;
  });
  // la mitad a cada lado del escenario
  const mitad = Math.ceil(camafeos.length / 2);
  const ladoIzq = el('nav', { class: 'ti-lado ti-lado-izq', 'aria-label': t('idi.programa') }, camafeos.slice(0, mitad));
  const ladoDer = el('nav', { class: 'ti-lado ti-lado-der', 'aria-label': t('idi.programa') }, camafeos.slice(mitad));
  function marcarCamafeo() {
    camafeos.forEach((b, n) => b.setAttribute('aria-current', String(n === actual)));
  }

  // ----- la sala -----
  const flecha = (clase, texto, fn) => el('button', { type: 'button', class: `ti-flecha ${clase}`, 'aria-label': texto, title: texto, onclick: fn });
  const cabezas = n => Array.from({ length: n }, (_, i) => el('i', { style: `--n:${i}` }));
  const escena = el('div', { class: 'ti-escena' },
    el('div', { class: 'ti-decorado', 'aria-hidden': 'true' }, el('div', { class: 'inicio-cielo' }, sol(), luna(), nubes()), el('span', { class: 'ti-colinas' })),
    actriz,
    cartel,
    flecha('ti-flecha-izq', t('idi.anterior'), anterior),
    flecha('ti-flecha-der', t('idi.siguiente'), siguiente));
  const teatro = el('section', { class: 'teatro-idiomas' },
    el('h1', { class: 'solo-lector' }, t('cursos.titulo')),
    ladoIzq,
    el('div', { class: 'ti-centro' },
    el('div', { class: 'ti-proscenio' },
      el('div', { class: 'ti-bambalina', 'aria-hidden': 'true' }, el('span', { class: 'ti-placa' }, t('idi.presenta'))),
      escena,
      el('div', { class: 'ti-telon ti-telon-izq', 'aria-hidden': 'true' }),
      el('div', { class: 'ti-telon ti-telon-der', 'aria-hidden': 'true' }),
      el('div', { class: 'ti-tablas', 'aria-hidden': 'true' }, el('span', { class: 'ti-candilejas' }, cabezas(14)))),
    el('div', { class: 'ti-publico', 'aria-hidden': 'true' }, cabezas(18))),
    ladoDer);

  poner(cartel, ...contenidoCartel(CURSOS[actual], actual));
  poner(contenedor, teatro);

  // Todo el teatro cabe en la pantalla, sin desplazar: ocupa justo el alto que queda bajo la cabecera y, si su
  // contenido no cabe, se encoge entero (zoom), como la escalera de precios.
  function encajar() {
    if (!teatro.isConnected) return;
    teatro.style.zoom = '1';
    teatro.style.minHeight = '0px';
    medirCartel();
    const arriba = teatro.getBoundingClientRect().top + scrollY;
    // lo que queda por debajo del teatro dentro de #app (su relleno de abajo; css/teatro.css lo quita)
    const debajo = parseFloat(getComputedStyle(contenedor).paddingBottom) || 0;
    const alto = window.visualViewport?.height ?? innerHeight;
    const disponible = alto - arriba - debajo;
    let zoom = Math.max(0.4, Math.floor(Math.min(1, disponible / teatro.scrollHeight) * 1000) / 1000);
    const aplicar = () => {
      teatro.style.zoom = String(zoom);
      teatro.style.minHeight = `${Math.floor(disponible / zoom)}px`;
    };
    aplicar();
    // el redondeo del zoom puede dejar algún píxel de más: se afina hasta que no quede nada que desplazar
    for (let i = 0; i < 12 && document.documentElement.scrollHeight > innerHeight; i++) {
      if (zoom < 1) zoom = Math.max(0.4, zoom - 0.004);
      teatro.style.minHeight = `${Math.floor(disponible / zoom) - (i + 1) * 2}px`;
      teatro.style.zoom = String(zoom);
    }
  }
  addEventListener('resize', encajar);
  window.visualViewport?.addEventListener('resize', encajar);
  // no se enseña hasta que está encajado (con las letras ya cargadas), para que no se vea cambiar de tamaño
  const mostrar = () => {
    anchoMedido = 0;
    encajar();
    teatro.classList.add('listo');
    // y entonces se abre el telón y sale la primera
    despues(120, () => teatro.classList.add('abierto'));
    despues(550, () => presentar(actual, 'izq'));
  };
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(r => setTimeout(r, 400))]).then(() => { if (encendida) mostrar(); });
  apagar.push(() => { removeEventListener('resize', encajar); window.visualViewport?.removeEventListener('resize', encajar); });
  encajar();

  // deslizar con el dedo sobre el escenario, y las flechas del teclado
  let inicioX = null;
  escena.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') inicioX = e.clientX; });
  escena.addEventListener('pointerup', e => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) (dx < 0 ? siguiente : anterior)();
  });
  const teclas = e => {
    if (e.target.closest?.('input, textarea, select')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
  };
  window.addEventListener('keydown', teclas);
  apagar.push(() => window.removeEventListener('keydown', teclas));

  // (el telón se abre en cuanto el teatro está encajado: ver «mostrar»)
  marcarCamafeo();

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}

export function pintarCreditos(contenedor) {
  const i = idioma();
  const enlace = (texto, url) => el('a', { href: url, target: '_blank', rel: 'noopener' }, texto);
  const porCurso = CURSOS
    .map(c => ({ c, voces: VOCES.filter(v => v.curso === c.id) }))
    .filter(x => x.voces.length);

  poner(contenedor,
    el('section', { class: 'creditos' },
      el('h1', {}, t('creditos.titulo')),
      el('p', { class: 'caja' }, t('creditos.gracias')),
      porCurso.length > 0 && el('h2', {}, t('creditos.voces')),
      porCurso.length > 0 && el('ul', { class: 'creditos-lista' }, porCurso.map(({ c, voces }) =>
        el('li', { class: 'caja' },
          el('strong', {}, nombreEn(c, i), ' ', bandera(c)),
          el('ul', {}, voces.map(v => el('li', {}, enlace(v.autor, v.url), ` · ${t('creditos.voz', { voz: v.voz })} · ${v.licencia}`)))))),
      el('h2', {}, t('creditos.otros')),
      el('ul', { class: 'creditos-lista' }, OTROS.map(o =>
        el('li', { class: 'caja' }, el('strong', {}, o.nombre), ` (${tr(o.que)}) · `, enlace(o.autor, o.url), ` · ${o.licencia}`))),
      el('p', {}, t('creditos.ia')),
      el('p', {}, el('a', { class: 'boton boton-mini', href: hayCurso ? '#/lecciones' : '#/inicio' }, t('creditos.volver')))));
}
