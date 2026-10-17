// La cabecera tiene dos caras: ANTES de iniciar sesión (invitado) y DESPUÉS (con cuenta).
// - Invitado: botones «Iniciar sesión» y «Crear cuenta»;
//   dentro de un curso, un aviso de que sin cuenta el cuaderno y el progreso solo viven en este dispositivo.
// - Con cuenta: la racha, el avatar con el estado de la nube y su menú; en las portadas, un saludo con su nombre.
// app.js decide la parte fija (marca, menú del curso, ajustes) y llama a pintarCabecera() cada vez que algo cambia.

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { t } from './i18n.js';
import { sonar } from './sonidos.js';
import { curso, hayCurso } from './curso.js';
import { usuarioActual, alCambiarNube, nube, salir, cambiarFoto } from './sync.js';
import { tarjetas, racha, nombre, alCambiar } from './progress.js';
import { tocaRepasar, esNueva } from './srs.js';

const cabecera = document.querySelector('.cabecera');
const cuenta = document.getElementById('cabecera-cuenta');
const cinta = document.getElementById('cabecera-cinta');
const CLAVE_AVISO = 'idiomas-aviso-invitado-cerrado';

/** Tarjetas que tocan hoy: las pendientes más las nuevas (como mucho 20, igual que en la pantalla de repaso). */
export function pendientesDeHoy() {
  const todas = tarjetas();
  return todas.filter(c => tocaRepasar(c.srs)).length + Math.min(20, todas.filter(c => esNueva(c.srs)).length);
}

const enPortada = () => document.body.classList.contains('en-inicio');

/** El nombre con el que se le saluda: el de la cuenta, el que puso en el curso o lo que va antes de la @. */
function nombreVisible(u) {
  return (u.user_metadata?.nombre || (hayCurso ? nombre() : '') || u.email?.split('@')[0] || '').trim();
}

// El color del avatar sale del nombre: siempre el mismo para la misma persona.
const COLORES_AVATAR = ['#c8445a', '#2f7fbf', '#3f9a5c', '#b8741a', '#8a55c4', '#cf5f2f', '#22897f'];
function colorDe(texto) {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.codePointAt(0)) >>> 0;
  return COLORES_AVATAR[h % COLORES_AVATAR.length];
}

/** El estado de la nube, en corto: para el puntito del avatar y la primera línea de su menú. */
function estadoNube() {
  if (nube.estado === 'sincronizada') return ['ok', t('cabecera.nube.ok')];
  if (nube.estado === 'sincronizando') return ['guardando', t('cabecera.nube.guardando')];
  if (nube.estado === 'error') return ['error', t('cabecera.nube.error')];
  return ['local', t('cabecera.nube.local')];
}

// ---------------------------------------------------------------------------
// Menú de la cuenta (el avatar)
// ---------------------------------------------------------------------------

let menuAbierto = false;
function abrirMenu(abrir) {
  const boton = cuenta.querySelector('.cuenta-avatar');
  const panel = cuenta.querySelector('.cuenta-panel');
  if (!boton || !panel) return;
  menuAbierto = abrir;
  boton.setAttribute('aria-expanded', String(abrir));
  panel.hidden = !abrir;
  if (abrir) panel.querySelector('a, button')?.focus({ preventScroll: true });
}
document.addEventListener('pointerdown', e => { if (menuAbierto && !cuenta.contains(e.target)) abrirMenu(false); });
addEventListener('hashchange', () => { if (menuAbierto) abrirMenu(false); });
cuenta.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuAbierto) { abrirMenu(false); cuenta.querySelector('.cuenta-avatar')?.focus(); }
});

/** El avatar: la foto de perfil si la ha puesto; si no, la inicial sobre su color. */
function avatar(u, clase) {
  const quien = nombreVisible(u) || '?';
  const foto = u.user_metadata?.foto;
  return el('span', { class: `${clase}${foto ? ' con-foto' : ''}`, style: `--avatar: ${colorDe(quien)}`, 'aria-hidden': 'true' },
    foto ? el('img', { src: foto, alt: '', width: 96, height: 96 }) : [...quien][0].toUpperCase());
}

