// =====================================================================
// EL DOBLAJE — juego para un diálogo (bloque «dialogo»)
// ---------------------------------------------------------------------
// Una pantalla de cine: sale la traducción de una frase, como subtítulo, y el personaje que habla (una
// tutora pintada, con su nombre). El alumno «dobla» la escena: elige qué dijo de verdad en el idioma
// que estudia entre tres opciones, la buena y dos frases parecidas de la lección. Un fallo no castiga:
// la tutora dice qué significa la opción elegida y la escena vuelve a rodarse al final. Al acertar, la
// tutora lee la frase en voz alta (si hay voz), que se ve con sus palabras pulsables.
// Vale para cualquier idioma: solo usa los datos de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const MAX_PERSONAJES = 4;
const MAX_ESCENAS = 6;

const textoTrad = (f, ctx) => String(ctx.tr(f.trad) ?? '').trim();
const conTrad = (lista, ctx) => lista.filter(f => f.es && textoTrad(f, ctx));

/** Parecido entre dos frases (0 a 1): bigramas de letras compartidos. Sirve en cualquier escritura. */
function parecido(a, b) {
  const pares = s => {
    const letras = [...s.toLowerCase().replace(/[\s\p{P}]+/gu, ' ').trim()];
    const m = new Map();
    for (let i = 0; i < letras.length - 1; i++) { const p = letras[i] + letras[i + 1]; m.set(p, (m.get(p) ?? 0) + 1); }
    return { m, n: Math.max(letras.length - 1, 0) };
  };
  const A = pares(a), B = pares(b);
  if (!A.n || !B.n) return 0;
  let comunes = 0;
  for (const [p, c] of A.m) comunes += Math.min(c, B.m.get(p) ?? 0);
  return (2 * comunes) / (A.n + B.n);
}

