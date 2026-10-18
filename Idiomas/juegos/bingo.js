// =====================================================================
// EL BINGO — juego para el vocabulario (bloque «vocabulario»)
// ---------------------------------------------------------------------
// Un cartón con las palabras. La tutora dice un significado (en tu idioma) y hay que encontrar y
// marcar la palabra que lo significa. Si te equivocas, la casilla tiembla, la tutora dice qué
// significaba esa palabra y el mismo significado se repite hasta que lo encuentres. Hay premio al
// completar una línea (fila, columna o diagonal) y premio gordo al llenar el cartón. Si hay muchas
// palabras, hay varios cartones. Vale para cualquier idioma: solo usa las fichas de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const MAX_CARTON = 9;

const usables = (bloque, ctx) => {
  const vistas = new Set();
  return (bloque.palabras ?? []).map(p => ctx.entrada(p)).filter(f => {
    if (!f || !f.es || f.propio || vistas.has(f.es) || !ctx.tr(f)) return false;
    vistas.add(f.es);
    return true;
  });
};

/** Las líneas de un cartón: filas, columnas completas y, si es cuadrado, las diagonales. */
function lineasDe(n, cols) {
  const filas = Math.ceil(n / cols);
  const lineas = [];
  for (let r = 0; r < filas; r++) lineas.push(Array.from({ length: Math.min(cols, n - r * cols) }, (_, c) => r * cols + c));
  for (let c = 0; c < cols; c++) {
    const col = Array.from({ length: filas }, (_, r) => r * cols + c);
    if (col.every(i => i < n)) lineas.push(col);
  }
  if (filas === cols && n === cols * filas) {
    lineas.push(Array.from({ length: cols }, (_, i) => i * cols + i));
    lineas.push(Array.from({ length: cols }, (_, i) => i * cols + (cols - 1 - i)));
  }
  return lineas.filter(l => l.length >= 2);
}

