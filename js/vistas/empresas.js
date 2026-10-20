// Pantalla «Paglot Empresas» (#/empresas): la sala de reuniones. Por el ventanal se ve la ciudad (de noche, con las
// oficinas encendidas); en la pizarra blanca, el título; la tutora que presenta, al lado, y el equipo sentado a la
// mesa. Después: las credenciales con las cuatro ofertas, el configurador del equipo (la mesa se llena de tutoras),
// los cursos de cada sector con lecciones de ejemplo, los equipos internacionales (cada tutora saluda en su idioma),
// el proceso y las facturas. Todavía no se cobra: la página invita a escribirnos.
// Precios en js/config.js (EMPRESAS); plan en el PDF de escuelas y empresas. Colores en css/empresas.css.

import { el, poner, alAzar } from '../dom.js';
import { t, locale } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { sonar } from '../sonidos.js';
import { EMPRESAS, ZONAS, PRECIOS_VISIBLES } from '../config.js';
import { preciosDeSuZona } from '../region.js';
import { sol, luna, nubes, dibujoPixel, conContorno, conHalo } from './inicio-decorado.js';
import { crearElenco, tutoraPintada, lienzo } from './elenco.js';

/** La ciudad por el ventanal: edificios de alturas distintas con sus ventanas (x se enciende de noche). */
function rejillaCiudad() {
  const W = 200;
  const H = 70;
  const { R, filas } = lienzo(W, H);
  let s = 9;
  const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let x = 0; x < W;) {
    const ancho = 12 + Math.floor(azar() * 16);
    const alto = 22 + Math.floor(azar() * 44);
    const tono = azar() < 0.5 ? 'a' : 'b';
    R(x, H - alto, ancho, alto, tono);
    if (azar() < 0.3) R(x + Math.floor(ancho / 2), H - alto - 6, 1, 6, 'b'); // una antena
    for (let y = H - alto + 3; y < H - 3; y += 5) {
      for (let vx = x + 2; vx < x + ancho - 2; vx += 4) R(vx, y, 2, 3, azar() < 0.45 ? 'x' : 'w');
    }
    x += ancho + (azar() < 0.4 ? 1 : 0);
  }
  return filas();
}

// los iconos de los sectores (12×12): campanita de hotel, bolsa, caja, cruz y cascos
const ICONOS = {
  hotel: ['............', '.....kk.....', '....oooo....', '...oyyyoo...', '..oyoooooo..', '..oooooooo..', '.oooooooooo.', '.oooooooooo.', 'kkkkkkkkkkkk', '.gggggggggg.', '............', '............'],
  comercio: ['....kkkk....', '...k....k...', '...k....k...', '.rrrrrrrrrr.', '.rRrrrrrrrr.', '.rrrrrrrrrr.', '.rrrrrrrrrr.', '.rrrrrrrrrr.', '.rrrrrrrrrr.', '.rrrrrrrrrr.', '.RRRRRRRRRR.', '............'],
  almacen: ['............', '.nnnnnnnnnn.', '.nNNNNNNNNn.', '.nnnnyynnnn.', '.nnnnyynnnn.', '.nnnnnnnnnn.', '.nnnnnnnnnn.', '.nnnnnnnnnn.', '.nnnnnnnnnn.', '.NNNNNNNNNN.', '............', '............'],
  salud: ['............', '....rrrr....', '....rrrr....', '....rrrr....', '.rrrrrrrrrr.', '.rrrrrrrrrr.', '.rrrrrrrrrr.', '.rrrrrrrrrr.', '....rrrr....', '....rrrr....', '....rrrr....', '............'],
  soporte: ['...kkkkkk...', '..k......k..', '.k........k.', '.k........k.', 'aak......kaa', 'aaa......aaa', 'aaa......aaa', 'aaa......aaa', '.aa......ak.', '.........k..', '.......kkk..', '............'],
};
const SECTORES = ['hotel', 'comercio', 'almacen', 'salud', 'soporte'];
// las tutoras que saludan en la franja de la plantilla (las de las lenguas de explicación más habituales)
const SALUDAN = ['vi', 'zh', 'pt', 'ro', 'ru', 'id', 'fr', 'th'];

