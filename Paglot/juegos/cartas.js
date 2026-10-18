// =====================================================================
// LAS CARTAS — juego para el vocabulario (bloque «vocabulario»)
// ---------------------------------------------------------------------
// 1. Descubrir: las palabras están boca abajo; cada carta que giras enseña la palabra, cómo se dice
//    y qué significa, y suena. Hay que girarlas todas.
// 2. Parejas: en rondas de cuatro (dos rondas como mucho), une cada palabra con su significado. Un fallo no castiga: la carta
//    tiembla, la tutora te da el significado y lo vuelves a intentar.
// Vale para cualquier idioma: solo usa las fichas de la lección.
// =====================================================================

import { el, poner, barajar } from '../js/dom.js';

const POR_RONDA = 4;

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const fichas = (bloque.palabras ?? []).map(p => ctx.entrada(p)).filter(Boolean);
  const mesa = el('div', { class: 'jg-mesa-cartas' });
  const pista = el('p', { class: 'jg-pista' });
  const cuenta = el('span', { class: 'jg-cuenta' });
  const significado = f => tr(f) || f.es;

  // ----- 1. Descubrir -----
  let giradas = 0;
  function descubrir() {
    pista.textContent = t('jg.cartas.gira');
    cuenta.textContent = `0 / ${fichas.length}`;
    poner(mesa, fichas.map((f, i) => {
      const carta = el('button', { type: 'button', class: 'jg-carta', style: `--i:${i}`, 'aria-label': t('jg.cartas.carta', { n: i + 1 }) },
        el('span', { class: 'jg-carta-dorso', 'aria-hidden': 'true' }, el('i', {}, '?')),
        el('span', { class: 'jg-carta-cara' },
          el('strong', { lang: ctx.LANG }, f.es),
          f.pron && el('em', {}, f.pron),
          el('span', {}, significado(f))));
      carta.addEventListener('click', () => {
        ctx.leerSiHayVoz(f.es);
        if (carta.classList.contains('girada')) { sonar('voltear'); return; }
        carta.classList.add('girada');
        carta.setAttribute('aria-label', `${f.es} · ${significado(f)}`);
        giradas += 1;
        cuenta.textContent = `${giradas} / ${fichas.length}`;
        sonar('voltear');
        if (f.consejo) ctx.decir(tr(f.consejo));
        if (giradas === fichas.length) {
          pista.textContent = t('jg.cartas.todas');
          const empezar = el('button', { type: 'button', class: 'es-boton jg-seguir' }, t('jg.cartas.parejas'));
          empezar.addEventListener('click', () => { sonar('cajon'); parejas(); });
          mesa.after(empezar);
          empezar.focus({ preventScroll: true });
        }
      });
      return carta;
    }));
  }

  // ----- 2. Parejas -----
  function parejas() {
    nodo.querySelector('.jg-seguir')?.remove();
    const rondas = [];
    // dos rondas como mucho: las demás palabras ya se han visto al girarlas y se practican en el repaso
    const mezcla = barajar([...fichas]).slice(0, POR_RONDA * 2 + 1);
    for (let i = 0; i < mezcla.length; i += POR_RONDA) rondas.push(mezcla.slice(i, i + POR_RONDA));
    // una ronda de una sola palabra no tiene gracia: se junta con la anterior
    if (rondas.length > 1 && rondas.at(-1).length === 1) rondas.at(-2).push(...rondas.pop());
    let ronda = 0;
    let unidas = 0;

    function pintarRonda() {
      const grupo = rondas[ronda];
      pista.textContent = t('jg.cartas.une');
      cuenta.textContent = t('jg.cartas.ronda', { n: ronda + 1, total: rondas.length });
      let elegida = null;
      const columna = (lista, lado) => el('div', { class: `jg-columna jg-columna-${lado}` }, lista.map(f => {
        const b = el('button', { type: 'button', class: 'jg-ficha-pareja', 'data-lado': lado, lang: lado === 'es' ? ctx.LANG : null }, lado === 'es' ? f.es : significado(f));
        b.addEventListener('click', () => {
          if (b.classList.contains('unida')) return;
          if (!elegida || elegida.dataset.lado === lado) {
            elegida?.classList.remove('elegida');
            elegida = b;
            b.classList.add('elegida');
            b._ficha = f;
            sonar('elegir');
            if (lado === 'es') ctx.leerSiHayVoz(f.es);
            return;
          }
          const otra = elegida;
          elegida = null;
          otra.classList.remove('elegida');
          if (otra._ficha === f) {
            for (const x of [otra, b]) x.classList.add('unida');
            sonar('pop');
            unidas += 1;
            if (unidas === grupo.length) {
              sonar('bien');
              unidas = 0;
              ronda += 1;
              if (ronda < rondas.length) setTimeout(pintarRonda, ctx.quieto ? 0 : 350);
              else fin();
            }
          } else {
            for (const x of [otra, b]) { x.classList.remove('tiembla'); void x.offsetWidth; x.classList.add('tiembla'); }
            sonar('mal');
            const buena = lado === 'es' ? otra._ficha : f;
            ctx.decir(`${buena.es} = ${significado(buena)}`, 'pensando');
          }
        });
        b._ficha = f;
        return b;
      }));
      poner(mesa, el('div', { class: 'jg-parejas' }, columna(barajar([...grupo]), 'es'), columna(barajar([...grupo]), 'trad')));
    }
    pintarRonda();
  }

  function fin() {
    pista.textContent = t('jg.cartas.fin');
    cuenta.textContent = '✓';
    poner(mesa, el('div', { class: 'jg-cartas-fin' }, fichas.map(f => el('span', { class: 'jg-carta-mini', lang: ctx.LANG }, f.es))));
    sonar('fanfarria');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-cartas' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.cartas.titulo')), cuenta),
    pista,
    mesa);
  if (fichas.length) descubrir(); else { pista.textContent = ''; ctx.hecho(); }
  return { nodo };
}
