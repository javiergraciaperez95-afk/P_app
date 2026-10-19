// Preguntas frecuentes (#/faq): el fichero de la biblioteca de Paglot. Delante de las estanterías, un fichero de
// madera con un cajón por tema; al abrir uno, sus fichas salen a la mesa. Cada ficha es una pregunta que se abre
// con su respuesta (y, si hace falta, un enlace a la página que lo explica). También se puede buscar en todo el fichero.
// La bibliotecaria (la tutora del curso) atiende el mostrador. Textos «faq.*»; colores en css/faq.css.

import { el, poner, alAzar } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { PRECIOS_VISIBLES } from '../config.js';
import { crearElenco } from './elenco.js';

// las preguntas, por cajones; enlace: [ruta, clave del texto del botón]
const CAJONES = [
  { id: 'empezar', preguntas: [[1], [2, '#/idiomas', 'cursos.titulo'], [3], [4]] },
  { id: 'planes', preguntas: [[5, '#/precios', 'precios.titulo'], [6], [7], [8, '#/legal', 'legal.titulo']] },
  { id: 'aprender', preguntas: [[9], [10], [11], [12]] },
  { id: 'cuenta', preguntas: [[13, '#/legal', 'legal.titulo'], [14, '#/perfil', 'menu.perfil']] },
  { id: 'grupos', preguntas: [[15, '#/escuelas', 'pagina.escuelas'], [16, '#/empresas', 'pagina.empresas'], [17, '#/laboratorio', 'pagina.laboratorio'], [18, '#/contacto', 'pagina.contacto']] },
];

const normalizar = texto => texto.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// respuestas con un descuento o una cifra de precio (la 15 dice «hasta el 70 %»): sin precios visibles, dicen que llegarán luego
const CON_PRECIO = new Set([15]);
const respuesta = n => (!PRECIOS_VISIBLES && CON_PRECIO.has(n) ? t('precio.nota') : t(`faq.a${n}`));

export function pintarFaq(root) {
  const elenco = crearElenco();
  const { despues } = elenco;
  let cajonAbierto = 'empezar';
  let busqueda = '';

  const bibliotecaria = elenco.tutora(elenco.protagonista(), 'fq-bibliotecaria');
  bibliotecaria.alTocar = () => { bibliotecaria.gesto('hojear'); bibliotecaria.decir(alAzar(t('faq.tutora.toca')), 2600); };

  // ----- Todas las fichas -----
  const fichas = CAJONES.flatMap(cajon => cajon.preguntas.map(([n, href, clave]) => {
    const ficha = el('details', { class: 'fq-ficha', 'data-cajon': cajon.id },
      el('summary', { 'data-sonido': 'papel' }, el('span', { class: 'fq-ficha-numero', 'aria-hidden': 'true' }, String(n).padStart(3, '0')), el('span', { class: 'fq-pregunta' }, t(`faq.q${n}`))),
      el('div', { class: 'fq-respuesta' },
        el('p', {}, respuesta(n)),
        href && el('a', { class: 'es-boton es-boton-papel', href, onclick: () => sonar('pagina') }, t(clave), ' →')));
    ficha.addEventListener('toggle', () => { if (ficha.open) bibliotecaria.gesto('asentir'); });
    return { ficha, cajon: cajon.id, texto: normalizar(`${t(`faq.q${n}`)} ${respuesta(n)}`) };
  }));

  const mesa = el('div', { class: 'fq-mesa', 'aria-live': 'polite' });
  const contador = el('p', { class: 'fq-contador' });
  function pintarFichas() {
    const termino = normalizar(busqueda.trim());
    const visibles = fichas.filter(f => (termino ? f.texto.includes(termino) : f.cajon === cajonAbierto));
    contador.textContent = t('faq.fichas', { n: visibles.length });
    poner(mesa, visibles.length ? visibles.map(f => f.ficha) : el('p', { class: 'fq-nada' }, t('faq.nada')));
    mesa.classList.remove('llegan');
    void mesa.offsetWidth;
    mesa.classList.add('llegan');
    return visibles.length;
  }

  // ----- El fichero: un cajón por tema -----
  const cajones = CAJONES.map(cajon => {
    const boton = el('button', { type: 'button', class: `fq-cajon fq-cajon-${cajon.id}`, 'aria-pressed': String(cajon.id === cajonAbierto) },
      el('span', { class: 'fq-portaetiquetas' }, el('span', {}, t(`faq.cat.${cajon.id}`))),
      el('span', { class: 'fq-tirador', 'aria-hidden': 'true' }),
      el('span', { class: 'fq-cuantas', 'aria-hidden': 'true' }, String(cajon.preguntas.length)));
    boton.addEventListener('click', () => {
      cajonAbierto = cajon.id;
      busqueda = '';
      buscador.value = '';
      cajones.forEach(b => b.setAttribute('aria-pressed', String(b === boton)));
      sonar('cajon');
      bibliotecaria.gesto('senalar');
      pintarFichas();
    });
    return boton;
  });
  const buscador = el('input', { type: 'search', class: 'fq-buscador', placeholder: t('faq.buscar'), 'aria-label': t('faq.buscar') });
  // al dejar de escribir, la bibliotecaria «busca» en el fichero: suena el radar, o un «nada» si no hay fichas
  let buscando = null;
  buscador.addEventListener('input', () => {
    busqueda = buscador.value;
    cajones.forEach(b => b.setAttribute('aria-pressed', String(!busqueda.trim() && b.classList.contains(`fq-cajon-${cajonAbierto}`))));
    const encontradas = pintarFichas();
    clearTimeout(buscando);
    if (busqueda.trim()) buscando = setTimeout(() => sonar(encontradas ? 'buscar' : 'nada'), 450);
  });
  elenco.alApagar(() => clearTimeout(buscando));

  const biblioteca = el('section', { class: 'fq-biblioteca' },
    el('span', { class: 'fq-estanterias', 'aria-hidden': 'true' }),
    el('header', { class: 'fq-placa' },
      el('span', { class: 'fq-etiqueta' }, t('comunidadExtra.paglotFaq')),
      el('h1', {}, t('comunidadExtra.clearAnswersNoGuesswork')),
      el('p', {}, t('faq.lema'))),
    el('div', { class: 'fq-mostrador' },
      bibliotecaria.figura,
      el('div', { class: 'fq-fichero' },
        el('div', { class: 'fq-cajones', role: 'group', 'aria-label': t('pagina.faq') }, cajones),
        el('span', { class: 'fq-patas', 'aria-hidden': 'true' })),
      el('div', { class: 'fq-busqueda' }, el('span', { class: 'fq-lupa', 'aria-hidden': 'true' }), buscador)),
    el('span', { class: 'fq-suelo', 'aria-hidden': 'true' }));

  const lectura = el('section', { class: 'fq-lectura', 'aria-label': t('pagina.faq') }, contador, mesa,
    el('div', { class: 'fq-fin es-papel' },
      el('h2', {}, t('faq.fin.titulo')),
      el('p', {}, t('faq.fin.texto')),
      el('a', { class: 'es-boton', href: '#/contacto', onclick: () => sonar('pagina') }, t('comunidadExtra.stillHaveAQuestionContact'), ' →')));

  poner(root, el('article', { class: 'fichero-faq escena-web' }, biblioteca, lectura));
  pintarFichas();
  elenco.vigilar(biblioteca);
  despues(700, () => { bibliotecaria.gesto('saludar'); bibliotecaria.decir(t('faq.tutora.hola'), 3000); });
  return () => elenco.apagar();
}
