// Logros: medallas que se ganan solas al ir avanzando (lecciones, rachas, estrellas, cuaderno, repaso…).
// Cuando se gana una, sale un aviso arriba con su medalla, un sonido y confeti; en el Perfil está la vitrina.
// Se guardan en este dispositivo («<curso>-logros»: { id: fecha }). La primera vez que se miran (o al cargar una
// copia) se apuntan los ya ganados sin avisar, para no llenar la pantalla de avisos.

import { el } from './dom.js';
import { t } from './i18n.js';
import { clave } from './curso.js';
import { todosLosDatos, tarjetas, racha, actividad, alCambiar } from './progress.js';
import { sonar } from './sonidos.js';
import { confeti } from './fiesta.js';

const CLAVE = clave('logros');
const CLAVE_ESTRELLAS = clave('estrellas');
const CLAVE_COFRES = clave('cofres');

const leer = (k, vacio) => { try { return JSON.parse(localStorage.getItem(k)) ?? vacio; } catch { return vacio; } };

// Lo que hace falta saber para comprobar los logros (se calcula una vez por comprobación).
function estado(lecciones) {
  const datos = todosLosDatos();
  const terminadas = new Set(Object.entries(datos.lecciones ?? {}).filter(([, l]) => l.terminada).map(([id]) => id));
  const estrellas = leer(CLAVE_ESTRELLAS, {});
  const cartas = tarjetas();
  const dias = Object.values(actividad() ?? {});
  const porNivel = {};
  for (const l of lecciones()) {
    if (!l?.nivel) continue;
    porNivel[l.nivel] ??= { total: 0, hechas: 0 };
    porNivel[l.nivel].total += 1;
    if (terminadas.has(l.id)) porNivel[l.nivel].hechas += 1;
  }
  return {
    terminadas: terminadas.size,
    totalLecciones: lecciones().length,
    perfectas: Object.values(estrellas).filter(n => n >= 3).length,
    racha: racha(),
    cuaderno: cartas.length,
    dominadas: cartas.filter(c => (c.srs?.intervalo ?? 0) >= 21).length,
    repasos: dias.reduce((s, d) => s + (d.repasos ?? 0), 0),
    cofres: leer(CLAVE_COFRES, []).length,
    nivel: n => porNivel[n] && porNivel[n].total > 0 && porNivel[n].hechas === porNivel[n].total,
  };
}

/** Todos los logros, en el orden de la vitrina. icono: dibujo de la medalla; si(e): si ya se ha ganado. */
export const LOGROS = [
  { id: 'primera', icono: '🎒', si: e => e.terminadas >= 1 },
  { id: 'cinco', icono: '📗', si: e => e.terminadas >= 5 },
  { id: 'veinticinco', icono: '📚', si: e => e.terminadas >= 25 },
  { id: 'cien', icono: '🏛️', si: e => e.terminadas >= 100 },
  { id: 'todas', icono: '👑', si: e => e.totalLecciones > 0 && e.terminadas >= e.totalLecciones },
  { id: 'cofre', icono: '🧰', si: e => e.cofres >= 1 },
  { id: 'cofres5', icono: '💰', si: e => e.cofres >= 5 },
  { id: 'a1', icono: '🌱', si: e => e.nivel('A1') },
  { id: 'a2', icono: '🌿', si: e => e.nivel('A2') },
  { id: 'b1', icono: '🌳', si: e => e.nivel('B1') },
  { id: 'b2', icono: '🏔️', si: e => e.nivel('B2') },
  { id: 'perfecta', icono: '⭐', si: e => e.perfectas >= 1 },
  { id: 'perfectas10', icono: '🌟', si: e => e.perfectas >= 10 },
  { id: 'perfectas50', icono: '💫', si: e => e.perfectas >= 50 },
  { id: 'racha3', icono: '🔥', si: e => e.racha >= 3 },
  { id: 'racha7', icono: '🎇', si: e => e.racha >= 7 },
  { id: 'racha30', icono: '🌋', si: e => e.racha >= 30 },
  { id: 'palabras50', icono: '📒', si: e => e.cuaderno >= 50 },
  { id: 'palabras500', icono: '🗃️', si: e => e.cuaderno >= 500 },
  { id: 'dominadas20', icono: '🧠', si: e => e.dominadas >= 20 },
  { id: 'repasos100', icono: '🃏', si: e => e.repasos >= 100 },
  { id: 'repasos1000', icono: '🎴', si: e => e.repasos >= 1000 },
  // estos no se deducen de los datos: los da un suceso (ver más abajo)
  { id: 'enRacha', icono: '🎯' },
  { id: 'velocista', icono: '⚡' },
  { id: 'buho', icono: '🦉' },
  { id: 'gallo', icono: '🐓' },
];