export const juego = {
  nombre: 'bingo',
  icono: '🎱',
  tipos: ['vocabulario'],
  sirve(bloque, ctx) { return usables(bloque, ctx).length >= 4; },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, elenco } = ctx;
  const fichas = ctx.barajar(usables(bloque, ctx));
  const significado = f => tr(f) || f.es;
  const esperas = [];
  const luego = (ms, fn) => { esperas.push(setTimeout(fn, ctx.quieto ? 0 : ms)); };

  // cartones de tamaño parecido, de 9 casillas como mucho
  const cartones = [];
  const k = Math.max(1, Math.ceil(fichas.length / MAX_CARTON));
  for (let i = 0, desde = 0; i < k; i++) {
    const tam = Math.floor(fichas.length / k) + (i < fichas.length % k ? 1 : 0);
    cartones.push(fichas.slice(desde, desde + tam));
    desde += tam;
  }

  const pista = el('p', { class: 'jg-pista' });
  const cuenta = el('span', { class: 'jg-cuenta' });
  const tutora = elenco.tutora(elenco.protagonista(), 'jg-bingo-actriz');
  const dice = el('p', { class: 'jg-bingo-dice', 'aria-live': 'polite' });
  const etiqueta = el('span', { class: 'jg-bingo-etiqueta' });
  const globo = el('div', { class: 'jg-bingo-globo' }, etiqueta, dice);
  const premio = el('div', { class: 'jg-bingo-premio', 'aria-live': 'assertive' });
  const tablero = el('div', { class: 'jg-bingo-carton' });
  let numero = 0;

  function pintarCarton() {
    const palabras = cartones[numero];
    const cols = palabras.length <= 4 ? 2 : palabras.length <= 6 ? 3 : palabras.length <= 8 ? 4 : 3;
    const lineas = lineasDe(palabras.length, cols);
    const dadas = new Set();
    let marcadas = 0;
    let premioLinea = false;
    const casillas = palabras.map((f, i) => {
      const boton = el('button', { type: 'button', class: 'jg-bingo-casilla', lang: ctx.LANG, style: `--i:${i}` },
        el('span', { class: 'jg-bingo-palabra' }, f.es),
        el('span', { class: 'jg-bingo-sello', 'aria-hidden': 'true' }, '★'));
      const c = { f, boton, marcada: false };
      boton.addEventListener('click', () => pulsar(c));
      return c;
    });
    tablero.style.setProperty('--cols', String(cols));
    tablero.className = `jg-bingo-carton jg-bingo-c${cols}`;
    poner(tablero, casillas.map(c => c.boton));
    poner(premio);
    etiqueta.textContent = t('jg.bingo.dice');
    pista.textContent = t('jg.bingo.pista');
    const marcar = () => {
      cuenta.textContent = (cartones.length > 1 ? `${t('jg.bingo.carton', { n: numero + 1, total: cartones.length })} · ` : '') + t('juego.cuenta', { n: marcadas, total: palabras.length });
    };
    marcar();

    // las llamadas: todas las palabras del cartón, en orden al azar
    const orden = ctx.barajar(casillas);
    let llamada = null;
    let fallos = 0;
    function llamar() {
      llamada = orden.find(c => !c.marcada) ?? null;
      if (!llamada) return;
      fallos = 0;
      const frase = significado(llamada.f);
      if (!ctx.quieto) { dice.classList.remove('sale'); void dice.offsetWidth; dice.classList.add('sale'); }
      dice.textContent = frase;
      tutora.gesto('presentar');
      for (const c of casillas) c.boton.classList.remove('jg-bingo-ayuda');
    }

    function pulsar(c) {
      if (!llamada || c.marcada) {
        if (c.marcada) sonar('elegir');
        return;
      }
      if (significado(c.f) === significado(llamada.f)) {
        c.marcada = true;
        marcadas += 1;
        c.boton.classList.add('marcada');
        c.boton.setAttribute('aria-pressed', 'true');
        sonar('sello');
        ctx.leerSiHayVoz(c.f.es);
        tutora.reaccionar('contenta', 900);
        marcar();
        // ¿línea nueva?
        const nuevas = lineas.map((l, i) => ({ l, i })).filter(({ l, i }) => !dadas.has(i) && l.every(j => casillas[j].marcada));
        for (const { l, i } of nuevas) {
          dadas.add(i);
          for (const j of l) casillas[j].boton.classList.add('en-linea');
        }
        if (marcadas === palabras.length) { luego(350, terminarCarton); return; }
        if (nuevas.length) {
          sonar('campana');
          sonar('confeti');
          poner(premio, el('p', { class: 'jg-bingo-cartel' }, premioLinea ? t('jg.bingo.otraLinea') : `🎉 ${t('jg.bingo.linea')}`));
          premioLinea = true;
          tutora.gesto('saludar');
          ctx.decir(t('jg.bingo.lineaTutora'), 'contenta');
        }
        luego(nuevas.length ? 900 : 450, llamar);
        return;
      }
      fallos += 1;
      c.boton.classList.remove('tiembla'); void c.boton.offsetWidth; c.boton.classList.add('tiembla');
      sonar('mal');
      tutora.reaccionar('confundida', 900);
      ctx.decir(t('jg.bingo.no', { palabra: c.f.es, significado: significado(c.f) }), 'pensando');
      if (fallos >= 3) {
        // última ayuda: brilla la casilla buena
        const buena = casillas.find(x => !x.marcada && significado(x.f) === significado(llamada.f));
        buena?.boton.classList.add('jg-bingo-ayuda');
      }
    }

    function terminarCarton() {
      dice.textContent = '';
      poner(premio, el('p', { class: 'jg-bingo-cartel jg-bingo-gordo' }, `🏆 ${t('jg.bingo.bingo')}`));
      sonar('fuegos');
      sonar('aplausos');
      tutora.gesto('reverencia');
      if (numero < cartones.length - 1) {
        etiqueta.textContent = '';
        pista.textContent = t('jg.bingo.cartonListo');
        const otro = el('button', { type: 'button', class: 'es-boton jg-seguir' }, t('jg.bingo.siguiente'));
        otro.addEventListener('click', () => { otro.remove(); sonar('cajon'); numero += 1; pintarCarton(); });
        premio.append(otro);
        otro.focus({ preventScroll: true });
        return;
      }
      etiqueta.textContent = '';
      pista.textContent = t('jg.bingo.fin');
      cuenta.textContent = '✓';
      ctx.hecho();
    }

    llamar();
  }

  const nodo = el('div', { class: 'jg-bingo' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.bingo.titulo')), cuenta),
    pista,
    el('div', { class: 'jg-bingo-sala es-limite' },
      el('div', { class: 'jg-bingo-presentadora' }, tutora.figura, globo),
      tablero,
      premio));
  elenco.vigilar(nodo);
  if (fichas.length) pintarCarton(); else ctx.hecho();
  return { nodo, apagar() { esperas.forEach(clearTimeout); } };
}
