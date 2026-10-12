// Más tipos de paso del modo juego (segunda tanda). Mismas reglas que en escenas.js:
// ningún paso se completa solo por tocar, y lo que se falla vuelve más tarde.

import { el, poner, enLinea, barajar } from '../dom.js';
import { t, tr } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { crearSprite } from '../tutor-sprite.js';
import { animar } from './efectos.js';
import { ESCENAS, relojes, oir, botonOir, respuestas } from './escenas.js';
import { LANG } from '../curso.js';

const mayuscula = texto => texto.charAt(0).toLocaleUpperCase(LANG) + texto.slice(1);
const marcador = (n, total) => el('p', { class: 'aprox' }, t('juego.cuenta', { n, total }));

// ---------------------------------------------------------------------------
// presentate: la persona escribe un dato suyo (su nombre) y la frase se construye con él.
// Después, unas preguntas rápidas en las que {x} es lo que ha escrito.
// ---------------------------------------------------------------------------

const CLAVE_NOMBRE = 'idiomas-juego-nombre';

/** Cambia {x} por el texto en todos los textos de un trozo del guion. */
function conDato(valor, x) {
  return JSON.parse(JSON.stringify(valor).replaceAll('{x}', JSON.stringify(x).slice(1, -1)));
}

function presentate(ctx) {
  const { paso, tablero, decir, bien } = ctx;
  let limpiar = null;
  let guardado = '';
  try { guardado = localStorage.getItem(CLAVE_NOMBRE) ?? ''; } catch { /* sin almacenamiento */ }

  const entrada = el('input', {
    type: 'text', class: 'juego-nombre', maxlength: '20', autocomplete: 'given-name', value: guardado,
    placeholder: t('juego.presentate.campo'), 'aria-label': t('juego.presentate.campo'),
  });
  const form = el('form', { class: 'juego-presentate' }, entrada,
    el('button', { type: 'submit', class: 'boton boton-principal' }, t('juego.presentate.listo')));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const x = entrada.value.trim().replace(/\s+/g, ' ');
    if (!x) { animar(entrada, 'tiembla'); entrada.focus(); return; }
    try { localStorage.setItem(CLAVE_NOMBRE, x); } catch { /* sin almacenamiento */ }
    const frase = paso.plantilla.replace('{x}', x);
    const placa = el('p', { class: 'juego-placa', lang: LANG }, frase);
    const zona = el('div', {});
    poner(tablero, placa, el('p', { class: 'centrado' }, botonOir(frase, decir)), zona);
    oir(frase, decir);
    bien(placa);
    decir(conDato(paso.despues, x), 'contenta');
    limpiar = ESCENAS.elige({ ...ctx, tablero: zona, paso: conDato({ preguntas: paso.preguntas }, x) });
  });

  poner(tablero, form);
  return () => limpiar?.();
}

// ---------------------------------------------------------------------------
// conversa: las frases de un diálogo, desordenadas. Hay que tocarlas en orden;
// un fallo y la conversación empieza otra vez.
// ---------------------------------------------------------------------------

