// Pantalla de inicio (portada).
// 1. El escenario (con una universidad de fondo y su cielo de día o de noche): el logotipo, el nombre y el botón de empezar, con tres tutoras (español, inglés y chino)
//    que juegan con él: lo señalan, lo empujan, lo presentan… y la de chino, de pie encima, salta y lo hunde.
// 2. Cómo se aprende: cuatro carteles, cada uno con una tutora haciendo lo que cuenta.
// 3. Los idiomas: un teatro con telón donde sale la tutora del idioma que se señala, y una entrada por idioma.
// Las tutoras solo se mueven mientras se ven (IntersectionObserver).

import { el, poner } from '../dom.js';
import { t, locale, idioma } from '../i18n.js';
import { icono } from '../iconos.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, nombreCurso, NOMBRES_TUTORAS, paraQuien } from '../curso.js';
import { entrarEnCurso } from '../sin-terminar.js';
import { dibujoDe } from '../tutor-sprite.js';
import { SALTO_PISA } from '../tutora-base.js';
import { sonar } from '../sonidos.js';
import { universidad, sol, luna, nubes, maceta, aplique, ventana, banderines, mercado, farolillos, paseantes, curvaDeTela } from './inicio-decorado.js';

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
    if (yo.c !== quien) return yo; // mientras llegaba, ya se pidió otra (el teatro cambia deprisa)
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
  /** Cambia de tutora en el mismo lienzo (el teatro). */
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

/**
 * Las animaciones de CSS de una parte de la portada se quedan quietas mientras no se ve (como las del pie):
 * cada animación en marcha le cuesta trabajo al navegador en cada fotograma, se vea o no, y aquí hay cientos.
 */
