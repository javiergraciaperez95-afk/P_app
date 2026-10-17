// «Continuar con Google»: consigue el token firmado de Google (el «ID token») para mandarlo a la API,
// que comprueba la firma (servidor/src/Google.php).
//   - En la web: Google Identity Services, con su propio botón (https://developers.google.com/identity/gsi/web).
//   - En la APK: el plugin de Capacitor «SocialLogin» (@capgo/capacitor-social-login), que abre la ventana
//     nativa de Android para elegir la cuenta.
// Las dos necesitan GOOGLE_CLIENTE en config.js. Sin él, el botón no sale.

import { el } from './dom.js';
import { GOOGLE_CLIENTE } from './config.js';
import { t, idioma } from './i18n.js';

const SCRIPT = 'https://accounts.google.com/gsi/client';
const nativo = () => Boolean(window.Capacitor?.isNativePlatform?.());
const plugin = () => window.Capacitor?.Plugins?.SocialLogin ?? null;

/** ¿Se puede ofrecer Google aquí? */
export function googleDisponible() {
  if (!GOOGLE_CLIENTE) return false;
  return nativo() ? Boolean(plugin()) : true;
}

let cargaScript = null;
function cargarScript() {
  cargaScript ??= new Promise((resolver, rechazar) => {
    if (window.google?.accounts?.id) { resolver(); return; }
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolver();
    s.onerror = () => { cargaScript = null; rechazar(new Error(t('nube.err.sinConexion'))); };
    document.head.append(s);
  });
  return cargaScript;
}

let iniciadoNativo = false;

/**
 * El botón de Google. Cuando la persona elige su cuenta llama a alToken(credencial);
 * si algo falla (sin conexión, ventana cerrada…), a alError(error).
 */
export function botonGoogle(alToken, alError) {
  const caja = el('div', { class: 'boton-google' });
  if (nativo()) {
    const boton = el('button', { type: 'button', class: 'boton boton-grande boton-google-nativo' },
      el('span', { class: 'google-g', 'aria-hidden': 'true' }, 'G'), t('cuenta.google'));
    boton.addEventListener('click', async () => {
      try {
        const sl = plugin();
        if (!iniciadoNativo) {
          await sl.initialize({ google: { webClientId: GOOGLE_CLIENTE } });
          iniciadoNativo = true;
        }
        const r = await sl.login({ provider: 'google', options: { scopes: ['email', 'profile'] } });
        const token = r?.result?.idToken;
        if (!token) throw new Error(t('nube.err.google'));
        await alToken(token);
      } catch (e) {
        alError(e);
      }
    });
    caja.append(boton);
    return caja;
  }

  // Web: el botón lo dibuja Google (así lo exige su guía de marca). Mide lo que el hueco.
  cargarScript().then(() => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENTE,
      callback: async r => {
        try { await alToken(r.credential); } catch (e) { alError(e); }
      },
      ux_mode: 'popup',
      use_fedcm_for_prompt: true,
    });
    window.google.accounts.id.renderButton(caja, {
      type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with',
      locale: idioma(), width: Math.min(400, Math.max(200, caja.clientWidth || 320)),
    });
  }).catch(alError);
  return caja;
}
