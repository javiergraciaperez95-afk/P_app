// Repetición espaciada: el mismo algoritmo que Anki (planificador SM-2 de Anki, v2),
// con sus ajustes por defecto. Este archivo no guarda nada: solo calcula.
//
// Estados de una tarjeta:
//   nueva → aprendiendo (pasos en minutos) → repaso (intervalos en días)
//   repaso --(Otra vez)--> reaprendiendo (pasos en minutos) → repaso
// Respuestas: 1 Otra vez · 2 Difícil · 3 Bien · 4 Fácil

export const AJUSTES = {
  pasosAprendizaje: [1, 10],   // minutos
  pasosReaprendizaje: [10],    // minutos
  intervaloGraduacion: 1,      // días (al terminar los pasos con «Bien»)
  intervaloFacil: 4,           // días («Fácil» siendo nueva)
  facilidadInicial: 2.5,       // 250 %
  facilidadMinima: 1.3,        // 130 %
  bonusFacil: 1.3,
  factorDificil: 1.2,
  nuevoIntervaloTrasFallo: 0,  // 0 % del intervalo anterior (mínimo 1 día)
  intervaloMaximo: 36500,
  nuevasPorDia: 20,
  repasosPorDia: 200,
  adelantoMinutos: 20,         // si no queda nada más, adelanta tarjetas en aprendizaje
  horaNuevoDia: 4,             // como Anki: el día cambia a las 4:00
};

const MIN = 60 * 1000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

export function nuevaTarjeta() {
  return { estado: 'nueva', paso: 0, intervalo: 0, facilidad: AJUSTES.facilidadInicial, vence: 0, repeticiones: 0, fallos: 0 };
}

/** Comienzo del «día Anki» (a las 4:00) que contiene ese momento. */
export function inicioDia(ts) {
  const d = new Date(ts - AJUSTES.horaNuevoDia * HORA);
  d.setHours(0, 0, 0, 0);
  return d.getTime() + AJUSTES.horaNuevoDia * HORA;
}

