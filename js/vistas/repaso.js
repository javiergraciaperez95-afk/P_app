// Pantalla «Repaso»: las tarjetas del cuaderno con repetición espaciada, pero sin autoevaluarse.
// Cada tarjeta es un minijuego que obliga a pensar (y cambia de una tarjeta a otra, para que no aburra):
//   elige    → ves el español y eliges qué significa
//   eligeEs  → ves el significado y eliges el español
//   oido     → lo oyes y eliges lo que has oído (solo con voz)
//   letras   → montas la palabra con sus letras desordenadas
//   ordena   → montas la frase con sus palabras desordenadas
//   escribe  → la escribes (con las teclas de á, ñ, ¿…)
// La nota de la repetición espaciada sale sola: fallar = «otra vez» (y la tarjeta vuelve en esta misma sesión),
// acertar con algún tropiezo = «difícil», acertar = «bien», acertar a la primera y rápido = «fácil».
// Las tarjetas nuevas empiezan por reconocer (elegir); las que ya se han visto pasan a producir (montar, escribir).
// Atajos: 1–4 para elegir, Enter para comprobar o seguir.

import { el, poner, barajar, alAzar } from '../dom.js';
import { t, tr, idioma } from '../i18n.js';
import { tarjetas, actualizarTarjeta, actividadDeHoy } from '../progress.js';
import { programar, esNueva, tocaRepasar } from '../srs.js';
import { botonEscuchar } from '../comunes.js';
import { sonar, sonarAcierto, pronunciar, hayVoz } from '../sonidos.js';
import { decir } from '../tutor.js';
import { LANG, curso, nombreDelCurso } from '../curso.js';
import { diccionarioCompleto } from './leccion.js';
import { confeti } from '../fiesta.js';
import { enlaceReto } from './reto.js';
import { conCartel } from './carteles.js';

const NUEVAS_POR_SESION = 20;
const VOLVER_EN_SESION = 20 * 60 * 1000; // lo que vence en menos de 20 min vuelve a salir hoy

