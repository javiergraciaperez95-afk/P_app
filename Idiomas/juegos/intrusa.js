// =====================================================================
// LA INTRUSA — juego para leer un texto (bloque «texto», la lectura literaria)
// ---------------------------------------------------------------------
// En cada frase se ha colado una palabra de más, sacada de otra frase de la lección. Hay que leer la
// frase y tocar la intrusa. Acertar la echa fuera y deja ver la frase limpia con su traducción (y se
// puede oír); fallar no castiga: la tutora avisa de que esa palabra sí va y se sigue buscando, pero la
// frase volverá más tarde con otra intrusa.
// Vale para cualquier idioma: solo usa las frases de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const RE_PALABRA = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const MAX = 8;
// en el modo desarrollador la respuesta queda marcada en la página, para las pruebas automáticas
const enPruebas = () => { try { return Boolean(sessionStorage.getItem('idiomas-desarrollador')); } catch { return false; } };

/** Parte un texto en trozos: palabras y lo que hay entre ellas (espacios, signos). */
function trocear(texto) {
  const piezas = [];
  let c = 0;
  for (const m of texto.matchAll(RE_PALABRA)) {
    if (m.index > c) piezas.push({ texto: texto.slice(c, m.index) });
    piezas.push({ texto: m[0], palabra: true });
    c = m.index + m[0].length;
  }
  if (c < texto.length) piezas.push({ texto: texto.slice(c) });
  return piezas;
}
const palabrasDe = texto => trocear(texto).filter(x => x.palabra).map(x => x.texto);

export const juego = {
  nombre: 'intrusa',
  icono: '🕵️',
  tipos: ['texto'],
  // hace falta una frase con al menos tres palabras y otra de la que sacar la intrusa
  sirve: bloque => {
    const f = (bloque.frases ?? []).filter(x => x.es);
    return f.length >= 2 && f.filter(x => palabrasDe(x.es).length >= 3).length >= 1;
  },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, LANG } = ctx;
  const todas = (bloque.frases ?? []).filter(f => f.es);
  const minus = x => x.toLocaleLowerCase(LANG);

  // frases con las que se juega (como mucho MAX, en el orden del texto)
  const buenas = todas.filter(f => palabrasDe(f.es).length >= 3);
  const elegidas = buenas.length > MAX ? ctx.barajar(buenas).slice(0, MAX).sort((a, b) => todas.indexOf(a) - todas.indexOf(b)) : buenas;
  const total = elegidas.length;
  const cola = [...elegidas];
  let hechas = 0;
  let acabado = false;

  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const mesa = el('div', { class: 'jg-intrusa-mesa' });

  /** Una palabra de otra frase que no esté en esta (ni sea un nombre propio). */
  function intrusaPara(f) {
    const propias = new Set(palabrasDe(f.es).map(minus));
    const candidatas = [];
    for (const otra of todas) {
      if (otra === f) continue;
      palabrasDe(otra.es).forEach((w, i) => {
        const normal = i === 0 || w === minus(w);
        if (normal && w.length >= 2 && !propias.has(minus(w))) candidatas.push(i === 0 ? minus(w) : w);
      });
    }
    return candidatas.length ? ctx.alAzar(candidatas) : null;
  }

  function presentar() {
    cuenta.textContent = `${hechas} / ${total}`;
    pista.textContent = t('jg.intrusa.pista');
    const f = cola.shift();
    let fallada = false;
    const intrusa = intrusaPara(f);
    if (!intrusa) { hechas += 1; return siguiente(); }

    // la intrusa se cuela entre las palabras (no la primera, y a poder ser no la última)
    const piezas = trocear(f.es);
    const posiciones = piezas.map((x, i) => (x.palabra ? i : -1)).filter(i => i >= 0);
    const entre = posiciones.length >= 3 ? posiciones.slice(1, -1) : posiciones.slice(1);
    const tras = ctx.alAzar(entre.length ? entre : posiciones);
    const resultado = [];
    piezas.forEach((x, i) => {
      resultado.push(x);
      if (i === tras) resultado.push({ texto: ' ' }, { texto: intrusa, palabra: true, intrusa: true });
    });

    const botones = [];
    const frase = el('p', { class: 'jg-intrusa-frase', lang: LANG }, resultado.map(x => {
      if (!x.palabra) return x.texto;
      const b = el('button', { type: 'button', class: 'jg-intrusa-palabra' }, x.texto);
      if (x.intrusa && enPruebas()) b.dataset.respuesta = '1';
      b.addEventListener('click', () => {
        if (frase.classList.contains('resuelta')) return;
        if (x.intrusa) {
          frase.classList.add('resuelta');
          b.classList.add('fuera');
          for (const o of botones) o.disabled = true;
          sonar('pop');
          resolver(f, fallada);
        } else {
          fallada = true;
          b.classList.remove('tiembla');
          void b.offsetWidth;
          b.classList.add('tiembla');
          sonar('mal');
          ctx.decir(t('jg.intrusa.no', { palabra: x.texto }), 'pensando');
        }
      });
      botones.push(b);
      return b;
    }));
    poner(mesa, frase);
  }

  function resolver(f, fallada) {
    hechas += fallada ? 0 : 1;
    if (fallada) cola.push(f);
    cuenta.textContent = `${hechas} / ${total}`;
    pista.textContent = t('jg.intrusa.ok');
    sonar('bien');
    const trad = tr(f.trad);
    const ultima = cola.length === 0;
    const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, ultima ? t('jg.intrusa.terminar') : t('jg.intrusa.otra'));
    seguir.addEventListener('click', () => { sonar('pagina'); siguiente(); });
    const oir = el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(f.es) }, `🔊 ${t('comun.escuchar')}`);
    setTimeout(() => {
      if (acabado || !mesa.isConnected) return;
      // la frase limpia sustituye a la que tenía la intrusa
      poner(mesa, el('div', { class: 'jg-intrusa-limpia' },
        el('p', { class: 'jg-intrusa-frase limpia', lang: LANG }, ctx.frase(f.es).nodo),
        trad && el('p', { class: 'jg-trad' }, trad),
        el('div', { class: 'jg-herramientas' }, oir),
        seguir));
      ctx.leerSiHayVoz(f.es);
      seguir.focus({ preventScroll: true });
    }, ctx.quieto ? 0 : 450);
  }

  function siguiente() {
    if (cola.length) return presentar();
    fin();
  }

  function fin() {
    if (acabado) return;
    acabado = true;
    cuenta.textContent = `${total} / ${total}`;
    pista.textContent = t('jg.intrusa.fin');
    poner(mesa, el('p', { class: 'jg-intrusa-premio' }, '🕵️'));
    sonar('fanfarria');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-intrusa' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.intrusa.titulo')), cuenta),
    pista,
    mesa);
  if (total) presentar(); else ctx.hecho();
  return { nodo };
}
