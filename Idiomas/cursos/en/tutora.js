// Inglés: media melena ondulada castaño miel con diadema azul marino, gafas redondas doradas, ojos azul grisáceo,
// jersey burdeos de pico con camisa y corbata, falda de cuadros escoceses, calcetines altos y libro verde botella.
// Se genera con _herramientas/montar_cursos.py a partir de _tutoras/disenos: los cambios se hacen allí.

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#a8703f', hairL: '#d09a62', hairS: '#7f5129', hairD: '#583618',
      eyeG: '#6f8fb0', eyeD: '#33485e', eyeL: '#a9c6e0',
      book: '#2f6b4f', bookD: '#1e4a36', bookL: '#4a8f6c',
      jersey: '#7a2433', jerseyL: '#9c3546', jerseyD: '#551622',
      corbata: '#27365e', cuadro: '#2f5a44', cuadroD: '#27365e', cuadroR: '#c0323c',
      diadema: '#27365e', diademaL: '#4a62a8', gafas: '#b88a2a',
    },
    atras(sw) {
      B(6, 26, 6, 5, C.hair); B(5, 30, 7, 5, C.hair, sw); B(6, 35, 6, 3, C.hair, sw); B(7, 38, 4, 1, C.hair, sw);
      B(5, 30, 1, 5, C.hairS, sw); B(8, 31, 1, 5, C.hairL, sw);
    },
    piernas() { medias('#27365e', 51); },
    cuerpo() {
      torso(C.jersey, C.jerseyL);
      R(20, 35, 8, 2, C.shirt); R(21, 37, 6, 1, C.shirt);
      R(23, 36, 2, 2, C.corbata); P(23, 37, C.gold);
      R(14, 45, 20, 5, C.cuadro);
      for (let x = 16; x < 33; x += 4) R(x, 45, 1, 5, C.cuadroD);
      R(14, 47, 20, 1, C.cuadroD); R(14, 49, 20, 1, C.cuadroR);
      mangas(C.jersey, C.jerseyL, C.shirt);
    },
    sobre() {},
    pelo(sw) {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 7, 1, C.hair); Rh(22, 14, 6, 1, C.hair); Rh(31, 14, 5, 1, C.hair); Bh(12, 15, 2, 1, C.hair);
      Rh(14, 10, 6, 1, C.hairL); Rh(25, 10, 6, 1, C.hairL);
      Rh(20, 9, 1, 5, C.hairS); Rh(29, 9, 1, 5, C.hairS);
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 12, C.hairL);
      Rh(8 + sw, 32, 5, 3, C.hair); Rh(35 + sw, 32, 5, 3, C.hair);
    },
    adorno() {
      Rh(9, 6, 30, 2, C.diadema); Rh(12, 6, 10, 1, C.diademaL); // diadema
      // gafas redondas
      for (const x of [13, 27]) { Rh(x + 1, 17, 6, 1, C.gafas); Rh(x + 1, 26, 6, 1, C.gafas); Rh(x, 18, 1, 8, C.gafas); Rh(x + 7, 18, 1, 8, C.gafas); }
      Rh(21, 21, 6, 1, C.gafas);
    },
  };
  return DISENO;
};
