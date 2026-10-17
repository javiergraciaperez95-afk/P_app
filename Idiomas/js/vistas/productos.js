import { el, poner } from '../dom.js';
import { copiarUI as copy } from '../i18n.js';
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
    const boton = el('button', { class: 'producto-anfitriona', type: 'button', 'aria-label': copy('Saluda a la tutora', 'Say hello to the tutor') }, canvas);
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
  return { copy, personaje, cerrar: () => { viva = false; apagar.forEach(f => f()); } };
}

const contacto = texto => el('a', { class: 'boton boton-principal', href: '#/contacto', onclick: () => sonar('pagina') }, texto, ' ↗');
const encabezado = (etiqueta, titulo, texto) => el('header', { class: 'producto-presentacion' },
  el('span', { class: 'comunidad-etiqueta' }, etiqueta), el('h1', {}, titulo), el('p', {}, texto));

export function pintarEscuelas(root) {
  const { copy, personaje, cerrar } = preparar('es');
  const pizarra = el('p', { class: 'escuelas-pizarra-frase', role: 'status' }, copy('Cada aula es un mundo.', 'Every classroom is a world.'));
  const pasos = [
    [copy('Os escuchamos', 'We listen'), copy('Idiomas, edades, nivel y objetivos: el punto de partida lo pone vuestro centro.', 'Languages, ages, levels and goals: your school sets the starting point.')],
    [copy('Creamos a medida', 'We create together'), copy('Preparamos cursos personalizados y contenidos que encajen con vuestro alumnado.', 'We prepare custom courses and content to suit your students.')],
    [copy('Colaboramos', 'We collaborate'), copy('Queremos trabajar con docentes y escuelas, escuchar sus propuestas y dar forma al proyecto juntos.', 'We want to work with teachers and schools, hear their ideas and shape the project together.')],
  ];
  poner(root, el('article', { class: 'producto-detalle producto-escuelas' },
    el('div', { class: 'escuelas-hero' },
      encabezado('Paglot Schools', copy('Un idioma que empieza en tu aula', 'A language journey that starts in your classroom'), copy('Cursos personalizados para escuelas, creados en colaboración con quienes mejor conocen a sus alumnos: sus docentes.', 'Custom courses for schools, created with the people who know their students best: their teachers.')),
      el('div', { class: 'escuelas-escena' },
        el('div', { class: 'escuelas-pizarra' }, el('span', { 'aria-hidden': 'true' }, 'A → あ → Hola'), pizarra, el('span', { class: 'escuelas-tiza', 'aria-hidden': 'true' })),
        personaje(() => { pizarra.textContent = copy('¡Construyamos vuestro curso juntos!', 'Let’s build your course together!'); }))),
    el('ol', { class: 'escuelas-pasos' }, pasos.map(([titulo, texto], i) => el('li', {}, el('span', { class: 'escuelas-numero', 'aria-hidden': 'true' }, `0${i + 1}`), el('h2', {}, titulo), el('p', {}, texto)))),
    el('section', { class: 'escuelas-oferta' },
      el('div', { class: 'escuelas-sello' }, el('strong', {}, '−50%'), el('span', {}, copy('desde 20 alumnos', 'from 20 students'))),
      el('div', {}, el('h2', {}, copy('Un regalo para toda la clase', 'A gift for the whole class')),
        el('p', {}, copy('¿Queréis regalar Paglot Max a vuestro alumnado? A partir de 20 alumnos, las suscripciones salen a mitad de precio respecto a la suscripción individual equivalente.', 'Want to give your students Paglot Max? From 20 students, subscriptions are half the price of the equivalent individual subscription.')),
        el('p', {}, copy('Podéis hablar con nosotros tanto para una compra de grupo como para estudiar un curso personalizado para vuestro centro.', 'Contact us about a group purchase or to discuss a custom course for your school.')),
        contacto(copy('Hablemos de vuestra escuela', 'Tell us about your school'))))));
  return cerrar;
}

export function pintarEmpresas(root) {
  const { copy, personaje, cerrar } = preparar('en');
  const mensaje = el('p', { class: 'empresas-mensaje', role: 'status' }, copy('¡Hola, equipo!', 'Hello, team!'));
  const objetivos = [
    [copy('Vuestro sector', 'Your sector'), copy('Contenidos y vocabulario ligados al contexto de vuestro equipo.', 'Content and vocabulary related to your team’s work.')],
    [copy('Vuestros objetivos', 'Your goals'), copy('Reuniones, atención al cliente o comunicación internacional: acordamos el enfoque con vosotros.', 'Meetings, customer service or international communication: we agree the focus together.')],
    [copy('Vuestro ritmo', 'Your pace'), copy('Lecciones breves para encajar la práctica en la jornada y avanzar con constancia.', 'Short lessons to fit practice into the working day and build a steady habit.')],
  ];
  poner(root, el('article', { class: 'producto-detalle producto-empresas' },
    el('div', { class: 'empresas-hero' },
      encabezado(copy('Paglot Empresas', 'Paglot Business'), copy('Que el idioma abra la siguiente puerta', 'Let language open the next door'), copy('Formación lingüística para equipos, con cursos personalizados y una propuesta construida junto a vuestra empresa.', 'Language learning for teams, with custom courses and an offer built together with your business.')),
      el('div', { class: 'empresas-oficina' },
        el('div', { class: 'empresas-monitor' }, el('span', { 'aria-hidden': 'true' }, copy('PAGLOT / EQUIPO', 'PAGLOT / TEAM')), mensaje, el('i', { 'aria-hidden': 'true' })),
        el('span', { class: 'empresas-escritorio', 'aria-hidden': 'true' }),
        personaje(() => { mensaje.textContent = copy('Un equipo, muchas posibilidades.', 'One team, many possibilities.'); }))),
    el('section', { class: 'empresas-objetivos' }, el('h2', {}, copy('Un plan con sentido para vuestro equipo', 'A plan that makes sense for your team')),
      el('div', { class: 'empresas-columnas' }, objetivos.map(([titulo, texto], i) => el('div', {}, el('span', { class: 'empresas-indice' }, `0${i + 1}`), el('h3', {}, titulo), el('p', {}, texto))))),
    el('section', { class: 'empresas-acuerdo' },
      el('div', {}, el('span', { class: 'comunidad-etiqueta' }, copy('Aprender en equipo', 'Learn as a team')),
        el('h2', {}, copy('20 personas. La mitad de precio.', '20 people. Half the price.')),
        el('p', {}, copy('Desde 20 personas, ofrecemos suscripciones Paglot Max al 50 % del precio de la suscripción individual equivalente. Una forma de regalar formación al equipo o acompañar un plan de idiomas.', 'From 20 people, we offer Paglot Max subscriptions at 50% of the equivalent individual subscription price. Give your team learning opportunities or support a language training plan.'))),
      el('div', { class: 'empresas-contacto' }, el('p', {}, copy('Contadnos cuántas personas sois, qué idiomas necesitáis y qué os gustaría conseguir. Hablemos también de colaboraciones y cursos a medida.', 'Tell us your team size, the languages you need and what you want to achieve. We can also discuss collaborations and custom courses.')), contacto(copy('Preparar una propuesta', 'Discuss a proposal'))))));
  return cerrar;
}

