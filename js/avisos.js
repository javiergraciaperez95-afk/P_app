// Los avisos de Phuong App.
//  · En el móvil (la APK, con Capacitor LocalNotifications): un aviso al día a la hora elegida. Cada día dice algo
//    distinto y útil: la pregunta del CCSE de ese día, las tarjetas que esperan en el repaso, la lección que toca o la
//    racha. El día que ya se ha estudiado no avisa (al estudiar se vuelven a programar desde mañana) y, si se deja la
//    app una semana, deja de avisar. Al tocarlo se abre la pantalla de lo que dice.
//  · La primera vez que se termina una lección o una ronda del CCSE, Lucía pregunta si se quiere el aviso y a qué
//    hora; solo entonces Android pide el permiso. La hora se cambia en Perfil → Ajustes (o en el repaso).
//  · Dentro de la app, Lucía recuerda una vez al día el repaso pendiente.

import { el } from './dom.js';
import { t } from './i18n.js';
import { ajuste, cambiarAjuste } from './ajustes.js';
import { alCambiar, actividadDeHoy, racha, tarjetas } from './progress.js';
import { tocaRepasar } from './srs.js';
import { decir } from './tutor.js';
import { sonar } from './sonidos.js';
import { pendientesDeHoy } from './cabecera.js';
import { examenesDeHoy } from './examenes.js';

export const HORAS = ['08:00', '12:00', '19:00', '21:00'];
const ID_PRIMERO = 730100;
const DIAS = 7;

const nativas = () => (window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.LocalNotifications ?? null : null);
export const avisosPosibles = () => Boolean(nativas());
const horaPuesta = () => /^\d\d:\d\d$/.test(ajuste('recordatorio') ?? '');
const estudiadoHoy = () => {
  const h = actividadDeHoy();
  const e = examenesDeHoy();
  return (h.ejercicios ?? 0) + (h.repasos ?? 0) + (e.ccse ?? 0) + (e.dele ?? 0) > 0;
};

// ----- Lo que dice cada día -----

/** Una pregunta del CCSE para ese día (la misma que la «pregunta del día» del inicio). */
async function preguntaDe(fecha) {
  try {
    const { cargarCcse } = await import('./vistas/ccse.js');
    const { preguntas } = await cargarCcse();
    const semilla = [...fecha.toLocaleDateString('sv')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11);
    return preguntas[semilla % preguntas.length];
  } catch {
    return null;
  }
}

/** El aviso del día d (0 = hoy): va cambiando de tema. */
async function avisoDelDia(d, cuando) {
  const tipo = ['ccse', 'repaso', 'ccse', 'leccion', 'ccse', 'racha', 'repaso'][(cuando.getDay() + d) % 7];
  const pendientes = tarjetas().filter(c => tocaRepasar(c.srs)).length || pendientesDeHoy();
  if (tipo === 'ccse' || (tipo === 'repaso' && !pendientes)) {
    const q = await preguntaDe(cuando);
    if (q) return { title: t('ph.aviso.ccseTitulo'), body: `${q.p} · ${t('ph.aviso.ccseCuerpo')}`, ruta: '#/inicio' };
  }
  if (tipo === 'repaso' && pendientes) return { title: t('ph.aviso.repasoTitulo'), body: t('ph.aviso.repasoCuerpo', { n: pendientes }), ruta: '#/repaso' };
  if (tipo === 'racha' && racha() > 1) return { title: t('ph.aviso.rachaTitulo', { n: racha() }), body: t('ph.aviso.rachaCuerpo'), ruta: '#/inicio' };
  return { title: t('ph.aviso.leccionTitulo'), body: t('ph.aviso.leccionCuerpo'), ruta: '#/lecciones' };
}

/** Programa los avisos de los próximos 7 días (sin el de hoy si ya se ha estudiado). */
async function programar() {
  const ln = nativas();
  if (!ln) return;
  try {
    await ln.cancel({ notifications: Array.from({ length: DIAS }, (_, d) => ({ id: ID_PRIMERO + d })) });
    if (!horaPuesta()) return;
    const [h, m] = ajuste('recordatorio').split(':').map(Number);
    const yaHoy = estudiadoHoy();
    const avisos = [];
    for (let d = 0; d < DIAS; d++) {
      const cuando = new Date();
      cuando.setDate(cuando.getDate() + d);
      cuando.setHours(h, m, 0, 0);
      if (cuando <= new Date() || (d === 0 && yaHoy)) continue;
      const { title, body, ruta } = await avisoDelDia(d, cuando);
      avisos.push({
        id: ID_PRIMERO + d, title, body, largeBody: body,
        // sin alarma exacta (unos minutos arriba o abajo da igual): si no, Android abre «Alarmas y recordatorios»
        isExactNotification: false,
        schedule: { at: cuando, allowWhileIdle: true },
        smallIcon: 'ic_stat_phuong', iconColor: '#C8102E',
        extra: { ruta },
      });
    }
    if (avisos.length) await ln.schedule({ notifications: avisos });
  } catch { /* sin permiso o sin el complemento: no pasa nada */ }
}

let programadoHoy = '';
/** Al abrir y la primera vez que se estudia cada día (para quitar el aviso de hoy), se vuelven a programar. */
function reprogramar() {
  if (!nativas() || !horaPuesta()) return;
  const marca = `${new Date().toDateString()}:${estudiadoHoy()}`;
  if (marca === programadoHoy) return;
  programadoHoy = marca;
  programar();
}