// ---------------------------------------------------------------------------
// La foto de perfil: se recorta en cuadrado y se reduce a 96 × 96 (unos pocos KB) antes de guardarla
// ---------------------------------------------------------------------------

const LADO_FOTO = 96;
async function miniatura(archivo) {
  const imagen = await createImageBitmap(archivo);
  const lado = Math.min(imagen.width, imagen.height);
  const lienzo = Object.assign(document.createElement('canvas'), { width: LADO_FOTO, height: LADO_FOTO });
  const ctx = lienzo.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imagen, (imagen.width - lado) / 2, (imagen.height - lado) / 2, lado, lado, 0, 0, LADO_FOTO, LADO_FOTO);
  imagen.close?.();
  return lienzo.toDataURL('image/jpeg', 0.82);
}

const elegirFoto = el('input', { type: 'file', accept: 'image/*', hidden: true });
document.body.append(elegirFoto);

/** Guarda (o quita) la foto y cuenta en el menú cómo ha ido. */
async function guardarFoto(obtener) {
  const aviso = cuenta.querySelector('.cuenta-aviso');
  if (aviso) { aviso.hidden = false; aviso.textContent = t('cabecera.guardandoFoto'); }
  try {
    await cambiarFoto(await obtener());
    sonar('guardar');
    abrirMenu(false);
    pintarCabecera();
  } catch (e) {
    console.error(e);
    sonar('mal');
    if (aviso) aviso.textContent = t('cabecera.fotoError');
  }
}
elegirFoto.addEventListener('change', () => {
  const archivo = elegirFoto.files?.[0];
  elegirFoto.value = '';
  if (archivo) guardarFoto(() => miniatura(archivo));
});

function pintarConSesion(u) {
  const [estado, textoEstado] = estadoNube();
  const quien = nombreVisible(u);
  const dias = hayCurso ? racha() : 0;
  const enlace = (href, texto, extra = {}) => el('a', { href, role: 'menuitem', class: 'cuenta-opcion', onclick: () => abrirMenu(false), ...extra }, texto);

  poner(cuenta,
    hayCurso ? el('a', {
      class: `cabecera-racha${dias ? '' : ' apagada'}`, href: '#/perfil',
      title: t('cabecera.racha', { n: dias }), 'aria-label': t('cabecera.racha', { n: dias }),
    }, icono('llama', 'icono racha-llama'), el('span', { class: 'racha-numero' }, String(dias))) : null,
    el('span', { class: 'cuenta-menu' },
      el('button', {
        type: 'button', class: 'cuenta-avatar', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
        'aria-label': `${t('cabecera.menuCuenta')} · ${textoEstado}`, title: quien ? `${quien} · ${textoEstado}` : textoEstado,
        onclick: () => { sonar(menuAbierto ? 'cerrar' : 'abrir'); abrirMenu(!menuAbierto); },
      }, avatar(u, 'avatar'), el('span', { class: `avatar-nube ${estado}`, 'aria-hidden': 'true' })),
      el('div', { class: 'cuenta-panel', role: 'menu', hidden: true },
        el('div', { class: 'cuenta-quien' },
          avatar(u, 'avatar avatar-grande'),
          el('span', { class: 'cuenta-datos' },
            el('strong', {}, quien || t('cuenta.titulo')),
            u.email ? el('small', {}, u.email) : null,
            el('span', { class: `cuenta-estado ${estado}` }, textoEstado))),
        el('p', { class: 'cuenta-aviso', role: 'status', hidden: true }),
        el('button', { type: 'button', role: 'menuitem', class: 'cuenta-opcion', onclick: () => elegirFoto.click() },
          u.user_metadata?.foto ? t('cabecera.cambiarFoto') : t('cabecera.ponerFoto')),
        u.user_metadata?.foto
          ? el('button', { type: 'button', role: 'menuitem', class: 'cuenta-opcion cuenta-quitar-foto', onclick: () => guardarFoto(() => null) }, t('cabecera.quitarFoto'))
          : null,
        hayCurso ? enlace('#/perfil', t('cabecera.miPerfil')) : null,
        enlace('#/entrar', t('cabecera.miCuenta')),
        enlace('#/idiomas', t('cabecera.idiomas')),
        enlace('#/precios', el('span', { class: 'cuenta-max' }, icono('corona'), 'Paglot Max')),
        el('button', {
          type: 'button', role: 'menuitem', class: 'cuenta-opcion cuenta-salir',
          onclick: async () => {
            sonar('cerrar');
            abrirMenu(false);
            try { await salir(); } catch (e) { console.error(e); }
          },
        }, icono('salir'), t('cuenta.cerrarSesion')))));
}

