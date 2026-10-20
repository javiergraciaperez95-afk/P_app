// Pantalla «Lecciones»: el camino. Cada capítulo es un tramo con su cartel, y cada lección una parada redonda
// que serpentea de un lado a otro; las paradas se unen con un caminito de puntos. Lucía espera en la siguiente
// lección que toca, y al final de cada capítulo hay un cofre que solo se abre al terminarlo.
// Al tocar una parada sale su ficha (título, avance y el botón para entrar). Nada se completa solo: el camino solo
// enseña por dónde vas.

import { el, poner } from '../dom.js';
import { t, tr } from '../i18n.js';
import { resumenLeccion, hayProgreso, nombre, actividadDeHoy, racha, inicioDePrueba } from '../progress.js';
import { pendientesDeHoy } from '../cabecera.js';
import { decir } from '../tutor.js';
import { sonar } from '../sonidos.js';
import { LANG, clave, curso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { avanceJuego, estrellasDe } from '../../juegos/motor.js';
import { confeti } from '../fiesta.js';
import { diccionarioCompleto } from './leccion.js';
import { botonEscuchar, botonGuardar } from '../comunes.js';
import { origenTarjeta } from '../i18n.js';
import { LOGROS, logrosGanados } from '../logros.js';
import { tarjetas } from '../progress.js';
import { enlaceReto } from './reto.js';
import { esMovil } from '../paginas-movil.js';

export function tarjetaError(error, archivo) {
  return el('section', { class: 'caja tarjeta-error', role: 'alert' },
    el('h2', {}, `⚠ ${error.titulo}`),
    archivo && el('p', {}, `${t('error.archivo')}: `, el('code', {}, archivo)),
    el('ul', {}, error.detalles.map(d => el('li', {}, typeof d === 'string' ? d : el('code', {}, d.codigo)))),
    el('p', { class: 'aprox' }, t('error.restoFunciona')));
}

/** Agrupa por «capitulo». Las lecciones sin capítulo van al final. */
export function agrupar(resultados, capitulos) {
  const grupos = new Map();
  for (const c of capitulos) grupos.set(String(c.numero), { capitulo: c, lecciones: [] });
  for (const r of resultados) {
    const clave = r.leccion?.capitulo != null ? String(r.leccion.capitulo) : 'sin';
    if (!grupos.has(clave)) grupos.set(clave, { capitulo: clave === 'sin' ? null : { numero: clave }, lecciones: [] });
    grupos.get(clave).lecciones.push(r);
  }
  for (const grupo of grupos.values()) {
    grupo.lecciones.sort((a, b) =>
      Number(a.leccion?.numero_curso ?? a.id) - Number(b.leccion?.numero_curso ?? b.id));
  }
  const lista = [...grupos.values()].filter(g => g.lecciones.length);
  // Respeta el orden de la metadata; después coloca capítulos sin metadata y, al final, las lecciones sin capítulo.
  const orden = new Map(capitulos.map((c, i) => [String(c.numero), i]));
  const peso = g => {
    if (!g.capitulo) return [3, 0];
    const clave = String(g.capitulo.numero);
    if (orden.has(clave)) return [0, orden.get(clave)];
    return /^\d+$/.test(clave) ? [1, Number(clave)] : [2, 0];
  };
  return lista
    .map((g, i) => ({ g, i, p: peso(g) }))
    .sort((a, b) => a.p[0] - b.p[0] || a.p[1] - b.p[1] || a.i - b.i)
    .map(x => x.g);
}

// ---------------------------------------------------------------------------
// Lo que se recuerda en este dispositivo
// ---------------------------------------------------------------------------

// Capítulos abiertos o cerrados a mano: { "3": true, "4": false }. Si no se ha tocado, solo está abierto el de la
// lección que toca (y los que ya tienen algo empezado sin terminar).
const CLAVE_ABIERTOS = clave('camino-abiertos');
// Cofres ya abiertos (para celebrarlo solo la primera vez).
const CLAVE_COFRES = clave('cofres');
// Último día con las misiones completas (para celebrarlo una sola vez al día).
const CLAVE_DIA = clave('dia-completo');

const leer = (k, vacio) => { try { return JSON.parse(localStorage.getItem(k)) ?? vacio; } catch { return vacio; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

// ---------------------------------------------------------------------------
// El estado de cada lección
// ---------------------------------------------------------------------------

/** Estado y avance (0–1) de una lección, juntando el modo juego y el modo libro. */
function estadoDe(leccion) {
  const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
  const juego = avanceJuego(leccion.id);
  const hechosJuego = juego.hechos?.length ?? 0;
  // «total» cuenta también la meta (el último paso, sin juego)
  const totalJuego = juego.total ? juego.total : 0;
  let avance = 0;
  if (r.terminada) avance = 1;
  else if (totalJuego) avance = Math.min(hechosJuego / totalJuego, 0.95);
  else if (r.total) avance = Math.min(r.completados / r.total, 0.95);
  const estado = r.terminada ? 'terminada' : (avance > 0 || r.estado === 'curso') ? 'curso' : 'nueva';
  return { estado, avance, pasos: totalJuego ? { hechos: hechosJuego, total: totalJuego } : null };
}

// Cada parada se separa del centro siguiendo una ola suave: -1 … 1.
const OLA = i => Math.round(Math.sin(i * 0.95) * 100) / 100;

// ---------------------------------------------------------------------------
// La pantalla
// ---------------------------------------------------------------------------

export function pintarLecciones(app, { resultados, capitulos, errorCapitulos }) {
  const grupos = agrupar(resultados, capitulos);
  const apagar = [];
  const validas = grupos.flatMap(g => g.lecciones.filter(r => r.leccion));
  const estados = new Map(validas.map(r => [r.leccion.id, estadoDe(r.leccion)]));
  const terminadas = validas.filter(r => estados.get(r.leccion.id).estado === 'terminada').length;
  // La lección que toca: la primera sin terminar, en el orden del curso (desde donde dijo la prueba de nivel, si se hizo).
  const sinTerminar = r => estados.get(r.leccion.id).estado !== 'terminada';
  const desde = Math.max(0, validas.findIndex(r => r.leccion.id === inicioDePrueba()));
  const toca = (validas.slice(desde).find(sinTerminar) ?? validas.find(sinTerminar))?.leccion ?? null;
  const capituloToca = toca ? String(toca.capitulo ?? 'sin') : null;
  // la lección que se acaba de terminar (la pone el modo juego): su parada lo celebra una vez
  let recien = null;
  try { recien = sessionStorage.getItem('paglot-recien'); sessionStorage.removeItem('paglot-recien'); } catch { /* sin almacenamiento */ }

  // ----- La ficha que sale al tocar una parada (solo una abierta a la vez) -----
  let fichaAbierta = null;
  const cerrarFicha = () => {
    if (!fichaAbierta) return;
    fichaAbierta.parada.classList.remove('con-ficha');
    fichaAbierta.ficha.remove();
    fichaAbierta.nodo.setAttribute('aria-expanded', 'false');
    fichaAbierta = null;
  };
  const alPulsarFuera = e => { if (fichaAbierta && !fichaAbierta.parada.contains(e.target)) cerrarFicha(); };
  const alTeclear = e => { if (e.key === 'Escape' && fichaAbierta) { const n = fichaAbierta.nodo; cerrarFicha(); n.focus(); } };
  document.addEventListener('pointerdown', alPulsarFuera);
  document.addEventListener('keydown', alTeclear);
  apagar.push(() => { document.removeEventListener('pointerdown', alPulsarFuera); document.removeEventListener('keydown', alTeclear); });

  function abrirFicha(parada, nodo, leccion) {
    if (fichaAbierta?.nodo === nodo) { cerrarFicha(); return; }
    cerrarFicha();
    const e = estados.get(leccion.id);
    const texto = { nueva: 'camino.empezar', curso: 'camino.seguir', terminada: 'camino.repetir' }[e.estado];
    const libro = () => { try { localStorage.setItem('idiomas-modo-leccion', 'libro'); } catch { /* sin almacenamiento */ } };
    const juego = () => { try { localStorage.removeItem('idiomas-modo-leccion'); } catch { /* sin almacenamiento */ } };
    const ficha = el('div', { class: `cm-ficha es-${e.estado}`, role: 'dialog', 'aria-label': leccion.titulo_es },
      el('p', { class: 'cm-ficha-num' }, t('leccion.numero', { id: leccion.numero_curso })),
      el('p', { class: 'cm-ficha-es', lang: LANG }, leccion.titulo_es),
      leccion.titulo && el('p', { class: 'cm-ficha-trad' }, tr(leccion.titulo)),
      el('div', { class: 'cm-ficha-avance' },
        el('span', { class: 'cm-ficha-barra', 'aria-hidden': 'true' }, el('span', { style: `--avance:${e.avance}` })),
        el('span', { class: 'cm-ficha-estado' },
          e.estado === 'terminada' ? `✔ ${t('estado.terminada')}`
            : e.pasos ? t('camino.pasos', e.pasos) : t(`estado.${e.estado}`))),
      el('div', { class: 'cm-ficha-botones' },
        el('a', { class: 'es-boton cm-ficha-entrar', href: `#/leccion/${leccion.id}`, 'data-sonido': 'puerta', onclick: juego }, t(texto)),
        el('a', { class: 'es-boton es-boton-papel cm-ficha-libro', href: `#/leccion/${leccion.id}`, onclick: libro }, t('juego.verLibro'))));
    parada.classList.add('con-ficha');
    parada.append(ficha);
    nodo.setAttribute('aria-expanded', 'true');
    fichaAbierta = { parada, nodo, ficha };
    // que la ficha se vea entera sin tener que buscarla
    requestAnimationFrame(() => {
      const caja = ficha.getBoundingClientRect();
      if (caja.bottom > innerHeight - 8 || caja.top < 70) ficha.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  // ----- Lucía, esperando en la lección que toca -----
  const lucia = crearLucia(apagar);

  // ----- Un tramo por capítulo -----
  let indiceGlobal = 0;
  const movil = esMovil();
  let irADiapo = () => {};
  const abiertosGuardados = leer(CLAVE_ABIERTOS, {});
  const cofres = new Set(leer(CLAVE_COFRES, []));

  function tramo({ capitulo, lecciones }) {
    const buenas = lecciones.filter(r => r.leccion);
    const hechas = buenas.filter(r => estados.get(r.leccion.id).estado === 'terminada').length;
    const empezado = buenas.some(r => estados.get(r.leccion.id).estado === 'curso');
    const claveCap = capitulo ? String(capitulo.numero) : 'sin';
    const completo = buenas.length > 0 && hechas === buenas.length;
    const abierto = abiertosGuardados[claveCap] ?? (claveCap === capituloToca || (empezado && !completo));
    const numerico = capitulo && /^\d+$/.test(String(capitulo.numero));
    const nivel = capitulo?.nivel ?? '';
    const nombreCap = tr(capitulo?.titulo)?.replace(/^[ABC][12]\s*·\s*/, '') || capitulo?.nombre || '';

    const lista = el('ol', { class: 'cm-camino', id: `cm-cap-${claveCap}` });
    const raiz = el('section', { class: `cm-tramo nivel-${nivel.toLowerCase() || 'x'}${completo ? ' completo' : ''}` });
    const boton = el('button', { type: 'button', class: 'cm-cartel', 'aria-controls': lista.id, 'data-sonido': 'pagina' },
      nivel && el('span', { class: 'cm-nivel' }, nivel),
      el('span', { class: 'cm-cartel-textos' },
        el('span', { class: 'cm-cartel-cap' }, numerico ? t('lecciones.capitulo', { n: capitulo.numero }) : t('lecciones.otras')),
        el('span', { class: 'cm-cartel-titulo' }, nombreCap),
        capitulo?.nombre && el('span', { class: 'cm-cartel-es', lang: LANG }, capitulo.nombre)),
      el('span', { class: 'cm-cartel-cuenta' },
        completo ? el('span', { class: 'cm-cartel-copa', 'aria-hidden': 'true' }, '🏆') : null,
        `${hechas}/${buenas.length}`,
        el('span', { class: 'cm-cartel-barra', 'aria-hidden': 'true' }, el('span', { style: `--avance:${buenas.length ? hechas / buenas.length : 0}` }))),
      el('span', { class: 'cm-cartel-flecha', 'aria-hidden': 'true' }));

    let pintado = false;
    const pintarParadas = () => {
      if (pintado) return;
      pintado = true;
      const inicio = indicesDe.get(claveCap);
      lecciones.forEach((r, k) => {
        if (!r.leccion) { lista.append(el('li', { class: 'cm-parada-error' }, tarjetaError(r.error, r.archivo))); return; }
        const li = parada(r.leccion, inicio + k);
        li.style.setProperty('--i', String(Math.min(k, 14)));
        lista.append(li);
      });
      lista.append(cofre(claveCap, completo, hechas, buenas.length, inicio + lecciones.length, capitulo));
      dibujarSendero(lista);
    };
    const aplicar = (abrir, conSonido = false) => {
      raiz.classList.toggle('plegado', !abrir);
      boton.setAttribute('aria-expanded', String(abrir));
      lista.hidden = !abrir;
      if (abrir) { pintarParadas(); requestAnimationFrame(() => dibujarSendero(lista)); }
      if (conSonido) sonar(abrir ? 'abrir' : 'cerrar');
    };
    boton.addEventListener('click', () => {
      const abrir = lista.hidden;
      const guardados = leer(CLAVE_ABIERTOS, {});
      guardados[claveCap] = abrir;
      escribir(CLAVE_ABIERTOS, guardados);
      aplicar(abrir);
    });
    raiz.append(boton, lista);
    raiz.dataset.cap = claveCap;
    aplicar(movil || abierto);
    return raiz;
  }

  // dónde empieza cada capítulo en la ola (para que el camino siga serpenteando de un capítulo a otro)
  const indicesDe = new Map();
  for (const g of grupos) { indicesDe.set(g.capitulo ? String(g.capitulo.numero) : 'sin', indiceGlobal); indiceGlobal += g.lecciones.length + 1; }

  function parada(leccion, i) {
    const e = estados.get(leccion.id);
    const esToca = toca?.id === leccion.id;
    const x = OLA(i);
    const nodo = el('button', {
      type: 'button',
      class: `cm-nodo es-${e.estado}${esToca ? ' toca' : ''}`,
      style: `--avance:${e.avance}`,
      'aria-expanded': 'false',
      'data-id': leccion.id,
      'aria-label': `${t('leccion.numero', { id: leccion.numero_curso })}: ${leccion.titulo_es}${leccion.titulo ? ` (${tr(leccion.titulo)})` : ''} · ${t(`estado.${e.estado}`)}`,
      'data-sonido': 'burbuja',
    },
    el('span', { class: 'cm-nodo-anillo', 'aria-hidden': 'true' }),
    el('span', { class: 'cm-nodo-cara', 'aria-hidden': 'true' },
      e.estado === 'terminada' ? el('span', { class: 'cm-nodo-estrella' }, '★') : el('span', { class: 'cm-nodo-num' }, leccion.numero_curso)));
    const etiqueta = el('span', { class: 'cm-etiqueta', 'aria-hidden': 'true' },
      el('span', { class: 'cm-etiqueta-es', lang: LANG }, leccion.titulo_es),
      leccion.titulo && el('span', { class: 'cm-etiqueta-trad' }, tr(leccion.titulo)));
    const n = e.estado === 'terminada' ? estrellasDe(leccion.id) : 0;
    const estrellas = n ? el('span', { class: 'cm-estrellas', 'aria-hidden': 'true' },
      [1, 2, 3].map(k => el('span', { class: k <= n ? 'ganada' : '' }, '★'))) : null;
    if (n) nodo.setAttribute('aria-label', `${nodo.getAttribute('aria-label')} · ${t('jg.fin.estrellas', { n })}`);
    const li = el('li', { class: `cm-parada${x < 0 ? ' a-la-izq' : ''}`, style: `--x:${x}` }, nodo, estrellas, etiqueta);
    if (recien === leccion.id && e.estado === 'terminada') {
      li.classList.add('recien');
      setTimeout(() => { sonar('moneda'); lucia.felicitar(); }, 700);
    }
    if (esToca) {
      li.classList.add('es-toca');
      li.append(el('span', { class: 'cm-aqui', 'aria-hidden': 'true' }, t('camino.aqui')), lucia.figura);
      lucia.colocar(li, x);
    }
    nodo.addEventListener('click', () => abrirFicha(li, nodo, leccion));
    return li;
  }

  function cofre(claveCap, completo, hechas, total, i, capitulo) {
    const yaAbierto = cofres.has(claveCap);
    const boton = el('button', {
      type: 'button',
      class: `cm-cofre${completo ? ' listo' : ''}${completo && yaAbierto ? ' abierto' : ''}`,
      'aria-label': completo ? t('camino.cofreListo') : t('camino.cofreCerrado', { faltan: total - hechas }),
      'data-sonido': completo ? 'caja' : 'nada',
    }, el('span', { class: 'cm-cofre-dibujo', 'aria-hidden': 'true' }, dibujoCofre()),
    el('span', { class: 'cm-cofre-texto' }, completo ? (yaAbierto ? t('camino.cofreAbierto') : t('camino.cofreListo')) : `🔒 ${hechas}/${total}`));
    boton.addEventListener('click', () => {
      if (!completo) {
        boton.classList.remove('tiembla'); void boton.offsetWidth; boton.classList.add('tiembla');
        decir(t('camino.cofreCerradoTutora', { faltan: total - hechas }), 'pensando', { abrir: true });
        return;
      }
      if (!boton.classList.contains('abierto')) {
        boton.classList.add('abierto', 'estalla');
        cofres.add(claveCap);
        escribir(CLAVE_COFRES, [...cofres]);
        window.dispatchEvent(new CustomEvent('cofre-abierto', { detail: { capitulo: claveCap } }));
        sonar('fanfarria');
        setTimeout(() => sonar('moneda'), 450);
        confeti(boton);
        lucia.celebrar();
        decir(t('camino.cofreTutora', { n: capitulo?.numero ?? '' }), 'contenta', { abrir: true });
      } else {
        boton.classList.remove('estalla'); void boton.offsetWidth; boton.classList.add('estalla');
        sonar('moneda');
        confeti(boton, 14);
      }
    });
    return el('li', { class: 'cm-parada cm-parada-cofre', style: `--x:${OLA(i)}` }, boton);
  }

  // ----- Un capítulo terminado con su cofre aún cerrado: se avisa en el panel -----
  function avisoCofre() {
    const pendiente = grupos.find(g => {
      const buenas = g.lecciones.filter(r => r.leccion);
      return g.capitulo && buenas.length && buenas.every(r => estados.get(r.leccion.id).estado === 'terminada') && !cofres.has(String(g.capitulo.numero));
    });
    if (!pendiente) return null;
    const claveCap = String(pendiente.capitulo.numero);
    const aviso = el('button', { type: 'button', class: 'cm-extra cm-extra-cofre', 'data-sonido': 'caja' },
      el('span', { class: 'cm-extra-icono', 'aria-hidden': 'true' }, '🧰'),
      el('span', { class: 'cm-extra-titulo' }, t('camino.cofrePendiente')),
      el('span', { class: 'cm-extra-texto' }, t('camino.cofrePendienteTexto', { n: pendiente.capitulo.numero })));
    aviso.addEventListener('click', () => {
      irADiapo(claveCap);
      const lista = document.getElementById(`cm-cap-${claveCap}`);
      if (lista?.hidden) lista.previousElementSibling?.click();
      requestAnimationFrame(() => {
        const cofreBoton = lista?.querySelector('.cm-cofre');
        cofreBoton?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        cofreBoton?.classList.remove('estalla'); void cofreBoton?.offsetWidth; cofreBoton?.classList.add('estalla');
      });
    });
    return aviso;
  }

  // ----- Arriba: cuánto llevas y el botón para ir a lo que toca -----
  const total = validas.length;
  const cabecera = el('section', { class: 'cm-cabecera' },
    el('div', { class: 'cm-cabecera-textos' },
      el('h1', {}, t('menu.lecciones')),
      el('p', { class: 'cm-cabecera-dato' }, t('camino.llevas', { hechas: terminadas, total })),
      el('span', { class: 'cm-cabecera-barra', 'aria-hidden': 'true' }, el('span', { style: `--avance:${total ? terminadas / total : 0}` }))),
    buscador(),
    toca && el('button', { type: 'button', class: 'es-boton cm-ir', 'data-sonido': 'flecha', onclick: () => irALoQueToca(true) },
      t('camino.irA', { n: toca.numero_curso })));

  // ----- Buscar una lección por su título (en español o traducido) o por su número -----
  function irALeccion(id) {
    const r = validas.find(x => x.leccion.id === id);
    if (!r) return;
    irADiapo(String(r.leccion.capitulo ?? 'sin'));
    const cap = document.getElementById(`cm-cap-${String(r.leccion.capitulo ?? 'sin')}`);
    if (cap?.hidden) cap.previousElementSibling?.click();
    requestAnimationFrame(() => {
      const nodo = app.querySelector(`.cm-nodo[data-id="${id}"]`);
      if (!nodo) return;
      nodo.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      nodo.classList.remove('llama'); void nodo.offsetWidth; nodo.classList.add('llama');
      setTimeout(() => { if (fichaAbierta?.nodo !== nodo) nodo.click(); }, 550);
    });
  }
  function buscador() {
    const sinTildes = x => String(x ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    const campo = el('input', { type: 'search', class: 'cm-buscar-campo', placeholder: t('camino.buscar'), 'aria-label': t('camino.buscar'), autocomplete: 'off' });
    const lista = el('ul', { class: 'cm-buscar-lista', role: 'listbox', hidden: true });
    const caja = el('div', { class: 'cm-buscar' }, el('span', { class: 'cm-buscar-lupa', 'aria-hidden': 'true' }), campo, lista);
    const cerrar = () => { lista.hidden = true; };
    campo.addEventListener('input', () => {
      const q = sinTildes(campo.value.trim());
      if (q.length < 2 && !/^\d+$/.test(q)) { cerrar(); return; }
      const encontradas = validas.map(r => r.leccion).filter(l =>
        String(l.numero_curso) === q || sinTildes(l.titulo_es).includes(q) || sinTildes(tr(l.titulo)).includes(q)).slice(0, 8);
      poner(lista, encontradas.length
        ? encontradas.map(l => {
          const e = estados.get(l.id);
          const b = el('button', { type: 'button', class: `cm-buscar-item es-${e.estado}`, role: 'option', 'data-sonido': 'flecha' },
            el('span', { class: 'cm-buscar-num' }, e.estado === 'terminada' ? '★' : l.numero_curso),
            el('span', { class: 'cm-buscar-textos' },
              el('span', { class: 'cm-buscar-es', lang: LANG }, l.titulo_es),
              l.titulo && el('span', { class: 'cm-buscar-trad' }, tr(l.titulo))));
          b.addEventListener('click', () => { cerrar(); campo.value = ''; irALeccion(l.id); });
          return el('li', {}, b);
        })
        : el('li', { class: 'cm-buscar-nada' }, t('camino.buscarNada')));
      lista.hidden = false;
    });
    campo.addEventListener('keydown', e => {
      if (e.key === 'Escape') { cerrar(); campo.blur(); }
      if (e.key === 'Enter') { e.preventDefault(); lista.querySelector('button')?.click(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); lista.querySelector('button')?.focus(); }
    });
    lista.addEventListener('keydown', e => {
      const botones = [...lista.querySelectorAll('button')];
      const i = botones.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); botones[Math.min(i + 1, botones.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? campo : botones[i - 1]).focus(); }
      if (e.key === 'Escape') { cerrar(); campo.focus(); }
    });
    const fuera = e => { if (!caja.contains(e.target)) cerrar(); };
    document.addEventListener('pointerdown', fuera);
    apagar.push(() => document.removeEventListener('pointerdown', fuera));
    return caja;
  }

  // ----- Las misiones de hoy: una lección, un repaso y una lección de 3 estrellas -----
  const misiones = misionesDeHoy({ irALeccion: () => irALoQueToca(true) });

  // botón flotante: aparece cuando la lección que toca no está a la vista
  const flotante = toca ? el('button', { type: 'button', class: 'cm-flotante', hidden: true, 'data-sonido': 'flecha', onclick: () => irALoQueToca(true) }) : null;

  function irALoQueToca(conFicha = false, suave = true) {
    if (!toca) return;
    irADiapo(capituloToca);
    const cap = document.getElementById(`cm-cap-${capituloToca}`);
    if (cap?.hidden) cap.previousElementSibling?.click();
    const nodo = app.querySelector('.cm-nodo.toca');
    if (!nodo) return;
    nodo.scrollIntoView({ block: 'center', behavior: suave && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    nodo.classList.remove('llama'); void nodo.offsetWidth; nodo.classList.add('llama');
    if (conFicha) setTimeout(() => { if (!fichaAbierta) nodo.click(); }, 550);
  }

  // el panel: en pantalla ancha va al lado del mapa y se queda fijo; en el móvil, encima, con las tarjetas en una
  // tira que se desliza de lado
  const lado = el('aside', { class: 'cm-lado' },
    cabecera,
    misiones,
    el('div', { class: 'cm-extras' }, tarjetaPrueba(terminadas), avisoCofre(), tarjetaRepaso(), enlaceReto(), tarjetaPalabra(apagar), tarjetaLogros()));

  poner(app, el('div', { class: 'cm-pantalla' },
    lado,
    el('div', { class: 'cm-principal' },
    resultados.sinConexion && el('section', { class: 'caja tarjeta-error', role: 'alert' },
      el('h2', {}, t('app.sinConexionTitulo')),
      el('p', {}, t('app.sinConexionTexto')),
      el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))),
    errorCapitulos && tarjetaError(errorCapitulos, 'lessons/capitulos.json'),
    grupos.length
      ? el('div', { class: 'cm-mapa' }, grupos.map(tramo))
      : el('p', { class: 'caja' }, t('lecciones.ninguna')))),
    flotante);

  // ----- En el móvil: un capítulo por pantalla (el panel es la primera), con ◀ ▶ y deslizando de lado -----
  if (movil) {
    const pantalla = app.querySelector('.cm-pantalla');
    const diapos = [lado, ...app.querySelectorAll('.cm-tramo')];
    let actual = 0;
    pantalla.classList.add('cm-diapos');
    document.documentElement.classList.add('pm-activo');
    if (flotante) flotante.remove();
    const titulo = el('b', { class: 'cm-diapo-num' });
    const atras = el('button', { type: 'button', class: 'pm-atras', 'aria-label': t('idi.anterior'), onclick: () => mostrar(actual - 1) }, '◀');
    const alante = el('button', { type: 'button', class: 'pm-alante', 'aria-label': t('idi.siguiente'), onclick: () => mostrar(actual + 1) }, '▶');
    // el número del centro abre la lista de capítulos: con veintitantos, ir de uno en uno sería eterno
    const indice = el('ol', { class: 'cm-indice', hidden: true, 'aria-label': t('lecciones.capitulos') },
      diapos.map((d, i) => el('li', {}, el('button', { type: 'button', onclick: () => { cerrarIndice(); mostrar(i); } },
        el('b', {}, i === 0 ? '★' : d.dataset?.cap && /^\d+$/.test(d.dataset.cap) ? d.dataset.cap : String(i)),
        el('span', {}, i === 0 ? t('camino.misionesTitulo') : d.querySelector('.cm-cartel-titulo')?.textContent ?? ''),
        i > 0 ? el('small', {}, d.querySelector('.cm-cartel-cuenta')?.textContent ?? '') : null))));
    const abrirIndice = el('button', {
      type: 'button', class: 'cm-diapo-boton', 'aria-expanded': 'false', title: t('lecciones.elegirCapitulo'),
      onclick: () => (indice.hidden ? abrir() : cerrarIndice()),
    }, titulo, el('span', { 'aria-hidden': 'true' }, ' ▴'));
    function abrir() {
      [...indice.children].forEach((li, i) => li.firstChild.setAttribute('aria-current', String(i === actual)));
      indice.hidden = false;
      abrirIndice.setAttribute('aria-expanded', 'true');
      sonar('abrir');
      indice.children[actual]?.scrollIntoView({ block: 'center' });
      indice.children[actual]?.firstChild.focus({ preventScroll: true });
    }
    function cerrarIndice() {
      if (indice.hidden) return;
      indice.hidden = true;
      abrirIndice.setAttribute('aria-expanded', 'false');
    }
    const fueraDelIndice = e => { if (!nav.contains(e.target)) cerrarIndice(); };
    const escape = e => { if (e.key === 'Escape' && !indice.hidden) { cerrarIndice(); abrirIndice.focus(); } };
    document.addEventListener('pointerdown', fueraDelIndice);
    document.addEventListener('keydown', escape);
    const nav = el('nav', { class: 'pm-nav', 'aria-label': t('menu.lecciones') }, atras, el('span', { class: 'pm-puntos' }, abrirIndice), alante, indice);
    document.body.append(nav);
    const medir = () => {
      pantalla.style.setProperty('--cm-alto',
        `${Math.max(200, innerHeight - pantalla.getBoundingClientRect().top - window.scrollY - nav.offsetHeight - 10)}px`);
      // la tutora flotante tapa el final de la lista: se deja ese hueco abajo, dentro de lo que se desliza
      const tutora = document.querySelector('.tutora');
      const tapa = tutora?.offsetHeight && !document.body.matches('.tutora-oculta, .sin-tutora')
        ? Math.max(0, pantalla.getBoundingClientRect().bottom - tutora.getBoundingClientRect().top + 8) : 0;
      pantalla.style.setProperty('--cm-hueco', `${Math.round(tapa)}px`);
    };
    function mostrar(n, sentido) {
      n = Math.max(0, Math.min(diapos.length - 1, n));
      const dir = sentido ?? (n >= actual ? 'der' : 'izq');
      const cambia = n !== actual;
      actual = n;
      diapos.forEach((d, i) => d.classList.toggle('pm-oculto', i !== n));
      const d = diapos[n];
      if (cambia) { cerrarFicha(); d.classList.remove('pm-entra-der', 'pm-entra-izq'); void d.offsetWidth; d.classList.add(`pm-entra-${dir}`); sonar('pagina'); }
      atras.disabled = n === 0;
      alante.disabled = n === diapos.length - 1;
      titulo.textContent = n === 0 ? '★' : `${n}/${diapos.length - 1}`;
      medir();
      const lista = d.querySelector('.cm-camino');
      if (lista) requestAnimationFrame(() => dibujarSendero(lista));
    }
    irADiapo = clave => { const i = diapos.findIndex(d => d.dataset?.cap === clave); if (i >= 0 && i !== actual) mostrar(i); };
    let x0 = null, y0 = 0;
    const empieza = e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
    const acaba = e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) mostrar(actual + (dx < 0 ? 1 : -1));
    };
    pantalla.addEventListener('touchstart', empieza, { passive: true });
    pantalla.addEventListener('touchend', acaba, { passive: true });
    addEventListener('resize', medir);
    const inicial = diapos.findIndex(d => d.dataset?.cap === capituloToca);
    actual = -1;
    mostrar(inicial > 0 ? inicial : (diapos.length > 1 ? 1 : 0), 'der');
    apagar.push(() => {
      removeEventListener('resize', medir);
      document.removeEventListener('pointerdown', fueraDelIndice);
      document.removeEventListener('keydown', escape);
      nav.remove();
      document.documentElement.classList.remove('pm-activo');
    });
  }

  // el caminito de puntos se recoloca si cambia el ancho
  if ('ResizeObserver' in window) {
    const vigia = new ResizeObserver(() => app.querySelectorAll('.cm-camino:not([hidden])').forEach(dibujarSendero));
    vigia.observe(app);
    apagar.push(() => vigia.disconnect());
  }

  // el flotante dice hacia dónde está la lección (arriba o abajo) y solo sale si no se ve
  if (flotante && 'IntersectionObserver' in window) {
    const nodo = app.querySelector('.cm-nodo.toca');
    const pintarFlotante = (visible, arriba) => {
      flotante.hidden = visible;
      poner(flotante, el('span', { 'aria-hidden': 'true' }, arriba ? '▲' : '▼'), ' ', t('camino.flotante', { n: toca.numero_curso }));
    };
    if (nodo) {
      const vigia = new IntersectionObserver(([e]) => pintarFlotante(e.isIntersecting, e.boundingClientRect.top < 0));
      vigia.observe(nodo);
      apagar.push(() => vigia.disconnect());
    } else {
      pintarFlotante(false, false);
    }
  }

  // al llegar, el camino se abre por donde vas
  if (toca && hayProgreso()) requestAnimationFrame(() => irALoQueToca(false, false));

  const quien = nombre() ? `, ${nombre()}` : '';
  decir(hayProgreso()
    ? t('lecciones.vuelta', { quien })
    : t(grupos.length ? 'lecciones.saludo' : 'lecciones.saludoSinLecciones'));

  return () => { cerrarFicha(); for (const f of apagar) f(); };
}

// ---------------------------------------------------------------------------
// Piezas
// ---------------------------------------------------------------------------

/** Lo que toca repasar hoy, con su botón. */
/** La prueba de nivel, mientras se está empezando (menos de tres lecciones terminadas). */
function tarjetaPrueba(terminadas) {
  if (terminadas >= 3) return null;
  return el('a', { class: 'cm-extra cm-extra-prueba', href: '#/prueba', 'data-sonido': 'pagina' },
    el('span', { class: 'cm-extra-icono', 'aria-hidden': 'true' }, '🧭'),
    el('span', { class: 'cm-extra-titulo' }, t('prueba.anuncio')),
    el('span', { class: 'cm-extra-texto' }, t('prueba.anuncioTexto')));
}

function tarjetaRepaso() {
  const n = pendientesDeHoy();
  const total = tarjetas().length;
  return el('a', { class: `cm-extra cm-extra-repaso${n ? '' : ' al-dia'}`, href: '#/repaso', 'data-sonido': 'voltear' },
    el('span', { class: 'cm-extra-icono', 'aria-hidden': 'true' }, !total ? '📒' : n ? '🃏' : '✅'),
    el('span', { class: 'cm-extra-titulo' }, t('menu.repaso')),
    el('span', { class: 'cm-extra-texto' }, !total ? t('camino.repasoVacio') : n ? t('camino.repasoPendiente', { n }) : t('camino.repasoAlDia')));
}

/** Los logros: cuántos hay y el último ganado. */
function tarjetaLogros() {
  const ganados = logrosGanados();
  const lista = LOGROS.filter(l => ganados[l.id]).sort((a, b) => ganados[b.id] - ganados[a.id]);
  const ultimo = lista[0];
  return el('a', { class: 'cm-extra cm-extra-logros', href: '#/perfil', 'data-sonido': 'moneda' },
    el('span', { class: 'cm-extra-icono', 'aria-hidden': 'true' }, ultimo?.icono ?? '🏅'),
    el('span', { class: 'cm-extra-titulo' }, t('logros.titulo'), ' ', el('b', {}, `${lista.length}/${LOGROS.length}`)),
    el('span', { class: 'cm-extra-texto' }, ultimo ? t('camino.ultimoLogro', { nombre: t(`logros.${ultimo.id}.nombre`) }) : t('camino.sinLogros')));
}

/**
 * La palabra del día: una tarjeta que se gira al tocarla. Sale del cuaderno si hay palabras (para no olvidarlas);
 * si no, del diccionario del curso. Es la misma todo el día.
 */
function tarjetaPalabra(apagar) {
  const caja = el('div', { class: 'cm-extra cm-extra-palabra' });
  const semilla = [...new Date().toLocaleDateString('sv')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const elegir = () => {
    const propias = tarjetas().filter(c => c.es && !/\s/.test(c.es.trim()) && tr(c.trad));
    if (propias.length >= 5) {
      const c = [...propias].sort((a, b) => a.es.localeCompare(b.es))[semilla % propias.length];
      return { es: c.es, trad: tr(c.trad), pron: c.pron, ficha: { es: c.es, trad: c.trad, pron: c.pron, tipo: 'palabra' } };
    }
    const dic = [...diccionarioCompleto().values()].filter(e => e.trad && !e.oculta && /^[\p{L}]{4,10}$/u.test(e.es));
    if (!dic.length) return null;
    dic.sort((a, b) => a.es.localeCompare(b.es));
    const e = dic[semilla % dic.length];
    return { es: e.es, trad: tr(e.trad), pron: e.pron, ficha: { es: e.es, trad: e.trad, pron: e.pron, nota: e.consejo, tipo: 'palabra', origen: origenTarjeta('cuaderno.diccionario') } };
  };
  const pintar = p => {
    if (!p) { caja.hidden = true; return; }
    caja.hidden = false;
    const giro = el('button', { type: 'button', class: 'cm-palabra-giro', 'aria-pressed': 'false', 'data-sonido': 'voltear' },
      el('span', { class: 'cm-palabra-cara delante' },
        el('span', { class: 'cm-extra-titulo' }, t('camino.palabraDia')),
        el('span', { class: 'cm-palabra-es', lang: LANG }, p.es),
        el('span', { class: 'cm-extra-texto' }, t('camino.palabraToca'))),
      el('span', { class: 'cm-palabra-cara detras' },
        el('span', { class: 'cm-palabra-es', lang: LANG }, p.es),
        el('span', { class: 'cm-palabra-trad' }, p.trad),
        p.pron && el('span', { class: 'cm-extra-texto' }, `${p.pron} ${t('comun.aprox')}`)));
    giro.addEventListener('click', () => {
      const vuelta = giro.getAttribute('aria-pressed') !== 'true';
      giro.setAttribute('aria-pressed', String(vuelta));
      caja.classList.toggle('girada', vuelta);
    });
    poner(caja, giro, el('span', { class: 'cm-palabra-acciones' }, botonEscuchar(p.es), botonGuardar(p.ficha)));
  };
  const primera = elegir();
  pintar(primera);
  // el diccionario puede estar llegando todavía: se mira otra vez en un momento
  if (!primera) {
    const reloj = setTimeout(() => pintar(elegir()), 1800);
    apagar.push(() => clearTimeout(reloj));
  }
  return caja;
}

/** Las misiones del día, con la racha. Al completarlas todas, confeti (una vez al día). */
function misionesDeHoy({ irALeccion }) {
  const hoy = actividadDeHoy();
  const pendientes = pendientesDeHoy();
  const objetivoRepaso = Math.min(10, (hoy.repasos ?? 0) + pendientes);
  const lista = [
    { id: 'leccion', hecho: (hoy.lecciones ?? 0) >= 1, cuenta: `${Math.min(1, hoy.lecciones ?? 0)}/1`, ir: irALeccion },
    objetivoRepaso > 0
      ? { id: 'repaso', hecho: (hoy.repasos ?? 0) >= objetivoRepaso, cuenta: `${Math.min(objetivoRepaso, hoy.repasos ?? 0)}/${objetivoRepaso}`, ir: () => { location.hash = '#/repaso'; } }
      : null,
    { id: 'estrellas', hecho: (hoy.perfectas ?? 0) >= 1, cuenta: `${Math.min(1, hoy.perfectas ?? 0)}/1`, ir: irALeccion },
  ].filter(Boolean);
  const todas = lista.every(m => m.hecho);
  const dias = racha();
  const fila = m => {
    const boton = el('button', { type: 'button', class: `cm-mision${m.hecho ? ' hecha' : ''}`, 'data-sonido': m.hecho ? 'moneda' : 'flecha' },
      el('span', { class: 'cm-mision-casilla', 'aria-hidden': 'true' }, m.hecho ? '✔' : ''),
      el('span', { class: 'cm-mision-texto' }, t(`camino.mision.${m.id}`)),
      el('span', { class: 'cm-mision-cuenta' }, m.cuenta));
    boton.setAttribute('aria-label', `${t(`camino.mision.${m.id}`)} · ${m.hecho ? t('camino.misionHecha') : m.cuenta}`);
    boton.addEventListener('click', () => {
      if (m.hecho) { decir(t('camino.misionYaHecha'), 'contenta', { abrir: true }); return; }
      m.ir();
    });
    return el('li', {}, boton);
  };
  const panel = el('section', { class: `cm-misiones${todas ? ' completas' : ''}`, 'aria-label': t('camino.misionesTitulo') },
    el('div', { class: 'cm-misiones-cabeza' },
      el('h2', {}, t(todas ? 'camino.diaCompleto' : 'camino.misionesTitulo')),
      el('span', { class: `cm-racha${dias ? ' viva' : ''}`, title: t('camino.racha', { n: dias }) },
        el('span', { 'aria-hidden': 'true' }, '🔥'), ' ', t('camino.racha', { n: dias }))),
    el('ul', { class: 'cm-misiones-lista' }, lista.map(fila)));
  if (todas) {
    const fecha = new Date().toLocaleDateString('sv');
    if (leer(CLAVE_DIA, '') !== fecha) {
      escribir(CLAVE_DIA, fecha);
      setTimeout(() => { sonar('fanfarria'); confeti(panel.querySelector('h2'), 30); decir(t('camino.diaCompletoTutora'), 'contenta'); }, 500);
    }
  }
  return panel;
}

/** El caminito de puntos que une las paradas de un capítulo (un SVG detrás de ellas). */
function dibujarSendero(lista) {
  if (lista.hidden) return;
  const paradas = [...lista.querySelectorAll(':scope > .cm-parada')];
  lista.querySelector(':scope > .cm-sendero')?.remove();
  if (paradas.length < 2) return;
  const caja = lista.getBoundingClientRect();
  if (!caja.width) return;
  const puntos = paradas.map(p => {
    const n = (p.querySelector('.cm-nodo, .cm-cofre') ?? p).getBoundingClientRect();
    return [n.left + n.width / 2 - caja.left, n.top + n.height / 2 - caja.top];
  });
  let d = `M${puntos[0][0].toFixed(1)} ${puntos[0][1].toFixed(1)}`;
  for (let k = 1; k < puntos.length; k++) {
    const [x0, y0] = puntos[k - 1];
    const [x1, y1] = puntos[k];
    const my = (y0 + y1) / 2;
    d += ` C${x0.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  // el tramo ya recorrido (hasta la última parada terminada seguida) va en color
  const hechas = paradas.findIndex(p => !p.querySelector('.cm-nodo.es-terminada, .cm-cofre.listo'));
  const hasta = hechas === -1 ? paradas.length - 1 : Math.max(0, hechas);
  let dHecho = '';
  if (hasta > 0) {
    dHecho = `M${puntos[0][0].toFixed(1)} ${puntos[0][1].toFixed(1)}`;
    for (let k = 1; k <= hasta; k++) {
      const [x0, y0] = puntos[k - 1];
      const [x1, y1] = puntos[k];
      const my = (y0 + y1) / 2;
      dHecho += ` C${x0.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
  }
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'cm-sendero');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', String(Math.ceil(caja.width)));
  svg.setAttribute('height', String(Math.ceil(lista.scrollHeight)));
  // el camino de tierra (borde y tierra, a escalones) y, encima, las piedras: el recorrido va en dorado
  for (const [clase, trazo] of [['cm-sendero-borde', d], ['cm-sendero-tierra', d], ['cm-sendero-base', d], ['cm-sendero-hecho', dHecho]]) {
    if (!trazo) continue;
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', trazo);
    p.setAttribute('class', clase);
    svg.append(p);
  }
  // a los lados del camino, entre parada y parada (donde no hay textos), matas de hierba y alguna flor
  const plantas = document.createElementNS(ns, 'g');
  plantas.setAttribute('class', 'cm-plantas');
  const U = 3; // un píxel del dibujo son 3 de pantalla, como el resto de la escena
  const cuadro = (x, y, w, h, clase) => {
    const r = document.createElementNS(ns, 'rect');
    for (const [k, v] of Object.entries({ x: Math.round(x), y: Math.round(y), width: w * U, height: h * U, class: clase })) r.setAttribute(k, v);
    plantas.append(r);
  };
  for (let k = 1; k < puntos.length; k++) {
    const [x0, y0] = puntos[k - 1];
    const [x1, y1] = puntos[k];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const lado = k % 2 ? 1 : -1; // un lado y el otro, alternando
    const x = mx + lado * 40;
    if (x < 14 || x > caja.width - 14) continue;
    if (k % 3 === 0) { // una flor: tallo, hoja y corola
      cuadro(x, my - U, 1, 4, 'cm-tallo');
      cuadro(x + U, my + U, 1, 1, 'cm-hierba');
      cuadro(x - U, my - 3 * U, 3, 2, k % 2 ? 'cm-flor' : 'cm-flor-b');
      cuadro(x, my - 3 * U, 1, 1, 'cm-flor-centro');
    } else { // una mata: tres hojas de distinto alto
      cuadro(x - 2 * U, my, 1, 3, 'cm-hierba');
      cuadro(x - U, my - 2 * U, 1, 5, 'cm-hierba');
      cuadro(x, my - U, 1, 4, 'cm-hierba-b');
      cuadro(x + U, my + U, 1, 2, 'cm-hierba');
    }
  }
  svg.append(plantas);
  lista.prepend(svg);
}

/** Un cofre de píxeles (tapa y caja; la tapa se levanta con CSS al abrirlo). */
function dibujoCofre() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 16 14');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.innerHTML = // dibujo fijo, sin datos de fuera
    '<g class="cm-cofre-caja"><rect x="1" y="7" width="14" height="6" fill="var(--cofre-madera)"/><rect x="1" y="7" width="14" height="1" fill="var(--cofre-borde)"/>'
    + '<rect x="1" y="12" width="14" height="1" fill="var(--cofre-borde)"/><rect x="1" y="7" width="1" height="6" fill="var(--cofre-borde)"/><rect x="14" y="7" width="1" height="6" fill="var(--cofre-borde)"/>'
    + '<rect x="4" y="7" width="1" height="6" fill="var(--cofre-hierro)"/><rect x="11" y="7" width="1" height="6" fill="var(--cofre-hierro)"/>'
    + '<rect x="7" y="8" width="2" height="3" fill="var(--cofre-cierre)"/></g>'
    + '<g class="cm-cofre-brillo"><rect x="6" y="4" width="4" height="3" fill="#fff6c2"/><rect x="5" y="5" width="6" height="2" fill="#ffe27a"/></g>'
    + '<g class="cm-cofre-tapa"><rect x="1" y="3" width="14" height="4" fill="var(--cofre-madera)"/><rect x="2" y="2" width="12" height="1" fill="var(--cofre-madera)"/>'
    + '<rect x="2" y="2" width="12" height="1" fill="var(--cofre-borde)"/><rect x="1" y="3" width="1" height="4" fill="var(--cofre-borde)"/><rect x="14" y="3" width="1" height="4" fill="var(--cofre-borde)"/>'
    + '<rect x="4" y="2" width="1" height="5" fill="var(--cofre-hierro)"/><rect x="11" y="2" width="1" height="5" fill="var(--cofre-hierro)"/><rect x="7" y="5" width="2" height="2" fill="var(--cofre-cierre)"/></g>';
  return svg;
}

/**
 * Lucía en el camino: espera junto a la lección que toca, hace algún gesto de vez en cuando y, al tocarla,
 * hace el suyo y te anima. Solo se mueve mientras se ve.
 */
function crearLucia(apagar) {
  const canvas = el('canvas', { class: 'cm-lucia-lienzo tutora-lienzo', width: 48, height: 64 });
  const globo = el('span', { class: 'cm-lucia-globo' });
  const figura = el('button', { type: 'button', class: 'cm-lucia', 'aria-label': t('tutora.tocar'), 'data-sonido': 'cosquillas' }, globo, canvas);
  let sprite = null;
  let dibujo = null;
  let viendo = false;
  let reloj = null;
  let relojGlobo = null;
  const GESTOS = ['saludar', 'senalar', 'pulgar', 'asentir', 'mirarLados', 'guino', 'hojear', 'moverPie'];
  const decirGlobo = (texto, ms = 2200) => {
    globo.textContent = texto;
    figura.classList.add('habla');
    clearTimeout(relojGlobo);
    relojGlobo = setTimeout(() => figura.classList.remove('habla'), ms);
  };
  const encender = () => {
    if (!dibujo || sprite) return;
    sprite = dibujo.crearSprite(canvas);
    clearInterval(reloj);
    reloj = setInterval(() => { if (!document.hidden) sprite?.gesto(GESTOS[Math.floor(Math.random() * GESTOS.length)]); }, 4200);
    setTimeout(() => { sprite?.gesto('saludar'); decirGlobo(curso.hola || '¡Hola!'); }, 500);
  };
  const apagarla = () => { clearInterval(reloj); sprite?.parar(); sprite = null; };
  dibujoDe(curso).then(d => { dibujo = d; if (viendo) encender(); }).catch(() => { figura.hidden = true; });
  if ('IntersectionObserver' in window) {
    const vigia = new IntersectionObserver(([e]) => { viendo = e.isIntersecting; if (viendo) encender(); else apagarla(); }, { rootMargin: '80px' });
    vigia.observe(figura);
    apagar.push(() => vigia.disconnect());
  } else {
    viendo = true;
  }
  const ANIMOS = ['¡Vamos!', '¡Tú puedes!', '¡Venga!', '¡A por ello!', '¡Ánimo!', '¡Olé!'];
  let animo = 0;
  figura.addEventListener('click', e => {
    e.stopPropagation();
    sprite?.reaccionar('cosquillas');
    sprite?.gesto('firma');
    decirGlobo(ANIMOS[animo++ % ANIMOS.length]);
  });
  apagar.push(() => { apagarla(); clearTimeout(relojGlobo); });
  return {
    figura,
    // se pone al lado que tiene sitio: si la parada está a la izquierda, a su derecha
    colocar(li, x) { li.classList.toggle('lucia-der', x < 0); },
    celebrar() { sprite?.gesto(['celebrar', 'aplaudir']); decirGlobo('¡Enhorabuena!', 3000); },
    felicitar() { sprite?.gesto(['aplaudir', 'pulgar']); decirGlobo('¡Bien hecho!', 2600); },
  };
}
