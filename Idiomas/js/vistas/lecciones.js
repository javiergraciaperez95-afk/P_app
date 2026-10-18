// Pantalla «Lecciones»: el camino. Cada capítulo es un tramo con su cartel, y cada lección una parada redonda
// que serpentea de un lado a otro; las paradas se unen con un caminito de puntos. Lucía espera en la siguiente
// lección que toca, y al final de cada capítulo hay un cofre que solo se abre al terminarlo.
// Al tocar una parada sale su ficha (título, avance y el botón para entrar). Nada se completa solo: el camino solo
// enseña por dónde vas.

import { el, poner } from '../dom.js';
import { t, tr } from '../i18n.js';
import { resumenLeccion, hayProgreso, nombre, actividadDeHoy, racha } from '../progress.js';
import { pendientesDeHoy } from '../cabecera.js';
import { decir } from '../tutor.js';
import { sonar } from '../sonidos.js';
import { LANG, clave, curso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { avanceJuego, estrellasDe } from '../../juegos/motor.js';
import { confeti } from '../fiesta.js';

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
  // La lección que toca: la primera sin terminar, en el orden del curso.
  const toca = validas.find(r => estados.get(r.leccion.id).estado !== 'terminada')?.leccion ?? null;
  const capituloToca = toca ? String(toca.capitulo ?? 'sin') : null;

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
      if (abrir) lista.querySelector('.cm-parada')?.classList.add('saluda');
    });
    raiz.append(boton, lista);
    aplicar(abierto);
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
        decir(t('camino.cofreCerradoTutora', { faltan: total - hechas }), 'pensando');
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
        decir(t('camino.cofreTutora', { n: capitulo?.numero ?? '' }), 'contenta');
      } else {
        boton.classList.remove('estalla'); void boton.offsetWidth; boton.classList.add('estalla');
        sonar('moneda');
        confeti(boton, 14);
      }
    });
    return el('li', { class: 'cm-parada cm-parada-cofre', style: `--x:${OLA(i)}` }, boton);
  }

  // ----- Arriba: cuánto llevas y el botón para ir a lo que toca -----
  const total = validas.length;
  const cabecera = el('section', { class: 'cm-cabecera' },
    el('div', { class: 'cm-cabecera-textos' },
      el('h1', {}, t('menu.lecciones')),
      el('p', { class: 'cm-cabecera-dato' }, t('camino.llevas', { hechas: terminadas, total })),
      el('span', { class: 'cm-cabecera-barra', 'aria-hidden': 'true' }, el('span', { style: `--avance:${total ? terminadas / total : 0}` }))),
    toca && el('button', { type: 'button', class: 'es-boton cm-ir', 'data-sonido': 'flecha', onclick: () => irALoQueToca(true) },
      t('camino.irA', { n: toca.numero_curso })));

  // ----- Las misiones de hoy: una lección, un repaso y una lección de 3 estrellas -----
  const misiones = misionesDeHoy({ irALeccion: () => irALoQueToca(true) });

  // botón flotante: aparece cuando la lección que toca no está a la vista
  const flotante = toca ? el('button', { type: 'button', class: 'cm-flotante', hidden: true, 'data-sonido': 'flecha', onclick: () => irALoQueToca(true) }) : null;

  function irALoQueToca(conFicha = false, suave = true) {
    if (!toca) return;
    const cap = document.getElementById(`cm-cap-${capituloToca}`);
    if (cap?.hidden) cap.previousElementSibling?.click();
    const nodo = app.querySelector('.cm-nodo.toca');
    if (!nodo) return;
    nodo.scrollIntoView({ block: 'center', behavior: suave && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    nodo.classList.remove('llama'); void nodo.offsetWidth; nodo.classList.add('llama');
    if (conFicha) setTimeout(() => { if (!fichaAbierta) nodo.click(); }, 550);
  }

  poner(app,
    cabecera,
    misiones,
    resultados.sinConexion && el('section', { class: 'caja tarjeta-error', role: 'alert' },
      el('h2', {}, t('app.sinConexionTitulo')),
      el('p', {}, t('app.sinConexionTexto')),
      el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))),
    errorCapitulos && tarjetaError(errorCapitulos, 'lessons/capitulos.json'),
    grupos.length
      ? el('div', { class: 'cm-mapa' }, grupos.map(tramo))
      : el('p', { class: 'caja' }, t('lecciones.ninguna')),
    flotante);

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
      if (m.hecho) { decir(t('camino.misionYaHecha'), 'contenta'); return; }
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
  for (const [clase, trazo] of [['cm-sendero-base', d], ['cm-sendero-hecho', dHecho]]) {
    if (!trazo) continue;
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', trazo);
    p.setAttribute('class', clase);
    svg.append(p);
  }
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
  };
}
