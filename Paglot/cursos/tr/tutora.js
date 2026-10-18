// Turco: melena castaño oscuro larga y ondulada con la raya en medio y la frente despejada, ojos verdes,
// jersey turquesa sobre camisa blanca, colgante de ojo azul, falda gris oscura plisada, medias y libro verde azulado.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      skin: '#f6d4b6', skinS: '#dfa98a',
      hair: '#4f3227', hairL: '#7a503d', hairS: '#38221b', hairD: '#22130f',
      eyeG: '#2f9a7f', eyeD: '#155546', eyeL: '#74d1b4',
      book: '#1f6f7a', bookD: '#134a52', bookL: '#3a98a3',
      jersey: '#2fb3ad', jerseyL: '#62d6cf', jerseyD: '#1d857f',
      falda: '#4a4d5c', faldaD: '#33354a', ojo: '#2456c9', ojoL: '#6aa8f5',
    },
    // çay al acabar el día y su gesto propio
    bebida: { vaso: '#eef6f9', liquido: '#c0462b' },
    firma: 'manoPecho',
    atras(sw) {
      // melena con mucho volumen, en ondas, hasta la falda
      B(5, 14, 2, 16, C.hair); B(5, 14, 1, 16, C.hairS);
      B(6, 28, 7, 3, C.hair); B(5, 31, 8, 4, C.hair); B(4, 35, 8, 4, C.hair, sw); B(5, 39, 8, 4, C.hair, sw);
      B(4, 43, 7, 3, C.hair, sw); B(6, 46, 4, 2, C.hair, sw);
      B(5, 31, 1, 4, C.hairS); B(4, 35, 1, 4, C.hairS, sw); B(4, 43, 1, 3, C.hairS, sw);
      B(8, 32, 1, 6, C.hairL, sw); B(7, 40, 1, 5, C.hairL, sw); B(10, 36, 1, 8, C.hairS, sw);
    },
    piernas() { medias('#2b2d38'); },
    cuerpo() {
      R(16, 35, 16, 1, C.jersey); R(15, 36, 18, 9, C.jersey); R(16, 38, 1, 6, C.jerseyD); R(31, 38, 1, 6, C.jerseyD);
      B(19, 35, 3, 2, C.shirt); B(19, 36, 1, 1, C.shirtS); // cuello de la camisa
      R(23, 36, 2, 2, C.ojo); P(23, 37, C.white); P(24, 36, C.ojoL); // colgante
      R(14, 45, 20, 5, C.falda);
      for (let x = 16; x < 33; x += 3) R(x, 45, 1, 5, C.faldaD);
      mangas(C.jersey, C.jerseyL, C.shirt);
    },
    sobre() {},
    pelo(sw) {
      // raya en medio: el pelo se abre como una cortina y deja la frente a la vista
      Rh(11, 8, 26, 5, C.hair);
      Rh(23, 10, 3, 1, C.skin); Rh(21, 11, 7, 1, C.skin); Rh(18, 12, 13, 1, C.skin);
      Bh(12, 13, 4, 1, C.hair); Bh(12, 14, 3, 1, C.hair); Bh(12, 15, 2, 1, C.hair); Bh(12, 16, 1, 3, C.hair);
      Rh(24, 5, 1, 5, C.hairS);
      Bh(19, 10, 1, 1, C.hairS); Bh(16, 11, 1, 1, C.hairS); Bh(14, 12, 1, 1, C.hairS);
      Bh(14, 6, 7, 1, C.hairL); Bh(12, 9, 4, 1, C.hairL);
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 17, 1, 11, C.hairL);
      Rh(8 + sw, 32, 5, 3, C.hair); Rh(35 + sw, 32, 5, 3, C.hair);
    },
    adorno() {},
  };
  return DISENO;
};
