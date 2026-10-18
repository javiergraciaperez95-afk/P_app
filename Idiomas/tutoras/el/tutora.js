// Griego: melena negra larga y muy rizada, con mucho volumen, ramita de olivo en el pelo, ojos verde oliva,
// blusa blanca con ribete azul, falda azul plisada, sandalias y libro azul.
// Los cambios se hacen aquí mismo (el dibujo común está en js/tutora-base.js).

export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {
  const DISENO = {
    colores: {
      skin: '#f6d4b6', skinS: '#dfa98a',
      hair: '#3a2c28', hairL: '#6a5248', hairS: '#271c19', hairD: '#170f0d',
      eyeG: '#7a8a3a', eyeD: '#3a4418', eyeL: '#b8c470',
      book: '#2f6fc4', bookD: '#1f4d8f', bookL: '#5a96e6',
      ribete: '#2f6fc4', falda: '#2f5fae', faldaD: '#20447f',
      oliva: '#8fbe5a', olivaD: '#56802f',
    },
    // frappé al acabar el día y su gesto propio
    bebida: { vaso: '#eef6f9', liquido: '#c9a27a', conPajita: true },
    firma: 'baile',
    atras(sw) {
      // rizos: el borde de la melena entra y sale
      for (let k = 0, y = 12; y < 45; y += 3, k++) {
        const x = 3 + 2 * (k % 2), d = y > 30 ? sw : 0;
        B(x, y, 10, 3, C.hair, d); B(x, y + 2, 2, 1, C.hairS, d); B(x + 2, y + 1, 2, 1, C.hairL, d); B(x + 6, y, 2, 1, C.hairS, d);
      }
      B(6, 45, 6, 2, C.hair, sw);
    },
    piernas() { medias(C.skin, 53); },
    cuerpo() {
      torso(C.shirt, C.shirtS);
      B(19, 35, 3, 1, C.ribete); B(21, 36, 2, 1, C.ribete); R(23, 37, 2, 1, C.ribete);
      falda(C.falda, C.faldaD); R(14, 48, 20, 1, C.shirt);
      mangas(C.shirt, C.white, C.ribete);
    },
    sobre() {},
    pelo() {
      Rh(18, 2, 4, 1, C.hair); Rh(26, 2, 4, 1, C.hair); Bh(11, 4, 3, 1, C.hair); // coronilla rizada
      Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
      for (const x of [12, 18, 24, 30]) Rh(x, 14, 4, 1, C.hair);
      Bh(12, 15, 2, 1, C.hair); Bh(21, 15, 2, 1, C.hair);
      for (const [x, y] of [[13, 6], [19, 5], [26, 6], [32, 7], [15, 10], [22, 9], [29, 10]]) Rh(x, y, 3, 1, C.hairL);
      for (const [x, y] of [[17, 8], [25, 11], [33, 10], [12, 11], [20, 12], [29, 7]]) Rh(x, y, 2, 1, C.hairS);
      for (let k = 0, y = 13; y < 32; y += 3, k++) {
        Bh(8 + (k % 2), y, 4, 3, C.hair); Bh(9 + (k % 2), y + 1, 2, 1, C.hairL); Bh(8 + (k % 2), y + 2, 2, 1, C.hairS);
      }
    },
    adorno() {
      // ramita de olivo
      for (const [x, y] of [[10, 11], [11, 10], [12, 9], [13, 8], [14, 7]]) Ph(x, y, C.olivaD);
      for (const [x, y] of [[9, 9], [11, 7], [13, 5], [12, 11], [14, 9], [16, 7]]) Rh(x, y, 2, 1, C.oliva);
    },
  };
  return DISENO;
};
