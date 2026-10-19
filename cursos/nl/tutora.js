// Neerlandés: pelirroja cobriza con dos trenzas cortas y flequillo, pecas, tulipán rosa en el pelo, ojos verdes,
// chubasquero amarillo, vaqueros, botas de agua azules y libro azul claro.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#d9682a', hairL: '#f59a4f', hairS: '#ae4a1a', hairD: '#7a300f',
      eyeG: '#5a9a4a', eyeD: '#2a5220', eyeL: '#9cd080',
      book: '#7fc4ea', bookD: '#4f98c4', bookL: '#b3e0f8',
      abrigo: '#f5cf3a', abrigoL: '#ffe680', abrigoD: '#d0a81f',
      vaquero: '#3d5088', goma: '#3f6fb5', peca: '#d98a6a',
      tulipan: '#ff9ac4', tulipanD: '#e0609a', tallo: '#4a9a4a',
      shoe: '#3f6fb5', shoeL: '#6f9be0',
    },
    // chocolate caliente al acabar el día y su gesto propio
    bebida: { vaso: '#ff8c2a', liquido: '#6b3a22' },
    firma: 'cadera',
    atras() { Bh(6, 16, 1, 12, C.hair); },
    piernas() { medias(C.vaquero); R(18, 52, 5, 3, C.shoe); R(25, 52, 5, 3, C.shoe); P(19, 52, C.shoeL); P(26, 52, C.shoeL); },
    cuerpo() {
      torso(C.abrigo, C.abrigoL); R(14, 45, 20, 5, C.abrigo);
      R(23, 36, 2, 13, C.abrigoD); R(14, 49, 20, 1, C.abrigoD);
      R(16, 47, 4, 1, C.abrigoD); R(28, 47, 4, 1, C.abrigoD); P(22, 47, C.white); P(25, 47, C.white);
      R(17, 33, 14, 3, C.abrigo); R(17, 33, 14, 1, C.abrigoL); R(17, 35, 14, 1, C.abrigoD); // capucha recogida
      mangas(C.abrigo, C.abrigoL, C.abrigoD);
    },
    sobre(sw) {
      // trenzas
      for (let y = 31; y < 41; y += 2) { B(9, y, 3, 2, C.hair); B(9, y + 1, 1, 1, C.hairS); B(11, y, 1, 1, C.hairS); B(10, y, 1, 1, C.hairL); }
      B(9, 41, 3, 1, C.goma); B(9, 42, 3, 2, C.hair, sw); B(10, 44, 1, 1, C.hair, sw);
    },
    pelo() {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 5, 1, C.hair); Rh(19, 14, 3, 1, C.hair); Rh(24, 14, 5, 1, C.hair); Rh(31, 14, 5, 1, C.hair);
      Bh(12, 15, 2, 1, C.hair);
      Rh(13, 6, 7, 1, C.hairL); Rh(25, 6, 8, 1, C.hairL); Rh(14, 9, 6, 1, C.hairL);
      Rh(18, 10, 1, 4, C.hairS); Rh(23, 10, 1, 4, C.hairS); Rh(30, 10, 1, 4, C.hairS);
      Bh(9, 13, 4, 18, C.hair); Bh(9, 13, 1, 18, C.hairS); Bh(11, 16, 1, 12, C.hairL);
    },
    adorno() {
      // pecas
      Ph(17, 27, C.peca); Ph(19, 26, C.peca); Ph(28, 26, C.peca); Ph(30, 27, C.peca);
      // tulipán
      Rh(33, 7, 4, 3, C.tulipan); Rh(34, 10, 2, 1, C.tulipan); Ph(33, 6, C.tulipan); Ph(36, 6, C.tulipan); Rh(34, 5, 2, 2, C.tulipan);
      Rh(36, 7, 1, 3, C.tulipanD); Ph(35, 10, C.tulipanD);
      Rh(34, 11, 1, 2, C.tallo); Ph(35, 13, C.tallo); Rh(36, 11, 2, 1, C.tallo);
    },
  };
  return DISENO;
};
