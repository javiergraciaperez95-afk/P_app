// Pantalla «Paglot Escuelas» (#/escuelas): el colegio Paglot. Delante del colegio, la pizarra de la entrada con el
// título y la maestra; en el patio, alumnas que juegan (y corren a su sitio si suena la campana del tejado).
// Después, el tablón del colegio con las cuatro ofertas, la calculadora del Pack Centro (cada pupitre son diez
// alumnos), el temario a medida y la circular para las familias (menores y datos). Todavía no se cobra:
// la página invita a escribirnos. Precios en js/config.js (ESCUELAS) y plan en el PDF de escuelas y empresas.
// Colores en css/escuelas.css; las tutoras, con js/vistas/elenco.js.

import { el, poner } from '../dom.js';
import { t, locale } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { ESCUELAS, ZONAS, PRECIOS_VISIBLES } from '../config.js';
import { preciosDeSuZona } from '../region.js';
import { sol, luna, nubes, dibujoPixel, conContorno, conHalo } from './inicio-decorado.js';
import { crearElenco, lienzo } from './elenco.js';

// ---------------------------------------------------------------------------
// El colegio (prefijo «ce»): a pared · b pared en sombra · c molduras · r tejado · R tejado oscuro
// w ventana · f marco · d puerta · e escalones · o campana · O campana en sombra · p letrero · v hiedra · n madera
// ---------------------------------------------------------------------------
function rejillaColegio() {
  const W = 220;
  const H = 104;
  const { R, filas } = lienzo(W, H);
  const ventana = (x, y, w = 8, h = 11) => {
    R(x - 1, y - 1, w + 2, h + 2, 'f');
    R(x, y, w, h, 'w');
    R(x + Math.floor(w / 2), y, 1, h, 'f');
    R(x, y + Math.floor(h / 2), w, 1, 'f');
    R(x - 2, y + h + 1, w + 4, 2, 'c');
  };
  // las dos alas bajas
  for (const x0 of [0, 160]) {
    for (let i = 0; i < 6; i++) R(x0 + 6 - i, 44 + i, 48 + i * 2, 1, i % 2 ? 'R' : 'r');
    R(x0, 50, 60, 2, 'c');
    R(x0 + 2, 52, 56, 52, 'a');
    R(x0 + (x0 ? 54 : 2), 52, 4, 52, 'b');
    for (const vx of [8, 24, 40]) { ventana(x0 + vx, 58); ventana(x0 + vx, 80); }
  }
  // el cuerpo central de tres pisos
  for (let i = 0; i < 8; i++) R(56 - i * 2, 20 + i * 2, 108 + i * 4, 2, i % 2 ? 'R' : 'r');
  R(40, 36, 140, 3, 'c');
  R(44, 39, 132, 65, 'a');
  R(44, 39, 4, 65, 'b');
  for (let x = 54; x < 172; x += 15) {
    if (x > 95 && x < 120) continue;
    ventana(x, 44, 9, 12); ventana(x, 64, 9, 12); ventana(x, 84, 9, 12);
  }
  // la torre de la campana
  R(98, 4, 24, 16, 'a'); R(98, 4, 3, 16, 'b');
  for (let i = 0; i < 5; i++) R(96 + i * 2, 4 - i, 28 - i * 4, 1, 'r');
  R(110, 0, 1, 4, 'n');
  R(103, 8, 14, 10, 'f'); R(104, 9, 12, 9, 'k');
  R(106, 10, 8, 2, 'o'); R(105, 12, 10, 4, 'o'); R(105, 15, 10, 1, 'O'); R(109, 16, 2, 2, 'O');
  // el letrero, la puerta y los escalones
  R(90, 42, 40, 9, 'p'); R(90, 42, 40, 1, 'c'); R(90, 50, 40, 1, 'f');
  R(96, 58, 28, 1, 'c'); R(97, 59, 26, 37, 'f'); R(99, 61, 22, 35, 'd'); R(109, 61, 2, 35, 'f');
  R(101, 64, 6, 10, 'D'); R(113, 64, 6, 10, 'D'); R(101, 78, 6, 12, 'D'); R(113, 78, 6, 12, 'D');
  R(92, 96, 36, 3, 'e'); R(88, 99, 44, 5, 'e');
  // la hiedra de las esquinas
  let s = 3;
  const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const [x0, ancho, alto] of [[2, 10, 40], [44, 8, 30], [168, 8, 34], [206, 12, 44]]) {
    for (let y = H - 1; y > H - alto; y--) {
      for (let x = x0; x < x0 + ancho; x++) if (azar() < 0.4 * (1 - (H - y) / alto) + 0.1) R(x, y, 1, 1, azar() < 0.3 ? 'V' : 'v');
    }
  }
  return conContorno(filas());
}

