// Rumano: melena castaño rojizo larga y lisa, cinta roja con lazo en el pelo, ojos color avellana,
// blusa blanca con un bordado fino rojo en el cuello y las mangas, falda azul oscuro con dos rayas y libro amarillo.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#7a3b30', hairL: '#a85a48', hairS: '#59261f', hairD: '#3a1612',
      eyeG: '#8a7a3a', eyeD: '#463c16', eyeL: '#c8b870',
      book: '#f0c93a', bookD: '#c09a1f', bookL: '#ffe680', gold: '#2c4a9a', goldD: '#1c3070',
      rojo: '#d63a45', rojoL: '#f0656e', rojoD: '#9c2330',
      falda: '#2b2d4a', faldaD: '#1c1d33', amarillo: '#f0c93a',
    },
    atras(sw) {
      B(6, 26, 7, 16, C.hair); B(6, 26, 1, 16, C.hairS); B(9, 30, 1, 11, C.hairL);
      B(6, 42, 6, 3, C.hair, sw); B(7, 45, 4, 1, C.hair, sw); B(6, 42, 1, 3, C.hairS, sw);
    },
    piernas() { medias(C.white, 52); },
    cuerpo() {
      torso(C.shirt, C.shirtS);
      for (let x = 19; x < 29; x += 2) { P(x, 35, C.rojo); P(x + 1, 36, C.rojo); }
      for (let x = 20; x < 29; x += 4) P(x, 37, C.falda);
      falda(C.falda, C.faldaD); R(14, 47, 20, 1, C.rojo); R(14, 48, 20, 1, C.amarillo);
      mangas(C.shirt, C.white); B(13, 38, 3, 1, C.rojo); B(14, 39, 1, 1, C.rojo); B(13, 40, 3, 1, C.rojo);
    },
    sobre() {},
    pelo() {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 9, 1, C.hair); Rh(24, 14, 5, 1, C.hair); Rh(32, 14, 4, 1, C.hair); Bh(12, 15, 2, 1, C.hair);
      Rh(14, 10, 6, 1, C.hairL); Rh(25, 10, 6, 1, C.hairL);
      Rh(21, 9, 1, 5, C.hairS); Rh(29, 9, 1, 5, C.hairS);
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 13, C.hairL);
    },
    adorno() {
      // cinta con lazo a un lado
      Rh(8, 7, 32, 1, C.rojo); Rh(13, 6, 22, 1, C.rojo); Rh(15, 6, 8, 1, C.rojoL);
      Rh(6, 3, 3, 4, C.rojo); Rh(10, 3, 3, 4, C.rojo); Rh(9, 4, 1, 2, C.rojoD); Rh(6, 3, 2, 1, C.rojoL); Rh(10, 3, 2, 1, C.rojoL);
      Ph(7, 7, C.rojoD); Ph(7, 8, C.rojo); Ph(11, 8, C.rojo);
    },
  };
  return DISENO;
};
