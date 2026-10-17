// Pantalla de precios (#/precios). Cabe siempre en una pantalla, sin desplazar, en móvil y en ordenador.
// Es un solo tablero con un interruptor grande: «Gratis» o «Paglot completo». Al cambiarlo, todo cambia a la vez:
// los medidores se llenan cuadro a cuadro, el precio rueda hasta su número, la tutora lo celebra y salta confeti.
// Debajo, una cinta va pasando las promesas. Dos lienzos (los de la bienvenida) dan el fondo vivo y el confeti.
//
// TODAVÍA NO SE COBRA NADA ni se aplica ningún límite: la pantalla enseña el plan y el botón dice «Muy pronto».
// Los precios y los límites están en config.js; los textos, en i18n/ (claves «precios.*»).

import { el, poner, enLinea } from '../dom.js';
import { t, locale } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar, pitidoVoz } from '../sonidos.js';
import { PRECIOS, LECCIONES_GRATIS_AL_DIA, PRACTICAS_GRATIS_AL_DIA, CUADERNO_GRATIS } from '../config.js';
import { fondoVivo, efectos } from './bienvenida.js';

const CUADROS = 10;      // cuadros de cada medidor
const CADA_CINTA = 4200; // milisegundos que se ve cada promesa

// Si el navegador no dice el país, se supone por el idioma.
const PAIS_POR_IDIOMA = { vi: 'VN', id: 'ID', pt: 'BR', es: 'ES', en: 'US', zh: 'CN', ja: 'JP', ko: 'KR', de: 'DE', fr: 'FR', it: 'IT', tr: 'TR', th: 'TH', ru: 'RU', pl: 'PL' };

/** El escalón de precios que toca según el país del navegador. */
function escalon() {
  const [lengua, region] = (navigator.language ?? '').split('-');
  const pais = (region ?? PAIS_POR_IDIOMA[lengua?.toLowerCase()] ?? '').toUpperCase();
  return Object.values(PRECIOS).find(e => e.paises.includes(pais)) ?? PRECIOS.medio;
}