// ----- Comparar respuestas -----
const limpiar = s => String(s).toLocaleLowerCase(LANG).replace(/[.,!?¡¿;:"«»“”'’()…]/g, ' ').replace(/\s+/g, ' ').trim();
const sinTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const textoTrad = c => String(tr(c.trad) ?? '').trim();

function crearCola() {
  const ahora = Date.now();
  const todas = tarjetas().filter(c => c.es);
  const pendientes = todas.filter(c => tocaRepasar(c.srs, ahora)).sort((a, b) => a.srs.vence - b.srs.vence);
  const nuevas = todas.filter(c => esNueva(c.srs)).sort((a, b) => a.creada - b.creada).slice(0, NUEVAS_POR_SESION);
  return [...barajar(pendientes), ...nuevas];
}

/** Lo que se puede usar para las opciones falsas: el resto del cuaderno y el diccionario del curso. */
function crearReserva() {
  const vistos = new Set();
  const reserva = [];
  const meter = (es, trad) => {
    const clave = limpiar(es);
    if (!es || !trad || vistos.has(clave)) return;
    vistos.add(clave);
    reserva.push({ es: String(es).trim(), trad: String(trad).trim() });
  };
  for (const c of tarjetas()) meter(c.es, textoTrad(c));
  for (const e of diccionarioCompleto().values()) if (!e.oculta && e.trad) meter(e.es, tr(e.trad));
  return reserva;
}

/** Tres opciones falsas parecidas (de largo parecido) a la buena. */
function distractores(c, reserva, campo) {
  const bueno = campo === 'es' ? limpiar(c.es) : limpiar(textoTrad(c));
  const largo = (campo === 'es' ? c.es : textoTrad(c)).length;
  const frase = /\s/.test(c.es.trim());
  const candidatos = reserva
    .filter(r => limpiar(r[campo]) !== bueno && limpiar(r.es) !== limpiar(c.es) && limpiar(r.trad) !== limpiar(textoTrad(c)))
    .filter(r => /\s/.test(r.es) === frase || reserva.length < 30)
    .map(r => ({ r, d: Math.abs(r[campo].length - largo) + Math.random() * 6 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 14);
  return barajar(candidatos).slice(0, 3).map(x => x.r[campo]);
}

function modosPara(c, reserva) {
  const es = c.es.trim();
  const nPalabras = es.split(/\s+/).length;
  const palabra = nPalabras === 1;
  const conTrad = Boolean(textoTrad(c));
  const hayOpciones = reserva.length >= 3;
  const lista = [];
  if (conTrad && hayOpciones) lista.push('elige', 'eligeEs');
  if (hayVoz() && hayOpciones) lista.push('oido');
  // producir: cuando ya se ha visto alguna vez (o si no hay con qué hacer opciones)
  if (conTrad && (!esNueva(c.srs) || !lista.length)) {
    if (palabra && es.length >= 2 && es.length <= 12) lista.push('letras', 'letras');
    if (!palabra && nPalabras <= 8) lista.push('ordena', 'ordena');
    if (palabra || nPalabras <= 4) lista.push('escribe');
  }
  if (!lista.length) lista.push(hayVoz() ? 'oido' : 'clasica');
  return lista;
}

export function pintarRepaso(app) {
  let cola = [];
  let reserva = [];
  let actual = null;
  let modoAnterior = '';
  let alTeclear = null;
  let racha = 0;
  let mejorRacha = 0;
  let hechas = 0;
  let aciertos = 0;
  let totalSesion = 0;
  const falladas = new Set();
  const relojes = new Set();
  const luego = (ms, fn) => { const r = setTimeout(() => { relojes.delete(r); fn(); }, ms); relojes.add(r); };

  // ---------------------------------------------------------------------
  // Portada del repaso
  // ---------------------------------------------------------------------
  function inicio() {
    actual = null;
    alTeclear = null;
    const todas = tarjetas();
    const pendientes = todas.filter(c => tocaRepasar(c.srs)).length;
    const nuevas = Math.min(NUEVAS_POR_SESION, todas.filter(c => esNueva(c.srs)).length);
    const hoy = actividadDeHoy();
    const hayAlgo = pendientes + nuevas > 0;

    // el mazo: una cartita por cada diez tarjetas que tocan (como mucho doce)
    const mazo = el('div', { class: 'rp-mazo', 'aria-hidden': 'true' },
      Array.from({ length: Math.min(12, Math.max(1, Math.ceil((pendientes + nuevas) / 10))) }, (_, k) =>
        el('span', { style: `--k:${k}` })));

    // sin nada que repasar el botón se apaga, y el motivo va justo debajo de él
    const motivo = !hayAlgo && (todas.length ? t('repaso.sinQueRepasar') : t('repaso.vacioActivo'));
    const empezar = el('button', { type: 'button', class: 'es-boton es-boton-grande rp-empezar', disabled: !hayAlgo, 'aria-describedby': motivo ? 'rp-motivo' : null, 'data-sonido': 'voltear' }, t('repaso.empezar'));
    empezar.addEventListener('click', () => {
      cola = crearCola();
      reserva = crearReserva();
      racha = 0; mejorRacha = 0; hechas = 0; aciertos = 0;
      totalSesion = cola.length;
      falladas.clear();
      siguiente();
    });

    poner(app,
      conCartel(el('section', { class: 'intro-vista' },
        el('h1', {}, t('menu.repaso')),
        el('p', {}, t('repaso.introActivo'))), 'repaso'),
      el('section', { class: 'caja panel-repaso' },
        hayAlgo ? mazo : null,
        el('dl', { class: 'contadores' },
          el('div', {}, el('dt', {}, t('repaso.paraRepasar')), el('dd', {}, String(pendientes))),
          el('div', {}, el('dt', {}, t('repaso.nuevas')), el('dd', {}, String(nuevas))),
          el('div', {}, el('dt', {}, t('repaso.hoy')), el('dd', {}, String(hoy.repasos)))),
        empezar,
        motivo && el('p', { class: 'aprox rp-motivo', id: 'rp-motivo' }, motivo, !todas.length && [' ', el('a', { href: '#/lecciones' }, t('repaso.vacioIr'))]),
        el('div', { class: 'rp-reto' }, enlaceReto())),
    );

    if (!todas.length) decir(t('repaso.tutoraVacio'), 'confundida');
    else if (!hayAlgo) decir(t('repaso.tutoraAlDia'), 'contenta');
    else decir(t('repaso.tutoraEsperando', { n: pendientes + nuevas }));
  }

  function siguiente() {
    actual = cola.shift() ?? null;
    if (!actual) { fin(); return; }
    const posibles = modosPara(actual, reserva);
    const sinRepetir = posibles.filter(m => m !== modoAnterior);
    const modo = alAzar(sinRepetir.length ? sinRepetir : posibles);
    modoAnterior = modo;
    pintarJuego(actual, modo);
  }

  // ---------------------------------------------------------------------
  // Una tarjeta
  // ---------------------------------------------------------------------
  function pintarJuego(c, modo) {
    const empezo = performance.now();
    let tropiezos = 0;
    let resuelta = false;

    const trad = textoTrad(c);
    const progreso = el('span', { class: 'rp-progreso', 'aria-hidden': 'true' },
      el('span', { style: `--avance:${totalSesion ? Math.min(1, hechas / totalSesion) : 0}` }));
    const llama = el('span', { class: `rp-racha${racha >= 2 ? ' encendida' : ''}`, 'aria-label': t('repaso.rachaN', { n: racha }) },
      el('span', { 'aria-hidden': 'true' }, '🔥'), String(racha));
    const cabecera = el('div', { class: 'rp-cabecera' },
      el('button', { type: 'button', class: 'boton boton-mini', 'data-sonido': 'cerrar', onclick: () => { limpiarRelojes(); fin(); } }, t('repaso.terminar')),
      progreso,
      llama);

    const etiqueta = el('p', { class: 'carta-etiqueta' },
      `${t(esNueva(c.srs) ? 'repaso.etiquetaNueva' : 'repaso.etiquetaRepaso')} · ${t(`repaso.modo.${modo}`)}`);
    const carta = el('div', { class: 'carta rp-carta entra', 'aria-live': 'polite' }, etiqueta);
    const zona = el('div', { class: 'rp-zona' });
    const aviso = el('div', { class: 'rp-aviso', role: 'status' });

    // ----- Corregir -----
    function acertar() {
      if (resuelta) return;
      resuelta = true;
      const segundos = (performance.now() - empezo) / 1000;
      const rapido = segundos < (['elige', 'eligeEs', 'oido'].includes(modo) ? 5 : 12);
      const nota = tropiezos ? 2 : rapido ? 4 : 3;
      racha += 1;
      mejorRacha = Math.max(mejorRacha, racha);
      aciertos += 1;
      sonarAcierto(racha);
      carta.classList.add('bien');
      if (racha > 0 && racha % 5 === 0) { confeti(llama, 16); decir(t('repaso.rachaTutora', { n: racha }), 'contenta'); }
      poner(aviso, el('p', { class: 'rp-bien' }, '✔ ', t(nota === 4 ? 'repaso.genial' : nota === 2 ? 'repaso.casiBien' : 'repaso.bien')),
        respuesta(c));
      cerrar(nota, 900);
    }
    function fallar(lo) {
      if (resuelta) return;
      resuelta = true;
      racha = 0;
      falladas.add(c.id);
      sonar('mal');
      carta.classList.add('mal');
      const seguir = el('button', { type: 'button', class: 'es-boton rp-seguir', 'data-sonido': 'paso' }, t('repaso.entendido'));
      poner(aviso,
        el('p', { class: 'rp-mal' }, '✖ ', lo ? t('repaso.dijiste', { texto: lo }) : t('repaso.noEra')),
        respuesta(c),
        seguir);
      seguir.addEventListener('click', () => cerrar(1, 0));
      luego(60, () => seguir.focus({ preventScroll: true }));
      if (!pronunciar(c.es)) { /* sin voz: se lee */ }
    }
    function cerrar(nota, espera) {
      zona.querySelectorAll('button, input').forEach(b => { b.disabled = true; });
      const nuevo = programar(c.srs, nota);
      actualizarTarjeta(c.id, nuevo);
      c.srs = nuevo;
      hechas += 1;
      progreso.firstChild.style.setProperty('--avance', String(Math.min(1, hechas / Math.max(totalSesion, hechas))));
      if (nuevo.vence - Date.now() < VOLVER_EN_SESION) { cola.push(c); totalSesion += 1; }
      if (espera) luego(espera, siguiente);
      else siguiente();
    }

    // ----- Cada minijuego -----
    if (modo === 'elige' || modo === 'eligeEs' || modo === 'oido') {
      const campo = modo === 'elige' ? 'trad' : 'es';
      const buena = campo === 'es' ? c.es.trim() : trad;
      const opciones = barajar([buena, ...distractores(c, reserva, campo)]);
      if (modo === 'elige') carta.append(el('p', { class: 'carta-es', lang: LANG }, c.es), el('div', { class: 'carta-acciones' }, botonEscuchar(c.es)));
      else if (modo === 'eligeEs') carta.append(el('p', { class: 'carta-trad' }, trad));
      else {
        const oir = el('button', { type: 'button', class: 'rp-altavoz', 'aria-label': t('comun.escuchar'), 'data-sonido': 'nada' }, '🔊');
        oir.addEventListener('click', () => { oir.classList.remove('late'); void oir.offsetWidth; oir.classList.add('late'); pronunciar(c.es); });
        carta.append(oir, el('p', { class: 'aprox' }, t('repaso.queOyes')));
        luego(350, () => pronunciar(c.es));
      }
      const botones = opciones.map((o, k) => {
        const b = el('button', { type: 'button', class: 'rp-opcion', lang: campo === 'es' ? LANG : null, 'data-sonido': 'elegir' },
          el('span', { class: 'tecla' }, String(k + 1)), el('span', {}, o));
        b.addEventListener('click', () => {
          if (resuelta) return;
          if (limpiar(o) === limpiar(buena)) { b.classList.add('buena'); acertar(); }
          else {
            b.classList.add('mala');
            botones.find(x => limpiar(x.textContent.slice(1)) === limpiar(buena))?.classList.add('buena');
            fallar(o);
          }
        });
        return b;
      });
      zona.append(el('div', { class: `rp-opciones${opciones.some(o => o.length > 22) ? ' largas' : ''}` }, botones));
      alTeclear = e => { const n = Number(e.key); if (n >= 1 && n <= botones.length) { e.preventDefault(); botones[n - 1].click(); } };
    } else if (modo === 'letras' || modo === 'ordena') {
      // montar la palabra (con sus letras) o la frase (con sus palabras), tocando las piezas en orden
      const piezas = modo === 'letras' ? [...c.es.trim()].filter(x => x !== ' ') : c.es.trim().split(/\s+/);
      const objetivo = piezas.map(p => limpiar(p) || p);
      carta.append(el('p', { class: 'carta-trad' }, trad), el('p', { class: 'aprox' }, t(modo === 'letras' ? 'repaso.montaPalabra' : 'repaso.montaFrase')));
      const hueco = el('div', { class: `rp-hueco ${modo}`, lang: LANG }, objetivo.map(() => el('span', { class: 'rp-casilla' })));
      let pos = 0;
      let mezcla = barajar(piezas.map((p, k) => ({ p, k })));
      // que no salga ya ordenado
      if (mezcla.every((x, k) => x.k === k) && piezas.length > 1) mezcla = [...mezcla.slice(1), mezcla[0]];
      const fichas = mezcla.map(({ p }) => {
        const b = el('button', { type: 'button', class: `rp-ficha ${modo}`, lang: LANG, 'data-sonido': 'ficha' }, p);
        b.addEventListener('click', () => {
          if (resuelta || b.disabled) return;
          if ((limpiar(p) || p) === objetivo[pos]) {
            const casilla = hueco.children[pos];
            casilla.textContent = p;
            casilla.classList.add('llena');
            b.disabled = true;
            b.classList.add('usada');
            pos += 1;
            if (pos === objetivo.length) acertar();
          } else {
            tropiezos += 1;
            sonar('mal');
            b.classList.remove('tiembla'); void b.offsetWidth; b.classList.add('tiembla');
            // al tercer tropiezo, la siguiente pieza buena parpadea para ayudar
            if (tropiezos >= 3) fichas.find(f => !f.disabled && (limpiar(f.textContent) || f.textContent) === objetivo[pos])?.classList.add('pista');
            if (tropiezos >= 6) fallar('');
          }
        });
        return b;
      });
      zona.append(hueco, el('div', { class: `rp-fichas ${modo}` }, fichas));
      alTeclear = null;
    } else if (modo === 'escribe') {
      carta.append(el('p', { class: 'carta-trad' }, trad), el('p', { class: 'aprox' }, t('repaso.escribeEs', { curso: nombreDelCurso(idioma()) })));
      const campo = el('input', { type: 'text', class: 'rp-escribe', lang: LANG, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': t('repaso.escribeEs') });
      const comprobar = el('button', { type: 'button', class: 'es-boton', 'data-sonido': 'nada' }, t('repaso.comprobar'));
      const pista = el('button', { type: 'button', class: 'boton boton-mini', 'data-sonido': 'duda' }, t('repaso.pista'));
      let letrasPista = 0;
      pista.addEventListener('click', () => {
        letrasPista = Math.min(letrasPista + 1, c.es.trim().length - 1);
        tropiezos += 1;
        campo.value = c.es.trim().slice(0, letrasPista);
        campo.focus();
      });
      const letras = el('div', { class: 'letras-especiales rp-letras', hidden: !curso.letras?.length },
        (curso.letras ?? []).map(l => el('button', { type: 'button', class: 'boton boton-mini', 'data-sonido': 'tecla', onclick: () => {
          const i = campo.selectionStart ?? campo.value.length;
          campo.value = campo.value.slice(0, i) + l + campo.value.slice(campo.selectionEnd ?? i);
          campo.focus();
          campo.setSelectionRange(i + l.length, i + l.length);
        } }, l)));
      const probar = () => {
        if (resuelta) return;
        const dicho = campo.value;
        if (!limpiar(dicho)) { campo.focus(); return; }
        if (limpiar(dicho) === limpiar(c.es)) acertar();
        else if (sinTildes(limpiar(dicho)) === sinTildes(limpiar(c.es))) {
          // solo fallan las tildes: vale, pero se avisa (y cuenta como tropiezo)
          tropiezos += 1;
          acertar();
          aviso.prepend(el('p', { class: 'rp-tilde' }, t('repaso.ojoTildes')));
        } else fallar(dicho);
      };
      comprobar.addEventListener('click', probar);
      campo.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); probar(); } });
      zona.append(el('div', { class: 'rp-escribir' }, campo, comprobar), letras, el('div', { class: 'rp-pista' }, pista));
      luego(80, () => campo.focus({ preventScroll: true }));
      alTeclear = null;
    } else {
      // sin traducción ni voz: la de siempre (ver y valorar), para que ninguna tarjeta se quede atascada
      carta.append(el('p', { class: 'carta-es', lang: LANG }, c.es));
      const ver = el('button', { type: 'button', class: 'es-boton', 'data-sonido': 'voltear' }, t('repaso.mostrar'));
      ver.addEventListener('click', () => {
        poner(zona, respuesta(c),
          el('div', { class: 'acciones-repaso' },
            el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => fallar('') }, t('srs.otraVez')),
            el('button', { type: 'button', class: 'es-boton', onclick: () => acertar() }, t('srs.bien'))));
      });
      zona.append(ver);
    }

    poner(app, el('div', { class: 'rp-sesion' }, cabecera, carta, zona, aviso));
    luego(30, () => carta.classList.remove('entra'));
  }

  /** La respuesta buena, con su traducción y para oírla. */
  function respuesta(c) {
    return el('div', { class: 'rp-respuesta' },
      el('span', { class: 'rp-respuesta-es', lang: LANG }, c.es),
      textoTrad(c) && el('span', { class: 'rp-respuesta-trad' }, textoTrad(c)),
      botonEscuchar(c.es));
  }

  function limpiarRelojes() { for (const r of relojes) clearTimeout(r); relojes.clear(); }

  // ---------------------------------------------------------------------
  // Final
  // ---------------------------------------------------------------------
  function fin() {
    alTeclear = null;
    actual = null;
    const total = hechas;
    const porcentaje = total ? Math.round((aciertos / total) * 100) : 0;
    sonar(total ? 'fanfarria' : 'cerrar');
    const copa = el('p', { class: 'jg-final-copa', 'aria-hidden': 'true' }, porcentaje >= 80 ? '🏆' : porcentaje >= 50 ? '🎉' : '💪');
    const dato = (icono, valor, texto) => el('li', { class: 'jg-final-dato' },
      el('span', { class: 'jg-final-icono', 'aria-hidden': 'true' }, icono), el('strong', {}, String(valor)), el('span', {}, texto));
    poner(app,
      el('section', { class: 'caja final-leccion rp-final' },
        copa,
        el('h1', {}, t('repaso.finTitulo')),
        el('ul', { class: 'jg-final-datos' },
          dato('🃏', total, t('repaso.finTarjetas')),
          dato('✔', `${porcentaje}%`, t('repaso.finAciertos')),
          dato('🔥', mejorRacha, t('repaso.finRacha'))),
        falladas.size ? el('p', { class: 'aprox' }, t('repaso.finFalladas', { n: falladas.size })) : null,
        el('div', { class: 'jg-final-botones' },
          el('button', { type: 'button', class: 'es-boton', onclick: inicio }, t('comun.volver')),
          el('a', { class: 'es-boton es-boton-papel', href: '#/lecciones' }, t('jg.fin.mapa')),
          el('a', { class: 'es-boton es-boton-papel', href: '#/cuaderno' }, t('repaso.verCuaderno')))));
    if (total) luego(250, () => confeti(copa, porcentaje >= 80 ? 34 : 18));
    app.querySelector('button')?.focus({ preventScroll: true });
    decir(total ? t('repaso.finTutora', { n: total }) : t('repaso.tutoraAlDia'), 'contenta');
  }

  const teclas = e => {
    if (!alTeclear || e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    alTeclear(e);
  };
  document.addEventListener('keydown', teclas);

  inicio();
  return () => { limpiarRelojes(); document.removeEventListener('keydown', teclas); };
}
