// Pantalla «Cuaderno»: todo lo que el estudiante ha guardado.

import { el, poner } from '../dom.js';
import { icono } from '../iconos.js';
import { tarjetas, quitarDelCuaderno, guardarEnCuaderno, estaEnCuaderno } from '../progress.js';
import { etapa, tocaRepasar, esNueva } from '../srs.js';
import { botonEscuchar, botonGuardar } from '../comunes.js';
import { diccionarioCompleto } from './leccion.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';

const FILTROS = [
  { clave: 'todas', texto: 'Todo' },
  { clave: 'palabra', texto: 'Palabras' },
  { clave: 'frase', texto: 'Frases' },
];

let filtro = 'todas';
let busqueda = '';

function fecha(ms) {
  return new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function textoProximo(t) {
  if (esNueva(t.srs)) return 'Sin repasar todavía';
  if (tocaRepasar(t.srs)) return 'Toca repasar hoy';
  return `Próximo repaso: ${fecha(t.srs.vence)}`;
}

function tarjeta(t, repintar) {
  const e = etapa(t.srs);
  const quitar = el('button', {
    type: 'button',
    class: 'boton-icono',
    'aria-label': `Quitar «${t.da}» del cuaderno`,
    title: 'Quitar del cuaderno',
    onclick: () => {
      quitarDelCuaderno(t.da);
      sonar('quitar');
      repintar();
      decir(`He quitado «${t.da}» de tu cuaderno.`);
    },
  }, icono('papelera'));

  return el('li', { class: 'caja tarjeta-cuaderno' },
    el('div', { class: 'tarjeta-cuaderno-texto' },
      el('p', { class: 'voz-da', lang: 'pl' }, t.da),
      el('p', { class: 'voz-es' }, t.es),
      t.pron && el('p', { class: 'aprox' }, `${t.pron} (aprox.)`),
      el('p', { class: 'meta' },
        el('span', { class: `etapa etapa-${e.clave}` }, e.texto),
        ` · ${t.tipo === 'frase' ? 'Frase' : 'Palabra'}`,
        t.origen && ` · ${t.origen}`),
      el('p', { class: 'meta' }, textoProximo(t))),
    el('div', { class: 'frase-acciones' }, botonEscuchar(t.da), quitar));
}

function formularioNueva(repintar) {
  const da = el('input', { id: 'nueva-da', type: 'text', required: true, autocomplete: 'off', lang: 'pl' });
  const es = el('input', { id: 'nueva-es', type: 'text', required: true, autocomplete: 'off' });
  const form = el('form', { class: 'formulario' },
    el('div', { class: 'campo' }, el('label', { for: 'nueva-da' }, 'En polaco'), da),
    el('div', { class: 'campo' }, el('label', { for: 'nueva-es' }, 'En español'), es),
    el('button', { type: 'submit', class: 'boton boton-principal' }, 'Añadir'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const texto = da.value.trim();
    if (!texto || !es.value.trim()) return;
    if (estaEnCuaderno(texto)) {
      decir(`«${texto}» ya está en tu cuaderno. ¡Buena memoria la mía!`, 'sorprendida');
      return;
    }
    guardarEnCuaderno({ da: texto, es: es.value.trim(), tipo: texto.includes(' ') ? 'frase' : 'palabra', origen: 'Añadida a mano' });
    sonar('guardar');
    decir(`¡Apuntado! «${texto}» ya está en tu cuaderno.`, 'contenta');
    form.reset();
    repintar();
    da.focus();
  });
  return el('details', { class: 'caja' },
    el('summary', {}, '+ Añadir una palabra a mano'),
    el('p', { class: 'aprox' }, 'Escribe la palabra o frase tal como la has visto. No añadas pronunciación si no estás seguro.'),
    form);
}

/** Buscador en todas las palabras del curso, con pronunciación, audio y estrella. */
function buscadorDiccionario(alGuardar) {
  const entrada = el('input', { id: 'buscar-dic', type: 'search', autocomplete: 'off', placeholder: 'p. ej. «cześć», «dziękuję»' });
  const resultados = el('ul', { class: 'lista-diccionario' });
  const sinTildes = t => t.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  entrada.addEventListener('input', () => {
    const qDa = entrada.value.trim().toLocaleLowerCase('pl');
    const q = sinTildes(qDa);
    if (qDa.length < 2) { poner(resultados); return; }
    const encontradas = [];
    for (const v of diccionarioCompleto().values()) {
      const da = v.da.toLocaleLowerCase('pl');
      const es = sinTildes(v.es ?? '');
      const palabrasEs = es.split(/[^a-zñü]+/);
      const peso = da === qDa ? 0 : da.startsWith(qDa) ? 1 : palabrasEs.includes(q) ? 2 : da.includes(qDa) ? 3 : es.includes(q) ? 4 : -1;
      if (peso >= 0) encontradas.push([peso, v]);
    }
    encontradas.sort((a, b) => a[0] - b[0] || a[1].da.length - b[1].da.length);
    poner(resultados, encontradas.length
      ? encontradas.slice(0, 30).map(([, v]) => el('li', { class: 'caja tarjeta-cuaderno' },
        el('div', { class: 'tarjeta-cuaderno-texto' },
          el('p', { class: 'voz-da', lang: 'pl' }, v.da),
          el('p', { class: 'voz-es' }, v.es ?? ''),
          v.pron && el('p', { class: 'aprox' }, `${v.pron} (aprox.)`),
          v.consejo && el('p', { class: 'aprox consejo' }, `🗣 ${v.consejo}`)),
        el('div', { class: 'frase-acciones' },
          botonEscuchar(v.da),
          botonGuardar({ da: v.da, es: v.es, pron: v.pron, nota: v.nota || v.consejo, tipo: v.da.includes(' ') ? 'frase' : 'palabra', origen: 'Diccionario' }))))
      : el('li', { class: 'aprox' }, 'No está en el curso todavía.'));
  });
  const alCambiar = () => {
    if (!entrada.isConnected) window.removeEventListener('cuaderno-cambiado', alCambiar);
    else alGuardar();
  };
  window.addEventListener('cuaderno-cambiado', alCambiar);
  return el('details', { class: 'caja' },
    el('summary', {}, '🔎 Diccionario: busca cualquier palabra del curso'),
    el('div', { class: 'campo' }, el('label', { for: 'buscar-dic' }, 'En polaco o en español'), entrada),
    resultados);
}

export function pintarCuaderno(app) {
  const listaEl = el('ul', { class: 'lista-cuaderno' });
  const resumenEl = el('p', { class: 'resumen-cuaderno' });

  function repintar() {
    const todas = tarjetas().sort((a, b) => b.creada - a.creada);
    const q = busqueda.trim().toLocaleLowerCase('es');
    const visibles = todas.filter(t =>
      (filtro === 'todas' || t.tipo === filtro)
      && (!q || t.da.toLocaleLowerCase('pl').includes(q) || t.es.toLocaleLowerCase('es').includes(q)));

    const pendientes = todas.filter(t => tocaRepasar(t.srs)).length;
    const nuevas = todas.filter(t => esNueva(t.srs)).length;
    resumenEl.textContent = `${todas.length} en total · ${nuevas} nuevas · ${pendientes} para repasar hoy`;

    if (!todas.length) {
      poner(listaEl, el('li', { class: 'caja vacio' },
        el('p', {}, 'Tu cuaderno está vacío.'),
        el('p', {}, 'Guarda palabras con la estrella ☆ en las lecciones o en «Frases».')));
    } else if (!visibles.length) {
      poner(listaEl, el('li', { class: 'caja vacio' }, 'No hay nada que coincida con la búsqueda.'));
    } else {
      poner(listaEl, visibles.map(t => tarjeta(t, repintar)));
    }
  }

  const buscador = el('input', {
    id: 'buscar', type: 'search', value: busqueda, placeholder: 'Buscar en polaco o en español', autocomplete: 'off',
  });
  buscador.addEventListener('input', () => { busqueda = buscador.value; repintar(); });

  const filtros = el('div', { class: 'filtros', role: 'group', 'aria-label': 'Mostrar' },
    FILTROS.map(f => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(f.clave === filtro) }, f.texto);
      b.addEventListener('click', () => {
        filtro = f.clave;
        filtros.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        repintar();
      });
      return b;
    }));

  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, 'Cuaderno'),
      el('p', {}, 'Todo lo que has guardado para aprender. Lo repasarás en «Repaso».'),
      resumenEl,
      el('a', { class: 'boton boton-principal', href: '#/repaso' }, 'Ir al repaso ▶')),
    el('div', { class: 'barra-herramientas' },
      el('div', { class: 'campo' }, el('label', { for: 'buscar' }, 'Buscar'), buscador),
      filtros),
    buscadorDiccionario(repintar),
    listaEl,
    formularioNueva(repintar));

  repintar();
  const total = tarjetas().length;
  decir(total
    ? `Tienes ${total} ${total === 1 ? 'cosa guardada' : 'cosas guardadas'} en tu cuaderno. ¡Así me gusta, todo bien ordenado!`
    : 'Tu cuaderno está vacío. Cuando veas una palabra interesante, pulsa la estrella y la guardaré aquí.');
}
