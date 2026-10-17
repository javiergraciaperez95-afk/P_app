// El laboratorio de ideas (#/laboratorio) y sus normas (#/guias), que comparten sala: pared de azulejos, estantes con
// matraces y la mesa de trabajo. En el laboratorio, cada idea es un matraz en la estantería y cada voto, una gota:
// el líquido sube con los votos. La idea nueva se escribe en la ficha de la mesa, junto a un matraz que se llena y
// burbujea mientras escribes. Las normas son carteles de seguridad colgados en la pared.
// Las ideas y los votos se guardan solo en este navegador (lo dice la nota): no hay votación compartida todavía.
// Colores en css/laboratorio.css; textos en «comunidadExtra.*» y «lab.*».

import { el, poner, alAzar } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { dibujoPixel, conContorno } from './inicio-decorado.js';
import { crearElenco } from './elenco.js';

const CLAVE_IDEAS = 'paglot-laboratorio-ideas-v1';
const CLAVE_VOTOS = 'paglot-laboratorio-votos-v1';
const COLORES = ['rosa', 'menta', 'cielo', 'oro', 'lila'];

// los pictogramas de los carteles de seguridad (12×12): corazón, candado, bocadillo, caracol y escoba
const PICTOS = [
  ['............', '.pp....pp...', 'pppp..pppp..', 'pppppppppp..', 'pppppppppp..', '.pppppppp...', '..pppppp....', '...pppp.....', '....pp......', '............', '............', '............'],
  ['....pppp....', '...p....p...', '...p....p...', '...p....p...', '..pppppppp..', '..pppppppp..', '..ppp..ppp..', '..ppp..ppp..', '..pppp.ppp..', '..pppppppp..', '..pppppppp..', '............'],
  ['.pppppppppp.', 'pppppppppppp', 'pp........pp', 'pp.pppppp.pp', 'pp........pp', 'pp.pppp...pp', 'pppppppppppp', '.pppppppppp.', '...ppp......', '..pp........', '.p..........', '............'],
  ['............', '....pppp....', '...pp..pp...', '..pp.pp.pp..', '..pp.p..pp..', '..pp.ppp.p..', '...pp...pp.p', 'pp..pppppp.p', '.pppppppppp.', '..pppppppp..', '............', '............'],
  ['.........pp.', '........pp..', '.......pp...', '......pp....', '.....pp.....', '...pppppp...', '..pppppppp..', '.pp.pp.pp.p.', '.p.pp.pp.pp.', 'pp.p..p..p..', '............', '............'],
];

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

/** Un matraz de cristal (de CSS): el líquido llega a «nivel» (0–1). */
function matraz(color, nivel, clase = '') {
  return el('span', { class: `lb-matraz lb-${color} ${clase}`.trim(), style: `--nivel:${Math.round(nivel * 100)}%`, 'aria-hidden': 'true' },
    el('span', { class: 'lb-cuello' }), el('span', { class: 'lb-cuerpo' }, el('span', { class: 'lb-liquido' }), el('i', {}), el('i', {}), el('i', {})));
}

/** Los estantes del fondo, llenos de matraces y tubos de colores. */
function estantesDelFondo() {
  return el('div', { class: 'lb-estantes', 'aria-hidden': 'true' },
    [0, 1].map(fila => el('div', { class: 'lb-balda' },
      [0, 1, 2, 3, 4, 5].map(i => matraz(COLORES[(i + fila * 2) % COLORES.length], 0.25 + ((i * 37 + fila * 19) % 60) / 100, i % 3 === 1 ? 'lb-tubo' : '')))));
}