export function pintarRegalo(root) {
  const { copy, personaje, cerrar } = preparar('fr');
  let duracion = 'mes';
  const periodo = el('strong', { class: 'regalo-periodo' });
  const resumen = el('p', { class: 'regalo-resumen', role: 'status', 'aria-live': 'polite' });
  const botones = ['mes', 'ano'].map(clave => el('button', {
    class: 'boton', type: 'button', 'aria-pressed': String(clave === duracion),
    onclick: () => { duracion = clave; actualizar(); sonar('clic'); },
  }, clave === 'mes' ? copy('Un mes', 'One month') : copy('Un año', 'One year')));
  function actualizar() {
    periodo.textContent = duracion === 'mes' ? copy('1 mes de Paglot Max', '1 month of Paglot Max') : copy('1 año de Paglot Max', '1 year of Paglot Max');
    resumen.textContent = duracion === 'mes' ? copy('Un mes premium que comienza al canjear el código.', 'One premium month, starting when the code is redeemed.') : copy('Un año premium que comienza al canjear el código.', 'One premium year, starting when the code is redeemed.');
    botones.forEach((boton, i) => boton.setAttribute('aria-pressed', String(['mes', 'ano'][i] === duracion)));
  }
  const nota = el('p', { class: 'regalo-saludo', role: 'status' }, copy('Un regalo. Mil conversaciones por descubrir.', 'One gift. A thousand conversations to discover.'));
  const pasos = [
    [copy('Elige y paga', 'Choose and pay'), copy('Selecciona un mes o un año de Paglot Max y compra el regalo.', 'Choose one month or one year of Paglot Max and purchase your gift.')],
    [copy('Recibe tu código', 'Receive your code'), copy('Tras el pago recibirás un código para compartir con la persona que tú elijas.', 'After payment, you receive a code to share with the person you choose.')],
    [copy('Que lo estrene cuando quiera', 'Let them start when they want'), copy('Quien lo recibe canjea el código en su cuenta cuando quiera. El periodo premium empieza en ese momento, no al comprarlo.', 'The recipient redeems the code on their account whenever they want. Their premium period starts then, rather than at purchase.')],
  ];
  poner(root, el('article', { class: 'producto-detalle producto-regalo' },
    encabezado(copy('Regala Paglot Max', 'Gift Paglot Max'), copy('Regala su próxima conversación', 'Give them their next conversation'), copy('Un mes o un año para descubrir idiomas, con la libertad de empezar cuando apetezca.', 'One month or one year to discover languages, with the freedom to start when the time feels right.')),
    el('div', { class: 'regalo-hero' },
      el('div', { class: 'regalo-escena' },
        el('div', { class: 'regalo-tarjeta' }, el('span', { class: 'regalo-cinta', 'aria-hidden': 'true' }, '✦'), el('span', { class: 'regalo-marca' }, 'Paglot Max'), periodo, el('span', { class: 'regalo-codigo' }, copy('Tu código, después de la compra', 'Your code, after purchase'))),
        personaje(() => { nota.textContent = copy('¡Hay un nuevo idioma dentro de este regalo!', 'There is a new language inside this gift!'); })),
      el('section', { class: 'regalo-eleccion' }, el('h2', {}, copy('¿Cuánto aprendizaje quieres regalar?', 'How much learning would you like to give?')),
        el('div', { class: 'regalo-duracion', role: 'group', 'aria-label': copy('Duración del regalo', 'Gift duration') }, botones), resumen,
        el('p', {}, copy('El código es el regalo. Tú lo compartes; la otra persona decide cuándo activar su acceso premium.', 'The code is the gift. You share it; the recipient decides when to activate premium access.')),
        el('button', { class: 'boton boton-principal', type: 'button', disabled: true }, copy('Compra disponible próximamente', 'Purchasing coming soon')), nota)),
    el('ol', { class: 'regalo-pasos' }, pasos.map(([titulo, texto], i) => el('li', {}, el('span', { 'aria-hidden': 'true' }, `0${i + 1}`), el('h2', {}, titulo), el('p', {}, texto))))));
  actualizar();
  return cerrar;
}
