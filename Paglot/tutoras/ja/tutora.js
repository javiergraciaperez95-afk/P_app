// Japonés: profesora joven de oficina. Pelo castaño oscuro recogido en una coleta baja, flequillo de lado
// con la frente despejada, gafas finas, camisa blanca de cuello abierto, falda negra de tubo, zapatos de tacón
// y una carpeta gris oscuro entre las manos.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#4a3432', hairL: '#7a5852', hairS: '#33211f', hairD: '#1c1211',
      eyeG: '#6b4a36', eyeD: '#33201a', eyeL: '#a98468',
      book: '#44464f', bookD: '#2d2f37', bookL: '#cdbd9c', gold: '#2a2b33', goldD: '#cdbd9c',
      falda: '#2b2b34', faldaL: '#464653', gafas: '#8a4a58',
      shoe: '#1f1f26', shoeL: '#44444f',
    },
    // té matcha al acabar el día y su gesto propio
    bebida: { vaso: '#d9cfb8', liquido: '#8fbf5a' },
    firma: 'reverencia',
    atras(sw) {
      // coleta baja, que asoma por detrás de un hombro
      R(35, 30, 4, 10, C.hair); R(38, 30, 1, 10, C.hairS); R(36, 32, 1, 7, C.hairL);
      R(36 + sw, 40, 3, 3, C.hair); R(37 + sw, 43, 1, 2, C.hair);
    },
    piernas() { medias(C.skin, 53); },
    cuerpo() {
      torso(C.shirt, C.shirtS);
      R(23, 35, 2, 3, C.skin); B(19, 35, 4, 1, C.white); B(20, 36, 3, 1, C.white); B(21, 37, 2, 1, C.shirtS); // cuello abierto
      // falda de tubo
      R(15, 45, 18, 5, C.falda); R(15, 45, 18, 1, C.faldaL); R(15, 46, 1, 4, C.faldaL); R(24, 48, 1, 2, C.faldaL);
      mangas(C.shirt, C.white, C.shirtS);
    },
    sobre() {},
    pelo() {
      // peinado hacia atrás, con el flequillo de lado
      Rh(11, 8, 26, 5, C.hair);
      Rh(24, 11, 7, 1, C.skin); Rh(19, 12, 14, 1, C.skin);
      Rh(12, 13, 4, 1, C.hair); Rh(34, 13, 2, 1, C.hair); Rh(12, 14, 2, 1, C.hair); Ph(35, 14, C.hair);
      Rh(30, 5, 1, 6, C.hairS); Ph(23, 10, C.hairS); Ph(19, 11, C.hairS); Ph(16, 12, C.hairS);
      Rh(13, 6, 8, 1, C.hairL); Rh(32, 7, 4, 1, C.hairL); Rh(14, 9, 7, 1, C.hairL);
      Bh(9, 13, 3, 11, C.hair); Bh(9, 13, 1, 11, C.hairS); Bh(10, 24, 2, 2, C.hair); Bh(10, 15, 1, 8, C.hairL);
    },
    adorno() {
      // gafas finas, de media montura
      for (const x of [13, 27]) { Rh(x + 1, 26, 6, 1, C.gafas); Rh(x, 23, 1, 3, C.gafas); Rh(x + 7, 23, 1, 3, C.gafas); }
      Rh(21, 23, 6, 1, C.gafas);
    },
  };
  return DISENO;
};
