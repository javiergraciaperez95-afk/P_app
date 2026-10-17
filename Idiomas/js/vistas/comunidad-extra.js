// Guías de convivencia, preguntas frecuentes y laboratorio de ideas de Paglot.
import { el, poner } from '../dom.js';
import { copiarUI as copy } from '../i18n.js';
import { sonar } from '../sonidos.js';

const CLAVE_IDEAS = 'paglot-laboratorio-ideas-v1';
const CLAVE_VOTOS = 'paglot-laboratorio-votos-v1';

function cabecera(etiqueta, titulo, texto) {
  return el('header', { class: 'comunidad-extra-hero' },
    el('span', { class: 'comunidad-etiqueta' }, etiqueta),
    el('h1', {}, titulo),
    el('p', {}, texto));
}

export function pintarGuias(root) {
  const guias = [
    [copy('Respeto antes que todo', 'Respect comes first'), copy('Trata a las demás personas con amabilidad. Puedes discrepar y corregir con cuidado; las burlas y los ataques no ayudan a aprender.', 'Treat people with kindness. You can disagree and offer gentle corrections; mockery and personal attacks do not help anyone learn.')],
    [copy('Cuida los datos personales', 'Protect personal information'), copy('No publiques teléfonos, direcciones, contraseñas ni datos privados tuyos o de otra persona.', 'Do not share phone numbers, addresses, passwords or private details about yourself or someone else.')],
    [copy('Comparte con contexto', 'Share with context'), copy('Si propones una corrección o una idea, explica qué te ayudaría y por qué. Así podremos entender mejor cada necesidad.', 'When suggesting a correction or idea, explain what would help you and why. That gives us a clearer picture of each need.')],
    [copy('Haz sitio a distintas formas de aprender', 'Make room for different ways to learn'), copy('Cada persona aprende a su ritmo. Evita presionar, comparar avances o dar por hecho que una única forma funciona para todos.', 'Everyone learns at their own pace. Avoid pressuring people, comparing progress or assuming one approach works for everyone.')],
    [copy('Ayuda a mantener un espacio útil', 'Help keep the space useful'), copy('Evita el spam, la publicidad no solicitada y el contenido que no tenga relación con el aprendizaje o Paglot.', 'Please avoid spam, unsolicited advertising and content unrelated to learning or Paglot.')],
  ];
  poner(root, el('article', { class: 'comunidad-extra comunidad-guias' },
    cabecera(copy('Un espacio amable para aprender', 'A kind place to learn'), copy('Guías comunitarias', 'Community guidelines'), copy('Unas pautas sencillas para que las ideas y las conversaciones ayuden a todo el mundo.', 'A few simple guidelines to make ideas and conversations helpful for everyone.')),
    el('div', { class: 'guias-lista' }, guias.map(([titulo, texto], i) => el('section', { class: `guia-tarjeta caja guia-${i + 1}` },
      el('span', { class: 'guia-numero', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
      el('div', {}, el('h2', {}, titulo), el('p', {}, texto))))),
    el('p', { class: 'extra-nota' }, copy('Estas pautas describen cómo queremos cuidar Paglot y sus espacios comunitarios.', 'These guidelines reflect how we want to care for Paglot and its community spaces.'))));
}

export function pintarFaq(root) {
  const preguntas = [
    [copy('¿Paglot es gratis?', 'Is Paglot free?'), copy('Sí. Puedes empezar a aprender gratis. Paglot Max reúne opciones ampliadas y ayuda a sostener la creación de nuevas lecciones.', 'Yes. You can start learning for free. Paglot Max offers expanded options and helps support the creation of new lessons.')],
    [copy('¿Qué idiomas puedo estudiar?', 'Which languages can I study?'), copy('El selector de idiomas muestra los cursos disponibles. Algunos idiomas todavía están en preparación y se indicarán como próximos.', 'The language selector shows available courses. Languages still in preparation are marked as coming soon.')],
    [copy('¿Tengo que avanzar rápido?', 'Do I need to move quickly?'), copy('No. Las lecciones están pensadas para avanzar a tu ritmo, repetir y volver cuando quieras.', 'No. Lessons are designed for you to move at your own pace, practise again and return whenever you like.')],
    [copy('¿Puedo usar Paglot sin crear una cuenta?', 'Can I use Paglot without an account?'), copy('Sí. Puedes entrar sin cuenta. Si inicias sesión, algunas funciones pueden guardar tu progreso asociado a tu cuenta.', 'Yes. You can continue without an account. If you sign in, some features can save progress to your account.')],
    [copy('¿Puedo contratar Paglot Max ahora?', 'Can I subscribe to Paglot Max now?'), copy('La página de Paglot Max muestra los planes previstos. El pago todavía no está habilitado, así que ahora mismo no se realiza ningún cobro.', 'The Paglot Max page shows the planned options. Payments are not enabled yet, so no charge can be made right now.')],
    [copy('¿Cómo comparto una idea para Paglot?', 'How can I share an idea for Paglot?'), copy('Entra en el Laboratorio para proponer una mejora y apoyar las propuestas que te interesen. En este prototipo, las ideas y los votos se guardan solo en tu navegador.', 'Visit the Lab to suggest an improvement and support ideas you like. In this prototype, ideas and votes are saved only in your browser.')],
    [copy('¿Dónde pido ayuda?', 'Where can I get help?'), copy('Visita Contacto y cuéntanos qué necesitas. El formulario está preparado visualmente; el envío por correo aún no está conectado.', 'Visit Contact and tell us what you need. The form is ready to use visually; email delivery is not connected yet.')],
  ];
  poner(root, el('article', { class: 'comunidad-extra comunidad-faq' },
    cabecera(copy('PAGLOT / PREGUNTAS FRECUENTES', 'PAGLOT / FAQ'), copy('Respuestas claras, sin rodeos', 'Clear answers, no guesswork'), copy('Lo esencial para empezar y saber qué puedes hacer ahora mismo.', 'The essentials to get started and know what you can do right now.')),
    el('div', { class: 'faq-lista' }, preguntas.map(([pregunta, respuesta], i) => el('details', { class: 'faq-item caja', ...(i === 0 ? { open: true } : {}) },
      el('summary', {}, el('span', { class: 'faq-spark', 'aria-hidden': 'true' }, '✦'), pregunta, el('span', { class: 'faq-mas', 'aria-hidden': 'true' }, '+')),
      el('p', {}, respuesta)))),
    el('a', { class: 'boton boton-mini faq-contacto', href: '#/contacto', onclick: () => sonar('pagina') }, copy('¿Te queda alguna duda? Contacta con Paglot', 'Still have a question? Contact Paglot'), ' →')));
}

function leerIdeas() {
  try {
    const valor = JSON.parse(localStorage.getItem(CLAVE_IDEAS) ?? '[]');
    return Array.isArray(valor) ? valor.filter(i => i && typeof i.id === 'string' && typeof i.texto === 'string' && Number.isFinite(i.votos)) : [];
  } catch { return []; }
}

function leerVotos() {
  try { const valor = JSON.parse(localStorage.getItem(CLAVE_VOTOS) ?? '[]'); return new Set(Array.isArray(valor) ? valor : []); }
  catch { return new Set(); }
}

export function pintarLaboratorio(root) {
  let ideas = leerIdeas();
  const votos = leerVotos();
  const lista = el('div', { class: 'lab-lista', 'aria-live': 'polite' });
  const estado = el('p', { class: 'lab-estado', role: 'status', 'aria-live': 'polite' });
  const total = el('span', { class: 'lab-total' });

  function guardar() {
    try {
      localStorage.setItem(CLAVE_IDEAS, JSON.stringify(ideas));
      localStorage.setItem(CLAVE_VOTOS, JSON.stringify([...votos]));
      return true;
    } catch { return false; }
  }

  function pintarIdeas() {
    const ordenadas = [...ideas].sort((a, b) => b.votos - a.votos || a.creada - b.creada);
    total.textContent = copy(`${ideas.length} ${ideas.length === 1 ? 'idea' : 'ideas'}`, `${ideas.length} ${ideas.length === 1 ? 'idea' : 'ideas'}`);
    poner(lista, ordenadas.length ? ordenadas.map(idea => {
      const votada = votos.has(idea.id);
      const boton = el('button', { type: 'button', class: 'lab-votar', 'aria-pressed': String(votada), 'aria-label': copy(`${votada ? 'Retirar voto' : 'Votar por'}: ${idea.texto}. ${idea.votos} votos`, `${votada ? 'Remove vote for' : 'Vote for'}: ${idea.texto}. ${idea.votos} votes`), onclick: () => {
        if (votada) { votos.delete(idea.id); idea.votos = Math.max(0, idea.votos - 1); }
        else { votos.add(idea.id); idea.votos += 1; }
        const ok = guardar(); pintarIdeas(); sonar('clic');
        estado.textContent = ok ? copy('Voto actualizado en este navegador.', 'Vote updated in this browser.') : copy('No se pudo guardar el voto en este dispositivo.', 'The vote could not be saved on this device.');
      } }, el('span', { class: 'lab-voto-numero' }, String(idea.votos)), el('span', { class: 'lab-voto-etiqueta' }, votada ? copy('Apoyada', 'Supported') : copy('Votar', 'Vote')));
      return el('article', { class: 'lab-idea caja' }, boton, el('div', { class: 'lab-idea-texto' }, el('p', {}, idea.texto), el('small', {}, idea.autora || copy('Comunidad Paglot', 'Paglot community'))));
    }) : el('div', { class: 'lab-vacio caja' }, el('span', { 'aria-hidden': 'true' }, '✦'), el('p', {}, copy('Todavía no hay propuestas. ¿Cuál sería la primera?', 'There are no ideas yet. What should the first one be?'))));
  }

  const entrada = el('textarea', { name: 'idea', rows: 3, maxlength: 180, required: true, placeholder: copy('Ej.: Me ayudaría tener una práctica de escucha de 2 minutos…', 'E.g. A two-minute listening practice would help me…'), 'aria-label': copy('Tu idea para Paglot', 'Your idea for Paglot') });
  const autora = el('input', { name: 'autora', maxlength: 32, placeholder: copy('Nombre (opcional)', 'Name (optional)'), 'aria-label': copy('Nombre opcional', 'Optional name') });
  const formulario = el('form', { class: 'lab-form caja', onsubmit: event => {
    event.preventDefault();
    const texto = entrada.value.trim();
    if (!texto) { entrada.focus(); return; }
    ideas.push({ id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, texto, autora: autora.value.trim(), votos: 0, creada: Date.now() });
    const ok = guardar(); entrada.value = ''; autora.value = ''; pintarIdeas();
    estado.textContent = ok ? copy('¡Idea añadida! Ya puedes votar por las propuestas.', 'Idea added! You can now vote for proposals.') : copy('La idea se añadió a la lista, pero el navegador no pudo guardarla.', 'The idea was added, but the browser could not save it.');
    sonar('clic');
  } },
    el('label', {}, copy('¿Qué te gustaría ver en Paglot?', 'What would you like to see in Paglot?'), entrada),
    el('div', { class: 'lab-form-pie' }, autora, el('button', { class: 'boton boton-principal', type: 'submit' }, copy('Proponer idea', 'Suggest an idea'), ' +')));

  poner(root, el('article', { class: 'comunidad-extra comunidad-lab' },
    cabecera(copy('PAGLOT / LABORATORIO', 'PAGLOT / LAB'), copy('Las próximas ideas pueden venir de ti', 'The next idea could come from you'), copy('Propón una mejora, apoya las que te importan y ayúdanos a decidir qué construir.', 'Suggest an improvement, support the ideas that matter to you and help us decide what to build.')),
    el('section', { class: 'lab-panel', 'aria-labelledby': 'lab-proponer' },
      el('div', { class: 'lab-form-titulo' }, el('span', { class: 'lab-bombilla', 'aria-hidden': 'true' }, '✦'), el('div', {}, el('h2', { id: 'lab-proponer' }, copy('Pon tu idea sobre la mesa', 'Put your idea on the table')), el('p', {}, copy('Una propuesta concreta nos ayuda a entenderte mejor.', 'A clear suggestion helps us understand what you need.')))), formulario),
    el('section', { class: 'lab-votacion', 'aria-labelledby': 'lab-ideas' },
      el('header', { class: 'lab-lista-cabecera' }, el('div', {}, el('span', { class: 'comunidad-etiqueta' }, copy('EL TABLERO', 'THE BOARD')), el('h2', { id: 'lab-ideas' }, copy('Ideas de la comunidad', 'Community ideas'))), total),
      el('p', { class: 'lab-prototipo' }, copy('Prototipo: las propuestas y los votos se guardan en este navegador. La votación compartida estará disponible al conectar el backend.', 'Prototype: suggestions and votes are stored in this browser. Shared voting will be available once a backend is connected.')),
      estado, lista)));
  pintarIdeas();
}
