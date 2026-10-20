// Pantalla «Social» (#/social): el salón recreativo de Paglot. Seis máquinas arcade, una por red social, con
// una tutora dentro de cada pantalla. Al tocar la pantalla «se echa una moneda»: la escena se anima, la tutora
// hace su gesto y la pantalla contesta. Mientras nadie juega, las máquinas hacen su demostración por turnos.
// La encargada, sentada en el letrero de neón, da la bienvenida. De día la sala tiene luz; de noche, neones.
// Los enlaces son provisionales. Colores en css/social.css; las tutoras, con js/vistas/elenco.js.

import { el, poner, alAzar } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { crearElenco } from './elenco.js';

// Las cuentas de Paglot en cada red. Vacío = todavía no existe: el botón dice «Muy pronto» (nada de enlaces inventados).
const ENLACES = {
  instagram: '',
  tiktok: '',
  youtube: '',
  facebook: '',
  x: '',
  discord: '',
};

export function pintarSocial(root) {
  const elenco = crearElenco();
  const { quieto, despues, alApagar } = elenco;

  const redes = [
    { id: 'instagram', nombre: 'Instagram', icono: '◎', titulo: t('social.aSnapshotOfOurDay'), texto: t('social.updatesIllustrationsAndLittleMoments'), accion: t('social.takeAPhoto'), respuesta: t('social.readyForThePaglotAlbum'), gesto: 'pulgar' },
    { id: 'tiktok', nombre: 'TikTok', icono: '♪', titulo: t('social.languagesWithALittleRhythm'), texto: t('social.shortVideosFunDiscoveriesAnd'), accion: t('social.findTheRhythm'), respuesta: t('social.thatTuneIsGoingTo'), gesto: 'baile' },
    { id: 'youtube', nombre: 'YouTube', icono: '▶', titulo: t('social.comeInClassIsStarting'), texto: t('social.guidesAndExplanationsToKeep'), accion: t('social.waveToTheCamera'), respuesta: t('social.helloReadyToLearnSomething'), gesto: 'saludar' },
    { id: 'facebook', nombre: 'Facebook', icono: 'f', titulo: t('social.thereIsAlwaysRoomFor'), texto: t('social.aPlaceToShareUpdates'), accion: t('social.joinTheConversation'), respuesta: t('social.soLovelyToHaveYou'), gesto: 'dedoCorazon' },
    { id: 'x', nombre: 'X', icono: '𝕏', titulo: t('social.aQuickMessageBeforeWe'), texto: t('social.announcementsIdeasAndShortNews'), accion: t('social.writeAnUpdate'), respuesta: t('social.newIdeaNotedLetS'), gesto: 'escribir' },
    { id: 'discord', nombre: 'Discord', icono: '⌘', titulo: t('social.yourLittleConversationCorner'), texto: t('social.aSpaceToMeetFellow'), accion: t('social.sayHelloToTheGroup'), respuesta: t('social.hiTeamWhatShallWe'), gesto: 'invitar' },
  ];

  // La encargada, sentada en el letrero
  const encargada = elenco.tutora(elenco.protagonista(), 'rc-encargada');
  encargada.alTocar = () => { encargada.gesto('saludar'); encargada.decir(alAzar(t('social.encargada')), 3200); };

  /** El decorado de dentro de cada pantalla: la tutora (o dos) y sus cosas. */
  function escenaDe(red) {
    const actrices = [elenco.tutora(elenco.otra(), 'rc-actriz')];
    const cosas = [];
    if (red.id === 'instagram') {
      cosas.push(el('span', { class: 'rc-camara' }, el('i', {})), el('span', { class: 'rc-foto' }, el('i', {})), el('span', { class: 'rc-flash' }));
    } else if (red.id === 'tiktok') {
      actrices[0].figura.append(el('i', { class: 'rc-cascos' }));
      cosas.push(el('span', { class: 'rc-altavoz' }, el('i', {}), el('i', {})), el('span', { class: 'rc-notas' }, el('i', {}, '♪'), el('i', {}, '♫'), el('i', {}, '♪')));
    } else if (red.id === 'youtube') {
      cosas.push(el('span', { class: 'rc-video' }, el('i', {}, '▶')), el('span', { class: 'rc-rec' }, '● REC'), el('span', { class: 'rc-barra' }, el('i', {})));
    } else if (red.id === 'facebook') {
      actrices.push(elenco.tutora(elenco.otra(), 'rc-actriz rc-amiga'));
      cosas.push(el('span', { class: 'rc-corazones' }, el('i', {}, '♥'), el('i', {}, '♥'), el('i', {}, '♥')));
    } else if (red.id === 'x') {
      cosas.push(el('span', { class: 'rc-teclas' }, el('span', { class: 'rc-hoja' }, el('b', {}), el('b', {}), el('b', {}))));
    } else {
      cosas.push(el('span', { class: 'rc-monitor' }, el('i', {}), el('i', {}), el('i', {})));
    }
    return { actrices, nodo: el('div', { class: 'rc-escena', 'aria-hidden': 'true' }, cosas, actrices.map(a => a.figura)) };
  }

  const maquinas = redes.map(red => {
    const { actrices, nodo: escena } = escenaDe(red);
    const letrero = el('span', { class: 'rc-letrero-pantalla' }, `▶ ${red.accion}`);
    const aviso = el('p', { class: 'solo-lector', role: 'status', 'aria-live': 'polite' });
    const pantalla = el('button', { type: 'button', class: 'rc-pantalla', 'aria-label': `${red.nombre}: ${red.accion}` },
      escena, el('span', { class: 'rc-rayas', 'aria-hidden': 'true' }), letrero);
    const nodo = el('article', { class: `rc-maquina rc-${red.id}` },
      el('header', { class: 'rc-marquesina' },
        el('span', { class: 'rc-icono', 'aria-hidden': 'true' }, red.icono),
        el('h2', {}, red.nombre),
        el('small', {}, t('social.demo'))),
      el('div', { class: 'rc-marco' }, pantalla),
      el('div', { class: 'rc-mandos', 'aria-hidden': 'true' }, el('span', { class: 'rc-palanca' }), el('span', { class: 'rc-botones' }, el('i', {}), el('i', {}))),
      el('div', { class: 'rc-instrucciones' }, el('h3', {}, red.titulo), el('p', {}, red.texto)),
      ENLACES[red.id]
        ? el('a', { class: 'rc-ranura', 'data-sonido': 'ficha', href: ENLACES[red.id], target: '_blank', rel: 'noopener noreferrer', 'aria-label': t('social.abrirEnlace', { red: red.nombre }) },
          el('span', { class: 'rc-moneda', 'aria-hidden': 'true' }), el('span', {}, t('social.open'), red.nombre, ' ↗'))
        : el('span', { class: 'rc-ranura rc-pronto', 'aria-disabled': 'true' }, el('span', {}, red.nombre, ' · ', t('precios.pronto'))),
      aviso);
    const m = { red, nodo, pantalla, letrero, aviso, actrices, reloj: null };
    pantalla.addEventListener('click', () => jugar(m, true));
    return m;
  });

  /** Echar una moneda: la escena se anima un rato y la pantalla contesta. */
  function jugar(m, deVerdad) {
    clearTimeout(m.reloj);
    m.nodo.classList.remove('activa');
    void m.nodo.offsetWidth; // vuelve a empezar la animación
    m.nodo.classList.add('activa');
    m.actrices.forEach((a, i) => { a.gesto(i ? 'saludarI' : m.red.gesto); if (deVerdad) a.reaccionar('contenta', 1600); });
    if (deVerdad) {
      sonar('arcade');
      m.letrero.textContent = m.red.respuesta;
      m.aviso.textContent = m.red.respuesta;
      encargada.reaccionar('contenta', 900);
    }
    m.reloj = setTimeout(() => {
      m.nodo.classList.remove('activa');
      m.letrero.textContent = `▶ ${m.red.accion}`;
    }, 3200);
  }
  alApagar(() => maquinas.forEach(m => clearTimeout(m.reloj)));

  const sala = el('section', { class: 'rc-sala' },
    el('header', { class: 'rc-cartel' },
      encargada.figura,
      el('span', { class: 'rc-bombillas', 'aria-hidden': 'true' }),
      el('span', { class: 'rc-etiqueta' }, t('social.thePaglotCommunity')),
      el('h1', {}, t('social.seeYouBetweenLessons')),
      el('p', {}, t('social.pickYourCornerTapThe'))),
    el('p', { class: 'rc-nota' }, el('span', { class: 'rc-celo', 'aria-hidden': 'true' }), t('social.demoLinksOfficialProfilesComing')),
    el('div', { class: 'rc-fila' }, maquinas.map(m => m.nodo)));

  poner(root, el('article', { class: 'recreativo escena-web' }, sala));
  elenco.vigilar(sala);

  // La bienvenida y, mientras nadie juega, la demostración de las máquinas por turnos.
  sonar('neon');
  despues(900, () => { encargada.gesto('saludar'); sonar('saludo'); encargada.decir(t('social.encargada')[0], 3600); });
  if (!quieto) {
    let turno = 0;
    const demo = setInterval(() => {
      if (!elenco.seVeParte(sala)) return;
      const libre = maquinas.filter(m => !m.nodo.classList.contains('activa'));
      if (libre.length < maquinas.length) return; // alguien está jugando
      jugar(maquinas[turno++ % maquinas.length], false);
    }, 4200);
    alApagar(() => clearInterval(demo));
  }

  return () => elenco.apagar();
}
