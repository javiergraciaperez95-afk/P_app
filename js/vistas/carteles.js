// Los carteles de las pantallas de texto (repaso, cuaderno, frases, reto, prueba, práctica, perfil, aviso legal y
// créditos): un dibujo pixel propio a la izquierda del título, sobre una franja de cielo (de noche o de papel, según el
// tema). Antes eran un título y un párrafo sobre el panel liso (informes de arte y de diseño del 19-10: «un icono pixel
// por pantalla»). Los dibujos se hacen con rectángulos y llevan contorno, como las tutoras; pocos colores por dibujo.
// Colores en css/escenas.css (.cartel-dibujo .il-<letra>).

import { dibujoPixel, conContorno } from './inicio-decorado.js';

/** Una rejilla de ancho × alto y un pincel: R(x, y, ancho, alto, letra) y C(cx, cy, radio, letra) para círculos. */
function lienzo(ancho, alto, pintar) {
  const g = Array.from({ length: alto }, () => Array(ancho).fill('.'));
  const R = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < ancho && j >= 0 && j < alto) g[j][i] = c;
  };
  const C = (cx, cy, radio, c) => {
    for (let j = 0; j < alto; j++) for (let i = 0; i < ancho; i++) if ((i - cx) ** 2 + (j - cy) ** 2 <= radio * radio) g[j][i] = c;
  };
  pintar(R, C, g);
  return conContorno(g.map(f => f.join('')));
}

