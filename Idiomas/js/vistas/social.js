// Pequeños escenarios pixel. Las animaciones se activan al tocar, sin reproducir música.
import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';

export function pintarSocial(root) {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursos = CURSOS.filter(c => !c.proximamente);
  const apagar = [];
  let viva = true;
  let reparto = 0;

  function tutora(extra = '') {
    const canvas = el('canvas', { width: 48, height: 64, class: 'social-sprite' });
    const nodo = el('span', { class: `social-personaje ${extra}` }, canvas);
    const persona = { nodo, sprite: null };
    const c = cursos[reparto++ % cursos.length];
    dibujoDe(c).then(dibujo => {
      if (!viva) return;
      if (quieto) {
        const ctx = canvas.getContext('2d');
        const rejilla = dibujo.rejilla('normal');
        rejilla.forEach((fila, y) => fila.forEach((color, x) => {
          if (color) { ctx.fillStyle = color; ctx.fillRect(x, y + 64 - rejilla.length, 1, 1); }
        }));
      } else {
        persona.sprite = dibujo.crearSprite(canvas);
        apagar.push(() => persona.sprite.parar?.());
      }
    }).catch(() => { nodo.hidden = true; });
    return persona;
  }

  const redes = [
    { id: 'instagram', nombre: 'Instagram', icono: '◎', titulo: t('social.aSnapshotOfOurDay'), texto: t('social.updatesIllustrationsAndLittleMoments'), accion: t('social.takeAPhoto'), respuesta: t('social.readyForThePaglotAlbum') },
    { id: 'tiktok', nombre: 'TikTok', icono: '♪', titulo: t('social.languagesWithALittleRhythm'), texto: t('social.shortVideosFunDiscoveriesAnd'), accion: t('social.findTheRhythm'), respuesta: t('social.thatTuneIsGoingTo') },
    { id: 'youtube', nombre: 'YouTube', icono: '▶', titulo: t('social.comeInClassIsStarting'), texto: t('social.guidesAndExplanationsToKeep'), accion: t('social.waveToTheCamera'), respuesta: t('social.helloReadyToLearnSomething') },
    { id: 'facebook', nombre: 'Facebook', icono: 'f', titulo: t('social.thereIsAlwaysRoomFor'), texto: t('social.aPlaceToShareUpdates'), accion: t('social.joinTheConversation'), respuesta: t('social.soLovelyToHaveYou') },
    { id: 'x', nombre: 'X', icono: '𝕏', titulo: t('social.aQuickMessageBeforeWe'), texto: t('social.announcementsIdeasAndShortNews'), accion: t('social.writeAnUpdate'), respuesta: t('social.newIdeaNotedLetS') },
    { id: 'discord', nombre: 'Discord', icono: '⌘', titulo: t('social.yourLittleConversationCorner'), texto: t('social.aSpaceToMeetFellow'), accion: t('social.sayHelloToTheGroup'), respuesta: t('social.hiTeamWhatShallWe') },
  ];
  // Direcciones provisionales solicitadas para preparar los botones de salida.
  const enlaces = {
    instagram: 'https://www.instagram.com/paglot_demo/',
    tiktok: 'https://www.tiktok.com/@paglot_demo',
    youtube: 'https://www.youtube.com/@paglot_demo',
    facebook: 'https://www.facebook.com/paglot_demo',
    x: 'https://x.com/paglot_demo',
    discord: 'https://discord.gg/paglot-demo',
  };

  const tarjetas = redes.map(red => {
    const protagonista = tutora();
    const decorado = el('span', { class: 'social-decorado', 'aria-hidden': 'true' }, protagonista.nodo);
    const actores = [protagonista];
    if (red.id === 'instagram') {
      decorado.append(el('span', { class: 'social-camara' }, el('i', {})), el('span', { class: 'social-foto' }, el('i', {}), el('b', {})));
    } else if (red.id === 'tiktok') {
      protagonista.nodo.append(el('i', { class: 'social-auriculares' }));
      decorado.append(el('span', { class: 'social-altavoz' }, el('i', {}), el('i', {})), el('span', { class: 'social-notas' }, el('i', {}, '♪'), el('i', {}, '♫'), el('i', {}, '♪')));
    } else if (red.id === 'youtube') {
      decorado.append(el('span', { class: 'social-video' }, el('i', {}, '▶'), el('b', {})), el('span', { class: 'social-grabando' }, '● REC'));
    } else if (red.id === 'facebook') {
      const amiga = tutora('social-amiga');
      actores.push(amiga);
      decorado.append(amiga.nodo, el('span', { class: 'social-charla social-charla-uno' }, '♥'), el('span', { class: 'social-charla social-charla-dos' }, '…'));
    } else if (red.id === 'x') {
      decorado.append(el('span', { class: 'social-maquina' }, el('i', { class: 'social-papel' }, el('b', {}), el('b', {}), el('b', {})), el('i', { class: 'social-teclas' })), el('span', { class: 'social-lapiz' }));
    } else {
      decorado.append(el('span', { class: 'social-ordenador' }, el('span', { class: 'social-chat' }, el('i', {}), el('i', {}), el('i', {}))), el('span', { class: 'social-mesa' }));
    }
    const feedback = el('p', { class: 'solo-lector', role: 'status', 'aria-live': 'polite' });
    let reloj;
    const escena = el('button', { type: 'button', class: `social-escena social-${red.id}`, 'aria-label': `${red.nombre}: ${red.accion}`, title: red.accion }, decorado);
    escena.addEventListener('click', () => {
      clearTimeout(reloj);
      escena.classList.remove('activa');
      // Reinicia únicamente la animación breve de la escena elegida.
      void escena.offsetWidth;
      escena.classList.add('activa');
      actores.forEach(a => a.sprite?.reaccionar('contenta', 1800));
      feedback.textContent = red.respuesta;
      sonar('clic');
      reloj = setTimeout(() => { escena.classList.remove('activa'); feedback.textContent = red.accion; }, 3200);
    });
    apagar.push(() => clearTimeout(reloj));
    return el('article', { class: `social-tarjeta social-tarjeta-${red.id}` },
      el('header', { class: 'social-canal' }, el('span', { 'aria-hidden': 'true' }, red.icono), el('h2', {}, red.nombre), el('small', {}, t('social.demo'))),
      escena,
      el('div', { class: 'social-texto' }, el('h3', {}, red.titulo), el('p', { class: 'solo-lector' }, red.texto), feedback,
        el('a', { class: 'social-enlace', href: enlaces[red.id], target: '_blank', rel: 'noopener noreferrer', 'aria-label': t('social.abrirEnlace', { red: red.nombre }) }, t('social.open'), red.nombre, ' ↗')));
  });
  poner(root, el('article', { class: 'comunidad pagina-social' },
    el('header', { class: 'comunidad-hero' },
      el('span', { class: 'comunidad-etiqueta' }, t('social.thePaglotCommunity')),
      el('h1', {}, t('social.seeYouBetweenLessons')),
      el('p', {}, t('social.pickYourCornerTapThe'))),
    el('div', { class: 'social-mosaico' }, tarjetas),
    el('p', { class: 'comunidad-nota' }, t('social.demoLinksOfficialProfilesComing'))));
  return () => { viva = false; apagar.forEach(parar => parar()); };
}