/** Un pupitre con su silla (cada uno son diez alumnos en la calculadora). */
const PUPITRE = (() => {
  const { R, filas } = lienzo(14, 12);
  R(0, 2, 14, 3, 'n'); R(0, 2, 14, 1, 'N');
  R(1, 5, 2, 7, 'g'); R(11, 5, 2, 7, 'g');
  R(3, 0, 5, 2, 'p'); R(4, 0, 3, 1, 'r');
  return conContorno(filas());
})();

export function pintarEscuelas(root) {
  const elenco = crearElenco();
  const { quieto, despues, alApagar } = elenco;
  // «Calcular precio»: en el ordenador baja hasta la calculadora; en el móvil la página va en diapositivas (nada se
  // desplaza, por eso el botón no hacía nada): salta a la diapositiva de la calculadora
  const irA = destino => {
    if (document.documentElement.classList.contains('pm-activo')) destino.dispatchEvent(new CustomEvent('pm-ir', { bubbles: true, detail: destino }));
    else destino.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
  };
  // de noche las ventanas encendidas alumbran (conHalo: solo de noche, sin animación)
  const dibujo = (rejilla, clase) => conHalo(dibujoPixel(rejilla, clase, 'ce'), ['ce-w']);
  const z = preciosDeSuZona();
  const escala = z.plusAno / ZONAS.A.plusAno;
  const euros = n => n.toLocaleString(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  // sin cifras (PRECIOS_VISIBLES = false): cada precio dice «Precio por anunciar»
  const precioTexto = n => (PRECIOS_VISIBLES ? euros(n) : t('precio.porAnunciar'));
  const porAlumno = descuento => Math.round(z.plusAno * (1 - descuento) * 100) / 100;
  const tramoDe = n => [...ESCUELAS.tramos].reverse().find(tr => n >= tr.desde) ?? ESCUELAS.tramos[0];
  const unidad = Math.round(ESCUELAS.unidadMedida * escala);
  const contactar = () => {
    try { sessionStorage.setItem('paglot-contacto-asunto', 'escuelas'); } catch { /* sin almacenamiento */ }
    sonar('buzon');
  };

  // =====================================================================
  // 1. El colegio
  // =====================================================================
  const maestra = elenco.tutora(elenco.protagonista(), 'ce-maestra');
  const alumnas = [0, 1, 2].map(i => elenco.tutora(elenco.otra(), `ce-alumna ce-alumna-${i + 1}`));
  maestra.alTocar = () => { maestra.gesto('senalar'); maestra.decir(t('esc.tutora.hola'), 2600); };
  const campana = el('button', { type: 'button', class: 'ce-campana', 'aria-label': t('esc.campana') });
  campana.addEventListener('click', () => {
    sonar('campana');
    campana.classList.remove('suena');
    void campana.offsetWidth;
    campana.classList.add('suena');
    maestra.decir(t('esc.tutora.campana'), 2400);
    alumnas.forEach((a, i) => despues(i * 140, () => { a.reaccionar('sorprendida', 600); a.gesto(['vueltecita', 'celebrar', 'saludar'][i]); }));
  });
  const colegio = el('section', { class: 'ce-colegio' },
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, sol(), luna(), nubes()),
    el('div', { class: 'ce-edificio' }, dibujo(rejillaColegio(), 'ce-dibujo'), el('span', { class: 'ce-letrero', 'aria-hidden': 'true' }, 'Paglot'), campana),
    el('span', { class: 'ce-valla', 'aria-hidden': 'true' }),
    el('span', { class: 'ce-patio', 'aria-hidden': 'true' }, el('i', { class: 'ce-rayuela' })),
    el('div', { class: 'ce-delante' },
      el('div', { class: 'ce-pizarra' },
        el('span', { class: 'ce-etiqueta' }, t('esc.etiqueta')),
        el('h1', {}, t('esc.titulo')),
        // sin cifras, el lema (que habla de «mitad de precio») se cambia por la nota de que los precios llegarán luego
        el('p', {}, PRECIOS_VISIBLES ? t('esc.lema') : t('esc.lema.sinPrecio')),
        el('div', { class: 'ce-botones' },
          el('a', { class: 'es-boton', href: '#/contacto', onclick: contactar }, t('esc.contactar')),
          el('a', { class: 'es-boton es-boton-papel', href: '#esc-calculadora', onclick: e => { e.preventDefault(); sonar('tiza'); irA(calculadora); } }, t('esc.verPrecios'))),
        el('span', { class: 'ce-pizarra-patas', 'aria-hidden': 'true' })),
      maestra.figura,
      el('div', { class: 'ce-alumnas' }, alumnas.map(a => a.figura))));

  // =====================================================================
  // 2. El tablón con las cuatro ofertas
  // =====================================================================
  const nota = (clase, etiqueta, titulo, texto, extra) => el('li', { class: `ce-nota ${clase}` },
    el('span', { class: 'ce-chincheta', 'aria-hidden': 'true' }),
    el('span', { class: 'ce-nota-etiqueta' }, etiqueta),
    el('h3', {}, titulo),
    el('p', {}, texto),
    extra ?? null);
  const tablon = el('section', { class: 'ce-tablon-seccion', 'aria-labelledby': 'ce-tablon' },
    el('h2', { id: 'ce-tablon', class: 'ce-titulo-seccion' }, t('esc.tablon')),
    el('ul', { class: 'ce-tablon' },
      nota('ce-nota-aula', t('esc.aula.etiqueta'), t('esc.aula.titulo'), t('esc.aula.texto')),
      nota('ce-nota-pack', PRECIOS_VISIBLES ? t('esc.pack.etiqueta', { precio: euros(porAlumno(ESCUELAS.tramos[ESCUELAS.tramos.length - 1].descuento)) }) : t('precio.porAnunciar'), t('esc.pack.titulo'), t('esc.pack.texto')),
      nota('ce-nota-medida', PRECIOS_VISIBLES ? t('esc.medida.etiqueta', { precio: euros(unidad) }) : t('precio.porAnunciar'), t('esc.medida.titulo'), t('esc.medida.texto')),
      nota('ce-nota-libros', t('esc.libros.etiqueta'), t('esc.libros.titulo'), t('esc.libros.texto'))),
    el('p', { class: 'ce-pronto' }, el('span', { 'aria-hidden': 'true' }, '✎ '), t('esc.pronto')));

  // =====================================================================
  // 3. La calculadora: cada pupitre son diez alumnos
  // =====================================================================
  const barra = el('input', { type: 'range', id: 'ce-alumnos', min: 20, max: 1500, step: 10, value: 120 });
  const numero = el('input', { type: 'number', class: 'ce-numero', min: 20, max: 99999, step: 1, value: 120, 'aria-label': t('esc.calc.alumnos') });
  const precio = el('strong', { class: 'ce-precio' });
  const total = el('strong', { class: 'ce-total' });
  const descuento = PRECIOS_VISIBLES ? el('span', { class: 'ce-descuento' }) : null;
  const aula = el('div', { class: 'ce-aula', 'aria-hidden': 'true' });
  // los tramos son de precio: sin cifras quedan solo los rangos de alumnos
  const tramos = el('ol', { class: 'ce-tramos' }, ESCUELAS.tramos.map((tr, i) => el('li', {},
    el('b', {}, `${tr.desde}${i < ESCUELAS.tramos.length - 1 ? `–${ESCUELAS.tramos[i + 1].desde - 1}` : '+'}`),
    PRECIOS_VISIBLES ? el('span', {}, euros(porAlumno(tr.descuento))) : null)));
  let pupitres = 0;
  function calcular(n, desde) {
    n = Math.max(20, Math.min(99999, Math.round(Number(n) || 20)));
    if (desde !== barra) barra.value = String(Math.min(1500, n));
    if (desde !== numero) numero.value = String(n);
    const tr = tramoDe(n);
    precio.textContent = precioTexto(porAlumno(tr.descuento));
    total.textContent = precioTexto(Math.round(porAlumno(tr.descuento) * n));
    if (descuento) descuento.textContent = t('esc.calc.descuento', { n: Math.round(tr.descuento * 100) });
    [...tramos.children].forEach((li, i) => li.classList.toggle('actual', ESCUELAS.tramos[i] === tr));
    // los pupitres: uno por cada diez alumnos (hasta 60), y los nuevos llegan dando un saltito
    const quiere = Math.min(60, Math.ceil(n / 10));
    while (pupitres < quiere) {
      const p = el('span', { class: 'ce-pupitre' }, dibujo(PUPITRE, ''));
      aula.append(p);
      pupitres++;
    }
    while (pupitres > quiere) { aula.lastChild.remove(); pupitres--; }
  }
  barra.addEventListener('input', () => calcular(barra.value, barra));
  numero.addEventListener('input', () => calcular(numero.value, numero));
  const calculadora = el('section', { class: 'ce-calculadora', id: 'esc-calculadora', 'aria-labelledby': 'ce-calc-titulo' },
    el('div', { class: 'ce-calc-panel es-papel' },
      el('h2', { id: 'ce-calc-titulo' }, t('esc.calc.titulo')),
      el('p', {}, t('esc.calc.texto')),
      el('label', { for: 'ce-alumnos', class: 'ce-calc-etiqueta' }, t('esc.calc.alumnos')),
      el('div', { class: 'ce-calc-fila' }, barra, numero),
      tramos,
      el('div', { class: 'ce-resultado' },
        el('div', {}, el('span', {}, t('esc.calc.porAlumno')), precio, descuento),
        el('div', {}, el('span', {}, t('esc.calc.total')), total)),
      el('p', { class: 'ce-calc-nota' }, t('esc.calc.notas'))),
    el('div', { class: 'ce-clase' },
      el('span', { class: 'ce-clase-pizarra', 'aria-hidden': 'true' }, t('esc.calc.pupitre')),
      aula));
  calcular(120);

  // =====================================================================
  // 4. El temario a medida
  // =====================================================================
  const medida = el('section', { class: 'ce-medida', 'aria-labelledby': 'ce-medida-titulo' },
    el('h2', { id: 'ce-medida-titulo', class: 'ce-titulo-seccion' }, t('esc.medida.titulo2')),
    el('div', { class: 'ce-medida-rejilla' },
      el('ul', { class: 'ce-ideas' }, [1, 2, 3, 4].map(i => el('li', { class: 'es-papel' }, el('span', { class: 'ce-idea-libro', 'aria-hidden': 'true' }), t(`esc.medida.idea${i}`)))),
      el('div', { class: 'ce-medida-precio es-papel' },
        el('span', { class: 'ce-nota-etiqueta' }, t('esc.medida.precio')),
        el('p', { class: 'ce-medida-cifra' }, precioTexto(unidad)),
        PRECIOS_VISIBLES ? el('p', {}, t('esc.medida.mitad', { precio: euros(Math.round(unidad * 0.6)) })) : null)),
    el('ol', { class: 'ce-horario' }, [1, 2, 3, 4].map(i => el('li', {}, el('b', {}, String(i)), t(`esc.paso${i}`)))),
    el('p', { class: 'ce-horario-nota' }, t('esc.pasos.dura')));

  // =====================================================================
  // 5. La circular para las familias
  // =====================================================================
  const circular = el('section', { class: 'ce-circular-seccion', 'aria-labelledby': 'ce-circular-titulo' },
    el('div', { class: 'ce-circular' },
      el('span', { class: 'ce-sello-colegio', 'aria-hidden': 'true' }, 'P'),
      el('h2', { id: 'ce-circular-titulo' }, t('esc.familias.titulo')),
      el('p', { class: 'ce-circular-lema' }, t('esc.familias.texto')),
      el('ol', {}, [1, 2, 3, 4].map(i => el('li', {}, t(`esc.familias.${i}`)))),
      el('p', { class: 'ce-firma' }, '— Paglot')));

  // =====================================================================
  // 6. Final
  // =====================================================================
  const fin = el('section', { class: 'ce-fin' },
    el('h2', {}, t('esc.fin.titulo')),
    el('p', {}, t('esc.fin.texto')),
    el('div', { class: 'ce-botones' },
      el('a', { class: 'es-boton es-boton-grande', href: '#/contacto', onclick: contactar }, t('esc.contactar')),
      el('a', { class: 'es-boton es-boton-papel', href: '#/empresas', onclick: () => sonar('pagina') }, t('esc.empresas'))));

  const secciones = [colegio, tablon, calculadora, medida, circular, fin];
  poner(root, el('article', { class: 'escuelas escena-web' }, secciones));
  elenco.vigilar(colegio);

  despues(700, () => { maestra.gesto('saludar'); sonar('saludo'); maestra.decir(t('esc.tutora.hola'), 3000); });
  // en el patio se juega: cada poco, una alumna hace algo
  if (!quieto) {
    let turno = 0;
    const recreo = setInterval(() => {
      if (!elenco.seVeParte(colegio)) return;
      const a = alumnas[turno++ % alumnas.length];
      a.gesto(['baile', 'vueltecita', 'saludarI', 'aplaudir'][turno % 4]);
    }, 2600);
    alApagar(() => clearInterval(recreo));
  }
  return () => elenco.apagar();
}
