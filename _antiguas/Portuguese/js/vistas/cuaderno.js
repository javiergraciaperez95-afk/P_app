// Pantalla «Cuaderno»: todo lo que el estudiante ha guardado.

import { el, poner } from '../dom.js';
import { icono } from '../iconos.js';
import { tarjetas, quitarDelCuaderno, guardarEnCuaderno, estaEnCuaderno } from '../progress.js';
import { etapa, tocaRepasar, esNueva } from '../srs.js';
import { botonEscuchar, botonGuardar } from '../comunes.js';
import { diccionarioCompleto } from './leccion.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { t, tr, fechaCorta, idioma } from '../i18n.js';

const FILTROS = [
  { clave: 'todas', texto: 'notebook.filter.all' },
  { clave: 'palabra', texto: 'notebook.filter.words' },
  { clave: 'frase', texto: 'notebook.filter.phrases' },
];

let filtro = 'todas';
let busqueda = '';

function textoProximo(tarjeta) {
  if (esNueva(tarjeta.srs)) return t('notebook.notReviewed');
  if (tocaRepasar(tarjeta.srs)) return t('notebook.dueToday');
  return t('notebook.nextReview', { fecha: fechaCorta(tarjeta.srs.vence) });
}

/** Origen guardado: texto o { en, vi }. */
function tarjeta(c, repintar) {
  const e = etapa(c.srs);
  const quitar = el('button', {
    type: 'button',
    class: 'boton-icono',
    'aria-label': t('notebook.removeItem', { texto: c.pt }),
    title: t('notebook.remove'),
    onclick: () => {
      quitarDelCuaderno(c.pt);
      sonar('quitar');
      repintar();
      decir(t('tutor.removed', { texto: c.pt }));
    },
  }, icono('papelera'));

  return el('li', { class: 'caja tarjeta-cuaderno' },
    el('div', { class: 'tarjeta-cuaderno-texto' },
      el('p', { class: 'voz-pt', lang: 'pt-PT' }, c.pt),
      el('p', { class: 'voz-trad' }, tr(c.trad)),
      c.pron && el('p', { class: 'aprox' }, `${tr(c.pron)} (${t('word.approx')})`),
      el('p', { class: 'meta' },
        el('span', { class: `etapa etapa-${e.clave}` }, e.texto),
        ` · ${t(c.tipo === 'frase' ? 'notebook.phrase' : 'notebook.word')}`,
        c.origen && ` · ${tr(c.origen)}`),
      el('p', { class: 'meta' }, textoProximo(c))),
    el('div', { class: 'frase-acciones' }, botonEscuchar(c.pt), quitar));
}

function formularioNueva(repintar) {
  const pt = el('input', { id: 'nueva-pt', type: 'text', required: true, autocomplete: 'off', lang: 'pt-PT' });
  const trad = el('input', { id: 'nueva-trad', type: 'text', required: true, autocomplete: 'off' });
  const form = el('form', { class: 'formulario' },
    el('div', { class: 'campo' }, el('label', { for: 'nueva-pt' }, t('notebook.inPortuguese')), pt),
    el('div', { class: 'campo' }, el('label', { for: 'nueva-trad' }, t('notebook.meaning')), trad),
    el('button', { type: 'submit', class: 'boton boton-principal' }, t('notebook.add')));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const texto = pt.value.trim();
    if (!texto || !trad.value.trim()) return;
    if (estaEnCuaderno(texto)) {
      decir(t('tutor.alreadySaved', { texto }), 'sorprendida');
      return;
    }
    // La traducción escrita a mano se guarda con su idioma: { en: "…" } o { vi: "…" }.
    guardarEnCuaderno({ pt: texto, trad: { [idioma()]: trad.value.trim() }, tipo: texto.includes(' ') ? 'frase' : 'palabra', origen: { en: 'Added by hand', vi: 'Tự thêm' } });
    sonar('guardar');
    decir(t('tutor.saved', { texto }), 'contenta');
    form.reset();
    repintar();
    pt.focus();
  });
  return el('details', { class: 'caja' },
    el('summary', {}, `+ ${t('notebook.addByHand')}`),
    el('p', { class: 'aprox' }, t('notebook.addByHandHelp')),
    form);
}

