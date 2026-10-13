// Tipos de paso del modo juego. Cada uno recibe:
//   { paso, leccion, tablero, decir, completar, palabra, yaHecho, siguiente, alLibro, reiniciar }
// pinta su tablero y llama a completar() cuando se ha hecho lo que pedía.
// bien(nodo) y mal(nodo) avisan al motor de cada acierto y cada fallo (sonido, chispas, racha).
//
// REGLA DE ORO: ningún paso se completa solo por tocar. Siempre hay que acertar algo que
// exige haber leído, y lo que se falla VUELVE más tarde: pensar sale más barato que tocar al azar.
// Puede devolver una función de limpieza (temporizadores…).

import { el, poner, enLinea, barajar } from '../dom.js';
import { t, tr } from '../i18n.js';
import { sonar, pronunciar } from '../sonidos.js';
import { crearEjercicio } from '../exercises.js';
import { apuntarPalabrasDeLeccion } from '../comunes.js';
import { estadoEjercicio, resumenLeccion, marcarTerminada } from '../progress.js';
import { TIPOS_EJERCICIO } from '../lessons.js';
import { LANG } from '../curso.js';

const mayuscula = texto => texto.charAt(0).toLocaleUpperCase(LANG) + texto.slice(1);

/** Temporizadores que se cancelan solos al salir del paso. */
export function relojes() {
  const lista = [];
  return {
    luego: (fn, ms) => { lista.push(setTimeout(fn, ms)); },
    limpiar: () => lista.forEach(clearTimeout),
  };
}

/** Lee con la voz del dispositivo. Si no hay voz no pasa nada: el texto ya sale escrito (ver botonOir). */
export function oir(texto) {
  pronunciar(texto);
}

/**
 * Botones de respuesta: solo uno vale. Al fallar, ese botón se apaga;
 * si alFallar devuelve 'cerrar', se acaba la pregunta y se marca cuál era la buena.
 */
export function respuestas(lista, { texto, esBuena, lang, alAcertar, alFallar }) {
  let resuelta = false;
  const botones = lista.map(opcion => {
    const boton = el('button', { type: 'button', class: 'boton juego-opcion', lang: lang ?? null }, texto(opcion));
    boton.addEventListener('click', () => {
      if (resuelta) return;
      if (esBuena(opcion)) {
        resuelta = true;
        boton.classList.add('es-correcta');
        alAcertar(boton, opcion);
        return;
      }
      boton.disabled = true;
      boton.classList.add('es-fallo');
      if (alFallar(boton, opcion) === 'cerrar') {
        resuelta = true;
        botones[lista.findIndex(esBuena)]?.classList.add('es-correcta');
      }
    });
    return boton;
  });
  return el('div', { class: 'juego-opciones' }, botones);
}

/** Lista sin repetidos (según una clave). */
export function unicos(lista, clave = x => x) {
  const vistos = new Set();
  return lista.filter(x => !vistos.has(clave(x)) && vistos.add(clave(x)));
}

/** Botón de escuchar y, para cuando el dispositivo no tiene voz, el mismo texto escrito. */
export function botonOir(texto) {
  return el('div', { class: 'juego-oir' },
    el('button', { type: 'button', class: 'boton boton-mini con-voz', onclick: () => oir(texto) }, `🔊 ${t('comun.escuchar')}`),
    el('p', { class: 'audio-texto sin-voz', lang: LANG }, texto));
}



// ---------------------------------------------------------------------------
// elige-pieza: varias piezas y solo una es la buena (la letra muda, la palabra que sobra…)
// ---------------------------------------------------------------------------

function eligePieza({ paso, tablero, decir, completar, bien, mal }) {
  let resuelto = false;
  const piezas = paso.piezas.map((texto, i) => {
    const boton = el('button', { type: 'button', class: 'juego-pieza', lang: LANG }, texto);
    boton.addEventListener('click', () => {
      if (resuelto) return;
      if (i === paso.correcta) {
        resuelto = true;
        boton.classList.add('acertada');
        bien(boton);
        decir(paso.bien, 'contenta');
        completar();
      } else {
        mal(boton);
        decir(paso.mal, 'pensando');
        if (paso.escucha) oir(paso.escucha, decir);
      }
    });
    return boton;
  });
  poner(tablero,
    paso.escucha && botonOir(paso.escucha, decir),
    el('div', { class: 'juego-piezas' }, piezas));
}

