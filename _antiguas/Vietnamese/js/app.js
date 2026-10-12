// Punto de entrada: arranca la tutora, busca las lecciones y decide qué pantalla mostrar.
//   #/              → lista de lecciones
//   #/leccion/001   → lección 001
//   #/frases        → frases útiles
//   #/cuaderno      → palabras guardadas
//   #/repaso        → repaso tipo Anki
//   #/perfil        → nombre, foto, progreso y cuenta en la nube

import { descubrirLecciones } from './lecciones.js';
import { iniciarTutora, enSilencio, decir } from './tutora.js';
import { iniciarGlobo, ocultarGlobo } from './globo.js';
import { iniciarMarcado } from './marcar.js';
import { vistaInicio } from './vista-inicio.js';
import { vistaLeccion } from './vista-leccion.js';
import { vistaCuaderno } from './vista-cuaderno.js';
import { vistaRepaso } from './vista-repaso.js';
import { vistaFrases } from './vista-frases.js';
import { vistaPerfil, htmlFoto } from './vista-perfil.js';
import { contar } from './cuaderno.js';
import { perfil } from './perfil.js';
import { NOMBRE_TUTORA } from './textos.js';
import { sonidoActivo, alternarSonido } from './sonido.js';
import { capturarEnlace, iniciarNube } from './nube.js';
import { prepararCuenta } from './vista-cuenta.js';
import { iniciarVoz } from './voz.js';

const raiz = document.getElementById('principal');
let lecciones = [];
let limpiar = null; // lo que deja preparado una pantalla y hay que quitar al salir

// Si algo falla por dentro, avisar con calma en vez de quedarse en silencio
let falloAvisado = false;
function avisarFallo(e) {
  console.error(e);
  if (falloAvisado) return;
  falloAvisado = true;
  decir('Ups… algo ha fallado por dentro. Si algo no responde, recarga la página con F5. Tus datos están a salvo.', 'apurada');
}
window.addEventListener('error', (e) => avisarFallo(e.error || e.message));
window.addEventListener('unhandledrejection', (e) => avisarFallo(e.reason));

async function arrancar() {
  iniciarTema();
  iniciarBotonSonido();
  document.getElementById('tutora-nombre').textContent = NOMBRE_TUTORA;
  iniciarTutora();
  iniciarGlobo();
  iniciarMarcado();
  iniciarVoz();
  iniciarMenu();

  raiz.innerHTML = '<p class="cargando">Cargando lecciones…</p>';
  const enlace = await capturarEnlace(); // ¿venimos de un enlace del correo?
  if (enlace) avisarEnlace(enlace);
  iniciarNube();
  lecciones = await descubrirLecciones();

  window.addEventListener('hashchange', enrutar);
  // Si la nube trae datos nuevos, repinta las pantallas de resumen (no la lección ni el repaso en curso)
  document.addEventListener('nube-datos-nuevos', () => {
    const tranquila = !/^#\/(leccion|repaso)/.test(location.hash);
    const escribiendo = document.activeElement?.matches?.('input, textarea');
    if (tranquila && !escribiendo) {
      const y = window.scrollY;
      enSilencio(() => enrutar());
      window.scrollTo(0, y);
    }
  });
  enrutar();
}

function avisarEnlace(enlace) {
  if (enlace.tipo === 'recovery') {
    prepararCuenta('nueva', { tipo: 'ok', texto: 'Escribe tu nueva contraseña.' });
  } else if (enlace.tipo === 'signup') {
    prepararCuenta(null, { tipo: 'ok', texto: '¡Email confirmado! Tu cuenta ya está lista y has entrado.' });
  } else {
    prepararCuenta(null, { tipo: 'error', texto: enlace.mensaje });
  }
}

function enrutar() {
  ocultarGlobo();
  if (limpiar) { limpiar(); limpiar = null; }

  const hash = location.hash;
  const m = /^#\/leccion\/(\d{3})$/.exec(hash);
  let seccion = 'lecciones';
  let resultado;
  if (m) {
    const i = lecciones.findIndex((l) => l.id === m[1]);
    if (i < 0) { location.hash = '#/'; return; }
    resultado = vistaLeccion(raiz, lecciones[i], lecciones[i + 1]);
  } else if (hash === '#/cuaderno') {
    seccion = 'cuaderno';
    resultado = vistaCuaderno(raiz);
  } else if (hash === '#/frases') {
    seccion = 'frases';
    resultado = vistaFrases(raiz, lecciones);
  } else if (hash === '#/repaso') {
    seccion = 'repaso';
    resultado = vistaRepaso(raiz);
  } else if (hash === '#/perfil') {
    seccion = 'perfil';
    resultado = vistaPerfil(raiz, lecciones);
  } else {
    resultado = vistaInicio(raiz, lecciones);
  }
  if (typeof resultado === 'function') limpiar = resultado;

  for (const a of document.querySelectorAll('.menu a')) {
    if (a.dataset.seccion === seccion) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
  if (seccion !== 'repaso') raiz.focus({ preventScroll: true });
}

function iniciarMenu() {
  const num = document.getElementById('menu-repaso-num');
  const avatar = document.getElementById('menu-avatar');
  const pintarNum = () => {
    const c = contar();
    const n = c.nuevas + c.aprendiendo + c.repasos;
    num.hidden = !n;
    num.textContent = n;
  };
  const pintarAvatar = () => {
    const p = perfil();
    avatar.innerHTML = p.foto || p.nombre ? htmlFoto(p, 'mini') : '';
  };
  document.addEventListener('cuaderno-cambio', pintarNum);
  document.addEventListener('perfil-cambio', pintarAvatar);
  setInterval(pintarNum, 30000); // las tarjetas en aprendizaje vencen con el tiempo
  pintarNum();
  pintarAvatar();
}

function iniciarTema() {
  const btn = document.getElementById('btn-tema');
  const pintar = () => {
    const oscuro = document.documentElement.dataset.tema === 'oscuro';
    btn.textContent = oscuro ? '☀' : '☾';
    btn.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  };
  btn.addEventListener('click', () => {
    const nuevo = document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.dataset.tema = nuevo;
    try { localStorage.setItem('vietlibro.tema', nuevo); } catch { /* sin acceso */ }
    pintar();
  });
  pintar();
}

function iniciarBotonSonido() {
  const btn = document.getElementById('btn-sonido');
  const pintar = () => {
    const on = sonidoActivo();
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Silenciar sonidos' : 'Activar sonidos');
  };
  btn.addEventListener('click', () => { alternarSonido(); pintar(); });
  pintar();
}

arrancar();
