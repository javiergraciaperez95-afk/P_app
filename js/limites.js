// Los límites del plan gratis (los paywalls). Con Plus o Max no hay ninguno; el modo desarrollador y la cuenta de
// desarrollo tampoco tienen (js/planes.js). Los números están en js/config.js:
//  · lecciones NUEVAS que se pueden empezar cada día (las ya empezadas se siguen y se repiten sin límite);
//  · rondas de «Práctica» al día;
//  · palabras guardadas A MANO en el cuaderno (las que llegan solas al terminar una lección no cuentan).
// El repaso no se limita nunca: es lo que hace que lo aprendido se quede.
import { LECCIONES_GRATIS_AL_DIA, PRACTICAS_GRATIS_AL_DIA, CUADERNO_GRATIS } from './config.js';
import { tienePlan } from './planes.js';
import { tarjetas, leccionesAbiertasHoy, estaAbierta } from './progress.js';
import { curso } from './curso.js';

const sinLimites = () => tienePlan('plus');
const hoy = () => new Date().toDateString();

// ----- Lecciones nuevas -----
export const leccionesNuevasRestantes = () => (sinLimites() ? Infinity : Math.max(0, LECCIONES_GRATIS_AL_DIA - leccionesAbiertasHoy()));
/** ¿Se puede abrir esta lección? Siempre si ya se había empezado; si es nueva, solo si quedan del día. */
export const puedeAbrirLeccion = id => sinLimites() || estaAbierta(id) || leccionesNuevasRestantes() > 0;

// ----- Práctica -----
const clavePracticas = () => `${curso.prefijo}-practicas-hoy`;
function practicasDeHoy() {
  try {
    const v = JSON.parse(localStorage.getItem(clavePracticas()) || 'null');
    return v?.dia === hoy() ? v.n : 0;
  } catch { return 0; }
}
export const puedePracticar = () => sinLimites() || practicasDeHoy() < PRACTICAS_GRATIS_AL_DIA;
export function anotarPractica() {
  try { localStorage.setItem(clavePracticas(), JSON.stringify({ dia: hoy(), n: practicasDeHoy() + 1 })); } catch { /* sin almacenamiento */ }
}

// ----- Cuaderno -----
const aMano = c => (Array.isArray(c.origen) ? c.origen[0] : '') !== 'cuaderno.deLeccion';
export const guardadasAMano = () => tarjetas().filter(aMano).length;
export const puedeGuardarAMano = () => sinLimites() || guardadasAMano() < CUADERNO_GRATIS;