// =====================================================================
// Las normas del laboratorio (#/guias)
// =====================================================================
export function pintarGuias(root) {
  const elenco = crearElenco();
  const { despues } = elenco;
  const guias = [
    [t('comunidadExtra.respectComesFirst'), t('comunidadExtra.treatPeopleWithKindnessYou')],
    [t('comunidadExtra.protectPersonalInformation'), t('comunidadExtra.doNotSharePhoneNumbers')],
    [t('comunidadExtra.shareWithContext'), t('comunidadExtra.whenSuggestingACorrectionOr')],
    [t('comunidadExtra.makeRoomForDifferentWays'), t('comunidadExtra.everyoneLearnsAtTheirOwn')],
    [t('comunidadExtra.helpKeepTheSpaceUseful'), t('comunidadExtra.pleaseAvoidSpamUnsolicitedAdvertising')],
  ];
  const vigilante = elenco.tutora(elenco.protagonista(), 'lb-vigilante');
  vigilante.alTocar = () => { vigilante.gesto('senalar'); vigilante.decir(t('lab.tutora.normas'), 3000); };
  const carteles = guias.map(([titulo, texto], i) => {
    const cartel = el('li', { class: `lb-cartel lb-cartel-${i + 1}` },
      el('span', { class: 'lb-cartel-clavo', 'aria-hidden': 'true' }),
      el('span', { class: 'lb-pictograma', 'aria-hidden': 'true' }, dibujoPixel(conContorno(PICTOS[i]).map(f => f.map(c => (c === 'k' ? '.' : c))), 'lb-picto', 'lb')),
      el('div', {},
        el('span', { class: 'lb-cartel-numero' }, String(i + 1).padStart(2, '0')),
        el('h2', {}, titulo),
        el('p', {}, texto)));
    cartel.addEventListener('pointerenter', () => vigilante.reaccionar('contenta', 700));
    return cartel;
  });
  const sala = el('section', { class: 'lb-sala lb-sala-normas' },
    estantesDelFondo(),
    el('header', { class: 'lb-letrero' },
      el('span', { class: 'lb-etiqueta' }, t('comunidadExtra.aKindPlaceToLearn')),
      el('h1', {}, t('comunidadExtra.communityGuidelines')),
      el('p', {}, t('comunidadExtra.aFewSimpleGuidelinesTo'))),
    el('ol', { class: 'lb-carteles' }, carteles),
    el('div', { class: 'lb-pie-normas' },
      vigilante.figura,
      el('div', { class: 'lb-pie-texto' },
        el('p', {}, t('comunidadExtra.theseGuidelinesReflectHowWe')),
        el('a', { class: 'es-boton', href: '#/laboratorio', onclick: () => sonar('pagina') }, t('lab.entrar'), ' →'))),
    el('span', { class: 'lb-suelo', 'aria-hidden': 'true' }));
  poner(root, el('article', { class: 'laboratorio escena-web' }, sala));
  elenco.vigilar(sala);
  despues(700, () => { vigilante.gesto('saludar'); vigilante.decir(t('lab.tutora.normas'), 3200); });
  return () => elenco.apagar();
}

