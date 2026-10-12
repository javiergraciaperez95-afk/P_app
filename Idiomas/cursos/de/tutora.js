// Alemán: rubio oscuro recogido en una coleta alta, flequillo, gafas cuadradas, ojos azul grisáceo,
// chaqueta verde bosque sobre camisa blanca, falda gris oscura y libro negro con el emblema dorado.
// Se genera con _herramientas/montar_cursos.py a partir de _tutoras/disenos: los cambios se hacen allí.

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#b8925a', hairL: '#dcb97e', hairS: '#94703f', hairD: '#6b4f2a',
      eyeG: '#5a86b0', eyeD: '#2a4664', eyeL: '#9cc4e4',
      book: '#3a3a44', bookD: '#25252d', bookL: '#5a5a70',
      chaqueta: '#2f6b4a', chaquetaL: '#4a8f68', chaquetaD: '#1f4a33',
      falda: '#4a4d5c', faldaD: '#33354a', gafas: '#3d3340', goma: '#c0323c',
    },
    atras(sw) {
      // coleta alta que cae hacia un lado
      Rh(37, 3, 5, 4, C.hair); Rh(40, 6, 5, 14, C.hair);
      Rh(41 + sw, 20, 4, 6, C.hair); Rh(42 + sw, 26, 2, 3, C.hair);
      Rh(44, 7, 1, 12, C.hairS); Rh(42, 8, 1, 11, C.hairL); Rh(41, 8, 1, 12, C.hairS);
    },
    piernas() { medias(C.white, 52); },
    cuerpo() {
      torso(C.chaqueta, C.chaquetaL);
      R(20, 35, 8, 2, C.shirt); R(21, 37, 6, 1, C.shirt); B(19, 36, 1, 2, C.chaquetaD); P(23, 37, C.shirtS);
      falda(C.falda, C.faldaD);
      mangas(C.chaqueta, C.chaquetaL);
    },
    sobre() {},
    pelo() {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 4, 1, C.hair); Rh(18, 14, 5, 1, C.hair); Rh(27, 14, 4, 1, C.hair); Rh(32, 14, 4, 1, C.hair);
      Rh(13, 6, 7, 1, C.hairL); Rh(25, 6, 8, 1, C.hairL); Rh(14, 9, 5, 1, C.hairL);
      Rh(17, 10, 1, 4, C.hairS); Rh(23, 10, 1, 4, C.hairS); Rh(29, 10, 1, 4, C.hairS);
      // mechones cortos: el resto va recogido
      Bh(9, 13, 4, 12, C.hair); Bh(9, 13, 1, 12, C.hairS); Bh(10, 25, 2, 2, C.hair); Bh(11, 16, 1, 7, C.hairL);
    },
    adorno() {
      Rh(37, 4, 2, 3, C.goma); // goma de la coleta
      // gafas cuadradas
      for (const x of [13, 27]) { Rh(x, 17, 8, 1, C.gafas); Rh(x, 26, 8, 1, C.gafas); Rh(x, 17, 1, 10, C.gafas); Rh(x + 7, 17, 1, 10, C.gafas); }
      Rh(21, 20, 6, 1, C.gafas); Ph(12, 20, C.gafas); Ph(35, 20, C.gafas);
    },
  };
  return DISENO;
};
