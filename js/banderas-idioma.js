// Las banderas de los idiomas de la interfaz (español, inglés y vietnamita), dibujadas con SVG: nunca emojis, que en
// Windows salen como dos letras («ES») y en cada móvil con un dibujo distinto.
const NS = 'http://www.w3.org/2000/svg';

const DIBUJOS = {
  // España: rojo, amarillo (el doble de ancho) y rojo
  es: { caja: '0 0 30 20', piezas: [['rect', { width: 30, height: 20, fill: '#c60b1e' }], ['rect', { y: 5, width: 30, height: 10, fill: '#ffc400' }]] },
  // Reino Unido: la Union Jack simplificada (se reconoce a 20 px)
  en: {
    caja: '0 0 60 30',
    piezas: [
      ['rect', { width: 60, height: 30, fill: '#012169' }],
      ['path', { d: 'M0 0l60 30M60 0L0 30', stroke: '#fff', 'stroke-width': 6 }],
      ['path', { d: 'M0 0l60 30M60 0L0 30', stroke: '#c8102e', 'stroke-width': 2 }],
      ['path', { d: 'M30 0v30M0 15h60', stroke: '#fff', 'stroke-width': 10 }],
      ['path', { d: 'M30 0v30M0 15h60', stroke: '#c8102e', 'stroke-width': 6 }],
    ],
  },
  // Vietnam: fondo rojo con la estrella amarilla de cinco puntas
  vi: {
    caja: '0 0 30 20',
    piezas: [
      ['rect', { width: 30, height: 20, fill: '#da251d' }],
      ['path', { fill: '#ffcd00', d: 'M15 4l1.47 4.52h4.76l-3.85 2.8 1.47 4.52L15 13.04l-3.85 2.8 1.47-4.52-3.85-2.8h4.76z' }],
    ],
  },
};

/** La bandera SVG de un idioma de la interfaz (decorativa: el nombre va al lado). */
export function banderaIdioma(clave) {
  const dibujo = DIBUJOS[clave];
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'bandera-idioma');
  svg.setAttribute('viewBox', dibujo?.caja ?? '0 0 30 20');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const [tipo, atributos] of dibujo?.piezas ?? [['rect', { width: 30, height: 20, fill: '#888' }]]) {
    const pieza = document.createElementNS(NS, tipo);
    for (const [k, v] of Object.entries(atributos)) pieza.setAttribute(k, String(v));
    svg.append(pieza);
  }
  return svg;
}
