// =====================================================================
// LA MEMORIA — juego para el vocabulario (bloque «vocabulario»)
// ---------------------------------------------------------------------
// El clásico de memoria. Las cartas están boca abajo: unas llevan la palabra y otras su significado.
// Se giran de dos en dos y se buscan las parejas (una palabra con su significado). Las que no son
// pareja se vuelven a tapar y la tutora dice qué eran. Máximo 6 parejas por tablero: si hay más
// palabras, hay varios tableros. Vale para cualquier idioma: solo usa las fichas de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

// parejas por tablero: seis en el ordenador; en el móvil cuatro (ocho cartas en dos filas de cuatro: más no caben bien)
const POR_TABLERO = window.matchMedia('(max-width: 700px)').matches ? 4 : 6;

const usables = (bloque, ctx) => {
  const vistas = new Set();
  return (bloque.palabras ?? []).map(p => ctx.entrada(p)).filter(f => {
    // con su significado en tu idioma, y distinto de la palabra: si no, salían dos cartas iguales en el mismo idioma
    if (!f || !f.es || f.propio || vistas.has(f.es) || !ctx.tr(f) || ctx.tr(f) === f.es) return false;
    vistas.add(f.es);
    return true;
  });
};

export const juego = {
  nombre: 'memoria',
  icono: '🧠',
  tipos: ['vocabulario'],
  sirve(bloque, ctx) { return usables(bloque, ctx).length >= 2; },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  // dos tableros como mucho: el resto de palabras ya se ve en las cartas y va al cuaderno
  const fichas = ctx.barajar(usables(bloque, ctx)).slice(0, POR_TABLERO * 2);
  const significado = f => tr(f);
  const esperas = [];
  const luego = (ms, fn) => { esperas.push(setTimeout(fn, ctx.quieto ? 0 : ms)); };

  // tableros de tamaño parecido, de 6 parejas como mucho
  const tableros = [];
  const k = Math.max(1, Math.ceil(fichas.length / POR_TABLERO));
  for (let i = 0, desde = 0; i < k; i++) {
    const tam = Math.floor(fichas.length / k) + (i < fichas.length % k ? 1 : 0);
    tableros.push(fichas.slice(desde, desde + tam));
    desde += tam;
  }

  const mesa = el('div', { class: 'jg-memoria-mesa' });
  const pista = el('p', { class: 'jg-pista' });
  const cuenta = el('span', { class: 'jg-cuenta' });
  const aviso = el('div', { class: 'jg-memoria-aviso', 'aria-live': 'polite' });
  let tablero = 0;

  function pintarTablero() {
    const grupo = tableros[tablero];
    let abiertas = [];
    let ocupado = false;
    let unidas = 0;
    pista.textContent = t('jg.memoria.pista');
    const marcar = () => {
      cuenta.textContent = (tableros.length > 1 ? `${t('jg.memoria.tablero', { n: tablero + 1, total: tableros.length })} · ` : '') + t('juego.cuenta', { n: unidas, total: grupo.length });
    };
    marcar();
    poner(aviso);
    const cartas = ctx.barajar(grupo.flatMap(f => [{ f, lado: 'es' }, { f, lado: 'trad' }])).map((c, i) => {
      const cara = c.lado === 'es'
        ? el('strong', { lang: ctx.LANG }, c.f.es)
        : el('span', { class: 'jg-memoria-sentido' }, significado(c.f));
      const boton = el('button', { type: 'button', class: `jg-memoria-carta jg-memoria-lado-${c.lado}`, style: `--i:${i}`, 'aria-label': t('jg.memoria.carta', { n: i + 1 }) },
        el('span', { class: 'jg-memoria-dorso', 'aria-hidden': 'true' }, el('i', {}, '?')),
        el('span', { class: 'jg-memoria-cara' }, cara));
      c.boton = boton;
      boton.addEventListener('click', () => girar(c));
      return c;
    });
    mesa.dataset.n = String(cartas.length);
    poner(mesa, cartas.map(c => c.boton));

    function girar(c) {
      if (ocupado || c.boton.classList.contains('girada')) return;
      c.boton.classList.add('girada');
      c.boton.setAttribute('aria-label', c.lado === 'es' ? c.f.es : significado(c.f));
      sonar('voltear');
      if (c.lado === 'es') ctx.leerSiHayVoz(c.f.es);
      abiertas.push(c);
      if (abiertas.length < 2) return;
      const [a, b] = abiertas;
      abiertas = [];
      if (a.lado !== b.lado && significado(a.f) === significado(b.f)) {
        for (const x of [a, b]) x.boton.classList.add('unida');
        unidas += 1;
        marcar();
        sonar('pop');
        const palabra = a.lado === 'es' ? a.f : b.f;
        poner(aviso, el('span', { lang: ctx.LANG }, palabra.es), ` = ${significado(palabra)}`);
        if (unidas === grupo.length) luego(500, terminarTablero);
        return;
      }
      ocupado = true;
      sonar('mal');
      for (const x of [a, b]) { x.boton.classList.remove('tiembla'); void x.boton.offsetWidth; x.boton.classList.add('tiembla'); }
      if (a.lado === b.lado) ctx.decir(t('jg.memoria.mismoLado'), 'pensando');
      else {
        const dichas = [a, b].map(x => (x.lado === 'es' ? x.f.es : significado(x.f)));
        ctx.decir(t('jg.memoria.noPareja', { a: dichas[0], b: dichas[1] }), 'pensando');
      }
      luego(850, () => {
        for (const x of [a, b]) { x.boton.classList.remove('girada', 'tiembla'); x.boton.setAttribute('aria-label', t('jg.memoria.carta', { n: cartas.indexOf(x) + 1 })); }
        sonar('voltear');
        ocupado = false;
      });
    }
  }

  function terminarTablero() {
    sonar('bien');
    if (tablero < tableros.length - 1) {
      pista.textContent = t('jg.memoria.tableroListo');
      const otro = el('button', { type: 'button', class: 'es-boton jg-seguir' }, t('jg.memoria.siguiente'));
      otro.addEventListener('click', () => { otro.remove(); sonar('cajon'); tablero += 1; pintarTablero(); });
      mesa.after(otro);
      otro.focus({ preventScroll: true });
      return;
    }
    pista.textContent = t('jg.memoria.fin');
    cuenta.textContent = '✓';
    sonar('aplausos');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-memoria' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.memoria.titulo')), cuenta),
    pista,
    mesa,
    aviso);
  if (fichas.length) pintarTablero(); else ctx.hecho();
  return { nodo, apagar() { esperas.forEach(clearTimeout); } };
}