function pintarInvitado() {
  menuAbierto = false;
  poner(cuenta,
    el('a', { class: 'btn cabecera-entrar', href: '#/entrar' }, t('cuenta.iniciarSesion')),
    el('a', { class: 'btn cabecera-crear', href: '#/entrar/crear' }, el('span', {}, t('cuenta.crear'))));
}

// ---------------------------------------------------------------------------
// La cinta de debajo
// ---------------------------------------------------------------------------

/** Portada con sesión: el saludo con su nombre, la racha, lo que toca hoy y el botón para seguir. */
function cintaBienvenida(u) {
  const quien = nombreVisible(u);
  const n = hayCurso ? pendientesDeHoy() : 0;
  const dias = hayCurso ? racha() : 0;
  return el('div', { class: 'cinta-hola' },
    el('p', { class: 'hola-texto' },
      el('strong', {}, quien ? t('cabecera.hola', { nombre: quien }) : t('cabecera.holaSinNombre')),
      hayCurso && dias ? el('span', { class: 'hola-dato' }, icono('llama'), t('cabecera.racha', { n: dias })) : null,
      hayCurso ? el('span', { class: 'hola-dato' }, icono('repaso'), n ? t('cabecera.pendientes', { n }) : t('cabecera.alDia')) : null),
    el('a', { class: 'btn hola-seguir', href: hayCurso ? '#/lecciones' : '#/idiomas' },
      hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')));
}

/** Dentro de un curso y sin sesión: el aviso de que el cuaderno solo se guarda aquí (se puede cerrar). */
function cintaInvitado() {
  const cerrar = () => {
    sonar('cerrar');
    try { sessionStorage.setItem(CLAVE_AVISO, '1'); } catch { /* sin almacenamiento */ }
    pintarCabecera();
  };
  return el('div', { class: 'cinta-invitado', role: 'note' },
    icono('candado', 'icono invitado-candado'),
    el('p', {}, t('cabecera.invitado')),
    el('a', { class: 'btn invitado-crear', href: '#/entrar/crear' }, t('cabecera.invitadoCta')),
    el('button', { type: 'button', class: 'invitado-cerrar', 'aria-label': t('cabecera.cerrarAviso'), title: t('cabecera.cerrarAviso'), onclick: cerrar }, '×'));
}

function avisoCerrado() {
  try { return Boolean(sessionStorage.getItem(CLAVE_AVISO)); } catch { return false; }
}

// ---------------------------------------------------------------------------

/** Pinta la parte de la cabecera que depende de la sesión. */
export function pintarCabecera() {
  const u = usuarioActual();
  document.body.dataset.sesion = u ? 'usuario' : 'invitado';
  if (u) pintarConSesion(u);
  else pintarInvitado();

  let contenido = null;
  if (enPortada()) contenido = u ? cintaBienvenida(u) : null;
  else if (!u && hayCurso && !avisoCerrado()) contenido = cintaInvitado();
  poner(cinta, contenido);
  cinta.hidden = !contenido;
}

// Con la página bajada, la cabecera (que se queda arriba) se encoge y esconde la cinta.
// Dos umbrales separados: al encogerse, la página se acorta y el desplazamiento cambia; con uno solo,
// ese cambio la hacía dudar entre encogerse y crecer. Ahora se encoge pasados 120 px y solo crece arriba del todo.
let encogida = false;
addEventListener('scroll', () => {
  const ahora = encogida ? scrollY > 8 : scrollY > 120;
  if (ahora !== encogida) { encogida = ahora; cabecera.classList.toggle('encogida', ahora); }
}, { passive: true });

alCambiarNube(() => {
  // el puntito de la nube cambia a menudo: si el menú está abierto, no se repinta para no cerrárselo
  if (!menuAbierto) pintarCabecera();
});
alCambiar(() => { if (!menuAbierto) pintarCabecera(); });
