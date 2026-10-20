// El aviso de los límites del plan gratis (js/limites.js): sin agobiar. Dice qué se ha acabado por hoy, que el repaso
// sigue siendo gratis y sin límite, y qué da Plus. Lo usan la lección, la práctica y el cuaderno.
import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { conCartel } from './carteles.js';
import { LECCIONES_GRATIS_AL_DIA, PRACTICAS_GRATIS_AL_DIA, CUADERNO_GRATIS } from '../config.js';

const N = { lecciones: LECCIONES_GRATIS_AL_DIA, practica: PRACTICAS_GRATIS_AL_DIA, cuaderno: CUADERNO_GRATIS };

/** La pantalla entera (lección o práctica de hoy agotadas). */
export function pintarMuro(app, tipo) {
  sonar('nada');
  poner(app,
    conCartel(el('section', { class: 'intro-vista' },
      el('h1', {}, t(`muro.${tipo}.titulo`)),
      el('p', {}, t(`muro.${tipo}.texto`, { n: N[tipo] }))), 'repaso'),
    el('section', { class: 'caja muro' },
      el('p', {}, el('strong', {}, t('muro.repasoGratis'))),
      el('ul', {}, el('li', {}, t('muro.plus1')), el('li', {}, t('muro.plus2')), el('li', {}, t('muro.plus3'))),
      el('div', { class: 'botonera' },
        el('a', { class: 'boton boton-principal', href: '#/precios' }, t('muro.verPlanes')),
        el('a', { class: 'boton', href: '#/repaso' }, t('muro.irRepaso')),
        el('a', { class: 'boton', href: '#/lecciones' }, t('comun.volverLecciones'))),
      el('p', { class: 'aprox' }, t('muro.hucha'))));
  decir(t(`muro.${tipo}.tutora`), 'pensando');
}

/** Solo el aviso de la tutora (guardar en el cuaderno a mano, cuando ya no quedan). */
export function avisarMuro(tipo) {
  sonar('nada');
  decir(t(`muro.${tipo}.texto`, { n: N[tipo] }) + ' ' + t('muro.verPlanesCorto'), 'pensando');
}
