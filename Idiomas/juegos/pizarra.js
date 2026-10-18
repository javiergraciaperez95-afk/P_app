// =====================================================================
// LA PIZARRA — explicación o gramática: el texto sale a trozos, escrito con tiza, y hay que darle a
// «Entendido» para que salga el siguiente. Al final, los ejemplos (si los hay), con su análisis.
// =====================================================================

import { el, textoConFormato } from '../js/dom.js';

/** La pizarra: el texto de una explicación (o de la gramática) a trozos, y los ejemplos al final. */
export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const trozos = tr(bloque.texto).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  const ejemplos = bloque.ejemplos ?? [];
  const lista = el('div', { class: 'jg-pizarra-texto' });
  const boton = el('button', { type: 'button', class: 'es-boton jg-entendido' }, t('jg.entendido'));
  const cuenta = el('span', { class: 'jg-cuenta' });
  let n = 0;
  const total = trozos.length + ejemplos.length;
  const pintarCuenta = () => { cuenta.textContent = `${n} / ${total}`; };
  function mostrar() {
    if (n < trozos.length) {
      lista.append(el('div', { class: 'jg-tiza' }, textoConFormato(trozos[n])));
    } else {
      const e = ejemplos[n - trozos.length];
      const f = ctx.frase(e.es);
      lista.append(el('div', { class: 'jg-tiza jg-ejemplo' },
        el('p', {}, f.nodo, ' ', el('button', { type: 'button', class: 'boton-icono jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(e.es) }, '🔊')),
        e.trad && el('p', { class: 'jg-trad' }, tr(e.trad)),
        ctx.analisis(e, `jg-an-${bloque.id ?? 'g'}-${n}`)));
      ctx.leerSiHayVoz(e.es);
    }
    n += 1;
    pintarCuenta();
    lista.lastChild.scrollIntoView?.({ block: 'nearest', behavior: ctx.quieto ? 'auto' : 'smooth' });
    if (n >= total) { boton.hidden = true; ctx.hecho(); }
  }
  boton.addEventListener('click', () => { sonar('tiza'); mostrar(); });
  mostrar();
  const nodo = el('div', { class: 'jg-pizarra' },
    el('div', { class: 'jg-pizarra-marco' }, bloque.titulo && el('h2', {}, tr(bloque.titulo)), lista, el('div', { class: 'jg-pizarra-pie' }, cuenta, boton)),
    el('span', { class: 'jg-pizarra-patas', 'aria-hidden': 'true' }));
  return { nodo };
}
