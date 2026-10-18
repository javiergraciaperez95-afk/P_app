// =====================================================================
// EL DIÁLOGO REVUELTO — juego para un diálogo (bloque «dialogo»)
// ---------------------------------------------------------------------
// Las frases del diálogo llegan revueltas, cada una en una tarjeta. Hay que tocarlas en el orden de la
// conversación, una a una: la que está bien sube a una tira de arriba; la que se toca fuera de orden
// tiembla y la tutora dice qué significa para que se piense qué iría antes. Si el diálogo es largo,
// se juega en tandas de cuatro. Si en una tanda hubo fallos, esa tanda vuelve a salir una vez más.
// «Ver la traducción» enseña lo que dice cada tarjeta. Tocar una tarjeta la lee si hay voz.
// Vale para cualquier idioma: solo usa los datos de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const LARGO = 6;      // un diálogo de más frases se juega en tandas
const POR_TANDA = 4;

export const juego = {
  nombre: 'desorden',
  icono: '🧩',
  tipos: ['dialogo'],
  sirve(bloque) {
    // con frases repetidas todas iguales no habría orden que encontrar
    return new Set((bloque.frases ?? []).filter(f => f.es).map(f => f.es)).size >= 3;
  },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const frases = (bloque.frases ?? []).filter(f => f.es);
  const tandas = [];
  if (frases.length > LARGO) {
    for (let i = 0; i < frases.length; i += POR_TANDA) tandas.push(frases.slice(i, i + POR_TANDA));
    // una tanda de una sola frase no tiene gracia: se junta con la anterior
    if (tandas.length > 1 && tandas.at(-1).length === 1) tandas.at(-2).push(...tandas.pop());
  } else tandas.push(frases);

  const temporizadores = new Set();
  let vivo = true;
  const luego = (fn, ms) => {
    if (ctx.quieto) ms = Math.min(ms, 80);
    const id = setTimeout(() => { temporizadores.delete(id); if (vivo) fn(); }, ms);
    temporizadores.add(id);
  };

  const cuenta = el('span', { class: 'jg-cuenta' }, `0 / ${frases.length}`);
  const pista = el('p', { class: 'jg-pista', 'aria-live': 'polite' });
  const tira = el('ol', { class: 'jg-desorden-tira', 'aria-label': t('jg.desorden.tira') });
  const mesa = el('div', { class: 'jg-desorden-mesa' });
  const ver = el('button', { type: 'button', class: 'jg-ayuda jg-desorden-ver', 'aria-pressed': 'false' }, `? ${t('jg.verTraduccion')}`);
  const nodo = el('div', { class: 'jg-desorden' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.desorden.titulo')), cuenta),
    el('div', { class: 'jg-desorden-barra' }, ver),
    tira, mesa, pista);
  ver.addEventListener('click', () => {
    const abrir = !nodo.classList.contains('con-trad');
    nodo.classList.toggle('con-trad', abrir);
    ver.setAttribute('aria-pressed', String(abrir));
    sonar(abrir ? 'papel' : 'cerrar');
  });

  let colocadas = 0;

  function tanda(n, repetida) {
    const grupo = tandas[n];
    let siguiente = 0;
    let errores = 0;
    const antesDeLaTanda = colocadas;
    pista.textContent = tandas.length > 1
      ? `${t('jg.desorden.tanda', { n: n + 1, total: tandas.length })} · ${t('jg.desorden.ordena')}`
      : t('jg.desorden.ordena');
    if (repetida) pista.textContent = t('jg.desorden.otraVez');

    // revueltas de verdad: nunca llegan ya en orden
    let revueltas = ctx.barajar(grupo);
    for (let k = 0; k < 12 && revueltas.every((f, i) => f.es === grupo[i].es); k++) revueltas = ctx.barajar(grupo);

    poner(mesa, revueltas.map((f, i) => {
      const c = el('button', { type: 'button', class: 'jg-desorden-carta', style: `--i:${i}` },
        f.quien && el('span', { class: 'jg-desorden-quien' }, f.quien),
        el('span', { class: 'jg-desorden-es', lang: ctx.LANG }, f.es),
        el('span', { class: 'jg-desorden-trad' }, tr(f.trad)));
      c.addEventListener('click', () => {
        if (c.classList.contains('puesta')) return;
        ctx.leerSiHayVoz(f.es);
        const toca = grupo[siguiente];
        if (f.es !== toca.es) {
          errores += 1;
          c.classList.remove('tiembla'); void c.offsetWidth; c.classList.add('tiembla');
          sonar('mal');
          ctx.decir(tr(f.trad) ? t('jg.desorden.mal', { es: f.es, trad: tr(f.trad) }) : t('jg.desorden.malSola'), 'pensando');
          return;
        }
        // bien: la tarjeta sube a la tira
        siguiente += 1;
        colocadas += 1;
        c.classList.add('puesta');
        c.disabled = true;
        cuenta.textContent = `${colocadas} / ${frases.length}`;
        sonar('escala', { valor: Math.min(1, siguiente / Math.max(grupo.length, 1)) });
        tira.append(el('li', { class: 'jg-desorden-puesta', 'data-tanda': n },
          f.quien && el('b', {}, `${f.quien}: `),
          el('span', { lang: ctx.LANG }, f.es),
          el('span', { class: 'jg-desorden-trad' }, ` — ${tr(f.trad)}`)));
        if (siguiente < grupo.length) return;
        // tanda completa
        if (errores > 0 && !repetida) {
          // lo fallado vuelve: la tanda sale otra vez, una sola vez más
          luego(() => {
            sonar('papel');
            for (const li of [...tira.querySelectorAll(`li[data-tanda="${n}"]`)]) li.remove();
            colocadas = antesDeLaTanda;
            cuenta.textContent = `${colocadas} / ${frases.length}`;
            tanda(n, true);
          }, 900);
          pista.textContent = t('jg.desorden.casi');
          return;
        }
        if (n + 1 < tandas.length) {
          sonar('bien');
          pista.textContent = t('jg.desorden.tandaHecha');
          luego(() => tanda(n + 1, false), 1100);
          return;
        }
        pista.textContent = t('jg.desorden.fin');
        mesa.hidden = true;
        sonar('fanfarria');
        ctx.hecho();
      });
      return c;
    }));
  }

  tanda(0, false);
  return { nodo, apagar() { vivo = false; for (const id of temporizadores) clearTimeout(id); } };
}
