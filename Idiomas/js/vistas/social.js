// Pequeños escenarios pixel. Las animaciones se activan al tocar, sin reproducir música.
import { el, poner } from '../dom.js';
import { copiarUI as copy } from '../i18n.js';
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
    { id: 'instagram', nombre: 'Instagram', icono: '◎', titulo: copy('Una foto de nuestro día', 'A snapshot of our day'), texto: copy('Novedades, ilustraciones y pequeños momentos entre lecciones.', 'Updates, illustrations and little moments between lessons.'), accion: copy('Saca una foto', 'Take a photo'), respuesta: copy('¡Lista para el álbum de Paglot!', 'Ready for the Paglot album!') },
    { id: 'tiktok', nombre: 'TikTok', icono: '♪', titulo: copy('Idiomas con mucho ritmo', 'Languages with a little rhythm'), texto: copy('Vídeos cortos, curiosidades y un ratito para aprender sonriendo.', 'Short videos, fun discoveries and a little learning with a smile.'), accion: copy('Dale al ritmo', 'Find the rhythm'), respuesta: copy('¡Esta canción se queda en la cabeza!', 'That tune is going to stay with me!') },
    { id: 'youtube', nombre: 'YouTube', icono: '▶', titulo: copy('Pasa, empieza la clase', 'Come in, class is starting'), texto: copy('Guías y explicaciones para acompañar tus ganas de aprender.', 'Guides and explanations to keep your curiosity going.'), accion: copy('Saluda a la cámara', 'Wave to the camera'), respuesta: copy('¡Hola! ¿Preparados para aprender algo nuevo?', 'Hello! Ready to learn something new?') },
    { id: 'facebook', nombre: 'Facebook', icono: 'f', titulo: copy('Siempre hay sitio para ti', 'There is always room for you'), texto: copy('Un lugar para compartir novedades y celebrar pequeños avances.', 'A place to share updates and celebrate small steps forward.'), accion: copy('Únete a la conversación', 'Join the conversation'), respuesta: copy('¡Qué bien tenerte por aquí!', 'So lovely to have you here!') },
    { id: 'x', nombre: 'X', icono: '𝕏', titulo: copy('Un mensaje y seguimos', 'A quick message before we go'), texto: copy('Anuncios, ideas y noticias breves, directo al grano.', 'Announcements, ideas and short news, straight to the point.'), accion: copy('Escribe una novedad', 'Write an update'), respuesta: copy('Nueva idea apuntada. ¡Seguimos creando!', 'New idea noted. Let’s keep creating!') },
    { id: 'discord', nombre: 'Discord', icono: '⌘', titulo: copy('Tu rincón de conversación', 'Your little conversation corner'), texto: copy('Un espacio para conocer a otros estudiantes y compartir el camino.', 'A space to meet fellow learners and share the journey.'), accion: copy('Di hola al grupo', 'Say hello to the group'), respuesta: copy('¡Hola, equipo! ¿Qué practicamos hoy?', 'Hi, team! What shall we practise today?') },
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
      el('header', { class: 'social-canal' }, el('span', { 'aria-hidden': 'true' }, red.icono), el('h2', {}, red.nombre), el('small', {}, copy('Demo', 'Demo'))),
      escena,
      el('div', { class: 'social-texto' }, el('h3', {}, red.titulo), el('p', { class: 'solo-lector' }, red.texto), feedback,
        el('a', { class: 'social-enlace', href: enlaces[red.id], target: '_blank', rel: 'noopener noreferrer', 'aria-label': copy(`Abrir ${red.nombre} (enlace provisional, nueva pestaña)`, `Open ${red.nombre} (placeholder link, new tab)`) }, copy('Abrir ', 'Open '), red.nombre, ' ↗')));
  });
  poner(root, el('article', { class: 'comunidad pagina-social' },
    el('header', { class: 'comunidad-hero' },
      el('span', { class: 'comunidad-etiqueta' }, copy('La comunidad Paglot', 'The Paglot community')),
      el('h1', {}, copy('Nos vemos entre lecciones', 'See you between lessons')),
      el('p', {}, copy('Elige tu rincón. Toca las escenas y conoce a nuestras tutoras.', 'Pick your corner. Tap the scenes and meet our tutors.'))),
    el('div', { class: 'social-mosaico' }, tarjetas),
    el('p', { class: 'comunidad-nota' }, copy('Enlaces de demostración: los perfiles oficiales llegarán pronto.', 'Demo links: official profiles coming soon.'))));
  return () => { viva = false; apagar.forEach(parar => parar()); };
}
