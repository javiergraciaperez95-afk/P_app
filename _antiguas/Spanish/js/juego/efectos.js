// Purpurina del modo juego: chispas, confeti y palabras que flotan.
// Todo son nodos sueltos que se borran solos; con «reducir movimiento» no se pinta nada.

const quieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORES = ['#ffd23f', '#ff5d73', '#6ad7ff', '#8be28b', '#ffffff', '#c48bff'];
const azar = (min, max) => min + Math.random() * (max - min);

function centro(nodo) {
  const r = nodo.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function particula(x, y, lado) {
  const p = document.createElement('i');
  p.className = 'chispa';
  p.style.cssText = `left:${x}px;top:${y}px;width:${lado}px;height:${lado}px;background:${COLORES[Math.floor(Math.random() * COLORES.length)]}`;
  document.body.append(p);
  return p;
}

/** Estallido de chispas desde el centro de un nodo. */
export function chispas(nodo, cantidad = 14) {
  if (quieto() || !nodo?.isConnected) return;
  const { x, y } = centro(nodo);
  for (let i = 0; i < cantidad; i += 1) {
    const angulo = azar(0, Math.PI * 2);
    const lejos = azar(40, 110);
    const p = particula(x, y, i % 3 ? 6 : 9);
    p.animate([
      { transform: 'translate(0, 0)', opacity: 1 },
      { transform: `translate(${Math.cos(angulo) * lejos}px, ${Math.sin(angulo) * lejos + 30}px)`, opacity: 0 },
    ], { duration: 800, easing: 'steps(8)', fill: 'forwards' });
    setTimeout(() => p.remove(), 850);
  }
}

/** Confeti que cae desde arriba por toda la pantalla. */
export function confeti(cantidad = 40) {
  if (quieto()) return;
  for (let i = 0; i < cantidad; i += 1) {
    const p = particula(azar(0, window.innerWidth), -12, i % 2 ? 8 : 11);
    p.animate([
      { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
      { transform: `translate(${azar(-80, 80)}px, ${window.innerHeight * azar(0.5, 1)}px) rotate(${azar(-360, 360)}deg)`, opacity: 0 },
    ], { duration: azar(1100, 2100), delay: azar(0, 350), easing: 'steps(14)', fill: 'both' });
    setTimeout(() => p.remove(), 2500);
  }
}

/** Una palabra que sube desde un nodo y se desvanece («¡Bien!»). */
export function flotar(nodo, texto) {
  if (quieto() || !nodo?.isConnected) return;
  const { x, y } = centro(nodo);
  const p = document.createElement('span');
  p.className = 'flota';
  p.lang = 'es';
  p.textContent = texto;
  p.style.cssText = `left:${x}px;top:${y}px`;
  document.body.append(p);
  p.animate([
    { transform: 'translate(-50%, -50%) scale(.6)', opacity: 0 },
    { transform: 'translate(-50%, -120%) scale(1.15)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%, -260%) scale(1)', opacity: 0 },
  ], { duration: 1000, easing: 'steps(10)', fill: 'forwards' });
  setTimeout(() => p.remove(), 1050);
}

/** Reinicia una animación de CSS que va por clase (temblor, salto…). */
export function animar(nodo, clase) {
  if (!nodo) return;
  nodo.classList.remove(clase);
  void nodo.offsetWidth;
  nodo.classList.add(clase);
}
