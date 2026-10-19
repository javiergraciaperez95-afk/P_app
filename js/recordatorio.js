// El recordatorio diario, solo en la APK (window.PaglotRecordatorio, en _apk/puente.js). Decisión del 19-10-2026:
// - al abrir la app por primera vez no se pide permiso; al terminar la primera lección, la tutora pregunta si se quiere
//   un aviso al día y a qué hora (o «No, gracias»), y solo si se elige una hora Android pide el permiso;
// - el día que ya se ha estudiado no se avisa: al estudiar, los avisos se vuelven a programar desde mañana.
// La hora se cambia o se quita en Perfil → Ajustes.

import { el } from './dom.js';
import { t } from './i18n.js';
import { ajuste, cambiarAjuste } from './ajustes.js';
import { alCambiar, actividadDeHoy } from './progress.js';
import { decir } from './tutor.js';
import { sonar } from './sonidos.js';

const HORAS = ['09:00', '13:00', '19:00', '21:00'];
const hayRecordatorio = () => typeof window.PaglotRecordatorio === 'function';
const estudiadoHoy = () => { const h = actividadDeHoy(); return (h.ejercicios ?? 0) + (h.repasos ?? 0) > 0; };
const horaPuesta = () => /^\d\d:\d\d$/.test(ajuste('recordatorio') ?? '');

/** Vuelve a programar los avisos (sin pedir permiso): al abrir y la primera vez que se estudia cada día. */
let reprogramadoHoy = '';
function reprogramar() {
  if (!hayRecordatorio() || !horaPuesta()) return;
  const yaHoy = estudiadoHoy();
  const marca = `${new Date().toDateString()}:${yaHoy}`;
  if (marca === reprogramadoHoy) return;
  reprogramadoHoy = marca;
  window.PaglotRecordatorio(ajuste('recordatorio'), { pedir: false, yaHoy }).catch(() => {});
}

/** La pregunta, una sola vez (cuando aún no hay respuesta guardada). */
function preguntar() {
  if (!hayRecordatorio() || ajuste('recordatorio') != null || document.querySelector('.recordatorio-oferta')) return;
  const dialogo = el('dialog', { class: 'recordatorio-oferta caja', 'aria-labelledby': 'recordatorio-titulo' });
  const elegir = async hora => {
    dialogo.querySelectorAll('button').forEach(b => { b.disabled = true; });
    sonar('clic');
    let ok = false;
    if (hora !== 'no') { try { ok = await window.PaglotRecordatorio(hora); } catch { ok = false; } }
    cambiarAjuste('recordatorio', ok ? hora : 'no');
    dialogo.close();
    dialogo.remove();
    if (ok) { sonar('campana'); decir(t('recordatorio.hecho', { hora }), 'contenta'); reprogramar(); }
    else decir(t(hora === 'no' ? 'recordatorio.nada' : 'recordatorio.sinPermiso'), 'pensando');
  };
  dialogo.append(
    el('h2', { id: 'recordatorio-titulo' }, '🔔 ', t('recordatorio.titulo')),
    el('p', {}, t('recordatorio.texto')),
    el('div', { class: 'botonera' }, HORAS.map(hora => el('button', {
      type: 'button', class: `boton${hora === '19:00' ? ' boton-principal' : ''}`, onclick: () => elegir(hora),
    }, hora))),
    el('p', {}, el('button', { type: 'button', class: 'boton boton-mini', onclick: () => elegir('no') }, t('recordatorio.no'))));
  dialogo.addEventListener('cancel', e => { e.preventDefault(); elegir('no'); });
  document.body.append(dialogo);
  dialogo.showModal?.();
}

// la primera lección terminada: se pregunta un poco después, cuando ya se ha visto la celebración
window.addEventListener('leccion-terminada', () => setTimeout(preguntar, 2500));
alCambiar(reprogramar);
setTimeout(reprogramar, 3000);
