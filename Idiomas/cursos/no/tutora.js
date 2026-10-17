// Noruego: melena rubio ceniza muy larga y ondulada con una trenza por delante, boina azul con insignia,
// horquillas plateadas, ojos verde grisáceo, bufanda azul marino, abrigo azul hielo con cinturón y libro azul.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#c9b48f', hairL: '#eadbb8', hairS: '#a38d6c', hairD: '#7a6649', punta: '#e2c078',
      eyeG: '#6f9488', eyeD: '#33504a', eyeL: '#a9cbbd',
      book: '#5b8fd0', bookD: '#3b6aa8', bookL: '#8ab5ea',
      boina: '#3f6fb5', boinaL: '#6f9be0', boinaD: '#2a4f8a', plata: '#e6ecf5',
      bufanda: '#3b4a9a', bufandaL: '#6f7fd0', bufandaD: '#28336e',
      abrigo: '#dfeaf4', abrigoS: '#b7c9dc', cinto: '#2f3f7a',
      shoe: '#5a3a2a', shoeL: '#7d5540',
    },
    atras(sw) {
      // melena ondulada hasta la cintura
      B(5, 16, 2, 14, C.hair); B(5, 16, 1, 14, C.hairS);
      B(5, 28, 8, 4, C.hair); B(4, 32, 9, 4, C.hair); B(3, 36, 9, 5, C.hair, sw); B(4, 41, 8, 3, C.hair, sw);
      B(5, 44, 6, 2, C.hair, sw); B(6, 46, 4, 1, C.punta, sw); B(6, 45, 4, 1, C.punta, sw);
      B(4, 32, 1, 4, C.hairS); B(3, 36, 1, 5, C.hairS, sw); B(7, 33, 1, 9, C.hairL, sw); B(10, 36, 1, 6, C.hairS, sw);
    },
    piernas() { medias('#3a3f55'); },
    cuerpo() {
      R(16, 35, 16, 1, C.abrigo); R(15, 36, 18, 9, C.abrigo); R(14, 45, 20, 5, C.abrigo);
      R(14, 45, 20, 1, C.cinto); R(23, 45, 2, 1, C.plata);
      R(24, 46, 1, 4, C.abrigoS); P(22, 47, C.cinto); R(14, 49, 20, 1, C.abrigoS);
      mangas(C.abrigo, C.white, C.cinto);
      // bufanda que le tapa el cuello
      R(17, 33, 14, 4, C.bufanda); R(17, 34, 14, 1, C.bufandaL); R(17, 36, 14, 1, C.bufandaD);
      for (let x = 18; x < 31; x += 3) P(x, 35, C.bufandaL);
    },
    sobre() {
      // la punta de la bufanda cae sobre el libro
      R(27, 37, 4, 4, C.bufanda); R(27, 37, 1, 4, C.bufandaD); R(27, 40, 4, 1, C.bufandaL); P(27, 41, C.bufanda); P(29, 41, C.bufanda);
      // trenza por delante del hombro
      R(9, 32, 1, 11, C.hairD); R(13, 32, 1, 5, C.hairD);
      for (let y = 32; y < 42; y += 2) { R(10, y, 3, 2, C.hairL); P(10, y + 1, C.hairD); P(11, y + 1, C.hairS); P(12, y, C.hairS); }
      R(10, 42, 3, 1, C.boina); R(10, 43, 3, 2, C.punta); P(11, 45, C.punta);
    },
    pelo(sw) {
      // flequillo suave, abierto en mechones
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 5, 1, C.hair); Rh(19, 14, 4, 1, C.hair); Rh(26, 14, 3, 1, C.hair); Rh(31, 14, 5, 1, C.hair);
      Rh(12, 15, 2, 1, C.hair); Rh(34, 15, 2, 1, C.hair);
      Rh(13, 9, 6, 1, C.hairL); Rh(22, 10, 5, 1, C.hairL);
      Rh(18, 10, 1, 4, C.hairS); Rh(25, 11, 1, 3, C.hairS); Rh(30, 10, 1, 4, C.hairS);
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 12, C.hairL);
      Rh(8 + sw, 32, 5, 3, C.hair); Rh(35 + sw, 32, 5, 3, C.hair);
    },
    adorno() {
      // boina ladeada
      Rh(16, 1, 19, 1, C.boina); Rh(12, 2, 27, 1, C.boina); Rh(9, 3, 33, 1, C.boina); Rh(8, 4, 35, 3, C.boina);
      Rh(38, 6, 6, 3, C.boina); Rh(10, 7, 28, 1, C.boinaD);
      Rh(15, 2, 9, 1, C.boinaL); Rh(11, 3, 4, 1, C.boinaL); Rh(42, 6, 2, 3, C.boinaD); Rh(38, 8, 4, 1, C.boinaD);
      Rh(15, 4, 3, 2, C.plata); Ph(16, 6, C.plata); Ph(16, 5, C.boinaD); Ph(22, 5, C.gold);
      // horquillas
      Rh(31, 10, 3, 1, C.plata); Rh(31, 12, 3, 1, C.plata);
    },
  };
  return DISENO;
};
