// Danés: pelo rubio muy claro, corto, con flequillo y un mechón rebelde en la coronilla, ojos azules,
// jersey rojo de punto, bufanda blanca gorda, falda vaquera y libro blanco con el emblema rojo.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#f0e2b0', hairL: '#fff8dc', hairS: '#cdb97e', hairD: '#9c8650',
      eyeG: '#4a90c8', eyeD: '#1f4a78', eyeL: '#9cd0f0',
      book: '#f4f0e6', bookD: '#cfc8b5', bookL: '#ffffff', gold: '#d63a45', goldD: '#9c2330',
      jersey: '#c8383f', jerseyL: '#e85a60', jerseyD: '#96222c',
      bufanda: '#f4f6f5', bufandaS: '#cfd6de', falda: '#3d5088', faldaD: '#2a3a66',
    },
    atras() { Bh(6, 14, 1, 13, C.hair); },
    piernas() { medias(C.white, 52); },
    cuerpo() {
      torso(C.jersey, C.jerseyD);
      falda(C.falda, C.faldaD);
      mangas(C.jersey, C.jerseyL, C.jerseyD); B(13, 38, 3, 1, C.white);
      R(17, 33, 14, 4, C.bufanda); R(17, 36, 14, 1, C.bufandaS);
      for (let x = 19; x < 30; x += 3) P(x, 34, C.bufandaS);
    },
    sobre() {
      // la punta de la bufanda
      R(18, 37, 4, 5, C.bufanda); R(21, 37, 1, 5, C.bufandaS); R(18, 41, 4, 1, C.bufandaS); P(18, 42, C.bufanda); P(20, 42, C.bufanda);
    },
    pelo() {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 6, 1, C.hair); Rh(20, 14, 3, 1, C.hair); Rh(25, 14, 4, 1, C.hair); Rh(31, 14, 5, 1, C.hair);
      Bh(12, 15, 2, 1, C.hair);
      Rh(13, 6, 7, 1, C.hairL); Rh(25, 6, 8, 1, C.hairL); Rh(15, 9, 6, 1, C.hairL);
      Rh(18, 10, 1, 4, C.hairS); Rh(24, 10, 1, 4, C.hairS); Rh(30, 10, 1, 4, C.hairS);
      // corto: los mechones acaban en punta a media mejilla
      Bh(9, 13, 4, 12, C.hair); Bh(9, 13, 1, 12, C.hairS); Bh(10, 25, 3, 2, C.hair); Bh(11, 27, 2, 1, C.hair);
    },
    adorno() {
      Rh(22, 1, 3, 2, C.hair); Ph(25, 1, C.hair); Ph(26, 0, C.hair); Ph(23, 1, C.hairL); // mechón rebelde
    },
  };
  return DISENO;
};