let lecciones = () => [];
let ganados = null; // { id: fecha }
const cola = [];
let mostrando = false;

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(ganados)); } catch { /* sin almacenamiento */ }
}

/** Los ganados: { id: fecha }. */
export function logrosGanados() {
  if (!ganados) ganados = leer(CLAVE, null);
  return ganados ?? {};
}

function ganar(id, { avisar = true } = {}) {
  logrosGanados();
  if (!ganados) ganados = {};
  if (ganados[id]) return;
  ganados[id] = Date.now();
  guardar();
  if (avisar) { cola.push(id); if (!mostrando) siguienteAviso(); }
  window.dispatchEvent(new CustomEvent('logro-ganado', { detail: { id } }));
}

/** Mira qué logros se han ganado. Sin avisos la primera vez (para no avisar de golpe de todo lo de antes). */
export function comprobarLogros() {
  const primeraVez = leer(CLAVE, null) === null && !ganados;
  if (primeraVez) ganados = {};
  const e = estado(lecciones);
  for (const l of LOGROS) if (l.si?.(e)) ganar(l.id, { avisar: !primeraVez });
  if (primeraVez) guardar();
}

// ----- El aviso -----
function siguienteAviso() {
  const id = cola.shift();
  if (!id) { mostrando = false; return; }
  mostrando = true;
  const logro = LOGROS.find(l => l.id === id);
  const medalla = el('span', { class: 'lg-medalla', 'aria-hidden': 'true' }, logro?.icono ?? '🏅');
  const aviso = el('button', { type: 'button', class: 'lg-aviso', 'data-sonido': 'nada', 'aria-live': 'polite' },
    medalla,
    el('span', { class: 'lg-aviso-textos' },
      el('span', { class: 'lg-aviso-titulo' }, t('logros.ganado')),
      el('strong', {}, t(`logros.${id}.nombre`)),
      el('span', { class: 'lg-aviso-desc' }, t(`logros.${id}.desc`))));
  let ido = false;
  const irse = () => {
    if (ido) return;
    ido = true;
    aviso.classList.add('se-va');
    setTimeout(() => { aviso.remove(); siguienteAviso(); }, 280);
  };
  aviso.addEventListener('click', () => { irse(); if (location.hash !== '#/perfil') location.hash = '#/perfil'; });
  document.body.append(aviso);
  sonar('fanfarria');
  setTimeout(() => confeti(medalla, 22), 200);
  setTimeout(irse, 4200);
}

/** Pone en marcha los logros. obtenerLecciones(): las lecciones del curso (con id y nivel). */
export function iniciarLogros(obtenerLecciones) {
  lecciones = () => obtenerLecciones().filter(Boolean);
  // se comprueba cuando cambia el progreso (con un poco de calma: muchas respuestas seguidas son un solo cambio)
  let reloj = null;
  alCambiar(() => { clearTimeout(reloj); reloj = setTimeout(comprobarLogros, 700); });
  window.addEventListener('cofre-abierto', () => setTimeout(comprobarLogros, 1200));
  window.addEventListener('reto-terminado', ({ detail }) => { if ((detail?.puntos ?? 0) >= 25) ganar('velocista'); });
  window.addEventListener('paglot-suceso', ({ detail }) => {
    if (detail.nombre === 'bien' && (detail.racha ?? 0) >= 10) ganar('enRacha');
    if (detail.nombre === 'fin' || detail.nombre === 'fanfarria') {
      const h = new Date().getHours();
      if (h >= 23 || h < 4) ganar('buho');
      else if (h >= 4 && h < 7) ganar('gallo');
    }
  });
  comprobarLogros();
}
