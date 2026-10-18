// =====================================================================
// EL SEMÁFORO — juego para la gramática (bloque «gramatica»)
// ---------------------------------------------------------------------
// Primero se lee la explicación a trozos. Luego cada ejemplo se parte en sus trozos de análisis de nivel
// alto (los primeros elementos del análisis, que juntos forman la frase). Los trozos se pintan de uno
// en uno: el que toca brilla y el semáforo ofrece 3 luces, cada una con una función. Al elegir la
// luz correcta el trozo se pinta de su color. Si se elige mal, la luz se apaga y la tutora lo explica;
// el trozo fallado vuelve a salir al final. Vale para cualquier idioma: usa las funciones (ya
// traducidas) del análisis.
// =====================================================================

import { el, poner } from '../js/dom.js';
import { lectura, altos } from './ayuda-trozos.js';

const COLORES = ['#f08a80', '#f7c948', '#8fd694', '#8fb8f0', '#c9a6ec', '#84dbd5'];

/** Las etiquetas de función distintas de toda la lección, en orden de aparición (para repartir colores y falsas opciones). */
function etiquetasDe(ctx) {
  const salida = [];
  for (const f of ctx.frases()) {
    for (const p of f.analisis ?? []) {
      const e = String(ctx.tr(p.funcion) ?? '').trim();
      if (e && !salida.includes(e)) salida.push(e);
    }
  }
  return salida;
}

export const juego = {
  nombre: 'semaforo',
  icono: '🚦',
  tipos: ['gramatica'],
  sirve: (bloque, ctx) => etiquetasDe(ctx).length >= 2 && (bloque.ejemplos ?? []).some(e => e?.es && altos(e).length >= 2),
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const casos = (bloque.ejemplos ?? []).filter(e => e?.es && altos(e).length >= 2);
  const etiquetas = etiquetasDe(ctx);
  const color = etiqueta => COLORES[Math.max(0, etiquetas.indexOf(etiqueta)) % COLORES.length];
  const cola = casos.map((_, i) => i);
  const hechos = new Set();
  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const cuerpo = el('div', { class: 'jg-semaforo-cuerpo' });
  const pintarCuenta = () => { cuenta.textContent = `${hechos.size} / ${casos.length}`; };

  const leer = lectura(bloque, ctx, () => alFin(), 'jg-semaforo-lectura');

  function siguiente() {
    pintarCuenta();
    if (!cola.length) { fin(); return; }
    caso(cola.shift());
  }

  function caso(k) {
    const e = casos[k];
    const trozos = altos(e).map(x => ({ ...x, etiqueta: String(tr(x.funcion)).trim() }));
    const pendientes = trozos.map((_, i) => i);
    const falladas = new Set();
    const repetidas = new Set();
    let actual = -1;

    const fila = el('p', { class: 'jg-semaforo-frase', lang: ctx.LANG });
    const nodos = trozos.map((x, i) => {
      const f = ctx.frase(x.texto);
      const rotulo = el('span', { class: 'jg-semaforo-rotulo' });
      const n = el('span', { class: 'jg-semaforo-trozo' }, f.nodo, rotulo);
      n.rotulo = rotulo;
      return n;
    });
    fila.append(...nodos.flatMap((n, i) => (i ? [' ', n] : [n])));
    const luces = el('div', { class: 'jg-semaforo-luces', role: 'group', 'aria-label': t('jg.semaforo.luces') });
    const pregunta = el('p', { class: 'jg-semaforo-pregunta', 'aria-live': 'polite' });

    function siguienteTrozo() {
      if (!pendientes.length) { listo(); return; }
      actual = pendientes.shift();
      const x = trozos[actual];
      nodos.forEach((n, i) => n.classList.toggle('actual', i === actual));
      nodos[actual].classList.remove('pintado');
      nodos[actual].style.removeProperty('--c');
      nodos[actual].rotulo.textContent = '';
      pregunta.textContent = t('jg.semaforo.pregunta');
      const falsas = ctx.barajar(etiquetas.filter(et => et !== x.etiqueta)).slice(0, 2);
      poner(luces, ctx.barajar([x.etiqueta, ...falsas]).map(et => {
        const b = el('button', { type: 'button', class: 'jg-semaforo-luz', style: `--c:${color(et)}` }, el('span', { class: 'jg-semaforo-bombilla', 'aria-hidden': 'true' }), el('span', {}, et));
        b.addEventListener('click', () => elegir(et, b));
        return b;
      }));
      sonar('interruptor');
    }

    function elegir(et, boton) {
      const x = trozos[actual];
      if (et !== x.etiqueta) {
        falladas.add(actual);
        boton.disabled = true;
        boton.classList.add('apagada', 'tiembla');
        sonar('mal');
        ctx.decir(t('jg.semaforo.no', { texto: x.texto, funcion: et }), 'apurada');
        return;
      }
      sonar('moneda');
      const n = nodos[actual];
      n.style.setProperty('--c', color(et));
      n.classList.remove('actual');
      n.classList.add('pintado');
      n.rotulo.textContent = et;
      if (falladas.has(actual) && !repetidas.has(actual)) { repetidas.add(actual); pendientes.push(actual); }
      poner(luces);
      pregunta.textContent = '';
      setTimeout(siguienteTrozo, ctx.quieto ? 0 : 450);
    }

    function listo() {
      hechos.add(k);
      pintarCuenta();
      nodos.forEach(n => n.classList.remove('actual'));
      poner(luces);
      pregunta.textContent = '';
      pista.textContent = '';
      sonar('sello');
      ctx.decir(t('jg.semaforo.bien'), 'contenta');
      const ultimo = !cola.length;
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, ultimo ? t('jg.semaforo.fin') : t('jg.semaforo.otra'));
      seguir.addEventListener('click', () => { sonar('pagina'); siguiente(); });
      poner(cuerpo,
        el('div', { class: 'jg-semaforo-caso' },
          fila,
          el('p', { class: 'jg-semaforo-resuelto' }, `🚦 ${t('jg.semaforo.resuelto')}`),
          el('p', { class: 'jg-semaforo-oir' }, el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(e.es) }, '🔊')),
          e.trad && el('p', { class: 'jg-trad' }, tr(e.trad)),
          ctx.analisis(e, `jg-semaforo-${bloque.id ?? 'g'}-${k}`)),
        seguir);
      ctx.leerSiHayVoz(e.es);
      seguir.focus({ preventScroll: true });
    }

    pista.textContent = t('jg.semaforo.consigna');
    poner(cuerpo,
      el('div', { class: 'jg-semaforo-caso' },
        e.trad && el('p', { class: 'jg-semaforo-trad' }, tr(e.trad)),
        fila,
        pregunta,
        el('div', { class: 'jg-semaforo-poste' }, el('span', { class: 'jg-semaforo-caja' }, luces))));
    siguienteTrozo();
  }

  function fin() {
    poner(cuerpo, el('p', { class: 'jg-semaforo-final' }, `🏆 ${t('jg.semaforo.terminado')}`));
    pista.textContent = '';
    sonar('aplausos');
    ctx.hecho();
  }

  const mesa = el('div', { class: 'jg-semaforo-mesa', hidden: true }, cuerpo);
  const cab = el('header', { class: 'jg-encabezado', hidden: true }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.semaforo.titulo')), cuenta);
  const nodo = el('div', { class: 'jg-semaforo' }, leer.nodo, cab, pista, mesa);
  function alFin() {
    sonar('interruptor');
    leer.nodo.hidden = true;
    cab.hidden = false;
    mesa.hidden = false;
    siguiente();
  }
  if (leer.vacia) alFin();
  return { nodo };
}
