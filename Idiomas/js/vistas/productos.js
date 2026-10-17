import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';

// Las tres páginas comparten solo la carga de la tutora y su limpieza al navegar.
function preparar(id) {
  let viva = true;
  const apagar = [];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function personaje(alTocar) {
    const canvas = el('canvas', { width: 48, height: 64 });
    const boton = el('button', { class: 'producto-anfitriona', type: 'button', 'aria-label': t('productos.sayHelloToTheTutor') }, canvas);
    let sprite;
    dibujoDe(CURSOS.find(c => c.id === id) ?? CURSOS[0]).then(dibujo => {
      if (!viva) return;
      if (quieto) {
        const ctx = canvas.getContext('2d');
        const rejilla = dibujo.rejilla('normal');
        rejilla.forEach((fila, y) => fila.forEach((color, x) => {
          if (color) { ctx.fillStyle = color; ctx.fillRect(x, y + 64 - rejilla.length, 1, 1); }
        }));
      } else {
        sprite = dibujo.crearSprite(canvas);
        apagar.push(() => sprite.parar?.());
      }
    }).catch(() => { boton.hidden = true; });
    boton.addEventListener('click', () => { sprite?.reaccionar('contenta', 1100); sonar('clic'); alTocar?.(); });
    return boton;
  }
  return { personaje, cerrar: () => { viva = false; apagar.forEach(f => f()); } };
}

const contacto = texto => el('a', { class: 'boton boton-principal', href: '#/contacto', onclick: () => sonar('pagina') }, texto, ' ↗');
const encabezado = (etiqueta, titulo, texto) => el('header', { class: 'producto-presentacion' },
  el('span', { class: 'comunidad-etiqueta' }, etiqueta), el('h1', {}, titulo), el('p', {}, texto));

export function pintarEscuelas(root) {
  const { personaje, cerrar } = preparar('es');
  const pizarra = el('p', { class: 'escuelas-pizarra-frase', role: 'status' }, t('productos.everyClassroomIsAWorld'));
  const pasos = [
    [t('productos.weListen'), t('productos.languagesAgesLevelsAndGoals')],
    [t('productos.weCreateTogether'), t('productos.wePrepareCustomCoursesAnd')],
    [t('productos.weCollaborate'), t('productos.weWantToWorkWith')],
  ];
  poner(root, el('article', { class: 'producto-detalle producto-escuelas' },
    el('div', { class: 'escuelas-hero' },
      encabezado('Paglot Schools', t('productos.aLanguageJourneyThatStarts'), t('productos.customCoursesForSchoolsCreated')),
      el('div', { class: 'escuelas-escena' },
        el('div', { class: 'escuelas-pizarra' }, el('span', { 'aria-hidden': 'true' }, 'A → あ → Hola'), pizarra, el('span', { class: 'escuelas-tiza', 'aria-hidden': 'true' })),
        personaje(() => { pizarra.textContent = t('productos.letSBuildYourCourse'); }))),
    el('ol', { class: 'escuelas-pasos' }, pasos.map(([titulo, texto], i) => el('li', {}, el('span', { class: 'escuelas-numero', 'aria-hidden': 'true' }, `0${i + 1}`), el('h2', {}, titulo), el('p', {}, texto)))),
    el('section', { class: 'escuelas-oferta' },
      el('div', { class: 'escuelas-sello' }, el('strong', {}, '−50%'), el('span', {}, t('productos.from20Students'))),
      el('div', {}, el('h2', {}, t('productos.aGiftForTheWhole')),
        el('p', {}, t('productos.wantToGiveYourStudents')),
        el('p', {}, t('productos.contactUsAboutAGroup')),
        contacto(t('productos.tellUsAboutYourSchool'))))));
  return cerrar;
}

