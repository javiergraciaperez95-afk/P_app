// Ruso: pelo rubio platino recogido en una trenza gruesa que le cae por delante de un hombro, orejeras blancas,
// ojos azul violáceo, jersey burdeos de cuello alto, falda gris oscura, medias blancas y libro azul oscuro.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#e6dcc4', hairL: '#ffffff', hairS: '#bdb09a', hairD: '#8a7c66',
      eyeG: '#7a8fd0', eyeD: '#34407a', eyeL: '#b8c6f0',
      book: '#27365e', bookD: '#172244', bookL: '#3d5088',
      jersey: '#8a2436', jerseyL: '#b03a4c', jerseyD: '#5e1624',
      piel: '#ffffff', pielS: '#cfd6e2', aro: '#aab2c2',
      falda: '#3a3f55', faldaD: '#272b3d', shoe: '#3a2a2a', shoeL: '#5a4444',
    },
    atras() {},
    piernas() { medias('#f4f6f5'); },
    cuerpo() {
      torso(C.jersey, C.jerseyD);
      R(20, 33, 8, 3, C.jersey); R(20, 33, 8, 1, C.jerseyL); R(20, 35, 8, 1, C.jerseyD); // cuello alto
      falda(C.falda, C.faldaD);
      mangas(C.jersey, C.jerseyL, C.jerseyD);
    },
    sobre(sw) {
      // trenza gruesa
      for (let y = 30; y < 45; y += 3) { R(8, y, 5, 3, C.hair); R(8, y + 2, 5, 1, C.hairS); P(8, y + 1, C.hairS); P(12, y, C.hairS); R(10, y, 2, 1, C.hairL); }
      R(8, 45, 5, 1, C.jersey); R(9 + sw, 46, 3, 2, C.hair); P(10 + sw, 48, C.hair);
    },
    pelo() {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 6, 1, C.hair); Rh(20, 14, 4, 1, C.hair); Rh(26, 14, 4, 1, C.hair); Rh(32, 14, 4, 1, C.hair);
      Bh(12, 15, 2, 1, C.hair);
      Rh(14, 10, 6, 1, C.hairL); Rh(25, 10, 6, 1, C.hairL);
      Rh(19, 9, 1, 5, C.hairS); Rh(25, 11, 1, 3, C.hairS); Rh(31, 9, 1, 5, C.hairS);
      Rh(9, 13, 4, 18, C.hair); Rh(9, 13, 1, 18, C.hairS);
      Rh(35, 13, 4, 13, C.hair); Rh(38, 13, 1, 13, C.hairS); Rh(36, 26, 2, 3, C.hair);
    },
    adorno() {
      // orejeras
      Bh(16, 2, 8, 1, C.aro); Bh(13, 3, 3, 1, C.aro); Bh(11, 4, 2, 1, C.aro); Bh(9, 5, 2, 1, C.aro); Bh(8, 6, 1, 2, C.aro); Bh(7, 8, 1, 8, C.aro);
      Bh(7, 15, 3, 11, C.piel); Bh(6, 17, 5, 7, C.piel); Bh(6, 21, 1, 3, C.pielS); Bh(7, 24, 3, 1, C.pielS); Bh(10, 19, 1, 4, C.pielS);
    },
  };
  return DISENO;
};