export function pintarEmpresas(root) {
  const elenco = crearElenco();
  const { quieto, despues, alApagar } = elenco;
  // «Calcular precio»: en el ordenador baja hasta la calculadora; en el móvil la página va en diapositivas (nada se
  // desplaza, por eso el botón no hacía nada): salta a la diapositiva de la calculadora
  const irA = destino => {
    if (document.documentElement.classList.contains('pm-activo')) destino.dispatchEvent(new CustomEvent('pm-ir', { bubbles: true, detail: destino }));
    else destino.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
  };
  // de noche, las oficinas con la luz encendida («x») alumbran (conHalo: solo de noche, sin animación)
  const dibujo = (rejilla, clase) => conHalo(dibujoPixel(rejilla, clase, 'of'), ['of-x'], { radio: 1.6 });
  const z = preciosDeSuZona();
  const escala = z.plusAno / ZONAS.A.plusAno;
  const euros = n => n.toLocaleString(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  // sin cifras (PRECIOS_VISIBLES = false): cada precio dice «Precio por anunciar»
  const precioTexto = n => (PRECIOS_VISIBLES ? euros(n) : t('precio.porAnunciar'));
  const plusCon = d => Math.round(z.plusAno * (1 - d) * 100) / 100;
  const maxPersona = Math.round(z.maxAno * (1 - EMPRESAS.maxDescuento));
  const tramoDe = n => [...EMPRESAS.tramos].reverse().find(tr => n >= tr.desde) ?? EMPRESAS.tramos[0];
  const contactar = () => {
    try { sessionStorage.setItem('paglot-contacto-asunto', 'escuelas'); } catch { /* sin almacenamiento */ }
    sonar('buzon');
  };

  // =====================================================================
  // 1. La sala de reuniones
  // =====================================================================
  const ponente = elenco.tutora(elenco.protagonista(), 'of-ponente');
  const equipo = [0, 1, 2, 3].map(i => elenco.tutora(elenco.otra(), `of-sentada of-sentada-${i + 1}`));
  ponente.alTocar = () => { ponente.gesto('senalar'); ponente.decir(alAzar(t('emp.tutora.toca')), 2600); };
  const sala = el('section', { class: 'of-sala' },
    el('div', { class: 'of-ventanal', 'aria-hidden': 'true' },
      el('div', { class: 'inicio-cielo' }, sol(), luna(), nubes()),
      dibujo(rejillaCiudad(), 'of-ciudad'),
      el('p', { class: 'of-cielo-lema' }, t('emp.cieloLema')),
      el('i', {}), el('i', {}), el('i', {})),
    el('div', { class: 'of-delante' },
      el('div', { class: 'of-pizarra' },
        el('span', { class: 'of-etiqueta' }, t('emp.etiqueta')),
        el('h1', {}, t('emp.titulo')),
        el('p', {}, t('emp.lema')),
        el('div', { class: 'of-botones' },
          el('a', { class: 'es-boton', href: '#/contacto', onclick: contactar }, t('emp.contactar')),
          el('a', { class: 'es-boton es-boton-papel', href: '#emp-equipo', onclick: e => { e.preventDefault(); sonar('flecha'); irA(configurador); } }, t('emp.calcular'))),
        el('span', { class: 'of-rotuladores', 'aria-hidden': 'true' }, el('i', {}), el('i', {}), el('i', {})))),
    el('div', { class: 'of-mesa-escena' },
      ponente.figura,
      el('div', { class: 'of-sentados', 'aria-hidden': 'true' }, equipo.map(a => a.figura)),
      el('div', { class: 'of-mesa', 'aria-hidden': 'true' }, el('span', { class: 'of-portatil' }), el('span', { class: 'of-taza' }), el('span', { class: 'of-taza of-taza-2' }), el('span', { class: 'of-papeles' }))));

  // =====================================================================
  // 2. Las credenciales: las cuatro ofertas
  // =====================================================================
  const credencial = (clase, titulo, precio, puntos) => el('li', { class: `of-credencial ${clase}` },
    el('span', { class: 'of-cinta', 'aria-hidden': 'true' }),
    el('span', { class: 'of-pinza', 'aria-hidden': 'true' }),
    el('div', { class: 'of-credencial-cabecera' }, el('span', {}, 'Paglot'), el('b', {}, titulo)),
    el('p', { class: 'of-credencial-precio' }, precio),
    el('ul', {}, puntos.map(p => el('li', {}, p))));
  const credenciales = el('section', { class: 'of-credenciales-seccion', 'aria-labelledby': 'of-credenciales' },
    el('h2', { id: 'of-credenciales', class: 'of-titulo-seccion' }, t('emp.credenciales')),
    el('ul', { class: 'of-credenciales' },
      credencial('of-c-equipo', t('emp.equipo.titulo'), PRECIOS_VISIBLES ? t('emp.equipo.precio', { precio: euros(plusCon(EMPRESAS.tramos[EMPRESAS.tramos.length - 1].descuento)) }) : t('precio.porAnunciar'), [t('emp.equipo.1'), t('emp.equipo.2')]),
      // «Max con un 30 % menos» es un descuento: sin cifras, la viñeta pasa a «6 libros de tu idioma»
      credencial('of-c-max', t('emp.max.titulo'), PRECIOS_VISIBLES ? t('emp.max.precio', { precio: euros(maxPersona) }) : t('precio.porAnunciar'), [PRECIOS_VISIBLES ? t('emp.max.1') : t('pr.m2'), t('emp.max.2')]),
      credencial('of-c-sector', t('emp.sector.titulo'), PRECIOS_VISIBLES ? t('emp.sector.precio', { precio: euros(Math.round(EMPRESAS.unidadSector * escala)) }) : t('precio.porAnunciar'), [t('emp.sector.1'), t('emp.sector.2')]),
      credencial('of-c-plantilla', t('emp.plantilla.titulo'), t('emp.plantilla.precio'), [t('emp.plantilla.1'), t('emp.plantilla.2')])),
    el('p', { class: 'of-pronto' }, t('emp.pronto')));

  // =====================================================================
  // 3. El configurador: la mesa se llena de tutoras
  // =====================================================================
  let plan = 'plus';
  const barra = el('input', { type: 'range', id: 'of-personas', min: 5, max: 500, step: 1, value: 25 });
  const numero = el('input', { type: 'number', class: 'of-numero', min: 5, max: 99999, value: 25, 'aria-label': t('emp.calc.personas') });
  const precio = el('strong', { class: 'of-precio' });
  const total = el('strong', { class: 'of-total' });
  const descuento = PRECIOS_VISIBLES ? el('span', { class: 'of-descuento' }) : null;
  const planes = ['plus', 'max'].map(clave => el('button', {
    type: 'button', class: 'of-plan', 'aria-pressed': String(clave === plan),
    onclick: () => { plan = clave; planes.forEach((b, i) => b.setAttribute('aria-pressed', String(['plus', 'max'][i] === plan))); calcular(numero.value); sonar(clave === 'max' ? 'brindis' : 'elegir'); },
  }, t(`emp.plan.${clave}`)));
  const caras = CURSOS.filter(c => !c.proximamente).sort(() => Math.random() - 0.5).slice(0, 8);
  const sillas = caras.map(c => el('span', { class: 'of-silla' }, tutoraPintada(c)));
  const mas = el('span', { class: 'of-mas' });
  let ocupadas = 0;
  const mesaGrande = el('div', { class: 'of-mesa-grande', 'aria-hidden': 'true' }, el('div', { class: 'of-sillas' }, sillas, mas), el('span', { class: 'of-tablero' }));
  function calcular(n, desde) {
    n = Math.max(5, Math.min(99999, Math.round(Number(n) || 5)));
    if (desde !== barra) barra.value = String(Math.min(500, n));
    if (desde !== numero) numero.value = String(n);
    const tr = tramoDe(n);
    const porPersona = plan === 'max' ? maxPersona : plusCon(tr.descuento);
    precio.textContent = precioTexto(porPersona);
    total.textContent = precioTexto(Math.round(porPersona * n));
    if (descuento) descuento.textContent = t('esc.calc.descuento', { n: Math.round((plan === 'max' ? EMPRESAS.maxDescuento : tr.descuento) * 100) });
    // cuando llega alguien nuevo a la mesa, se oye cómo se sienta
    const sentadas = Math.min(n, sillas.length);
    if (desde && sentadas > ocupadas) sonar('silla');
    ocupadas = sentadas;
    sillas.forEach((s, i) => s.classList.toggle('ocupada', i < n));
    mas.textContent = n > sillas.length ? t('emp.calc.mas', { n: n - sillas.length }) : '';
  }
  barra.addEventListener('input', () => calcular(barra.value, barra));
  numero.addEventListener('input', () => calcular(numero.value, numero));
  const configurador = el('section', { class: 'of-equipo', id: 'emp-equipo', 'aria-labelledby': 'of-calc-titulo' },
    el('div', { class: 'of-calc es-papel' },
      el('h2', { id: 'of-calc-titulo' }, t('emp.calc.titulo')),
      el('p', {}, t('emp.calc.texto')),
      el('div', { class: 'of-planes', role: 'group', 'aria-label': t('emp.calc.plan') }, planes),
      el('label', { for: 'of-personas', class: 'of-calc-etiqueta' }, t('emp.calc.personas')),
      el('div', { class: 'of-calc-fila' }, barra, numero),
      el('div', { class: 'of-resultado' },
        el('div', {}, el('span', {}, t('emp.calc.porPersona')), precio, descuento),
        el('div', {}, el('span', {}, t('emp.calc.total')), total)),
      el('p', { class: 'of-calc-nota' }, t('emp.calc.notas'))),
    mesaGrande);
  calcular(25);

  // =====================================================================
  // 4. Los sectores
  // =====================================================================
  const muestra = el('div', { class: 'of-muestra', 'aria-live': 'polite' });
  const botonesSector = SECTORES.map(clave => el('button', {
    type: 'button', class: 'of-sector', 'aria-pressed': 'false',
    onclick: () => { elegirSector(clave); sonar('papel'); },
  }, dibujo(conContorno(ICONOS[clave]), 'of-sector-icono'), el('span', {}, t(`emp.s.${clave}`))));
  function elegirSector(clave) {
    botonesSector.forEach((b, i) => b.setAttribute('aria-pressed', String(SECTORES[i] === clave)));
    poner(muestra,
      el('span', { class: 'of-muestra-etiqueta' }, t('emp.sectores.ejemplo')),
      el('h3', {}, t(`emp.s.${clave}`)),
      el('ol', {}, t(`emp.s.${clave}.l`).map((leccion, i) => el('li', {}, el('b', {}, String(i + 1).padStart(2, '0')), leccion))));
  }
  elegirSector('hotel');
  const sectores = el('section', { class: 'of-sectores', 'aria-labelledby': 'of-sectores-titulo' },
    el('h2', { id: 'of-sectores-titulo', class: 'of-titulo-seccion' }, t('emp.sectores.titulo')),
    el('p', { class: 'of-entradilla' }, t('emp.sectores.texto')),
    el('div', { class: 'of-sectores-rejilla' },
      el('div', { class: 'of-sectores-lista', role: 'group', 'aria-label': t('emp.sectores.titulo') }, botonesSector),
      muestra),
    el('p', { class: 'of-sectores-precio' }, PRECIOS_VISIBLES ? t('emp.sectores.precio', {
      precio: euros(Math.round(EMPRESAS.unidadSector * escala)),
      cedida: euros(Math.round(EMPRESAS.unidadCedida * escala)),
      extra: euros(Math.round(EMPRESAS.lenguaExtra * escala)),
    }) : t('precio.porAnunciar')));

  // =====================================================================
  // 5. Un equipo, muchos idiomas: cada tutora saluda en el suyo
  // =====================================================================
  const saludan = SALUDAN.map(id => CURSOS.find(c => c.id === id)).filter(Boolean);
  const plantilla = el('section', { class: 'of-plantilla', 'aria-labelledby': 'of-plantilla-titulo' },
    el('div', { class: 'of-plantilla-texto' },
      el('h2', { id: 'of-plantilla-titulo' }, t('emp.plantilla.banda.titulo')),
      el('p', {}, t('emp.plantilla.banda.texto'))),
    el('ul', { class: 'of-saludos', 'aria-hidden': 'true' }, saludan.map((c, i) => el('li', { style: `--i:${i}` },
      el('span', { class: 'of-saludo' }, c.hola),
      tutoraPintada(c)))));

  // =====================================================================
  // 6. El proceso y las facturas
  // =====================================================================
  const proceso = el('section', { class: 'of-proceso', 'aria-labelledby': 'of-proceso-titulo' },
    el('h2', { id: 'of-proceso-titulo', class: 'of-titulo-seccion' }, t('emp.pasos.titulo')),
    el('ol', { class: 'of-pasos' }, [1, 2, 3, 4, 5].map(i => el('li', {}, el('b', {}, String(i)), el('span', {}, t(`emp.paso${i}`))))),
    el('div', { class: 'of-avisos' },
      el('div', { class: 'es-papel' }, el('h3', {}, t('emp.factura.titulo')), el('p', {}, t('emp.factura.texto')))));

  const fin = el('section', { class: 'of-fin' },
    el('h2', {}, t('emp.fin.titulo')),
    el('p', {}, t('emp.fin.texto')),
    el('div', { class: 'of-botones' },
      el('a', { class: 'es-boton es-boton-grande', href: '#/contacto', onclick: contactar }, t('emp.contactar')),
      el('a', { class: 'es-boton es-boton-papel', href: '#/escuelas', onclick: () => sonar('pagina') }, t('emp.escuelas'))));

  poner(root, el('article', { class: 'empresas escena-web' }, sala, credenciales, configurador, sectores, plantilla, proceso, fin));
  elenco.vigilar(sala);

  despues(700, () => { ponente.gesto('presentar'); sonar('saludo'); ponente.decir(t('emp.tutora.hola'), 3000); });
  if (!quieto) {
    // en la reunión, de vez en cuando alguien asiente, apunta o levanta la mano
    let turno = 0;
    const reunion = setInterval(() => {
      if (!elenco.seVeParte(sala)) return;
      const a = equipo[turno++ % equipo.length];
      a.gesto(['asentir', 'escribir', 'saludarI', 'pensar'][turno % 4]);
    }, 2400);
    alApagar(() => clearInterval(reunion));
  }
  return () => elenco.apagar();
}
