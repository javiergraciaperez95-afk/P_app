// =====================================================================
// EL PUZLE — juego para leer un texto (bloque «texto», la lectura literaria)
// ---------------------------------------------------------------------
// Las frases de un párrafo llegan revueltas, en fichas. Hay que tocarlas en el orden en que van para
// reconstruir el párrafo: la ficha correcta salta al tablero; la que no va todavía tiembla y la tutora
// anima a probar otra. La traducción de cada ficha es una ayuda opcional (botón «Ver la traducción»).
// Un párrafo y luego el otro. Al final se puede oír el párrafo entero.
// Vale para cualquier idioma: solo usa las frases de la lección (con «parrafo» 0 o 1).
// =====================================================================

import { el, poner } from '../js/dom.js';

/** Los párrafos con al menos dos frases (con una sola no hay nada que ordenar). */
function parrafosDe(bloque) {
  const por = [[], []];
  for (const f of bloque.frases ?? []) if (f.es) por[f.parrafo === 1 ? 1 : 0].push(f);
  return por.filter(g => g.length >= 2);
}

export const juego = {
  nombre: 'puzle',
  icono: '🧩',
  tipos: ['texto'],
  sirve: bloque => parrafosDe(bloque).length > 0,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const parrafos = parrafosDe(bloque);
  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const mesa = el('div', { class: 'jg-puzle-mesa' });
  const acciones = el('div', { class: 'jg-puzle-acciones' });
  let p = 0;
  let acabado = false;

  const ver = el('button', { type: 'button', class: 'es-boton es-boton-papel', 'aria-pressed': 'false' }, t('jg.verTraduccion'));
  ver.addEventListener('click', () => {
    const abrir = !mesa.classList.contains('con-trad');
    mesa.classList.toggle('con-trad', abrir);
    ver.setAttribute('aria-pressed', String(abrir));
    sonar(abrir ? 'papel' : 'cerrar');
  });

  function ronda() {
    const orden = parrafos[p];
    let n = 0;
    cuenta.textContent = t('jg.puzle.parrafo', { n: p + 1, total: parrafos.length });
    pista.textContent = t('jg.puzle.pista');
    mesa.classList.remove('con-trad');
    ver.setAttribute('aria-pressed', 'false');

    // fichas revueltas (nunca en el orden bueno)
    let mezcla = ctx.barajar(orden);
    for (let i = 0; i < 12 && mezcla.every((f, k) => f === orden[k]); i++) mezcla = ctx.barajar(orden);

    const tablero = el('div', { class: 'jg-puzle-tablero', lang: ctx.LANG });
    const marca = () => el('span', { class: 'jg-puzle-siguiente', 'aria-hidden': 'true' }, String(n + 1));
    let hueco = marca();
    tablero.append(hueco);
    const monton = el('div', { class: 'jg-puzle-monton' });

    const fichas = mezcla.map(f => {
      const b = el('button', { type: 'button', class: 'jg-puzle-ficha' },
        el('span', { class: 'jg-puzle-es', lang: ctx.LANG }, f.es),
        el('span', { class: 'jg-puzle-trad' }, tr(f.trad) || ''));
      b.addEventListener('click', () => {
        if (n >= orden.length) return;
        if (f.es === orden[n].es) {
          n += 1;
          b.remove();
          hueco.remove();
          tablero.append(el('span', { class: 'jg-puzle-puesta' }, ctx.frase(f.es).nodo, ' '));
          sonar('escala', { valor: n / orden.length });
          ctx.leerSiHayVoz(f.es);
          if (n < orden.length) { hueco = marca(); tablero.append(hueco); } else completo();
        } else {
          b.classList.remove('tiembla');
          void b.offsetWidth;
          b.classList.add('tiembla');
          sonar('mal');
          ctx.decir(t('jg.puzle.no'), 'pensando');
        }
      });
      return b;
    });
    poner(monton, fichas);
    poner(mesa, tablero, monton);
    poner(acciones, ver);

    function completo() {
      tablero.classList.add('completo');
      monton.remove();
      sonar('campana');
      pista.textContent = t('jg.puzle.listo');
      const oir = el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(orden.map(f => f.es).join(' ')) }, `🔊 ${t('comun.escuchar')}`);
      const trad = el('p', { class: 'jg-trad' }, orden.map(f => tr(f.trad)).filter(Boolean).join(' '));
      const ultimo = p === parrafos.length - 1;
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, ultimo ? t('jg.puzle.terminar') : t('jg.puzle.otro'));
      seguir.addEventListener('click', () => {
        if (!ultimo) { p += 1; sonar('pagina'); ronda(); return; }
        fin();
      });
      poner(acciones, oir, ver);
      mesa.append(trad, seguir);
      seguir.focus({ preventScroll: true });
    }
  }

  function fin() {
    if (acabado) return;
    acabado = true;
    cuenta.textContent = '✓';
    pista.textContent = t('jg.puzle.fin');
    poner(acciones);
    poner(mesa, el('div', { class: 'jg-puzle-final' },
      parrafos.map(g => el('p', { class: 'jg-puzle-tablero completo', lang: ctx.LANG }, g.map(f => ctx.frase(f.es).nodo).flatMap(x => [x, ' ']))),
      el('p', { class: 'jg-puzle-fin' }, '🧩')));
    sonar('fanfarria');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-puzle' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.puzle.titulo')), cuenta),
    pista,
    mesa,
    acciones);
  if (parrafos.length) ronda(); else ctx.hecho();
  return { nodo };
}