/** Pinta la pantalla. Devuelve una función que la apaga: hay que llamarla al salir. */
export function pintarPrecios(contenedor) {
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apagar = [];
  let encendida = true;
  const precios = escalon();
  const euros = n => n.toLocaleString(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: n ? 2 : 0 });
  const disponibles = CURSOS.filter(c => !c.proximamente);
  const quien = hayCurso ? curso : disponibles[Math.floor(Math.random() * disponibles.length)];
  const centroDe = nodo => {
    const caja = nodo.getBoundingClientRect();
    return [caja.left + caja.width / 2, caja.top + caja.height / 2];
  };

  // ----- La tutora y lo que dice (escrito letra a letra) -----
  const canvas = el('canvas', { class: 'px-tutora-dibujo', width: 48, height: 64, role: 'img', 'aria-label': t('tutora.nombre') });
  const tutora = el('button', { type: 'button', class: 'px-tutora', 'aria-label': t('tutora.tocar') }, el('span', { class: 'sobre-salto' }, canvas));
  const texto = el('p', { class: 'px-texto', 'aria-hidden': 'true' });
  const lector = el('p', { class: 'solo-lector', 'aria-live': 'polite' });
  let sprite = null;
  let escritura = null;
  dibujoDe(quien).then(dibujo => {
    if (!encendida) return;
    sprite = dibujo.crearSprite(canvas);
    apagar.push(() => sprite.parar?.());
  }).catch(() => { tutora.hidden = true; });
  tutora.addEventListener('click', () => { sonar('saludo'); sprite?.reaccionar('cosquillas', 900); });

  function decir(frase, expresion = 'normal') {
    clearInterval(escritura);
    lector.textContent = frase;
    if (sprite) { sprite.expresion = expresion; sprite.hablando = !quieto; }
    if (quieto) { poner(texto, enLinea(frase)); return; }
    let n = 0;
    texto.textContent = '';
    escritura = setInterval(() => {
      n += 1;
      texto.textContent = frase.slice(0, n);
      if (n % 3 === 0) pitidoVoz();
      if (n >= frase.length) {
        clearInterval(escritura);
        if (sprite) sprite.hablando = false;
        encajar(); // por si el texto ha ocupado más líneas de las previstas
      }
    }, 22);
  }
  apagar.push(() => clearInterval(escritura));

  // ----- El tablero -----
  let plan = 'gratis'; // gratis · completo
  let forma = 'ano';   // mes · ano · siempre
  let mostrado = 0;    // el número que se ve ahora en el precio
  let rodando = null;

  const precio = el('p', { class: 'px-precio' }, euros(0));
  const por = el('p', { class: 'px-por' });
  const ahorro = el('span', { class: 'px-ahorro', hidden: true });
  const cuantoAhorra = Math.round((1 - precios.ano / (precios.mes * 12)) * 100);

  /** El precio no cambia de golpe: rueda hasta el número nuevo. */
  function rodarPrecio(destino) {
    clearInterval(rodando);
    if (quieto || destino === mostrado) { mostrado = destino; precio.textContent = euros(destino); return; }
    const origen = mostrado;
    const pasos = 14;
    let i = 0;
    rodando = setInterval(() => {
      i += 1;
      const p = i / pasos;
      mostrado = i >= pasos ? destino : Math.round((origen + (destino - origen) * (1 - (1 - p) ** 2)) * 100) / 100;
      precio.textContent = euros(mostrado);
      if (i % 2) sonar('roce');
      if (i >= pasos) {
        clearInterval(rodando);
        precio.classList.remove('px-llega');
        void precio.offsetWidth;
        precio.classList.add('px-llega');
      }
    }, 28);
  }
  apagar.push(() => clearInterval(rodando));

  // Los medidores: lo que da cada plan, en cuadros.
  const MEDIDORES = [
    { clave: 'lecciones', gratis: LECCIONES_GRATIS_AL_DIA, llenos: 3 },
    { clave: 'practica', gratis: PRACTICAS_GRATIS_AL_DIA, llenos: 1 },
    { clave: 'cuaderno', gratis: CUADERNO_GRATIS, llenos: 5 },
  ];
  const medidores = MEDIDORES.map(m => {
    const cuadros = Array.from({ length: CUADROS }, (_, i) => el('i', { style: `--i:${i}` }));
    const valor = el('span', { class: 'px-valor' });
    const nodo = el('li', {}, el('span', { class: 'px-que' }, t(`precios.m.${m.clave}`)), el('span', { class: 'px-barra', 'aria-hidden': 'true' }, cuadros), valor);
    return { ...m, cuadros, valor, nodo };
  });

  const formas = ['mes', 'ano', 'siempre'].map(clave => el('button', {
    type: 'button', class: 'boton boton-mini', onclick: () => { forma = clave; sonar('voltear'); pintar(); },
  }, t(`precios.plan.${clave}`)));
  const filaFormas = el('div', { class: 'px-formas filtros', role: 'group', 'aria-label': t('precios.elegir') }, formas);

  const botonGratis = el('button', { type: 'button', class: 'px-lado', onclick: () => elegir('gratis') }, t('precios.gratis.titulo'));
  const botonCompleto = el('button', { type: 'button', class: 'px-lado px-lado-oro', onclick: () => elegir('completo') }, t('precios.completo.titulo'));
  const accion = el('div', { class: 'px-accion' });
  const tablero = el('section', { class: 'px-tablero caja', 'data-plan': plan },
    el('div', { class: 'px-interruptor', role: 'group', 'aria-label': t('precios.titulo') }, botonGratis, botonCompleto),
    el('div', { class: 'px-fila-precio' }, precio, el('div', { class: 'px-junto' }, por, ahorro), filaFormas),
    el('ul', { class: 'px-medidores' }, medidores.map(m => m.nodo)),
    el('ul', { class: 'px-incluye' },
      ['c.todo', 'gratis.l3', 'c.nube', 'gratis.l5'].map(c => el('li', {}, t(`precios.${c}`))),
      el('li', { class: 'px-ayuda' }, t('precios.completo.l3'))),
    accion);

  function pintar() {
    const completo = plan === 'completo';
    tablero.dataset.plan = plan;
    raiz.dataset.plan = plan; // el público salta cuando la pantalla está en el plan completo
    botonGratis.setAttribute('aria-pressed', String(!completo));
    botonCompleto.setAttribute('aria-pressed', String(completo));
    formas.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(['mes', 'ano', 'siempre'][i] === forma));
      b.disabled = !completo;
    });
    por.textContent = completo ? t(`precios.por.${forma}`) : t('precios.gratis.para');
    ahorro.hidden = !(completo && forma === 'ano' && cuantoAhorra > 0);
    ahorro.textContent = t('precios.ahorro', { n: cuantoAhorra });
    rodarPrecio(completo ? precios[forma] : 0);
    for (const m of medidores) {
      m.cuadros.forEach((c, i) => c.classList.toggle('lleno', completo || i < m.llenos));
      m.valor.textContent = completo ? '∞' : String(m.gratis);
      m.valor.setAttribute('aria-label', completo ? t('precios.sinLimite') : String(m.gratis));
    }
    poner(accion, completo
      ? el('button', { type: 'button', class: 'boton boton-principal', onclick: () => { sprite?.reaccionar('apurada', 1200); decir(t('precios.prontoTutora'), 'apurada'); } }, t('precios.pronto'))
      : el('a', { class: 'boton boton-principal', href: hayCurso ? '#/lecciones' : '#/idiomas', onclick: () => sonar('pagina') },
        hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')));
    setTimeout(() => encendida && encajar(), 0); // el tablero puede haber cambiado de alto
  }

  function elegir(nuevo) {
    if (nuevo === plan) { sonar('clic'); return; }
    plan = nuevo;
    pintar();
    if (plan === 'completo') {
      sonar('paso');
      sprite?.reaccionar('contenta', 1600);
      fx.confeti(...centroDe(botonCompleto), 36, 1.1);
      // un confeti más pequeño al final de cada medidor, cuando termina de llenarse
      medidores.forEach((m, i) => setTimeout(() => encendida && fx.confeti(...centroDe(m.valor), 10, 0.5), 320 + i * 120));
      decir(t('precios.alCompleto'), 'contenta');
    } else {
      sonar('cerrar');
      decir(t('precios.alGratis'), 'normal');
    }
  }

  // ----- La cinta de promesas -----
  const PROMESAS = ['p1', 'p2', 'p3', 'p4', 'caprichos', 'pais'];
  let cual = 0;
  const cintaTexto = el('span', { class: 'px-cinta-texto' }, t(`precios.${PROMESAS[0]}`));
  const cinta = el('button', { type: 'button', class: 'px-cinta' }, el('span', { class: 'px-cinta-corazon', 'aria-hidden': 'true' }, '♥'), cintaTexto);
  const pasarCinta = () => {
    cual = (cual + 1) % PROMESAS.length;
    cintaTexto.textContent = t(`precios.${PROMESAS[cual]}`);
    cintaTexto.classList.remove('px-entra');
    void cintaTexto.offsetWidth;
    cintaTexto.classList.add('px-entra');
  };
  const cadaTanto = () => setInterval(() => { if (!document.hidden) pasarCinta(); }, CADA_CINTA);
  let relojCinta = cadaTanto();
  cinta.addEventListener('click', () => { pasarCinta(); clearInterval(relojCinta); relojCinta = cadaTanto(); });
  apagar.push(() => clearInterval(relojCinta));

  // ----- El público: en pantallas anchas, unas tutoras a cada lado que saltan cuando eliges el plan completo -----
  const otras = disponibles.filter(c => c.id !== quien.id).sort(() => Math.random() - 0.5);
  const publico = (lado, elegidas) => el('div', { class: `px-publico px-publico-${lado}`, 'aria-hidden': 'true' }, elegidas.map(c => {
    const lienzo = el('canvas', { width: 48, height: 60 });
    dibujoDe(c).then(dibujo => {
      const rejilla = dibujo.rejilla('contenta');
      const ctx = lienzo.getContext('2d');
      const arriba = lienzo.height - rejilla.length;
      rejilla.forEach((fila, y) => fila.forEach((color, x) => { if (color) { ctx.fillStyle = color; ctx.fillRect(x, y + arriba, 1, 1); } }));
    }).catch(() => { lienzo.hidden = true; });
    return lienzo;
  }));

  // ----- Montaje -----
  const lienzoFondo = el('canvas', { class: 'bv-fondo', 'aria-hidden': 'true' });
  const lienzoEfectos = el('canvas', { class: 'bv-efectos', 'aria-hidden': 'true' });
  const contenido = el('div', { class: 'px-contenido' },
    el('header', { class: 'px-arriba' },
      tutora,
      el('div', { class: 'px-globo caja' }, el('h1', { class: 'tutora-nombre' }, t('precios.titulo')), texto, lector)),
    tablero,
    cinta);
  const raiz = el('article', { class: 'px', 'data-plan': plan },
    lienzoFondo, publico('izq', otras.slice(0, 2)), publico('der', otras.slice(2, 4)), contenido, lienzoEfectos);
  poner(contenedor, raiz);
  document.body.classList.add('en-precios');
  apagar.push(() => document.body.classList.remove('en-precios'));

  apagar.push(fondoVivo(lienzoFondo, quieto));
  const fx = efectos(lienzoEfectos, quieto);
  apagar.push(() => fx.parar());

  // ----- Que quepa siempre: la pantalla empieza justo debajo de la cabecera y, si el contenido no entra, se encoge -----
  const cabecera = document.querySelector('.cabecera');
  function encajar() {
    raiz.style.minHeight = `${Math.max(320, Math.round(window.innerHeight - cabecera.getBoundingClientRect().bottom))}px`;
    const sitio = raiz.clientHeight - 16;
    const escala = Math.min(1, sitio / contenido.offsetHeight); // offsetHeight no cuenta la escala: es el alto de verdad
    contenido.style.transform = escala < 1 ? `scale(${escala.toFixed(3)})` : '';
  }
  const vigia = new ResizeObserver(encajar);
  vigia.observe(cabecera);
  vigia.observe(contenido);
  window.addEventListener('resize', encajar);
  document.fonts?.ready.then(() => encendida && encajar());
  apagar.push(() => { vigia.disconnect(); window.removeEventListener('resize', encajar); });

  pintar();
  encajar();
  const saludo = setTimeout(() => decir(`${t('precios.tutora')} ${t('precios.invita')}`), 450);
  apagar.push(() => clearTimeout(saludo));

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}
