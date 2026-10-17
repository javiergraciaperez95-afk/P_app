// Pantalla «Contacto» (#/contacto): escríbenos una carta. Un escritorio junto a la ventana; por la ventana se ve
// la calle, con el buzón rojo de Paglot y la tutora cartera esperando. El formulario es la carta: los asuntos son
// sellos, la comprobación es un matasellos y, al enviar, la carta se dobla en un sobre que sale volando hacia el
// buzón. La tutora del escritorio va leyendo lo que escribes. Todavía no se envían correos (lo dice la nota).
// Colores en css/contacto.css; las tutoras, con js/vistas/elenco.js.

import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { sol, luna, dibujoPixel, conContorno } from './inicio-decorado.js';
import { crearElenco, lienzo } from './elenco.js';

// ---------------------------------------------------------------------------
// Dibujos (prefijo «ct»): k contorno · r/R rojo · o/O oro · p papel · g/G gris · a/A azul · v verde · m/M madera
// ---------------------------------------------------------------------------

const BUZON = (() => {
  const { R, filas } = lienzo(22, 44);
  R(4, 0, 14, 1, 'r'); R(2, 1, 18, 1, 'r'); R(1, 2, 20, 2, 'r'); R(0, 4, 22, 22, 'r');
  R(18, 2, 4, 24, 'R'); R(1, 4, 2, 20, 'u');
  R(0, 4, 22, 2, 'R');
  R(4, 9, 14, 2, 'k'); R(4, 11, 14, 1, 'R');
  R(6, 14, 10, 7, 'o'); R(7, 16, 8, 1, 'O'); R(7, 18, 5, 1, 'O');
  R(0, 26, 22, 2, 'R');
  R(9, 28, 4, 13, 'g'); R(9, 28, 1, 13, 'G');
  R(5, 41, 12, 3, 'g');
  return conContorno(filas());
})();

// las casitas de enfrente, que se ven por la ventana
const CASAS = (() => {
  const W = 120;
  const { R, filas } = lienzo(W, 40);
  const casa = (x, ancho, alto, pared, tejado) => {
    const y = 40 - alto;
    for (let i = 0; i < 6; i++) R(x - 1 + i, y - 6 + i, ancho + 2 - i * 2, 1, tejado);
    R(x, y, ancho, alto, pared);
    for (let vx = x + 3; vx < x + ancho - 4; vx += 7) { R(vx, y + 4, 4, 5, 'w'); R(vx, y + 14, 4, 5, 'w'); }
  };
  casa(2, 26, 30, 'h', 'r');
  casa(32, 22, 24, 'H', 'R');
  casa(58, 30, 34, 'h', 'R');
  casa(92, 26, 26, 'H', 'r');
  return conContorno(filas());
})();

/** Los iconos de los sellos de los asuntos (12×12). */
const ICONOS = {
  general: ['..pppppppp..', '.pppppppppp.', 'ppppakkappp.', 'pppapppkppp.', 'ppppppkappp.', 'pppppkappppp', 'pppppkpppppp', '.pppppppppp.', '..ppppkpppp.', '....pp......', '...pp.......', '..p.........'],
  tecnico: ['........gg..', '.......g..g.', '.......g..g.', '......gg.g..', '.....ggggg..', '....ggg.....', '...ggg......', '..ggg.......', '.ggg........', 'ggg.........', 'gg..........', '............'],
  lecciones: ['............', '.rrrrr.aaaaa', '.rpppr.apppa', '.rpgpr.apgpa', '.rpppr.apppa', '.rpgpr.apgpa', '.rpppr.apppa', '.rpppr.apppa', '.rrrrrraaaaa', '......k.....', '............', '............'],
  pagos: ['...oooooo...', '..oOOOOOOo..', '.oOooooooOo.', '.oOoOOOooOo.', '.oOoOooooOo.', '.oOooOOooOo.', '.oOooooOoOo.', '.oOoOOOooOo.', '.oOooooooOo.', '..oOOOOOOo..', '...oooooo...', '............'],
  escuelas: ['.....r......', '.....rr.....', '.....k......', '....ggg.....', '...ggggg....', '..ggggggg...', '.ppppppppp..', '.paapapaap..', '.ppppppppp..', '.paapmmaap..', '.ppppmmppp..', 'vvvvvvvvvvvv'],
  idea: ['....oooo....', '...oyyyyo...', '..oyyyyyyo..', '..oyyyyyyo..', '..oyyyyyyo..', '...oyyyyo...', '....oyyo....', '....gggg....', '....GGGG....', '....gggg....', '.....gg.....', '............'],
  privacidad: ['...gggggg...', '..g......g..', '..g......g..', '..g......g..', '.oooooooooo.', '.oOOOOOOOOo.', '.oOOOkkOOOo.', '.oOOOkkOOOo.', '.oOOOOkOOOo.', '.oOOOOOOOOo.', '.oooooooooo.', '............'],
};

