// Sueco: pelo rubio dorado recogido en un moño alto con un lazo azul, ojos azules,
// peto vaquero sobre camiseta blanca, zapatillas blancas y libro amarillo con el emblema azul.
// Se genera con _herramientas/montar_cursos.py a partir de _tutoras/disenos: los cambios se hacen allí.

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      hair: '#f0c84a', hairL: '#ffe78a', hairS: '#c99a25', hairD: '#93700f',
      eyeG: '#3f7fd0', eyeD: '#1c3f7a', eyeL: '#8fc0f5',
      book: '#f5d23a', bookD: '#c9a41f', bookL: '#fff08a', gold: '#2f5fae', goldD: '#1f3f80',
      peto: '#4a6fb0', petoL: '#7fa3e0', petoD: '#34508a',
      lazo: '#2f5fae', lazoL: '#6f9be0', boton: '#f3c94b',
      shoe: '#f4f6f5', shoeL: '#ffffff',
    },
    atras() {},
    piernas() {
      R(18, 50, 5, 3, C.peto); R(25, 50, 5, 3, C.peto); R(18, 50, 1, 3, C.petoD); R(29, 50, 1, 3, C.petoD);
      zapatos();
    },
    cuerpo() {
      torso(C.shirt, C.shirtS);
      B(18, 35, 2, 3, C.peto); R(17, 38, 14, 7, C.peto); B(18, 37, 1, 1, C.boton);
      R(14, 45, 20, 5, C.peto); R(23, 46, 2, 4, C.petoD); B(16, 46, 3, 1, C.petoL); R(14, 45, 20, 1, C.petoD);
      mangas(C.shirt, C.white, C.shirtS); mangaCorta();
    },
    sobre() {},
    pelo() {
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      Rh(12, 14, 5, 1, C.hair); Rh(20, 14, 6, 1, C.hair); Rh(30, 14, 6, 1, C.hair); Bh(12, 15, 2, 1, C.hair);
      // el pelo sube hacia el moño
      Bh(14, 9, 1, 2, C.hairS); Bh(15, 7, 1, 2, C.hairS); Bh(17, 5, 1, 2, C.hairS); Bh(20, 6, 1, 4, C.hairS);
      Bh(12, 10, 1, 3, C.hairL); Bh(18, 8, 1, 3, C.hairL);
      Bh(10, 13, 2, 14, C.hair); Bh(11, 27, 1, 3, C.hair); Bh(9, 13, 1, 10, C.hairS);
    },
    adorno() {
      // moño
      Rh(20, -3, 8, 1, C.hair); Rh(18, -2, 12, 4, C.hair); Rh(19, 2, 10, 1, C.hair);
      Rh(20, -2, 5, 1, C.hairL); Rh(22, 0, 5, 1, C.hairS); Ph(27, -1, C.hairS); Rh(29, -1, 1, 2, C.hairS);
      // lazo
      Rh(20, 3, 8, 1, C.lazo); Bh(15, 2, 5, 3, C.lazo); Bh(15, 2, 2, 1, C.lazoL); Bh(15, 5, 2, 1, C.lazo);
    },
  };
  return DISENO;
};
