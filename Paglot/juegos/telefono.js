// =====================================================================
// EL TELÉFONO — juego para un diálogo (bloque «dialogo»)
// ---------------------------------------------------------------------
// Cada frase del diálogo es una llamada. Si el dispositivo tiene voz, la frase llega solo como voz
// (hay un botón para oírla otra vez); si no la tiene, llega borrosa y con su pronunciación para leerla.
// El alumno elige entre tres traducciones: la buena y dos de otras frases de la lección. Un fallo no
// castiga: la tutora dice de qué frase era esa traducción y la llamada vuelve a sonar al final.
// Al acertar se ve la frase escrita, con sus palabras pulsables (ficha con pronunciación y «?»).
// Vale para cualquier idioma: solo usa los datos de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';
import { hayVoz } from '../js/sonidos.js';

const MAX_LLAMADAS = 6;

const textoTrad = (f, ctx) => String(ctx.tr(f.trad) ?? '').trim();
const conTrad = (lista, ctx) => lista.filter(f => f.es && textoTrad(f, ctx));

export const juego = {
  nombre: 'telefono',
  icono: '📞',
  tipos: ['dialogo'],
  sirve(bloque, ctx) {
    if (conTrad(bloque.frases ?? [], ctx).length < 2) return false;
    // hacen falta tres traducciones distintas en la lección
    return new Set(conTrad(ctx.frases(), ctx).map(f => textoTrad(f, ctx))).size >= 3;
  },
};

/** La pronunciación de la frase: la escrita a mano o la suma de las de sus palabras (null si falta alguna). */
function pronunciacion(f, ctx) {
  if (f.pron) return f.pron;
  const { nodo, botones } = ctx.frase(f.es);
  if (!botones.length) return null;
  const fichas = new Map(botones.map(b => [b.boton, b.entrada]));
  let falta = false;
  const trozos = [...nodo.childNodes].map(n => {
    const entrada = fichas.get(n);
    if (!entrada) return n.textContent;
    if (!entrada.pron) falta = true;
    return entrada.pron ?? '';
  });
  return falta ? null : trozos.join('').replace(/\s+/g, ' ').trim();
}

