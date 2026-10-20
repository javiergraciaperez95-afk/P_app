// Pantalla «Repaso» (rediseño del 20-10): repetición espaciada como Anki, pero sin autoevaluarse.
// · Cada tarjeta se repasa como mucho UNA vez al día (js/srs.js): lo que toca hoy y unas pocas nuevas. Fallar no la
//   repite hoy: vuelve mañana. Al acabar, no hay más hasta mañana.
// · Cada repaso es un minijuego elegido al azar (nunca el mismo que la vez anterior con esa tarjeta):
//     elige (ves el español y eliges qué significa) · oido (lo oyes y eliges) · eligeEs (ves el significado y eliges
//     el español) · letras / ordena (montas la palabra o la frase) · escribe (la escribes)
// · La nota sale sola: fallar = «otra vez», acertar con tropiezos = «difícil», acertar = «bien», a la primera y rápido
//   = «fácil». Tras cada tarjeta se dice cuándo vuelve.
// Atajos: 1–4 para elegir, Enter para comprobar o seguir.

import { el, poner, barajar, alAzar } from '../dom.js';
import { t, tr, idioma } from '../i18n.js';
import { tarjetas, actualizarTarjeta } from '../progress.js';
import { programar, esNueva, colaDeHoy, paraManana, etapa, textoDias, NUEVAS_AL_DIA } from '../srs.js';
import { botonEscuchar } from '../comunes.js';
import { sonar, sonarAcierto, pronunciar, hayVoz } from '../sonidos.js';
import { decir } from '../tutor.js';
import { LANG, curso, nombreDelCurso } from '../curso.js';
import { diccionarioCompleto } from './leccion.js';
import { confeti } from '../fiesta.js';
import { enlaceReto } from './reto.js';
import { conCartel } from './carteles.js';
import { botonAvisos } from '../avisos.js';

