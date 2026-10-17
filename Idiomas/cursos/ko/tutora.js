// Coreano: melena castaño claro lisa hasta el pecho con las puntas hacia dentro, flequillo fino que deja ver la frente,
// dos horquillas de colores, cárdigan beis sobre camisa blanca con lazo, falda marrón plisada y libro rosa pastel.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#a87a55', hairL: '#cfa27a', hairS: '#84593a', hairD: '#5c3b24',
      eyeG: '#6b4a36', eyeD: '#33201a', eyeL: '#a98468',
      book: '#f29ab8', bookD: '#d06f92', bookL: '#ffc2d6',
      cardigan: '#e8d8b8', cardiganS: '#c9b48f', lazo: '#b9474f', lazoD: '#7c2432',
      falda: '#8a6a55', faldaD: '#6b4f3f', pin1: '#ff7fa8', pin2: '#6fd0c0',
    },
    atras(sw) {
      B(8, 30, 5, 10, C.hair); B(8, 30, 1, 10, C.hairS); B(10, 31, 1, 8, C.hairL);
      B(9, 40, 4, 2, C.hair, sw); B(10, 42, 3, 1, C.hair, sw);
    },
    piernas() { medias(C.white, 52); },
    cuerpo() {
      torso(C.shirt);
      B(15, 36, 5, 9, C.cardigan); B(16, 35, 3, 1, C.cardigan); B(19, 37, 1, 8, C.cardiganS);
      R(22, 36, 4, 1, C.lazo); R(23, 37, 2, 1, C.lazoD);
      falda(C.falda, C.faldaD);
      mangas(C.cardigan, C.white, C.cardiganS);
    },
    sobre() {},
    pelo() {
      // flequillo fino, en hebras sueltas
      Rh(11, 8, 26, 5, C.hair);
      for (const [x, w] of [[12, 3], [16, 2], [19, 2], [23, 3], [27, 2], [30, 2], [33, 3]]) Rh(x, 13, w, 1, C.hair);
      Rh(12, 14, 2, 1, C.hair); Ph(17, 14, C.hair); Ph(24, 14, C.hair); Ph(30, 14, C.hair); Rh(34, 14, 2, 1, C.hair);
      Rh(13, 6, 7, 1, C.hairL); Rh(25, 6, 8, 1, C.hairL); Rh(15, 9, 6, 1, C.hairL); Rh(26, 9, 5, 1, C.hairL);
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 13, C.hairL);
    },
    adorno() {
      Rh(13, 10, 3, 1, C.pin1); Rh(13, 12, 3, 1, C.pin2);
    },
  };
  return DISENO;
};
