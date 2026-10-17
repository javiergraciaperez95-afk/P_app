// El elenco de una escena (Sobre Paglot, Social, Regala Max, Contacto): las tutoras que salen en ella, repartidas
// sin repetirse, que solo se mueven mientras su parte de la página se ve. Las que no se ven se paran (el lienzo
// conserva su último dibujo) y vuelven a moverse al aparecer. Con «reducir movimiento», todas se pintan quietas.
// Los colores y el bocadillo están en css/escenas.css.

import { el } from '../dom.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';

export function crearElenco() {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apagados = [];
  let encendido = true;

  /** Después de ms milisegundos (si la pantalla sigue abierta). */
  const despues = (ms, fn) => {
    const id = setTimeout(() => { if (encendido) fn(); }, ms);
    apagados.push(() => clearTimeout(id));
    return id;
  };
  const alApagar = fn => apagados.push(fn);

  // El reparto: la del curso elegido es la protagonista; las demás, al azar y sin repetirse.
  const disponibles = CURSOS.filter(c => !c.proximamente);
  const principal = hayCurso ? curso : null;
  const barajadas = disponibles.filter(c => c.id !== principal?.id).sort(() => Math.random() - 0.5);
  let turno = 0;
  const otra = () => barajadas[turno++ % barajadas.length];
  const protagonista = () => principal ?? otra();

  // ----- Quién se ve -----
  const vivas = [];
  const vistas = new Set();
  const seVe = v => !document.hidden && [...vistas].some(s => s.contains(v.figura));
  const despertar = v => {
    if (!v.dibujo || v.sprite) return;
    v.sprite = v.dibujo.crearSprite(v.canvas);
    Object.assign(v.sprite, v.estado);
  };
  const dormirla = v => { v.siesta = null; v.sprite?.parar(); v.sprite = null; };
  // se para cuando ha pintado algún fotograma y ya no le quedan gestos
  const dormirAlAcabar = v => {
    const turnoSiesta = v.siesta = {};
    const mirar = () => {
      if (v.siesta !== turnoSiesta || !v.sprite) return;
      if (v.sprite.pintados && !v.sprite.ocupada()) dormirla(v); else setTimeout(mirar, 200);
    };
    setTimeout(mirar, 200);
  };
  const pintarQuieta = v => { if (v.pintada || !v.dibujo) return; v.pintada = true; despertar(v); dormirAlAcabar(v); };
  const actualizar = () => {
    for (const v of vivas) {
      const ve = seVe(v);
      if (v.quieta) { if (ve) pintarQuieta(v); else if (v.sprite) dormirla(v); } else if (ve) despertar(v); else dormirla(v);
    }
  };

  /**
   * Una tutora. clase: la de su sitio en la escena. quieta: se pinta una vez y solo despierta para un gesto.
   * Devuelve { figura, gesto(nombre), decir(texto, ms), reaccionar(expresion, ms), poner(estado), alTocar }.
   */
  function tutora(c, clase = '', { quieta = false, ancho = 48, alto = 64 } = {}) {
    const canvas = el('canvas', { class: 'tutora-lienzo', width: ancho, height: alto });
    const globo = el('span', { class: 'es-globo' });
    const figura = el('div', { class: `es-tutora ${clase}`.trim(), 'aria-hidden': 'true' }, globo, canvas);
    let toques = 0;
    const yo = { figura, canvas, globo, sprite: null, dibujo: null, quieta: quieta || quieto, pintada: false, siesta: null, estado: {}, callar: null, alTocar: null };
    dibujoDe(c).then(d => {
      if (!encendido) return;
      yo.dibujo = d;
      if (seVe(yo)) (yo.quieta ? pintarQuieta(yo) : despertar(yo));
    }).catch(() => { figura.hidden = true; });
    yo.gesto = nombre => {
      if (!yo.quieta) return yo.sprite?.gesto(nombre) ?? false;
      if (quieto || !seVe(yo)) return false;
      despertar(yo);
      yo.sprite?.gesto(nombre);
      dormirAlAcabar(yo);
      return true;
    };
    yo.reaccionar = (expresion, ms = 1200) => {
      if (yo.quieta) { if (quieto || !seVe(yo)) return; despertar(yo); dormirAlAcabar(yo); }
      yo.sprite?.reaccionar(expresion, ms);
    };
    /** Cambia algo que dura (andando, hablando…): se le vuelve a poner si se para y despierta. */
    yo.poner = estado => { Object.assign(yo.estado, estado); if (yo.sprite) Object.assign(yo.sprite, estado); };
    yo.decir = (texto, ms = 3200) => {
      globo.textContent = texto;
      // centrado sobre la tutora, pero corrido lo justo para no salirse de la pantalla (ni de su habitación, si la recorta)
      globo.style.setProperty('--corre', '0px');
      const caja = figura.getBoundingClientRect();
      const centro = caja.left + caja.width / 2;
      const mitad = globo.offsetWidth / 2;
      const marco = figura.closest('.es-limite')?.getBoundingClientRect() ?? { left: 0, right: document.documentElement.clientWidth };
      const corre = Math.max(marco.left + 8 - (centro - mitad), 0) + Math.min(marco.right - 8 - (centro + mitad), 0);
      globo.style.setProperty('--corre', `${Math.round(corre)}px`);
      figura.classList.add('habla');
      yo.poner({ hablando: true });
      clearTimeout(yo.callar);
      yo.callar = setTimeout(() => { figura.classList.remove('habla'); yo.poner({ hablando: false }); }, ms);
    };
    figura.addEventListener('click', e => {
      e.stopPropagation();
      // la primera vez saluda; si la sigues tocando, se ríe por las cosquillas
      sonar(toques++ % 3 === 0 ? 'saludo' : 'cosquillas');
      yo.reaccionar('cosquillas', 900);
      if (yo.alTocar) yo.alTocar(); else yo.gesto('firma');
    });
    vivas.push(yo);
    return yo;
  }

  /** Vigila partes de la escena: las que no se ven llevan la clase «es-fuera» (pausa sus animaciones de CSS). */
  let vigia = null;
  function vigilar(...partes) {
    if (!('IntersectionObserver' in window)) { partes.forEach(p => vistas.add(p)); actualizar(); return; }
    vigia ??= new IntersectionObserver(entradas => {
      for (const e of entradas) {
        if (e.isIntersecting) vistas.add(e.target); else vistas.delete(e.target);
        e.target.classList.toggle('es-fuera', !e.isIntersecting);
      }
      actualizar();
    }, { rootMargin: '60px 0px' });
    partes.forEach(p => vigia.observe(p));
  }
  const seVeParte = parte => !document.hidden && vistas.has(parte);

  document.addEventListener('visibilitychange', actualizar);

  function apagar() {
    encendido = false;
    vigia?.disconnect();
    document.removeEventListener('visibilitychange', actualizar);
    for (const v of vivas) { dormirla(v); clearTimeout(v.callar); }
    for (const f of apagados) f();
  }

  return { quieto, despues, alApagar, otra, protagonista, tutora, vigilar, seVeParte, apagar };
}

/** Una tutora pintada una vez, sin animar (para filas largas, como el desfile). */
export function tutoraPintada(c, ancho = 48, alto = 64) {
  const canvas = el('canvas', { class: 'tutora-lienzo', width: ancho, height: alto });
  dibujoDe(c).then(dibujo => {
    const rejilla = dibujo.rejilla('normal');
    const ctx = canvas.getContext('2d');
    const arriba = alto - rejilla.length;
    rejilla.forEach((fila, y) => {
      for (let x = 0; x < fila.length; x++) {
        const color = fila[x];
        if (!color) continue;
        let fin = x + 1;
        while (fila[fin] === color) fin++;
        ctx.fillStyle = color;
        ctx.fillRect(x, y + arriba, fin - x, 1);
        x = fin - 1;
      }
    });
  }).catch(() => { canvas.hidden = true; });
  return canvas;
}

/** Una rejilla vacía para dibujar con rectángulos de letras (como las de inicio-decorado.js). */
export function lienzo(ancho, alto) {
  const g = Array.from({ length: alto }, () => Array(ancho).fill('.'));
  const R = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < ancho && j >= 0 && j < alto) g[j][i] = c;
  };
  return { g, R, filas: () => g.map(f => f.join('')) };
}
