// =====================================================================
// LAS DIANAS — juego del tiro de la feria para elegir (bloques «test» y «huecos»)
// ---------------------------------------------------------------------
// En el puesto de la feria, cada opción es una diana con su cartel; van apareciendo una a una. Se dispara
// (toque o clic) a la que sea la respuesta buena. Si se acierta, la diana gira, sale una estrella y la
// tutora explica por qué; en un hueco, la palabra se coloca en la frase. Si se falla, queda el agujero,
// la diana cae un momento y la tutora explica por qué esa no era; se vuelve a disparar. Cada tiro se apunta.
// Vale para cualquier idioma: solo usa la pregunta, la frase y las opciones del bloque.
// =====================================================================

import { el, poner, enLinea } from '../js/dom.js';

export const juego = {
  nombre: 'dianas',
  icono: '🎯',
  tipos: ['test', 'traduccion', 'huecos'],
  sirve: () => true,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, alAzar } = ctx;
  const temporizadores = new Set();
  const luego = (fn, ms) => {
    if (ctx.quieto) { fn(); return; }
    const id = setTimeout(() => { temporizadores.delete(id); fn(); }, ms);
    temporizadores.add(id);
  };
  const opciones = ctx.barajar(bloque.opciones ?? []);
  const correcta = (bloque.opciones ?? []).find(o => o.correcta);
  const largas = opciones.some(o => String(tr(o.texto)).length > 22);
  const esHueco = bloque.tipo === 'huecos' && typeof bloque.frase === 'string' && /_{2,}/.test(bloque.frase);
  let resuelto = false;

  const pista = el('p', { class: 'jg-pista' }, t('jg.dianas.pista'));
  const nota = el('p', { class: 'jg-dianas-nota', 'aria-live': 'polite', hidden: true });
  const dianas = new Map();

  // ----- La frase con su hueco (solo en «huecos») -----
  let frase = null;
  let hueco = null;
  if (esHueco) {
    hueco = el('span', { class: 'jg-dianas-hueco', lang: ctx.LANG }, ' ');
    const partes = bloque.frase.split(/_{2,}/);
    frase = el('p', { class: 'jg-dianas-frase', lang: ctx.LANG },
      partes.flatMap((parte, i) => (i < partes.length - 1 ? [parte, i === 0 ? hueco : el('span', { class: 'jg-dianas-hueco' }, ' ')] : [parte])));
  }

  // ----- Las dianas -----
  const feria = el('div', { class: `jg-dianas-feria ${largas ? 'largas' : ''}` }, opciones.map((opcion, i) => {
    const texto = tr(opcion.texto);
    const diana = el('button', { type: 'button', class: 'jg-dianas-diana', style: `--i:${i}`, lang: esHueco ? ctx.LANG : null, 'aria-label': texto },
      el('span', { class: 'jg-dianas-disco', 'aria-hidden': 'true' },
        el('span', { class: 'jg-dianas-estrella' }, '⭐')),
      el('span', { class: 'jg-dianas-poste', 'aria-hidden': 'true' }),
      el('span', { class: 'jg-dianas-placa', 'aria-hidden': 'true' }, texto));
    diana.addEventListener('click', e => disparar(opcion, diana, texto, e));
    dianas.set(opcion, diana);
    return diana;
  }));

  // aparecen una a una (con movimiento reducido, todas a la vez)
  const lista = [...dianas.values()];
  lista.forEach((d, i) => luego(() => { d.classList.add('aparece'); if (!ctx.quieto) sonar('pop'); }, 350 + i * 750));

  function agujero(diana, e) {
    const disco = diana.querySelector('.jg-dianas-disco');
    const r = disco.getBoundingClientRect();
    // con el teclado (detail 0) o sin coordenadas, el tiro va al centro
    const dentro = e && e.detail > 0 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const x = dentro ? ((e.clientX - r.left) / r.width) * 100 : 50;
    const y = dentro ? ((e.clientY - r.top) / r.height) * 100 : 50;
    disco.append(el('span', { class: 'jg-dianas-agujero', 'aria-hidden': 'true', style: `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%` }));
  }

  function disparar(opcion, diana, texto, e) {
    if (resuelto || diana.classList.contains('fallada') || !diana.classList.contains('aparece')) return;
    sonar('flecha');
    agujero(diana, e);
    if (!opcion.correcta) {
      ctx.registrar(bloque, false);
      diana.classList.remove('cae');
      void diana.offsetWidth;
      diana.classList.add('cae', 'fallada');
      diana.setAttribute('aria-disabled', 'true');
      luego(() => sonar('mal'), 220);
      pista.textContent = t('jg.dianas.otra');
      const explicacion = `${alAzar(t('ej.animosError'))} ${tr(opcion.explicacion)}`.trim();
      ctx.decir(explicacion, 'pensando');
      nota.hidden = false;
      poner(nota, enLinea(explicacion));
      return;
    }
    resuelto = true;
    ctx.registrar(bloque, true);
    diana.classList.add('acierta');
    for (const d of dianas.values()) { d.disabled = true; if (d !== diana) d.classList.add('apagada'); }
    luego(() => { sonar('bien'); sonar('campana'); }, 200);
    pista.textContent = t('jg.dianas.premio');
    const explicacion = tr(opcion.explicacion);
    ctx.decir([alAzar(t('ej.felicitaciones')), explicacion].filter(Boolean).join(' '), 'contenta');
    if (explicacion) { nota.hidden = false; poner(nota, enLinea(explicacion)); }
    if (esHueco) {
      luego(() => completarHueco(texto), 500);
    } else {
      ctx.hecho();
    }
  }

  /** La palabra buena se coloca en el hueco y la frase queda con sus palabras pulsables y 🔊. */
  function completarHueco(texto) {
    poner(hueco, texto);
    hueco.classList.add('lleno');
    luego(() => {
      const completa = bloque.frase.replace(/_{2,}/, tr(correcta.texto));
      const { nodo: lista2 } = ctx.frase(completa);
      poner(frase, lista2, ' ', el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(completa) }, '🔊'));
      sonar('moneda');
      ctx.leerSiHayVoz(completa);
      ctx.hecho();
    }, 450);
  }

  const pregunta = tr(bloque.pregunta);
  const nodo = el('div', { class: 'jg-dianas' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, t('jg.dianas.titulo'))),
    pista,
    el('div', { class: 'jg-dianas-cartel' },
      pregunta && el('p', { class: 'jg-dianas-pregunta' }, enLinea(pregunta)),
      !esHueco && bloque.frase && el('p', { class: 'jg-dianas-frase', lang: ctx.LANG }, bloque.frase),
      frase),
    el('div', { class: 'jg-dianas-puesto' },
      el('span', { class: 'jg-dianas-luces', 'aria-hidden': 'true' }),
      el('span', { class: 'jg-dianas-toldo', 'aria-hidden': 'true' }),
      feria,
      el('span', { class: 'jg-dianas-mostrador', 'aria-hidden': 'true' })),
    nota);
  return { nodo, apagar: () => { for (const id of temporizadores) clearTimeout(id); temporizadores.clear(); } };
}
