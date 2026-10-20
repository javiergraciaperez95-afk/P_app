// Repetición espaciada al estilo Anki (SM-2 simplificado), por días: cada tarjeta se repasa como mucho UNA vez al día.
// Notas: 1 = Otra vez · 2 = Difícil · 3 = Bien · 4 = Fácil (en la app las pone el minijuego según cómo se responde).
//  · Fallar no la repite hoy: vuelve mañana, con un olvido más y algo menos de facilidad.
//  · Nueva: bien o difícil → mañana; fácil → dentro de 3 días. Después, el intervalo crece con la facilidad.
//  · Cada día entran como mucho NUEVAS_AL_DIA tarjetas nuevas.
// En el estado se guarda también el día del último repaso (ult), el del primero (inicio) y el último minijuego (modo).

import { t } from './i18n.js';

const DIA = 24 * 60 * 60 * 1000;
export const NUEVAS_AL_DIA = 15;

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

const diaDe = (ms = Date.now()) => new Date(ms).toLocaleDateString('sv');
function inicioDelDia(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Calcula el siguiente repaso según la nota. Devuelve un estado nuevo. */
export function programar(estado, nota, ahora = Date.now()) {
  const s = { ...nuevaTarjeta(), ...estado };
  s.ult = diaDe(ahora);
  s.inicio ??= s.ult;

  if (nota === 1) {
    if (s.repeticiones > 0) s.lapsos += 1;
    s.repeticiones = 0;
    s.intervalo = 1;
    s.facilidad = Math.max(1.3, s.facilidad - 0.2);
    s.vence = inicioDelDia(ahora) + DIA;
    return s;
  }

  let dias;
  if (s.repeticiones === 0) {
    dias = nota === 4 ? 3 : 1;
  } else {
    const base = Math.max(1, s.intervalo);
    if (nota === 2) dias = Math.max(base + 1, base * 1.2);
    else if (nota === 3) dias = Math.max(base + 1, base * s.facilidad);
    else dias = Math.max(base + 2, base * s.facilidad * 1.3);
  }
  s.intervalo = Math.min(365, Math.max(1, Math.round(dias)));
  s.facilidad = Math.min(3, Math.max(1.3, s.facilidad + (nota === 2 ? -0.15 : nota === 4 ? 0.15 : 0)));
  s.repeticiones += 1;
  s.vence = inicioDelDia(ahora) + s.intervalo * DIA;
  return s;
}

/** «Mañana», «3 ngày», «2 tháng»…: cuándo vuelve la tarjeta con esa nota. */
export function textoEspera(estado, nota, ahora = Date.now()) {
  return textoDias(programar(estado, nota, ahora).intervalo);
}
export function textoDias(dias) {
  if (dias < 30) return t('srs.dias', { n: dias });
  if (dias < 365) return t('srs.meses', { n: Math.round(dias / 30) });
  return t('srs.anos', { n: (dias / 365).toFixed(1) });
}

export function esNueva(estado) {
  return !estado || (estado.repeticiones === 0 && estado.vence === 0);
}

/** Si ya se ha repasado hoy (entonces no vuelve hasta otro día). */
export const repasadaHoy = (estado, ahora = Date.now()) => estado?.ult === diaDe(ahora);

export function tocaRepasar(estado, ahora = Date.now()) {
  return !esNueva(estado) && estado.vence <= ahora && !repasadaHoy(estado, ahora);
}

/** Lo de hoy: las que tocan (las más atrasadas primero), las nuevas que aún caben hoy y las ya repasadas hoy. */
export function colaDeHoy(lista, ahora = Date.now()) {
  const hoy = diaDe(ahora);
  const conTexto = lista.filter(c => c.es);
  const pendientes = conTexto.filter(c => tocaRepasar(c.srs, ahora)).sort((a, b) => a.srs.vence - b.srs.vence);
  const empezadasHoy = conTexto.filter(c => c.srs?.inicio === hoy).length;
  const nuevas = conTexto.filter(c => esNueva(c.srs)).sort((a, b) => (a.creada ?? 0) - (b.creada ?? 0))
    .slice(0, Math.max(0, NUEVAS_AL_DIA - empezadasHoy));
  const hechas = conTexto.filter(c => repasadaHoy(c.srs, ahora)).length;
  return { pendientes, nuevas, hechas };
}

/** Cuántas tocarán mañana (para el final del repaso). */
export function paraManana(lista, ahora = Date.now()) {
  const finManana = inicioDelDia(ahora) + 2 * DIA;
  return lista.filter(c => c.es && !esNueva(c.srs) && c.srs.vence < finManana && !(c.srs.vence <= ahora && !repasadaHoy(c.srs, ahora))).length;
}

/** Estado legible: nueva, aprendiendo, en repaso o dominada (intervalo de 3 semanas o más). */
export function etapa(estado) {
  let clave = 'repaso';
  if (esNueva(estado)) clave = 'nueva';
  else if (estado.repeticiones === 0) clave = 'aprendiendo';
  else if (estado.intervalo >= 21) clave = 'dominada';
  return { clave, texto: t(`srs.etapa.${clave}`) };
}