// ---------------------------------------------------------------------------
// reloj: se arrastra el sol por el día y el saludo de la tutora cambia; después, un reto con horas
// ---------------------------------------------------------------------------

function textoHora(h) {
  const horas = Math.floor(h) % 24;
  const minutos = h % 1 ? '30' : '00';
  const doce = horas % 12 === 0 ? 12 : horas % 12;
  return `${String(horas).padStart(2, '0')}:${minutos} · ${doce}${h % 1 ? ':30' : ''} ${horas < 12 ? 'am' : 'pm'}`;
}

function reloj({ paso, tablero, decir, completar, palabra, bien, mal }) {
  const { luego, limpiar } = relojes();
  const tramos = paso.tramos;
  const [minimo, maximo] = [tramos[0].desde, tramos[tramos.length - 1].hasta];
  const tramoDe = h => tramos.find(x => h >= x.desde && h < x.hasta) ?? tramos[tramos.length - 1];
  const saludoDe = x => `¡${mayuscula(palabra(x.palabra)?.es ?? x.palabra)}!`;
  const encontrados = new Set();
  let tramoActual = null;

  const astro = el('div', { class: 'reloj-astro', 'aria-hidden': 'true' });
  const hora = el('p', { class: 'reloj-hora' }, '--:--');
  const saludo = el('p', { class: 'reloj-saludo', lang: LANG }, '?');
  const cielo = el('div', { class: 'reloj-cielo' }, astro, hora, saludo, el('div', { class: 'reloj-suelo', 'aria-hidden': 'true' }));
  const mando = el('input', { type: 'range', class: 'reloj-mando', min: String(minimo), max: String(maximo - 0.5), step: '0.5', value: String(minimo), 'aria-label': t('juego.reloj.mando') });
  const insignias = el('ul', { class: 'reloj-insignias' });
  const zona = el('div', { class: 'reloj-zona' });

  function pintarInsignias() {
    poner(insignias, tramos.map(x => el('li', { class: encontrados.has(x) ? 'hallada' : '', lang: encontrados.has(x) ? 'es' : null },
      encontrados.has(x) ? `★ ${x.palabra}` : '☆ ???')));
  }

  function ponerHora(h) {
    const x = tramoDe(h);
    const noche = x.cielo === 'noche';
    const recorrido = (h - minimo) / (maximo - minimo); // 0 → 1 a lo largo del día
    cielo.className = `reloj-cielo cielo-${x.cielo}`;
    astro.classList.toggle('luna', noche);
    astro.style.left = `${8 + recorrido * 80}%`;
    astro.style.top = `${noche ? 14 : 62 - Math.sin(Math.min(1, (h - minimo) / (tramos[tramos.length - 1].desde - minimo)) * Math.PI) * 50}%`;
    hora.textContent = textoHora(h);
    mando.setAttribute('aria-valuetext', textoHora(h));
    return x;
  }

  // ---- 1.ª parte: explorar ----
  mando.addEventListener('input', () => {
    const x = ponerHora(Number(mando.value));
    saludo.textContent = saludoDe(x);
    if (x === tramoActual) return;
    tramoActual = x;
    oir(x.palabra, decir);
    if (!encontrados.has(x)) {
      encontrados.add(x);
      sonar('guardar');
      pintarInsignias();
      decir(x.nota, 'contenta');
      if (encontrados.size === tramos.length) {
        luego(() => {
          decir(paso.encontrados, 'contenta');
          poner(zona, el('button', { type: 'button', class: 'boton boton-principal', onclick: retar }, t('juego.reloj.empezar')));
          zona.querySelector('button').focus({ preventScroll: true });
        }, 1600);
      }
    } else {
      decir(`**${saludoDe(x)}**`, 'normal', { deGolpe: true });
    }
  });

  // ---- 2.ª parte: ¿qué digo a esta hora? ----
  function retar() {
    mando.disabled = true;
    insignias.hidden = true;
    const preguntas = [...paso.retos.map(h => ({ h })), paso.comodin && { comodin: paso.comodin }].filter(Boolean);
    let n = 0;

    function preguntar() {
      const q = preguntas[n];
      const marcador = el('p', { class: 'aprox' }, t('juego.cuenta', { n: n + 1, total: preguntas.length }));
      if (!q) return;
      let claves;
      let correcta;
      if (q.comodin) {
        claves = [q.comodin.palabra, ...tramos.map(x => x.palabra)];
        correcta = q.comodin.palabra;
        saludo.textContent = '?';
        decir(q.comodin.pregunta, 'pensando');
      } else {
        const x = ponerHora(q.h);
        mando.value = String(q.h);
        claves = tramos.map(y => y.palabra);
        correcta = x.palabra;
        saludo.textContent = '?';
        decir(tr(paso.pregunta).replace('{hora}', `**${textoHora(q.h)}**`), 'pensando');
      }
      const tramoBueno = tramos.find(y => y.palabra === correcta);
      const botones = respuestas(claves, {
        lang: LANG,
        texto: clave => palabra(clave)?.es ?? clave,
        esBuena: clave => clave === correcta,
        alAcertar: boton => {
          bien(boton);
          oir(correcta, decir);
          saludo.textContent = `¡${mayuscula(correcta)}!`;
          decir(q.comodin ? q.comodin.bien : tramoBueno.nota, 'contenta');
          n += 1;
          if (n < preguntas.length) luego(preguntar, 1700);
          else { poner(zona, el('p', { class: 'juego-hecho' }, t('juego.hecho'))); completar(); }
        },
        alFallar: boton => {
          mal(boton);
          decir(q.comodin ? q.comodin.mal : tramoBueno.nota, 'pensando');
          if (!q.vuelve) { q.vuelve = true; preguntas.push({ ...q, vuelve: false }); }
        },
      });
      poner(zona, marcador, botones);
    }
    preguntar();
  }

  ponerHora(minimo);
  pintarInsignias();
  poner(tablero, cielo, mando, el('p', { class: 'aprox reloj-ayuda' }, t('juego.reloj.ayuda')), insignias, zona);
  return limpiar;
}

