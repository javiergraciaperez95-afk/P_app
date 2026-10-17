// Chino: estudiante de instituto con el uniforme de chándal de siempre. Melena negra, lisa y larga, con flequillo
// recto de hebras finas; chaqueta azul marino con hombros y mangas blancas y ribete blanco, abierta sobre un polo
// blanco de cuello azul; pantalón de chándal marino con raya blanca, zapatillas blancas, cascos blancos al cuello
// y un cuaderno amarillo entre las manos.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, mangas }) => {
  const DISENO = {
    colores: {
      hair: '#1f1c24', hairL: '#3d3947', hairS: '#141118', hairD: '#0b090d',
      eyeG: '#4a3326', eyeD: '#1f140e', eyeL: '#7a5a44',
      book: '#e0a92e', bookD: '#b07d1c', bookL: '#f5cf6a', gold: '#1f2a4d', goldD: '#33406b',
      marino: '#1f2a4d', marinoL: '#33406b', blanco: '#f4f6f5', blancoS: '#c9d0d6',
      polo: '#5b86c9', poloD: '#3e66a6', cascos: '#f7f7f4', cascosS: '#c8cbc6',
      shoe: '#eef0f0', shoeL: '#ffffff',
    },
    // té de burbujas al acabar el día y su gesto propio
    bebida: { vaso: '#e6f2f6', liquido: '#d6ab7f', conPajita: true },
    firma: 'pelo',
    atras(sw) {
      // melena larga y lisa que cae por detrás de los hombros
      B(8, 30, 5, 14, C.hair); B(8, 30, 1, 14, C.hairS); B(10, 32, 1, 10, C.hairL);
      B(8, 44, 4, 2, C.hair, sw); B(9, 46, 2, 1, C.hair, sw);
    },
    piernas() {
      // pantalón de chándal recto con la raya blanca por fuera
      R(17, 45, 14, 2, C.marino);
      R(18, 47, 5, 6, C.marino); R(25, 47, 5, 6, C.marino);
      R(18, 46, 1, 7, C.blanco); R(29, 46, 1, 7, C.blanco);
      // zapatillas blancas
      R(17, 53, 6, 2, C.shoe); R(25, 53, 6, 2, C.shoe); R(17, 54, 6, 1, C.blancoS); R(25, 54, 6, 1, C.blancoS);
    },
    cuerpo() {
      // chaqueta marino, abierta
      R(16, 35, 16, 1, C.blanco); R(15, 36, 18, 9, C.marino);
      B(15, 36, 5, 1, C.blanco); // hombros blancos
      B(15, 37, 3, 1, C.blanco); B(18, 38, 1, 1, C.blanco); // ribete que baja en curva
      B(20, 37, 1, 8, C.blanco); // ribete junto a la cremallera
      // polo blanco con el cuello azul
      R(21, 36, 6, 9, C.blanco); R(21, 35, 6, 1, C.blanco); B(21, 41, 1, 4, C.blancoS);
      B(20, 35, 3, 1, C.polo); B(21, 36, 2, 1, C.poloD); R(23, 37, 2, 3, C.polo); P(24, 39, C.poloD);
      R(15, 44, 18, 1, C.marinoL); // bajo de la chaqueta
      // mangas: blancas arriba, marino abajo
      mangas(C.blanco, C.white, C.marino); B(13, 40, 3, 3, C.marino); B(13, 40, 3, 1, C.marinoL);
    },
    sobre() {
      // cascos blancos colgados del cuello
      R(19, 33, 3, 3, C.cascos); R(26, 33, 3, 3, C.cascos); P(19, 35, C.cascosS); P(28, 35, C.cascosS);
      R(22, 35, 4, 1, C.cascosS);
    },
    pelo(sw) {
      // flequillo recto de hebras finas, que tapa la frente
      Rh(11, 8, 26, 6, C.hair);
      for (const [x, w] of [[12, 3], [16, 3], [20, 2], [23, 3], [27, 2], [30, 3], [34, 2]]) Rh(x, 14, w, 1, C.hair);
      Ph(13, 15, C.hair); Ph(17, 15, C.hair); Ph(24, 15, C.hair); Ph(31, 15, C.hair); Ph(34, 15, C.hair);
      Rh(15, 10, 1, 4, C.hairS); Rh(22, 10, 1, 4, C.hairS); Rh(29, 10, 1, 4, C.hairS);
      Rh(13, 6, 7, 1, C.hairL); Rh(26, 6, 7, 1, C.hairL); Rh(17, 9, 4, 1, C.hairL); Rh(25, 9, 3, 1, C.hairL);
      // mechones largos que enmarcan la cara
      Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 13, C.hairL);
      Rh(9 + sw, 32, 4, 2, C.hair); Rh(35 + sw, 32, 4, 2, C.hair);
    },
    adorno() {},
  };
  return DISENO;
};
