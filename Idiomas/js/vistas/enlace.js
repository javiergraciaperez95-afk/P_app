// Pantalla de los enlaces de los correos: #/enlace/{confirmar|recuperar|correo}/{token}.
// El token va detrás de «#»: nunca llega a ningún servidor web ni a sus registros. Nada más leerlo se quita
// de la barra de direcciones, para que no se quede en el historial.

import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { abrirEnlace } from '../sync.js';
import { sonar } from '../sonidos.js';

export function pintarEnlace(app) {
  const [, , accion = '', token = ''] = location.hash.split('/');
  history.replaceState(null, '', '#/enlace');
  const caja = el('section', { class: 'caja enlace-correo', role: 'status' },
    el('h1', {}, t('enlace.titulo')),
    el('p', {}, t('form.unMomento')));
  poner(app, caja);

  const seguir = el('a', { class: 'boton boton-principal', href: '#/entrar', onclick: () => sonar('pagina') }, t('enlace.seguir'));
  abrirEnlace(accion, decodeURIComponent(token))
    .then(resultado => {
      // Contraseña nueva: el formulario está en la pantalla de la cuenta.
      if (resultado === 'recuperar') { location.hash = '#/entrar'; return; }
      sonar('bien');
      poner(caja,
        el('h1', {}, t('enlace.titulo')),
        el('p', {}, t(resultado === 'correo' ? 'enlace.correo' : 'enlace.confirmada')),
        el('div', { class: 'botonera' }, seguir));
    })
    .catch(error => {
      sonar('mal');
      poner(caja,
        el('h1', {}, t('enlace.error')),
        el('p', {}, error.message),
        el('div', { class: 'botonera' }, seguir));
    });
}
