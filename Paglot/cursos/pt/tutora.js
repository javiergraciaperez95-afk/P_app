// Portugués: pelo castaño oscuro corto y rizado, aros dorados, ojos azul verdoso,
// camiseta blanca con dibujo de azulejo azul, falda amarillo mostaza, sandalias y libro verde.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      skin: '#f6d4b6', skinS: '#dfa98a',
      hair: '#4a3026', hairL: '#7a5240', hairS: '#33201a', hairD: '#1f120e',
      eyeG: '#3a7a9a', eyeD: '#1a3f55', eyeL: '#80c0d8',
      book: '#2f8f5a', bookD: '#1f6a40', bookL: '#4fb87a',
      azul: '#2f5fae', falda: '#e8b83a', faldaD: '#c0921f', aro: '#f3c94b',
    },
    // café al acabar el día y su gesto propio
    bebida: { vaso: '#ffffff', liquido: '#5a3520' },
    firma: 'baile',
    atras() {
      // rizos cortos: una nube alrededor de la cabeza
      for (let k = 0, y = 7; y < 31; y += 3, k++) { Bh(4 + (k % 2), y, 5, 3, C.hair); Bh(4 + (k % 2), y + 2, 1, 1, C.hairS); Bh(6 + (k % 2), y + 1, 1, 1, C.hairL); }
      Bh(6, 31, 4, 2, C.hair);
      Bh(15, 1, 4, 2, C.hair); Rh(22, 0, 4, 3, C.hair); Bh(9, 3, 4, 3, C.hair);
    },
    piernas() { medias(C.skin, 53); },
    cuerpo() {
      torso(C.shirt);
      for (let y = 36; y < 45; y += 2) for (let x = 15; x < 32; x += 2) P(x + (y % 4 ? 1 : 0), y, C.azul);
      R(20, 35, 8, 1, C.azul);
      falda(C.falda, C.faldaD);
      mangas(C.shirt, C.white, C.azul); mangaCorta();
    },
    sobre() {},
    pelo() {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      for (const x of [12, 17, 23, 28, 33]) Rh(x, 14, 3, 1, C.hair);
      Bh(12, 15, 2, 1, C.hair);
      for (const [x, y] of [[14, 5], [21, 4], [28, 5], [33, 8], [12, 9], [18, 9], [25, 8], [30, 11]]) Rh(x, y, 3, 1, C.hairL);
      for (const [x, y] of [[17, 7], [24, 11], [32, 6], [14, 12], [21, 12], [28, 9]]) Rh(x, y, 2, 1, C.hairS);
      for (let k = 0, y = 13; y < 29; y += 3, k++) { Bh(8 + (k % 2), y, 4, 3, C.hair); Bh(9 + (k % 2), y + 1, 2, 1, C.hairL); }
      Bh(9, 28, 3, 3, C.hair);
    },
    adorno() {
      // aros dorados
      Bh(10, 27, 2, 1, C.aro); Bh(9, 28, 1, 2, C.aro); Bh(12, 28, 1, 2, C.aro); Bh(10, 30, 2, 1, C.aro);
    },
  };
  return DISENO;
};
