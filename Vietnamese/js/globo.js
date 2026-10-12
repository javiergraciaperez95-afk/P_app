// Globo que aparece al pasar el ratón (o tocar / enfocar) una palabra vietnamita.
// Tiene un botón ☆ para guardarla en el cuaderno, así que se puede entrar en él con el ratón.

import { esc } from './util.js';
import { sonido } from './sonido.js';
import { htmlEstrella } from './marcar.js';
import { htmlAltavoz } from './voz.js';
import { paginasPronunciacion } from './frases.js';
import { decir } from './tutora.js';

let globo;
let actual = null;
let temporizador = null;

export function iniciarGlobo() {
  globo = document.getElementById('globo');
  globo.addEventListener('click', (e) => {
    if (!e.target.closest('[data-pronunciar]') || !actual) return;
    const d = actual.dataset;
    sonido.clic();
    decir(paginasPronunciacion({ vi: d.vi, fonetica: d.fonetica }));
  });

  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const p = e.target.closest?.('.palabra');
    if (p) { cancelarOcultar(); mostrar(p); }
    else if (e.target.closest?.('#globo')) cancelarOcultar();
  });
  document.addEventListener('pointerout', (e) => {
    if (e.pointerType !== 'mouse') return;
    const desde = e.target.closest?.('.palabra, #globo');
    if (!desde || desde.contains(e.relatedTarget)) return;
    if (e.relatedTarget?.closest?.('#globo') || e.relatedTarget === actual) return;
    if (document.activeElement === actual || globo.contains(document.activeElement)) return;
    ocultarLuego();
  });
  document.addEventListener('focusin', (e) => {
    const p = e.target.closest?.('.palabra');
    if (p) { cancelarOcultar(); mostrar(p); }
  });
  document.addEventListener('focusout', (e) => {
    if (!e.target.closest?.('.palabra, #globo')) return;
    const destino = e.relatedTarget;
    if (destino && (globo.contains(destino) || destino === actual)) return;
    ocultarLuego();
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest?.('#globo')) return;
    const p = e.target.closest?.('.palabra');
    if (p) mostrar(p); else ocultarGlobo();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && actual) { const p = actual; ocultarGlobo(); p.focus(); }
  });
  window.addEventListener('scroll', ocultarGlobo, { passive: true });
  window.addEventListener('resize', ocultarGlobo);
}

function mostrar(p) {
  if (actual === p && !globo.hidden) return;
  if (actual) actual.removeAttribute('aria-describedby');
  actual = p;
  sonido.globo();
  const d = p.dataset;
  const leccion = p.closest('[data-leccion]')?.dataset.leccion || '';
  const frase = p.closest('[data-ejemplo-vi]')?.dataset; // la frase donde sale, como ejemplo para el cuaderno
  const ejemplo = frase ? { vi: frase.ejemploVi, es: frase.ejemploEs } : null;
  globo.innerHTML =
    `<span class="globo-fila"><span class="globo-vi" lang="vi">${esc(d.vi)}</span>${htmlAltavoz(d.vi, d.vi)}</span>` +
    (d.pron ? `<span class="globo-pron">[${esc(d.pron)}]</span>` : '') +
    `<span class="globo-es">${esc(d.es)}</span>` +
    (d.nota ? `<span class="globo-nota">${esc(d.nota)}</span>` : '') +
    `<span class="globo-botones">${htmlEstrella({ vi: d.vi, es: d.es, pron: d.pron, nota: d.nota }, leccion, true, ejemplo)}` +
    '<button type="button" class="estrella-texto globo-como" data-pronunciar>Cómo suena</button></span>';
  globo.hidden = false;
  p.setAttribute('aria-describedby', 'globo');

  const r = p.getBoundingClientRect();
  const g = globo.getBoundingClientRect();
  const x = Math.max(8, Math.min(r.left + r.width / 2 - g.width / 2, window.innerWidth - g.width - 8));
  let y = r.top - g.height - 8;
  if (y < 8) y = r.bottom + 8;
  globo.style.left = `${Math.round(x)}px`;
  globo.style.top = `${Math.round(y)}px`;
}

function ocultarLuego() {
  cancelarOcultar();
  temporizador = setTimeout(ocultarGlobo, 300);
}

function cancelarOcultar() {
  clearTimeout(temporizador);
}

export function ocultarGlobo() {
  cancelarOcultar();
  if (!globo || globo.hidden) return;
  globo.hidden = true;
  actual?.removeAttribute('aria-describedby');
  actual = null;
}