// =====================================================================
// El laboratorio de ideas (#/laboratorio)
// =====================================================================
export function pintarLaboratorio(root) {
  const elenco = crearElenco();
  const { quieto, despues } = elenco;
  let ideas = leerIdeas();
  const votos = leerVotos();
  const estado = el('p', { class: 'lb-estado', role: 'status', 'aria-live': 'polite' });
  const total = el('span', { class: 'lb-total' });
  const lista = el('ul', { class: 'lb-formulas' });
  const cientifica = elenco.tutora(elenco.protagonista(), 'lb-cientifica');
  cientifica.alTocar = () => { cientifica.gesto('pensar'); cientifica.decir(alAzar(t('lab.tutora.toca')), 2800); };

  function guardar() {
    try {
      localStorage.setItem(CLAVE_IDEAS, JSON.stringify(ideas));
      localStorage.setItem(CLAVE_VOTOS, JSON.stringify([...votos]));
      return true;
    } catch { return false; }
  }

  function pintarIdeas() {
    const ordenadas = [...ideas].sort((a, b) => b.votos - a.votos || a.creada - b.creada);
    const maximo = Math.max(3, ...ordenadas.map(i => i.votos));
    total.textContent = t('comunidadExtra.nIdeas', { n: ideas.length });
    poner(lista, ordenadas.length ? ordenadas.map((idea, n) => {
      const votada = votos.has(idea.id);
      const color = COLORES[Math.abs([...idea.id].reduce((s, c) => s + c.charCodeAt(0), 0)) % COLORES.length];
      const frasco = matraz(color, 0.12 + 0.82 * (idea.votos / maximo));
      const boton = el('button', {
        type: 'button', class: 'lb-gota', 'aria-pressed': String(votada),
        'aria-label': t(votada ? 'comunidadExtra.retirarVoto' : 'comunidadExtra.votar', { idea: idea.texto, n: idea.votos }),
        onclick: () => {
          if (votos.has(idea.id)) { votos.delete(idea.id); idea.votos = Math.max(0, idea.votos - 1); sonar('quitar'); }
          else { votos.add(idea.id); idea.votos += 1; sonar('guardar'); cientifica.gesto('aplaudir'); }
          const ok = guardar();
          pintarIdeas();
          lista.querySelector(`[data-id="${idea.id}"]`)?.classList.add('burbujea');
          estado.textContent = ok ? t('comunidadExtra.voteUpdatedInThisBrowser') : t('comunidadExtra.theVoteCouldNotBe');
        },
      }, el('span', { class: 'lb-gota-icono', 'aria-hidden': 'true' }), el('span', {}, votada ? t('lab.gotaPuesta') : t('lab.gota')), el('b', {}, String(idea.votos)));
      return el('li', { class: `lb-formula ${n === 0 && idea.votos ? 'lb-primera' : ''}`.trim(), 'data-id': idea.id },
        frasco,
        el('div', { class: 'lb-etiqueta-formula' },
          el('p', {}, idea.texto),
          el('small', {}, idea.autora || t('comunidadExtra.paglotCommunity'))),
        boton);
    }) : el('li', { class: 'lb-vacio' }, matraz('cielo', 0.04), el('p', {}, t('comunidadExtra.thereAreNoIdeasYet'))));
  }

  // ----- La mesa de trabajo: la ficha y el matraz que se llena al escribir -----
  const entrada = el('textarea', { id: 'lb-idea', name: 'idea', rows: 4, maxlength: 180, required: true, placeholder: t('comunidadExtra.eGATwoMinute') });
  const autora = el('input', { name: 'autora', maxlength: 32, placeholder: t('comunidadExtra.nameOptional'), 'aria-label': t('comunidadExtra.optionalName') });
  const frascoMesa = matraz('rosa', 0.06, 'lb-matraz-mesa');
  let ultimoBurbujeo = 0;
  entrada.addEventListener('input', () => {
    frascoMesa.style.setProperty('--nivel', `${Math.round(6 + 84 * Math.min(1, entrada.value.length / 180))}%`);
    frascoMesa.classList.add('burbujea');
    if (Date.now() - ultimoBurbujeo > 2600) { ultimoBurbujeo = Date.now(); cientifica.gesto('escribir'); }
  });
  const formulario = el('form', { class: 'lb-ficha', onsubmit: evento => {
    evento.preventDefault();
    const texto = entrada.value.trim();
    if (!texto) { entrada.focus(); sonar('mal'); cientifica.gesto('negar'); return; }
    ideas.push({ id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, texto, autora: autora.value.trim(), votos: 0, creada: Date.now() });
    const ok = guardar();
    entrada.value = '';
    autora.value = '';
    frascoMesa.style.setProperty('--nivel', '6%');
    pintarIdeas();
    estado.textContent = ok ? t('comunidadExtra.ideaAddedYouCanNow') : t('comunidadExtra.theIdeaWasAddedBut');
    sonar('paso');
    cientifica.gesto('celebrar');
    cientifica.decir(t('lab.tutora.nueva'), 2600);
  } },
    el('h2', { id: 'lb-proponer' }, t('comunidadExtra.putYourIdeaOnThe')),
    el('p', {}, t('comunidadExtra.aClearSuggestionHelpsUs')),
    el('label', { for: 'lb-idea' }, t('comunidadExtra.whatWouldYouLikeTo')),
    entrada,
    el('div', { class: 'lb-ficha-pie' }, autora, el('button', { class: 'es-boton', type: 'submit' }, t('comunidadExtra.suggestAnIdea'), ' +')));

  const sala = el('section', { class: 'lb-sala' },
    estantesDelFondo(),
    el('a', { class: 'lb-aviso-normas', href: '#/guias', onclick: () => sonar('pagina') }, el('span', { 'aria-hidden': 'true' }, '!'), t('lab.normas')),
    el('header', { class: 'lb-letrero' },
      el('span', { class: 'lb-etiqueta' }, t('comunidadExtra.paglotLab')),
      el('h1', {}, t('comunidadExtra.theNextIdeaCouldCome')),
      el('p', {}, t('comunidadExtra.suggestAnImprovementSupportThe'))),
    el('div', { class: 'lb-mesa-escena' },
      cientifica.figura,
      el('div', { class: 'lb-mesa-cosas', 'aria-hidden': 'true' }, frascoMesa, el('span', { class: 'lb-mechero' }), el('span', { class: 'lb-gradilla' }, el('i', {}), el('i', {}), el('i', {}))),
      formulario),
    el('span', { class: 'lb-suelo', 'aria-hidden': 'true' }));

  const estanteria = el('section', { class: 'lb-estanteria', 'aria-labelledby': 'lb-ideas' },
    el('header', { class: 'lb-estanteria-cabecera' },
      el('div', {}, el('span', { class: 'lb-etiqueta' }, t('comunidadExtra.theBoard')), el('h2', { id: 'lb-ideas' }, t('lab.estanteria'))),
      total),
    el('p', { class: 'lb-prototipo' }, t('comunidadExtra.prototypeSuggestionsAndVotesAre')),
    estado,
    lista);

  poner(root, el('article', { class: 'laboratorio escena-web' }, sala, estanteria));
  pintarIdeas();
  elenco.vigilar(sala);
  despues(700, () => { cientifica.gesto('saludar'); cientifica.decir(t('lab.tutora.hola'), 3200); });
  if (quieto) frascoMesa.classList.remove('burbujea');
  return () => elenco.apagar();
}