// ----- Comparar respuestas -----
const limpiar = s => String(s).toLocaleLowerCase(LANG).replace(/[.,!?¡¿;:"«»“”'’()…]/g, ' ').replace(/\s+/g, ' ').trim();
const sinTildes = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const tradCompleta = c => String(tr(c.trad) ?? '').trim();

let espanolas = null;
/** Las palabras sueltas del diccionario del curso (para reconocer el español dentro de una nota). */
function palabrasEspanolas() {
  if (!espanolas) {
    espanolas = new Set();
    for (const clave of diccionarioCompleto().keys()) for (const w of String(clave).toLocaleLowerCase('es').match(/[\p{L}]+/gu) ?? []) espanolas.add(w);
  }
  return espanolas;
}

/**
 * La traducción como pregunta: sin las notas que la acompañan en las lecciones, que daban la respuesta
 * («phía sau («detrás de»)», «hơn những gì (+ mệnh đề)»). Al enseñar la solución sí va completa (tradCompleta).
 */
function sinNotas(texto) {
  let t = String(texto ?? '');
  // solo las notas que llevan español («detrás de», el infinitivo: «(salir)») o son de gramática («+ mệnh đề»); las que
  // distinguen en vietnamita («(thân mật)», «(nữ)») se quedan: sin ellas, «bạn» serían a la vez «tú» y «usted»
  // (es español si es un infinitivo o si todas sus palabras están en el diccionario del curso: «nam», «gái» o
  //  «chúng ta» son vietnamitas y se quedan)
  const espanol = nota => {
    const palabras = nota.toLocaleLowerCase('es').match(/[\p{L}]+/gu) ?? [];
    if (!palabras.length || /[^a-záéíóúüñ\s'’,./-]/i.test(nota)) return false;
    if (palabras.length === 1 && /(ar|er|ir|ír|se)$/.test(palabras[0])) return true;
    return palabras.every(w => palabrasEspanolas().has(w));
  };
  const quitar = nota => /[«»"“”+]/.test(nota) || espanol(nota);
  for (let vez = 0; vez < 3; vez++) t = t.replace(/\s*[([]([^()[\]]*)[)\]]/g, (todo, nota) => (quitar(nota) ? '' : todo));
  t = t.replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, '').trim();
  return t || String(texto ?? '').trim();
}
const textoTrad = c => sinNotas(tradCompleta(c));

/**
 * Si la traducción ya trae el español (frases que citan algo: «"Buenos días", cô ấy nói»), los juegos de producir
 * (¿cómo se dice?, montar, escribir) se regalarían: esa tarjeta solo sale en los de reconocer. Los nombres propios
 * (Ana, Madrid…) no cuentan.
 */
function revela(c) {
  const trad = ` ${sinTildes(limpiar(textoTrad(c)))} `;
  return c.es.trim().split(/\s+/).some((palabra, i) => {
    const limpia = sinTildes(limpiar(palabra));
    const nombre = i > 0 && /^\p{Lu}/u.test(palabra.replace(/^[¿¡«"“(]+/, ''));
    return limpia.length >= 4 && !nombre && trad.includes(` ${limpia} `);
  });
}

const REBELDE = 4; // olvidada tantas veces: tarjeta rebelde
export const esRebelde = c => (c.srs?.lapsos ?? 0) >= REBELDE;

/** La sesión de hoy: las que tocan (barajadas) con una nueva intercalada cada tres. */
function colaDelDia() {
  const { pendientes, nuevas } = colaDeHoy(tarjetas());
  const repasos = barajar(pendientes);
  const cola = [];
  while (repasos.length || nuevas.length) {
    cola.push(...repasos.splice(0, 3));
    if (nuevas.length) cola.push(nuevas.shift());
  }
  return cola;
}

/** Lo que se puede usar para las opciones falsas: el resto del cuaderno y el diccionario del curso. */
function crearReserva() {
  const vistos = new Set();
  const reserva = [];
  const meter = (es, trad, propia) => {
    const clave = limpiar(es);
    if (!es || !trad || vistos.has(clave)) return;
    vistos.add(clave);
    reserva.push({ es: String(es).trim(), trad: sinNotas(trad), propia });
  };
  for (const c of tarjetas()) meter(c.es, tradCompleta(c), true);
  for (const e of diccionarioCompleto().values()) if (!e.oculta && e.trad) meter(e.es, tr(e.trad), false);
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
    .map(r => ({ r, d: Math.abs(r[campo].length - largo) + Math.random() * 4 + (r.propia ? 0 : 3)
      + (/^\p{Lu}/u.test(r.es) !== /^\p{Lu}/u.test(c.es.trim()) ? 6 : 0) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 14);
  return barajar(candidatos).slice(0, 3).map(x => x.r[campo]);
}

/** Los minijuegos posibles para una tarjeta (se elige uno al azar). */
function modosPara(c, reserva) {
  const es = c.es.trim();
  const nPalabras = es.split(/\s+/).length;
  const palabra = nPalabras === 1;
  const conTrad = Boolean(textoTrad(c));
  const producir = conTrad && !revela(c);
  const opciones = reserva.length >= 3;
  const puede = {
    elige: conTrad && opciones,
    eligeEs: producir && opciones,
    oido: hayVoz() && opciones,
    letras: producir && palabra && es.length >= 2 && es.length <= 12,
    ordena: producir && !palabra && nPalabras <= 8,
    escribe: producir && nPalabras <= 4,
  };
  let lista = Object.keys(puede).filter(m => puede[m]);
  if (!lista.length) lista = ['clasica'];
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
    const todas = tarjetas().filter(c => c.es);
    const { pendientes, nuevas, hechas: hechasHoy } = colaDeHoy(todas);
    const quedan = pendientes.length + nuevas.length;
    const manana = paraManana(todas);
    const total = hechasHoy + quedan;

    const empezar = el('button', { type: 'button', class: 'es-boton es-boton-grande rp2-empezar', disabled: !quedan, 'data-sonido': 'voltear' },
      quedan ? t('repaso.empezar') : t('ph.rp.hecho'));
    empezar.addEventListener('click', arrancar);

    const cuenta = clave => todas.filter(c => etapa(c.srs).clave === clave).length;
    const etapas = ['nueva', 'aprendiendo', 'repaso', 'dominada'].map(clave => el('li', { class: `rp2-etapa rp2-${clave}` },
      el('strong', {}, String(cuenta(clave))), el('span', {}, t(`srs.etapa.${clave}`))));

    function arrancar() {
      cola = colaDelDia();
      if (!cola.length) return;
      reserva = crearReserva();
      racha = 0; mejorRacha = 0; hechas = 0; aciertos = 0;
      totalSesion = cola.length;
      falladas.clear();
      siguiente();
    }

    poner(app,
      conCartel(el('section', { class: 'intro-vista' },
        el('h1', {}, t('menu.repaso')),
        el('p', {}, t('ph.rp.intro', { n: NUEVAS_AL_DIA }))), 'repaso'),
      el('section', { class: 'caja rp2-hoy' },
        el('p', { class: 'rp2-hoy-titulo' }, t('ph.rp.hoy')),
        el('p', { class: 'rp2-hoy-n' }, el('strong', {}, String(quedan)), el('span', {}, t('ph.rp.tarjetas'))),
        el('div', { class: 'rp2-barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(hechasHoy) },
          el('span', { style: `width:${total ? Math.round((hechasHoy / total) * 100) : 0}%` })),
        el('dl', { class: 'rp2-cifras' },
          el('div', {}, el('dt', {}, t('repaso.paraRepasar')), el('dd', {}, String(pendientes.length))),
          el('div', {}, el('dt', {}, t('repaso.nuevas')), el('dd', {}, String(nuevas.length))),
          el('div', {}, el('dt', {}, t('repaso.hoy')), el('dd', {}, String(hechasHoy)))),
        empezar,
        !quedan && el('p', { class: 'rp2-motivo' }, todas.length
          ? t('ph.rp.manana', { n: manana })
          : [t('repaso.vacioActivo'), ' ', el('a', { href: '#/lecciones' }, t('repaso.vacioIr'))])),
      todas.length ? el('section', { class: 'caja rp2-mazo' },
        el('h2', {}, t('ph.rp.mazo', { n: todas.length })),
        el('ul', { class: 'rp2-etapas' }, etapas),
        el('p', { class: 'rp2-ayuda' }, t('ph.rp.modos'))) : null,
      todas.length ? el('section', { class: 'caja rp2-extra' }, botonAvisos(), el('div', { class: 'rp-reto' }, enlaceReto())) : null,
    );

    if (!todas.length) decir(t('repaso.tutoraVacio'), 'confundida');
    else if (!quedan) decir(t('repaso.tutoraAlDia'), 'contenta');
    else decir(t('repaso.tutoraEsperando', { n: quedan }));
  }

  function siguiente() {
    actual = cola.shift() ?? null;
    if (!actual) { fin(); return; }
    const posibles = modosPara(actual, reserva);
    // nunca el mismo que la última vez con esta tarjeta, ni (si se puede) el de la tarjeta de antes
    const distintos = posibles.filter(m => m !== actual.srs?.modo);
    const variados = (distintos.length ? distintos : posibles).filter(m => m !== modoAnterior);
    const elegibles = variados.length ? variados : (distintos.length ? distintos : posibles);
    const modo = alAzar(elegibles);
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
      el('button', { type: 'button', class: 'boton boton-mini rp2-salir', 'aria-label': t('repaso.terminar'), title: t('repaso.terminar'), 'data-sonido': 'cerrar', onclick: () => { limpiarRelojes(); fin(); } }, '✕'),
      progreso,
      el('span', { class: 'rp2-cuenta' }, `${hechas + 1}/${totalSesion}`),
      llama);

    const etiqueta = el('p', { class: 'carta-etiqueta' },
      `${t(esNueva(c.srs) ? 'repaso.etiquetaNueva' : esRebelde(c) ? 'repaso.etiquetaRebelde' : 'repaso.etiquetaRepaso')} · ${t(`repaso.modo.${modo}`)}`);
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
      const nuevo = guardar(nota);
      const seguir = el('button', { type: 'button', class: 'es-boton rp2-seguir', 'data-sonido': 'paso' }, t('ph.lec.continuar'));
      seguir.addEventListener('click', () => pasar());
      poner(aviso, el('p', { class: 'rp-bien' }, '✔ ', t(nota === 4 ? 'repaso.genial' : nota === 2 ? 'repaso.casiBien' : 'repaso.bien')),
        respuesta(c), vuelve(nuevo), seguir);
      alTeclear = e => { if (e.key === 'Enter') { e.preventDefault(); pasar(); } };
      luego(1600, pasar);
    }
    function fallar(lo) {
      if (resuelta) return;
      resuelta = true;
      racha = 0;
      falladas.add(c);
      sonar('mal');
      carta.classList.add('mal');
      const nuevo = guardar(1);
      const seguir = el('button', { type: 'button', class: 'es-boton rp2-seguir', 'data-sonido': 'paso' }, t('repaso.entendido'));
      poner(aviso,
        el('p', { class: 'rp-mal' }, '✖ ', lo ? t('repaso.dijiste', { texto: lo }) : t('repaso.noEra')),
        respuesta(c),
        vuelve(nuevo),
        seguir);
      seguir.addEventListener('click', () => pasar());
      alTeclear = e => { if (e.key === 'Enter') { e.preventDefault(); pasar(); } };
      luego(60, () => seguir.focus({ preventScroll: true }));
      if (!pronunciar(c.es)) { /* sin voz: se lee */ }
    }
    // se guarda al responder (una sola vez: hoy ya no vuelve) y se dice cuándo vuelve
    function guardar(nota) {
      zona.querySelectorAll('button, input').forEach(b => { b.disabled = true; });
      hechas += 1;
      const nuevo = { ...programar(c.srs, nota), modo };
      actualizarTarjeta(c.id, nuevo);
      c.srs = nuevo;
      progreso.firstChild.style.setProperty('--avance', String(Math.min(1, hechas / Math.max(totalSesion, hechas))));
      return nuevo;
    }
    let pasada = false;
    function pasar() {
      if (pasada) return;
      pasada = true;
      limpiarRelojes();
      siguiente();
    }
    const vuelve = nuevo => el('p', { class: 'rp2-vuelve' }, '📅 ', nuevo.intervalo <= 1 ? t('ph.rp.vuelveManana') : t('ph.rp.vuelve', { cuando: textoDias(nuevo.intervalo) }));

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
      tradCompleta(c) && el('span', { class: 'rp-respuesta-trad' }, tradCompleta(c)),
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
        el('p', { class: 'rp2-vuelve' }, '📅 ', t('ph.rp.manana', { n: paraManana(tarjetas()) })),
        falladas.size ? el('p', { class: 'aprox' }, t('ph.rp.falladas', { n: falladas.size })) : null,
        falladas.size ? el('ul', { class: 'rp-final-falladas' }, [...falladas].slice(0, 8).map(c =>
          el('li', {}, el('span', { lang: LANG }, c.es), el('span', { class: 'aprox' }, tradCompleta(c)), botonEscuchar(c.es)))) : null,
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
