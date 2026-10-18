// =====================================================================
// EL TREN — juego para ordenar una frase (bloque «ordenar»)
// ---------------------------------------------------------------------
// Las palabras de la frase son vagones revueltos en la estación. La traducción es la guía: hay que ir
// enganchando los vagones a la locomotora en el orden de la frase. Si el vagón no toca ahora, rebota y
// la tutora da una pista (con varios fallos seguidos, el bueno se pone a brillar); cada intento se apunta.
// Con todos los vagones enganchados el tren pita y arranca, y la frase queda escrita con sus palabras
// pulsables y 🔊. Vale para cualquier idioma: solo usa la frase y la traducción del bloque.
// =====================================================================

import { el, poner, enLinea } from '../js/dom.js';
import { normalizarRespuesta } from '../js/exercises.js';

export const juego = {
  nombre: 'tren',
  icono: '🚂',
  tipos: ['ordenar'],
  sirve: bloque => typeof bloque.frase === 'string' && bloque.frase.trim().split(/\s+/).length >= 2,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, alAzar } = ctx;
  const temporizadores = new Set();
  const luego = (fn, ms) => {
    if (ctx.quieto) { fn(); return; }
    const id = setTimeout(() => { temporizadores.delete(id); fn(); }, ms);
    temporizadores.add(id);
  };
  // como en el ejercicio de siempre: las palabras sin el signo final
  const palabras = bloque.frase.trim().split(/\s+/).map(p => p.replace(/[.,!?;:]+$/, ''));
  const norm = palabras.map(p => normalizarRespuesta(p));
  let patio = ctx.barajar(palabras.map((_, i) => i));
  for (let intento = 0; intento < 5 && patio.every((v, i) => v === i); intento++) patio = ctx.barajar(patio);
  const enganchados = [];
  let fallosSeguidos = 0;
  let terminado = false;

  const pista = el('p', { class: 'jg-pista' }, t('jg.tren.pista'));
  const cuenta = el('span', { class: 'jg-cuenta' }, `0 / ${palabras.length}`);
  const via = el('div', { class: 'jg-tren-via' });
  const estacion = el('div', { class: 'jg-tren-patio', role: 'group', 'aria-label': t('jg.tren.patio') });

  const ruedas = () => el('span', { class: 'jg-tren-ruedas', 'aria-hidden': 'true' }, el('i'), el('i'));
  const vagon = (i, atributos = {}) => el('button', { type: 'button', class: 'jg-tren-vagon', lang: ctx.LANG, ...atributos },
    el('span', { class: 'jg-tren-palabra' }, palabras[i]), ruedas());

  function pintarVia() {
    const loco = el('div', { class: 'jg-tren-loco', 'aria-hidden': 'true' },
      el('span', { class: 'jg-tren-humo' }), el('span', { class: 'jg-tren-humo jg-tren-humo-2' }),
      el('span', { class: 'jg-tren-chimenea' }), el('span', { class: 'jg-tren-cabina' }), el('span', { class: 'jg-tren-faro' }), ruedas());
    poner(via, loco,
      enganchados.map(i => el('div', { class: 'jg-tren-vagon jg-tren-enganchado', lang: ctx.LANG }, el('span', { class: 'jg-tren-palabra' }, palabras[i]), ruedas())),
      !terminado && el('div', { class: 'jg-tren-siguiente', 'aria-hidden': 'true' }, '?'));
    via.querySelectorAll('.jg-tren-enganchado')[enganchados.length - 1]?.classList.add('nuevo');
  }

  function pintarPatio() {
    poner(estacion, patio.map(i => {
      const b = vagon(i);
      b.addEventListener('click', () => enganchar(i, b));
      return b;
    }));
  }

  function enganchar(i, boton) {
    if (terminado) return;
    const k = enganchados.length;
    if (norm[i] !== norm[k]) {
      fallosSeguidos += 1;
      ctx.registrar(bloque, false);
      sonar('mal');
      boton.classList.remove('tiembla');
      void boton.offsetWidth;
      boton.classList.add('tiembla');
      ctx.decir(`${alAzar(t('ej.animosError'))} ${t('jg.tren.noToca', { n: k + 1 })}`, 'pensando');
      if (fallosSeguidos >= 3) {
        // con tres fallos seguidos, el vagón que toca se pone a brillar
        const buena = [...estacion.children].find((b, j) => norm[patio[j]] === norm[k]);
        buena?.classList.add('brilla');
        pista.textContent = t('jg.tren.brilla');
      }
      return;
    }
    fallosSeguidos = 0;
    patio = patio.filter(x => x !== i);
    enganchados.push(i);
    sonar('escala', { valor: (k + 1) / palabras.length });
    sonar('pop');
    cuenta.textContent = `${enganchados.length} / ${palabras.length}`;
    pista.textContent = t('jg.tren.pista');
    if (enganchados.length === palabras.length) { terminado = true; pintarVia(); pintarPatio(); llegada(); return; }
    pintarVia();
    pintarPatio();
    estacion.querySelector('.jg-tren-vagon')?.focus({ preventScroll: true });
  }

  function llegada() {
    ctx.registrar(bloque, true);
    pista.textContent = t('jg.tren.arranca');
    sonar('silbato');
    luego(() => sonar('pasos'), 500);
    via.classList.add('sale');
    const explicacion = tr(bloque.explicacion);
    ctx.decir([alAzar(t('ej.felicitaciones')), explicacion].filter(Boolean).join(' '), 'contenta');
    const { nodo: fraseLista } = ctx.frase(bloque.frase);
    estacion.hidden = true;
    luego(() => sonar('fanfarria'), 600);
    // cuando el tren se ha ido, la vía vacía se recoge y la frase sube
    luego(() => { escena.hidden = true; }, 1200);
    cartaFinal.hidden = false;
    poner(cartaFinal,
      el('p', { class: 'jg-tren-frase', lang: ctx.LANG }, fraseLista, ' ',
        el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(bloque.frase) }, '🔊')),
      bloque.traduccion && el('p', { class: 'jg-trad' }, tr(bloque.traduccion)),
      explicacion && el('p', { class: 'jg-tren-explica' }, enLinea(explicacion)));
    ctx.leerSiHayVoz(bloque.frase);
    ctx.hecho();
  }

  const escena = el('div', { class: 'jg-tren-escena' },
    el('span', { class: 'jg-tren-montes', 'aria-hidden': 'true' }),
    via,
    el('span', { class: 'jg-tren-carril', 'aria-hidden': 'true' }));
  const cartaFinal = el('div', { class: 'jg-tren-final', hidden: true, 'aria-live': 'polite' });
  const guia = tr(bloque.traduccion);
  const pregunta = tr(bloque.pregunta);
  pintarVia();
  pintarPatio();
  const nodo = el('div', { class: 'jg-tren' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, t('jg.tren.titulo')), cuenta),
    pista,
    el('div', { class: 'jg-tren-cartel' },
      pregunta && el('p', { class: 'jg-tren-pregunta' }, enLinea(pregunta)),
      guia && el('p', { class: 'jg-tren-guia' }, el('span', { class: 'jg-tren-etiqueta' }, t('jg.tren.guia')), ` «${guia}»`)),
    escena,
    estacion,
    cartaFinal);
  return { nodo, apagar: () => { for (const id of temporizadores) clearTimeout(id); temporizadores.clear(); } };
}
