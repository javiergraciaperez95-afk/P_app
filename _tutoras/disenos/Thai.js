// Tailandés: pelo negro en una coleta alta y larga que cae a un lado, orquídea morada en el nacimiento de la coleta,
// flequillo fino, ojos castaños, blusa amarillo suave de cuello blanco, falda morada plisada y libro morado.
const DISENO = {
  colores: {
    skin: '#f0c8a2', skinS: '#d69d7c',
    hair: '#3a3036', hairL: '#665860', hairS: '#261f24', hairD: '#161215',
    eyeG: '#7a4a2a', eyeD: '#351c0c', eyeL: '#b88050',
    book: '#7a4fb0', bookD: '#553580', bookL: '#a07fd6',
    blusa: '#ffe9a0', blusaL: '#fff6d0', blusaS: '#e6c870',
    falda: '#5a3a8a', faldaD: '#3f2866',
    orquidea: '#d28ff0', orquideaD: '#8a4fb8', centro: '#fff0a0',
  },
  atras(sw) {
    Rh(6, 3, 5, 4, C.hair); Rh(3, 6, 5, 16, C.hair);
    Rh(3 + sw, 22, 4, 10, C.hair); Rh(4 + sw, 32, 3, 5, C.hair); Rh(5 + sw, 37, 2, 3, C.hair);
    Rh(3, 7, 1, 15, C.hairS); Rh(5, 8, 1, 13, C.hairL); Rh(6, 8, 1, 14, C.hairS); Rh(4 + sw, 23, 1, 9, C.hairL);
  },
  piernas() { medias(C.white, 52); },
  cuerpo() {
    torso(C.blusa, C.blusaS);
    B(19, 35, 4, 1, C.shirt); B(20, 36, 3, 1, C.shirt); P(23, 37, C.blusaS); P(24, 36, C.blusaS);
    falda(C.falda, C.faldaD);
    mangas(C.blusa, C.blusaL, C.shirt);
  },
  sobre() {},
  pelo() {
    Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
    for (const [x, w] of [[12, 3], [17, 3], [22, 4], [28, 3], [33, 3]]) Rh(x, 14, w, 1, C.hair);
    Rh(15, 6, 7, 1, C.hairL); Rh(26, 6, 8, 1, C.hairL); Rh(16, 9, 6, 1, C.hairL); Rh(27, 9, 5, 1, C.hairL);
    Rh(19, 10, 1, 4, C.hairS); Rh(25, 10, 1, 4, C.hairS); Rh(31, 10, 1, 4, C.hairS);
    Bh(9, 13, 4, 12, C.hair); Bh(9, 13, 1, 12, C.hairS); Bh(10, 25, 2, 3, C.hair); Bh(11, 16, 1, 7, C.hairL);
  },
  adorno() {
    // orquídea
    Rh(8, 2, 3, 1, C.orquidea); Rh(7, 3, 5, 3, C.orquidea); Rh(8, 6, 3, 1, C.orquidea);
    Ph(9, 4, C.centro); Ph(9, 5, C.orquideaD); Ph(7, 5, C.orquideaD); Ph(11, 5, C.orquideaD);
  },
};
