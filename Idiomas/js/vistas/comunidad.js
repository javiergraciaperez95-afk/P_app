// Vistas informativas: redes, contacto, productos y tienda. El envío y las compras
// quedan preparados visualmente; todavía requieren servicios de backend.
import { el, poner } from '../dom.js';
import { copiarUI as copy } from '../i18n.js';
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
    el('label', {}, copy('Usuario de Paglot', 'Paglot username'), el('input', { name: 'usuario', autocomplete: 'username', required: true, maxlength: 60 })),
    el('label', {}, copy('Correo registrado en Paglot', 'Email registered with Paglot'), el('input', { name: 'correo', type: 'email', autocomplete: 'email', required: true, maxlength: 254 })),
    el('label', {}, copy('Asunto', 'Subject'), el('select', { name: 'asunto', required: true },
      el('option', { value: '', selected: true, disabled: true }, copy('Elige un asunto', 'Choose a subject')),
      ...[
        ['general', copy('Consulta general', 'General question')], ['tecnico', copy('Problema técnico', 'Technical issue')],
        ['lecciones', copy('Lecciones y contenido', 'Lessons and content')], ['pagos', copy('Pagos, P-max o suscripción', 'Payments, P-max or subscription')],
        ['escuelas', copy('Paglot Escuelas o Empresas', 'Paglot Schools or Business')], ['idea', copy('Sugerencia', 'Suggestion')], ['privacidad', copy('Privacidad y cuenta', 'Privacy and account')],
      ].map(([value, label]) => el('option', { value }, label)))),
    el('label', {}, copy('Mensaje', 'Message'), el('textarea', { name: 'mensaje', rows: 6, required: true, maxlength: 4000 })),
    el('label', { class: 'contacto-captcha' }, copy(`Comprobación rápida: ¿cuánto es ${a} + ${b}?`, `Quick check: what is ${a} + ${b}?`), el('input', { name: 'captcha', type: 'number', inputmode: 'numeric', required: true, 'aria-label': copy('Respuesta del captcha', 'Captcha answer') })),
    el('p', { class: 'comunidad-nota' }, copy('Esta comprobación ayuda a evitar envíos automáticos. El formulario todavía no envía correos: conectaremos el servicio más adelante.', 'This check helps prevent automated submissions. The form does not send emails yet; we will connect the service later.')),
    el('button', { type: 'submit', class: 'boton boton-principal' }, copy('Enviar', 'Send')),
    estado);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (Number(new FormData(form).get('captcha')) !== a + b) {
      estado.textContent = copy('La respuesta de la comprobación no es correcta. Inténtalo de nuevo.', 'That answer is not correct. Please try again.');
      form.elements.captcha.focus(); return;
    }
    estado.textContent = copy('Formulario validado. El envío por correo estará disponible cuando conectemos el backend.', 'Form validated. Email delivery will be available once the backend is connected.');
    sonar('clic');
  });
  poner(root, el('article', { class: 'comunidad pagina-contacto' },
    cabecera(copy('Estamos aquí para ayudarte', 'We are here to help'), copy('Cuéntanos qué necesitas y te responderemos en cuanto podamos.', 'Tell us what you need and we will get back to you as soon as we can.'), copy('Contacto', 'Contact')),
    form));
}

export function pintarProducto(root) {
  const productos = [
    ['01', 'Paglot Schools', copy('Cursos personalizados y colaboración con centros educativos. Desde 20 alumnos, suscripciones Paglot Max a mitad de precio.', 'Custom courses and collaboration with schools. From 20 students, Paglot Max subscriptions at half price.'), copy('Para docentes y centros', 'For teachers and schools'), '#/escuelas'],
    ['02', copy('Paglot Empresas', 'Paglot Business'), copy('Cursos adaptados al contexto del equipo y ofertas de grupo desde 20 personas.', 'Courses adapted to your team’s work and group offers from 20 people.'), copy('Para equipos', 'For teams'), '#/empresas'],
    ['03', 'Paglot Max', copy('La experiencia completa de Paglot: acceso ampliado a lecciones, práctica y herramientas de estudio, con opciones pensadas para diferentes formas de aprender.', 'The full Paglot experience: expanded access to lessons, practice and study tools, with options designed for different ways of learning.'), copy('Más espacio para aprender', 'More room to learn'), '#/precios'],
    ['04', copy('Regala Paglot Max', 'Gift Paglot Max'), copy('Regala un código por un mes o un año premium. Quien lo recibe decide cuándo canjearlo.', 'Give a code for one month or one year of premium. The recipient decides when to redeem it.'), copy('Un regalo que acompaña', 'A gift that keeps on giving'), '#/regala-max'],
  ];
  poner(root, el('article', { class: 'comunidad pagina-producto' },
    cabecera(copy('Una forma de aprender para cada camino', 'A way to learn for every journey'), copy('Descubre las opciones de Paglot para estudiantes, centros, equipos y quienes quieren regalar aprendizaje.', 'Explore Paglot for learners, schools, teams and anyone who wants to give the gift of learning.'), copy('Producto', 'Product')),
    el('div', { class: 'producto-lista' }, productos.map(([numero, titulo, texto, pie, href]) => el('section', { class: 'producto-fila caja' },
      el('span', { class: 'producto-numero', 'aria-hidden': 'true' }, numero),
      el('div', {}, el('span', { class: 'comunidad-pie' }, pie), el('h2', {}, titulo), el('p', {}, texto)),
      el('a', { class: 'boton boton-mini', href, onclick: () => sonar('pagina') }, copy('Saber más', 'Learn more')))))));
}

