// Pantalla «Regala Paglot Max» (#/regala-max): el taller de regalos de Paglot. Una guirnalda de bombillas,
// estantes con paquetes, rollos de papel de regalo y un mostrador. En el mostrador, la caja del regalo: pequeña
// si se regala un mes y grande si es un año. La tutora que envuelve la cambia; si tocas la caja, se abre y sale
// la tarjeta de Paglot Max entre confeti. A la derecha, la hoja del pedido. Abajo, «cómo funciona» en tres
// postales colgadas de un tendedero. Todavía no se cobra: el botón lo dice. Colores en css/regalo.css.

import { el, poner } from '../dom.js';
import { t } from '../i18n.js';
import { sonar } from '../sonidos.js';
import { dibujoPixel, conContorno } from './inicio-decorado.js';
import { crearElenco, lienzo } from './elenco.js';
import { comprar as comprarRegalo } from '../comprar.js';

// ---------------------------------------------------------------------------
// Dibujos (prefijo «rg»): k contorno · r/R rojo · a/A azul · v/V verde · o/O oro · p papel · m/M madera · y luz
// ---------------------------------------------------------------------------

/** El lazo de encima de la caja: dos lazadas, el nudo y las dos puntas. */
const LAZO = (() => {
  const { R, filas } = lienzo(30, 14);
  R(2, 1, 9, 2, 'o'); R(0, 3, 12, 6, 'o'); R(2, 9, 10, 2, 'o'); R(3, 4, 6, 3, 'O');
  R(19, 1, 9, 2, 'o'); R(18, 3, 12, 6, 'o'); R(18, 9, 10, 2, 'o'); R(21, 4, 6, 3, 'O');
  R(12, 3, 6, 7, 'O'); R(13, 4, 4, 5, 'o');
  R(10, 10, 3, 4, 'o'); R(17, 10, 3, 4, 'o');
  return conContorno(filas());
})();

/** Una balda con paquetes envueltos de varios tamaños y colores. */
const BALDA = (() => {
  const W = 84;
  const { R, filas } = lienzo(W, 30);
  const paquete = (x, y, w, h, c, cinta) => {
    R(x, y, w, h, c); R(x, y + h - 2, w, 2, c.toUpperCase());
    R(x + Math.floor(w / 2) - 1, y, 2, h, cinta); R(x, y + Math.floor(h / 2) - 1, w, 2, cinta);
    R(x + Math.floor(w / 2) - 3, y - 2, 2, 2, cinta); R(x + Math.floor(w / 2) + 1, y - 2, 2, 2, cinta);
  };
  paquete(2, 12, 16, 14, 'r', 'o');
  paquete(20, 6, 20, 20, 'a', 'p');
  paquete(42, 14, 12, 12, 'v', 'r');
  paquete(56, 9, 18, 17, 'o', 'r');
  paquete(75, 16, 8, 10, 'r', 'p');
  R(0, 26, W, 3, 'm'); R(0, 28, W, 1, 'M');
  R(6, 29, 2, 1, 'M'); R(W - 8, 29, 2, 1, 'M');
  return conContorno(filas());
})();

/** Una bobina de cinta, con la punta suelta. */
const BOBINA = (() => {
  const { R, filas } = lienzo(22, 16);
  R(2, 2, 14, 12, 'r'); R(2, 2, 14, 2, 'R'); R(2, 12, 14, 2, 'R');
  R(0, 0, 18, 2, 'm'); R(0, 14, 18, 2, 'm');
  R(7, 6, 4, 4, 'M');
  R(16, 8, 2, 2, 'r'); R(18, 10, 2, 2, 'r'); R(20, 12, 2, 4, 'r');
  return conContorno(filas());
})();

// los iconos de las postales: elegir (una cesta con el regalo), el código (un sobre) y estrenarlo (un calendario)
const ICONOS_PASO = [
  (() => {
    const { R, filas } = lienzo(16, 16);
    R(4, 0, 8, 2, 'm'); R(3, 2, 2, 4, 'm'); R(11, 2, 2, 4, 'm');
    R(5, 3, 6, 5, 'r'); R(7, 3, 2, 5, 'o');
    R(0, 6, 16, 2, 'M'); R(1, 8, 14, 7, 'm'); R(1, 10, 14, 1, 'M'); R(1, 13, 14, 1, 'M'); R(5, 8, 1, 7, 'M'); R(10, 8, 1, 7, 'M');
    return conContorno(filas());
  })(),
  (() => {
    const { R, filas } = lienzo(18, 13);
    R(0, 0, 18, 13, 'p');
    for (let i = 0; i < 7; i++) { R(i, i, 1, 1, 'k'); R(17 - i, i, 1, 1, 'k'); }
    R(7, 7, 4, 1, 'k');
    R(7, 8, 4, 3, 'r'); R(8, 9, 2, 1, 'o');
    return conContorno(filas());
  })(),
  (() => {
    const { R, filas } = lienzo(16, 16);
    R(0, 2, 16, 14, 'p'); R(0, 2, 16, 4, 'r');
    R(3, 0, 2, 4, 'k'); R(11, 0, 2, 4, 'k');
    for (let y = 8; y < 15; y += 3) for (let x = 2; x < 15; x += 3) R(x, y, 2, 2, 'A');
    R(8, 11, 2, 2, 'o'); R(7, 10, 4, 1, 'o'); R(7, 13, 4, 1, 'o');
    return conContorno(filas());
  })(),
];