const DIBUJOS = {
  // el fichero del repaso: tarjetas asomando de una caja de madera con su etiqueta y una estrella
  repaso: () => lienzo(22, 20, R => {
    R(8, 1, 12, 9, 'p'); R(16, 2, 3, 2, 'r');           // la tarjeta de atrás y su pestaña roja
    R(4, 3, 14, 9, 'w'); R(4, 3, 14, 1, 'l');           // la de delante, con su borde de luz
    R(6, 5, 9, 1, 's'); R(6, 7, 6, 1, 's');             // lo escrito
    R(2, 10, 18, 9, 'm'); R(2, 10, 18, 1, 'o');         // la caja y su canto
    R(2, 17, 18, 2, 'M');                               // la sombra de abajo
    R(8, 12, 7, 4, 'w'); R(9, 13, 5, 1, 's'); R(9, 14, 3, 1, 's'); // la etiqueta
    R(4, 12, 1, 1, 'o'); R(3, 13, 3, 1, 'o'); R(4, 14, 1, 1, 'o'); // la estrella
  }),
  // el cuaderno abierto con su cinta
  cuaderno: () => lienzo(24, 18, R => {
    R(0, 4, 24, 13, 'b'); R(0, 15, 24, 2, 'B');         // las tapas
    R(1, 3, 10, 12, 'w'); R(13, 3, 10, 12, 'w');        // las páginas
    R(11, 3, 2, 12, 'p'); R(1, 13, 22, 2, 'p');         // el pliegue y el canto
    for (const y of [6, 8, 10]) { R(3, y, 6, 1, 's'); R(15, y, 6, 1, 's'); }
    R(4, 4, 1, 1, 'o'); R(3, 5, 3, 1, 'o');             // una estrella en la página
    R(18, 1, 2, 9, 'r'); R(18, 9, 1, 1, '.');           // la cinta, con su pico
  }),
  // dos bocadillos: lo que dices y lo que te contestan
  frases: () => lienzo(24, 20, R => {
    R(1, 1, 13, 9, 'w'); R(1, 1, 1, 1, '.'); R(13, 1, 1, 1, '.'); R(1, 9, 1, 1, '.'); R(13, 9, 1, 1, '.');
    R(3, 10, 3, 2, 'w'); R(2, 12, 2, 1, 'w');           // la cola
    R(3, 4, 8, 1, 's'); R(3, 6, 5, 1, 's');
    R(10, 8, 13, 9, 'o'); R(10, 8, 1, 1, '.'); R(22, 8, 1, 1, '.'); R(10, 16, 1, 1, '.'); R(22, 16, 1, 1, '.');
    R(18, 17, 3, 2, 'o'); R(20, 19, 2, 1, 'o');
    R(12, 11, 8, 1, 'O'); R(12, 13, 5, 1, 'O');
  }),
  // el cronómetro del reto, con su rayo
  reto: () => lienzo(21, 22, (R, C) => {
    R(8, 0, 4, 2, 's'); R(9, 2, 2, 2, 'S');             // el botón de arriba
    C(10, 12, 8.5, 'S'); C(10, 12, 7.5, 's'); C(10, 12, 6.2, 'w');
    R(10, 7, 1, 6, 'B'); R(10, 12, 4, 1, 'B'); R(10, 12, 1, 1, 'r');  // las agujas
    R(16, 6, 4, 2, 'o'); R(15, 8, 4, 2, 'o'); R(14, 10, 6, 1, 'o'); R(16, 11, 3, 2, 'o'); R(15, 13, 2, 2, 'o'); // el rayo
  }),
  // la brújula de la prueba de nivel
  prueba: () => lienzo(22, 22, (R, C) => {
    C(11, 11, 10.2, 'O'); C(11, 11, 9, 'o'); C(11, 11, 7.6, 'w');
    for (let i = 0; i < 7; i++) {
      const a = Math.floor(i / 3);
      R(11 - a, 4 + i, 1 + 2 * a, 1, 'r');               // la aguja que apunta al norte
      R(11 - a, 18 - i, 1 + 2 * a, 1, 'b');              // y la que apunta al sur
    }
    R(10, 10, 3, 3, 'O'); R(11, 11, 1, 1, 'l');          // el eje
    R(11, 2, 1, 1, 'S'); R(19, 11, 1, 1, 'S'); R(11, 20, 1, 1, 'S'); R(3, 11, 1, 1, 'S');
  }),
  // la diana de la práctica, con su flecha clavada
  practica: () => lienzo(23, 22, (R, C) => {
    C(10, 12, 9.4, 'r'); C(10, 12, 7, 'w'); C(10, 12, 4.6, 'r'); C(10, 12, 2.2, 'w'); C(10, 12, 0.8, 'r');
    for (let i = 0; i < 9; i++) R(19 - i, 3 + i, 1, 1, 'M'); // el astil
    R(20, 1, 2, 1, 'b'); R(21, 2, 1, 2, 'b'); R(19, 1, 1, 1, 'B'); R(21, 4, 1, 1, 'B'); // las plumas
  }),
  // el carné de estudiante del perfil
  perfil: () => lienzo(24, 19, R => {
    R(10, 0, 4, 3, 's');                                 // la pinza
    R(1, 2, 22, 16, 'w'); R(1, 2, 22, 4, 'r'); R(1, 5, 22, 1, 'R'); // la tarjeta y su banda
    R(3, 8, 7, 8, 'c'); R(5, 9, 3, 3, 'p'); R(4, 12, 5, 4, 'v'); // la foto
    R(12, 8, 9, 1, 's'); R(12, 10, 7, 1, 's'); R(12, 12, 5, 1, 's');
    R(19, 13, 1, 1, 'o'); R(18, 14, 3, 1, 'o'); R(19, 15, 1, 1, 'o'); // la estrella del sello
  }),
  // el pergamino del aviso legal, con su sello de lacre
  legal: () => lienzo(22, 24, (R, C) => {
    R(1, 0, 20, 4, 'w'); R(1, 1, 20, 1, 'l'); R(1, 3, 20, 1, 'p'); // el rollo de arriba
    R(3, 4, 16, 15, 'w'); R(17, 4, 2, 15, 'p');          // el papel y su sombra
    for (const y of [7, 9, 11, 13]) R(5, y, 10, 1, 's');
    R(1, 19, 20, 4, 'w'); R(1, 22, 20, 1, 'p');          // el rollo de abajo
    C(14, 16, 2.6, 'r'); R(14, 16, 1, 1, 'R'); R(13, 18, 1, 3, 'r'); R(15, 18, 1, 3, 'r'); // el sello
  }),
  // el poste de señales de «una forma de aprender para cada camino»: tres flechas de colores sobre un poste de madera
  producto: () => lienzo(24, 24, R => {
    R(11, 2, 3, 21, 'm'); R(13, 2, 1, 21, 'M');            // el poste, con su lado en sombra
    R(10, 1, 5, 1, 'M');                                    // el remate
    R(3, 4, 16, 4, 'r'); R(2, 5, 1, 2, 'r'); R(3, 7, 16, 1, 'R'); // flecha a la izquierda (roja)
    R(8, 10, 15, 4, 'b'); R(23, 11, 1, 2, 'b'); R(8, 13, 15, 1, 'B'); // flecha a la derecha (azul)
    R(2, 16, 14, 4, 'o'); R(1, 17, 1, 2, 'o'); R(2, 19, 14, 1, 'O'); // flecha a la izquierda (dorada)
    R(5, 5, 6, 1, 'w'); R(11, 11, 7, 1, 'w'); R(5, 17, 5, 1, 'M'); // lo escrito en cada tabla
    R(7, 22, 3, 1, 'v'); R(15, 22, 4, 1, 'v');              // la hierba al pie
  }),
  // la medalla de los créditos, con su cinta
  creditos: () => lienzo(20, 24, (R, C) => {
    for (let i = 0; i < 9; i++) { R(4 + Math.floor(i / 3), i, 4, 1, 'b'); R(12 - Math.floor(i / 3), i, 4, 1, 'r'); }
    C(10, 16, 7.4, 'O'); C(10, 16, 6.2, 'o');
    R(10, 12, 1, 2, 'l'); R(7, 14, 7, 1, 'l'); R(8, 15, 5, 1, 'l'); R(8, 16, 2, 2, 'l'); R(11, 16, 2, 2, 'l'); // la estrella
  }),
};

/** El dibujo de un cartel, o null si no hay. */
export function ilustracion(nombre) {
  const hacer = DIBUJOS[nombre];
  if (!hacer) return null;
  const dibujo = dibujoPixel(hacer(), `cartel-dibujo cartel-${nombre}`, 'il');
  dibujo.setAttribute('aria-hidden', 'true');
  return dibujo;
}

/** Convierte la cabecera de una pantalla (su título y su texto) en cartel: el dibujo a la izquierda y lo de antes al lado. */
export function conCartel(seccion, nombre) {
  const dibujo = ilustracion(nombre);
  if (!dibujo) return seccion;
  const texto = document.createElement('div');
  texto.className = 'cartel-texto';
  texto.append(...seccion.childNodes);
  seccion.classList.add('con-cartel');
  seccion.append(dibujo, texto);
  return seccion;
}
