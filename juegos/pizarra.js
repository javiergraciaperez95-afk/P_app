// =====================================================================
// LA PIZARRA — explicación o gramática: el texto sale a trozos, escrito con tiza, y hay que darle a
// «Entendido» para que salga el siguiente. Al final, los ejemplos (si los hay), con su análisis.
// Para no pasar sin leer: las palabras en negrita de cada trozo se rodean con tiza (un toque cada una) antes de
// poder seguir (tres como mucho); si el trozo no tiene negritas, «Entendido» se enciende tras un momento de lectura.
// =====================================================================

import { el, textoConFormato } from '../js/dom.js';
import { trozosDe } from './ayuda-trozos.js';

/** La pizarra: el texto de una explicación (o de la gramática) a trozos, y los ejemplos al final. */
export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const trozos = trozosDe(tr(bloque.texto));
  const ejemplos = bloque.ejemplos ?? [];
  const lista = el('div', { class: 'jg-pizarra-texto' });
  const aviso = el('p', { class: 'jg-rodea-aviso' }, t('jg.pizarra.rodea'));
  const boton = el('button', { type: 'button', class: 'es-boton jg-entendido' }, t('jg.entendido'));
  const cuenta = el('span', { class: 'jg-cuenta' });
  let n = 0;
  const total = trozos.length + ejemplos.length;
  const pintarCuenta = () => { cuenta.textContent = `${n} / ${total}`; };
  let espera = null;
  /** Bloquea «Entendido» hasta rodear las negritas del trozo (o hasta que pase el rato de leerlo). */
  function prepararTrozo(nodo, texto) {
    const claves = [...nodo.querySelectorAll('strong')];
    clearTimeout(espera);
    aviso.hidden = !claves.length;
    if (!claves.length) {
      boton.disabled = true;
      espera = setTimeout(() => { boton.disabled = false; boton.classList.add('jg-listo'); }, Math.min(1500, 400 + texto.length * 12));
      return;
    }
    boton.disabled = true;
    boton.classList.remove('jg-listo');
    // con muchas negritas basta con rodear tres (las demás se pueden rodear igual, por gusto)
    let quedan = Math.min(3, claves.length);
    for (const fuerte of claves) {
      const rodear = el('button', { type: 'button', class: 'jg-rodea', 'data-sonido': 'nada' }, fuerte.textContent);
      rodear.addEventListener('click', () => {
        if (rodear.classList.contains('rodeada')) return;
        rodear.classList.add('rodeada');
        sonar('tiza');
        quedan -= 1;
        if (quedan === 0) {
          boton.disabled = false;
          boton.classList.add('jg-listo');
          aviso.hidden = true;
          // rodeadas las negritas, el trozo ya se ha leído: el siguiente sale solo
          clearTimeout(espera);
          espera = setTimeout(() => { if (boton.isConnected && !boton.disabled && !boton.hidden) boton.click(); }, ctx.quieto ? 300 : 750);
        }
      });
      fuerte.replaceWith(rodear);
    }
  }
  function mostrar() {
    if (n < trozos.length) {
      const trozo = el('div', { class: 'jg-tiza' }, textoConFormato(trozos[n]));
      lista.append(trozo);
      prepararTrozo(trozo, trozos[n]);
    } else {
      clearTimeout(espera);
      boton.disabled = false;
      aviso.hidden = true;
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
  boton.addEventListener('click', () => { clearTimeout(espera); if (boton.disabled || boton.hidden) return; boton.classList.remove('jg-listo'); sonar('tiza'); mostrar(); });
  mostrar();
  const nodo = el('div', { class: 'jg-pizarra' },
    el('div', { class: 'jg-pizarra-marco' }, bloque.titulo && el('h2', {}, tr(bloque.titulo)), aviso, lista, el('div', { class: 'jg-pizarra-pie' }, cuenta, boton)),
    el('span', { class: 'jg-pizarra-patas', 'aria-hidden': 'true' }));
  return { nodo, apagar: () => clearTimeout(espera) };
}