export function crear(bloque, ctx) {
  const { t, sonar } = ctx;
  let propias = conTrad(bloque.frases ?? [], ctx);
  // un diálogo muy largo cansa: como mucho ocho llamadas, en el mismo orden
  if (propias.length > MAX_LLAMADAS) {
    const quedan = new Set(ctx.barajar(propias.map((_, i) => i)).slice(0, MAX_LLAMADAS));
    propias = propias.filter((_, i) => quedan.has(i));
  }
  const total = propias.length;
  const cola = [...propias];
  const resueltas = new Set();
  const temporizadores = new Set();
  let vivo = true;
  const luego = (fn, ms) => { const id = setTimeout(() => { temporizadores.delete(id); if (vivo) fn(); }, ms); temporizadores.add(id); };

  const cuenta = el('span', { class: 'jg-cuenta' }, `0 / ${total}`);
  const pista = el('p', { class: 'jg-pista', 'aria-live': 'polite' });
  const barra = el('div', { class: 'jg-telefono-barra' });
  const voz = el('div', { class: 'jg-telefono-voz' });
  const texto = el('div', { class: 'jg-telefono-texto' });
  const teclas = el('div', { class: 'jg-telefono-teclas', role: 'group', 'aria-label': t('jg.telefono.opciones') });
  const seguir = el('button', { type: 'button', class: 'es-boton jg-telefono-seguir', hidden: true }, t('jg.telefono.otra'));

  // dos traducciones de otras frases, de largo parecido (si no, la buena se notaría por el tamaño)
  function distractoras(f) {
    const mia = textoTrad(f, ctx);
    const vistas = new Set([mia]);
    const otras = [];
    for (const g of conTrad(ctx.frases(), ctx)) {
      const trad = textoTrad(g, ctx);
      if (vistas.has(trad) || g.es === f.es) continue;
      vistas.add(trad);
      otras.push({ g, lejos: Math.abs(trad.length - mia.length) });
    }
    otras.sort((a, b) => a.lejos - b.lejos);
    return ctx.barajar(otras.slice(0, 4)).slice(0, 2).map(o => o.g);
  }

  function llamada() {
    const f = cola[0];
    const sonando = hayVoz();
    let resuelta = false;
    let fallada = false;
    seguir.hidden = true;
    seguir.classList.remove('jg-listo');
    cuenta.textContent = `${resueltas.size} / ${total}`;
    poner(barra,
      el('span', { class: 'jg-telefono-icono', 'aria-hidden': 'true' }, '📞'),
      el('span', { class: 'jg-telefono-nombre' }, f.quien ? t('jg.telefono.llamada', { quien: f.quien }) : t('jg.telefono.llamadaSola')));

    // la frase, solo como voz (o borrosa, con su pronunciación, si no hay voz)
    if (sonando) {
      const oir = el('button', { type: 'button', class: 'jg-telefono-oir', 'aria-label': t('jg.telefono.repetir') },
        el('span', { class: 'jg-telefono-ondas', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5].map(i => el('i', { style: `--i:${i}` }))),
        el('span', {}, `🔊 ${t('jg.telefono.repetir')}`));
      oir.addEventListener('click', () => { sonar('elegir'); ctx.oir(f.es); });
      poner(voz, oir);
      poner(texto);
      pista.textContent = t('jg.telefono.escucha');
    } else {
      const pron = pronunciacion(f, ctx);
      poner(voz);
      poner(texto,
        el('p', { class: `jg-telefono-borrosa ${pron ? '' : 'poco'}`, lang: ctx.LANG, 'aria-hidden': 'true' }, f.es),
        pron && el('p', { class: 'jg-telefono-pron' }, pron));
      pista.textContent = t('jg.telefono.lee');
    }

    // las tres traducciones
    const opciones = ctx.barajar([f, ...distractoras(f)]);
    poner(teclas, opciones.map((g, i) => {
      const b = el('button', { type: 'button', class: 'jg-telefono-tecla' },
        el('span', { class: 'jg-telefono-num', 'aria-hidden': 'true' }, String(i + 1)),
        el('span', { class: 'jg-telefono-trad' }, textoTrad(g, ctx)));
      b.addEventListener('click', () => {
        if (resuelta || b.disabled) return;
        if (g.es === f.es) acierto(f, b, fallada);
        else {
          b.disabled = true;
          b.classList.remove('tiembla'); void b.offsetWidth; b.classList.add('tiembla', 'mal');
          sonar('mal');
          ctx.decir(t('jg.telefono.mal', { es: g.es }), 'pensando');
          // lo fallado vuelve: la misma llamada sonará otra vez al final
          if (!fallada) { fallada = true; cola.push(f); }
        }
      });
      return b;
    }));

    function acierto(frase, boton) {
      resuelta = true;
      boton.classList.add('bien');
      for (const b of teclas.children) if (b !== boton) b.disabled = true;
      sonar('bien');
      resueltas.add(frase.es);
      cola.shift();
      cuenta.textContent = `${resueltas.size} / ${total}`;
      // ahora sí: la frase escrita, con sus palabras pulsables
      const escrita = ctx.frase(frase.es);
      poner(voz);
      poner(texto,
        el('p', { class: 'jg-telefono-escrita' }, escrita.nodo),
        el('div', { class: 'jg-herramientas' }, el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(frase.es) }, '🔊')));
      texto.classList.add('entra');
      if (cola.length) {
        pista.textContent = t('jg.telefono.bien');
        seguir.hidden = false;
        seguir.classList.add('jg-listo');
        seguir.focus({ preventScroll: true });
      } else {
        pista.textContent = t('jg.telefono.fin');
        barra.classList.add('colgada');
        sonar('fanfarria');
        ctx.hecho();
      }
    }

    texto.classList.remove('entra');
    sonar('llamar');
    if (sonando) luego(() => ctx.leerSiHayVoz(f.es), ctx.quieto ? 300 : 700);
  }

  seguir.addEventListener('click', () => { sonar('pagina'); llamada(); });

  const nodo = el('div', { class: 'jg-telefono' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? ctx.tr(bloque.titulo) : t('jg.telefono.titulo')), cuenta),
    el('div', { class: 'jg-telefono-aparato' },
      el('span', { class: 'jg-telefono-altavoz', 'aria-hidden': 'true' }),
      el('div', { class: 'jg-telefono-pantalla' }, barra, voz, texto),
      teclas,
      seguir),
    pista);
  llamada();
  return { nodo, apagar() { vivo = false; for (const id of temporizadores) clearTimeout(id); } };
}
