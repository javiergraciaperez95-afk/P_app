// Los temas de color (paletas) de toda la app. «paglot» es la de siempre y es de todo el mundo; Plus da dos más y Max
// todas. El CSS lo genera _herramientas/paletas.py (css/paletas.css): solo cambia el tono de fondos y papeles.
// Si alguien baja de plan, su paleta vuelve sola a la de siempre (paletaActual comprueba el plan cada vez).
import { tienePlan } from './planes.js';

export const PALETAS = [
  { id: 'paglot', plan: 'gratis' },
  { id: 'bosque', plan: 'plus' },
  { id: 'oceano', plan: 'plus' },
  { id: 'cereza', plan: 'max' },
  { id: 'atardecer', plan: 'max' },
  { id: 'carbon', plan: 'max' },
];
const CLAVE = 'paglot-paleta';

export const puedeUsar = id => tienePlan(PALETAS.find(p => p.id === id)?.plan ?? 'max');

export function paletaActual() {
  let id = 'paglot';
  try { id = localStorage.getItem(CLAVE) || 'paglot'; } catch { /* sin almacenamiento */ }
  return PALETAS.some(p => p.id === id) && puedeUsar(id) ? id : 'paglot';
}

export function aplicarPaleta() {
  const id = paletaActual();
  if (id === 'paglot') delete document.documentElement.dataset.paleta;
  else document.documentElement.dataset.paleta = id;
}

export function cambiarPaleta(id) {
  if (!puedeUsar(id)) return false;
  try { localStorage.setItem(CLAVE, id); } catch { /* sin almacenamiento */ }
  aplicarPaleta();
  return true;
}
