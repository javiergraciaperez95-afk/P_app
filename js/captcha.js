// Captcha de verdad para los formularios (contacto): Cloudflare Turnstile. Gratis, sin cookies de rastreo y casi
// siempre invisible (solo pide un toque si duda). El widget da un «token» que el servidor tiene que comprobar con la
// clave secreta (api/contacto.php): sin esa comprobación, el captcha no protege nada.
// La clave pública va en js/config.js (TURNSTILE_CLAVE). La de pruebas de Cloudflare deja pasar siempre: sirve en local.
import { el } from './dom.js';
import { t, idioma } from './i18n.js';
import { TURNSTILE_CLAVE } from './config.js';
import { temaActual } from './ajustes.js';

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let cargando = null;

function cargarTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!cargando) {
    cargando = new Promise((resolver, fallar) => {
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      s.onload = () => (window.turnstile ? resolver(window.turnstile) : fallar(new Error('turnstile')));
      s.onerror = () => { cargando = null; fallar(new Error('turnstile')); };
      document.head.append(s);
    });
  }
  return cargando;
}

/**
 * Pone el captcha. Devuelve { nodo, token(), reiniciar() }: token() es '' mientras no se haya superado.
 * Sin conexión (o si el navegador bloquea a Cloudflare) se dice en el propio hueco y el formulario no se puede enviar.
 */
export function crearCaptcha({ alCambiar = () => {} } = {}) {
  let id = null;
  let valor = '';
  const caja = el('div', { class: 'captcha-caja' });
  const aviso = el('p', { class: 'captcha-aviso', role: 'status' }, t('captcha.cargando'));
  const nodo = el('div', { class: 'captcha' }, caja, aviso);
  const poner = v => { valor = v; alCambiar(v); };

  cargarTurnstile().then(ts => {
    aviso.textContent = '';
    id = ts.render(caja, {
      sitekey: TURNSTILE_CLAVE,
      language: idioma(),
      theme: temaActual() === 'oscuro' ? 'dark' : 'light',
      size: window.innerWidth < 360 ? 'compact' : 'normal',
      callback: v => poner(v),
      'expired-callback': () => poner(''),
      'error-callback': () => { poner(''); aviso.textContent = t('captcha.error'); },
    });
  }).catch(() => { aviso.textContent = t('captcha.sinConexion'); });

  return {
    nodo,
    token: () => valor,
    reiniciar() { poner(''); if (id !== null && window.turnstile) window.turnstile.reset(id); },
  };
}
