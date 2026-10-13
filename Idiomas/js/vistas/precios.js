// Pantalla de precios (#/precios): el plan gratis y Paglot completo (mensual, anual o para siempre).
// TODAVÍA NO SE COBRA NADA ni se aplica el límite diario: la pantalla enseña el plan y el botón dice «Muy pronto».
// Los precios y el límite están en config.js; los textos, en i18n/ (claves «precios.*»).

import { el, poner } from '../dom.js';
import { t, locale } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { PRECIOS, LECCIONES_GRATIS_AL_DIA, PRACTICAS_GRATIS_AL_DIA, CUADERNO_GRATIS } from '../config.js';

// Si el navegador no dice el país, se supone por el idioma.
const PAIS_POR_IDIOMA = { vi: 'VN', id: 'ID', pt: 'BR', es: 'ES', en: 'US', zh: 'CN', ja: 'JP', ko: 'KR', de: 'DE', fr: 'FR', it: 'IT', tr: 'TR', th: 'TH', ru: 'RU', pl: 'PL' };

/** El escalón de precios que toca según el país del navegador. */
function escalon() {
  const [lengua, region] = (navigator.language ?? '').split('-');
  const pais = (region ?? PAIS_POR_IDIOMA[lengua?.toLowerCase()] ?? '').toUpperCase();
  return Object.values(PRECIOS).find(e => e.paises.includes(pais)) ?? PRECIOS.medio;
}

/** Pinta la pantalla. Devuelve una función que la apaga: hay que llamarla al salir. */
export function pintarPrecios(contenedor) {
  let encendida = true;
  let sprite = null;
  let callar = null;
  const disponibles = CURSOS.filter(c => !c.proximamente);
  const quien = hayCurso ? curso : disponibles[Math.floor(Math.random() * disponibles.length)];
  const precios = escalon();
  const euros = n => n.toLocaleString(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: n ? 2 : 0 });

  // La tutora, con su bocadillo (los estilos son los de «Sobre Paglot»).
  const canvas = el('canvas', { class: 'sobre-tutora', width: 48, height: 64 });
  const globo = el('span', { class: 'inicio-globo' });
  const tutora = el('div', { class: 'sobre-actriz sobre-guia', 'aria-hidden': 'true' }, globo, el('span', { class: 'sobre-salto' }, canvas));
  const decir = (texto, expresion = 'contenta') => {
    globo.style.setProperty('--corre', '0px');
    globo.textContent = texto;
    tutora.classList.add('habla');
    sprite?.reaccionar(expresion, 1200);
    clearTimeout(callar);
    callar = setTimeout(() => tutora.classList.remove('habla'), 5000);
  };
  dibujoDe(quien).then(dibujo => { if (encendida) sprite = dibujo.crearSprite(canvas); }).catch(() => { tutora.hidden = true; });
  tutora.addEventListener('click', () => { sonar('saludo'); sprite?.reaccionar('cosquillas', 900); });
  const saludo = setTimeout(() => decir(t('precios.tutora')), 500);

  // Paglot completo: se elige la forma de pago y el precio cambia.
  let plan = 'ano';
  const precio = el('p', { class: 'plan-precio' });
  const por = el('p', { class: 'plan-por' });
  const botones = ['mes', 'ano', 'siempre'].map(clave => el('button', {
    type: 'button', class: 'boton boton-mini', 'aria-pressed': String(clave === plan),
    onclick: () => { plan = clave; sonar('voltear'); pintarPlan(); },
  }, t(`precios.plan.${clave}`)));
  function pintarPlan() {
    botones.forEach((b, i) => b.setAttribute('aria-pressed', String(['mes', 'ano', 'siempre'][i] === plan)));
    precio.textContent = euros(precios[plan]);
    por.textContent = t(`precios.por.${plan}`);
    precio.classList.remove('cambia');
    void precio.offsetWidth;
    precio.classList.add('cambia');
  }
  pintarPlan();

  const lista = claves => el('ul', {}, claves.map(c => el('li', {}, t(`precios.${c}`, { n: LECCIONES_GRATIS_AL_DIA, p: PRACTICAS_GRATIS_AL_DIA, m: CUADERNO_GRATIS }))));

  poner(contenedor,
    el('article', { class: 'precios' },
      el('header', { class: 'sobre-cabecera' },
        tutora,
        el('div', { class: 'sobre-cabecera-texto' },
          el('h1', {}, t('precios.titulo')),
          el('p', { class: 'sobre-lema' }, t('precios.lema')))),

      el('div', { class: 'planes' },
        el('section', { class: 'plan caja' },
          el('h2', {}, t('precios.gratis.titulo')),
          el('p', { class: 'plan-precio' }, euros(0)),
          el('p', { class: 'plan-por' }, t('precios.gratis.para')),
          lista(['gratis.l1', 'gratis.l2', 'gratis.l3', 'gratis.l6', 'gratis.l7', 'gratis.l4', 'gratis.l5']),
          el('a', { class: 'boton', href: hayCurso ? '#/lecciones' : '#/idiomas', onclick: () => sonar('pagina') },
            hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar'))),
        el('section', { class: 'plan plan-completo caja' },
          el('h2', {}, t('precios.completo.titulo')),
          precio, por,
          el('div', { class: 'filtros', role: 'group', 'aria-label': t('precios.elegir') }, botones),
          lista(['completo.l1', 'completo.l2', 'completo.l4', 'completo.l5', 'completo.l3']),
          el('button', {
            type: 'button', class: 'boton boton-principal',
            onclick: () => { decir(t('precios.prontoTutora')); tutora.scrollIntoView({ block: 'center', behavior: 'smooth' }); },
          }, t('precios.pronto')))),
      el('p', { class: 'precios-nota' }, t('precios.pais')),

      el('section', {},
        el('h2', {}, t('precios.promesas.titulo')),
        el('ul', { class: 'promesas' }, ['p1', 'p2', 'p3', 'p4'].map(p => el('li', { class: 'caja' }, t(`precios.${p}`))))),

      el('section', { class: 'precios-extras' },
        el('h2', {}, t('precios.extras.titulo')),
        el('p', {}, t('precios.extras.texto')))));

  return () => {
    encendida = false;
    clearTimeout(saludo);
    clearTimeout(callar);
    sprite?.parar?.();
  };
}
