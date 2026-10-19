// Pantalla «Reto rápido» (#/reto): 60 segundos para acertar todas las palabras del cuaderno que se pueda.
// Se ve una palabra (en español o traducida) y se elige entre cuatro; acertar suma (más con racha), fallar
// quita 3 segundos y enseña la buena. Al final, la puntuación y el récord. No toca la repetición espaciada:
// es un juego aparte, para picar.
// Atajos: 1–4 para elegir.

import { el, poner, barajar } from '../dom.js';
import { t, tr } from '../i18n.js';
import { tarjetas, anotarReto } from '../progress.js';
import { sonar, sonarAcierto } from '../sonidos.js';
import { decir } from '../tutor.js';
import { LANG, clave } from '../curso.js';
import { confeti } from '../fiesta.js';
import { conCartel } from './carteles.js';

const DURACION = 60;        // segundos
const CASTIGO = 3;          // segundos que quita un fallo
const MINIMO = 8;           // palabras del cuaderno que hacen falta para jugar
const CLAVE_MEJOR = clave('reto-mejor');

const limpiar = s => String(s).toLocaleLowerCase(LANG).replace(/[.,!?¡¿;:"«»“”'’()…]/g, ' ').replace(/\s+/g, ' ').trim();
const leerMejor = () => { try { return Number(localStorage.getItem(CLAVE_MEJOR)) || 0; } catch { return 0; } };
const guardarMejor = n => { try { localStorage.setItem(CLAVE_MEJOR, String(n)); } catch { /* sin almacenamiento */ } };

/** Las palabras con las que se puede jugar: las del cuaderno que tienen traducción. */
function baraja() {
  const vistas = new Set();
  return tarjetas()
    .map(c => ({ es: String(c.es ?? '').trim(), trad: String(tr(c.trad) ?? '').trim() }))
    .filter(c => c.es && c.trad && !vistas.has(limpiar(c.es)) && vistas.add(limpiar(c.es)));
}

/** Para saber desde fuera si hay con qué jugar y cuál es el récord. */
export function estadoReto() {
  return { puede: baraja().length >= MINIMO, mejor: leerMejor() };
}

export function pintarReto(app) {
  const relojes = new Set();
  const luego = (ms, fn) => { const r = setTimeout(() => { relojes.delete(r); fn(); }, ms); relojes.add(r); };
  let alTeclear = null;
  let tic = null;

  function limpiarTodo() {
    for (const r of relojes) clearTimeout(r);
    relojes.clear();
    clearInterval(tic);
    alTeclear = null;
  }

  // ---------------------------------------------------------------------
  function portada() {
    limpiarTodo();
    const cartas = baraja();
    const mejor = leerMejor();
    const puede = cartas.length >= MINIMO;
    const empezar = el('button', { type: 'button', class: 'es-boton es-boton-grande rt-empezar', disabled: !puede, 'data-sonido': 'arcade' }, t('reto.empezar'));
    empezar.addEventListener('click', () => cuentaAtras(cartas));
    poner(app,
      conCartel(el('section', { class: 'intro-vista' },
        el('h1', {}, t('reto.titulo')),
        el('p', {}, t('reto.intro', { s: DURACION, castigo: CASTIGO }))), 'reto'),
      el('section', { class: 'caja rt-portada' },
        el('div', { class: 'rt-rayo', 'aria-hidden': 'true' }, '⚡'),
        el('p', { class: 'rt-record' }, t('reto.mejor'), ' ', el('strong', {}, String(mejor))),
        empezar,
        !puede && el('p', { class: 'aprox' }, t('reto.faltan', { n: MINIMO, tienes: cartas.length }), ' ', el('a', { href: '#/lecciones' }, t('repaso.vacioIr')))));
    decir(puede ? t('reto.tutora', { mejor }) : t('reto.tutoraFaltan'), puede ? 'contenta' : 'pensando');
  }

  // ---------------------------------------------------------------------
  function cuentaAtras(cartas) {
    const numero = el('p', { class: 'rt-cuenta' }, '3');
    poner(app, el('div', { class: 'rt-sesion rt-preparados' }, numero, el('p', { class: 'aprox' }, t('reto.preparados'))));
    sonar('reloj');
    luego(700, () => { numero.textContent = '2'; numero.classList.remove('late'); void numero.offsetWidth; numero.classList.add('late'); sonar('reloj'); });
    luego(1400, () => { numero.textContent = '1'; numero.classList.remove('late'); void numero.offsetWidth; numero.classList.add('late'); sonar('reloj'); });
    luego(2100, () => { sonar('silbato'); jugar(cartas); });
  }

  // ---------------------------------------------------------------------
  function jugar(cartas) {
    let puntos = 0;
    let aciertos = 0;
    let fallos = 0;
    let racha = 0;
    let mejorRacha = 0;
    let fin = performance.now() + DURACION * 1000;
    let mazo = barajar(cartas);
    let anterior = null;

    const marcador = el('span', { class: 'rt-puntos' }, '0');
    const tiempo = el('span', { class: 'rt-tiempo' }, String(DURACION));
    const barra = el('span', { class: 'rt-barra', 'aria-hidden': 'true' }, el('span'));
    const llama = el('span', { class: 'rt-racha' });
    const pregunta = el('div', { class: 'rt-pregunta' });
    const opciones = el('div', { class: 'rp-opciones rt-opciones' });
    poner(app, el('div', { class: 'rt-sesion' },
      el('div', { class: 'rt-cabecera' },
        el('span', { class: 'rt-caja' }, '⚡ ', marcador),
        barra,
        el('span', { class: 'rt-caja' }, '⏱ ', tiempo)),
      llama,
      pregunta,
      opciones));

    const pintarTiempo = () => {
      const queda = Math.max(0, (fin - performance.now()) / 1000);
      tiempo.textContent = String(Math.ceil(queda));
      barra.firstChild.style.transform = `scaleX(${(queda / DURACION).toFixed(3)})`;
      barra.classList.toggle('apurado', queda <= 10);
      if (queda <= 0) terminar();
    };
    tic = setInterval(pintarTiempo, 100);

    const siguiente = () => {
      if (!mazo.length) mazo = barajar(cartas);
      let c = mazo.pop();
      if (anterior && limpiar(c.es) === limpiar(anterior.es) && mazo.length) { mazo.unshift(c); c = mazo.pop(); }
      anterior = c;
      // casi siempre se ve el español; a veces, al revés
      const alReves = Math.random() < 0.3;
      const campo = alReves ? 'es' : 'trad';
      const buena = c[campo];
      const falsas = barajar(cartas.filter(x => limpiar(x[campo]) !== limpiar(buena) && limpiar(x.es) !== limpiar(c.es))).slice(0, 3).map(x => x[campo]);
      const lista = barajar([buena, ...falsas]);
      poner(pregunta, el('p', { class: alReves ? 'rt-trad' : 'rt-es', lang: alReves ? null : LANG }, alReves ? c.trad : c.es));
      pregunta.classList.remove('entra'); void pregunta.offsetWidth; pregunta.classList.add('entra');
      let resuelta = false;
      const botones = lista.map((o, k) => {
        const b = el('button', { type: 'button', class: 'rp-opcion', lang: alReves ? LANG : null, 'data-sonido': 'nada' },
          el('span', { class: 'tecla' }, String(k + 1)), el('span', {}, o));
        b.addEventListener('click', () => {
          if (resuelta) return;
          resuelta = true;
          if (limpiar(o) === limpiar(buena)) {
            racha += 1;
            mejorRacha = Math.max(mejorRacha, racha);
            aciertos += 1;
            puntos += racha >= 10 ? 3 : racha >= 5 ? 2 : 1;
            sonarAcierto(racha);
            b.classList.add('buena');
            marcador.textContent = String(puntos);
            marcador.classList.remove('sube'); void marcador.offsetWidth; marcador.classList.add('sube');
            if (racha === 5 || racha === 10) { confeti(llama, 12); }
            luego(160, siguiente);
          } else {
            racha = 0;
            fallos += 1;
            fin -= CASTIGO * 1000;
            sonar('mal');
            b.classList.add('mala');
            botones.find(x => limpiar(x.lastChild.textContent) === limpiar(buena))?.classList.add('buena');
            tiempo.parentElement.classList.remove('castigo'); void tiempo.offsetWidth; tiempo.parentElement.classList.add('castigo');
            luego(650, siguiente);
          }
          poner(llama, racha >= 2 ? `🔥 ×${racha}${racha >= 10 ? ' · +3' : racha >= 5 ? ' · +2' : ''}` : '');
        });
        return b;
      });
      poner(opciones, botones);
      opciones.classList.toggle('largas', lista.some(o => o.length > 22));
      alTeclear = e => { const n = Number(e.key); if (n >= 1 && n <= botones.length) { e.preventDefault(); botones[n - 1].click(); } };
    };

    let terminado = false;
    function terminar() {
      if (terminado) return;
      terminado = true;
      limpiarTodo();
      const antes = leerMejor();
      const record = puntos > antes;
      if (record) guardarMejor(puntos);
      if (puntos > 0) anotarReto(); // cuenta para la racha del día
      window.dispatchEvent(new CustomEvent('reto-terminado', { detail: { puntos } }));
      sonar(record ? 'fanfarria' : 'fin');
      const copa = el('p', { class: 'jg-final-copa', 'aria-hidden': 'true' }, record ? '🏆' : '⚡');
      const dato = (icono, valor, texto) => el('li', { class: 'jg-final-dato' },
        el('span', { class: 'jg-final-icono', 'aria-hidden': 'true' }, icono), el('strong', {}, String(valor)), el('span', {}, texto));
      const otra = el('button', { type: 'button', class: 'es-boton es-boton-grande', 'data-sonido': 'arcade' }, t('reto.otra'));
      otra.addEventListener('click', () => cuentaAtras(cartas));
      poner(app, el('section', { class: 'caja final-leccion rt-final' },
        copa,
        el('h1', {}, t('reto.finTitulo')),
        el('p', { class: 'rt-final-puntos' }, String(puntos)),
        record ? el('p', { class: 'jg-final-record' }, t('jg.fin.record')) : el('p', { class: 'aprox' }, t('reto.mejor'), ' ', String(antes)),
        el('ul', { class: 'jg-final-datos' },
          dato('✔', aciertos, t('reto.aciertos')),
          dato('✖', fallos, t('reto.fallos')),
          dato('🔥', mejorRacha, t('repaso.finRacha'))),
        el('div', { class: 'jg-final-botones' },
          otra,
          el('a', { class: 'es-boton es-boton-papel', href: '#/repaso' }, t('menu.repaso')),
          el('a', { class: 'es-boton es-boton-papel', href: '#/lecciones' }, t('jg.fin.mapa')))));
      if (record) luego(250, () => confeti(copa, 34));
      otra.focus({ preventScroll: true });
      decir(record ? t('reto.recordTutora', { n: puntos }) : t('reto.finTutora', { n: puntos }), 'contenta');
    }

    siguiente();
  }

  const teclas = e => {
    if (!alTeclear || e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    alTeclear(e);
  };
  document.addEventListener('keydown', teclas);
  portada();
  return () => { limpiarTodo(); document.removeEventListener('keydown', teclas); };
}

/** Un pequeño anuncio del reto para otras pantallas (el mapa y el repaso). */
export function enlaceReto({ clase = '' } = {}) {
  const { puede, mejor } = estadoReto();
  return el('a', { class: `cm-extra cm-extra-reto ${clase}`.trim(), href: '#/reto', 'data-sonido': 'arcade' },
    el('span', { class: 'cm-extra-icono', 'aria-hidden': 'true' }, '⚡'),
    el('span', { class: 'cm-extra-titulo' }, t('reto.titulo').replace(/^⚡\s*/u, '')),
    el('span', { class: 'cm-extra-texto' }, puede ? t('reto.anuncio', { mejor }) : t('reto.anuncioBloqueado', { n: MINIMO })));
}