const ASUNTOS = [
  ['general', 'comunidad.generalQuestion', 'r'],
  ['tecnico', 'comunidad.technicalIssue', 'a'],
  ['lecciones', 'comunidad.lessonsAndContent', 'v'],
  ['pagos', 'comunidad.paymentsPMaxOrSubscription', 'o'],
  ['escuelas', 'comunidad.paglotSchoolsOrBusiness', 'a'],
  ['idea', 'comunidad.suggestion', 'v'],
  ['privacidad', 'comunidad.privacyAndAccount', 'r'],
];

export function pintarContacto(root) {
  const elenco = crearElenco();
  const { quieto, despues } = elenco;
  const dibujo = (rejilla, clase) => dibujoPixel(rejilla, clase, 'ct');
  const n = () => Math.floor(Math.random() * 7) + 2;
  let a = n();
  let b = n();

  const escritora = elenco.tutora(elenco.protagonista(), 'ct-escritora');
  const cartera = elenco.tutora(elenco.otra(), 'ct-cartera');
  cartera.alTocar = () => { cartera.gesto('saludar'); cartera.decir(t('contacto.cartera'), 2800); };
  escritora.alTocar = () => { escritora.gesto('escribir'); escritora.decir(t('contacto.hola'), 3200); };

  // ----- La carta -----
  let contador = 0;
  function linea(texto, atributos) {
    const id = `contacto-${++contador}`;
    const entrada = el('input', { id, ...atributos });
    return { entrada, nodo: el('div', { class: 'ct-linea' }, el('label', { for: id }, texto), entrada) };
  }
  const usuario = linea(t('comunidad.paglotUsername'), { name: 'usuario', autocomplete: 'username', required: true, maxlength: 60 });
  const correo = linea(t('comunidad.emailRegisteredWithPaglot'), { name: 'correo', type: 'email', autocomplete: 'email', inputmode: 'email', required: true, maxlength: 254 });
  const sellos = ASUNTOS.map(([valor, clave, color], i) => {
    const id = `contacto-asunto-${valor}`;
    return el('div', { class: `ct-sello ct-sello-${color}` },
      el('input', { type: 'radio', name: 'asunto', id, value: valor, required: i === 0, class: 'solo-lector' }),
      el('label', { for: id }, dibujo(conContorno(ICONOS[valor]), 'ct-sello-icono'), el('span', {}, t(clave))));
  });
  const mensaje = el('textarea', { id: 'contacto-mensaje', name: 'mensaje', rows: 7, required: true, maxlength: 4000 });
  const pregunta = el('span', { class: 'ct-matasellos-cuenta', 'aria-hidden': 'true' });
  const captcha = el('input', { id: 'contacto-captcha', name: 'captcha', type: 'number', inputmode: 'numeric', required: true, 'aria-label': t('comunidad.captchaAnswer') });
  const etiquetaCaptcha = el('label', { for: 'contacto-captcha', class: 'ct-matasellos-texto' });
  const ponerCuenta = () => {
    pregunta.textContent = `${a} + ${b} =`;
    etiquetaCaptcha.textContent = t('comunidad.captcha', { a, b });
  };
  ponerCuenta();
  const estado = el('p', { class: 'ct-estado', role: 'status', 'aria-live': 'polite' });
  const enviar = el('button', { type: 'submit', class: 'es-boton ct-enviar' }, el('span', { class: 'ct-sobrecito', 'aria-hidden': 'true' }), t('comunidad.send'));
  const form = el('form', { class: 'ct-carta', novalidate: true },
    el('span', { class: 'ct-membrete', 'aria-hidden': 'true' }, 'Paglot'),
    el('header', { class: 'ct-cabecera' },
      el('span', { class: 'ct-etiqueta' }, t('comunidad.contact')),
      el('h1', {}, t('comunidad.weAreHereToHelp')),
      el('p', {}, t('comunidad.tellUsWhatYouNeed'))),
    el('p', { class: 'ct-saludo', 'aria-hidden': 'true' }, t('contacto.querido')),
    el('div', { class: 'ct-lineas' }, usuario.nodo, correo.nodo),
    el('fieldset', { class: 'ct-asuntos' },
      el('legend', {}, t('comunidad.subject'), el('span', { class: 'ct-pista' }, ` · ${t('comunidad.chooseASubject')}`)),
      el('div', { class: 'ct-sellos' }, sellos)),
    el('div', { class: 'ct-linea ct-linea-mensaje' }, el('label', { for: 'contacto-mensaje' }, t('comunidad.message')), mensaje),
    el('div', { class: 'ct-pie-carta' },
      el('div', { class: 'ct-matasellos' }, pregunta, captcha),
      el('div', { class: 'ct-pie-texto' },
        etiquetaCaptcha,
        el('p', { class: 'ct-nota' }, t('comunidad.thisCheckHelpsPreventAutomated')))),
    el('div', { class: 'ct-envio' }, enviar, estado));

  // la tutora del escritorio va «apuntando» lo que escribes
  let apuntando = 0;
  form.addEventListener('input', () => {
    if (Date.now() - apuntando < 2400) return;
    apuntando = Date.now();
    escritora.gesto('escribir');
  });
  form.addEventListener('change', e => {
    if (e.target.name !== 'asunto') return;
    sonar('guardar');
    escritora.gesto('asentir');
    e.target.closest('.ct-sello')?.classList.add('estampa');
    despues(500, () => e.target.closest('.ct-sello')?.classList.remove('estampa'));
  });

  // ----- El sobre que vuela al buzón -----
  const sobre = el('span', { class: 'ct-sobre', 'aria-hidden': 'true' }, el('i', {}));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fallo = (texto, campo) => {
      estado.className = 'ct-estado error';
      estado.textContent = texto;
      sonar('mal');
      escritora.gesto('negar');
      escritora.reaccionar('agobiada', 1200);
      campo?.focus();
    };
    const invalido = [usuario.entrada, correo.entrada].find(c => !c.checkValidity());
    if (invalido) { fallo(invalido.type === 'email' ? t('form.correoValido') : t('form.rellena'), invalido); return; }
    if (!form.querySelector('input[name="asunto"]:checked')) { fallo(t('comunidad.chooseASubject'), form.querySelector('input[name="asunto"]')); return; }
    if (!mensaje.value.trim()) { fallo(t('form.rellena'), mensaje); return; }
    if (Number(captcha.value) !== a + b) { fallo(t('comunidad.thatAnswerIsNotCorrect'), captcha); return; }
    // ¡al buzón!
    estado.className = 'ct-estado bien';
    estado.textContent = t('comunidad.formValidatedEmailDeliveryWill');
    sonar('paso');
    escritora.gesto('celebrar');
    escritora.decir(t('contacto.enviada'), 2600);
    if (!quieto) {
      escena.classList.remove('vuela');
      void escena.offsetWidth;
      escena.classList.add('vuela');
      despues(1500, () => { cartera.gesto('celebrar'); cartera.reaccionar('contenta', 1400); sonar('guardar'); });
      despues(3200, () => escena.classList.remove('vuela'));
    }
    form.reset();
    a = n(); b = n();
    ponerCuenta();
  });

  // ----- La escena -----
  const ventana = el('div', { class: 'ct-ventana' },
    el('div', { class: 'ct-calle', 'aria-hidden': 'true' },
      el('div', { class: 'inicio-cielo' }, sol(), luna()),
      dibujo(CASAS, 'ct-casas'),
      el('span', { class: 'ct-acera' }),
      dibujo(BUZON, 'ct-buzon')),
    cartera.figura,
    el('span', { class: 'ct-cortina ct-cortina-izq', 'aria-hidden': 'true' }),
    el('span', { class: 'ct-cortina ct-cortina-der', 'aria-hidden': 'true' }),
    el('span', { class: 'ct-alfeizar', 'aria-hidden': 'true' }));
  const escena = el('section', { class: 'ct-escena' },
    el('div', { class: 'ct-lado' }, ventana),
    el('div', { class: 'ct-sitio-carta' }, form, escritora.figura,
      el('span', { class: 'ct-tintero', 'aria-hidden': 'true' }, el('i', {}))),
    sobre,
    el('div', { class: 'ct-mesa', 'aria-hidden': 'true' }));

  poner(root, el('article', { class: 'correo-paglot escena-web' }, escena));
  // si se llega desde Escuelas o Empresas, su sello ya viene puesto
  try {
    const pedido = sessionStorage.getItem('paglot-contacto-asunto');
    sessionStorage.removeItem('paglot-contacto-asunto');
    const sello = pedido && form.querySelector(`#contacto-asunto-${pedido}`);
    if (sello) sello.checked = true;
  } catch { /* sin almacenamiento */ }
  elenco.vigilar(escena);
  despues(800, () => { escritora.gesto('saludar'); escritora.decir(t('contacto.hola'), 3600); });
  despues(2600, () => cartera.gesto('saludarI'));

  return () => elenco.apagar();
}
