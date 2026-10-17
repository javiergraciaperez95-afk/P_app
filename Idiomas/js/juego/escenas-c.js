// Tercera tanda de tipos de paso del modo juego. Mismas reglas de siempre:
// ningún paso se completa solo por tocar, y lo que se falla vuelve más tarde.
// En varios de estos la tutora sale de su recuadro y actúa en una escena (retrato(false)).

import { el, poner, enLinea, barajar } from '../dom.js';
import { t, tr } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { crearSprite } from '../tutor-sprite.js';
import { animar, confeti } from './efectos.js';
import { relojes, oir, botonOir, respuestas } from './escenas.js';
import { LANG } from '../curso.js';
import { icono } from '../iconos.js';

const cuentaDe = (n, total) => t('juego.cuenta', { n, total });
const hecho = () => el('p', { class: 'juego-hecho centrado' }, t('juego.hecho'));
const minus = c => c.toLocaleLowerCase(LANG);

/**
 * La tutora dentro de una escena. ir(x, …) la lleva hasta x (un % o un calc()), andando o de un salto.
 * En el CSS, --medio es la mitad de su ancho: calc(40% - var(--medio)) la centra en el 40 %.
 */
function tutoraEnEscena(inicio) {
  const canvas = el('canvas', { class: 'esc-tutora', width: '48', height: '60', 'aria-hidden': 'true' });
  const sprite = crearSprite(canvas);
  canvas.style.left = inicio;
  return {
    canvas,
    sprite,
    ir(x, { luego, alLlegar, ms = 800, salto = false }) {
      canvas.style.transitionDuration = `${ms}ms`;
      canvas.style.setProperty('--ms', `${ms}ms`);
      canvas.classList.add(salto ? 'brinco' : 'andando');
      canvas.style.left = x;
      luego(() => { canvas.classList.remove('andando', 'brinco'); alLlegar?.(); }, ms + 30);
    },
  };
}
const centro = x => `calc(${x}% - var(--medio))`;

// ---------------------------------------------------------------------------
// mando: unas pocas frases fijas (los botones). Primero se oyen y se ve qué significan;
// después salen situaciones y hay que pulsar la frase que toca. La fallada vuelve.
// ---------------------------------------------------------------------------