async function pedirPermiso() {
  const ln = nativas();
  if (!ln) return false;
  try {
    let p = await ln.checkPermissions();
    if (p.display !== 'granted') p = await ln.requestPermissions();
    return p.display === 'granted';
  } catch {
    return false;
  }
}

/** Pone el aviso diario a esa hora ('no': ninguno). Devuelve si se pudo. */
export async function ponerAviso(hora) {
  if (hora !== 'no' && !await pedirPermiso()) return false;
  cambiarAjuste('recordatorio', hora);
  programadoHoy = '';
  await programar();
  return true;
}

/** La pregunta de Lucía, una sola vez (cuando aún no hay respuesta guardada). */
function preguntar() {
  if (!nativas() || ajuste('recordatorio') != null || document.querySelector('.recordatorio-oferta')) return;
  const dialogo = el('dialog', { class: 'recordatorio-oferta caja', 'aria-labelledby': 'recordatorio-titulo' });
  const elegir = async hora => {
    dialogo.querySelectorAll('button').forEach(b => { b.disabled = true; });
    sonar('clic');
    const ok = hora === 'no' ? (cambiarAjuste('recordatorio', 'no'), false) : await ponerAviso(hora);
    if (!ok && hora !== 'no') cambiarAjuste('recordatorio', 'no');
    dialogo.close();
    dialogo.remove();
    if (ok) { sonar('campana'); decir(t('recordatorio.hecho', { hora }), 'contenta'); }
    else decir(t(hora === 'no' ? 'recordatorio.nada' : 'recordatorio.sinPermiso'), 'pensando');
  };
  dialogo.append(
    el('h2', { id: 'recordatorio-titulo' }, '🔔 ', t('recordatorio.titulo')),
    el('p', {}, t('ph.aviso.oferta')),
    el('div', { class: 'botonera' }, HORAS.map(hora => el('button', {
      type: 'button', class: `boton${hora === '19:00' ? ' boton-principal' : ''}`, onclick: () => elegir(hora),
    }, hora))),
    el('p', {}, el('button', { type: 'button', class: 'boton boton-mini', onclick: () => elegir('no') }, t('recordatorio.no'))));
  dialogo.addEventListener('cancel', e => { e.preventDefault(); elegir('no'); });
  document.body.append(dialogo);
  dialogo.showModal?.();
}

/** El selector de la hora del aviso (perfil y repaso). null si no hay avisos (en el navegador). */
export function selectorAviso() {
  if (!avisosPosibles()) return null;
  const grupo = el('div', { class: 'filtros', role: 'group', 'aria-label': t('ajustes.recordatorio') });
  const pintar = () => grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hora === (ajuste('recordatorio') ?? 'no'))));
  for (const hora of ['no', ...HORAS]) {
    const b = el('button', { type: 'button', class: 'boton boton-mini', 'data-hora': hora }, hora === 'no' ? t('ajustes.recordatorioNo') : hora);
    b.addEventListener('click', async () => {
      sonar('interruptor');
      if (!await ponerAviso(hora)) { decir(t('recordatorio.sinPermiso'), 'confundida'); return; }
      pintar();
      if (hora !== 'no') decir(t('recordatorio.hecho', { hora }), 'contenta');
    });
    grupo.append(b);
  }
  pintar();
  return grupo;
}

/** Lo que va en la portada del repaso (antes, «Avísame para repasar»). */
export function botonAvisos() {
  const selector = selectorAviso();
  if (!selector) return null;
  return el('div', { class: 'rp-avisos' }, el('span', { class: 'rp-avisos-textos' }, '🔔 ', t('ajustes.recordatorio')), selector);
}

/** Lucía recuerda el repaso una vez al día, al entrar (no si ya se está en él, en una lección o en un examen). */
function avisoTutora() {
  const CLAVE = 'phuong-aviso-repaso-dia';
  let visto = null;
  try { visto = localStorage.getItem(CLAVE); } catch { /* sin almacenamiento */ }
  if (visto === new Date().toDateString() || /^#\/(repaso|leccion|reto|ccse\/|dele\/|codigo)/.test(location.hash) || document.body.classList.contains('bloqueada')) return;
  const n = pendientesDeHoy();
  if (!n) return;
  try { localStorage.setItem(CLAVE, new Date().toDateString()); } catch { /* sin almacenamiento */ }
  decir(t('aviso.repaso.tutora', { n }), 'normal');
}

/** Se llama una vez al arrancar la app. */
export function iniciarAvisos() {
  // la primera lección (o la primera ronda del CCSE) terminada: se pregunta un poco después de la celebración
  window.addEventListener('leccion-terminada', () => setTimeout(preguntar, 2500));
  window.addEventListener('ronda-terminada', () => setTimeout(preguntar, 2500));
  alCambiar(reprogramar);
  setTimeout(reprogramar, 3000);
  setTimeout(avisoTutora, 8000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { programadoHoy = ''; reprogramar(); } });
  // al tocar un aviso, a lo que dice
  nativas()?.addListener?.('localNotificationActionPerformed', e => {
    const ruta = e.notification?.extra?.ruta;
    if (ruta) location.hash = ruta;
  });
}
