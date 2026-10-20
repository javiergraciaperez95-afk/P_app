// =====================================================================
// LA ESCUCHA — juego para el vocabulario (bloque «vocabulario»)
// ---------------------------------------------------------------------
// Suena una palabra y hay que elegir cuál es entre tres escritas. Si el dispositivo no tiene voz,
// en lugar del sonido se muestra cómo se pronuncia. Una opción equivocada se apaga y la tutora dice
// qué era; se sigue intentando hasta acertar, y las palabras falladas vuelven al final.
// Vale para cualquier idioma: solo usa las fichas de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';
import { hayVoz } from '../js/sonidos.js';

const MAX = 8;
const reales = f => f && f.es && !f.propio;

const usables = (bloque, ctx) => {
  const vistas = new Set();
  return (bloque.palabras ?? []).map(p => ctx.entrada(p)).filter(f => {
    if (!reales(f) || vistas.has(f.es)) return false;
    vistas.add(f.es);
    return true;
  });
};

export const juego = {
  nombre: 'escucha',
  icono: '👂',
  oido: true, // sin voz no sale (ver catalogo.js)
  tipos: ['vocabulario'],
  sirve(bloque, ctx) {
    const propias = usables(bloque, ctx);
    const todas = new Set([...propias, ...ctx.fichas().filter(reales)].map(f => f.es));
    return propias.length >= 2 && todas.size >= 3;
  },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const fichas = usables(bloque, ctx);
  // ocho palabras como mucho (las demás siguen sirviendo para despistar)
  const cola = ctx.barajar(fichas.map(f => ({ f, vistas: 0, vuelta: false }))).slice(0, MAX);
  const total = cola.length;
  let hechas = 0;
  const significado = f => { const s = tr(f); return s && s !== f.es ? s : '…'; };

  const escena = el('div', { class: 'jg-escucha-mesa' });
  const pista = el('p', { class: 'jg-pista' });
  const cuenta = el('span', { class: 'jg-cuenta' });
  const marcar = () => { cuenta.textContent = t('juego.cuenta', { n: hechas, total }); };

  // dos palabras distintas para despistar: primero las de la propia lista, luego las demás de la lección
  function distractores(f) {
    const propias = ctx.barajar(fichas.filter(x => x.es !== f.es));
    const otras = ctx.barajar(ctx.fichas().filter(x => reales(x) && x.es !== f.es && !propias.includes(x)));
    const vistos = new Set([f.es]);
    return [...propias, ...otras].filter(x => (vistos.has(x.es) ? false : vistos.add(x.es))).slice(0, 2);
  }

  function ronda() {
    const item = cola.shift();
    const { f } = item;
    item.vistas += 1;
    marcar();
    let fallada = false;
    let resuelta = false;
    const voz = hayVoz();
    pista.textContent = voz ? t('jg.escucha.pista') : t('jg.escucha.pistaSinVoz');

    // el sonido, o su pronunciación si el dispositivo no tiene voz (sin pronunciación: el significado)
    let altavoz;
    if (voz) {
      altavoz = el('button', { type: 'button', class: 'jg-escucha-altavoz', 'aria-label': t('jg.escucha.otraVez') },
        el('span', { 'aria-hidden': 'true' }, '🔊'), el('span', {}, t('jg.escucha.otraVez')));
      altavoz.addEventListener('click', () => { sonar('boton'); ctx.oir(f.es); });
    } else {
      altavoz = el('div', { class: 'jg-escucha-pron' },
        el('span', { class: 'jg-escucha-etiqueta' }, f.pron ? t('jg.escucha.asiSeDice') : t('jg.escucha.significa')),
        el('strong', {}, f.pron || significado(f)));
    }

    const opciones = ctx.barajar([f, ...distractores(f)]).map(o => {
      const boton = el('button', { type: 'button', class: 'jg-escucha-opcion', lang: ctx.LANG }, o.es);
      boton.addEventListener('click', () => {
        if (resuelta || boton.disabled) return;
        if (o.es === f.es) {
          resuelta = true;
          boton.classList.add('buena');
          sonar('bien');
          if (!fallada || item.vistas >= 2) hechas += 1;
          marcar();
          for (const b of lista.querySelectorAll('button')) b.disabled = true;
          boton.disabled = false;
          boton.classList.add('buena');
          poner(detalle, el('span', { class: 'jg-escucha-sig' }, `${f.es} = ${significado(f)}`));
          if (f.pron) detalle.append(el('em', {}, ` · ${f.pron}`));
          ctx.leerSiHayVoz(f.es);
          const ultima = !cola.length;
          const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, ultima ? t('jg.escucha.fin') : t('jg.escucha.siguiente'));
          seguir.addEventListener('click', () => { if (ultima) fin(); else { sonar('pagina'); ronda(); } });
          detalle.append(seguir);
          seguir.focus({ preventScroll: true });
          return;
        }
        boton.disabled = true;
        boton.classList.add('mala', 'tiembla');
        sonar('mal');
        if (!fallada) { fallada = true; if (!item.vuelta) { item.vuelta = true; cola.push(item); } }
        ctx.decir(t('jg.escucha.no', { palabra: o.es, significado: significado(o) }), 'pensando');
      });
      return boton;
    });
    const lista = el('div', { class: 'jg-escucha-opciones' }, opciones);
    const detalle = el('div', { class: 'jg-escucha-detalle', 'aria-live': 'polite' });
    poner(escena, altavoz, lista, detalle);
    if (voz) ctx.leerSiHayVoz(f.es);
  }

  function fin() {
    cuenta.textContent = '✓';
    pista.textContent = t('jg.escucha.todas');
    poner(escena, el('div', { class: 'jg-escucha-resumen' }, fichas.map(f => el('span', { class: 'jg-escucha-mini', lang: ctx.LANG }, f.es))));
    sonar('aplausos');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-escucha' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.escucha.titulo')), cuenta),
    pista,
    escena);
  if (cola.length) ronda(); else ctx.hecho();
  return { nodo };
}
