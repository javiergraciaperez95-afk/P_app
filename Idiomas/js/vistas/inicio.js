// Pantalla de inicio (portada).
// 1. El escenario: el logotipo, el nombre y el botón de empezar, con tres tutoras (español, inglés y chino)
//    que juegan con él: lo señalan, lo empujan, lo presentan… y la de chino, de pie encima, salta y lo hunde.
// 2. Cómo se aprende: cuatro carteles, cada uno con una tutora haciendo lo que cuenta.
// 3. Los idiomas: una pasarela con la tutora del idioma que se señala y la lista para elegir.
// Las tutoras solo se mueven mientras se ven (IntersectionObserver).

import { el, poner } from '../dom.js';
import { t, locale, idioma } from '../i18n.js';
import { icono } from '../iconos.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, elegirCurso, nombreCurso, NOMBRES_TUTORAS } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { SALTO_PISA } from '../tutora-base.js';
import { sonar } from '../sonidos.js';

const CADA_ESCENA = 4200; // milisegundos entre una escenita del botón y la siguiente
const DURA_GLOBO = 1800;
const CADA_PASARELA = 3600;

// Cada cartel de «así se aprende» con el gesto que lo cuenta (se repite mientras se ve).
const CARACTERISTICAS = [
  { clave: 'f1', icono: 'libro', gestos: ['hojear', 'asentir'] },
  { clave: 'f2', icono: 'frases', gestos: ['pensar', 'senalar'] },
  { clave: 'f3', icono: 'estrellaLlena', gestos: ['escribir', 'pulgar'] },
  { clave: 'f4', icono: 'altavoz', escuchando: true, gestos: ['asentir'] },
];

const dibujos = new Map();
const dibujo = c => {
  if (!dibujos.has(c.id)) dibujos.set(c.id, dibujoDe(c));
  return dibujos.get(c.id);
};
const porId = id => CURSOS.find(c => c.id === id);

/**
 * Una tutora en su lienzo. Se enciende y se apaga con su zona; mientras no se ve no dibuja nada.
 * alto: filas del lienzo (64 normal; más si tiene que saltar sin cortarse la cabeza).
 */
function tutora(c, { clase = '', alto = 64, globo = true } = {}) {
  const canvas = el('canvas', { class: 'tutora-lienzo', width: 48, height: alto });
  const bocadillo = globo ? el('span', { class: 'inicio-globo', lang: c.lang }, c.hola) : null;
  const figura = el('div', { class: `inicio-figura ${clase}`.trim() }, bocadillo, canvas);
  const yo = { c, figura, canvas, sprite: null, dibujo: null, encendida: false, apagarGlobo: null };
  yo.cargar = () => { const quien = yo.c; return dibujo(quien).then(d => {
    if (yo.c !== quien) return yo; // mientras llegaba, ya se pidió otra (la pasarela va deprisa)
    yo.dibujo = d;
    if (yo.encendida && !yo.sprite) yo.sprite = d.crearSprite(canvas);
    return yo;
  }).catch(() => { figura.hidden = true; }); };
  yo.encender = () => { yo.encendida = true; if (yo.dibujo && !yo.sprite) yo.sprite = yo.dibujo.crearSprite(canvas); };
  yo.apagar = () => {
    yo.encendida = false;
    yo.sprite?.parar();
    yo.sprite = null;
    clearTimeout(yo.apagarGlobo);
    figura.classList.remove('habla');
  };
  yo.gesto = (nombre, conGlobo = false) => {
    yo.sprite?.gesto(nombre);
    if (conGlobo && bocadillo) yo.decir();
  };
  yo.decir = () => {
    figura.classList.add('habla');
    clearTimeout(yo.apagarGlobo);
    yo.apagarGlobo = setTimeout(() => figura.classList.remove('habla'), DURA_GLOBO);
  };
  /** Cambia de tutora en el mismo lienzo (la pasarela). */
  yo.cambiar = nueva => {
    yo.c = nueva;
    yo.sprite?.parar();
    yo.sprite = null;
    yo.dibujo = null;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (bocadillo) { bocadillo.textContent = nueva.hola; bocadillo.lang = nueva.lang; }
    return yo.cargar();
  };
  yo.cargar();
  return yo;
}

