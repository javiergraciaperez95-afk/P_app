// =====================================================================
// EL TEATRO — juego para leer un diálogo (bloque «dialogo»)
// ---------------------------------------------------------------------
// Cada personaje es una tutora sobre el escenario. Las frases salen de una en una, en un bocadillo
// encima de quien habla. Para pasar a la siguiente hay que tocar la palabra que brilla (así se lee
// de verdad); cualquier palabra abre su ficha, 🔊 la lee y «?» enseña la traducción y el análisis.
// Lo leído baja al guion de abajo. Sirve para cualquier idioma: solo usa los datos de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

export function crear(bloque, ctx) {
  const { t, tr, sonar, elenco } = ctx;
  const frases = bloque.frases ?? [];
  const nombres = [...new Set(frases.map(f => f.quien).filter(Boolean))];
  // una tutora distinta por personaje (como mucho cuatro en escena)
  const actores = new Map(nombres.slice(0, 4).map((nombre, i) => [nombre, {
    yo: elenco.tutora(i === 0 ? elenco.protagonista() : elenco.otra(), `jg-actor jg-actor-${i + 1}`),
    lado: nombres.length === 1 ? 'centro' : i % 2 ? 'der' : 'izq',
  }]));
  const reparto = el('div', { class: 'jg-reparto' }, [...actores].map(([nombre, a]) =>
    el('div', { class: `jg-papel jg-${a.lado}` }, a.yo.figura, el('span', { class: 'jg-cartel-nombre' }, nombre))));

  const bocadillo = el('div', { class: 'jg-bocadillo', 'aria-live': 'polite' });
  const pista = el('p', { class: 'jg-pista' });
  const guion = el('ol', { class: 'jg-guion', 'aria-label': t('jg.teatro.guion') });
  const cuenta = el('span', { class: 'jg-cuenta' });
  let n = 0;

  function linea(f, k) {
    const { nodo, clave } = ctx.frase(f.es);
    const trad = el('p', { class: 'jg-trad', hidden: true }, tr(f.trad));
    const analisis = ctx.analisis(f, `jg-teatro-${k}`);
    if (analisis) analisis.hidden = true;
    const ver = el('button', { type: 'button', class: 'jg-ayuda', 'aria-expanded': 'false', 'aria-label': t('jg.verTraduccion') }, '?');
    ver.addEventListener('click', () => {
      const abrir = trad.hidden;
      trad.hidden = !abrir;
      if (analisis) analisis.hidden = !abrir;
      ver.setAttribute('aria-expanded', String(abrir));
      sonar(abrir ? 'papel' : 'cerrar');
    });
    const oir = el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(f.es) }, '🔊');
    return { nodo, clave, trad, analisis, ver, oir };
  }

  function presentar() {
    cuenta.textContent = `${n + 1} / ${frases.length}`;
    const f = frases[n];
    const actor = actores.get(f.quien);
    const l = linea(f, n);
    bocadillo.className = `jg-bocadillo jg-${actor?.lado ?? 'centro'}`;
    if (!ctx.quieto) { void bocadillo.offsetWidth; bocadillo.classList.add('sale'); }
    const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir', hidden: true }, n === frases.length - 1 ? t('jg.teatro.fin') : t('jg.teatro.otra'));
    poner(bocadillo,
      f.quien && el('span', { class: 'jg-quien' }, f.quien),
      el('p', { class: 'jg-linea' }, l.nodo),
      el('div', { class: 'jg-herramientas' }, l.oir, l.ver),
      l.trad, l.analisis, seguir);
    // los demás miran; quien habla se mueve
    for (const [nombre, a] of actores) a.yo.figura.classList.toggle('jg-habla', nombre === f.quien);
    actor?.yo.gesto(n % 3 === 0 ? 'saludar' : n % 3 === 1 ? 'asentir' : 'presentar');
    ctx.leerSiHayVoz(f.es);

    const listo = () => {
      seguir.hidden = false;
      seguir.focus({ preventScroll: true });
      pista.textContent = t('jg.teatro.listo');
    };
    if (l.clave) {
      l.clave.boton.classList.add('jg-brilla');
      pista.textContent = t('jg.brilla');
      l.clave.boton.addEventListener('click', () => {
        if (!l.clave.boton.classList.contains('jg-brilla')) return;
        l.clave.boton.classList.replace('jg-brilla', 'jg-encontrada');
        sonar('moneda');
        actor?.yo.reaccionar('contenta', 900);
        listo();
      });
    } else listo();

    seguir.addEventListener('click', () => {
      guion.append(el('li', {}, f.quien && el('b', {}, `${f.quien}: `), el('span', { lang: ctx.LANG }, f.es), el('span', { class: 'jg-trad' }, ` — ${tr(f.trad)}`)));
      n += 1;
      if (n < frases.length) { sonar('pagina'); presentar(); return; }
      // ¡telón!
      poner(bocadillo, el('p', { class: 'jg-linea jg-aplausos' }, t('jg.teatro.aplausos')));
      bocadillo.className = 'jg-bocadillo jg-centro';
      pista.textContent = '';
      cuenta.textContent = `${frases.length} / ${frases.length}`;
      sonar('aplausos');
      for (const [, a] of actores) { a.yo.figura.classList.remove('jg-habla'); a.yo.gesto('reverencia'); }
      ctx.hecho();
    });
  }

  presentar();
  const nodo = el('div', { class: 'jg-teatro' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.teatro.titulo')), cuenta),
    el('div', { class: 'jg-escena-teatro es-limite' },
      el('span', { class: 'jg-telon jg-telon-izq', 'aria-hidden': 'true' }),
      el('span', { class: 'jg-telon jg-telon-der', 'aria-hidden': 'true' }),
      el('span', { class: 'jg-bambalina', 'aria-hidden': 'true' }),
      bocadillo,
      reparto,
      el('span', { class: 'jg-tablas', 'aria-hidden': 'true' })),
    pista,
    guion);
  ctx.elenco.vigilar(nodo);
  return { nodo };
}
