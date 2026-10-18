// Confeti de píxeles para celebrar (fin de lección, cofres, logros). Solo mueve transform y opacity.

import { el } from './dom.js';

/** Lanza confeti desde el centro de un elemento. */
export function confeti(origen, cuantos = 26) {
  if (!origen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const caja = origen.getBoundingClientRect();
  const capa = el('div', { class: 'fiesta-confeti', 'aria-hidden': 'true', style: `left:${caja.left + caja.width / 2}px;top:${caja.top + caja.height / 3}px` });
  const colores = ['#f4c84a', '#d2353d', '#6fd38c', '#8fd8ff', '#ff8ad8', '#fff'];
  for (let k = 0; k < cuantos; k++) {
    const angulo = (Math.PI * 2 * k) / cuantos + Math.random() * 0.4;
    const fuerza = 60 + Math.random() * 90;
    capa.append(el('i', {
      style: `--dx:${(Math.cos(angulo) * fuerza).toFixed(0)}px;--dy:${(Math.sin(angulo) * fuerza - 50).toFixed(0)}px;--c:${colores[k % colores.length]};--r:${Math.floor(Math.random() * 360)}deg;--d:${(Math.random() * 0.15).toFixed(2)}s`,
    }));
  }
  document.body.append(capa);
  setTimeout(() => capa.remove(), 1500);
}
