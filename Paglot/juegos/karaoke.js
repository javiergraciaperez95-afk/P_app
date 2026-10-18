// =====================================================================
// EL KARAOKE — juego para leer un texto (bloque «texto», la lectura literaria)
// ---------------------------------------------------------------------
// La tutora lee la frase (si el dispositivo tiene voz) y una luz va pasando por las palabras a un ritmo
// tranquilo; sin voz, la luz va igual. El alumno toca las palabras de la frase EN ORDEN, siguiendo la
// luz. Si va por delante de la luz, vale; si se queda atrás, la palabra que toca late; si toca otra,
// la tutora le dice cuál toca y la frase volverá más tarde. Al terminar cada frase sale su traducción.
// Vale para cualquier idioma: solo usa las frases de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';
import { hayVoz } from '../js/sonidos.js';

const RE_PALABRA = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const MAX = 6;
const RITMO_CON_VOZ = 600;
const RITMO_SIN_VOZ = 900;

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

export const juego = {
  nombre: 'karaoke',
  icono: '🎤',
  tipos: ['texto'],
  sirve: bloque => (bloque.frases ?? []).some(f => f.es && trocear(f.es).filter(x => x.palabra).length >= 2),
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, LANG } = ctx;
  const buenas = (bloque.frases ?? []).filter(f => f.es && trocear(f.es).filter(x => x.palabra).length >= 2);
  const elegidas = buenas.length > MAX ? ctx.barajar(buenas).slice(0, MAX).sort((a, b) => bloque.frases.indexOf(a) - bloque.frases.indexOf(b)) : buenas;
  const total = elegidas.length;
  const cola = [...elegidas];
  let hechas = 0;
  let acabado = false;
  let reloj = null;

  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const escena = el('div', { class: 'jg-karaoke-escena' });
  const parar = () => { clearInterval(reloj); reloj = null; };

  function cantar() {
    const f = cola.shift();
    const palabras = [];
    let siguiente = 0; // la palabra que toca
    let luz = -1; // por donde va la luz
    let fallada = false;
    const conVoz = hayVoz();

    cuenta.textContent = `${hechas} / ${total}`;
    pista.textContent = conVoz ? t('jg.karaoke.pistaVoz') : t('jg.karaoke.pista');

    const frase = el('p', { class: 'jg-karaoke-frase', lang: LANG }, trocear(f.es).map(x => {
      if (!x.palabra) return x.texto;
      const i = palabras.length;
      const b = el('button', { type: 'button', class: 'jg-karaoke-palabra' }, x.texto);
      b.addEventListener('click', () => {
        if (siguiente >= palabras.length) return;
        if (i === siguiente) {
          b.classList.add('cantada');
          b.classList.remove('suena', 'toca');
          sonar('escala', { valor: (i + 1) / palabras.length });
          siguiente += 1;
          luz = Math.max(luz, siguiente - 1);
          pintar();
          if (siguiente === palabras.length) terminar();
        } else {
          fallada = true;
          b.classList.remove('tiembla');
          void b.offsetWidth;
          b.classList.add('tiembla');
          sonar('mal');
          ctx.decir(t('jg.karaoke.no', { palabra: palabras[siguiente].textContent }), 'pensando');
          pintar(true);
        }
      });
      palabras.push(b);
      return b;
    }));

    // la luz sigue su ritmo; la palabra que toca late si la luz ya la pasó
    function pintar(avisar = false) {
      palabras.forEach((b, i) => {
        const hecha = i < siguiente;
        b.classList.toggle('suena', !hecha && i === luz);
        b.classList.toggle('toca', !hecha && i === siguiente && (luz > siguiente || avisar));
      });
    }
    parar();
    reloj = setInterval(() => {
      if (luz < palabras.length - 1) { luz += 1; pintar(); } else parar();
    }, conVoz ? RITMO_CON_VOZ : RITMO_SIN_VOZ);

    function terminar() {
      parar();
      hechas += fallada ? 0 : 1;
      if (fallada) cola.push(f);
      cuenta.textContent = `${hechas} / ${total}`;
      pista.textContent = t('jg.karaoke.ok');
      sonar('moneda');
      frase.classList.add('completa');
      const trad = tr(f.trad);
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, cola.length ? t('jg.karaoke.otra') : t('jg.karaoke.terminar'));
      seguir.addEventListener('click', () => { sonar('pagina'); if (cola.length) cantar(); else fin(); });
      poner(escena,
        el('p', { class: 'jg-karaoke-frase completa', lang: LANG }, ctx.frase(f.es).nodo),
        trad && el('p', { class: 'jg-trad' }, trad),
        el('div', { class: 'jg-herramientas' }, el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(f.es) }, `🔊 ${t('comun.escuchar')}`)),
        seguir);
      seguir.focus({ preventScroll: true });
    }

    const oir = el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(f.es) }, `🔊 ${t('comun.escuchar')}`);
    poner(escena, frase, el('div', { class: 'jg-herramientas' }, oir));
    ctx.leerSiHayVoz(f.es);
  }

  function fin() {
    if (acabado) return;
    acabado = true;
    parar();
    cuenta.textContent = `${total} / ${total}`;
    pista.textContent = t('jg.karaoke.fin');
    poner(escena, el('p', { class: 'jg-karaoke-premio' }, '🎤'));
    sonar('fanfarria');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-karaoke' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.karaoke.titulo')), cuenta),
    pista,
    el('div', { class: 'jg-karaoke-escenario' }, el('span', { class: 'jg-karaoke-focos', 'aria-hidden': 'true' }), escena));
  if (total) cantar(); else ctx.hecho();
  return { nodo, apagar: parar };
}