/** Clave del día Anki, p. ej. "2026-10-03". */
export function claveDia(ts) {
  const d = new Date(inicioDia(ts));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function enAprendizaje(t) {
  return t.estado === 'aprendiendo' || t.estado === 'reaprendiendo';
}

/** ¿Toca ya? (las de repaso vencen por días; las de aprendizaje, al minuto) */
export function toca(t, ahora, adelanto = 0) {
  if (t.estado === 'nueva') return false;
  if (enAprendizaje(t)) return t.vence <= ahora + adelanto;
  return t.vence < inicioDia(ahora) + DIA;
}

/** Devuelve una copia de la tarjeta tras responder. */
export function responder(tarjeta, r, ahora = Date.now()) {
  const t = { ...tarjeta, repeticiones: tarjeta.repeticiones + 1 };
  if (t.estado === 'repaso') return responderRepaso(t, r, ahora);
  const reaprendiendo = t.estado === 'reaprendiendo';
  const pasos = reaprendiendo ? AJUSTES.pasosReaprendizaje : AJUSTES.pasosAprendizaje;
  if (!reaprendiendo) t.estado = 'aprendiendo';

  const graduar = (dias) => {
    t.estado = 'repaso';
    t.paso = 0;
    t.intervalo = Math.min(dias, AJUSTES.intervaloMaximo);
    t.vence = inicioDia(ahora) + t.intervalo * DIA;
    return t;
  };

  if (r === 1) {
    t.paso = 0;
    t.vence = ahora + pasos[0] * MIN;
  } else if (r === 2) {
    // Anki: en el primer paso, «Difícil» espera la media de los dos primeros pasos
    const min = t.paso === 0 && pasos.length > 1 ? (pasos[0] + pasos[1]) / 2 : pasos[Math.min(t.paso, pasos.length - 1)];
    t.vence = ahora + min * MIN;
  } else if (r === 3) {
    if (t.paso + 1 >= pasos.length) return graduar(reaprendiendo ? t.intervalo : AJUSTES.intervaloGraduacion);
    t.paso += 1;
    t.vence = ahora + pasos[t.paso] * MIN;
  } else {
    return graduar(reaprendiendo ? t.intervalo + 1 : AJUSTES.intervaloFacil);
  }
  return t;
}

function responderRepaso(t, r, ahora) {
  const retraso = Math.max(0, Math.floor((inicioDia(ahora) - t.vence) / DIA));
  const ivl = t.intervalo;
  const f = t.facilidad;

  if (r === 1) {
    t.fallos += 1;
    t.facilidad = Math.max(AJUSTES.facilidadMinima, f - 0.2);
    t.intervalo = Math.max(1, Math.round(ivl * AJUSTES.nuevoIntervaloTrasFallo));
    if (AJUSTES.pasosReaprendizaje.length) {
      t.estado = 'reaprendiendo';
      t.paso = 0;
      t.vence = ahora + AJUSTES.pasosReaprendizaje[0] * MIN;
    } else {
      t.vence = inicioDia(ahora) + t.intervalo * DIA;
    }
    return t;
  }

  // Los tres intervalos, siempre en orden: Difícil < Bien < Fácil
  const dificil = Math.max(Math.round(ivl * AJUSTES.factorDificil), ivl + 1);
  const bien = Math.max(Math.round((ivl + retraso / 2) * f), dificil + 1);
  const facil = Math.max(Math.round((ivl + retraso) * f * AJUSTES.bonusFacil), bien + 1);

  let nuevo;
  if (r === 2) { nuevo = dificil; t.facilidad = Math.max(AJUSTES.facilidadMinima, f - 0.15); }
  else if (r === 3) { nuevo = bien; }
  else { nuevo = facil; t.facilidad = f + 0.15; }

  t.intervalo = Math.min(nuevo, AJUSTES.intervaloMaximo);
  t.vence = inicioDia(ahora) + t.intervalo * DIA;
  return t;
}

/** Texto del tiempo hasta el próximo repaso para cada botón («10 min», «4 d»…). */
export function etiquetaRespuesta(tarjeta, r, ahora = Date.now()) {
  const t = responder(tarjeta, r, ahora);
  if (t.estado === 'repaso') return formatoDias(t.intervalo);
  return formatoMinutos((t.vence - ahora) / MIN);
}

function formatoMinutos(m) {
  if (m < 1) return '<1 min';
  if (m < 60) return `${Math.round(m)} min`;
  return `${(m / 60).toFixed(1).replace('.0', '').replace('.', ',')} h`;
}

export function formatoDias(d) {
  if (d < 30) return `${d} d`;
  if (d < 365) return `${(d / 30).toFixed(1).replace('.', ',')} mes`;
  return `${(d / 365).toFixed(1).replace('.', ',')} años`;
}

/**
 * Siguiente tarjeta a repasar, en el orden de Anki:
 * aprendizaje vencido → repasos de hoy → nuevas (límite diario) → aprendizaje adelantado.
 * `tarjetas` es una lista de { id, srs, anadida }.
 */
export function siguiente(tarjetas, ahora, hechasHoy = { nuevas: 0, repasos: 0 }) {
  const c = contar(tarjetas, ahora, hechasHoy);
  if (c.aprendiendoYa.length) return menorVence(c.aprendiendoYa);
  if (c.repasos.length) return menorVence(c.repasos);
  if (c.nuevas.length) return c.nuevas[0];
  const adelantadas = tarjetas.filter((t) => enAprendizaje(t.srs) && toca(t.srs, ahora, AJUSTES.adelantoMinutos * MIN));
  return adelantadas.length ? menorVence(adelantadas) : null;
}

/** Cuántas quedan hoy de cada tipo (los tres números de Anki: azul, rojo, verde). */
export function contar(tarjetas, ahora, hechasHoy = { nuevas: 0, repasos: 0 }) {
  const aprendiendoYa = tarjetas.filter((t) => enAprendizaje(t.srs) && toca(t.srs, ahora));
  const repasos = tarjetas.filter((t) => t.srs.estado === 'repaso' && toca(t.srs, ahora))
    .slice(0, Math.max(0, AJUSTES.repasosPorDia - hechasHoy.repasos));
  const nuevas = tarjetas.filter((t) => t.srs.estado === 'nueva')
    .sort((a, b) => a.anadida - b.anadida)
    .slice(0, Math.max(0, AJUSTES.nuevasPorDia - hechasHoy.nuevas));
  return { aprendiendoYa, repasos, nuevas };
}

function menorVence(lista) {
  return lista.reduce((a, b) => (b.srs.vence < a.srs.vence ? b : a));
}
