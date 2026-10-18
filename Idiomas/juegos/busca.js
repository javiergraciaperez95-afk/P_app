// =====================================================================
// A LA BÚSQUEDA — juego para leer un texto (bloque «texto», la lectura literaria)
// ---------------------------------------------------------------------
// El texto está entero a la vista, con cada frase tocable. Arriba sale la traducción de una frase y hay
// que encontrarla en el texto y tocarla. Si se toca otra, la tutora dice lo que dice esa frase (así se
// aprende leyendo) y se sigue buscando; la frase fallada volverá más tarde. Al acertar se ve la frase
// con sus palabras pulsables y se puede oír.
// Vale para cualquier idioma: solo usa las frases de la lección (con su traducción y su «parrafo»).
// =====================================================================

import { el, poner } from '../js/dom.js';

const MAX = 8;
// en el modo desarrollador la respuesta queda marcada en la página, para las pruebas automáticas
const enPruebas = () => { try { return Boolean(sessionStorage.getItem('idiomas-desarrollador')); } catch { return false; } };

export const juego = {
  nombre: 'busca',
  icono: '🔎',
  tipos: ['texto'],
  // hacen falta varias frases con traducción para que haya algo que buscar
  sirve: (bloque, ctx) => (bloque.frases ?? []).filter(f => f.es && ctx.tr(f.trad)).length >= 3,
};

export function crear(bloque, ctx) {
  const { t, tr, sonar, LANG } = ctx;
  const frases = (bloque.frases ?? []).filter(f => f.es);
  const buscables = frases.filter(f => tr(f.trad));
  const elegidas = buscables.length > MAX ? ctx.barajar(buscables).slice(0, MAX) : ctx.barajar(buscables);
  const total = elegidas.length;
  const cola = [...elegidas];
  let hechas = 0;
  let acabado = false;
  let actual = null;
  let fallada = false;
  let esperando = false;

  const cuenta = el('span', { class: 'jg-cuenta' });
  const pista = el('p', { class: 'jg-pista' });
  const pregunta = el('div', { class: 'jg-busca-pregunta', 'aria-live': 'polite' });
  const botones = new Map();
  const parrafos = [0, 1].map(p => el('p', { class: 'jg-busca-parrafo', lang: LANG }, frases.filter(f => (f.parrafo === 1 ? 1 : 0) === p).flatMap(f => {
    const b = el('button', { type: 'button', class: 'jg-busca-frase' }, f.es);
    botones.set(f, b);
    b.addEventListener('click', () => tocar(f, b));
    return [b, ' '];
  })));
  const texto = el('div', { class: 'jg-busca-texto' }, parrafos.filter(p => p.childNodes.length));

  function presentar() {
    actual = cola.shift();
    fallada = false;
    esperando = false;
    for (const [g, b] of botones) { b.classList.remove('no'); if (enPruebas()) b.dataset.respuesta = g === actual ? '1' : ''; }
    cuenta.textContent = `${hechas} / ${total}`;
    pista.textContent = t('jg.busca.pista');
    poner(pregunta, el('p', { class: 'jg-busca-trad' }, el('span', { 'aria-hidden': 'true' }, '🔎 '), tr(actual.trad)));
  }

  function tocar(f, b) {
    if (esperando || acabado || !actual || b.classList.contains('hallada')) return;
    if (f === actual) {
      esperando = true;
      b.classList.add('hallada');
      b.classList.remove('no');
      hechas += fallada ? 0 : 1;
      if (fallada) cola.push(actual);
      cuenta.textContent = `${hechas} / ${total}`;
      pista.textContent = t('jg.busca.ok');
      sonar('moneda');
      ctx.leerSiHayVoz(f.es);
      const seguir = el('button', { type: 'button', class: 'es-boton jg-seguir' }, cola.length ? t('jg.busca.otra') : t('jg.busca.terminar'));
      const hallada = actual;
      const volvera = fallada;
      seguir.addEventListener('click', () => {
        if (volvera) botones.get(hallada)?.classList.remove('hallada');
        sonar('pagina');
        if (cola.length) presentar(); else fin();
      });
      poner(pregunta,
        el('p', { class: 'jg-busca-trad' }, tr(f.trad)),
        el('p', { class: 'jg-busca-encontrada', lang: LANG }, ctx.frase(f.es).nodo),
        el('div', { class: 'jg-herramientas' }, el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => ctx.oir(f.es) }, `🔊 ${t('comun.escuchar')}`)),
        seguir);
      seguir.focus({ preventScroll: true });
    } else {
      fallada = true;
      b.classList.add('no');
      b.classList.remove('tiembla');
      void b.offsetWidth;
      b.classList.add('tiembla');
      sonar('mal');
      ctx.decir(t('jg.busca.no', { trad: tr(f.trad) || f.es }), 'pensando');
    }
  }

  function fin() {
    if (acabado) return;
    acabado = true;
    cuenta.textContent = `${total} / ${total}`;
    pista.textContent = t('jg.busca.fin');
    for (const b of botones.values()) { b.classList.remove('no'); b.classList.add('hallada'); }
    poner(pregunta, el('p', { class: 'jg-busca-premio' }, '🔎'));
    sonar('fanfarria');
    ctx.hecho();
  }

  const nodo = el('div', { class: 'jg-busca' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, bloque.titulo ? tr(bloque.titulo) : t('jg.busca.titulo')), cuenta),
    pista,
    pregunta,
    texto);
  if (total) presentar(); else ctx.hecho();
  return { nodo };
}
