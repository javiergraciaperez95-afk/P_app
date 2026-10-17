// Guías de convivencia, preguntas frecuentes y laboratorio de ideas de Paglot.
import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
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
    [t('comunidadExtra.respectComesFirst'), t('comunidadExtra.treatPeopleWithKindnessYou')],
    [t('comunidadExtra.protectPersonalInformation'), t('comunidadExtra.doNotSharePhoneNumbers')],
    [t('comunidadExtra.shareWithContext'), t('comunidadExtra.whenSuggestingACorrectionOr')],
    [t('comunidadExtra.makeRoomForDifferentWays'), t('comunidadExtra.everyoneLearnsAtTheirOwn')],
    [t('comunidadExtra.helpKeepTheSpaceUseful'), t('comunidadExtra.pleaseAvoidSpamUnsolicitedAdvertising')],
  ];
  poner(root, el('article', { class: 'comunidad-extra comunidad-guias' },
    cabecera(t('comunidadExtra.aKindPlaceToLearn'), t('comunidadExtra.communityGuidelines'), t('comunidadExtra.aFewSimpleGuidelinesTo')),
    el('div', { class: 'guias-lista' }, guias.map(([titulo, texto], i) => el('section', { class: `guia-tarjeta caja guia-${i + 1}` },
      el('span', { class: 'guia-numero', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
      el('div', {}, el('h2', {}, titulo), el('p', {}, texto))))),
    el('p', { class: 'extra-nota' }, t('comunidadExtra.theseGuidelinesReflectHowWe'))));
}

export function pintarFaq(root) {
  const preguntas = [
    [t('comunidadExtra.isPaglotFree'), t('comunidadExtra.yesYouCanStartLearning')],
    [t('comunidadExtra.whichLanguagesCanIStudy'), t('comunidadExtra.theLanguageSelectorShowsAvailable')],
    [t('comunidadExtra.doINeedToMove'), t('comunidadExtra.noLessonsAreDesignedFor')],
    [t('comunidadExtra.canIUsePaglotWithout'), t('comunidadExtra.yesYouCanContinueWithout')],
    [t('comunidadExtra.canISubscribeToPaglot'), t('comunidadExtra.thePaglotMaxPageShows')],
    [t('comunidadExtra.howCanIShareAn'), t('comunidadExtra.visitTheLabToSuggest')],
    [t('comunidadExtra.whereCanIGetHelp'), t('comunidadExtra.visitContactAndTellUs')],
  ];
  poner(root, el('article', { class: 'comunidad-extra comunidad-faq' },
    cabecera(t('comunidadExtra.paglotFaq'), t('comunidadExtra.clearAnswersNoGuesswork'), t('comunidadExtra.theEssentialsToGetStarted')),
    el('div', { class: 'faq-lista' }, preguntas.map(([pregunta, respuesta], i) => el('details', { class: 'faq-item caja', ...(i === 0 ? { open: true } : {}) },
      el('summary', {}, el('span', { class: 'faq-spark', 'aria-hidden': 'true' }, '✦'), pregunta, el('span', { class: 'faq-mas', 'aria-hidden': 'true' }, '+')),
      el('p', {}, respuesta)))),
    el('a', { class: 'boton boton-mini faq-contacto', href: '#/contacto', onclick: () => sonar('pagina') }, t('comunidadExtra.stillHaveAQuestionContact'), ' →')));
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
    total.textContent = t('comunidadExtra.nIdeas', { n: ideas.length });
    poner(lista, ordenadas.length ? ordenadas.map(idea => {
      const votada = votos.has(idea.id);
      const boton = el('button', { type: 'button', class: 'lab-votar', 'aria-pressed': String(votada), 'aria-label': t(votada ? 'comunidadExtra.retirarVoto' : 'comunidadExtra.votar', { idea: idea.texto, n: idea.votos }), onclick: () => {
        if (votada) { votos.delete(idea.id); idea.votos = Math.max(0, idea.votos - 1); }
        else { votos.add(idea.id); idea.votos += 1; }
        const ok = guardar(); pintarIdeas(); sonar('clic');
        estado.textContent = ok ? t('comunidadExtra.voteUpdatedInThisBrowser') : t('comunidadExtra.theVoteCouldNotBe');
      } }, el('span', { class: 'lab-voto-numero' }, String(idea.votos)), el('span', { class: 'lab-voto-etiqueta' }, votada ? t('comunidadExtra.supported') : t('comunidadExtra.vote')));
      return el('article', { class: 'lab-idea caja' }, boton, el('div', { class: 'lab-idea-texto' }, el('p', {}, idea.texto), el('small', {}, idea.autora || t('comunidadExtra.paglotCommunity'))));
    }) : el('div', { class: 'lab-vacio caja' }, el('span', { 'aria-hidden': 'true' }, '✦'), el('p', {}, t('comunidadExtra.thereAreNoIdeasYet'))));
  }

  const entrada = el('textarea', { name: 'idea', rows: 3, maxlength: 180, required: true, placeholder: t('comunidadExtra.eGATwoMinute'), 'aria-label': t('comunidadExtra.yourIdeaForPaglot') });
  const autora = el('input', { name: 'autora', maxlength: 32, placeholder: t('comunidadExtra.nameOptional'), 'aria-label': t('comunidadExtra.optionalName') });
  const formulario = el('form', { class: 'lab-form caja', onsubmit: event => {
    event.preventDefault();
    const texto = entrada.value.trim();
    if (!texto) { entrada.focus(); return; }
    ideas.push({ id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, texto, autora: autora.value.trim(), votos: 0, creada: Date.now() });
    const ok = guardar(); entrada.value = ''; autora.value = ''; pintarIdeas();
    estado.textContent = ok ? t('comunidadExtra.ideaAddedYouCanNow') : t('comunidadExtra.theIdeaWasAddedBut');
    sonar('clic');
  } },
    el('label', {}, t('comunidadExtra.whatWouldYouLikeTo'), entrada),
    el('div', { class: 'lab-form-pie' }, autora, el('button', { class: 'boton boton-principal', type: 'submit' }, t('comunidadExtra.suggestAnIdea'), ' +')));

  poner(root, el('article', { class: 'comunidad-extra comunidad-lab' },
    cabecera(t('comunidadExtra.paglotLab'), t('comunidadExtra.theNextIdeaCouldCome'), t('comunidadExtra.suggestAnImprovementSupportThe')),
    el('section', { class: 'lab-panel', 'aria-labelledby': 'lab-proponer' },
      el('div', { class: 'lab-form-titulo' }, el('span', { class: 'lab-bombilla', 'aria-hidden': 'true' }, '✦'), el('div', {}, el('h2', { id: 'lab-proponer' }, t('comunidadExtra.putYourIdeaOnThe')), el('p', {}, t('comunidadExtra.aClearSuggestionHelpsUs')))), formulario),
    el('section', { class: 'lab-votacion', 'aria-labelledby': 'lab-ideas' },
      el('header', { class: 'lab-lista-cabecera' }, el('div', {}, el('span', { class: 'comunidad-etiqueta' }, t('comunidadExtra.theBoard')), el('h2', { id: 'lab-ideas' }, t('comunidadExtra.communityIdeas'))), total),
      el('p', { class: 'lab-prototipo' }, t('comunidadExtra.prototypeSuggestionsAndVotesAre')),
      estado, lista)));
  pintarIdeas();
}
