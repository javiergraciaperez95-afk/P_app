// Italiano: pelo castaño rojizo ondulado, recogido en una coleta baja que le cae por delante de un hombro,
// gafas de sol blancas en la cabeza, ojos color ámbar, polo verde de cuello blanco, falda blanca con cinturón rojo y libro rojo.
const DISENO = {
  colores: {
    skin: '#f6d4b6', skinS: '#dfa98a',
    hair: '#6b3a2a', hairL: '#9a5a3f', hairS: '#4c261a', hairD: '#2e150d',
    eyeG: '#a8702a', eyeD: '#4f2f0f', eyeL: '#e0a85a',
    book: '#c8383f', bookD: '#96222c', bookL: '#e85a60',
    polo: '#2f9a55', poloL: '#4fc078', poloD: '#1f6f3a',
    falda: '#f4f6f5', faldaS: '#cfd6de', rojo: '#d63a45',
    marco: '#f4f6f5', lente: '#2b2d38', brillo: '#8fa0c0',
    shoe: '#f4f6f5', shoeL: '#ffffff',
  },
  atras() { Bh(6, 16, 1, 12, C.hair); },
  piernas() { medias(C.skin, 53); },
  cuerpo() {
    torso(C.polo, C.poloD);
    B(19, 35, 4, 1, C.shirt); B(20, 36, 3, 1, C.shirt); R(23, 36, 2, 2, C.poloD);
    falda(C.falda, C.faldaS); R(14, 45, 20, 1, C.rojo);
    mangas(C.polo, C.poloL, C.shirt); mangaCorta();
  },
  sobre(sw) {
    // coleta sobre el hombro, con su goma roja
    R(34, 31, 5, 3, C.rojo);
    R(34, 34, 5, 3, C.hair); R(35 + sw, 37, 5, 4, C.hair); R(34 + sw, 41, 5, 3, C.hair); R(35 + sw, 44, 3, 2, C.hair);
    R(38, 34, 1, 3, C.hairS); R(39 + sw, 37, 1, 4, C.hairS); R(36 + sw, 37, 1, 6, C.hairL);
  },
  pelo() {
    // flequillo barrido hacia el lado de la coleta
    Rh(11, 8, 26, 5, C.hair);
    Rh(18, 13, 18, 1, C.hair); Rh(12, 13, 4, 1, C.hair);
    Rh(26, 14, 10, 1, C.hair); Rh(12, 14, 3, 1, C.hair);
    Bh(12, 15, 2, 1, C.hair);
    Rh(16, 8, 1, 5, C.hairS); Ph(20, 12, C.hairS); Ph(24, 13, C.hairS); Ph(28, 13, C.hairS); Ph(31, 14, C.hairS);
    Rh(20, 10, 6, 1, C.hairL); Rh(28, 11, 5, 1, C.hairL);
    Rh(9, 13, 4, 14, C.hair); Rh(9, 13, 1, 14, C.hairS); Rh(10, 27, 2, 2, C.hair); Rh(11, 16, 1, 9, C.hairL);
    Rh(35, 13, 4, 18, C.hair); Rh(38, 13, 1, 18, C.hairS); Rh(36, 16, 1, 12, C.hairL);
  },
  adorno() {
    // gafas de sol subidas a la cabeza
    for (const x of [13, 26]) { Rh(x, 4, 9, 4, C.marco); Rh(x + 1, 5, 7, 2, C.lente); Ph(x + 2, 5, C.brillo); }
    Rh(22, 5, 4, 1, C.marco);
  },
};