export function pintarEmpresas(root) {
  const { personaje, cerrar } = preparar('en');
  const mensaje = el('p', { class: 'empresas-mensaje', role: 'status' }, t('productos.helloTeam'));
  const objetivos = [
    [t('productos.yourSector'), t('productos.contentAndVocabularyRelatedTo')],
    [t('productos.yourGoals'), t('productos.meetingsCustomerServiceOrInternational')],
    [t('productos.yourPace'), t('productos.shortLessonsToFitPractice')],
  ];
  poner(root, el('article', { class: 'producto-detalle producto-empresas' },
    el('div', { class: 'empresas-hero' },
      encabezado(t('productos.paglotBusiness'), t('productos.letLanguageOpenTheNext'), t('productos.languageLearningForTeamsWith')),
      el('div', { class: 'empresas-oficina' },
        el('div', { class: 'empresas-monitor' }, el('span', { 'aria-hidden': 'true' }, t('productos.paglotTeam')), mensaje, el('i', { 'aria-hidden': 'true' })),
        el('span', { class: 'empresas-escritorio', 'aria-hidden': 'true' }),
        personaje(() => { mensaje.textContent = t('productos.oneTeamManyPossibilities'); }))),
    el('section', { class: 'empresas-objetivos' }, el('h2', {}, t('productos.aPlanThatMakesSense')),
      el('div', { class: 'empresas-columnas' }, objetivos.map(([titulo, texto], i) => el('div', {}, el('span', { class: 'empresas-indice' }, `0${i + 1}`), el('h3', {}, titulo), el('p', {}, texto))))),
    el('section', { class: 'empresas-acuerdo' },
      el('div', {}, el('span', { class: 'comunidad-etiqueta' }, t('productos.learnAsATeam')),
        el('h2', {}, t('productos.20PeopleHalfThePrice')),
        el('p', {}, t('productos.from20PeopleWeOffer'))),
      el('div', { class: 'empresas-contacto' }, el('p', {}, t('productos.tellUsYourTeamSize')), contacto(t('productos.discussAProposal'))))));
  return cerrar;
}

export function pintarRegalo(root) {
  const { personaje, cerrar } = preparar('fr');
  let duracion = 'mes';
  const periodo = el('strong', { class: 'regalo-periodo' });
  const resumen = el('p', { class: 'regalo-resumen', role: 'status', 'aria-live': 'polite' });
  const botones = ['mes', 'ano'].map(clave => el('button', {
    class: 'boton', type: 'button', 'aria-pressed': String(clave === duracion),
    onclick: () => { duracion = clave; actualizar(); sonar('clic'); },
  }, clave === 'mes' ? t('productos.oneMonth') : t('productos.oneYear')));
  function actualizar() {
    periodo.textContent = duracion === 'mes' ? t('productos.1MonthOfPaglotMax') : t('productos.1YearOfPaglotMax');
    resumen.textContent = duracion === 'mes' ? t('productos.onePremiumMonthStartingWhen') : t('productos.onePremiumYearStartingWhen');
    botones.forEach((boton, i) => boton.setAttribute('aria-pressed', String(['mes', 'ano'][i] === duracion)));
  }
  const nota = el('p', { class: 'regalo-saludo', role: 'status' }, t('productos.oneGiftAThousandConversations'));
  const pasos = [
    [t('productos.chooseAndPay'), t('productos.chooseOneMonthOrOne')],
    [t('productos.receiveYourCode'), t('productos.afterPaymentYouReceiveA')],
    [t('productos.letThemStartWhenThey'), t('productos.theRecipientRedeemsTheCode')],
  ];
  poner(root, el('article', { class: 'producto-detalle producto-regalo' },
    encabezado(t('productos.giftPaglotMax'), t('productos.giveThemTheirNextConversation'), t('productos.oneMonthOrOneYear')),
    el('div', { class: 'regalo-hero' },
      el('div', { class: 'regalo-escena' },
        el('div', { class: 'regalo-tarjeta' }, el('span', { class: 'regalo-cinta', 'aria-hidden': 'true' }, '✦'), el('span', { class: 'regalo-marca' }, 'Paglot Max'), periodo, el('span', { class: 'regalo-codigo' }, t('productos.yourCodeAfterPurchase'))),
        personaje(() => { nota.textContent = t('productos.thereIsANewLanguage'); })),
      el('section', { class: 'regalo-eleccion' }, el('h2', {}, t('productos.howMuchLearningWouldYou')),
        el('div', { class: 'regalo-duracion', role: 'group', 'aria-label': t('productos.giftDuration') }, botones), resumen,
        el('p', {}, t('productos.theCodeIsTheGift')),
        el('button', { class: 'boton boton-principal', type: 'button', disabled: true }, t('productos.purchasingComingSoon')), nota)),
    el('ol', { class: 'regalo-pasos' }, pasos.map(([titulo, texto], i) => el('li', {}, el('span', { 'aria-hidden': 'true' }, `0${i + 1}`), el('h2', {}, titulo), el('p', {}, texto))))));
  actualizar();
  return cerrar;
}
