// Vistas informativas: productos; y, cada una en su archivo, redes (social.js), contacto (contacto.js) y tienda.
// El envío y las compras quedan preparados visualmente; todavía requieren servicios de backend.
import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
export { pintarSocial } from './social.js';
export { pintarTienda } from './tienda.js';
export { pintarContacto } from './contacto.js';

function cabecera(titulo, lema, etiqueta) {
  return el('header', { class: 'comunidad-hero' },
    el('span', { class: 'comunidad-etiqueta' }, etiqueta),
    el('h1', {}, titulo),
    el('p', {}, lema));
}

export function pintarProducto(root) {
  const productos = [
    ['01', 'Paglot Schools', t('comunidad.customCoursesAndCollaborationWith'), t('comunidad.forTeachersAndSchools'), '#/escuelas'],
    ['02', t('comunidad.paglotBusiness'), t('comunidad.coursesAdaptedToYourTeam'), t('comunidad.forTeams'), '#/empresas'],
    ['03', 'Paglot Max', t('comunidad.theFullPaglotExperienceExpanded'), t('comunidad.moreRoomToLearn'), '#/precios'],
    ['04', t('comunidad.giftPaglotMax'), t('comunidad.giveACodeForOne'), t('comunidad.aGiftThatKeepsOn'), '#/regala-max'],
  ];
  poner(root, el('article', { class: 'comunidad pagina-producto' },
    cabecera(t('comunidad.aWayToLearnFor'), t('comunidad.explorePaglotForLearnersSchools'), t('comunidad.product')),
    el('div', { class: 'producto-lista' }, productos.map(([numero, titulo, texto, pie, href]) => el('section', { class: 'producto-fila caja' },
      el('span', { class: 'producto-numero', 'aria-hidden': 'true' }, numero),
      el('div', {}, el('span', { class: 'comunidad-pie' }, pie), el('h2', {}, titulo), el('p', {}, texto)),
      el('a', { class: 'boton boton-mini', href, onclick: () => sonar('pagina') }, t('comunidad.learnMore')))))));
}

