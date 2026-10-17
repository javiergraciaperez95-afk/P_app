// Vistas informativas: redes, contacto, productos y tienda. El envío y las compras
// quedan preparados visualmente; todavía requieren servicios de backend.
import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
export { pintarSocial } from './social.js';
export { pintarTienda } from './tienda.js';

function cabecera(titulo, lema, etiqueta) {
  return el('header', { class: 'comunidad-hero' },
    el('span', { class: 'comunidad-etiqueta' }, etiqueta),
    el('h1', {}, titulo),
    el('p', {}, lema));
}

export function pintarContacto(root) {
  const n = () => Math.floor(Math.random() * 7) + 2;
  const a = n(), b = n();
  const estado = el('p', { class: 'contacto-estado', role: 'status', 'aria-live': 'polite' });
  const form = el('form', { class: 'contacto-form caja', novalidate: true },
    el('label', {}, t('comunidad.paglotUsername'), el('input', { name: 'usuario', autocomplete: 'username', required: true, maxlength: 60 })),
    el('label', {}, t('comunidad.emailRegisteredWithPaglot'), el('input', { name: 'correo', type: 'email', autocomplete: 'email', required: true, maxlength: 254 })),
    el('label', {}, t('comunidad.subject'), el('select', { name: 'asunto', required: true },
      el('option', { value: '', selected: true, disabled: true }, t('comunidad.chooseASubject')),
      ...[
        ['general', t('comunidad.generalQuestion')], ['tecnico', t('comunidad.technicalIssue')],
        ['lecciones', t('comunidad.lessonsAndContent')], ['pagos', t('comunidad.paymentsPMaxOrSubscription')],
        ['escuelas', t('comunidad.paglotSchoolsOrBusiness')], ['idea', t('comunidad.suggestion')], ['privacidad', t('comunidad.privacyAndAccount')],
      ].map(([value, label]) => el('option', { value }, label)))),
    el('label', {}, t('comunidad.message'), el('textarea', { name: 'mensaje', rows: 6, required: true, maxlength: 4000 })),
    el('label', { class: 'contacto-captcha' }, t('comunidad.captcha', { a, b }), el('input', { name: 'captcha', type: 'number', inputmode: 'numeric', required: true, 'aria-label': t('comunidad.captchaAnswer') })),
    el('p', { class: 'comunidad-nota' }, t('comunidad.thisCheckHelpsPreventAutomated')),
    el('button', { type: 'submit', class: 'boton boton-principal' }, t('comunidad.send')),
    estado);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (Number(new FormData(form).get('captcha')) !== a + b) {
      estado.textContent = t('comunidad.thatAnswerIsNotCorrect');
      form.elements.captcha.focus(); return;
    }
    estado.textContent = t('comunidad.formValidatedEmailDeliveryWill');
    sonar('clic');
  });
  poner(root, el('article', { class: 'comunidad pagina-contacto' },
    cabecera(t('comunidad.weAreHereToHelp'), t('comunidad.tellUsWhatYouNeed'), t('comunidad.contact')),
    form));
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

