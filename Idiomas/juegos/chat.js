// =====================================================================
// EL CHAT — juego para un diálogo (bloque «dialogo»)
// ---------------------------------------------------------------------
// El diálogo es una conversación de mensajería. Los mensajes de los demás personajes llegan como
// burbujas (con su «escribiendo…»); el alumno hace de segundo personaje: cuando le toca, elige su
// mensaje entre tres (el correcto y dos frases de otros sitios de la lección) y su burbuja sale a la
// derecha. Un fallo no castiga: la tutora dice qué significa lo que se ha elegido y se vuelve a
// intentar; al final, los turnos fallados se repiten en un repaso. Las palabras de las burbujas son
// pulsables (ficha con pronunciación) y «?» enseña la traducción.
// Vale para cualquier idioma: solo usa los datos de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';

const quienes = bloque => [...new Set((bloque.frases ?? []).filter(f => f.es).map(f => f.quien).filter(Boolean))];

export const juego = {
  nombre: 'chat',
  icono: '💬',
  tipos: ['dialogo'],
  sirve(bloque, ctx) {
    const frases = (bloque.frases ?? []).filter(f => f.es);
    if (frases.length < 4 || quienes(bloque).length < 2) return false;
    // hacen falta otras dos frases distintas para las opciones
    return new Set(ctx.frases().map(f => f.es)).size >= 3;
  },
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const frases = (bloque.frases ?? []).filter(f => f.es);
  const nombres = quienes(bloque);
  const yo = nombres[1];
  const otros = nombres.filter(n => n !== yo);
  const grupo = nombres.length > 2;
  const turnos = frases.filter(f => f.quien === yo).length;
  const temporizadores = new Set();
  let vivo = true;
  const luego = (fn, ms) => {
    if (ctx.quieto) ms = Math.min(ms, 80);
    const id = setTimeout(() => { temporizadores.delete(id); if (vivo) fn(); }, ms);
    temporizadores.add(id);
  };

  const cuenta = el('span', { class: 'jg-cuenta' }, `0 / ${turnos}`);
  const pista = el('p', { class: 'jg-pista', 'aria-live': 'polite' });
  const hilo = el('div', { class: 'jg-chat-hilo', role: 'log', 'aria-live': 'polite' });
  const opciones = el('div', { class: 'jg-chat-opciones', role: 'group', 'aria-label': t('jg.chat.opciones') });
  const abajo = () => { hilo.scrollTop = hilo.scrollHeight; };
  const falladas = [];
  let hechos = 0;

  /** Una burbuja con la frase (palabras pulsables), 🔊 y «?» para la traducción. */
  function burbuja(f, propia, k) {
    const { nodo } = ctx.frase(f.es);
    const trad = el('p', { class: 'jg-chat-trad', hidden: true }, tr(f.trad));
    const ver = el('button', { type: 'button', class: 'jg-chat-boton', 'aria-expanded': 'false', 'aria-label': t('jg.verTraduccion') }, '?');
    ver.addEventListener('click', () => {
      const abrir = trad.hidden;
      trad.hidden = !abrir;
      ver.setAttribute('aria-expanded', String(abrir));
      sonar(abrir ? 'papel' : 'cerrar');
      abajo();
    });
    const oir = el('button', { type: 'button', class: 'jg-chat-boton', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(f.es) }, '🔊');
    return el('div', { class: `jg-chat-fila ${propia ? 'propia' : 'ajena'}` },
      el('div', { class: 'jg-chat-burbuja', 'data-k': k },
        grupo && !propia && f.quien && el('span', { class: 'jg-chat-nombre' }, f.quien),
        el('p', { class: 'jg-chat-texto' }, nodo),
        el('div', { class: 'jg-chat-herramientas' }, oir, tr(f.trad) ? ver : null),
        trad));
  }

  /** Un mensaje que llega: primero «escribiendo…», después la burbuja. */
  function llega(f, despues, repetido = false) {
    const escribiendo = el('div', { class: 'jg-chat-fila ajena', 'aria-label': t('jg.chat.escribe', { quien: f.quien ?? '' }) },
      el('div', { class: 'jg-chat-burbuja jg-chat-puntos', 'aria-hidden': 'true' }, [1, 2, 3].map(i => el('i', { style: `--i:${i}` }))));
    hilo.append(escribiendo);
    abajo();
    luego(() => {
      escribiendo.remove();
      hilo.append(burbuja(f, false, repetido ? 'r' : 'm'));
      abajo();
      sonar('burbuja');
      ctx.leerSiHayVoz(f.es);
      luego(despues, 420);
    }, 800);
  }

  /** Las tres opciones del turno del alumno. «contado»: si cuenta para el progreso (no en el repaso). */
  function turno(f, indice, contado) {
    // dos frases de otros sitios de la lección, de largo parecido (si no, la buena se notaría por el tamaño)
    const vistas = new Set([f.es]);
    const otras = [];
    for (const g of ctx.frases()) {
      if (vistas.has(g.es)) continue;
      vistas.add(g.es);
      otras.push({ g, lejos: Math.abs(g.es.length - f.es.length) });
    }
    otras.sort((a, b) => a.lejos - b.lejos);
    const malas = ctx.barajar(otras.slice(0, 4)).slice(0, 2).map(o => o.g);
    let fallada = false;
    pista.textContent = t('jg.chat.tuTurno');
    poner(opciones, ctx.barajar([f, ...malas]).map(g => {
      const b = el('button', { type: 'button', class: 'jg-chat-opcion', lang: ctx.LANG }, g.es);
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (g.es !== f.es) {
          b.disabled = true;
          b.classList.remove('tiembla'); void b.offsetWidth; b.classList.add('tiembla', 'mal');
          sonar('mal');
          ctx.decir(tr(g.trad) ? t('jg.chat.mal', { es: g.es, trad: tr(g.trad) }) : t('jg.chat.malSola'), 'pensando');
          if (!fallada && contado) { fallada = true; falladas.push(indice); }
          return;
        }
        for (const x of opciones.children) x.disabled = true;
        b.classList.add('bien');
        sonar('bien');
        luego(() => {
          poner(opciones);
          hilo.append(burbuja(f, true, contado ? 'm' : 'r'));
          abajo();
          sonar('pop');
          if (contado) { hechos += 1; cuenta.textContent = `${hechos} / ${turnos}`; }
          pista.textContent = '';
          luego(() => (contado ? seguir(indice + 1) : repasar()), 420);
        }, 350);
      });
      return b;
    }));
  }

  // ----- La conversación -----
  function seguir(i) {
    if (i >= frases.length) { repasar(); return; }
    const f = frases[i];
    pista.textContent = '';
    if (f.quien === yo) turno(f, i, true);
    else llega(f, () => seguir(i + 1));
  }

  // ----- El repaso de lo fallado -----
  function repasar() {
    const i = falladas.shift();
    if (i === undefined) { fin(); return; }
    hilo.append(el('p', { class: 'jg-chat-aviso' }, t('jg.chat.repaso')));
    abajo();
    const f = frases[i];
    const antes = frases[i - 1];
    // el mensaje anterior vuelve a llegar, para saber a qué se contesta
    if (antes && antes.quien !== yo) llega(antes, () => turno(f, i, false), true);
    else turno(f, i, false);
  }

  function fin() {
    pista.textContent = t('jg.chat.fin');
    poner(opciones);
    sonar('fanfarria');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-chat' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.chat.titulo')), cuenta),
    el('div', { class: 'jg-chat-movil' },
      el('div', { class: 'jg-chat-barra' },
        el('span', { class: 'jg-chat-avatar', 'aria-hidden': 'true' }, [...(otros[0] ?? '?')][0].toUpperCase()),
        el('span', { class: 'jg-chat-contacto' }, t('jg.chat.con', { quien: otros.join(', ') })),
        el('span', { class: 'jg-chat-linea', 'aria-hidden': 'true' })),
      hilo,
      opciones),
    pista);
  pista.textContent = t('jg.chat.eres', { quien: yo });
  luego(() => seguir(0), 300);
  return { nodo, apagar() { vivo = false; for (const id of temporizadores) clearTimeout(id); } };
}
