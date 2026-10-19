// =====================================================================
// LOS GLOBOS — juego para completar la frase (bloque «huecos»)
// ---------------------------------------------------------------------
// La frase cuelga arriba con su hueco. Las opciones suben al cielo dentro de globos que se mecen.
// Se revienta uno: si es el bueno, la palabra cae al hueco y la frase queda completa (con sus palabras
// pulsables y 🔊); si no, el globo se pincha, la tutora explica por qué esa palabra no encaja y el
// globo vuelve a inflarse para volver a intentarlo. Cada intento se apunta.
// Vale para cualquier idioma: solo usa la frase y las opciones del bloque.
// =====================================================================

import { el, poner, enLinea } from '../js/dom.js';

export const juego = {
  nombre: 'globos',
  icono: '🎈',
  tipos: ['huecos'],
  sirve: bloque => typeof bloque.frase === 'string' && /_{2,}/.test(bloque.frase)
    && Array.isArray(bloque.opciones) && bloque.opciones.length >= 2 && bloque.opciones.some(o => o.correcta),
};

const COLORES = ['#e8505b', '#4f9be0', '#f0b429', '#57b86a', '#a56ad8', '#f08a4b'];

export function crear(bloque, ctx) {
  const { t, tr, sonar, alAzar } = ctx;
  const temporizadores = new Set();
  const luego = (fn, ms) => {
    if (ctx.quieto) { fn(); return; }
    const id = setTimeout(() => { temporizadores.delete(id); fn(); }, ms);
    temporizadores.add(id);
  };
  const opciones = ctx.barajar(bloque.opciones);
  const correcta = bloque.opciones.find(o => o.correcta);
  let resuelto = false;

  const pista = el('p', { class: 'jg-pista' }, t('jg.globos.pista'));
  const nota = el('p', { class: 'jg-globos-nota', 'aria-live': 'polite', hidden: true });
  const hueco = el('span', { class: 'jg-globos-hueco', lang: ctx.LANG }, ' ');
  const partes = bloque.frase.split(/_{2,}/);
  const frase = el('p', { class: 'jg-globos-frase', lang: ctx.LANG },
    partes.flatMap((parte, i) => (i < partes.length - 1 ? [parte, i === 0 ? hueco : el('span', { class: 'jg-globos-hueco' }, ' ')] : [parte])));
  const cielo = el('div', { class: 'jg-globos-cielo' });
  const globos = new Map();

  opciones.forEach((opcion, i) => {
    const texto = tr(opcion.texto);
    const globo = el('button', {
      type: 'button', class: 'jg-globos-globo', lang: ctx.LANG,
      style: `--c:${COLORES[i % COLORES.length]};--d:${(i * 0.35).toFixed(2)}s;--y:${[0, 26, 8, 34][i % 4]}px`,
    }, el('span', { class: 'jg-globos-cuerpo' }, el('span', { class: 'jg-globos-palabra' }, texto)), el('span', { class: 'jg-globos-hilo', 'aria-hidden': 'true' }));
    globo.addEventListener('click', () => reventar(opcion, globo, texto));
    globos.set(opcion, globo);
    cielo.append(el('div', { class: 'jg-globos-hueco-cielo' }, globo));
  });

  function reventar(opcion, globo, texto) {
    if (resuelto || globo.classList.contains('pincha')) return;
    sonar('pop');
    if (!opcion.correcta) {
      ctx.registrar(bloque, false);
      globo.classList.add('pincha');
      globo.disabled = true;
      luego(() => sonar('mal'), 200);
      pista.textContent = t('jg.globos.otro');
      const explicacion = `${alAzar(t('ej.animosError'))} ${tr(opcion.explicacion)}`.trim();
      ctx.decir(explicacion, 'pensando');
      nota.hidden = false;
      poner(nota, enLinea(explicacion));
      // lo fallado vuelve: el globo se infla otra vez
      luego(() => { globo.classList.remove('pincha'); globo.classList.add('infla'); globo.disabled = false; }, 1400);
      return;
    }
    resuelto = true;
    ctx.registrar(bloque, true);
    for (const g of globos.values()) g.disabled = true;
    // la palabra cae del globo al hueco
    const rGlobo = globo.querySelector('.jg-globos-palabra').getBoundingClientRect();
    const rHueco = hueco.getBoundingClientRect();
    const rEscena = escena.getBoundingClientRect();
    const cae = el('span', { class: 'jg-globos-cae', lang: ctx.LANG, 'aria-hidden': 'true' }, texto);
    cae.style.left = `${rGlobo.left - rEscena.left}px`;
    cae.style.top = `${rGlobo.top - rEscena.top}px`;
    cae.style.setProperty('--dx', `${rHueco.left - rGlobo.left}px`);
    cae.style.setProperty('--dy', `${rHueco.top - rGlobo.top}px`);
    escena.append(cae);
    globo.classList.add('revienta');
    sonar('bien');
    pista.textContent = t('jg.globos.premio');
    const explicacion = tr(opcion.explicacion);
    ctx.decir([alAzar(t('ej.felicitaciones')), explicacion].filter(Boolean).join(' '), 'contenta');
    luego(() => {
      cae.remove();
      sonar('moneda');
      poner(hueco, texto);
      hueco.classList.add('lleno');
      completar(explicacion);
    }, 700);
  }

  /** La frase completa, con sus palabras pulsables y 🔊, y se da el paso por hecho. */
  function completar(explicacion) {
    const completa = bloque.frase.replace(/_{2,}/, tr(correcta.texto));
    const { nodo: fraseLista } = ctx.frase(completa);
    poner(frase, fraseLista, ' ', el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(completa) }, '🔊'));
    frase.classList.add('completa');
    if (explicacion) { nota.hidden = false; poner(nota, enLinea(explicacion)); }
    ctx.leerSiHayVoz(completa);
    sonar('confeti');
    ctx.hecho();
  }

  const pregunta = tr(bloque.pregunta);
  const escena = el('div', { class: 'jg-globos-escena' },
    el('span', { class: 'jg-globos-sol', 'aria-hidden': 'true' }),
    el('span', { class: 'jg-globos-nube jg-globos-nube-1', 'aria-hidden': 'true' }),
    el('span', { class: 'jg-globos-nube jg-globos-nube-2', 'aria-hidden': 'true' }),
    el('div', { class: 'jg-globos-cartel' },
      pregunta && el('p', { class: 'jg-globos-pregunta' }, enLinea(pregunta)),
      frase),
    cielo,
    el('span', { class: 'jg-globos-hierba', 'aria-hidden': 'true' }));
  const nodo = el('div', { class: 'jg-globos' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, t('jg.globos.titulo'))),
    pista,
    escena,
    nota);
  return { nodo, apagar: () => { for (const id of temporizadores) clearTimeout(id); temporizadores.clear(); } };
}
