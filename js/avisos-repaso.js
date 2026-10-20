// Avisos para que no se pase el repaso:
//  · dentro de la app, la tutora lo recuerda una vez al día si hay tarjetas esperando (y no se está ya repasando);
//  · fuera de la app, solo si la persona lo pide (botón «Avísame para repasar» en el repaso):
//      en la APK, una notificación del sistema cada tarde (Capacitor LocalNotifications), con lo que toca;
//      en el navegador, una notificación cuando la pestaña está en segundo plano y hay repaso (como mucho cada 8 h).
// Nada sale del dispositivo: todo se calcula con el cuaderno guardado aquí.
import { el } from './dom.js';
import { t } from './i18n.js';
import { decir } from './tutor.js';
import { sonar } from './sonidos.js';
import { pendientesDeHoy } from './cabecera.js';

const CLAVE_ACTIVOS = 'paglot-avisos-repaso';
const CLAVE_TUTORA = 'paglot-aviso-repaso-dia';
const CLAVE_ULTIMO = 'paglot-aviso-repaso-ultimo';
const HORA_DEL_AVISO = 19; // las siete de la tarde
const ID_AVISO = 4201;
const CADA = 8 * 60 * 60 * 1000;

const leer = k => { try { return localStorage.getItem(k); } catch { return null; } };
const escribir = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };

const nativas = () => (window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.LocalNotifications ?? null : null);
const hayWeb = () => 'Notification' in window;
export const avisosPosibles = () => Boolean(nativas() || hayWeb());
export const avisosActivos = () => leer(CLAVE_ACTIVOS) === '1';

const hoy = () => new Date().toDateString();

/** Programa (o quita) la notificación de la tarde en la APK, con el número de tarjetas que tocarán. */
async function programarNativa() {
  const ln = nativas();
  if (!ln) return;
  try {
    await ln.cancel({ notifications: [{ id: ID_AVISO }] });
    if (!avisosActivos()) return;
    const cuando = new Date();
    cuando.setHours(HORA_DEL_AVISO, 0, 0, 0);
    // si hoy ya ha repasado o ya pasó la hora, mañana
    if (cuando <= new Date() || !pendientesDeHoy()) cuando.setDate(cuando.getDate() + 1);
    await ln.schedule({ notifications: [{
      id: ID_AVISO, title: t('aviso.repaso.titulo'), body: t('aviso.repaso.cuerpo'),
      schedule: { at: cuando, allowWhileIdle: true }, extra: { ruta: '#/repaso' },
    }] });
  } catch { /* el plugin no está o no hay permiso: no pasa nada */ }
}

/** En el navegador: si la pestaña está escondida y hay repaso, un aviso (como mucho cada ocho horas). */
function avisoWeb() {
  if (!avisosActivos() || !hayWeb() || nativas() || Notification.permission !== 'granted' || !document.hidden) return;
  const n = pendientesDeHoy();
  if (!n || Date.now() - Number(leer(CLAVE_ULTIMO) || 0) < CADA) return;
  escribir(CLAVE_ULTIMO, String(Date.now()));
  try {
    const aviso = new Notification(t('aviso.repaso.titulo'), { body: t('aviso.repaso.cuerpoN', { n }), icon: 'assets/apple-touch-icon.png', tag: 'paglot-repaso' });
    aviso.onclick = () => { window.focus(); location.hash = '#/repaso'; aviso.close(); };
  } catch { /* algunos móviles solo dejan avisar desde un service worker */ }
}

/** La tutora lo recuerda una vez al día, al entrar, si hay repaso y no se está ya en él (ni en una lección). */
function avisoTutora() {
  if (leer(CLAVE_TUTORA) === hoy() || /^#\/(repaso|leccion|reto|bienvenida)/.test(location.hash)) return;
  const n = pendientesDeHoy();
  if (!n) return;
  escribir(CLAVE_TUTORA, hoy());
  decir(t('aviso.repaso.tutora', { n }), 'normal');
}

/** Se llama una vez al arrancar la app. */
export function iniciarAvisosRepaso() {
  setTimeout(avisoTutora, 6000);
  programarNativa();
  setInterval(avisoWeb, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) setTimeout(avisoWeb, 60 * 1000); else programarNativa(); });
  // al tocar la notificación de la APK, al repaso
  nativas()?.addListener?.('localNotificationActionPerformed', e => { location.hash = e.notification?.extra?.ruta || '#/repaso'; });
}

async function pedirPermiso() {
  const ln = nativas();
  if (ln) {
    try { const r = await ln.requestPermissions(); return r.display === 'granted'; } catch { return false; }
  }
  if (!hayWeb()) return false;
  if (Notification.permission === 'granted') return true;
  try { return (await Notification.requestPermission()) === 'granted'; } catch { return false; }
}

/** Interruptor «Avísame para repasar» (en la portada del repaso). */
export function botonAvisos() {
  if (!avisosPosibles()) return null;
  const caja = el('label', { class: 'rp-avisos' });
  const casilla = el('input', { type: 'checkbox', checked: avisosActivos() });
  const texto = el('span', {}, t('aviso.repaso.interruptor'));
  const nota = el('small', { class: 'aprox' }, t(nativas() ? 'aviso.repaso.notaApk' : 'aviso.repaso.notaWeb'));
  casilla.addEventListener('change', async () => {
    if (casilla.checked) {
      const ok = await pedirPermiso();
      if (!ok) { casilla.checked = false; decir(t('aviso.repaso.sinPermiso'), 'confundida'); return; }
      escribir(CLAVE_ACTIVOS, '1');
      sonar('campana');
      decir(t('aviso.repaso.activados'), 'contenta');
    } else {
      escribir(CLAVE_ACTIVOS, null);
      decir(t('aviso.repaso.quitados'));
    }
    programarNativa();
  });
  caja.append(casilla, el('span', { class: 'rp-avisos-textos' }, texto, nota));
  return caja;
}