export const juego = {
  nombre: 'doblaje',
  icono: '🎬',
  tipos: ['dialogo'],
  sirve(bloque, ctx) {
    if (conTrad(bloque.frases ?? [], ctx).length < 2) return false;
    return new Set(ctx.frases().map(f => f.es)).size >= 3;
  },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, elenco } = ctx;
  const todas = conTrad(bloque.frases ?? [], ctx);
  const nombres = [...new Set(todas.map(f => f.quien).filter(Boolean))].slice(0, MAX_PERSONAJES);
  // solo se ruedan escenas de los personajes que salen en pantalla; sin repetir la misma frase
  const vistas = new Set();
  const escenas = ctx.barajar(todas.filter(f => (!f.quien || nombres.includes(f.quien)) && !vistas.has(f.es) && vistas.add(f.es))).slice(0, MAX_ESCENAS);
  const total = escenas.length;
  const cola = [...escenas];
  const resueltas = new Set();

  const cuenta = el('span', { class: 'jg-cuenta' }, `0 / ${total}`);
  const pista = el('p', { class: 'jg-pista', 'aria-live': 'polite' });
  const subtitulo = el('p', { class: 'jg-doblaje-subtitulo', 'aria-live': 'polite' });
  const dicha = el('div', { class: 'jg-doblaje-dicha' });
  const opciones = el('div', { class: 'jg-doblaje-opciones', role: 'group', 'aria-label': t('jg.doblaje.opciones') });
  const seguir = el('button', { type: 'button', class: 'es-boton jg-doblaje-seguir', hidden: true }, t('jg.doblaje.otra'));

  const actores = new Map(nombres.map((nombre, i) => [nombre, elenco.tutora(i === 0 ? elenco.protagonista() : elenco.otra(), `jg-doblaje-actor jg-doblaje-actor-${i + 1}`)]));
  const reparto = el('div', { class: 'jg-doblaje-reparto' }, [...actores].map(([nombre, yo]) =>
    el('div', { class: 'jg-doblaje-papel' }, yo.figura, el('span', { class: 'jg-doblaje-nombre' }, nombre))));

  function parecidas(f) {
    const vistas = new Set([f.es]);
    const candidatas = [];
    for (const g of ctx.frases()) {
      if (!g.es || vistas.has(g.es)) continue;
      vistas.add(g.es);
      // parecidas en letras y en largo (si no, la buena se notaría por el tamaño), con un poco de azar en los empates
      const [a, b] = [f.es.length, g.es.length];
      const largo = 1 - Math.min(1, Math.abs(a - b) / Math.max(a, b));
      candidatas.push({ g, puntos: parecido(f.es, g.es) + 0.6 * largo + Math.random() * 0.08 });
    }
    return candidatas.sort((a, b) => b.puntos - a.puntos).slice(0, 2).map(c => c.g);
  }

  function escena() {
    const f = cola[0];
    let resuelta = false;
    let fallada = false;
    seguir.hidden = true;
    seguir.classList.remove('jg-listo');
    cuenta.textContent = `${resueltas.size} / ${total}`;
    for (const [nombre, yo] of actores) yo.figura.classList.toggle('jg-habla', nombre === f.quien);
    actores.get(f.quien)?.gesto('presentar');
    subtitulo.textContent = textoTrad(f, ctx);
    if (!ctx.quieto) { subtitulo.classList.remove('sale'); void subtitulo.offsetWidth; subtitulo.classList.add('sale'); }
    poner(dicha);
    pista.textContent = f.quien ? t('jg.doblaje.pregunta', { quien: f.quien }) : t('jg.doblaje.preguntaSola');

    poner(opciones, ctx.barajar([f, ...parecidas(f)]).map(g => {
      const b = el('button', { type: 'button', class: 'jg-doblaje-opcion', lang: ctx.LANG }, g.es);
      b.addEventListener('click', () => {
        if (resuelta || b.disabled) return;
        if (g.es !== f.es) {
          b.disabled = true;
          b.classList.remove('tiembla'); void b.offsetWidth; b.classList.add('tiembla', 'mal');
          sonar('mal');
          ctx.decir(textoTrad(g, ctx) ? t('jg.doblaje.mal', { es: g.es, trad: textoTrad(g, ctx) }) : t('jg.doblaje.malSola'), 'pensando');
          if (!fallada) { fallada = true; cola.push(f); }
          return;
        }
        resuelta = true;
        b.classList.add('bien');
        for (const x of opciones.children) if (x !== b) x.disabled = true;
        sonar('bien');
        resueltas.add(f.es);
        cola.shift();
        cuenta.textContent = `${resueltas.size} / ${total}`;
        // la tutora lo dice con su voz (y en su globo); la frase queda escrita con sus palabras pulsables
        const yo = actores.get(f.quien);
        yo?.decir(f.es, 3600);
        yo?.reaccionar('contenta', 1200);
        ctx.leerSiHayVoz(f.es);
        poner(dicha,
          el('p', { class: 'jg-doblaje-escrita' }, ctx.frase(f.es).nodo),
          el('div', { class: 'jg-herramientas' }, el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(f.es) }, '🔊')));
        if (cola.length) {
          pista.textContent = f.quien ? t('jg.doblaje.bien', { quien: f.quien }) : t('jg.doblaje.bienSola');
          seguir.hidden = false;
          seguir.classList.add('jg-listo');
          seguir.focus({ preventScroll: true });
        } else {
          pista.textContent = t('jg.doblaje.fin');
          sonar('fanfarria');
          ctx.hecho();
        }
      });
      return b;
    }));
  }

  seguir.addEventListener('click', () => { sonar('pagina'); escena(); });

  const nodo = el('div', { class: 'jg-doblaje' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.doblaje.titulo')), cuenta),
    el('div', { class: 'jg-doblaje-cine es-limite' },
      el('span', { class: 'jg-doblaje-foco', 'aria-hidden': 'true' }),
      subtitulo,
      reparto),
    dicha,
    pista,
    opciones,
    el('div', { class: 'jg-doblaje-pie' }, seguir));
  escena();
  elenco.vigilar(nodo);
  return { nodo };
}
