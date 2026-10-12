// Polaco: pelo rubio trigo recogido en una trenza que le rodea la cabeza como una corona, pendientes de ámbar,
// ojos verde azulado, jersey blanco con una franja roja, falda roja plisada, medias blancas y libro color ámbar.
// Se genera con _herramientas/montar_cursos.py a partir de _tutoras/disenos: los cambios se hacen allí.

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#e0c070', hairL: '#f8e4a0', hairS: '#b8964a', hairD: '#86682a',
      eyeG: '#4aa0a0', eyeD: '#1f5555', eyeL: '#90d8d0',
      book: '#e0902f', bookD: '#b06a1a', bookL: '#f8b85a', gold: '#fff0c0', goldD: '#f3c94b',
      rojo: '#d63a45', rojoD: '#9c2330', ambar: '#f0a030', ambarL: '#ffd070',
    },
    atras() {},
    piernas() { medias('#f4f6f5'); },
    cuerpo() {
      torso(C.shirt, C.shirtS);
      R(20, 35, 8, 1, C.shirtS); R(15, 37, 18, 1, C.rojo);
      falda(C.rojo, C.rojoD);
      mangas(C.shirt, C.white, C.rojo);
    },
    sobre() {},
    pelo() {
      // raya en medio y flequillo abierto
      Rh(11, 8, 26, 5, C.hair); Rh(22, 12, 4, 1, C.skin);
      Bh(12, 13, 9, 1, C.hair); Bh(12, 14, 6, 1, C.hair); Bh(12, 15, 2, 1, C.hair);
      Rh(24, 9, 1, 3, C.hairS); Bh(19, 11, 1, 1, C.hairS); Bh(16, 12, 1, 1, C.hairS);
      Bh(14, 10, 4, 1, C.hairL);
      Bh(9, 13, 3, 12, C.hair); Bh(9, 13, 1, 12, C.hairS); Bh(10, 25, 2, 3, C.hair); Bh(11, 28, 1, 2, C.hair);
    },
    adorno() {
      // trenza en corona
      Rh(13, 4, 22, 1, C.hairS); Rh(9, 5, 30, 3, C.hair); Rh(11, 8, 26, 1, C.hairS);
      for (let x = 9; x < 39; x += 3) { Ph(x, 5, C.hairS); Ph(x + 1, 6, C.hairS); Ph(x + 2, 7, C.hairS); Ph(x + 1, 5, C.hairL); Ph(x + 2, 6, C.hairL); }
      // pendientes de ámbar
      Bh(11, 27, 1, 1, C.goldD); Bh(10, 28, 2, 2, C.ambar); Bh(10, 28, 1, 1, C.ambarL);
    },
  };
  return DISENO;
};
