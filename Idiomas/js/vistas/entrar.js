// Pantalla de entrada (#/entrar): iniciar sesión, crear cuenta o seguir sin cuenta.
// Los formularios son los mismos de «Perfil» (seccionCuenta). Quien sigue sin cuenta ve antes un aviso de la tutora.

import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { usuarioActual, alCambiarNube } from '../sync.js';
import { seccionCuenta } from './perfil.js';

/** Pinta la pantalla. Devuelve una función que la apaga: hay que llamarla al salir. */
export function pintarEntrar(contenedor) {
  const apagar = [];
  let encendida = true;
  const destino = hayCurso ? '#/lecciones' : '#/idiomas';
  const anfitriona = hayCurso ? curso : CURSOS.filter(c => !c.proximamente)[Math.floor(Math.random() * CURSOS.filter(c => !c.proximamente).length)];

  /** Una tutora viva con su bocadillo (los estilos son los de «Sobre Paglot»). */
  function tutora(clase) {
    const canvas = el('canvas', { class: 'sobre-tutora', width: 48, height: 64 });
    const globo = el('span', { class: 'inicio-globo' });
    const nodo = el('div', { class: `sobre-actriz ${clase}`, 'aria-hidden': 'true' }, globo, el('span', { class: 'sobre-salto' }, canvas));
    const a = { nodo, globo, sprite: null, expresion: 'normal' };
    dibujoDe(anfitriona).then(dibujo => {
      if (!encendida) return;
      a.sprite = dibujo.crearSprite(canvas);
      a.sprite.expresion = a.expresion;
      apagar.push(() => a.sprite.parar?.());
    }).catch(() => { nodo.hidden = true; });
    nodo.addEventListener('click', () => { sonar('clic'); a.sprite?.reaccionar('cosquillas', 900); });
    return a;
  }

  // Arriba: la tutora recibe y dice para qué sirve la cuenta.
  const recibe = tutora('sobre-guia');
  const saludo = setTimeout(() => {
    recibe.globo.textContent = t('entrar.tutora');
    recibe.nodo.classList.add('habla');
    recibe.sprite?.reaccionar('contenta', 900);
  }, 500);
  apagar.push(() => clearTimeout(saludo));

  // En medio: la cuenta (entrar, crear, recuperar; o los datos de la sesión si ya se ha entrado).
  const hueco = el('div', {});
  const ponerCuenta = pestana => poner(hueco, seccionCuenta(pestana));
  ponerCuenta();

  // Abajo: seguir (con sesión) o seguir sin cuenta (con el aviso de la tutora antes).
  const avisa = tutora('entrar-avisa');
  avisa.expresion = 'apurada';
  const aviso = el('div', { class: 'entrar-aviso caja', role: 'alert', hidden: true },
    avisa.nodo,
    el('div', {},
      el('p', {}, t('entrar.aviso')),
      el('div', { class: 'botonera' },
        el('button', {
          type: 'button', class: 'boton boton-mini',
          onclick: () => {
            sonar('clic');
            aviso.hidden = true;
            ponerCuenta('crear');
            hueco.querySelector('input')?.focus();
          },
        }, t('entrar.avisoNo')),
        el('a', { class: 'boton boton-mini boton-principal', href: destino, onclick: () => sonar('pagina') }, t('entrar.avisoSi')))));
  const pie = el('div', { class: 'entrar-pie' });
  const pintarPie = () => {
    if (usuarioActual()) {
      aviso.hidden = true;
      poner(pie, el('a', { class: 'boton boton-principal boton-grande', href: destino, onclick: () => sonar('pagina') },
        hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')));
    } else {
      poner(pie, el('button', {
        type: 'button', class: 'boton',
        onclick: () => {
          sonar('clic');
          aviso.hidden = false;
          avisa.sprite?.reaccionar('apurada', 1200);
          aviso.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        },
      }, t('entrar.sinCuenta')));
    }
  };
  pintarPie();
  let habia = Boolean(usuarioActual());
  apagar.push(alCambiarNube(() => {
    const hay = Boolean(usuarioActual());
    if (hay !== habia) { habia = hay; pintarPie(); }
  }));

  poner(contenedor,
    el('article', { class: 'entrar' },
      el('header', { class: 'sobre-cabecera' },
        recibe.nodo,
        el('div', { class: 'sobre-cabecera-texto' },
          el('h1', {}, t('entrar.titulo')),
          el('p', { class: 'sobre-lema' }, t('entrar.lema')))),
      hueco,
      pie,
      aviso));

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}