/** Enciende las tutoras de una zona solo mientras se ve, y llama a alVer/alDejar para sus relojes. */
function zona(elemento, tutoras, { alVer = () => {}, alDejar = () => {} } = {}) {
  let viendo = false;
  const ver = si => {
    if (si === viendo) return;
    viendo = si;
    if (si) { tutoras().forEach(x => x.encender()); alVer(); } else { alDejar(); tutoras().forEach(x => x.apagar()); }
  };
  if (!('IntersectionObserver' in window)) { ver(true); return { apagar: () => ver(false) }; }
  const observador = new IntersectionObserver(([e]) => ver(e.isIntersecting), { rootMargin: '60px' });
  observador.observe(elemento);
  return { apagar: () => { observador.disconnect(); ver(false); } };
}

function logo(clase, lado) {
  return el('img', { class: clase, src: 'assets/logo.svg', alt: '', width: lado, height: lado });
}

function bandera(c) {
  const hueco = el('span', { class: 'curso-bandera', 'aria-hidden': 'true' });
  hueco.innerHTML = c.bandera; // dibujo fijo que viene de js/cursos.js
  return hueco;
}

/**
 * Pinta la portada. Devuelve una función que la apaga (las tutoras dejan de moverse):
 * hay que llamarla al salir de la pantalla.
 */
