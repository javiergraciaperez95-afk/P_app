// Repetición espaciada al estilo Anki (versión simplificada del algoritmo SM-2).
// Notas: 1 = Otra vez · 2 = Difícil · 3 = Bien · 4 = Fácil

import { t } from './i18n.js';

const MINUTO = 60 * 1000;
const DIA = 24 * 60 * MINUTO;

/** Botones para valorar una tarjeta. «texto» es la clave del texto (ver i18n). */
export const NOTAS = [
  { nota: 1, texto: 'srs.otraVez', tecla: '1' },
  { nota: 2, texto: 'srs.dificil', tecla: '2' },
  { nota: 3, texto: 'srs.bien', tecla: '3' },
  { nota: 4, texto: 'srs.facil', tecla: '4' },
];

export function nuevaTarjeta() {
  return { repeticiones: 0, intervalo: 0, facilidad: 2.5, lapsos: 0, vence: 0 };
}

function inicioDelDia(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Calcula el siguiente repaso según la nota. Devuelve un estado nuevo. */
export function programar(estado, nota, ahora = Date.now()) {
  const s = { ...nuevaTarjeta(), ...estado };

  if (nota === 1) {
    if (s.repeticiones > 0) s.lapsos += 1;
    s.repeticiones = 0;
    s.intervalo = 0;
    s.facilidad = Math.max(1.3, s.facilidad - 0.2);
    s.vence = ahora + MINUTO;
    return s;
  }

  if (s.repeticiones === 0 && nota === 2) {
    // Nueva o recién fallada y difícil: otra vez dentro de un rato.
    s.facilidad = Math.max(1.3, s.facilidad - 0.15);
    s.vence = ahora + 10 * MINUTO;
    s.intervalo = 0;
    return s;
  }

  let dias;
  if (s.repeticiones === 0) {
    dias = nota === 4 ? 4 : 1;
  } else {
    const base = Math.max(1, s.intervalo);
    if (nota === 2) dias = base * 1.2;
    else if (nota === 3) dias = base * s.facilidad;
    else dias = base * s.facilidad * 1.3;
  }
  s.intervalo = Math.max(1, Math.round(dias));
  s.facilidad = Math.min(3, Math.max(1.3, s.facilidad + (nota === 2 ? -0.15 : nota === 4 ? 0.15 : 0)));
  s.repeticiones += 1;
  s.vence = inicioDelDia(ahora) + s.intervalo * DIA;
  return s;
}

export function textoEspera(estado, nota, ahora = Date.now()) {
  const s = programar(estado, nota, ahora);
  const ms = s.vence - ahora;
  if (ms < DIA / 2 && s.intervalo === 0) return `${Math.max(1, Math.round(ms / MINUTO))} min`;
  const dias = s.intervalo;
  if (dias < 30) return t('srs.dias', { n: dias });
  if (dias < 365) return t('srs.meses', { n: Math.round(dias / 30) });
  return t('srs.anos', { n: (dias / 365).toFixed(1) });
}

export function esNueva(estado) {
  return !estado || (estado.repeticiones === 0 && estado.vence === 0);
}

export function tocaRepasar(estado, ahora = Date.now()) {
  return !esNueva(estado) && estado.vence <= ahora;
}

/** Estado legible: nueva, aprendiendo, en repaso o dominada (intervalo de 3 semanas o más). */
export function etapa(estado) {
  let clave = 'repaso';
  if (esNueva(estado)) clave = 'nueva';
  else if (estado.repeticiones === 0) clave = 'aprendiendo';
  else if (estado.intervalo >= 21) clave = 'dominada';
  return { clave, texto: t(`srs.etapa.${clave}`) };
}
