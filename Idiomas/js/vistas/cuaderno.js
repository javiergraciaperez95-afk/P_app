// Pantalla «Cuaderno»: todo lo que el estudiante ha guardado.

import { el, poner } from '../dom.js';
import { t, tr, origenTarjeta, textoOrigen, idioma, locale } from '../i18n.js';
import { icono } from '../iconos.js';
import { tarjetas, quitarDelCuaderno, guardarEnCuaderno, estaEnCuaderno } from '../progress.js';
import { etapa, tocaRepasar, esNueva } from '../srs.js';
import { botonEscuchar, botonGuardar } from '../comunes.js';
import { diccionarioCompleto } from './leccion.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { LANG } from '../curso.js';

const FILTROS = ['todas', 'palabra', 'frase'];

let filtro = 'todas';
let busqueda = '';

function fecha(ms) {
  return new Date(ms).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
}

function textoProximo(c) {
  if (esNueva(c.srs)) return t('cuaderno.sinRepasar');
  if (tocaRepasar(c.srs)) return t('cuaderno.tocaHoy');
  return t('cuaderno.proximo', { fecha: fecha(c.srs.vence) });
}

function tarjeta(c, repintar) {
  const e = etapa(c.srs);
  const quitar = el('button', {
    type: 'button',
    class: 'boton-icono',
    'aria-label': t('comun.quitarDe', { texto: c.es }),
    title: t('comun.quitarCuaderno'),
    onclick: () => {
      quitarDelCuaderno(c.es);
      sonar('quitar');
      repintar();
      decir(t('cuaderno.quitada', { texto: c.es }));
    },
  }, icono('papelera'));

  return el('li', { class: 'caja tarjeta-cuaderno' },
    el('div', { class: 'tarjeta-cuaderno-texto' },
      el('p', { class: 'voz-es', lang: LANG }, c.es),
      el('p', { class: 'voz-trad' }, tr(c.trad)),
      c.pron && el('p', { class: 'aprox' }, `${c.pron} ${t('comun.aprox')}`),
      el('p', { class: 'meta' },
        el('span', { class: `etapa etapa-${e.clave}` }, e.texto),
        ` · ${t(c.tipo === 'frase' ? 'tipo.Frase' : 'tipo.Palabra')}`,
        c.origen && ` · ${textoOrigen(c.origen)}`),
      el('p', { class: 'meta' }, textoProximo(c))),
    el('div', { class: 'frase-acciones' }, botonEscuchar(c.es), quitar));
}

function formularioNueva(repintar) {
  const es = el('input', { id: 'nueva-es', type: 'text', required: true, autocomplete: 'off', lang: LANG });
  const trad = el('input', { id: 'nueva-trad', type: 'text', required: true, autocomplete: 'off' });
  const form = el('form', { class: 'formulario' },
    el('div', { class: 'campo' }, el('label', { for: 'nueva-es' }, t('cuaderno.enEspanol')), es),
    el('div', { class: 'campo' }, el('label', { for: 'nueva-trad' }, t('cuaderno.enTuIdioma')), trad),
    el('button', { type: 'submit', class: 'boton boton-principal' }, t('cuaderno.anadir')));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const texto = es.value.trim();
    if (!texto || !trad.value.trim()) return;
    if (estaEnCuaderno(texto)) {
      decir(t('cuaderno.yaEsta', { texto }), 'sorprendida');
      return;
    }
    // La traducción se guarda en el idioma en que se ha escrito.
    guardarEnCuaderno({ es: texto, trad: { [idioma()]: trad.value.trim() }, tipo: texto.includes(' ') ? 'frase' : 'palabra', origen: origenTarjeta('cuaderno.aMano') });
    sonar('guardar');
    decir(t('comun.apuntado', { texto }), 'contenta');
    form.reset();
    repintar();
    es.focus();
  });
  return el('details', { class: 'caja' },
    el('summary', {}, t('cuaderno.anadirAMano')),
    el('p', { class: 'aprox' }, t('cuaderno.anadirAyuda')),
    form);
}