export function pintarInicio(contenedor) {
  const relojes = new Set();
  const despues = (ms, fn) => { const r = setTimeout(() => { relojes.delete(r); fn(); }, ms); relojes.add(r); };
  const zonas = [];

  // =====================================================================
  // 1. El escenario del botón
  // =====================================================================
  const es = tutora(porId('es'), { clase: 'boton-izq' });
  const en = tutora(porId('en'), { clase: 'boton-der' });
  const zh = tutora(porId('zh'), { clase: 'boton-arriba', alto: 78 });

  const empezar = el('a', {
    class: 'inicio-empezar',
    href: hayCurso ? '#/lecciones' : '#/idiomas',
    onclick: () => sonar('pagina'),
  }, el('span', {}, hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')));
  const plataforma = el('div', { class: 'inicio-plataforma' }, zh.figura, empezar);

  /** El botón reacciona: se hunde (pisado), se aprieta (apretujado) o brilla. */
  const boton = (clase, ms) => {
    plataforma.classList.remove(clase);
    void plataforma.offsetWidth; // para que la animación vuelva a empezar
    plataforma.classList.add(clase);
    despues(ms, () => plataforma.classList.remove(clase));
  };

  // Las escenitas, una detrás de otra y siempre en el mismo orden.
  const ESCENAS = [
    // le invitan a pulsarlo, cada una en su idioma
    () => { es.gesto('invitarDer', true); despues(650, () => en.gesto('invitarIzq', true)); despues(300, () => zh.gesto('saludar')); },
    // la de arriba salta y lo hunde; a las otras les pilla por sorpresa
    () => {
      zh.gesto('saltarBoton');
      const pisa = 1700 * SALTO_PISA;
      despues(pisa, () => boton('pisado', 260));
      despues(pisa + 40, () => { es.gesto('respingo'); en.gesto('respingo'); });
      despues(pisa + 900, () => { es.gesto('aplaudir'); en.gesto('aplaudir'); });
    },
    // lo empujan desde los dos lados y la de arriba se tambalea
    () => {
      es.gesto('empujarDer'); en.gesto('empujarIzq');
      boton('apretujado', 2100);
      despues(200, () => zh.sprite?.reaccionar('agobiada', 1800));
    },
    // ¡tachán!
    () => { es.gesto('presentarDer'); en.gesto('presentarIzq'); zh.gesto('celebrar'); boton('brilla', 1600); },
    // lo señalan con el dedo
    () => { es.gesto('senalarAbajoDer'); en.gesto('senalarAbajoIzq'); despues(400, () => zh.gesto('pulgar', true)); },
  ];
  let escena = 0;
  let relojEscenas = null;
  const siguienteEscena = () => {
    if (document.hidden) return;
    ESCENAS[escena % ESCENAS.length]();
    escena++;
  };

  // Al pasar por el botón lo señalan todas; al tocar a una, hace su gesto propio y dice hola.
  empezar.addEventListener('pointerenter', () => { es.gesto('senalarAbajoDer'); en.gesto('senalarAbajoIzq'); zh.gesto('pulgar'); });
  for (const x of [es, en, zh]) {
    x.figura.addEventListener('click', () => { sonar('saludo'); x.gesto('firma', true); });
  }

  const numero = n => n.toLocaleString(locale());
  const totalLecciones = CURSOS.reduce((suma, c) => suma + (c.lecciones || 0), 0);
  const disponibles = CURSOS.filter(c => !c.proximamente);
  const dato = (n, clave) => el('li', {}, el('strong', {}, numero(n)), el('span', {}, t(`inicio.dato.${clave}`)));

  const escenario = el('section', { class: 'inicio-escenario' },
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }),
    el('div', { class: 'inicio-cabeza' },
      el('div', { class: 'inicio-halo' }, logo('inicio-logo', 160)),
      el('h1', { class: 'inicio-nombre', 'aria-label': t('app.nombre') },
        el('span', { 'aria-hidden': 'true' }, 'Pa'), el('span', { class: 'inicio-nombre-oro', 'aria-hidden': 'true' }, 'glot')),
      el('p', { class: 'inicio-lema' }, t('inicio.lema'))),
    el('div', { class: 'inicio-trio' }, es.figura, plataforma, en.figura),
    el('div', { class: 'inicio-suelo', 'aria-hidden': 'true' }),
    el('div', { class: 'inicio-bajo' },
      el('p', { class: 'inicio-texto' }, t('inicio.texto')),
      hayCurso ? el('a', { class: 'inicio-otro', href: '#/idiomas', onclick: () => sonar('pagina') }, t('inicio.otroIdioma')) : null,
      el('ul', { class: 'inicio-datos' },
        dato(disponibles.length, 'idiomas'),
        dato(totalLecciones, 'lecciones'),
        dato(disponibles.length, 'tutoras'))));
  for (const x of [es, en, zh]) x.figura.setAttribute('aria-hidden', 'true');

  zonas.push(zona(escenario.querySelector('.inicio-trio'), () => [es, en, zh], {
    alVer: () => { despues(500, siguienteEscena); relojEscenas = setInterval(siguienteEscena, CADA_ESCENA); },
    alDejar: () => clearInterval(relojEscenas),
  }));

  // =====================================================================
  // 2. Así se aprende: cada cartel con su tutora haciendo lo que cuenta
  // =====================================================================
  const otras = disponibles.filter(c => !['es', 'en', 'zh'].includes(c.id));
  for (let i = otras.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otras[i], otras[j]] = [otras[j], otras[i]];
  }
  const carteles = CARACTERISTICAS.map((f, i) => {
    const x = tutora(otras[i % otras.length], { clase: 'cartel-tutora', globo: false });
    x.figura.setAttribute('aria-hidden', 'true');
    let paso = 0;
    let reloj = null;
    const repetir = () => {
      if (document.hidden || !x.sprite) return;
      x.sprite.escuchando = Boolean(f.escuchando);
      x.gesto(f.gestos[paso % f.gestos.length]);
      paso++;
    };
    const tarjeta = el('li', { class: 'inicio-cartel' },
      el('div', { class: 'cartel-escena' }, x.figura),
      el('div', { class: 'cartel-texto' },
        el('h3', {}, icono(f.icono, 'icono inicio-icono'), t(`inicio.${f.clave}.titulo`)),
        el('p', {}, t(`inicio.${f.clave}.texto`))));
    x.figura.addEventListener('click', () => { sonar('saludo'); x.gesto('firma'); });
    zonas.push(zona(tarjeta, () => [x], {
      alVer: () => { despues(300 + i * 250, repetir); reloj = setInterval(repetir, 3000 + i * 200); },
      alDejar: () => clearInterval(reloj),
    }));
    return tarjeta;
  });

  // =====================================================================
  // 3. Los idiomas: la pasarela y la lista
  // =====================================================================
  const i = idioma();
  const primera = hayCurso ? curso : disponibles[Math.floor(Math.random() * disponibles.length)];
  const modelo = tutora(primera, { clase: 'pasarela-tutora' });
  modelo.figura.setAttribute('aria-hidden', 'true');
  const nombreModelo = el('p', { class: 'pasarela-nombre' });
  const banderaModelo = el('span', { class: 'pasarela-bandera' });
  let fija = false; // mientras se señala un idioma, la pasarela no cambia sola
  let enPasarela = disponibles.indexOf(primera);

  const presentar = (c, saludar = true) => {
    if (c.id !== modelo.c.id) {
      modelo.cambiar(c).then(() => { if (saludar) modelo.gesto('vueltecita', true); });
    } else if (saludar) modelo.gesto('saludar', true);
    banderaModelo.innerHTML = c.bandera;
    poner(nombreModelo, el('strong', {}, NOMBRES_TUTORAS[c.id] ?? ''), el('span', {}, t('inicio.tutoraDe', { idioma: nombreCurso(c, i) })));
    for (const b of lista.querySelectorAll('.inicio-idioma')) b.classList.toggle('en-pasarela', b.dataset.id === c.id);
  };

  const ficha = c => {
    const pronto = Boolean(c.proximamente);
    const traducido = nombreCurso(c, i);
    const b = el('button', {
      type: 'button', class: `inicio-idioma${c.id === curso.id ? ' actual' : ''}`, disabled: pronto, 'data-id': c.id,
      title: pronto ? `${traducido} · ${t('cursos.pronto')}` : traducido,
      onclick: () => { sonar('pagina'); elegirCurso(c.id); },
    }, bandera(c), el('span', { lang: c.lang }, c.nativo));
    if (!pronto) {
      const senalar = () => { fija = true; enPasarela = disponibles.indexOf(c); presentar(c); };
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') senalar(); });
      b.addEventListener('focus', senalar);
      b.addEventListener('pointerleave', () => { fija = false; });
      b.addEventListener('blur', () => { fija = false; });
    }
    return el('li', {}, b);
  };
  const lista = el('ul', { class: 'inicio-idiomas' }, CURSOS.map(ficha));
  modelo.figura.addEventListener('click', () => { sonar('saludo'); modelo.gesto('firma', true); });

  let relojPasarela = null;
  const pasarela = el('div', { class: 'inicio-pasarela' },
    el('div', { class: 'pasarela-escena' }, modelo.figura, el('div', { class: 'pasarela-suelo', 'aria-hidden': 'true' })),
    el('div', { class: 'pasarela-ficha' }, banderaModelo, nombreModelo));
  zonas.push(zona(pasarela, () => [modelo], {
    alVer: () => {
      despues(400, () => modelo.gesto('saludar', true));
      relojPasarela = setInterval(() => {
        if (fija || document.hidden) return;
        enPasarela = (enPasarela + 1) % disponibles.length;
        presentar(disponibles[enPasarela]);
      }, CADA_PASARELA);
    },
    alDejar: () => clearInterval(relojPasarela),
  }));

  poner(contenedor,
    el('div', { class: 'inicio' },
      escenario,
      el('section', { class: 'inicio-seccion' },
        el('h2', {}, t('inicio.comoTitulo')),
        el('ul', { class: 'inicio-carteles' }, carteles)),
      el('section', { class: 'inicio-seccion' },
        el('h2', {}, t('inicio.idiomasTitulo', { n: CURSOS.length })),
        el('p', { class: 'inicio-seccion-texto' }, t('inicio.idiomasTexto')),
        el('div', { class: 'inicio-elegir' }, pasarela, lista))));
  presentar(primera, false);

  return () => {
    for (const r of relojes) clearTimeout(r);
    clearInterval(relojEscenas);
    clearInterval(relojPasarela);
    for (const z of zonas) z.apagar();
  };
}
