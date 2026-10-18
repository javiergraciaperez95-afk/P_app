// =====================================================================
// LAS LETRAS — juego para el vocabulario (bloque «vocabulario»)
// ---------------------------------------------------------------------
// Una palabra cada vez. Su significado es la pista y sus letras están revueltas en fichas. Se tocan
// las letras en orden para formarla (en las expresiones de varias palabras, los espacios ya están
// colocados). Una ficha equivocada tiembla y no cuenta; si se falla dos veces aparece la
// pronunciación como segunda pista, y a la tercera brilla la ficha buena. Las palabras que cuestan
// (dos fallos o más) vuelven a salir al final. Vale para cualquier idioma: solo usa las fichas.
// =====================================================================

import { el, poner } from '../js/dom.js';

const MAX = 6;
const minusc = c => c.toLocaleLowerCase();

const usables = (bloque, ctx) => {
  const vistas = new Set();
  return (bloque.palabras ?? []).map(p => ctx.entrada(p)).filter(f => {
    if (!f || !f.es || f.propio || vistas.has(f.es)) return false;
    if (Array.from(f.es.replace(/\s+/g, '')).length < 2) return false;
    vistas.add(f.es);
    return true;
  });
};

export const juego = {
  nombre: 'letras',
  icono: '🔤',
  tipos: ['vocabulario'],
  sirve(bloque, ctx) { return usables(bloque, ctx).length >= 3; },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  // seis palabras como mucho, mejor las cortas: deletrear letra a letra cansa enseguida
  const largo = f => Array.from(f.es.replace(/\s+/g, '')).length;
  const mezcla = ctx.barajar(usables(bloque, ctx));
  const fichas = [...mezcla.filter(f => largo(f) <= 9), ...mezcla.filter(f => largo(f) > 9)].slice(0, MAX);
  const cola = ctx.barajar(fichas.map(f => ({ f, vuelta: false })));
  const total = fichas.length;
  let hechas = 0;
  const esperas = [];
  const luego = (ms, fn) => { esperas.push(setTimeout(fn, ctx.quieto ? 0 : ms)); };

  const escena = el('div', { class: 'jg-letras-mesa' });
  const pista = el('p', { class: 'jg-pista' });
  const cuenta = el('span', { class: 'jg-cuenta' });
  const marcar = () => { cuenta.textContent = t('juego.cuenta', { n: hechas, total }); };

  function revolver(letras) {
    for (let i = 0; i < 12; i++) {
      const m = ctx.barajar(letras);
      if (m.some((x, j) => x.c !== letras[j].c)) return m;
    }
    return ctx.barajar(letras);
  }

  function ronda() {
    const item = cola.shift();
    const { f } = item;
    marcar();
    pista.textContent = t('jg.letras.pista');
    const caracteres = Array.from(f.es);
    const reaparece = item.vuelta;
    let pos = 0;
    let fallos = 0;
    let terminada = false;

    // las casillas de la palabra (los espacios ya están colocados)
    const casillas = caracteres.map(c => (/\s/.test(c)
      ? { espacio: true, nodo: el('span', { class: 'jg-letras-espacio', 'aria-hidden': 'true' }) }
      : { c, nodo: el('span', { class: 'jg-letras-casilla' }) }));
    const huecos = casillas.filter(x => !x.espacio);
    const siguiente = () => huecos[pos];
    const fichasLetra = revolver(huecos.map(x => ({ c: x.c }))).map((x, i) => {
      const boton = el('button', { type: 'button', class: 'jg-letras-ficha', lang: ctx.LANG, style: `--i:${i}` }, x.c);
      x.boton = boton;
      return x;
    });

    const significadoNodo = el('p', { class: 'jg-letras-significado' }, tr(f) || f.es);
    const segunda = el('p', { class: 'jg-letras-segunda', hidden: true }, f.pron ? t('jg.letras.pron', { pron: f.pron }) : '');
    const palabra = el('div', { class: 'jg-letras-palabra', lang: ctx.LANG, 'aria-label': t('jg.letras.palabra') }, casillas.map(x => x.nodo));
    const bandeja = el('div', { class: 'jg-letras-bandeja' }, fichasLetra.map(x => x.boton));
    const pie = el('div', { class: 'jg-letras-pie' });
    poner(escena,
      reaparece && el('p', { class: 'jg-letras-otra' }, t('jg.letras.otraVez')),
      el('div', { class: 'jg-letras-pizarra' }, significadoNodo, segunda),
      palabra, bandeja, pie);

    for (const x of fichasLetra) {
      x.boton.addEventListener('click', () => {
        if (terminada || x.usada) return;
        const hueco = siguiente();
        if (minusc(x.c) === minusc(hueco.c)) {
          x.usada = true;
          x.boton.disabled = true;
          x.boton.classList.add('usada');
          hueco.nodo.textContent = hueco.c;
          hueco.nodo.classList.add('puesta');
          bandeja.querySelector('.jg-letras-guia')?.classList.remove('jg-letras-guia');
          pos += 1;
          sonar('ficha');
          if (pos === huecos.length) acabar();
          return;
        }
        fallos += 1;
        x.boton.classList.remove('tiembla'); void x.boton.offsetWidth; x.boton.classList.add('tiembla');
        sonar('mal');
        if (fallos === 1) ctx.decir(t('jg.letras.fallo'), 'pensando');
        if (fallos === 2) {
          if (f.pron) { segunda.hidden = false; ctx.decir(t('jg.letras.dosFallos'), 'pensando'); }
        }
        if (fallos >= 3 || (fallos === 2 && !f.pron)) {
          // última ayuda: brilla la ficha que toca
          const buena = fichasLetra.find(y => !y.usada && minusc(y.c) === minusc(hueco.c));
          buena?.boton.classList.add('jg-letras-guia');
        }
      });
    }

    function acabar() {
      terminada = true;
      palabra.classList.add('completa');
      segunda.hidden = !f.pron;
      sonar('moneda');
      ctx.leerSiHayVoz(f.es);
      const dificil = fallos >= 2 && !item.vuelta;
      if (dificil) { item.vuelta = true; cola.push(item); } else hechas += 1;
      marcar();
      const oir = el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(f.es) }, `🔊 ${t('comun.escuchar')}`);
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, cola.length ? t('jg.letras.siguiente') : t('jg.letras.fin'));
      seguir.addEventListener('click', () => {
        if (!cola.length) { fin(); return; }
        sonar('pagina');
        ronda();
      });
      poner(pie, oir, seguir);
      pista.textContent = dificil ? t('jg.letras.volvera') : t('jg.letras.bien');
      if (!cola.length) {
        seguir.textContent = t('jg.letras.fin');
      }
      seguir.focus({ preventScroll: true });
    }
  }

  function fin() {
    cuenta.textContent = '✓';
    pista.textContent = t('jg.letras.todas');
    poner(escena, el('div', { class: 'jg-letras-resumen' }, fichas.map(f => el('span', { class: 'jg-letras-mini', lang: ctx.LANG }, f.es))));
    sonar('aplausos');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-letras' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.letras.titulo')), cuenta),
    pista,
    escena);
  if (cola.length) ronda(); else ctx.hecho();
  return { nodo, apagar() { esperas.forEach(clearTimeout); } };
}