// ---------------------------------------------------------------------------
// La pantalla
// ---------------------------------------------------------------------------

export function pintarRegalo(root) {
  const elenco = crearElenco();
  const { quieto, despues, alApagar } = elenco;
  const dibujo = (rejilla, clase) => dibujoPixel(rejilla, clase, 'rg');

  let duracion = 'mes';
  let abierta = false;

  // ----- Las tutoras: la que envuelve, detrás de la caja, y la del tendedero -----
  const envolvedora = elenco.tutora(elenco.protagonista(), 'rg-envolvedora');
  const tendedora = elenco.tutora(elenco.otra(), 'rg-tendedora');

  // ----- La caja del regalo -----
  const periodo = el('strong', { class: 'rg-tarjeta-periodo' });
  const tarjeta = el('div', { class: 'rg-tarjeta', 'aria-hidden': 'true' },
    el('span', { class: 'rg-corona' }),
    el('span', { class: 'rg-tarjeta-marca' }, 'Paglot Max'),
    periodo,
    el('span', { class: 'rg-tarjeta-codigo' }, t('productos.yourCodeAfterPurchase')));
  const confeti = el('span', { class: 'rg-confeti', 'aria-hidden': 'true' },
    Array.from({ length: 14 }, (_, i) => el('i', { style: `--dx:${Math.round(Math.cos(i * 0.45 + 3.6) * (60 + (i % 3) * 22))}px;--dy:${-70 - (i % 4) * 22}px;--d:${(i % 5) * 40}ms` })));
  const caja = el('button', { type: 'button', class: 'rg-caja', 'aria-expanded': 'false', 'aria-label': t('regalo.toca') },
    tarjeta,
    el('span', { class: 'rg-caja-cuerpo' }),
    el('span', { class: 'rg-tapa' }, dibujo(LAZO, 'rg-lazo')),
    confeti);
  const pista = el('p', { class: 'rg-pista', 'aria-hidden': 'true' }, t('regalo.toca'));
  caja.addEventListener('click', () => {
    abierta = !abierta;
    caja.classList.toggle('abierta', abierta);
    caja.setAttribute('aria-expanded', String(abierta));
    if (abierta) {
      sonar('pop');
      if (!quieto) despues(120, () => sonar('confeti'));
      envolvedora.gesto('aplaudir');
      envolvedora.decir(t('productos.thereIsANewLanguage'), 3000);
      tendedora.reaccionar('sorprendida', 700);
    } else {
      sonar('cerrar');
      envolvedora.gesto('asentir');
    }
  });

  // ----- La hoja del pedido -----
  const resumen = el('p', { class: 'rg-resumen', role: 'status', 'aria-live': 'polite' });
  const opciones = ['mes', 'ano'].map(clave => el('button', {
    type: 'button', class: `rg-opcion rg-opcion-${clave}`, 'aria-pressed': String(clave === duracion),
    onclick: () => elegir(clave),
  }, el('span', { class: 'rg-opcion-agujero', 'aria-hidden': 'true' }), clave === 'mes' ? t('productos.oneMonth') : t('productos.oneYear')));
  const nota = el('p', { class: 'rg-nota', role: 'status' }, t('productos.oneGiftAThousandConversations'));
  // comprar el regalo (js/comprar.js): el servidor cobra y manda al correo el código único de un solo uso
  const comprar = el('button', { type: 'button', class: 'es-boton rg-comprar', 'data-sonido': 'nada' }, t('regalo.comprar'));
  comprar.addEventListener('click', () => {
    envolvedora.gesto('celebrar');
    comprarRegalo(duracion === 'ano' ? 'max-ano' : 'max-mes', { regalo: true });
  });
  const pedido = el('div', { class: 'rg-pedido' },
    el('span', { class: 'rg-pinza', 'aria-hidden': 'true' }),
    el('div', { class: 'rg-hoja' },
      el('h2', {}, t('productos.howMuchLearningWouldYou')),
      el('div', { class: 'rg-opciones', role: 'group', 'aria-label': t('productos.giftDuration') }, opciones),
      resumen,
      el('p', { class: 'rg-explica' }, t('productos.theCodeIsTheGift')),
      comprar,
      nota));

  function elegir(clave, conGesto = true) {
    const cambia = clave !== duracion;
    duracion = clave;
    periodo.textContent = clave === 'mes' ? t('productos.1MonthOfPaglotMax') : t('productos.1YearOfPaglotMax');
    resumen.textContent = clave === 'mes' ? t('productos.onePremiumMonthStartingWhen') : t('productos.onePremiumYearStartingWhen');
    opciones.forEach((b, i) => b.setAttribute('aria-pressed', String(['mes', 'ano'][i] === clave)));
    caja.dataset.duracion = clave;
    if (!conGesto) return;
    sonar(cambia ? 'papel' : 'elegir');
    if (!cambia) return;
    // se vuelve a envolver: la caja se cierra, cambia de tamaño y la tutora lo celebra
    abierta = false;
    caja.classList.remove('abierta');
    caja.setAttribute('aria-expanded', 'false');
    caja.classList.remove('envolviendo');
    void caja.offsetWidth;
    caja.classList.add('envolviendo');
    envolvedora.gesto('presentar');
    envolvedora.decir(t(clave === 'mes' ? 'regalo.mes' : 'regalo.ano'), 2800);
  }
  elegir('mes', false);

  // ----- El taller -----
  const taller = el('section', { class: 'rg-taller' },
    el('span', { class: 'rg-guirnalda', 'aria-hidden': 'true' }),
    el('header', { class: 'rg-titulo' },
      el('span', { class: 'rg-cordel', 'aria-hidden': 'true' }),
      el('span', { class: 'rg-etiqueta-agujero', 'aria-hidden': 'true' }),
      el('span', { class: 'rg-etiqueta' }, t('productos.giftPaglotMax')),
      el('h1', {}, t('productos.giveThemTheirNextConversation')),
      el('p', {}, t('productos.oneMonthOrOneYear'))),
    el('div', { class: 'rg-escena' },
      dibujo(BALDA, 'rg-balda rg-balda-1'),
      el('span', { class: 'rg-rollos', 'aria-hidden': 'true' }, el('i', {}), el('i', {}), el('i', {}), el('i', {})),
      envolvedora.figura,
      el('div', { class: 'rg-sitio-caja' }, caja, pista),
      dibujo(BOBINA, 'rg-bobina')),
    pedido,
    el('div', { class: 'rg-mostrador', 'aria-hidden': 'true' }));

  // ----- Cómo funciona: tres postales en el tendedero -----
  const pasos = [
    [t('productos.chooseAndPay'), t('productos.chooseOneMonthOrOne')],
    [t('productos.receiveYourCode'), t('productos.afterPaymentYouReceiveA')],
    [t('productos.letThemStartWhenThey'), t('productos.theRecipientRedeemsTheCode')],
  ];
  const cuerda = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  cuerda.setAttribute('viewBox', '0 0 100 20');
  cuerda.setAttribute('preserveAspectRatio', 'none');
  cuerda.setAttribute('class', 'rg-cuerda');
  cuerda.setAttribute('aria-hidden', 'true');
  const curva = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  curva.setAttribute('d', 'M0 2 Q50 22 100 2');
  curva.setAttribute('vector-effect', 'non-scaling-stroke');
  cuerda.append(curva);
  const postales = pasos.map(([titulo, texto], i) => {
    const postal = el('li', { class: `rg-postal rg-postal-${i + 1}` },
      el('span', { class: 'rg-pinza-ropa', 'aria-hidden': 'true' }),
      el('span', { class: 'rg-sello', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
      dibujo(ICONOS_PASO[i], 'rg-icono'),
      el('h2', {}, titulo),
      el('p', {}, texto));
    postal.addEventListener('pointerenter', () => { if (!quieto) postal.classList.add('mece'); });
    postal.addEventListener('click', () => { postal.classList.remove('mece'); void postal.offsetWidth; if (!quieto) postal.classList.add('mece'); sonar('papel'); });
    postal.addEventListener('animationend', () => postal.classList.remove('mece'));
    return postal;
  });
  tendedora.alTocar = () => { tendedora.gesto('senalar'); tendedora.decir(t('productos.oneGiftAThousandConversations'), 3000); };
  const tendedero = el('section', { class: 'rg-tendedero' },
    el('div', { class: 'rg-tendedero-cuerda' }, cuerda, el('ol', { class: 'rg-postales' }, postales)),
    tendedora.figura);

  poner(root, el('article', { class: 'taller-regalo escena-web' }, taller, tendedero));
  elenco.vigilar(taller, tendedero);

  despues(700, () => { envolvedora.gesto('saludar'); envolvedora.decir(t('regalo.hola'), 3400); });
  // de vez en cuando, la tutora del tendedero endereza una postal
  if (!quieto) {
    let n = 0;
    const reloj = setInterval(() => {
      if (!elenco.seVeParte(tendedero)) return;
      const postal = postales[n++ % postales.length];
      postal.classList.add('mece');
      tendedora.gesto(n % 2 ? 'senalar' : 'asentir');
    }, 5200);
    alApagar(() => clearInterval(reloj));
  }

  return () => elenco.apagar();
}
