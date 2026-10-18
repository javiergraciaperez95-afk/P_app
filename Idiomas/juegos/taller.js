// =====================================================================
// EL TALLER — juego para la gramática (bloque «gramatica»)
// ---------------------------------------------------------------------
// Primero se lee la explicación a trozos. Luego, en el banco de trabajo, cada ejemplo llega
// desmontado: sus palabras revueltas en piezas y, como guía, la traducción. Se tocan las piezas
// para ponerlas en la línea, en orden; al poner la última, el taller comprueba la frase: las piezas
// bien colocadas se quedan fijas y las demás vuelven al resto. Si se falla, la tutora lo cuenta, y
// ese ejemplo vuelve a salir al final. «Pista» hace brillar la pieza que toca. Vale para cualquier
// idioma: solo usa los ejemplos de la lección.
// =====================================================================

import { el, poner } from '../js/dom.js';
import { lectura, unidades, normalizar } from './ayuda-trozos.js';

const montable = e => e?.es && unidades(e.es).length >= 2;

export const juego = {
  nombre: 'taller',
  icono: '🔧',
  tipos: ['gramatica'],
  sirve: bloque => (bloque.ejemplos ?? []).some(montable),
};

export function crear(bloque, ctx) {
  const { t, tr, sonar } = ctx;
  const ejemplos = (bloque.ejemplos ?? []).filter(montable);
  const cola = ejemplos.map((_, i) => i);
  const repetidos = new Set();
  const hechos = new Set();
  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const cuerpo = el('div', { class: 'jg-taller-cuerpo' });
  const pintarCuenta = () => { cuenta.textContent = `${hechos.size} / ${ejemplos.length}`; };

  // ----- 1. Lo que se lee -----
  const leer = lectura(bloque, ctx, () => alFin(), 'jg-taller-lectura');
  const titulo = el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.taller.titulo'));

  // ----- 2. Lo que se monta -----
  function siguiente() {
    pintarCuenta();
    if (!cola.length) { fin(); return; }
    montar(cola.shift());
  }

  function montar(k) {
    const e = ejemplos[k];
    const reales = unidades(e.es);
    const piezas = reales.map((texto, i) => ({ texto, i }));
    let mezcla = ctx.barajar(piezas);
    for (let intento = 0; intento < 6 && mezcla.every((p, i) => p.i === i); intento++) mezcla = ctx.barajar(piezas);
    const linea = Array(piezas.length).fill(null); // lo colocado en cada hueco
    const fijas = new Set(); // huecos ya correctos
    let resto = mezcla;
    let fallo = false;
    let ayuda = null;

    const banco = el('div', { class: 'jg-taller-linea', role: 'list', 'aria-label': t('jg.taller.linea') });
    const monton = el('div', { class: 'jg-taller-monton', role: 'group', 'aria-label': t('jg.taller.piezas') });
    const botonPista = el('button', { type: 'button', class: 'es-boton es-boton-papel jg-taller-pista' }, `💡 ${t('jg.taller.pista')}`);

    function pieza(p) {
      const b = el('button', { type: 'button', class: 'jg-taller-pieza', lang: ctx.LANG, 'data-i': String(p.i) }, p.texto);
      if (ayuda === p) b.classList.add('brilla');
      return b;
    }

    function pintar() {
      poner(banco, linea.map((p, h) => {
        if (!p) return el('span', { class: 'jg-taller-hueco', role: 'listitem' }, String(h + 1));
        const b = pieza(p);
        b.classList.add('puesta');
        if (fijas.has(h)) { b.classList.add('fija'); b.disabled = true; }
        else b.addEventListener('click', () => quitar(h));
        return el('span', { class: 'jg-taller-hueco lleno', role: 'listitem' }, b);
      }));
      poner(monton, resto.map(p => {
        const b = pieza(p);
        b.addEventListener('click', () => colocar(p));
        return b;
      }));
    }

    function colocar(p) {
      const h = linea.findIndex(x => !x);
      if (h < 0) return;
      linea[h] = p;
      resto = resto.filter(x => x !== p);
      if (ayuda === p) ayuda = null;
      sonar('elegir');
      pintar();
      if (linea.every(Boolean)) comprobar();
    }

    function quitar(h) {
      resto = [...resto, linea[h]];
      linea[h] = null;
      sonar('pop');
      pintar();
    }

    function comprobar() {
      const malas = [];
      linea.forEach((p, h) => { if (normalizar(p.texto) !== normalizar(reales[h])) malas.push(h); else fijas.add(h); });
      if (!malas.length) { bien(); return; }
      fallo = true;
      sonar('mal');
      ctx.decir(t('jg.taller.casi'), 'apurada');
      pintar();
      for (const h of malas) banco.children[h]?.firstChild?.classList.add('mal', 'tiembla');
      setTimeout(() => {
        for (const h of malas) if (linea[h] && !fijas.has(h)) { resto.push(linea[h]); linea[h] = null; }
        resto = ctx.barajar(resto);
        pintar();
      }, ctx.quieto ? 0 : 700);
    }

    function bien() {
      sonar('moneda');
      hechos.add(k);
      pintarCuenta();
      if (fallo && !repetidos.has(k)) { repetidos.add(k); cola.push(k); ctx.decir(t('jg.taller.vuelve'), 'contenta'); } else ctx.decir(t('jg.taller.bien'), 'contenta');
      pista.textContent = '';
      const f = ctx.frase(e.es);
      const ultimo = !cola.length;
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, ultimo ? t('jg.taller.fin') : t('jg.taller.otra'));
      seguir.addEventListener('click', () => { sonar('pagina'); siguiente(); });
      poner(cuerpo,
        el('div', { class: 'jg-taller-hecha' },
          el('p', { class: 'jg-taller-frase' }, f.nodo, ' ', el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(e.es) }, '🔊')),
          e.trad && el('p', { class: 'jg-trad' }, tr(e.trad)),
          ctx.analisis(e, `jg-taller-${bloque.id ?? 'g'}-${k}`)),
        seguir);
      ctx.leerSiHayVoz(e.es);
      seguir.focus({ preventScroll: true });
    }

    botonPista.addEventListener('click', () => {
      const h = linea.findIndex(x => !x);
      if (h < 0) return;
      ayuda = resto.find(p => normalizar(p.texto) === normalizar(reales[h])) ?? null;
      sonar('buscar');
      pintar();
    });

    pista.textContent = t('jg.taller.consigna');
    pintar();
    poner(cuerpo,
      el('div', { class: 'jg-taller-guia' }, el('span', { class: 'jg-taller-etiqueta' }, t('jg.taller.guia')), el('p', { class: 'jg-taller-trad' }, tr(e.trad ?? ''))),
      banco, monton, botonPista);
    sonar('cajon');
  }

  function fin() {
    poner(cuerpo, el('p', { class: 'jg-taller-fin' }, `🏆 ${t('jg.taller.terminado')}`));
    pista.textContent = '';
    sonar('aplausos');
    ctx.hecho();
  }

  // ----- Estructura -----
  const mesa = el('div', { class: 'jg-taller-mesa', hidden: true }, cuerpo);
  const cab = el('header', { class: 'jg-encabezado', hidden: true }, titulo, cuenta);
  const nodo = el('div', { class: 'jg-taller' }, leer.nodo, cab, pista, mesa);
  /** Al terminar de leer se pasa al banco de trabajo. */
  function alFin() {
    sonar('cajon');
    leer.nodo.hidden = true;
    cab.hidden = false;
    mesa.hidden = false;
    siguiente();
  }
  if (leer.vacia) alFin();
  return { nodo };
}