// ---------------------------------------------------------------------------
// descifra: el diálogo, frase a frase; hay que tocar cada trozo para ver qué hace
// ---------------------------------------------------------------------------

/** Parte la frase en trozos de texto normal y trozos del análisis. null si no encajan. */
function trocear(es, analisis) {
  if (!analisis?.length) return null;
  const minus = es.toLocaleLowerCase(LANG);
  const trozos = [];
  let cursor = 0;
  for (const parte of analisis) {
    const busca = parte.texto.toLocaleLowerCase(LANG);
    let i = minus.indexOf(busca, cursor);
    let largo = busca.length;
    if (i < 0) {
      const limpio = busca.replace(/[?!.]+$/, '').replace(/^[¿¡]+/, '');
      i = minus.indexOf(limpio, cursor);
      largo = limpio.length;
    }
    if (i < 0) return null;
    if (i > cursor) trozos.push({ texto: es.slice(cursor, i) });
    trozos.push({ texto: es.slice(i, i + largo), funcion: parte.funcion });
    cursor = i + largo;
  }
  if (cursor < es.length) trozos.push({ texto: es.slice(cursor) });
  return trozos;
}

function descifra({ paso, leccion, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const frases = leccion.bloques[paso.bloque]?.frases ?? [];
  const chat = el('ol', { class: 'juego-chat' });
  const zona = el('div', { class: 'juego-continuar' });
  const repaso = []; // frases cuyo significado se falló: se preguntan otra vez al final
  let n = 0;

  /** ¿Qué significa esta frase? Tres traducciones, una buena. */
  function preguntarSignificado(frase, alAcertar) {
    const otras = barajar(unicos(frases.filter(f => tr(f.trad) !== tr(frase.trad)), f => tr(f.trad))).slice(0, 2);
    let fallada = false;
    poner(zona,
      el('p', { class: 'ejercicio-pregunta' }, t('juego.descifra.pregunta')),
      respuestas(barajar([frase, ...otras]), {
        texto: f => tr(f.trad),
        esBuena: f => f === frase,
        alAcertar: boton => { bien(boton); alAcertar(); },
        alFallar: boton => {
          mal(boton);
          decir(t('juego.descifra.no'), 'pensando');
          if (!fallada) { fallada = true; repaso.push(frase); }
        },
      }));
  }

  function acabar() {
    if (repaso.length) {
      const frase = repaso.shift();
      decir(t('juego.descifra.repaso', { es: frase.es }), 'pensando');
      oir(frase.es, decir);
      preguntarSignificado(frase, () => { poner(zona); luego(acabar, 900); });
      return;
    }
    poner(zona, el('p', { class: 'juego-hecho' }, t('juego.hecho')));
    if (paso.despues) decir(paso.despues, 'contenta');
    completar();
  }

  function mostrar() {
    const frase = frases[n];
    const trozos = trocear(frase.es, frase.analisis) ?? [{ texto: frase.es, funcion: '' }];
    const traduccion = el('p', { class: 'frase-trad', hidden: true }, tr(frase.trad));
    let pendientes = trozos.filter(x => x.funcion !== undefined).length;
    let color = 0;

    const linea = el('p', { class: 'juego-linea', lang: LANG }, trozos.map(x => {
      if (x.funcion === undefined) return x.texto;
      color += 1;
      const funcion = el('span', { class: 'trozo-funcion', lang: '', hidden: true }, tr(x.funcion));
      const boton = el('button', { type: 'button', class: `juego-trozo color-${((color - 1) % 4) + 1}` }, el('span', {}, x.texto), funcion);
      boton.addEventListener('click', () => {
        oir(x.texto, decir);
        if (tr(x.funcion)) funcion.hidden = false;
        descubierto(boton);
      });
      return boton;
    }));

    function descubierto(boton) {
      if (boton.classList.contains('visto')) return;
      boton.classList.add('visto');
      sonar('clic');
      pendientes -= 1;
      if (pendientes > 0) return;
      preguntarSignificado(frase, () => {
        traduccion.hidden = false;
        const nota = frase.notas?.[0] ? ` ${tr(frase.notas[0])}` : '';
        decir(`${t('juego.descifra.significa', { trad: tr(frase.trad) })}${nota}`, nota ? 'pensando' : 'contenta');
        n += 1;
        const ultima = n >= frases.length;
        const boton2 = el('button', { type: 'button', class: 'boton boton-principal', onclick: () => { poner(zona); if (ultima) acabar(); else mostrar(); } }, ultima ? t('juego.siguiente') : t('juego.descifra.otra'));
        poner(zona, boton2);
        boton2.focus({ preventScroll: true });
      });
    }

    chat.querySelectorAll('.juego-turno').forEach(li => li.classList.add('pasado'));
    const li = el('li', { class: 'juego-turno' },
      frase.quien && el('span', { class: 'frase-quien' }, `${frase.quien}:`),
      linea, traduccion);
    chat.append(li);
    li.scrollIntoView({ block: 'nearest' });
    oir(frase.es, decir);
  }

  poner(tablero, el('p', { class: 'aprox' }, t('juego.descifra.ayuda')), chat, zona);
  if (frases.length) mostrar(); else completar();
  return limpiar;
}

// ---------------------------------------------------------------------------
// rellena: una frase con huecos; cada hueco tiene sus opciones al lado. Un fallo vacía todos los huecos.
// ---------------------------------------------------------------------------

function rellena({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  function pintar() {
    let pendientes = paso.huecos.length;
    const nodos = paso.frase.split(/\{(\d+)\}/).map((parte, i) => {
      if (i % 2 === 0) return parte;
      const hueco = paso.huecos[Number(parte)];
      const grupo = el('span', { class: 'juego-hueco' });
      poner(grupo, barajar(hueco.opciones).map(opcion => {
        const boton = el('button', { type: 'button', class: 'juego-pieza pieza-mini' }, opcion);
        boton.addEventListener('click', () => {
          if (opcion === hueco.correcta) {
            poner(grupo, el('strong', { class: 'hueco-lleno' }, opcion));
            pendientes -= 1;
            if (pendientes > 0) { sonar('clic'); return; }
            bien(tablero.firstElementChild);
            decir(paso.bien, 'contenta');
            completar();
          } else {
            mal(boton);
            decir(paso.mal, 'pensando');
            luego(pintar, 900);
          }
        });
        return boton;
      }));
      return grupo;
    });
    poner(tablero, el('p', { class: 'juego-frase-huecos', lang: LANG }, nodos));
  }
  pintar();
  return limpiar;
}

// ---------------------------------------------------------------------------
// rol: la tutora hace de un personaje del diálogo y tú contestas por el otro
// ---------------------------------------------------------------------------

function rol({ paso, leccion, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const frases = leccion.bloques[paso.bloque]?.frases ?? [];
  const chat = el('ol', { class: 'juego-chat' });
  const zona = el('div', { class: 'juego-continuar' });
  const distractores = [
    ...frases.map(f => ({ es: f.es, trad: f.trad })),
    ...(paso.extras ?? []),
  ];
  let n = 0;

  function apuntar(frase, mia) {
    const li = el('li', { class: `juego-turno${mia ? ' mio' : ''}` },
      el('span', { class: 'frase-quien' }, `${mia ? t('juego.rol.tu') : t('tutora.nombre')}:`),
      el('p', { class: 'juego-linea', lang: LANG }, frase.es),
      el('p', { class: 'frase-trad' }, tr(frase.trad)));
    chat.append(li);
    li.scrollIntoView({ block: 'nearest' });
  }

  const repaso = []; // turnos fallados: { previa, buena }

  /** Ofrece tres respuestas; la buena es `buena`. La que acaba de decir la tutora no sale. */
  function contestar(buena, previa, alAcertar) {
    const otras = barajar(unicos(distractores.filter(d => d.es !== buena.es && d.es !== previa?.es), d => d.es)).slice(0, 2);
    let fallada = false;
    const botones = respuestas(barajar([buena, ...otras]), {
      lang: LANG,
      texto: o => o.es,
      esBuena: o => o === buena,
      alAcertar: boton => {
        bien(boton);
        apuntar(buena, true);
        oir(buena.es, decir);
        poner(zona);
        luego(alAcertar, 1500);
      },
      alFallar: (boton, opcion) => {
        mal(boton);
        decir(t('juego.rol.esoSignifica', { es: opcion.es, trad: tr(opcion.trad) }), 'pensando');
        if (!fallada) { fallada = true; repaso.push({ previa, buena }); }
      },
    });
    luego(() => poner(zona, el('p', { class: 'aprox' }, t('juego.rol.contesta')), botones), 700);
  }

  function repetir() {
    if (!repaso.length) {
      if (paso.despues) decir(paso.despues, 'contenta');
      poner(zona, el('p', { class: 'juego-hecho' }, t('juego.hecho')));
      completar();
      return;
    }
    const { previa, buena } = repaso.shift();
    if (previa) {
      apuntar(previa, false);
      decir(t('juego.rol.repaso', { es: previa.es }), 'pensando');
      oir(previa.es, decir);
    }
    contestar(buena, previa, repetir);
  }

  function avanzar() {
    poner(zona);
    // Las frases del otro personaje las dice la tutora.
    while (n < frases.length && frases[n].quien !== paso.papel) {
      apuntar(frases[n], false);
      decir(`**${frases[n].es}**`, 'normal');
      oir(frases[n].es, decir);
      n += 1;
    }
    if (n >= frases.length) { luego(repetir, 900); return; }
    const buena = frases[n];
    contestar(buena, frases[n - 1], () => { n += 1; avanzar(); });
  }

  poner(tablero, chat, zona);
  poner(zona, el('button', { type: 'button', class: 'boton boton-principal', onclick: avanzar }, t('juego.rol.empezar')));
  return limpiar;
}

// ---------------------------------------------------------------------------
// cartas: un mazo de palabras. Sale una, se oye y hay que elegir qué significa.
// Si se falla, se enseña la respuesta y la carta vuelve al final del mazo.
// ---------------------------------------------------------------------------

function cartas({ paso, tablero, decir, completar, palabra, bien, mal }) {
  const { luego, limpiar } = relojes();
  const mazo = [...paso.palabras];
  const total = mazo.length;
  const banco = unicos([...paso.palabras, ...(paso.distractores ?? [])]);
  const significado = clave => tr(palabra(clave)?.trad);

  function mostrar() {
    const clave = mazo[0];
    const v = palabra(clave);
    const es = v?.es ?? clave;
    const otras = barajar(unicos(banco.filter(c => significado(c) && significado(c) !== significado(clave)), significado)).slice(0, 2);
    const detalle = el('span', { class: 'carta-detalle', hidden: true },
      el('span', { class: 'carta-trad' }, significado(clave)),
      v?.pron && el('span', { class: 'carta-pron' }, v.pron));
    const carta = el('div', { class: 'juego-carta entra' },
      el('span', { class: 'carta-es', lang: LANG }, es), detalle, botonOir(es, decir));
    const zona = el('div', { class: 'juego-continuar' });
    const pila = el('p', { class: 'carta-pila', 'aria-label': t('juego.cartas.cuenta', { n: total - mazo.length, total }) },
      Array.from({ length: total }, (_, i) => el('i', { class: i < total - mazo.length ? 'ganada' : '' })));

    const seguir = () => {
      const boton = el('button', { type: 'button', class: 'boton boton-principal' }, mazo.length ? t('juego.cartas.otra') : t('juego.siguiente'));
      boton.addEventListener('click', () => {
        if (mazo.length) { mostrar(); return; }
        poner(zona, el('p', { class: 'juego-hecho' }, t('juego.hecho')));
        if (paso.despues) decir(paso.despues, 'contenta');
        completar();
      });
      luego(() => { poner(zona, boton); boton.focus({ preventScroll: true }); }, 500);
    };
    const destapar = () => { detalle.hidden = false; carta.classList.add('vuelta'); };

    poner(zona,
      el('p', { class: 'ejercicio-pregunta' }, t('juego.cartas.pregunta')),
      respuestas(barajar([clave, ...otras]), {
        texto: significado,
        esBuena: c => c === clave,
        alAcertar: () => {
          mazo.shift();
          destapar();
          carta.classList.add('ganada');
          pila.children[total - mazo.length - 1]?.classList.add('ganada');
          bien(carta);
          decir(`**${es}**: ${tr(v?.consejo) ?? significado(clave)}`, 'contenta');
          seguir();
        },
        alFallar: boton => {
          mazo.push(mazo.shift());
          destapar();
          mal(boton);
          oir(es, decir);
          decir(t('juego.cartas.vuelve', { es, trad: significado(clave) }), 'apurada');
          seguir();
          return 'cerrar';
        },
      }));
    poner(tablero, pila, carta, zona);
    oir(es, decir);
  }

  mostrar();
  return limpiar;
}

// ---------------------------------------------------------------------------
// parejas: unir cada palabra con su significado, en rondas cortas
// ---------------------------------------------------------------------------

function parejas({ paso, tablero, decir, completar, palabra, bien, mal }) {
  const { luego, limpiar } = relojes();
  const MAXIMO = 5;
  const numRondas = Math.ceil(paso.palabras.length / MAXIMO);
  const tamano = Math.ceil(paso.palabras.length / numRondas);
  const rondas = Array.from({ length: numRondas }, (_, i) => paso.palabras.slice(i * tamano, (i + 1) * tamano));
  let ronda = 0;

  function jugar() {
    const claves = rondas[ronda];
    let quedan = claves.length;
    let izquierda = null;
    let derecha = null;

    const crear = (clave, lado) => {
      const v = palabra(clave);
      const boton = el('button', { type: 'button', class: 'juego-pareja', lang: lado === 'es' ? 'es' : null, 'aria-pressed': 'false' },
        lado === 'es' ? (v?.es ?? clave) : tr(v?.trad));
      boton.addEventListener('click', () => {
        if (lado === 'es') oir(v?.es ?? clave, decir);
        const anterior = lado === 'es' ? izquierda : derecha;
        anterior?.boton.setAttribute('aria-pressed', 'false');
        const elegido = { clave, boton };
        boton.setAttribute('aria-pressed', 'true');
        if (lado === 'es') izquierda = elegido; else derecha = elegido;
        if (!izquierda || !derecha) return;

        const [a, b] = [izquierda, derecha];
        izquierda = derecha = null;
        a.boton.setAttribute('aria-pressed', 'false');
        b.boton.setAttribute('aria-pressed', 'false');
        if (a.clave === b.clave) {
          for (const x of [a, b]) { x.boton.disabled = true; x.boton.classList.add('unida'); }
          bien(b.boton);
          quedan -= 1;
          if (quedan > 0) return;
          ronda += 1;
          if (ronda < rondas.length) luego(jugar, 900);
          else { decir(t('juego.parejas.fin'), 'contenta'); completar(); }
        } else {
          mal(a.boton);
          mal(b.boton);
        }
      });
      return boton;
    };

    poner(tablero,
      el('p', { class: 'aprox' }, t('juego.parejas.ronda', { n: ronda + 1, total: rondas.length })),
      el('div', { class: 'juego-parejas' },
        el('div', { class: 'parejas-columna' }, barajar(claves).map(c => crear(c, 'es'))),
        el('div', { class: 'parejas-columna' }, barajar(claves).map(c => crear(c, 'trad')))));
  }

  jugar();
  return limpiar;
}

// ---------------------------------------------------------------------------
// elige: preguntas rápidas de dos o tres opciones, una detrás de otra. La que se falla vuelve al final.
// ---------------------------------------------------------------------------

function elige({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const preguntas = paso.preguntas.map(q => ({ ...q }));
  let n = 0;

  function preguntar() {
    const q = preguntas[n];
    poner(tablero,
      el('p', { class: 'aprox' }, t('juego.cuenta', { n: n + 1, total: preguntas.length })),
      el('p', { class: 'ejercicio-pregunta' }, enLinea(tr(q.pregunta))),
      q.escucha && botonOir(q.escucha, decir),
      respuestas(barajar(q.opciones), {
        texto: o => tr(o.texto),
        esBuena: o => Boolean(o.correcta),
        alAcertar: (boton, opcion) => {
          bien(boton);
          decir(opcion.explica, 'contenta');
          n += 1;
          if (n < preguntas.length) luego(preguntar, 2200);
          else completar();
        },
        alFallar: (boton, opcion) => {
          mal(boton);
          decir(`${tr(opcion.explica)} ${t('juego.vuelve')}`, 'pensando');
          if (q.escucha) oir(q.escucha, decir);
          if (!q.vuelve) { q.vuelve = true; preguntas.push({ ...q, vuelve: false }); }
        },
      }));
    if (q.escucha) oir(q.escucha, decir);
  }

  preguntar();
  return limpiar;
}

// ---------------------------------------------------------------------------
// reto: uno de los ejercicios de la lección (cuenta para el progreso, como en el libro)
// ---------------------------------------------------------------------------

function reto({ paso, leccion, tablero, completar }) {
  const bloque = leccion.bloques[paso.bloque];
  if (!bloque || !TIPOS_EJERCICIO.includes(bloque.tipo)) {
    poner(tablero, el('p', { class: 'aviso-bloque' }, t('juego.retoNoExiste')));
    completar();
    return;
  }
  const numero = leccion.bloques.slice(0, paso.bloque + 1).filter(b => TIPOS_EJERCICIO.includes(b.tipo)).length;
  const acertado = () => estadoEjercicio(leccion.id, bloque.id).aciertos > 0;
  poner(tablero, crearEjercicio(bloque, leccion.id, numero, () => { if (acertado()) completar(); }));
  if (acertado()) completar();
}

// ---------------------------------------------------------------------------
// mision: la tarea libre de escribir y hablar, que la app no puede corregir
// ---------------------------------------------------------------------------

function mision({ paso, leccion, tablero, decir, completar }) {
  const texto = tr(leccion.bloques[paso.bloque]?.texto) ?? '';
  const [aviso, ...tareas] = String(texto).split(/\n\s*\n/);
  let pendientes = tareas.length;

  const tarjetas = tareas.map(tarea => {
    const [, titulo, cuerpo] = tarea.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/) ?? [null, t('juego.mision.tarea'), tarea];
    const contenido = el('div', { hidden: true },
      el('p', {}, enLinea(cuerpo)),
      el('button', {
        type: 'button', class: 'boton boton-mini', 'aria-pressed': 'false',
        onclick: e => {
          const hecho = e.currentTarget.getAttribute('aria-pressed') !== 'true';
          e.currentTarget.setAttribute('aria-pressed', String(hecho));
          e.currentTarget.textContent = t(hecho ? 'juego.mision.hecha' : 'juego.mision.marcar');
          if (hecho) { sonar('guardar'); decir(t('juego.mision.bien'), 'contenta'); }
        },
      }, t('juego.mision.marcar')));
    const abrir = el('button', { type: 'button', class: 'boton juego-mision-titulo', 'aria-expanded': 'false' }, titulo.replace(/\.$/, ''));
    abrir.addEventListener('click', () => {
      if (!contenido.hidden) return;
      for (const otra of tablero.querySelectorAll('.juego-mision')) {
        otra.lastElementChild.hidden = true;
        otra.firstElementChild.setAttribute('aria-expanded', 'false');
      }
      contenido.hidden = false;
      abrir.setAttribute('aria-expanded', 'true');
      sonar('pagina');
      if (abrir.dataset.vista) return;
      abrir.dataset.vista = 'si';
      pendientes -= 1;
      if (pendientes === 0) completar();
    });
    return el('div', { class: 'juego-mision' }, abrir, contenido);
  });

  poner(tablero, el('p', { class: 'nota' }, enLinea(aviso)), tarjetas);
  if (!tareas.length) completar();
}

// ---------------------------------------------------------------------------
// fin: resumen, estrellas y adónde ir ahora
// ---------------------------------------------------------------------------

function fin({ leccion, tablero, decir, completar, siguiente, alLibro, reiniciar }) {
  const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
  const completa = r.total === r.completados;
  if (completa && !r.terminada) marcarTerminada(leccion.id);
  // Las palabras de la lección pasan al cuaderno: desde ahora salen en el repaso.
  const nuevas = completa ? apuntarPalabrasDeLeccion(leccion, leccion.propias) : 0;
  const estrellas = r.completados < r.total ? 1 : r.errores === 0 ? 3 : r.errores <= 2 ? 2 : 1;

  poner(tablero,
    el('p', { class: 'juego-estrellas', 'aria-label': t('juego.fin.estrellas', { n: estrellas }) }, '★'.repeat(estrellas), el('span', { class: 'apagada' }, '★'.repeat(3 - estrellas))),
    el('h2', {}, t(completa ? 'leccion.terminada' : 'leccion.fin')),
    el('p', { class: 'resumen' }, t('leccion.progreso', r)),
    el('div', { class: 'botonera juego-fin-botones' },
      completa && leccion.propias.size ? el('a', { class: 'boton boton-principal boton-grande', href: '#/repaso' }, t('leccion.repasarAhora')) : null,
      siguiente
        ? el('a', { class: 'boton', href: `#/leccion/${siguiente}` }, t('leccion.siguiente'))
        : el('a', { class: 'boton', href: '#/lecciones' }, t('comun.volverLecciones')),
      el('button', { type: 'button', class: 'boton', onclick: reiniciar }, t('juego.fin.otraVez')),
      el('button', { type: 'button', class: 'boton', onclick: alLibro }, t('juego.verLibro'))));
  sonar('fin');
  decir([t(completa ? 'juego.fin.tutora' : 'juego.fin.faltan', { n: r.aciertos }), nuevas ? t('leccion.apuntadas', { n: nuevas }) : null].filter(Boolean).join(' '), 'contenta');
  completar();
}

export const ESCENAS = {
  'elige-pieza': eligePieza,
  reloj,
  descifra,
  rellena,
  rol,
  cartas,
  parejas,
  elige,
  reto,
  mision,
  fin,
};
