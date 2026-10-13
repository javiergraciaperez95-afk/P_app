// Pantalla «Sobre Paglot» (#/sobre). Las tutoras viven en la página:
// - una entra andando y te saluda;
// - otra pasea por encima de la tarjeta de «Qué es Paglot» y comenta si te acercas;
// - otra baja por la línea de la historia según se desplaza la página y va encendiendo las fechas;
// - otras se asoman por detrás de las tarjetas de «En qué creemos»;
// - y todas desfilan al final.
// Los textos están en i18n/ (claves «sobre.*»). Los datos de la historia son provisionales.

import { el, poner, alAzar } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { TITULAR } from '../config.js';

const PASO = 4;          // píxeles que avanza la tutora que pasea en cada paso
const CADA_PASO = 90;    // milisegundos entre pasos
const HITOS = ['h1', 'h2', 'h3', 'h4'];
const VALORES = ['v1', 'v2', 'v3'];

/**
 * Pinta la página. Devuelve una función que la apaga (las tutoras dejan de moverse):
 * hay que llamarla al salir de la pantalla.
 */
export function pintarSobre(contenedor) {
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apagar = []; // lo que hay que parar al salir
  let encendida = true;

  // El reparto: cada papel lo hace una tutora distinta, al azar; la del curso elegido es la que recibe.
  const disponibles = CURSOS.filter(c => !c.proximamente && c.id !== curso.id);
  for (let i = disponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
  }
  let turno = 0;
  const otra = () => disponibles[turno++ % disponibles.length];

  /** Una tutora viva: se mueve sola (parpadea, se balancea), habla con un bocadillo y reacciona si la tocan. */
  function actriz(c, clase) {
    const canvas = el('canvas', { class: 'sobre-tutora', width: 48, height: 64 });
    const globo = el('span', { class: 'inicio-globo' });
    const nodo = el('div', { class: `sobre-actriz ${clase}` }, globo, el('span', { class: 'sobre-salto' }, canvas));
    const a = { nodo, sprite: null, callar: null };
    a.reaccionar = (expresion, duracion) => a.sprite?.reaccionar(expresion, duracion);
    a.decir = (texto, duracion = 2800) => {
      globo.textContent = texto;
      // El bocadillo va centrado sobre la tutora, pero se corre lo justo para no salirse de la pantalla.
      const caja = nodo.getBoundingClientRect();
      const centro = caja.left + caja.width / 2;
      const mitad = globo.offsetWidth / 2;
      const ancho = document.documentElement.clientWidth;
      const corre = Math.max(8 - (centro - mitad), 0) + Math.min(ancho - 8 - (centro + mitad), 0);
      globo.style.setProperty('--corre', `${Math.round(corre)}px`);
      nodo.classList.add('habla');
      if (a.sprite) a.sprite.hablando = true;
      clearTimeout(a.callar);
      a.callar = setTimeout(() => {
        nodo.classList.remove('habla');
        if (a.sprite) a.sprite.hablando = false;
      }, duracion);
    };
    dibujoDe(c).then(dibujo => {
      if (!encendida) return;
      a.sprite = dibujo.crearSprite(canvas);
      apagar.push(() => a.sprite.parar?.());
    }).catch(() => { nodo.hidden = true; });
    nodo.addEventListener('click', e => {
      e.stopPropagation();
      sonar('saludo');
      a.reaccionar('cosquillas', 900);
      a.alTocar?.();
    });
    apagar.push(() => clearTimeout(a.callar));
    return a;
  }

  // ----- 1. Cabecera: la tutora entra andando y saluda -----
  const guia = actriz(hayCurso ? curso : otra(), 'sobre-guia');
  guia.alTocar = () => guia.decir(alAzar(t('sobre.toca')));
  const entrada = el('div', { class: 'sobre-entrada' }, guia.nodo);
  const saludar = () => {
    guia.nodo.classList.remove('anda');
    guia.reaccionar('contenta', 900);
    guia.decir(t('sobre.hola'), 4200);
  };
  if (quieto) {
    const espera = setTimeout(saludar, 500);
    apagar.push(() => clearTimeout(espera));
  } else {
    entrada.classList.add('entra');
    guia.nodo.classList.add('anda');
    entrada.addEventListener('animationend', saludar, { once: true });
  }

  // ----- 2. Qué es: una tutora pasea por encima de la tarjeta -----
  const paseante = actriz(otra(), 'sobre-paseante');
  const pista = el('div', { class: 'sobre-pista' }, paseante.nodo);
  const tarjeta = el('div', { class: 'caja' },
    el('h2', {}, t('sobre.que.titulo')),
    el('p', {}, t('sobre.que.p1')),
    el('p', {}, t('sobre.que.p2')));
  let x = -1;
  let sentido = 1;
  let quietaHasta = 0;
  const comentar = () => {
    quietaHasta = performance.now() + 3000;
    paseante.nodo.classList.remove('anda');
    paseante.reaccionar('contenta', 900);
    paseante.decir(alAzar(t('sobre.que.dice')), 2800);
  };
  paseante.alTocar = comentar;
  tarjeta.addEventListener('pointerenter', comentar);
  if (!quieto) {
    const reloj = setInterval(() => {
      if (document.hidden) return;
      const recorrido = pista.clientWidth - paseante.nodo.offsetWidth;
      if (recorrido <= 0) return;
      if (x < 0) x = Math.round(recorrido * (0.2 + Math.random() * 0.6) / PASO) * PASO;
      const ahora = performance.now();
      if (ahora >= quietaHasta) {
        if (Math.random() < 0.012) {
          // de vez en cuando se para a pensar
          quietaHasta = ahora + 1200 + Math.random() * 1800;
          paseante.nodo.classList.remove('anda');
          if (Math.random() < 0.5) paseante.reaccionar('pensando', 1500);
        } else {
          x += sentido * PASO;
          if (x <= 0) { x = 0; sentido = 1; }
          if (x >= recorrido) { x = recorrido; sentido = -1; }
          paseante.nodo.classList.add('anda');
          paseante.nodo.classList.toggle('izquierda', sentido < 0);
        }
      }
      paseante.nodo.style.transform = `translateX(${Math.min(x, recorrido)}px)`;
    }, CADA_PASO);
    apagar.push(() => clearInterval(reloj));
  }

  // ----- 3. Historia: la tutora baja por la línea con la página y enciende cada fecha al llegar -----
  const caminante = actriz(otra(), 'sobre-caminante');
  caminante.alTocar = () => caminante.decir(alAzar(t('sobre.toca')));
  const hitos = HITOS.map(h => el('li', { class: 'sobre-hito' },
    el('p', { class: 'sobre-fecha' }, t(`sobre.${h}.fecha`)),
    el('h3', {}, t(`sobre.${h}.titulo`)),
    el('p', {}, t(`sobre.${h}.texto`))));
  const linea = el('div', { class: 'sobre-linea' },
    el('div', { class: 'sobre-carril' }, caminante.nodo),
    el('ol', { class: 'sobre-hitos' }, hitos));
  if (quieto) {
    for (const h of hitos) h.classList.add('activo');
  } else {
    let yAnterior = -1;
    let parar = null;
    let primeraVez = true;
    const seguir = () => {
      const caja = linea.getBoundingClientRect();
      const alto = caminante.nodo.offsetHeight;
      const tope = Math.max(0, caja.height - alto);
      const y = Math.round(Math.max(0, Math.min(tope, window.innerHeight * 0.42 - caja.top - alto / 2)) / PASO) * PASO;
      if (y !== yAnterior) {
        caminante.nodo.style.transform = `translateY(${y}px)`;
        if (!primeraVez) {
          caminante.nodo.classList.add('anda');
          clearTimeout(parar);
          parar = setTimeout(() => caminante.nodo.classList.remove('anda'), 180);
        }
        yAnterior = y;
      }
      // Una fecha se enciende cuando los pies de la tutora llegan a su altura (y se apaga si vuelve a subir).
      for (const h of hitos) {
        const llega = h.offsetTop + 16 <= y + alto - 12;
        if (llega && !h.classList.contains('activo')) {
          h.classList.add('activo');
          if (!primeraVez) caminante.reaccionar('contenta', 800);
        } else if (!llega) {
          h.classList.remove('activo');
        }
      }
      primeraVez = false;
    };
    window.addEventListener('scroll', seguir, { passive: true });
    window.addEventListener('resize', seguir);
    const alEmpezar = requestAnimationFrame(seguir);
    apagar.push(() => {
      window.removeEventListener('scroll', seguir);
      window.removeEventListener('resize', seguir);
      cancelAnimationFrame(alEmpezar);
      clearTimeout(parar);
    });
  }

  // ----- 4. En qué creemos: una tutora se asoma por detrás de cada tarjeta cuando entra en pantalla -----
  const curiosas = [];
  const valores = VALORES.map(v => {
    const curiosa = actriz(otra(), 'sobre-curiosa');
    const ficha = el('li', { class: 'sobre-valor caja' },
      el('div', { class: 'sobre-asoma' }, curiosa.nodo),
      el('h3', {}, t(`sobre.${v}.titulo`)),
      el('p', {}, t(`sobre.${v}.texto`)));
    ficha.addEventListener('pointerenter', () => curiosa.reaccionar('contenta', 900));
    curiosas.push({ ficha, curiosa });
    return ficha;
  });
  if (quieto || !('IntersectionObserver' in window)) {
    for (const { ficha } of curiosas) ficha.classList.add('asomada');
  } else {
    const vigia = new IntersectionObserver(entradas => {
      for (const entrada of entradas) {
        const dentro = entrada.intersectionRatio >= 0.85;
        const era = entrada.target.classList.contains('asomada');
        entrada.target.classList.toggle('asomada', dentro);
        if (dentro && !era) curiosas.find(c => c.ficha === entrada.target)?.curiosa.reaccionar('sorprendida', 700);
      }
    }, { threshold: [0, 0.85, 1] });
    for (const { ficha } of curiosas) vigia.observe(ficha);
    apagar.push(() => vigia.disconnect());
  }

  // ----- 5. Final: todas las tutoras desfilan -----
  const quietaDe = c => {
    const canvas = el('canvas', { width: 48, height: 60 });
    dibujoDe(c).then(dibujo => {
      const rejilla = dibujo.rejilla('normal');
      const ctx = canvas.getContext('2d');
      const arriba = canvas.height - rejilla.length;
      rejilla.forEach((fila, y) => fila.forEach((color, px) => {
        if (color) { ctx.fillStyle = color; ctx.fillRect(px, y + arriba, 1, 1); }
      }));
    }).catch(() => { canvas.hidden = true; });
    return canvas;
  };
  const todas = CURSOS.filter(c => !c.proximamente);
  const fila = el('div', { class: 'sobre-fila' }, [...todas, ...todas].map(quietaDe)); // dos veces: así la vuelta no se nota

  poner(contenedor,
    el('article', { class: 'sobre' },
      el('header', { class: 'sobre-cabecera' },
        entrada,
        el('div', { class: 'sobre-cabecera-texto' },
          el('h1', {}, t('sobre.titulo')),
          el('p', { class: 'sobre-lema' }, t('sobre.lema')))),

      el('section', { class: 'sobre-tarima' }, pista, tarjeta),

      el('section', { class: 'sobre-historia' },
        el('h2', {}, t('sobre.historia.titulo')),
        linea),

      el('section', {},
        el('h2', {}, t('sobre.valores.titulo')),
        el('ul', { class: 'sobre-valores' }, valores)),

      el('section', { class: 'sobre-fin' },
        el('h2', {}, t('sobre.contacto.titulo')),
        el('p', { class: 'sobre-fin-texto' }, t('sobre.contacto.texto'),
          TITULAR.correo && ' ', TITULAR.correo && el('a', { href: `mailto:${TITULAR.correo}` }, TITULAR.correo)),
        el('h2', {}, t('sobre.fin.titulo')),
        el('p', { class: 'inicio-botones' },
          hayCurso
            ? el('a', { class: 'boton boton-principal boton-grande', href: '#/lecciones', onclick: () => sonar('pagina') }, t('inicio.continuar', { curso: curso.nativo }))
            : el('a', { class: 'boton boton-principal boton-grande', href: '#/idiomas', onclick: () => sonar('pagina') }, t('inicio.empezar')),
          el('a', { class: 'boton', href: '#/inicio', onclick: () => sonar('pagina') }, t('inicio.titulo'))),
        el('div', { class: 'sobre-desfile', 'aria-hidden': 'true' }, fila)),

      el('p', { class: 'sobre-gracias' }, el('span', { 'aria-hidden': 'true' }, '♥ '), t('sobre.gracias')),

      el('footer', { class: 'inicio-pie' },
        el('p', {}, el('a', { href: '#/legal' }, t('legal.titulo')), ' · ', el('a', { href: '#/creditos' }, t('creditos.titulo'))))));

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}