/** Buscador en todas las palabras del curso, con pronunciación, audio y estrella. */
function buscadorDiccionario(alGuardar) {
  const entrada = el('input', { id: 'buscar-dic', type: 'search', autocomplete: 'off', placeholder: t('cuaderno.dicEjemplo') });
  const resultados = el('ul', { class: 'lista-diccionario' });
  entrada.addEventListener('input', () => {
    // Se busca sin tildes: «cafe» encuentra «café» (y en vietnamita, «xin chao» encuentra «xin chào»).
    const q = sinTildes(entrada.value.trim());
    if (q.length < 2) { poner(resultados); return; }
    const encontradas = [];
    for (const v of diccionarioCompleto().values()) {
      if (v.oculta) continue;
      const es = sinTildes(v.es);
      const trad = sinTildes(tr(v.trad));
      const palabrasTrad = trad.split(/[^\p{L}]+/u);
      const peso = es === q ? 0 : es.startsWith(q) ? 1 : palabrasTrad.includes(q) ? 2 : es.includes(q) ? 3 : trad.includes(q) ? 4 : -1;
      if (peso >= 0) encontradas.push([peso, v]);
    }
    encontradas.sort((a, b) => a[0] - b[0] || a[1].es.length - b[1].es.length);
    poner(resultados, encontradas.length
      ? encontradas.slice(0, 30).map(([, v]) => el('li', { class: 'caja tarjeta-cuaderno' },
        el('div', { class: 'tarjeta-cuaderno-texto' },
          el('p', { class: 'voz-es', lang: LANG }, v.es),
          el('p', { class: 'voz-trad' }, tr(v.trad)),
          v.pron && el('p', { class: 'aprox' }, `${v.pron} ${t('comun.aprox')}`),
          v.consejo && el('p', { class: 'aprox consejo' }, `🗣 ${tr(v.consejo)}`)),
        el('div', { class: 'frase-acciones' },
          botonEscuchar(v.es),
          botonGuardar({ es: v.es, trad: v.trad, pron: v.pron, nota: v.nota || v.consejo, tipo: v.es.includes(' ') ? 'frase' : 'palabra', origen: origenTarjeta('cuaderno.diccionario') }))))
      : el('li', { class: 'aprox' }, t('cuaderno.noEsta')));
  });
  const alCambiar = () => {
    if (!entrada.isConnected) window.removeEventListener('cuaderno-cambiado', alCambiar);
    else alGuardar();
  };
  window.addEventListener('cuaderno-cambiado', alCambiar);
  return el('details', { class: 'caja' },
    el('summary', {}, t('cuaderno.dicTitulo')),
    el('div', { class: 'campo' }, el('label', { for: 'buscar-dic' }, t('cuaderno.enEspanolOTuIdioma')), entrada),
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
      && (!q || sinTildes(c.es).includes(q) || sinTildes(tr(c.trad)).includes(q)));

    const pendientes = todas.filter(c => tocaRepasar(c.srs)).length;
    const nuevas = todas.filter(c => esNueva(c.srs)).length;
    resumenEl.textContent = t('cuaderno.resumen', { total: todas.length, nuevas, pendientes });

    if (!todas.length) {
      poner(listaEl, el('li', { class: 'caja vacio' },
        el('p', {}, t('cuaderno.vacio')),
        el('p', {}, t('cuaderno.vacioAyuda'))));
    } else if (!visibles.length) {
      poner(listaEl, el('li', { class: 'caja vacio' }, t('cuaderno.sinCoincidencias')));
    } else {
      poner(listaEl, visibles.map(c => tarjeta(c, repintar)));
    }
  }

  const buscador = el('input', {
    id: 'buscar', type: 'search', value: busqueda, placeholder: t('cuaderno.buscarPlaceholder'), autocomplete: 'off',
  });
  buscador.addEventListener('input', () => { busqueda = buscador.value; repintar(); });

  const filtros = el('div', { class: 'filtros', role: 'group', 'aria-label': t('cuaderno.mostrar') },
    FILTROS.map(f => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(f === filtro) }, t(`cuaderno.filtro.${f}`));
      b.addEventListener('click', () => {
        filtro = f;
        filtros.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        repintar();
      });
      return b;
    }));

  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, t('menu.cuaderno')),
      el('p', {}, t('cuaderno.intro')),
      resumenEl,
      el('a', { class: 'boton boton-principal', href: '#/repaso' }, t('cuaderno.irRepaso'))),
    el('div', { class: 'barra-herramientas' },
      el('div', { class: 'campo' }, el('label', { for: 'buscar' }, t('cuaderno.buscar')), buscador),
      filtros),
    buscadorDiccionario(repintar),
    listaEl,
    formularioNueva(repintar));

  repintar();
  const total = tarjetas().length;
  decir(total ? t('cuaderno.tutora', { n: total }) : t('cuaderno.tutoraVacio'));
}

/** Para buscar sin tildes ni mayúsculas, en español y en vietnamita. */
function sinTildes(texto) {
  return String(texto ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}