function quietasFuera(partes) {
  if (!('IntersectionObserver' in window)) return () => {};
  const vigia = new IntersectionObserver(entradas => {
    for (const e of entradas) e.target.classList.toggle('quieta', !e.isIntersecting);
  }, { rootMargin: '60px' });
  for (const p of partes) if (p) vigia.observe(p);
  return () => vigia.disconnect();
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
  // las banderas y las entradas que se pueden tocar: sin el curso de tu propio idioma
  const paraTi = disponibles.filter(c => paraQuien(c, idioma()) !== 'no');
  const otras = disponibles.filter(c => !['es', 'en', 'zh'].includes(c.id));
  for (let i = otras.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otras[i], otras[j]] = [otras[j], otras[i]];
  }
  const dato = (n, clave) => el('li', {}, el('strong', {}, numero(n)), el('span', {}, t(`inicio.dato.${clave}`)));

  // ----- La pancarta: una tela colgada entre dos palos que sujetan dos tutoras; debajo, las 21 banderas ondeando -----
  const pancarta = (() => {
    const izq = tutora(otras[4 % otras.length], { clase: 'pancarta-tutora' });
    const der = tutora(otras[5 % otras.length], { clase: 'pancarta-tutora' });
    izq.figura.setAttribute('aria-hidden', 'true');
    der.figura.setAttribute('aria-hidden', 'true');
    // cada bandera va en cuatro tiras que suben y bajan a destiempo: así ondea a saltos de píxel
    const ondea = c => {
      const tiras = [0, 1, 2, 3].map(k => {
        const dentro = el('span', { class: 'ondea-dentro' });
        dentro.innerHTML = c.bandera; // dibujo fijo del catálogo local de cursos
        return el('span', { class: 'ondea-tira', style: `--k:${k}` }, dentro);
      });
      return el('li', {}, el('button', {
        type: 'button', class: 'cuerda-bandera', title: c.nativo, 'aria-label': c.nativo, lang: c.lang,
        onclick: () => { sonar('pagina'); entrarEnCurso(c); },
      }, tiras));
    };
    const curva = curvaDeTela();
    const lado = (x, cual) => el('div', { class: `pancarta-lado lado-${cual}` }, el('span', { class: 'pancarta-palo', 'aria-hidden': 'true' }), x.figura);
    const nodo = el('div', { class: 'inicio-bajo' },
      // el fondo: el cielo (nubes de día, estrellas de noche), el mercado nocturno y los farolillos
      el('div', { class: 'inicio-cielo mercado-cielo', 'aria-hidden': 'true' }, nubes()),
      mercado(),
      paseantes(),
      farolillos(),
      el('div', { class: 'pancarta-escena' },
        lado(izq, 'izq'),
        el('div', { class: 'pancarta-centro' },
          // la tela cuelga de las puntas de los palos y se comba por el centro (el borde lo pone un filtro que sigue la curva)
          el('div', { class: 'pancarta-caja' },
          el('div', { class: 'pancarta-borde' }, el('div', { class: 'pancarta', style: `clip-path: ${curva.tela}` },
            el('p', { class: 'inicio-texto' }, t('inicio.texto')),
            el('ul', { class: 'inicio-datos' },
              dato(disponibles.length, 'idiomas'),
              dato(totalLecciones, 'lecciones'),
              dato(disponibles.length, 'tutoras')),
            hayCurso ? el('a', { class: 'inicio-otro', href: '#/idiomas', onclick: () => sonar('pagina') }, t('inicio.otroIdioma')) : null)),
          el('span', { class: 'pancarta-flecos', 'aria-hidden': 'true', style: `clip-path: ${curva.flecos}` })),
          el('ul', { class: 'pancarta-cuerda' }, paraTi.map(ondea))),
        lado(der, 'der')),
      el('div', { class: 'pancarta-suelo', 'aria-hidden': 'true' }));
    // de vez en cuando saludan con la mano libre, se guiñan o asienten (sin soltar el palo)
    const GESTOS = { izq: ['saludarI', 'guino', 'asentir', 'pensar'], der: ['saludar', 'pulgar', 'asentir', 'guino'] };
    let turno = 0;
    let reloj = null;
    const gesto = () => {
      if (document.hidden) return;
      const quien = turno % 2 ? der : izq;
      const lista = GESTOS[turno % 2 ? 'der' : 'izq'];
      quien.gesto(lista[Math.floor(turno / 2) % lista.length], turno % 4 === 0);
      turno++;
    };
    const sujetar = () => { if (izq.sprite) izq.sprite.sujeta = 'D'; if (der.sprite) der.sprite.sujeta = 'I'; };
    for (const x of [izq, der]) x.figura.addEventListener('click', () => { sonar('saludo'); x.gesto(x === izq ? 'saludarI' : 'saludar', true); });
    zonas.push(zona(nodo, () => [izq, der], {
      alVer: () => { sujetar(); despues(200, sujetar); despues(900, sujetar); reloj = setInterval(() => { sujetar(); gesto(); }, 2600); },
      alDejar: () => clearInterval(reloj),
    }));
    return { nodo };
  })();

  const escenario = el('section', { class: 'inicio-escenario' },
    // el cielo: de día, sol y nubes; de noche, luna y estrellas (lo decide el CSS según el tema)
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, sol(), luna(), nubes()),
    el('div', { class: 'inicio-cabeza' },
      logo('inicio-logo', 160),
      el('h1', { class: 'inicio-nombre', 'aria-label': t('app.nombre') },
        el('span', { 'aria-hidden': 'true' }, 'Pa'), el('span', { class: 'inicio-nombre-oro', 'aria-hidden': 'true' }, 'glot')),
      el('p', { class: 'inicio-lema' }, t('inicio.lema'))),
    el('div', { class: 'inicio-trio' }, universidad(), es.figura, plataforma, en.figura),
    el('div', { class: 'inicio-suelo', 'aria-hidden': 'true' }),
    pancarta.nodo);
  for (const x of [es, en, zh]) x.figura.setAttribute('aria-hidden', 'true');

  zonas.push(zona(escenario.querySelector('.inicio-trio'), () => [es, en, zh], {
    alVer: () => { despues(500, siguienteEscena); relojEscenas = setInterval(siguienteEscena, CADA_ESCENA); },
    alDejar: () => clearInterval(relojEscenas),
  }));

  // =====================================================================
  // 2. Así se aprende: el pasillo de la universidad. Cada cosa va en un tablón de corcho y, debajo,
  //    una tutora pasea de un lado a otro; cuando llega a su sitio se para y hace lo que cuenta su tablón.
  // =====================================================================
  const quieta = (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('modo-calma'));
  const PASO = 3;        // píxeles por paso
  const CADA_PASO = 90;  // milisegundos entre paso y paso
  const tramos = CARACTERISTICAS.map((f, i) => {
    const x = tutora(otras[i % otras.length], { clase: 'pasillo-tutora', globo: false });
    x.figura.setAttribute('aria-hidden', 'true');
    // en el suelo, junto a la pilastra, una maceta (la última punta lleva otra)
    const paseo = el('div', { class: 'pasillo-paseo' }, maceta(i), i === CARACTERISTICAS.length - 1 ? maceta(i + 1) : null, x.figura);
    // el paseo: anda hasta un punto, se para, hace su gesto y vuelve a echar a andar
    let pos = null;
    let destino = 0;
    let parada = 0;
    let paso = 0;
    let reloj = null;
    const sitio = () => Math.max(0, paseo.clientWidth - x.figura.offsetWidth);
    const nuevoDestino = () => {
      const ancho = sitio();
      let d;
      do { d = Math.round(Math.random() * ancho / PASO) * PASO; } while (Math.abs(d - pos) < ancho / 4 && ancho > 40);
      destino = d;
    };
    const mover = () => {
      if (document.hidden || !x.sprite) return;
      if (pos === null) { pos = Math.round(sitio() / 2 / PASO) * PASO; nuevoDestino(); }
      pos = Math.min(pos, sitio());
      if (parada > 0) {
        parada -= CADA_PASO;
        x.sprite.andando = false;
        return;
      }
      if (pos === destino) {
        // llega: se para y hace lo de su tablón
        x.sprite.andando = false;
        x.sprite.escuchando = Boolean(f.escuchando);
        x.gesto(f.gestos[paso % f.gestos.length]);
        paso++;
        parada = 2800;
        nuevoDestino();
        return;
      }
      x.sprite.escuchando = false;
      x.sprite.andando = true;
      pos += Math.sign(destino - pos) * Math.min(PASO, Math.abs(destino - pos));
      x.figura.style.transform = `translateX(${pos}px)`;
    };
    // sin movimiento: no pasea; se queda en medio y hace su gesto de vez en cuando
    const repetirQuieta = () => {
      if (!x.sprite) return;
      x.figura.style.transform = `translateX(${Math.round(sitio() / 2)}px)`;
      x.sprite.escuchando = Boolean(f.escuchando);
      x.gesto(f.gestos[paso++ % f.gestos.length]);
    };
    const tramo = el('li', { class: 'pasillo-tramo' },
      aplique(), i === CARACTERISTICAS.length - 1 ? aplique() : null,
      el('div', { class: 'tablon' },
        el('span', { class: 'tablon-chincheta', 'aria-hidden': 'true' }),
        el('div', { class: 'tablon-papel' },
          el('h3', {}, icono(f.icono, 'icono inicio-icono'), t(`inicio.${f.clave}.titulo`)),
          el('p', {}, t(`inicio.${f.clave}.texto`)))),
      paseo);
    x.figura.addEventListener('click', () => { sonar('saludo'); parada = 2400; if (x.sprite) x.sprite.andando = false; x.gesto('firma'); });
    zonas.push(zona(paseo, () => [x], { // su trozo de suelo (en el móvil el tramo no tiene caja propia)
      alVer: () => {
        if (quieta) { despues(300 + i * 250, repetirQuieta); reloj = setInterval(repetirQuieta, 3200); return; }
        parada = 400 + i * 700; // no echan a andar todas a la vez
        reloj = setInterval(mover, CADA_PASO);
      },
      alDejar: () => clearInterval(reloj),
    }));
    return tramo;
  });

  // =====================================================================
  // 3. Los idiomas: el teatro. Un cartel de bombillas con el título, un escenario con telón rojo donde sale
  //    la tutora del idioma que se señala (el telón se cierra, cambia de tutora y se vuelve a abrir), el público
  //    delante y, debajo, una entrada de teatro por idioma.
  // =====================================================================
  const i = idioma();
  const primera = hayCurso ? curso : disponibles[Math.floor(Math.random() * disponibles.length)];
  const modelo = tutora(primera, { clase: 'teatro-tutora' });
  modelo.figura.setAttribute('aria-hidden', 'true');
  const nombreModelo = el('p', { class: 'teatro-nombre' });
  const banderaModelo = el('span', { class: 'teatro-bandera' });
  let fija = false; // mientras se señala un idioma, el teatro no cambia solo
  let enEscena = disponibles.indexOf(primera);
  let cambioTelon = null;

  const placa = c => {
    banderaModelo.innerHTML = c.bandera; // dibujo fijo del catálogo local de cursos
    poner(nombreModelo, el('strong', {}, NOMBRES_TUTORAS[c.id] ?? ''), el('span', {}, t('inicio.tutoraDe', { idioma: nombreCurso(c, i) })));
  };
  const presentar = (c, saludar = true) => {
    for (const b of lista.querySelectorAll('.inicio-idioma')) b.classList.toggle('en-escena', b.dataset.id === c.id);
    if (c.id === modelo.c.id) { if (saludar) modelo.gesto('saludar', true); return; }
    // el telón se cierra, sale la nueva y se abre: hace una reverencia y saluda
    teatro.classList.remove('cambia');
    void teatro.offsetWidth;
    teatro.classList.add('cambia');
    clearTimeout(cambioTelon);
    cambioTelon = setTimeout(() => {
      placa(c);
      modelo.cambiar(c).then(() => { if (saludar) despues(250, () => modelo.gesto(['reverencia', 'saludar'], true)); });
    }, 300);
  };

  const ficha = (c, n) => {
    const pronto = Boolean(c.proximamente);
    const traducido = nombreCurso(c, i);
    const b = el('button', {
      type: 'button', class: `inicio-idioma entrada${c.id === curso.id ? ' actual' : ''}`, disabled: pronto, 'data-id': c.id,
      title: pronto ? `${traducido} · ${t('cursos.pronto')}` : traducido,
      onclick: () => { sonar('pagina'); entrarEnCurso(c); },
    },
    // el talón (bandera y número de la entrada) y el cuerpo (el idioma en su lengua y en la tuya)
    el('span', { class: 'entrada-talon' }, bandera(c), el('span', { class: 'entrada-numero' }, `Nº ${String(n + 1).padStart(2, '0')}`)),
    el('span', { class: 'entrada-cuerpo' },
      el('span', { class: 'entrada-nativo', lang: c.lang }, c.nativo),
      traducido !== c.nativo ? el('span', { class: 'entrada-traducido' }, traducido) : null),
    c.id === curso.id ? el('span', { class: 'entrada-sello', 'aria-hidden': 'true' }, '★') : null);
    if (!pronto) {
      const senalar = () => { fija = true; enEscena = disponibles.indexOf(c); presentar(c); };
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') senalar(); });
      b.addEventListener('focus', senalar);
      b.addEventListener('pointerleave', () => { fija = false; });
      b.addEventListener('blur', () => { fija = false; });
    }
    return el('li', {}, b);
  };
  const lista = el('ul', { class: 'inicio-idiomas teatro-entradas' }, CURSOS.filter(c => paraQuien(c, i) !== 'no').map(ficha));

  // el público: cabecitas de espaldas, cada una con su pelo; al tocar a la tutora se emocionan
  const PELOS = ['#2b1d1a', '#7a4a2a', '#d9a441', '#b8402e', '#4a3a46', '#2b1d1a', '#9a6a3a', '#1f1a2e', '#c86a2a', '#5a3a28', '#2b1d1a', '#d9a441'];
  const publico = el('div', { class: 'teatro-publico', 'aria-hidden': 'true' },
    PELOS.map((pelo, n) => el('i', { style: `--pelo:${pelo}; --n:${n}` })));
  const aplauso = () => {
    publico.classList.remove('aplaude');
    void publico.offsetWidth;
    publico.classList.add('aplaude');
    despues(1600, () => publico.classList.remove('aplaude'));
  };
  modelo.figura.addEventListener('click', () => { sonar('saludo'); modelo.gesto('firma', true); aplauso(); despues(250, () => sonar('aplausos')); });

  const teatro = el('div', { class: 'teatro' },
    el('div', { class: 'teatro-marco' },
      el('div', { class: 'teatro-escena' },
        el('div', { class: 'teatro-foco', 'aria-hidden': 'true' }),
        modelo.figura,
        el('div', { class: 'telon telon-izq', 'aria-hidden': 'true' }),
        el('div', { class: 'telon telon-der', 'aria-hidden': 'true' }),
        el('div', { class: 'teatro-bambalina', 'aria-hidden': 'true' })),
      el('div', { class: 'teatro-tablas', 'aria-hidden': 'true' })),
    el('div', { class: 'teatro-placa' }, banderaModelo, nombreModelo),
    publico);

  let relojTeatro = null;
  zonas.push(zona(teatro, () => [modelo], {
    alVer: () => {
      despues(400, () => { modelo.gesto(['reverencia', 'saludar'], true); aplauso(); });
      relojTeatro = setInterval(() => {
        if (fija || document.hidden) return;
        enEscena = (enEscena + 1) % disponibles.length;
        presentar(disponibles[enEscena]);
      }, CADA_PASARELA);
    },
    alDejar: () => clearInterval(relojTeatro),
  }));

  poner(contenedor,
    el('div', { class: 'inicio' },
      escenario,
      el('section', { class: 'inicio-pasillo' },
        banderines(), ventana('izq'), ventana('der'),
        el('h2', { class: 'pasillo-letrero' }, el('span', {}, t('inicio.comoTitulo'))),
        el('ul', { class: 'pasillo-tramos' }, tramos)),
      el('section', { class: 'inicio-teatro' },
        el('div', { class: 'teatro-cartel' }, el('h2', {}, t('inicio.idiomasTitulo', { n: CURSOS.length }))),
        el('p', { class: 'inicio-seccion-texto' }, t('inicio.idiomasTexto')),
        teatro,
        lista)));
  placa(primera);
  for (const b of lista.querySelectorAll('.inicio-idioma')) b.classList.toggle('en-escena', b.dataset.id === primera.id);
  const despertar = quietasFuera(['.inicio-cielo', '.inicio-cabeza', '.inicio-trio', '.inicio-bajo', '.inicio-pasillo', '.inicio-teatro']
    .map(sel => contenedor.querySelector(sel)));

  return () => {
    despertar();
    for (const r of relojes) clearTimeout(r);
    clearInterval(relojEscenas);
    clearInterval(relojTeatro);
    clearTimeout(cambioTelon);
    for (const z of zonas) z.apagar();
  };
}