const sinTildes = x => String(x).toLocaleLowerCase('pt').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Buscador en todas las palabras del curso, con audio y estrella. */
function buscadorDiccionario(alGuardar) {
  const entrada = el('input', { id: 'buscar-dic', type: 'search', autocomplete: 'off', placeholder: t('notebook.dictionaryPlaceholder') });
  const resultados = el('ul', { class: 'lista-diccionario' });
  entrada.addEventListener('input', () => {
    const q = sinTildes(entrada.value.trim());
    if (q.length < 2) { poner(resultados); return; }
    const encontradas = [];
    for (const v of diccionarioCompleto().values()) {
      const pt = sinTildes(v.pt);
      const trad = sinTildes(tr(v.trad));
      const palabrasTrad = trad.split(/[^\p{L}]+/u);
      const peso = pt === q ? 0 : pt.startsWith(q) ? 1 : palabrasTrad.includes(q) ? 2 : pt.includes(q) ? 3 : trad.includes(q) ? 4 : -1;
      if (peso >= 0) encontradas.push([peso, v]);
    }
    encontradas.sort((a, b) => a[0] - b[0] || a[1].pt.length - b[1].pt.length);
    poner(resultados, encontradas.length
      ? encontradas.slice(0, 30).map(([, v]) => el('li', { class: 'caja tarjeta-cuaderno' },
        el('div', { class: 'tarjeta-cuaderno-texto' },
          el('p', { class: 'voz-pt', lang: 'pt-PT' }, v.pt),
          el('p', { class: 'voz-trad' }, tr(v.trad)),
          v.pron && el('p', { class: 'aprox' }, `${tr(v.pron)} (${t('word.approx')})`),
          v.consejo && el('p', { class: 'aprox consejo' }, `🗣 ${tr(v.consejo)}`)),
        el('div', { class: 'frase-acciones' },
          botonEscuchar(v.pt),
          botonGuardar({ pt: v.pt, trad: v.trad, pron: v.pron, nota: v.nota || v.consejo, tipo: v.pt.includes(' ') ? 'frase' : 'palabra', origen: { en: 'Dictionary', vi: 'Từ điển' } }))))
      : el('li', { class: 'aprox' }, t('notebook.notInCourse')));
  });
  const alCambiar = () => {
    if (!entrada.isConnected) window.removeEventListener('cuaderno-cambiado', alCambiar);
    else alGuardar();
  };
  window.addEventListener('cuaderno-cambiado', alCambiar);
  return el('details', { class: 'caja' },
    el('summary', {}, `🔎 ${t('notebook.dictionary')}`),
    el('div', { class: 'campo' }, el('label', { for: 'buscar-dic' }, t('notebook.dictionaryLabel')), entrada),
    resultados);
}

export function pintarCuaderno(app) {
  const listaEl = el('ul', { class: 'lista-cuaderno' });
  const resumenEl = el('p', { class: 'resumen-cuaderno' });

  function repintar() {
    const todas = tarjetas().sort((a, b) => b.creada - a.creada);
    const q = sinTildes(busqueda.trim());
    const visibles = todas.filter(c =>
      (filtro === 'todas' || c.tipo === filtro)
      && (!q || sinTildes(c.pt).includes(q) || sinTildes(tr(c.trad)).includes(q)));

    const pendientes = todas.filter(c => tocaRepasar(c.srs)).length;
    const nuevas = todas.filter(c => esNueva(c.srs)).length;
    resumenEl.textContent = t('notebook.summary', { total: todas.length, nuevas, pendientes });

    if (!todas.length) {
      poner(listaEl, el('li', { class: 'caja vacio' },
        el('p', {}, t('notebook.empty')),
        el('p', {}, t('notebook.emptyHelp'))));
    } else if (!visibles.length) {
      poner(listaEl, el('li', { class: 'caja vacio' }, t('notebook.noMatches')));
    } else {
      poner(listaEl, visibles.map(c => tarjeta(c, repintar)));
    }
  }

  const buscador = el('input', {
    id: 'buscar', type: 'search', value: busqueda, placeholder: t('notebook.searchPlaceholder'), autocomplete: 'off',
  });
  buscador.addEventListener('input', () => { busqueda = buscador.value; repintar(); });

  const filtros = el('div', { class: 'filtros', role: 'group', 'aria-label': t('notebook.show') },
    FILTROS.map(f => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(f.clave === filtro) }, t(f.texto));
      b.addEventListener('click', () => {
        filtro = f.clave;
        filtros.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        repintar();
      });
      return b;
    }));

  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, t('notebook.title')),
      el('p', {}, t('notebook.intro')),
      resumenEl,
      el('a', { class: 'boton boton-principal', href: '#/repaso' }, `${t('notebook.goToReview')} ▶`)),
    el('div', { class: 'barra-herramientas' },
      el('div', { class: 'campo' }, el('label', { for: 'buscar' }, t('notebook.search')), buscador),
      filtros),
    buscadorDiccionario(repintar),
    listaEl,
    formularioNueva(repintar));

  repintar();
  const total = tarjetas().length;
  decir(total ? t('tutor.notebookCount', { n: total }) : t('tutor.notebookEmpty'));
}
