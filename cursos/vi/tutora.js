// Vietnamita (Cô Mai): melena negra azulada muy larga y lisa con la raya en medio, flor de loto en el pelo,
// ojos castaños, áo dài blanco con ribete rosa (el uniforme de las estudiantes en Vietnam), pantalón de seda y libro verde.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      o: '#1a1220', skin: '#fbe0cb', skinS: '#ecb99c', blush: '#f5a0a0',
      hair: '#352d4a', hairL: '#62578a', hairS: '#231d33', hairD: '#120e1a',
      eyeG: '#7a4a2a', eyeD: '#33190c', eyeL: '#c48a52',
      ao: '#fbfaf5', aoS: '#dcdfe8', aoD: '#b9bfd0', seda: '#e9ecf3', sedaS: '#c5cbdb',
      loto: '#f49ab8', lotoL: '#ffd0df', lotoD: '#d76890', hoja: '#6fa878',
      book: '#2f6a50', bookD: '#1c4332', bookL: '#44906e', gold: '#f0cc62', goldD: '#c79a2a',
      shoe: '#3a2a44', shoeL: '#5b4569',
    },
    // café con leche y hielo al acabar el día y su gesto propio
    bebida: { vaso: '#eef6f9', liquido: '#9a6a42', conPajita: true },
    firma: 'reverencia',
    atras(sw) {
      // melena muy larga y lisa, hasta la cintura; las puntas se mecen
      B(8, 32, 7, 15, C.hair); B(8, 32, 1, 15, C.hairS); B(11, 34, 1, 11, C.hairL);
      B(8, 47, 6, 2, C.hair, sw); B(9, 49, 4, 1, C.hair, sw);
    },
    piernas() {
      // pantalón de seda, ancho
      R(17, 50, 6, 3, C.seda); R(25, 50, 6, 3, C.seda);
      R(17, 50, 1, 3, C.sedaS); R(25, 50, 1, 3, C.sedaS); R(22, 51, 1, 2, C.sedaS); R(30, 51, 1, 2, C.sedaS);
      zapatos();
    },
    cuerpo() {
      // áo dài: cuello alto, cierre cruzado, mangas largas y falda abierta por los lados
      R(16, 35, 16, 1, C.ao); R(15, 36, 18, 9, C.ao);
      R(14, 45, 20, 3, C.ao); R(13, 48, 22, 2, C.ao);
      B(15, 36, 1, 9, C.aoS);
      R(18, 46, 1, 4, C.aoS); R(29, 46, 1, 4, C.aoS); R(23, 47, 1, 3, C.aoS);
      R(13, 49, 22, 1, C.lotoL);
      R(21, 34, 6, 2, C.ao); R(21, 35, 6, 1, C.aoS); R(21, 34, 6, 1, C.lotoL); R(23, 34, 2, 1, C.aoD);
      for (let i = 0; i < 4; i++) P(25 + i, 36 + i, C.loto);
      P(28, 39, C.lotoD);
      mangas(C.ao, C.white); B(13, 42, 3, 1, C.lotoL);
    },
    sobre() {},
    pelo() {
      // flequillo abierto, con la raya en medio: dos cortinas que dejan ver la frente
      Rh(11, 8, 26, 4, C.hair);
      Rh(12, 12, 10, 1, C.hair); Rh(12, 13, 8, 1, C.hair); Rh(12, 14, 6, 1, C.hair); Rh(12, 15, 4, 1, C.hair);
      Rh(26, 12, 10, 1, C.hair); Rh(28, 13, 8, 1, C.hair); Rh(30, 14, 6, 1, C.hair); Rh(32, 15, 4, 1, C.hair);
      Rh(22, 12, 4, 1, C.hair);
      Rh(23, 5, 2, 7, C.hairS);
      Rh(13, 6, 8, 1, C.hairL); Rh(27, 6, 7, 1, C.hairL); Bh(11, 9, 3, 1, C.hairL);
      Rh(14, 8, 6, 1, C.hairL); Rh(28, 8, 6, 1, C.hairL);
      Rh(17, 10, 1, 3, C.hairS); Rh(30, 10, 1, 3, C.hairS);
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 13, C.hairL);
      Bh(9, 32, 4, 3, C.hair);
    },
    adorno() {
      // flor de loto, con una hojita
      Rh(33, 8, 5, 3, C.loto); Ph(35, 7, C.loto); Ph(32, 9, C.loto); Ph(38, 9, C.loto);
      Ph(35, 8, C.lotoL); Rh(34, 9, 3, 1, C.lotoL); Ph(33, 10, C.lotoD); Ph(37, 10, C.lotoD); Ph(35, 10, C.gold);
      Rh(38, 11, 2, 1, C.hoja); Ph(39, 10, C.hoja);
    },
  };
  return DISENO;
};
