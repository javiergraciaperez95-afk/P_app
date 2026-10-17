// Español: media melena castaña con flequillo recto y las puntas hacia fuera, ojos marrones, aros, uniforme escolar
// (chaqueta azul marino, camisa blanca, corbata roja, falda gris plisada con raya roja, calcetines blancos)
// y el libro rojo entre las manos. Es el dibujo de siempre de Lucía, ya sobre el personaje común.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas }) => {
  const DISENO = {
    colores: {
      tie: '#c0323c', tieD: '#8a1f2a', ring: '#d5dae0',
      navy: '#27365e', navyL: '#3d5088', skirt: '#8d90a0', skirtD: '#6c6f80',
    },
    // café con leche al acabar el día; su gesto: un paso de baile
    bebida: { vaso: '#ffffff', liquido: '#b07a4a' },
    firma: 'baile',
    atras(sw) {
      // media melena que cae hasta los hombros, con las puntas hacia fuera
      B(9, 32, 6, 8, C.hair); B(9, 32, 1, 8, C.hairS); B(12, 35, 1, 4, C.hairL);
      B(7, 39, 6, 2, C.hair, sw); B(7, 41, 3, 1, C.hair, sw);
    },
    piernas() { medias(C.white, 52); },
    cuerpo() {
      // chaqueta azul marino
      R(16, 35, 16, 1, C.navy); R(15, 36, 18, 9, C.navy);
      R(16, 37, 1, 7, C.navyL); R(31, 37, 1, 7, C.navyL);
      // camisa blanca y corbata roja
      R(20, 35, 8, 2, C.shirt); R(21, 37, 6, 1, C.shirt); R(22, 38, 4, 1, C.shirt); P(20, 35, C.shirtS); P(27, 35, C.shirtS);
      R(23, 36, 2, 3, C.tie); P(23, 37, C.tieD); P(24, 37, C.tieD);
      // falda gris plisada con una raya roja
      R(14, 45, 20, 5, C.skirt);
      for (let x = 16; x < 33; x += 3) R(x, 45, 1, 5, C.skirtD);
      R(14, 48, 20, 1, C.tie);
      mangas(C.navy, C.navyL);
    },
    sobre() {},
    pelo(sw) {
      // flequillo recto, con las puntas desiguales, y mechones que enmarcan la cara
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair); Rh(12, 14, 4, 2, C.hair); Rh(32, 14, 4, 2, C.hair);
      Rh(17, 14, 3, 1, C.hair); Rh(22, 14, 5, 1, C.hair); Rh(29, 14, 2, 1, C.hair); // puntas del flequillo
      Rh(13, 6, 7, 1, C.hairL); Rh(25, 6, 8, 1, C.hairL); Rh(11, 8, 3, 1, C.hairL); Rh(34, 8, 3, 1, C.hairL); // brillo
      Rh(16, 10, 1, 4, C.hairS); Rh(21, 10, 1, 4, C.hairS); Rh(27, 10, 1, 4, C.hairS); Rh(32, 10, 1, 3, C.hairS); // mechones
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 12, C.hairL); // mechones laterales
      Rh(8 + sw, 32, 5, 3, C.hair); Rh(35 + sw, 32, 5, 3, C.hair); // puntas (se mecen)
    },
    adorno() {
      // aros
      Rh(11, 27, 2, 1, C.ring); Ph(11, 28, C.ring); Rh(11, 29, 2, 1, C.ring);
      Rh(35, 27, 2, 1, C.ring); Ph(36, 28, C.ring); Rh(35, 29, 2, 1, C.ring);
    },
  };
  return DISENO;
};