function mando({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const vistos = new Set();
  const situacion = el('p', { class: 'mando-situacion' }, t('juego.mando.aprende'));
  const zona = el('div', { class: 'centrado' });
  let alPulsar = null;

  const botones = paso.botones.map((b, i) => {
    const trad = el('span', { class: 'frase-trad', hidden: true }, tr(b.trad));
    const boton = el('button', { type: 'button', class: 'mando-boton' }, el('span', { lang: LANG }, b.es), trad);
    boton.addEventListener('click', () => alPulsar?.(i, boton, trad));
    return { boton, trad };
  });

  // 1.ª parte: conocer las frases
  alPulsar = (i, boton, trad) => {
    oir(paso.botones[i].es.replace(/…/g, ''), decir);
    botones.forEach(b => { b.trad.hidden = true; }); // solo se ve la traducción de la última (así cabe en pantalla)
    trad.hidden = false;
    boton.classList.add('vista');
    sonar('clic');
    if (vistos.has(i)) return;
    vistos.add(i);
    if (vistos.size < botones.length) return;
    const empezar = el('button', { type: 'button', class: 'boton boton-principal', onclick: probar }, t('juego.reloj.empezar'));
    poner(zona, empezar);
  };

  // 2.ª parte: ¿qué dices en cada situación?
  function probar() {
    const cola = paso.situaciones.map(s => ({ ...s }));
    let hechas = 0;
    let parada = false;
    botones.forEach(b => { b.trad.hidden = true; });
    tablero.classList.add('mando-prueba');

    function preguntar() {
      if (!cola.length) {
        poner(situacion, t('juego.hecho'));
        if (paso.despues) decir(paso.despues, 'contenta');
        completar();
        return;
      }
      parada = false;
      poner(zona, el('span', { class: 'aprox' }, cuentaDe(hechas + 1, hechas + cola.length)));
      situacion.textContent = tr(cola[0].pasa);
      animar(situacion, 'entra');
      decir(cola[0].dice ?? t('juego.mando.elige'), cola[0].cara ?? 'pensando');
    }

    alPulsar = (i, boton) => {
      if (parada || !cola.length) return;
      const s = cola[0];
      if (i === s.correcta) {
        parada = true;
        cola.shift();
        hechas += 1;
        oir(paso.botones[i].es.replace(/…/g, ''), decir);
        bien(boton);
        decir(s.bien, 'contenta');
        luego(preguntar, 2600);
      } else {
        mal(boton);
        decir(t('juego.mando.eso', { es: paso.botones[i].es, trad: tr(paso.botones[i].trad) }), 'pensando');
        if (!s.vuelve) { s.vuelve = true; cola.push({ ...s, vuelve: false }); }
      }
    };
    preguntar();
  }

  poner(tablero, situacion, el('div', { class: 'mando-botones' }, botones.map(b => b.boton)), zona);
  return limpiar;
}

// ---------------------------------------------------------------------------
// pizarra: una palabra con un hueco escrita en la pizarra. Se elige la letra (la tiza)
// y la tutora va hasta el hueco y la escribe. La palabra fallada vuelve.
// ---------------------------------------------------------------------------

function pizarra({ paso, tablero, decir, completar, bien, mal, retrato }) {
  const { luego, limpiar } = relojes();
  retrato(false);
  const CASA = '2%';
  const tutora = tutoraEnEscena(CASA);
  const cola = paso.palabras.map(p => ({ ...p }));
  let hechas = 0;
  let ocupada = false;
  const tiza = el('p', { class: 'piz-palabra', lang: LANG });
  const escenario = el('div', { class: 'escenario esc-pizarra-grande' },
    el('div', { class: 'piz-tablero' }, tiza), el('div', { class: 'esc-suelo', 'aria-hidden': 'true' }), tutora.canvas);
  const zona = el('div', { class: 'piz-opciones' });
  const cuenta = el('p', { class: 'aprox' });

  function nueva() {
    if (!cola.length) {
      poner(zona, hecho());
      tutora.sprite.expresion = 'contenta';
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    const p = cola[0];
    ocupada = false;
    tutora.sprite.expresion = 'normal';
    const hueco = el('span', { class: 'piz-hueco' }, '_');
    poner(tiza, p.antes ?? '', hueco, p.despues ?? '');
    cuenta.textContent = cuentaDe(hechas + 1, hechas + cola.length);
    poner(zona, botonOir(p.oye, decir), barajar(p.opciones).map(letra => {
      const boton = el('button', { type: 'button', class: 'juego-pieza pieza-mini', lang: LANG }, letra);
      boton.addEventListener('click', () => elegir(p, letra, hueco, boton));
      return boton;
    }));
    oir(p.oye, decir);
  }

  function elegir(p, letra, hueco, boton) {
    if (ocupada) return;
    ocupada = true;
    sonar('pagina');
    const e = escenario.getBoundingClientRect();
    const h = hueco.getBoundingClientRect();
    const x = ((h.left + h.width / 2 - e.left) / e.width) * 100;
    tutora.ir(centro(x), { luego, alLlegar: () => {
      const acierto = letra === p.correcta;
      hueco.textContent = letra;
      hueco.classList.add(acierto ? 'bien' : 'mal');
      if (acierto) {
        cola.shift();
        hechas += 1;
        tutora.sprite.expresion = 'contenta';
        oir(p.oye, decir);
        bien(hueco);
        decir(p.bien, 'contenta');
      } else {
        cola.push(cola.shift());
        tutora.sprite.expresion = 'confundida';
        mal(boton);
        decir(p.mal?.[letra] ?? p.pista, 'pensando');
      }
      luego(() => tutora.ir(CASA, { luego, alLlegar: nueva }), acierto ? 2100 : 1900);
    } });
  }

  poner(tablero, escenario, zona, cuenta);
  nueva();
  return () => { limpiar(); tutora.sprite.parar(); retrato(true); };
}

// ---------------------------------------------------------------------------
// letras: se da un significado y hay que escribir la palabra española tocando sus letras,
// que salen desordenadas. Si se toca una letra que no toca, la palabra vuelve después.
// ---------------------------------------------------------------------------

function letras({ paso, tablero, decir, completar, palabra, bien, mal }) {
  const { luego, limpiar } = relojes();
  const cola = [...paso.palabras];
  let hechas = 0;

  function ronda() {
    if (!cola.length) {
      poner(tablero, hecho());
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    const clave = cola[0];
    const v = palabra(clave);
    const es = v?.es ?? clave;
    const letrasEs = [...es];
    let n = 0;
    let fallada = false;
    const huecos = letrasEs.map(c => el('span', { class: c === ' ' ? 'let-espacio' : 'let-hueco' }));
    const fila = el('p', { class: 'let-palabra', lang: LANG }, huecos);

    const fichas = barajar(letrasEs.filter(c => c !== ' ')).map(c => {
      const boton = el('button', { type: 'button', class: 'juego-pieza pieza-mini', lang: LANG }, c);
      boton.addEventListener('click', () => {
        while (letrasEs[n] === ' ') n += 1;
        if (minus(c) !== minus(letrasEs[n])) {
          mal(boton);
          decir(t('juego.letras.no'), 'pensando');
          if (!fallada) { fallada = true; cola.push(clave); }
          return;
        }
        huecos[n].textContent = letrasEs[n];
        huecos[n].classList.add('llena');
        boton.disabled = true;
        n += 1;
        while (letrasEs[n] === ' ') n += 1;
        if (n < letrasEs.length) { sonar('clic'); return; }
        cola.shift();
        hechas += 1;
        oir(es, decir);
        bien(fila);
        decir(`**${es}**: ${tr(v?.trad)}`, 'contenta');
        luego(ronda, 1600);
      });
      return boton;
    });

    poner(tablero,
      el('p', { class: 'aprox' }, cuentaDe(hechas + 1, hechas + cola.length)),
      el('p', { class: 'globos-pide' }, t('juego.letras.meta')),
      el('p', { class: 'globos-meta' }, tr(v?.trad)),
      fila,
      el('div', { class: 'let-fichas' }, fichas));
  }

  ronda();
  return limpiar;
}

// ---------------------------------------------------------------------------
// rayuela: una fila de casillas numeradas y la tutora saltando por ellas.
// 1.º se cuenta con ella, en orden; 2.º sale el número en letras y hay que mandarla a su casilla.
// ---------------------------------------------------------------------------

function rayuela({ paso, tablero, decir, completar, bien, mal, retrato }) {
  const { luego, limpiar } = relojes();
  retrato(false);
  const nombres = paso.nombres;
  const total = nombres.length;
  const xDe = i => centro(((i + 0.5) / total) * 100);
  const tutora = tutoraEnEscena(xDe(0));
  const cartel = el('p', { class: 'ray-cartel', lang: LANG }, '?');
  const pide = el('p', { class: 'ray-pide' }, t('juego.rayuela.orden'));
  const zona = el('div', { class: 'centrado' });
  let ocupada = false;
  let alTocar = null;

  const casillas = nombres.map((_, i) => {
    const boton = el('button', { type: 'button', class: 'ray-casilla' }, String(i));
    boton.addEventListener('click', () => { if (!ocupada) alTocar?.(i, boton); });
    return boton;
  });
  const saltarA = (i, alLlegar) => {
    ocupada = true;
    sonar('clic');
    tutora.ir(xDe(i), { luego, ms: 420, salto: true, alLlegar: () => { ocupada = false; alLlegar(); } });
  };

  // 1.ª parte: contar en orden
  let toca = 0;
  alTocar = (i, boton) => {
    if (i !== toca) {
      mal(boton);
      decir(t('juego.rayuela.sigue', { n: toca }), 'pensando');
      return;
    }
    saltarA(i, () => {
      cartel.textContent = nombres[i];
      animar(cartel, 'brinca');
      boton.classList.add('pisada');
      oir(nombres[i], decir);
      decir(`**${i}** · **${nombres[i]}**`, 'contenta', { deGolpe: true });
      toca += 1;
      if (toca < total) return;
      alTocar = null;
      luego(() => {
        decir(paso.encontrados, 'contenta');
        poner(zona, el('button', { type: 'button', class: 'boton boton-principal', onclick: probar }, t('juego.reloj.empezar')));
      }, 900);
    });
  };

  // 2.ª parte: del número en letras a la casilla
  function probar() {
    const cola = [...paso.retos];
    let hechas = 0;
    casillas.forEach(c => c.classList.remove('pisada'));
    pide.textContent = t('juego.rayuela.busca');

    function preguntar() {
      if (!cola.length) {
        cartel.textContent = '★';
        poner(zona, hecho());
        tutora.sprite.expresion = 'contenta';
        if (paso.despues) decir(paso.despues, 'contenta');
        alTocar = null;
        completar();
        return;
      }
      tutora.sprite.expresion = 'normal';
      cartel.textContent = nombres[cola[0]];
      animar(cartel, 'brinca');
      poner(zona, el('span', { class: 'aprox' }, cuentaDe(hechas + 1, hechas + cola.length)));
      oir(nombres[cola[0]], decir);
    }

    alTocar = (i, boton) => {
      const buena = cola[0];
      saltarA(i, () => {
        ocupada = true;
        if (i === buena) {
          cola.shift();
          hechas += 1;
          tutora.sprite.expresion = 'contenta';
          bien(boton);
          decir(`**${nombres[i]}** = **${i}**`, 'contenta', { deGolpe: true });
        } else {
          cola.push(cola.shift());
          tutora.sprite.expresion = 'apurada';
          mal(boton);
          decir(t('juego.rayuela.ese', { n: i, es: nombres[i] }), 'pensando');
        }
        luego(() => { ocupada = false; preguntar(); }, i === buena ? 1100 : 1900);
      });
    };
    preguntar();
  }

  poner(tablero, pide, cartel,
    el('div', { class: 'escenario esc-rayuela' }, tutora.canvas, el('div', { class: 'ray-casillas' }, casillas)),
    zona);
  return () => { limpiar(); tutora.sprite.parar(); retrato(true); };
}

// ---------------------------------------------------------------------------
// velas: sale una frase con una cantidad («Tengo ocho años») y hay que poner
// ese número de velas en la tarta con + y −. La frase fallada vuelve.
// ---------------------------------------------------------------------------

function velas({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const cola = paso.retos.map(r => ({ ...r }));
  const maximo = paso.max ?? 10;
  let hechas = 0;
  let n = 0;
  let parada = false;
  const frase = el('p', { class: 'velas-frase', lang: LANG });
  const fila = el('div', { class: 'velas-fila' });
  const tarta = el('div', { class: 'velas-tarta' }, fila, el('div', { class: 'velas-bizcocho', 'aria-hidden': 'true' }));
  const cuenta = el('p', { class: 'aprox' });
  const pintar = () => poner(fila, Array.from({ length: n }, () => el('i', { class: 'vela' })));
  const cambiar = d => { if (parada) return; n = Math.max(0, Math.min(maximo, n + d)); pintar(); sonar('clic'); };

  function nueva() {
    if (!cola.length) {
      frase.textContent = t('juego.hecho');
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    parada = false;
    n = 0;
    pintar();
    frase.textContent = cola[0].es;
    cuenta.textContent = cuentaDe(hechas + 1, hechas + cola.length);
    oir(cola[0].es, decir);
  }

  const listo = el('button', { type: 'button', class: 'boton boton-principal' }, t('juego.velas.listo'));
  listo.addEventListener('click', () => {
    if (parada || !cola.length) return;
    const r = cola[0];
    if (n !== r.n) {
      mal(tarta);
      decir(t('juego.velas.no', { n }), 'pensando');
      if (!r.vuelve) { r.vuelve = true; cola.push({ ...r, vuelve: false }); }
      return;
    }
    parada = true;
    cola.shift();
    hechas += 1;
    bien(tarta);
    decir(`**${r.es}** ${tr(r.trad)}`, 'contenta');
    luego(nueva, 1900);
  });

  poner(tablero, cuenta,
    paso.pregunta && el('p', { class: 'velas-pregunta', lang: LANG }, paso.pregunta),
    frase, tarta,
    el('div', { class: 'velas-mandos' },
      el('button', { type: 'button', class: 'juego-pieza pieza-mini', 'aria-label': t('juego.velas.menos'), onclick: () => cambiar(-1) }, '−'),
      listo,
      el('button', { type: 'button', class: 'juego-pieza pieza-mini', 'aria-label': t('juego.velas.mas'), onclick: () => cambiar(1) }, '+')));
  nueva();
  return limpiar;
}

// ---------------------------------------------------------------------------
// telefono: la tutora dicta un número, cifra a cifra y en letras; hay que marcarlo.
// Si se pulsa una tecla que no toca, ese número vuelve después.
// ---------------------------------------------------------------------------

function telefono({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const nombres = paso.nombres;
  const cola = paso.retos.map(r => ({ ...r }));
  let hechas = 0;
  let marcados = [];
  let parada = false;
  const quien = el('p', { class: 'tel-quien' });
  const dicta = el('p', { class: 'tel-dicta', lang: LANG });
  const pantalla = el('p', { class: 'tel-pantalla' });
  const cuenta = el('p', { class: 'aprox' });
  const pintar = () => { pantalla.textContent = cola[0] ? cola[0].numero.map((_, i) => marcados[i] ?? '·').join(' ') : '✔'; };

  function nueva() {
    if (!cola.length) {
      pintar();
      dicta.textContent = t('juego.hecho');
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    parada = false;
    marcados = [];
    const r = cola[0];
    quien.textContent = t('juego.telefono.llama', { quien: r.quien });
    dicta.textContent = r.numero.map(d => nombres[d]).join(' · ');
    cuenta.textContent = cuentaDe(hechas + 1, hechas + cola.length);
    pintar();
    oir(r.numero.map(d => nombres[d]).join(', '), decir);
  }

  const teclas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => {
    const boton = el('button', { type: 'button', class: `tel-tecla${d === 0 ? ' cero' : ''}` }, String(d));
    boton.addEventListener('click', () => {
      if (parada || !cola.length) return;
      const r = cola[0];
      if (d !== r.numero[marcados.length]) {
        mal(boton);
        decir(t('juego.telefono.no', { n: d, es: nombres[d] }), 'pensando');
        if (!r.vuelve) { r.vuelve = true; cola.push({ ...r, vuelve: false }); }
        return;
      }
      marcados.push(d);
      pintar();
      sonar('clic');
      if (marcados.length < r.numero.length) return;
      parada = true;
      cola.shift();
      hechas += 1;
      sonar('risa');
      bien(pantalla);
      decir(t('juego.telefono.bien', { quien: r.quien }), 'contenta');
      luego(nueva, 1900);
    });
    return boton;
  });

  poner(tablero, cuenta, quien, dicta, pantalla, el('div', { class: 'tel-teclado' }, teclas));
  nueva();
  return limpiar;
}

// ---------------------------------------------------------------------------
// bingo: un cartón de números. La tutora canta uno en español y hay que marcarlo.
// Si se marca otro, ese canto vuelve más tarde. Con el cartón lleno: ¡bingo!
// ---------------------------------------------------------------------------

function bingo({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  let ronda = 0;

  function jugar() {
    const carton = paso.cartones[ronda];
    const cola = barajar([...carton]);
    let parada = false;
    const canto = el('p', { class: 'bingo-canto', lang: LANG });
    const zona = el('div', { class: 'centrado' });

    function cantar() {
      if (cola.length) {
        parada = false;
        canto.textContent = paso.numeros[cola[0]];
        animar(canto, 'brinca');
        oir(paso.numeros[cola[0]], decir);
        return;
      }
      canto.textContent = t('juego.bingo.bingo');
      decir(t('juego.bingo.lleno'), 'contenta');
      sonar('fin');
      confeti(50);
      ronda += 1;
      if (ronda < paso.cartones.length) {
        poner(zona, el('button', { type: 'button', class: 'boton boton-principal', onclick: jugar }, t('juego.cartas.otra')));
        return;
      }
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
    }

    const rejilla = el('div', { class: 'bingo-carton' }, carton.map(n => {
      const celda = el('button', { type: 'button', class: 'bingo-celda' }, String(n));
      celda.addEventListener('click', () => {
        if (parada || !cola.length) return;
        parada = true;
        if (n === cola[0]) {
          cola.shift();
          celda.disabled = true;
          celda.classList.add('marcada');
          bien(celda);
          decir(`**${paso.numeros[n]}** = **${n}**`, 'contenta', { deGolpe: true });
          luego(cantar, 900);
        } else {
          cola.push(cola.shift());
          mal(celda);
          decir(t('juego.bingo.ese', { n, es: paso.numeros[n] }), 'pensando');
          luego(cantar, 2000);
        }
      });
      return celda;
    }));

    poner(tablero,
      el('p', { class: 'aprox' }, cuentaDe(ronda + 1, paso.cartones.length)),
      el('p', { class: 'globos-pide' }, t('juego.bingo.canta')),
      canto, rejilla, zona);
    cantar();
  }

  jugar();
  return limpiar;
}

// ---------------------------------------------------------------------------
// parada: llegan varios autobuses con su número. El cartel dice cuál hay que coger, en letras;
// la tutora va hasta el que se toque y, si es el suyo, se sube. El fallado vuelve.
// ---------------------------------------------------------------------------

function parada({ paso, tablero, decir, completar, bien, mal, retrato }) {
  const { luego, limpiar } = relojes();
  retrato(false);
  const CASA = '2%';
  const tutora = tutoraEnEscena(CASA);
  const cola = paso.retos.map(r => ({ ...r }));
  let hechas = 0;
  let ocupada = false;
  const cartel = el('p', { class: 'par-cartel' });
  const calle = el('div', { class: 'par-calle' });
  const cuenta = el('p', { class: 'aprox' });

  function nueva() {
    if (!cola.length) {
      poner(calle);
      poner(cartel, t('juego.hecho'));
      tutora.sprite.expresion = 'contenta';
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    const r = cola[0];
    ocupada = false;
    tutora.canvas.hidden = false;
    tutora.sprite.expresion = 'normal';
    poner(cartel, t('juego.parada.tuyo'), ' ', el('strong', { lang: LANG }, r.es));
    cuenta.textContent = cuentaDe(hechas + 1, hechas + cola.length);
    poner(calle, barajar([r.buena, ...r.otras]).map((n, i) => {
      const x = 40 + i * 24;
      const bus = el('button', { type: 'button', class: 'par-bus llega', style: `left:${x}%;animation-delay:${i * 90}ms` },
        el('span', { class: 'par-numero' }, String(n)));
      bus.addEventListener('click', () => subir(r, n, x, bus));
      return bus;
    }));
    oir(r.es, decir);
  }

  function subir(r, n, x, bus) {
    if (ocupada) return;
    ocupada = true;
    sonar('pagina');
    tutora.ir(centro(x), { luego, alLlegar: () => {
      if (n === r.buena) {
        cola.shift();
        hechas += 1;
        tutora.canvas.hidden = true; // se ha subido
        bus.classList.remove('llega');
        bus.classList.add('se-va');
        bien(bus);
        decir(`**${r.es}** = **${n}**`, 'contenta');
        luego(() => { tutora.ir(CASA, { luego, ms: 0, alLlegar: nueva }); }, 1500);
      } else {
        cola.push(cola.shift());
        tutora.sprite.expresion = 'apurada';
        mal(bus);
        decir(r.pista ?? t('juego.parada.ese', { n }), 'pensando');
        luego(() => tutora.ir(CASA, { luego, alLlegar: nueva }), 1500);
      }
    } });
  }

  poner(tablero, cartel,
    el('div', { class: 'escenario esc-parada' }, el('div', { class: 'par-asfalto', 'aria-hidden': 'true' }), calle, el('div', { class: 'par-poste', 'aria-hidden': 'true' }), tutora.canvas),
    cuenta);
  nueva();
  return () => { limpiar(); tutora.sprite.parar(); retrato(true); };
}

// ---------------------------------------------------------------------------
// clasifica: dos (o tres) carteles y una tarjeta. Se toca el cartel al que pertenece
// y la tutora la lleva hasta allí. La tarjeta fallada vuelve.
// ---------------------------------------------------------------------------

function clasifica({ paso, tablero, decir, completar, bien, mal, retrato }) {
  const { luego, limpiar } = relojes();
  retrato(false);
  const CASA = centro(50);
  const tutora = tutoraEnEscena(CASA);
  const cola = paso.cosas.map(c => ({ ...c }));
  let hechas = 0;
  let ocupada = false;
  const carta = el('p', { class: 'cla-carta' });
  const cuenta = el('p', { class: 'aprox' });
  const ultimo = paso.cestas.length - 1;

  const cestas = paso.cestas.map((c, i) => {
    const x = ultimo ? 23 + (i * 54) / ultimo : 50;
    const monton = el('span', { class: 'cla-monton' }, '0');
    const boton = el('button', { type: 'button', class: 'cla-cesta', style: `left:${x}%` },
      el('span', { class: 'cla-titulo', lang: LANG }, c.titulo), c.nota && el('span', { class: 'cla-nota' }, tr(c.nota)), monton);
    boton.addEventListener('click', () => llevar(c, x, boton, monton));
    return boton;
  });

  function nueva() {
    if (!cola.length) {
      poner(carta, t('juego.hecho'));
      tutora.sprite.expresion = 'contenta';
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    ocupada = false;
    tutora.sprite.expresion = 'normal';
    const c = cola[0];
    carta.textContent = tr(c.texto);
    carta.lang = typeof c.texto === 'string' ? LANG : '';
    animar(carta, 'entra');
    cuenta.textContent = cuentaDe(hechas + 1, hechas + cola.length);
    if (typeof c.texto === 'string') oir(c.texto, decir);
  }

  function llevar(cesta, x, boton, monton) {
    if (ocupada || !cola.length) return;
    ocupada = true;
    sonar('pagina');
    const c = cola[0];
    tutora.ir(centro(x), { luego, ms: 650, alLlegar: () => {
      const acierto = cesta.id === c.cesta;
      if (acierto) {
        cola.shift();
        hechas += 1;
        monton.textContent = String(Number(monton.textContent) + 1);
        tutora.sprite.expresion = 'contenta';
        bien(boton);
      } else {
        cola.push(cola.shift());
        tutora.sprite.expresion = 'apurada';
        mal(boton);
      }
      decir(c.por, acierto ? 'contenta' : 'pensando');
      luego(() => tutora.ir(CASA, { luego, ms: 650, alLlegar: nueva }), acierto ? 1500 : 2100);
    } });
  }

  poner(tablero, el('p', { class: 'aprox' }, t('juego.clasifica.ayuda')), carta,
    el('div', { class: 'escenario esc-clasifica' }, el('div', { class: 'esc-suelo', 'aria-hidden': 'true' }), ...cestas, tutora.canvas),
    cuenta);
  nueva();
  return () => { limpiar(); tutora.sprite.parar(); retrato(true); };
}

// ---------------------------------------------------------------------------
// explica: la explicación, como un juguete. Una palanca con varias posiciones; cada una enseña
// una frase (con lo que cambia resaltado), lo que significa y cómo suena.
// 1.º se prueban todas las posiciones. 2.º misiones: ya sin traducción ni etiquetas, hay que dejar
// la palanca en la frase que se pide y pulsar. La misión fallada vuelve.
// Un paso puede tener varias palancas seguidas. Va delante de los juegos que usan algo nuevo.
// «control» cambia el mando: 'deslizador' (se arrastra) o 'teclas' (un teclado de sonidos, con misiones de oído).
// ---------------------------------------------------------------------------

function explica({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  let n = 0;
  const limpio = texto => texto.replace(/\*\*/g, '');

  function abrir() {
    const p = paso.palancas[n];
    const vistas = new Set();
    let actual = -1;
    let cola = null; // las misiones, cuando empiezan
    let hechas = 0;
    let parada = false;
    tablero.classList.remove('pal-mision');

    const frase = el('p', { class: 'pal-frase', lang: LANG }, '?');
    const trad = el('p', { class: 'pal-trad' });
    const pide = el('p', { class: 'pal-pide' }, t(`juego.explica.prueba${p.control ? `.${p.control}` : ''}`));
    const zona = el('div', { class: 'centrado' });
    const botones = p.posiciones.map((pos, i) => {
      const boton = el('button', { type: 'button', class: 'pal-pos nueva', 'aria-pressed': 'false' }, tr(pos.etiqueta));
      boton.addEventListener('click', () => mover(i));
      return boton;
    });
    const mando = p.control === 'deslizador'
      ? el('input', { type: 'range', class: 'pal-deslizador', min: '0', max: String(p.posiciones.length - 1), step: '1', value: '0', 'aria-label': tr(p.titulo) })
      : null;
    mando?.addEventListener('input', () => mover(Number(mando.value)));
    const palanca = el('div', { class: `pal-palanca${p.control ? ` pal-${p.control}` : ''}` },
      mando, mando ? el('div', { class: 'pal-marcas' }, botones) : botones);

    function mover(i) {
      if (parada) return;
      const pos = p.posiciones[i];
      actual = i;
      if (mando) mando.value = String(i);
      botones.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      poner(frase, ...enLinea(pos.es));
      animar(frase, 'brinca');
      sonar('clic');
      oir(limpio(pos.es), decir);
      if (cola) return; // en las misiones no se enseña el significado
      poner(trad, ...enLinea(tr(pos.trad)));
      if (vistas.has(i)) return;
      vistas.add(i);
      botones[i].classList.remove('nueva');
      if (vistas.size < botones.length) return;
      luego(() => {
        decir(t('juego.explica.listo'), 'contenta');
        poner(zona, el('button', { type: 'button', class: 'boton boton-principal', onclick: misiones }, t('juego.reloj.empezar')));
      }, 600);
    }

    function misiones() {
      cola = p.retos.map(r => ({ ...r }));
      actual = -1;
      tablero.classList.add('pal-mision');
      // Sin pistas: la palanca pierde sus etiquetas (las teclas no: ahí la etiqueta es la respuesta).
      botones.forEach((b, k) => { b.setAttribute('aria-pressed', 'false'); if (!p.control) b.textContent = String(k + 1); });
      poner(frase, '?');
      poner(trad);
      mision();
      if (mando) mover(Number(mando.value));
    }

    function mision() {
      if (!cola.length) {
        n += 1;
        if (n < paso.palancas.length) { abrir(); return; }
        poner(pide, t('juego.hecho'));
        poner(zona);
        if (paso.despues) decir(paso.despues, 'contenta');
        completar();
        return;
      }
      parada = false;
      poner(trad);
      poner(pide, '🎯 ', ...enLinea(tr(cola[0].pide)));
      animar(pide, 'entra');
      const dale = el('button', { type: 'button', class: 'boton boton-principal' }, t('juego.maquina.comprobar'));
      dale.addEventListener('click', comprobar);
      poner(zona, el('span', { class: 'aprox' }, cuentaDe(hechas + 1, hechas + cola.length)), ' ', cola[0].oye && botonOir(cola[0].oye, decir), ' ', dale);
      if (cola[0].oye) oir(cola[0].oye, decir);
    }

    function comprobar() {
      if (parada) return;
      if (actual < 0) { animar(palanca, 'tiembla'); decir(t('juego.explica.mueve'), 'pensando'); return; }
      const r = cola[0];
      const pos = p.posiciones[actual];
      if (actual !== r.correcta) {
        mal(frase);
        decir(t('juego.explica.no', { es: limpio(pos.es), trad: limpio(tr(pos.trad)) }), 'pensando');
        if (!r.vuelve) { r.vuelve = true; cola.push({ ...r, vuelve: false }); }
        return;
      }
      parada = true;
      cola.shift();
      hechas += 1;
      poner(trad, ...enLinea(tr(pos.trad)));
      bien(frase);
      decir(`**${limpio(pos.es)}**: ${tr(pos.trad)}`, 'contenta');
      luego(mision, 2200);
    }

    poner(tablero,
      el('p', { class: 'pal-titulo' }, tr(p.titulo), paso.palancas.length > 1 && el('span', { class: 'aprox' }, ` ${cuentaDe(n + 1, paso.palancas.length)}`)),
      el('div', { class: 'pal-pantalla' }, frase, trad),
      palanca, pide, zona);
    if (mando) mover(0);
  }

  abrir();
  return limpiar;
}

// ---------------------------------------------------------------------------
// paseo: otra forma de explicar. Una escena con varios sitios (situaciones). 1.º se toca cada sitio:
// la tutora va hasta allí y dice lo que se dice en esa situación. 2.º ella dice una frase y hay que
// mandarla al sitio donde pega. La fallada vuelve.
// ---------------------------------------------------------------------------

function paseo({ paso, tablero, decir, completar, bien, mal, retrato, ilustrado }) {
  const { luego, limpiar } = relojes();
  retrato(false);
  const tutora = tutoraEnEscena(centro(50));
  const vistos = new Set();
  let ocupada = false;
  let cola = null;
  let hechas = 0;
  const globo = el('p', { class: 'pas-globo', lang: LANG }, '…');
  const trad = el('p', { class: 'pas-trad' }, t('juego.paseo.prueba'));
  const zona = el('div', { class: 'centrado' });
  const sitios = paso.sitios.map((s, i) => {
    const boton = el('button', { type: 'button', class: 'pas-sitio nueva' },
      ilustrado && s.icono ? icono(s.icono, 'pas-icono') : null,
      el('span', {}, tr(s.donde)));
    boton.addEventListener('click', () => ir(i, boton));
    return boton;
  });
  const escenario = el('div', { class: 'escenario esc-paseo' },
    el('div', { class: 'pas-sitios' }, sitios), el('div', { class: 'esc-suelo', 'aria-hidden': 'true' }), tutora.canvas);

  function ir(i, boton) {
    if (ocupada) return;
    ocupada = true;
    sonar('pagina');
    const e = escenario.getBoundingClientRect();
    const r = boton.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - e.left) / e.width) * 100;
    tutora.ir(centro(x), { luego, ms: 550, alLlegar: () => { ocupada = false; llegar(i, boton); } });
  }

  function llegar(i, boton) {
    const s = paso.sitios[i];
    if (!cola) { // 1.ª parte: explorar
      globo.textContent = s.es;
      animar(globo, 'brinca');
      poner(trad, ...enLinea(tr(s.trad)));
      tutora.sprite.expresion = 'contenta';
      oir(s.es, decir);
      if (vistos.has(i)) return;
      vistos.add(i);
      boton.classList.remove('nueva');
      if (vistos.size < sitios.length) return;
      luego(() => {
        decir(t('juego.paseo.listo'), 'contenta');
        poner(zona, el('button', { type: 'button', class: 'boton boton-principal', onclick: () => { cola = barajar(paso.sitios.map((_, k) => k)); mision(); } }, t('juego.reloj.empezar')));
      }, 600);
      return;
    }
    const acierto = i === cola[0];
    const pedida = paso.sitios[cola[0]];
    ocupada = true;
    if (acierto) {
      cola.shift();
      hechas += 1;
      tutora.sprite.expresion = 'contenta';
      bien(boton);
      poner(trad, ...enLinea(tr(s.trad)));
      decir(`**${s.es}** ${tr(s.trad)}`, 'contenta');
    } else {
      cola.push(cola.shift());
      tutora.sprite.expresion = 'apurada';
      mal(boton);
      decir(t('juego.paseo.no', { donde: tr(s.donde), es: s.es, pedida: pedida.es }), 'pensando');
    }
    luego(() => { ocupada = false; mision(); }, acierto ? 2000 : 2800);
  }

  function mision() {
    if (!cola.length) {
      globo.textContent = '★';
      poner(trad, t('juego.hecho'));
      poner(zona);
      tutora.sprite.expresion = 'contenta';
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    tutora.sprite.expresion = 'pensando';
    globo.textContent = paso.sitios[cola[0]].es;
    animar(globo, 'brinca');
    poner(trad, t('juego.paseo.donde'));
    poner(zona, el('span', { class: 'aprox' }, cuentaDe(hechas + 1, hechas + cola.length)));
    oir(paso.sitios[cola[0]].es, decir);
  }

  poner(tablero, globo, trad, escenario, zona);
  return () => { limpiar(); tutora.sprite.parar(); retrato(true); };
}

// ---------------------------------------------------------------------------
// detector: otra forma de explicar, por contraste. Arriba, el modelo (la forma buena y lo que significa).
// Van saliendo frases y hay que decir si están bien dichas: Sí o No. La fallada vuelve.
// ---------------------------------------------------------------------------

function detector({ paso, tablero, decir, completar, bien, mal }) {
  const { luego, limpiar } = relojes();
  const cola = paso.frases.map(f => ({ ...f }));
  let hechas = 0;
  let parada = false;
  const frase = el('p', { class: 'det-frase', lang: LANG });
  const cuenta = el('p', { class: 'aprox' });

  function nueva() {
    if (!cola.length) {
      frase.className = 'det-frase';
      frase.textContent = t('juego.hecho');
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    parada = false;
    frase.className = 'det-frase';
    frase.textContent = cola[0].es;
    animar(frase, 'entra');
    cuenta.textContent = cuentaDe(hechas + 1, hechas + cola.length);
  }

  const boton = (digo, clase, texto) => {
    const b = el('button', { type: 'button', class: `det-boton ${clase}`, lang: LANG }, texto);
    b.addEventListener('click', () => {
      if (parada || !cola.length) return;
      parada = true;
      const f = cola[0];
      const acierto = digo === Boolean(f.ok);
      frase.classList.add(f.ok ? 'buena' : 'mala'); // se ve si la frase estaba bien o mal
      if (acierto) {
        cola.shift();
        hechas += 1;
        bien(b);
      } else {
        cola.push(cola.shift());
        mal(b);
      }
      decir(f.por, acierto ? 'contenta' : 'pensando');
      luego(nueva, acierto ? 2400 : 3000);
    });
    return b;
  };

  poner(tablero, cuenta,
    el('div', { class: 'det-modelo' }, el('p', { class: 'det-modelo-es', lang: LANG }, enLinea(paso.modelo.es)), el('p', {}, enLinea(tr(paso.modelo.trad)))),
    el('p', { class: 'globos-pide' }, t('juego.detector.pregunta')),
    frase,
    el('div', { class: 'det-botones' }, boton(true, 'si', '✔ Sí'), boton(false, 'no', '✘ No')));
  nueva();
  return limpiar;
}

// ---------------------------------------------------------------------------
// aduana: control de pasaportes. La tutora es la agente. Llega un pasaporte (nombre, ♀/♂, origen, oficio)
// y el viajero dice una frase. Hay que sellar PASA solo si la frase es verdad Y está bien dicha.
// El viajero mal sellado vuelve a la cola.
// ---------------------------------------------------------------------------

function aduana({ paso, tablero, decir, completar, bien, mal, retrato }) {
  const { luego, limpiar } = relojes();
  retrato(false);
  const tutora = tutoraEnEscena('3%');
  const cola = paso.viajeros.map(v => ({ ...v }));
  let hechas = 0;
  let parada = false;
  const dicho = el('p', { class: 'adu-dicho', lang: LANG });
  const pasaporte = el('div', { class: 'adu-pasaporte' });
  const cuenta = el('p', { class: 'aprox' });

  function nuevo() {
    if (!cola.length) {
      poner(pasaporte);
      pasaporte.hidden = true;
      dicho.textContent = t('juego.hecho');
      tutora.sprite.expresion = 'contenta';
      if (paso.despues) decir(paso.despues, 'contenta');
      completar();
      return;
    }
    parada = false;
    const v = cola[0];
    tutora.sprite.expresion = 'pensando';
    poner(pasaporte,
      el('p', { class: 'adu-nombre' }, v.nombre, el('span', { class: `esc-marca marca-${v.marca === '♀' ? 'f' : 'm'}` }, v.marca)),
      el('p', {}, el('span', { class: 'adu-campo' }, t('juego.aduana.de')), ' ', tr(v.de)),
      el('p', {}, el('span', { class: 'adu-campo' }, t('juego.aduana.oficio')), ' ', tr(v.oficio)));
    animar(pasaporte, 'entra');
    dicho.textContent = `«${v.es}»`;
    cuenta.textContent = cuentaDe(hechas + 1, hechas + cola.length);
    oir(v.es, decir);
  }

  const sello = (digo, clase, clave) => {
    const boton = el('button', { type: 'button', class: `det-boton ${clase}` }, t(clave));
    boton.addEventListener('click', () => {
      if (parada || !cola.length) return;
      parada = true;
      const v = cola[0];
      const acierto = digo === Boolean(v.ok);
      if (acierto) {
        cola.shift();
        hechas += 1;
        pasaporte.append(el('span', { class: `adu-sello ${v.ok ? 'si' : 'no'}` }, t(v.ok ? 'juego.aduana.pasa' : 'juego.aduana.noPasa')));
        animar(tutora.canvas, 'brinco');
        tutora.sprite.expresion = v.ok ? 'contenta' : 'apurada';
        sonar('guardar');
        bien(pasaporte);
      } else {
        cola.push(cola.shift());
        tutora.sprite.expresion = 'confundida';
        mal(boton);
      }
      decir(v.por, acierto ? 'contenta' : 'pensando');
      luego(nuevo, acierto ? 2600 : 3200);
    });
    return boton;
  };

  poner(tablero, cuenta,
    el('div', { class: 'escenario esc-aduana' }, tutora.canvas, el('div', { class: 'adu-mesa', 'aria-hidden': 'true' }), pasaporte),
    el('p', { class: 'globos-pide' }, t('juego.aduana.dice')),
    dicho,
    el('div', { class: 'det-botones' }, sello(true, 'si', 'juego.aduana.pasa'), sello(false, 'no', 'juego.aduana.noPasa')));
  nuevo();
  return () => { limpiar(); tutora.sprite.parar(); retrato(true); };
}

export const ESCENAS_C = { explica, paseo, detector, aduana, mando, pizarra, letras, rayuela, velas, telefono, bingo, parada, clasifica };
