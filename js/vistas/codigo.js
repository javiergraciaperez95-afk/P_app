// La puerta de Phuong App: lo primero que se ve al abrirla. Lucía pide el código de la cuenta (cuatro cifras) con un
// teclado grande; con el bueno, la app se abre y el progreso se junta con el de la nube (js/nube.js).
// También vale el teclado físico (cifras, borrar e Intro).

import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { crearSprite } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { codigoCorrecto, entrar, recordado, CIFRAS } from '../cuenta.js';

/** Pinta la puerta. alEntrar() se llama con el código ya aceptado. Devuelve la función que la apaga. */
export function pintarCodigo(app, { alEntrar }) {
  let escrito = '';
  let ocupado = false;
  let fallos = 0;

  const canvas = el('canvas', { class: 'ph-lienzo', width: 48, height: 64 });
  const globo = el('p', { class: 'ph-globo', 'aria-live': 'polite' }, t('ph.codigo.hola'));
  const sprite = crearSprite(canvas);
  setTimeout(() => sprite.gesto?.('saludar'), 400);
  const tutora = el('div', { class: 'ph-codigo-tutora' }, globo, el('span', { class: 'ph-tutora-grande' }, canvas));

  const puntos = el('div', { class: 'ph-puntos', role: 'img', 'aria-label': t('ph.codigo.puntos', { n: 0, total: CIFRAS }) },
    Array.from({ length: CIFRAS }, () => el('span', { class: 'ph-punto' })));
  const pintarPuntos = () => {
    [...puntos.children].forEach((p, i) => p.classList.toggle('lleno', i < escrito.length));
    puntos.setAttribute('aria-label', t('ph.codigo.puntos', { n: escrito.length, total: CIFRAS }));
  };

  const recordar = el('input', { type: 'checkbox', id: 'ph-recordar' });
  recordar.checked = recordado();

  async function comprobar() {
    if (ocupado || escrito.length < CIFRAS) return;
    ocupado = true;
    const intento = escrito;
    if (await codigoCorrecto(intento)) {
      sonar('fanfarria');
      sprite.reaccionar?.('contenta', 1600);
      sprite.gesto?.(['celebrar', 'aplaudir']);
      globo.textContent = t('ph.codigo.bien');
      puerta.classList.add('abierta');
      entrar(intento, { recordar: recordar.checked });
      setTimeout(() => alEntrar(intento), 900);
      return;
    }
    fallos += 1;
    sonar('mal');
    sprite.reaccionar?.('confundida', 1400);
    globo.textContent = t(fallos >= 3 ? 'ph.codigo.malMucho' : 'ph.codigo.mal');
    puntos.classList.remove('tiembla'); void puntos.offsetWidth; puntos.classList.add('tiembla');
    if (navigator.vibrate) try { navigator.vibrate(120); } catch { /* sin vibración */ }
    setTimeout(() => { escrito = ''; pintarPuntos(); ocupado = false; }, 450);
  }

  const pulsar = cifra => {
    if (ocupado || escrito.length >= CIFRAS) return;
    escrito += cifra;
    sonar('tecla');
    pintarPuntos();
    if (escrito.length === CIFRAS) setTimeout(comprobar, 150);
  };
  const borrar = () => {
    if (ocupado || !escrito) return;
    escrito = escrito.slice(0, -1);
    sonar('borrar');
    pintarPuntos();
  };

  const tecla = (texto, accion, clase = '', etiqueta = texto) =>
    el('button', { type: 'button', class: `ph-tecla ${clase}`.trim(), 'aria-label': etiqueta, 'data-sonido': 'nada', onclick: accion }, texto);
  const teclado = el('div', { class: 'ph-teclado' },
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(c => tecla(c, () => pulsar(c))),
    tecla('⌫', borrar, 'ph-tecla-borrar', t('ph.codigo.borrar')),
    tecla('0', () => pulsar('0')),
    tecla('✓', comprobar, 'ph-tecla-ok', t('ph.codigo.entrar')));

  const alTeclear = e => {
    if (/^\d$/.test(e.key)) { e.preventDefault(); pulsar(e.key); } else if (e.key === 'Backspace') { e.preventDefault(); borrar(); } else if (e.key === 'Enter') { e.preventDefault(); comprobar(); }
  };
  document.addEventListener('keydown', alTeclear);

  const puerta = el('section', { class: 'ph-codigo', 'aria-labelledby': 'ph-codigo-titulo' },
    el('div', { class: 'ph-codigo-cielo', 'aria-hidden': 'true' }),
    tutora,
    el('h1', { id: 'ph-codigo-titulo', class: 'ph-marca' }, 'Phuong', el('span', {}, ' App')),
    el('p', { class: 'ph-codigo-lema' }, t('ph.codigo.lema')),
    el('p', { class: 'ph-codigo-pide' }, t('ph.codigo.pide')),
    puntos,
    teclado,
    el('label', { class: 'ph-recordar', for: 'ph-recordar' }, recordar, el('span', {}, t('ph.codigo.recordar'))));
  poner(app, puerta);

  return () => {
    document.removeEventListener('keydown', alTeclear);
    sprite.parar?.();
  };
}
