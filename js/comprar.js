// Comprar un plan, un regalo o Fundadores: sin sesión, primero a entrar (y después se vuelve aquí); con sesión, el
// servidor prepara el pago con Stripe (al precio de su zona, no el que diga la app) y se va a la página de pago.
// Al volver, el webhook ya ha dado el plan y el Perfil lo enseña. En local no se cobra (solo en paglot.eu).
import { t } from './i18n.js';
import { sonar } from './sonidos.js';
import { decir } from './tutor.js';
import { haySesion, pagar, textoDeError } from './servidor.js';
import { zonaDeSuPais } from './region.js';

export async function comprar(producto, { regalo = false, quien = null } = {}) {
  const hablar = (texto, cara) => (quien ? quien.decir(texto) : decir(texto, cara));
  if (!haySesion()) {
    try { sessionStorage.setItem('paglot-tras-entrar', location.hash); } catch { /* sin almacenamiento */ }
    sonar('pagina');
    location.hash = '#/entrar/crear';
    return;
  }
  sonar('moneda');
  hablar(t('comprar.preparando'), 'pensando');
  try {
    const url = await pagar(producto, zonaDeSuPais(), regalo);
    location.href = url;
  } catch (e) {
    sonar('mal');
    hablar(textoDeError(e), 'confundida');
  }
}
