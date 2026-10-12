// Indonesio: pelo negro peinado hacia atrás con la raya a un lado y un moño bajo, flor de frangipani junto a la sien,
// ojos castaños, blusa de batik en tonos tierra, falda larga estampada y libro granate.
const DISENO = {
  colores: {
    skin: '#f0c8a2', skinS: '#d69d7c',
    hair: '#3a2c30', hairL: '#665055', hairS: '#261c1f', hairD: '#140e10',
    eyeG: '#6b4226', eyeD: '#2e1a0e', eyeL: '#a8733f',
    book: '#8a2f3a', bookD: '#5e1c26', bookL: '#b04a55',
    batik: '#9a5530', batikD: '#6b3519', batikL: '#f0cf8a',
    sarong: '#4f2c1d', dibujo: '#c9973a', flor: '#fff8ea', florC: '#f3c94b',
  },
  atras() {
    // moño bajo, a un lado
    Rh(39, 22, 4, 9, C.hair); Rh(38, 23, 6, 7, C.hair);
    Rh(40, 23, 2, 1, C.hairL); Ph(41, 25, C.hairL); Rh(43, 24, 1, 5, C.hairS); Rh(40, 27, 3, 1, C.hairS);
  },
  piernas() { medias(C.skin, 53); },
  cuerpo() {
    torso(C.batik);
    for (let y = 36; y < 45; y += 2) for (let x = 15; x < 32; x += 3) P(x + (y % 4 ? 1 : 0), y, C.batikL);
    R(21, 35, 6, 1, C.batikD);
    R(14, 45, 20, 5, C.sarong); R(15, 50, 18, 2, C.sarong);
    for (let x = 15; x < 32; x += 3) { P(x, 46, C.dibujo); P(x + 1, 48, C.dibujo); P(x, 50, C.dibujo); }
    mangas(C.batik, C.batikL, C.batikD);
  },
  sobre() {},
  pelo() {
    // peinado hacia atrás: la frente queda a la vista
    Rh(11, 8, 26, 5, C.hair);
    Rh(25, 11, 6, 1, C.skin); Rh(20, 12, 13, 1, C.skin);
    Rh(12, 13, 5, 1, C.hair); Rh(34, 13, 2, 1, C.hair); Rh(12, 14, 3, 1, C.hair); Ph(35, 14, C.hair); Ph(12, 15, C.hair);
    Rh(29, 5, 1, 6, C.hairS); Ph(24, 10, C.hairS); Ph(20, 11, C.hairS); Ph(17, 12, C.hairS);
    Rh(13, 6, 8, 1, C.hairL); Rh(31, 7, 5, 1, C.hairL); Rh(14, 9, 6, 1, C.hairL);
    Bh(10, 16, 1, 10, C.hairL);
  },
  adorno() {
    // frangipani
    Rh(10, 10, 3, 1, C.flor); Rh(9, 11, 5, 2, C.flor); Rh(10, 13, 3, 1, C.flor);
    Rh(11, 11, 1, 2, C.florC); Ph(10, 12, '#ffe9a8'); Ph(12, 11, '#ffe9a8');
  },
};