function conversa({ paso, leccion, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const frases = leccion.bloques[paso.bloque]?.frases ?? [];
  const chat = el('ol', { class: 'juego-chat' });
  const banco = el('div', { class: 'conversa-banco' });

  function pintar() {
    let n = 0;
    let parado = false;
    poner(chat);
    poner(banco, barajar(frases.map((_, i) => i)).map(i => {
      const f = frases[i];
      const boton = el('button', { type: 'button', class: 'conversa-linea' },
        el('span', { class: 'conversa-es', lang: LANG }, f.es),
        el('span', { class: 'frase-trad' }, tr(f.trad)));
      boton.addEventListener('click', () => {
        if (parado) return;
        if (i !== n) {
          mal(boton);
          decir(paso.pista ?? t('juego.conversa.pista'), 'pensando');
          if (n > 0) { parado = true; luego(pintar, 1200); }
          return;
        }
        n += 1;
        boton.remove();
        chat.append(el('li', { class: `juego-turno${n % 2 ? '' : ' mio'}` },
          f.quien && el('span', { class: 'frase-quien' }, `${f.quien}:`),
          el('p', { class: 'juego-linea', lang: LANG }, f.es)));
        oir(f.es, decir);
        if (n < frases.length) { sonar('clic'); return; }
        bien(chat);
        if (paso.despues) decir(paso.despues, 'contenta');
        completar();
      });
      return boton;
    }));
  }

  poner(tablero, el('p', { class: 'aprox' }, t('juego.conversa.ayuda')), chat, banco);
  if (frases.length) pintar(); else completar();
  return limpiar;
}

// ---------------------------------------------------------------------------
// mensajera: varias personas en una escena. Sale una frase y hay que tocar a quien la diría;
// la tutora camina hasta esa persona y se la entrega. La frase fallada vuelve después.
// ---------------------------------------------------------------------------

function mensajera({ paso, tablero, decir, completar, bien, mal, retrato }) {
  const { luego, limpiar } = relojes();
  retrato(false); // en este paso la tutora está en la escena, no en su recuadro
  const CASA = 2;
  const cola = paso.frases.map(f => ({ ...f }));
  const total = cola.length;
  let hechas = 0;
  let ocupada = false;
  let donde = CASA;

  const canvas = el('canvas', { class: 'esc-tutora', width: '48', height: '60', 'aria-hidden': 'true', style: `left:${CASA}%` });
  const sprite = crearSprite(canvas);
  const carta = el('p', { class: 'esc-carta', lang: LANG });
  const cuenta = el('p', { class: 'aprox' });
  const paso1 = paso.personajes.length > 1 ? 72 / (paso.personajes.length - 1) : 0;

  const gente = paso.personajes.map((p, i) => {
    const x = 14 + i * paso1;
    // En los extremos el bocadillo se pega a su lado para no salirse de la escena.
    const globo = el('span', { class: `esc-globo${x < 30 ? ' izq' : x > 70 ? ' der' : ''}`, hidden: true, lang: LANG });
    const boton = el('button', { type: 'button', class: 'esc-persona', style: `left:${x}%` },
      globo,
      p.icono && el('span', { class: 'esc-cara', 'aria-hidden': 'true' }, p.icono),
      el('span', { class: 'esc-nombre' }, p.nombre, p.marca && el('span', { class: `esc-marca marca-${p.marca === '♀' ? 'f' : 'm'}` }, p.marca)),
      p.etiqueta && el('span', { class: 'esc-etiqueta', lang: LANG }, p.etiqueta));
    boton.addEventListener('click', () => entregar(p, x, boton, globo));
    return boton;
  });

  function andar(x, alLlegar) {
    canvas.classList.toggle('vuelta', x < donde);
    canvas.classList.add('andando');
    canvas.style.left = `${x}%`;
    donde = x;
    luego(() => { canvas.classList.remove('andando', 'vuelta'); alLlegar(); }, 800);
  }

  function siguiente() {
    cuenta.textContent = t('juego.cuenta', { n: Math.min(hechas + 1, total), total });
    if (!cola.length) {
      carta.textContent = '';
      sprite.expresion = 'contenta';
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    sprite.expresion = 'normal';
    carta.textContent = `✉ «${cola[0].es}»`;
    animar(carta, 'entra');
    ocupada = false;
  }

  function entregar(p, x, boton, globo) {
    if (ocupada || !cola.length) return;
    ocupada = true;
    const f = cola[0];
    sonar('pagina');
    andar(Math.max(0, x - 8), () => {
      const acierto = p.id === f.quien;
      globo.textContent = acierto ? f.es : t('juego.mensajera.no');
      globo.hidden = false;
      if (acierto) {
        cola.shift();
        hechas += 1;
        sprite.expresion = 'contenta';
        oir(f.es, decir);
        bien(boton);
        decir(`**${f.es}** ${tr(f.trad)}`, 'contenta');
      } else {
        cola.push(cola.shift());
        sprite.expresion = 'apurada';
        mal(boton);
        decir(f.pista, 'pensando');
      }
      luego(() => { globo.hidden = true; andar(CASA, siguiente); }, acierto ? 2100 : 1700);
    });
  }

  poner(tablero,
    el('p', { class: 'aprox' }, t('juego.mensajera.ayuda')),
    carta,
    el('div', { class: 'escenario' }, el('div', { class: 'esc-pizarra', 'aria-hidden': 'true' }), el('div', { class: 'esc-suelo', 'aria-hidden': 'true' }), ...gente, canvas),
    cuenta);
  siguiente();
  return () => { limpiar(); sprite.parar(); retrato(true); };
}

// ---------------------------------------------------------------------------
// maquina: varias ruedas de palabras. Se pide una frase («You are from Spain») y hay que
// girar las ruedas hasta formarla. La que se falla vuelve después.
// ---------------------------------------------------------------------------

function maquina({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const cola = paso.retos.map(r => ({ ...r }));
  let hechos = 0;
  const pos = paso.ruedas.map(() => 0);
  const meta = el('p', { class: 'maquina-meta' });
  const cuenta = el('p', { class: 'aprox' });

  const ruedas = paso.ruedas.map((lista, i) => {
    const palabra = el('span', { class: 'rueda-palabra', lang: LANG, 'aria-live': 'polite' }, lista[0]);
    const girar = d => {
      pos[i] = (pos[i] + d + lista.length) % lista.length;
      palabra.textContent = lista[pos[i]];
      animar(palabra, 'entra');
      sonar('clic');
    };
    const caja = el('div', { class: 'rueda' },
      el('button', { type: 'button', class: 'rueda-flecha', 'aria-label': t('juego.maquina.anterior'), onclick: () => girar(-1) }, '▲'),
      palabra,
      el('button', { type: 'button', class: 'rueda-flecha', 'aria-label': t('juego.maquina.siguiente'), onclick: () => girar(1) }, '▼'));
    return { caja, palabra, lista };
  });
  const fila = el('div', { class: 'maquina-ruedas' }, ruedas.map(r => r.caja));
  const palanca = el('button', { type: 'button', class: 'boton boton-principal boton-grande' }, t('juego.maquina.comprobar'));

  function nuevo() {
    if (!cola.length) {
      meta.textContent = t('juego.hecho');
      palanca.hidden = true;
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    const r = cola[0];
    // Las ruedas empiezan en otra posición, nunca ya resueltas.
    ruedas.forEach((rueda, i) => {
      pos[i] = Math.floor(Math.random() * rueda.lista.length);
      if (rueda.lista[pos[i]] === r.solucion[i]) pos[i] = (pos[i] + 1) % rueda.lista.length;
      rueda.palabra.textContent = rueda.lista[pos[i]];
    });
    meta.textContent = t('juego.maquina.meta', { trad: tr(r.trad) });
    cuenta.textContent = t('juego.cuenta', { n: hechos + 1, total: hechos + cola.length });
    palanca.disabled = false;
  }

  palanca.addEventListener('click', () => {
    const r = cola[0];
    const malas = ruedas.map((rueda, i) => rueda.lista[pos[i]] !== r.solucion[i]);
    if (malas.some(Boolean)) {
      ruedas.forEach((rueda, i) => { if (malas[i]) animar(rueda.caja, 'tiembla'); });
      mal(null);
      decir(r.pista ?? paso.pista ?? t('juego.maquina.pista'), 'pensando');
      if (!r.vuelve) { r.vuelve = true; cola.push({ ...r, vuelve: false }); }
      return;
    }
    const frase = r.frase ?? `${mayuscula(r.solucion.join(' '))}.`; // «frase»: cuando las ruedas forman una sola palabra
    palanca.disabled = true;
    cola.shift();
    hechos += 1;
    oir(frase, decir);
    bien(fila);
    decir(`**${frase}** ${tr(r.nota ?? r.trad)}`, 'contenta');
    luego(nuevo, 1900);
  });

  poner(tablero, cuenta, meta, fila, el('p', { class: 'centrado' }, palanca));
  nuevo();
  return limpiar;
}

// ---------------------------------------------------------------------------
// globos: se da un significado y hay que explotar el globo con la palabra española.
// La palabra fallada vuelve después.
// ---------------------------------------------------------------------------

function globos({ paso, tablero, decir, completar, palabra, bien, mal }) {
  const { luego, limpiar } = relojes();
  const cola = barajar([...paso.palabras]);
  let hechas = 0;

  function ronda() {
    if (!cola.length) {
      poner(tablero, el('p', { class: 'juego-hecho centrado' }, t('juego.hecho')));
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    const clave = cola[0];
    const v = palabra(clave);
    const otras = barajar(paso.palabras.filter(c => c !== clave)).slice(0, 3);
    let fallada = false;
    let resuelta = false;
    const cielo = el('div', { class: 'globos-cielo' }, barajar([clave, ...otras]).map((c, i) => {
      const es = palabra(c)?.es ?? c;
      const boton = el('button', { type: 'button', class: `globo globo-${i + 1}`, lang: LANG }, el('span', {}, es));
      boton.addEventListener('click', () => {
        if (resuelta) return;
        if (c === clave) {
          resuelta = true;
          cola.shift();
          hechas += 1;
          bien(boton);
          boton.classList.add('explota');
          oir(es, decir);
          decir(`**${es}**: ${tr(v?.trad)}`, 'contenta', { deGolpe: true });
          luego(ronda, 1100);
        } else {
          boton.disabled = true;
          mal(boton);
          decir(t('juego.globos.ese', { es, trad: tr(palabra(c)?.trad) }), 'pensando');
          if (!fallada) { fallada = true; cola.push(clave); }
        }
      });
      return boton;
    }));
    poner(tablero,
      marcador(hechas + 1, hechas + cola.length),
      el('p', { class: 'globos-pide' }, t('juego.globos.meta')),
      el('p', { class: 'globos-meta' }, tr(v?.trad)),
      cielo);
  }

  ronda();
  return limpiar;
}

// ---------------------------------------------------------------------------
// lectura: un texto corto en español (sin traducción ni audio) y preguntas sobre él.
// Unas se contestan eligiendo; otras, tocando la frase del texto que lo demuestra («linea»).
// La pregunta fallada vuelve después.
// ---------------------------------------------------------------------------

function lectura({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const cola = paso.preguntas.map(q => ({ ...q }));
  let hechas = 0;
  let alTocar = null; // función mientras la pregunta se contesta tocando el texto

  const lineas = paso.texto.map((es, i) => {
    const boton = el('button', { type: 'button', class: 'lectura-linea', lang: LANG }, es);
    boton.addEventListener('click', () => alTocar?.(i, boton));
    return boton;
  });
  const papel = el('div', { class: 'lectura-papel' }, paso.titulo && el('p', { class: 'lectura-titulo' }, tr(paso.titulo)), lineas);
  const zona = el('div', { class: 'lectura-zona' });

  function repetir(q) {
    if (!q.vuelve) { q.vuelve = true; cola.push({ ...q, vuelve: false }); }
  }
  function acertada(nodo, texto) {
    alTocar = null;
    papel.classList.remove('tocable');
    cola.shift();
    hechas += 1;
    bien(nodo);
    decir(texto, 'contenta');
    luego(preguntar, 1900);
  }

  function preguntar() {
    lineas.forEach(l => l.classList.remove('prueba'));
    if (!cola.length) {
      poner(zona, el('p', { class: 'juego-hecho' }, t('juego.hecho')));
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    const q = cola[0];
    const cabeza = [marcador(hechas + 1, hechas + cola.length), el('p', { class: 'ejercicio-pregunta' }, enLinea(tr(q.pregunta)))];
    if (q.linea !== undefined) {
      papel.classList.add('tocable');
      alTocar = (i, boton) => {
        if (i === q.linea) { boton.classList.add('prueba'); acertada(boton, q.bien); return; }
        mal(boton);
        decir(q.mal ?? t('juego.lectura.no'), 'pensando');
        repetir(q);
      };
      poner(zona, ...cabeza, el('p', { class: 'lectura-toca' }, t('juego.lectura.toca')));
      return;
    }
    poner(zona, ...cabeza, respuestas(barajar(q.opciones), {
      texto: o => tr(o.texto),
      esBuena: o => Boolean(o.correcta),
      alAcertar: (boton, o) => acertada(boton, o.explica),
      alFallar: (boton, o) => { mal(boton); decir(o.explica, 'pensando'); repetir(q); },
    }));
  }

  poner(tablero, papel, zona);
  preguntar();
  return limpiar;
}

export const ESCENAS_B = { presentate, conversa, mensajera, maquina, globos, lectura };
