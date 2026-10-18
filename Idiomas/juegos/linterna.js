// =====================================================================
// LA LINTERNA — juego para leer un texto (bloque «texto», la lectura literaria)
// ---------------------------------------------------------------------
// Es de noche y el texto está a oscuras. La linterna alumbra una sola frase cada vez: así no hay
// nada más en lo que fijarse. Para encender la frase hay que encontrar la luciérnaga (la palabra que
// brilla); entonces se queda encendida y se puede oír, traducir y analizar. Frase a frase, la página
// se ilumina entera y, al final, se puede leer seguida.
// Vale para cualquier idioma: solo usa las frases de la lección (con su traducción y su sintaxis).
// =====================================================================

import { el, poner } from '../js/dom.js';
import { pronunciarSeguido, hayVoz } from '../js/sonidos.js';

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const frases = bloque.frases ?? [];
  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const lupa = el('div', { class: 'jg-lupa', 'aria-live': 'polite' });
  const piezas = frases.map((f, k) => {
    const { nodo, clave } = ctx.frase(f.es);
    const span = el('span', { class: 'jg-frase-texto', 'data-k': String(k) }, nodo, ' ');
    return { f, span, clave, k };
  });
  const parrafos = [0, 1].map(p => el('p', { class: 'jg-parrafo' }, piezas.filter(x => (x.f.parrafo ?? 0) === p).map(x => x.span)));
  const pagina = el('div', { class: 'jg-pagina' }, parrafos.filter(p => p.childNodes.length));
  let n = 0;

  function herramientas(x) {
    const trad = el('p', { class: 'jg-trad', hidden: true }, tr(x.f.trad));
    const ver = el('button', { type: 'button', class: 'es-boton es-boton-papel' }, t('jg.verTraduccion'));
    ver.addEventListener('click', () => { trad.hidden = !trad.hidden; sonar(trad.hidden ? 'cerrar' : 'papel'); });
    const oir = el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(x.f.es) }, `🔊 ${t('comun.escuchar')}`);
    return [el('p', { class: 'jg-lupa-frase', lang: ctx.LANG }, x.f.es), el('div', { class: 'jg-herramientas' }, oir, ver), trad, ctx.analisis(x.f, `jg-lin-${x.k}`)];
  }

  function alumbrar() {
    cuenta.textContent = `${n} / ${frases.length}`;
    const x = piezas[n];
    for (const p of piezas) p.span.classList.toggle('alumbrada', p === x);
    x.span.scrollIntoView?.({ block: 'center', behavior: ctx.quieto ? 'auto' : 'smooth' });
    poner(lupa);
    const encender = () => {
      x.span.classList.add('encendida');
      x.span.classList.remove('alumbrada');
      sonar('escala', { valor: (n + 1) / frases.length });
      ctx.leerSiHayVoz(x.f.es);
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, n === frases.length - 1 ? t('jg.linterna.fin') : t('jg.linterna.otra'));
      seguir.addEventListener('click', () => {
        n += 1;
        if (n < frases.length) { sonar('pasos'); alumbrar(); } else fin();
      });
      poner(lupa, ...herramientas(x), seguir);
      pista.textContent = t('jg.linterna.leida');
      seguir.focus({ preventScroll: true });
    };
    if (x.clave) {
      x.clave.boton.classList.add('jg-luciernaga');
      pista.textContent = t('jg.linterna.busca');
      x.clave.boton.addEventListener('click', () => {
        if (!x.clave.boton.classList.contains('jg-luciernaga')) return;
        x.clave.boton.classList.remove('jg-luciernaga');
        encender();
      });
    } else {
      const luz = el('button', { type: 'button', class: 'es-boton' }, t('jg.linterna.encender'));
      luz.addEventListener('click', encender);
      poner(lupa, luz);
    }
  }

  function fin() {
    cuenta.textContent = `${frases.length} / ${frases.length}`;
    nodo.classList.add('amanece');
    for (const p of piezas) p.span.classList.remove('alumbrada');
    pista.textContent = t('jg.linterna.amanece');
    const todo = el('button', { type: 'button', class: 'es-boton con-voz' }, `🔊 ${t('jg.linterna.leerTodo')}`);
    todo.addEventListener('click', () => {
      if (!hayVoz()) return;
      pronunciarSeguido(piezas.map(p => ({ texto: p.f.es })), {
        alEmpezar: i => piezas.forEach((p, k) => p.span.classList.toggle('alumbrada', k === i)),
        alAcabar: () => piezas.forEach(p => p.span.classList.remove('alumbrada')),
      });
    });
    poner(lupa, el('p', { class: 'jg-lupa-frase' }, t('jg.linterna.bravo')), todo);
    sonar('pajaro');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-linterna' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.linterna.titulo')), cuenta),
    pista,
    el('div', { class: 'jg-noche' },
      el('span', { class: 'jg-luna', 'aria-hidden': 'true' }),
      el('span', { class: 'jg-estrellas', 'aria-hidden': 'true' }),
      pagina),
    lupa);
  if (frases.length) alumbrar(); else ctx.hecho();
  return { nodo };
}
