// Francés: media melena corta y ondulada castaño rosado con el flequillo de lado, ojos violeta,
// camiseta de rayas marineras con botones dorados, pañuelo rojo, pantalón verde menta y libro azul marino.
const DISENO = {
  colores: {
    hair: '#8f6258', hairL: '#b88a7e', hairS: '#6f463f', hairD: '#4a2c28',
    eyeG: '#7a6a9a', eyeD: '#3b3054', eyeL: '#b3a5cf',
    book: '#2f3f6e', bookD: '#1e2a4d', bookL: '#4a5f9c',
    raya: '#44578f', panuelo: '#d63a45', panueloL: '#f0656e', panueloD: '#9c2330',
    menta: '#8fd4b0', mentaD: '#62ad88', cinto: '#6e4430',
  },
  atras(sw) {
    // la melena se abre a los lados y acaba a la altura de la barbilla
    B(5, 20, 2, 10, C.hair); B(5, 20, 1, 10, C.hairS);
    B(4, 26, 3, 5, C.hair, sw); B(4, 26, 1, 5, C.hairS, sw); B(5, 31, 3, 1, C.hair, sw);
  },
  piernas() {
    R(18, 50, 5, 3, C.menta); R(25, 50, 5, 3, C.menta); R(18, 50, 1, 3, C.mentaD); R(29, 50, 1, 3, C.mentaD);
    zapatos();
  },
  cuerpo() {
    R(16, 35, 16, 1, C.shirt); R(15, 36, 18, 9, C.shirt);
    for (let y = 37; y < 45; y += 2) R(15, y, 18, 1, C.raya);
    P(16, 36, C.gold); P(18, 36, C.gold); // botones del hombro
    // pañuelo al cuello, anudado a un lado
    R(20, 34, 8, 2, C.panuelo); R(20, 34, 8, 1, C.panueloL); R(27, 35, 2, 2, C.panueloD); R(28, 37, 2, 1, C.panuelo);
    // pantalón de talle alto con cinturón
    R(14, 45, 20, 5, C.menta); R(14, 45, 20, 1, C.cinto); R(23, 45, 2, 1, C.gold);
    R(18, 46, 1, 4, C.mentaD); R(29, 46, 1, 4, C.mentaD); R(23, 47, 2, 3, C.mentaD);
    mangas(C.shirt, C.white); B(13, 38, 3, 1, C.raya); B(13, 40, 3, 1, C.raya);
  },
  sobre() {},
  pelo(sw) {
    // flequillo barrido hacia un lado
    Rh(11, 8, 26, 5, C.hair);
    Rh(12, 13, 18, 1, C.hair); Rh(32, 13, 4, 1, C.hair);
    Rh(12, 14, 10, 1, C.hair); Rh(33, 14, 3, 1, C.hair);
    Rh(12, 15, 2, 1, C.hair); Rh(34, 15, 2, 1, C.hair);
    Rh(31, 8, 1, 5, C.hairS); Ph(27, 12, C.hairS); Ph(23, 13, C.hairS); Ph(19, 13, C.hairS); Ph(16, 14, C.hairS);
    Rh(14, 6, 8, 1, C.hairL); Rh(26, 6, 6, 1, C.hairL); Rh(13, 9, 6, 1, C.hairL); Rh(21, 10, 5, 1, C.hairL);
    // mechones ondulados que enmarcan la cara
    Bh(9, 13, 4, 17, C.hair); Bh(9, 13, 1, 17, C.hairS); Bh(11, 17, 1, 9, C.hairL);
    Rh(8 + sw, 28, 4, 4, C.hair); Rh(36 + sw, 28, 4, 4, C.hair); Ph(9 + sw, 30, C.hairL); Ph(38 + sw, 30, C.hairL);
  },
  adorno() {},
};
