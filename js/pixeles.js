// Dibujos pixel art a color, hechos con código, en lugar de los emojis (20-10): los emojis dependen de la fuente del
// móvil y a veces salen como cuadrados, en blanco y negro o con otro dibujo. Cada dibujo es una rejilla de 10 × 10 en
// la que cada letra es un color (PALETA) y «.» es transparente; se pinta como un SVG que mide 1,15 em, igual que un
// emoji al lado del texto.
// Nadie tiene que llamar a nada: al arrancar, ponerPixeles() cambia los emojis de la página y vigila lo que se pinta
// después (MutationObserver), así que valen igual los emojis de los textos (i18n), de los datos (DELE) y del código.
// Los símbolos tipográficos (✔ ✓ ✕ ★ ☆ ♀ ♂ ♥ ♪…) no se tocan: son letras de la fuente y se ven bien en todas partes.

const PALETA = {
  k: '#2a1620', w: '#ffffff', c: '#fbf0e1', r: '#d21f30', R: '#8a1020', o: '#ff8a1c', y: '#ffc72c', Y: '#c98f12',
  g: '#3fae5a', G: '#22743a', b: '#3d7fd6', B: '#9ad9ff', m: '#1d3a8a', p: '#ff8fa3', n: '#8a5a34', N: '#c99a6b',
  s: '#f5c9a0', h: '#4a2c1a', e: '#c4c4cf', E: '#6b6b78', v: '#8b5cf6', l: '#f2e6c9',
};

const D = {
  altavoz: ['....k.....', '...kk..k..', '..kek...k.', 'kkkek.k..k', 'keeek.k..k', 'keeek.k..k', 'kkkek.k..k', '..kek...k.', '...kk..k..', '....k.....'],
  mudo: ['....k.....', '...kk.....', '..kek.r..r', 'kkkek..rr.', 'keeek..rr.', 'keeek.r..r', 'kkkek.....', '..kek.....', '...kk.....', '....k.....'],
  check: ['kkkkkkkkkk', 'kggggggggk', 'kggggggwgk', 'kgggggwwgk', 'kgwgggwggk', 'kgwwgwwggk', 'kggwwwgggk', 'kgggwggggk', 'kggggggggk', 'kkkkkkkkkk'],
  aviso: ['....kk....', '...kyyk...', '...kyyk...', '..kykkyk..', '..kykkyk..', '.kyykkyyk.', '.kyykkyyk.', 'kyyyyyyyyk', 'kyyykkyyyk', 'kkkkkkkkkk'],
  nube: ['..........', '...kkk....', '..kwwwk...', '.kwwwwwkk.', '.kwwwwwwwk', 'kwwwwwwwwk', 'kwwwwwwwek', '.keeeeeek.', '..kkkkkk..', '..........'],
  fuego: ['....r.....', '....rr....', '...rro....', '..rrrorr..', '.rrooorrr.', '.rroyyorr.', '.rooyyoor.', '.rooyyyor.', '..rooyor..', '...rrrr...'],
  rayo: ['.....kkkk.', '....kyyk..', '...kyyk...', '..kyyk....', '.kyyykkkk.', '.kkkkyyyk.', '....kyyk..', '...kyyk...', '..kyk.....', '..kk......'],
  senalar: ['...kk.....', '..kssk....', '..kssk....', '..ksskkk..', '..ksssskkk', 'kkksssssk.', 'ksksssssk.', 'kssssssk..', '.ksssssk..', '..kkkkk...'],
  saludo: ['.k.k.k....', 'ksksksk...', 'ksksksk.k.', 'kssssskskk', 'ksssssssk.', 'ksssssssk.', 'kssssssk..', '.ksssssk..', '..ksssk...', '..kkkkk...'],
  copa: ['kkkkkkkkkk', 'kyyyyyyyyk', 'yyyyyywyyy', 'ykyyyyyyky', '.kyyyyyyk.', '..kyyyyk..', '....yy....', '....yy....', '..kkkkkk..', '..kYYYYk..'],
  medalla: ['.rr...bb..', '..rr.bb...', '...rbb....', '...kkkk...', '..kyyyyk..', '.kyywyyyk.', '.kyyyyyyk.', '.kyyyyyyk.', '..kyyyyk..', '...kkkk...'],
  corona: ['..........', 'y...y...y.', 'yy.yyy.yy.', 'yyyyyyyyy.', 'yyryyybyy.', 'yyyyyyyyy.', 'YYYYYYYYY.', '..........', '..........', '..........'],
  bombilla: ['...kkkk...', '..kyyyyk..', '.kyywyyyk.', '.kyyyyyyk.', '.kyyyyyyk.', '..kyyyyk..', '...kyyk...', '...keek...', '...keek...', '....kk....'],
  edificio: ['....kk....', '..kkyykk..', 'kkyyyyyykk', 'kkkkkkkkkk', '.kc.c.c.k.', '.kc.c.c.k.', '.kc.c.c.k.', '.kc.c.c.k.', 'kkkkkkkkkk', 'kkkkkkkkkk'],
  iglesia: ['....kk....', '...kkkk...', '....kk....', '...kwwk...', '..kwwwwk..', '.kwwwwwwk.', '.kwwkkwwk.', '.kwwkkwwk.', '.kwwkkwwk.', '.kkkkkkkk.'],
  hospital: ['kkkkkkkkkk', 'kwwwwwwwwk', 'kwwwrrwwwk', 'kwwwrrwwwk', 'kwrrrrrrwk', 'kwrrrrrrwk', 'kwwwrrwwwk', 'kwwwrrwwwk', 'kwwwwwwwwk', 'kkkkkkkkkk'],
  cartas: ['..kkkkkk..', '.kkwwwwk..', 'kwkwrwwkk.', 'kwkwwwwkwk', 'kwkwwwwkwk', 'kwkwwrwkwk', 'kwkwwwwkwk', 'kwkkkkkkwk', 'kwwwwwwwk.', 'kkkkkkkkk.'],
  fiesta: ['.y....b..r', '...r......', '.......y..', 'kk..b.....', 'kokk...r..', 'koyokk....', 'kooyyok.b.', 'koyooyok..', 'kooyoyyok.', 'kkkkkkkkkk'],
  lupa: ['..kkkk....', '.kBBBBk...', 'kBwBBBBk..', 'kBwBBBBk..', 'kBBBBBBk..', 'kBBBBBBk..', '.kBBBBkk..', '..kkkkkkk.', '.......kkk', '........kk'],
  espia: ['..kkkkkk..', '.kkkkkkkk.', 'kkkkkkkkkk', '..kssssk..', '.kssssssk.', '.kkkskkkk.', '.kkkskkkk.', '..kssssk..', '...kkkk...', '.kkkkkkkk.'],
  diana: ['..kkkkkk..', '.krrrrrrk.', 'krrwwwwrrk', 'krwwrrwwrk', 'krwrrrrwrk', 'krwrrrrwrk', 'krwwrrwwrk', 'krrwwwwrrk', '.krrrrrrk.', '..kkkkkk..'],
  bola: ['..kkkkkk..', '.kkkkkkkk.', 'kkkwwwwkkk', 'kkwwkkwwkk', 'kkwwkkwwkk', 'kkwwwwwwkk', 'kkwwkkwwkk', 'kkkwwwwkkk', '.kkkkkkkk.', '..kkkkkk..'],
  libro: ['..........', 'kkkk..kkkk', 'kwwwk.kwwk', 'kwkwkkwkwk', 'kwwwkkwwwk', 'kwkwkkwkwk', 'kwwwkkwwwk', 'kkkkkkkkkk', '....kk....', '..........'],
  libroAzul: ['.kkkkkkkk.', '.kbbbbbbbk', '.kbwwwwbbk', '.kbbbbbbbk', '.kbwwwbbbk', '.kbbbbbbbk', '.kbbbbbbbk', '.kbbbbbbbk', '.kwwwwwwwk', '.kkkkkkkk.'],
  libroVerde: ['.kkkkkkkk.', '.kgggggggg', '.kgwwwwggk', '.kgggggggg', '.kgwwwgggk', '.kgggggggg', '.kgggggggg', '.kgggggggg', '.kwwwwwwwk', '.kkkkkkkk.'],
  libros: ['..........', 'kkk.......', 'krk.kkk...', 'krk.kbk.kk', 'kwk.kbk.kg', 'krk.kwk.kg', 'krk.kbk.kg', 'krk.kbk.kg', 'kkk.kkk.kk', 'kkkkkkkkkk'],
  cuaderno: ['.kkkkkkkk.', 'kkyyyyyyyk', '.kyyyyyyyk', 'kkyykkkyyk', '.kyyyyyyyk', 'kkyykkkyyk', '.kyyyyyyyk', 'kkyyyyyyyk', '.kyyyyyyyk', '.kkkkkkkk.'],
  papel: ['.kkkkkkk..', '.kwwwwwkk.', '.kweeewkwk', '.kwwwwwwwk', '.kweeeeewk', '.kwwwwwwwk', '.kweeeeewk', '.kwwwwwwwk', '.kweeewwwk', '.kkkkkkkkk'],
  portapapeles: ['...kkkk...', '.kkkeekkk.', '.knnnnnnk.', '.kwwwwwwk.', '.kwkkkkwk.', '.kwwwwwwk.', '.kwkkkkwk.', '.kwwwwwwk.', '.kwkkkwwk.', '.kkkkkkkk.'],
  ojoTapado: ['..........', '.nnn..nnn.', 'nsssnnsssn', 'nsssssssss', 'nssssssssn', '.nssssssn.', '..nskksn..', '...nssn...', '....nn....', '..........'],
  ojo: ['..........', '...kkkk...', '.kkwwwwkk.', 'kwwwbbwwwk', 'kwwbkkbwwk', 'kwwbkkbwwk', 'kwwwbbwwwk', '.kkwwwwkk.', '...kkkk...', '..........'],
  candado: ['...kkkk...', '..keeeek..', '..ke..ek..', '..ke..ek..', '.kkkkkkkk.', '.kyyyyyyk.', '.kyyykyyk.', '.kyyykyyk.', '.kyyyyyyk.', '.kkkkkkkk.'],
  llave: ['.kkk......', 'kyyyk.....', 'kykyk.....', 'kyyykkkkkk', '.kkkyyyyyk', '....kkykyk', '......k.k.', '..........', '..........', '..........'],
  engranaje: ['...k..k...', '.k.kkkk.k.', '..keeeek..', 'kkeekkeekk', '.keek.kek.', '.kek.keek.', 'kkeekkeekk', '..keeeek..', '.k.kkkk.k.', '...k..k...'],
  telefono: ['.kkk......', 'krrrk.....', 'krrk......', 'krk.......', 'krk.......', 'krrk......', '.krrk.kkk.', '..krrkrrrk', '...krrrrk.', '....kkkk..'],
  papelera: ['...kkkk...', 'kkkkkkkkkk', '.keeeeeek.', '.kekekeek.', '.kekekeek.', '.kekekeek.', '.kekekeek.', '.kekekeek.', '.keeeeeek.', '..kkkkkk..'],
  sobre: ['..........', 'kkkkkkkkkk', 'kkwwwwwwkk', 'kwkwwwwkwk', 'kwwkwwkwwk', 'kwwwkkwwwk', 'kwwwwwwwwk', 'kwwwwwwwwk', 'kkkkkkkkkk', '..........'],
  bocadillo: ['.kkkkkkkk.', 'kwwwwwwwwk', 'kwkkwkkwwk', 'kwwwwwwwwk', 'kwkkkwkkwk', 'kwwwwwwwwk', '.kkwkkkkk.', '..kwk.....', '..kk......', '..........'],
  campana: ['....kk....', '...kyyk...', '..kyyyyk..', '..kyywyk..', '..kyyyyk..', '.kyyyyyyk.', '.kyyyyyyk.', 'kkkkkkkkkk', '...kYYk...', '....kk....'],
  reloj: ['..kkkkkk..', '.kwwwwwwk.', 'kwwwkwwwwk', 'kwwwkwwwwk', 'kwwwkwwwwk', 'kwwwkkkwwk', 'kwwwwwwwwk', 'kwwwwwwwwk', '.kwwwwwwk.', '..kkkkkk..'],
  despertador: ['kk......kk', 'k.kkkkkk.k', '.kwwwwwwk.', 'kwwwkwwwwk', 'kwwwkwwwwk', 'kwwwkkkwwk', 'kwwwwwwwwk', '.kwwwwwwk.', '..kkkkkk..', '.k......k.'],
  arena: ['kkkkkkkkkk', '.kwwwwwwk.', '..kyyyyk..', '...kyyk...', '....kk....', '...kwwk...', '..kwyywk..', '.kyyyyyyk.', 'kkkkkkkkkk', '..........'],
  repetir: ['..kkkkk...', '.kbbbbbkk.', 'kbk....kbk', 'kk....kbbk', '.....kbbbk', 'kbbbk.....', 'kbbk....kk', 'kbk....kbk', '.kkbbbbbk.', '...kkkkk..'],
  mando: ['..........', '.kkkkkkkk.', 'keeeeeeeek', 'kekeeeerek', 'kkkkeebeek', 'kekeeeeeek', 'keeeeeeeek', 'keekkkkeek', '.kk....kk.', '..........'],
  brujula: ['..kkkkkk..', '.kwwwwwwk.', 'kwwwwrrwwk', 'kwwwrrrwwk', 'kwwwrkwwwk', 'kwwwkbwwwk', 'kwwbbbwwwk', 'kwwbbwwwwk', '.kwwwwwwk.', '..kkkkkk..'],
  lapiz: ['.......kk.', '......kppk', '.....kyykk', '....kyyyk.', '...kyyyk..', '..kyyyk...', '.kyyyk....', '.kNNk.....', 'kkNk......', 'kk........'],
  musculo: ['...kkk....', '..ksssk...', '..kssk....', '..ksk..kk.', '..ksskkssk', '.kssssssk.', '.ksssssssk', '.ksssssssk', '..ksssssk.', '...kkkkk..'],
  calendario: ['.k..k..k..', 'kkkkkkkkkk', 'krrrrrrrrk', 'kkkkkkkkkk', 'kwwwwwwwwk', 'kwkwkwkwwk', 'kwwwwwwwwk', 'kwkwkwkwwk', 'kwwwwwwwwk', 'kkkkkkkkkk'],
  puzle: ['..kkk.....', '.kgggk....', 'kkgggkkkk.', 'kgggggggk.', 'kgggggggkk', 'kggggggggk', 'kgggggggkk', 'kgggggggk.', 'kgggggggk.', 'kkkkkkkkk.'],
  caja: ['..........', '.kkkkkkkk.', 'kNNNkkNNNk', 'kkkkkkkkkk', 'kNNNNNNNNk', 'kNNNkkNNNk', 'kNNNNNNNNk', 'kNNNNNNNNk', 'kNNNNNNNNk', 'kkkkkkkkkk'],
  herramientas: ['...kkkk...', '..kk..kk..', 'kkkkkkkkkk', 'krrrrrrrrk', 'krrrkkrrrk', 'kkkkyykkkk', 'krrrkkrrrk', 'krrrrrrrrk', 'krrrrrrrrk', 'kkkkkkkkkk'],
  llaveInglesa: ['.kk.......', 'keek......', 'ke.k......', 'kee.k.....', '.kkeek....', '...keek...', '....keek..', '.....keek.', '......keek', '.......kk.'],
  arbol: ['...kkkk...', '..kggggk..', '.kgggGggk.', 'kgGgggggGk', 'kgggggGggk', '.kgGggggk.', '..kkkkkk..', '....nn....', '....nn....', '..kkkkkk..'],
  brote: ['..........', '.kk....kk.', 'kggk..kggk', 'kgggkkgggk', '.kggkkggk.', '..kk.gkk..', '.....g....', '.....g....', '..kkkkkk..', '..knnnnk..'],
  cerebro: ['..kkkkkk..', '.kppppppk.', 'kppkpppkpk', 'kpppkppppk', 'kpkppkpppk', 'kpppppkppk', 'kppkpppppk', '.kppppppk.', '..kkkppk..', '.....kk...'],
  tortuga: ['..........', '...kkkk...', '..kgGgGk..', '.kgGgGgGk.', 'kkGgGgGgkk', 'kgkkkkkkgk', 'ksk....ksk', '..........', '..........', '..........'],
  estrella: ['....kk....', '....yy....', '...kyyk...', 'kkkyyyykkk', 'kyyyyyyyyk', '.kyyyyyyk.', '..kyyyyk..', '.kyyyyyyk.', 'kyyk..kyyk', 'kkk....kkk'],
  destellos: ['....y.....', '...yyy....', '.yyyyyyy..', '...yyy...y', '....y...yy', '.......y.y', '.y......y.', 'yyy.......', '.y........', '..........'],
  flechaAbajo: ['...kkkk...', '...kggk...', '...kggk...', '...kggk...', 'kkkkggkkkk', '.kggggggk.', '..kggggk..', '...kggk...', '....kk....', '..........'],
  flechaArriba: ['....kk....', '...kggk...', '..kggggk..', '.kggggggk.', 'kkkkggkkkk', '...kggk...', '...kggk...', '...kggk...', '...kkkk...', '..........'],
  mapa: ['kkk.kkk.kk', 'klkklkkllk', 'klklkkkllk', 'kgglklrklk', 'kglklklkgk', 'klklkllkgk', 'klkklkgklk', 'klkllkklkk', 'kkk.kkk.kk', '..........'],
  banderaEs: ['kkkkkkkkkk', 'krrrrrrrrk', 'krrrrrrrrk', 'kyyyyyyyyk', 'kyrryyyyyk', 'kyrryyyyyk', 'kyyyyyyyyk', 'krrrrrrrrk', 'krrrrrrrrk', 'kkkkkkkkkk'],
  birrete: ['..........', '....kk....', '..kkkkkk..', 'kkkkkkkkkk', '..kkkkkk.y', '..kkkkkk.y', '..kk..kk.y', '...kkkk..y', '.........y', '..........'],
  micro: ['...kkkk...', '..keeeek..', '..kekeek..', '..keeeek..', '..kekeek..', 'k.keeeek.k', 'k..kkkk..k', '.kk....kk.', '...kkkk...', '...kkkk...'],
  claqueta: ['kkkkkkkkkk', 'kwkwkwkwkk', 'kkkkkkkkkk', 'kEEEEEEEEk', 'kEwwwwwwEk', 'kEEEEEEEEk', 'kEwwwwEEEk', 'kEEEEEEEEk', 'kEEEEEEEEk', 'kkkkkkkkkk'],
  globo: ['..kkkk....', '.krrrrk...', 'krrwrrrk..', 'krwrrrrk..', 'krrrrrrk..', '.krrrrk...', '..krrk....', '...kk.....', '....k.....', '...k......'],
  salvavidas: ['..kkkkkk..', '.kwwrrwwk.', 'kwwkkkkwwk', 'krk....krk', 'krk....krk', 'kwk....kwk', 'kwk....kwk', 'kwwkkkkwwk', '.kwwrrwwk.', '..kkkkkk..'],
  semaforo: ['...kkkk...', '..kkrrkk..', '..krrrrk..', '..kkkkkk..', '..kyyyyk..', '..kkkkkk..', '..kggggk..', '..kkggkk..', '....kk....', '....kk....'],
  carrito: ['kk........', '.k........', '.kkkkkkkkk', '.kwkwkwkk.', '.kwkwkwkk.', '..kkkkkk..', '..k.......', '..kkkkkkk.', '..kk..kk..', '..kk..kk..'],
  bus: ['.kkkkkkkk.', 'kyyyyyyyyk', 'kBBkBBkBBk', 'kBBkBBkBBk', 'kyyyyyyyyk', 'kyyyyyyyyk', 'kwyyyyyywk', 'kkkkkkkkkk', '.kk....kk.', '..........'],
  tren: ['..kkkkkk..', '.kbbbbbbk.', '.kBBkkBBk.', '.kBBkkBBk.', '.kbbbbbbk.', '.kwbbbbwk.', '.kbbbbbbk.', '..kkkkkk..', '.k......k.', 'k........k'],
  sol: ['....y.....', '.y..y..y..', '..yyyyy...', '.yyyyyyy..', 'yyyyyyyyyy', '.yyyyyyy..', '..yyyyy...', '.y..y..y..', '....y.....', '..........'],
  mochila: ['...kkkk...', '..kk..kk..', '.kkkkkkkk.', 'krrrrrrrrk', 'krrrrrrrrk', 'kkkkkkkkkk', 'krrkyykrrk', 'krrkkkkrrk', 'krrrrrrrrk', '.kkkkkkkk.'],
  dinero: ['...kkkk...', '....kk....', '..kkkkkk..', '.kggggggk.', 'kgggkggggk', 'kggkkkgggk', 'kgggkkgggk', 'kggkkkgggk', '.kggkgggk.', '..kkkkkk..'],
  tarjeta: ['..........', 'kkkkkkkkkk', 'kbbbbbbbbk', 'kkkkkkkkkk', 'kbbbbbbbbk', 'kbyybbbbbk', 'kbbbbbwwbk', 'kkkkkkkkkk', '..........', '..........'],
  montana: ['..........', '....kk....', '...kwwk...', '..kwwEEk..', '..kEEEEk..', '.kEEEEEEk.', '.kEEgEEEk.', 'kEEgggEEEk', 'kggggggggg', 'kkkkkkkkkk'],
  pajaro: ['..kkkk....', '.knnnnk...', 'knwknnnk..', 'knnnnnnkk.', '.kyknnnnnk', '..knnnnnnk', '..knnNNnk.', '...knnnk..', '....kyk...', '...kk.kk..'],
  nota: ['.....kkkk.', '.....kkkk.', '.....k..k.', '.....k..k.', '.....k..k.', '.....k..k.', '..kkkk..k.', '.kkkkk.kk.', '.kkkk.kkk.', '......kk..'],
  auriculares: ['..kkkkkk..', '.k......k.', 'k........k', 'k........k', 'kk......kk', 'krk....krk', 'krk....krk', 'krk....krk', 'kk......kk', '..........'],
  persona: ['...kkkk...', '..khhhhk..', '..ksssskk.', '..kskskk..', '..ksssk...', '...kkk....', '.kkbbbkk..', 'kbbbbbbbk.', 'kbbbbbbbk.', 'kkkkkkkkk.'],
  mujer: ['...kkkk...', '..khhhhk..', '.khssssh..', '.khskskhk.', '.khssssh..', '.kh.kk.hk.', '.kkpppkk..', 'kpppppppk.', 'kpppppppk.', 'kkkkkkkkk.'],
  mayor: ['...kkkk...', '..keeeek..', '..ksssskk.', '..kkskkk..', '..ksssk...', '...kkk....', '.kkNNNkk..', 'kNNNNNNNk.', 'kNNNNNNNk.', 'kkkkkkkkk.'],
  familia: ['.kk....kk.', 'khhk..khhk', 'kssk..kssk', '.kk.kk.kk.', 'kbbkhhkppk', 'kbbksskppk', 'kbbkkkkppk', 'kbbkppkppk', 'kkkkkkkkkk', '..........'],
  pausa: ['..........', '.kkk..kkk.', '.kek..kek.', '.kek..kek.', '.kek..kek.', '.kek..kek.', '.kek..kek.', '.kek..kek.', '.kkk..kkk.', '..........'],
  parar: ['..........', '.kkkkkkkk.', '.keeeeeek.', '.keeeeeek.', '.keeeeeek.', '.keeeeeek.', '.keeeeeek.', '.keeeeeek.', '.kkkkkkkk.', '..........'],
  disquete: ['kkkkkkkkk.', 'kbkwwwkbkk', 'kbkwwwkbbk', 'kbkkkkkbbk', 'kbbbbbbbbk', 'kbkkkkkkbk', 'kbkwwwwkbk', 'kbkwwwwkbk', 'kbkwwwwkbk', 'kkkkkkkkkk'],
  mascaras: ['kkkkk.....', 'kwwwk.....', 'kkwkkkkkk.', 'kwwwkyyyyk', 'kkwkkkyyyk', '.kwkkyyyyk', '..kkyyyyyk', '....kykkyk', '....kyyyyk', '.....kkkk.'],
  farol: ['....kk....', '...kkkk...', '..krrrrk..', '.krrrrrrk.', '.kyyyyyyk.', '.krrrrrrk.', '.krrrrrrk.', '..krrrrk..', '...kkkk...', '....yy....'],
  oreja: ['...kkkk...', '..kssssk..', '.kssskssk.', '.kssk.ksk.', '.ksssk.k..', '..kssk....', '..ksssk...', '...kssk...', '....kk....', '..........'],
  letras: ['..........', '.kkk......', 'kbbbk.....', 'kbkbk.kkk.', 'kbbbk.krrk', 'kbkbk.kkk.', 'kbkbk.krrk', '.....kkkk.', '..........', '..........'],
  teclado: ['..........', 'kkkkkkkkkk', 'kekekekekk', 'kkkkkkkkkk', 'kekekekekk', 'kkkkkkkkkk', 'kkeeeeeekk', 'kkkkkkkkkk', '..........', '..........'],
  meta: ['kkkkkkkk..', 'kwkkwkkwk.', 'kkwkkwkkk.', 'kwkkwkkwk.', 'kkkkkkkk..', 'k.........', 'k.........', 'k.........', 'k.........', 'k.........'],
  pollo: ['..kkkk....', '.kNNNNk...', 'kNNNNNNk..', 'kNNNNNNk..', 'kNNNNNNk..', '.kNNNNkk..', '..kkkkwk..', '.....kwk..', '....kwwk..', '.....kk...'],
  pez: ['..........', '...kkkk...', '.kkbbbbkk.', 'kbwkbbbbbk', 'kbbbbbbbkk', '.kkbbbbkbk', '...kkkk.kk', '..........', '..........', '..........'],
  carne: ['..........', '..kkkkk...', '.krrrrrkk.', 'krrwrrrrrk', 'krrrwwrrrk', 'krrrrrwrrk', '.krrrrrrk.', '..kkkkkk..', '..........', '..........'],
  manzana: ['.....k....', '....kgg...', '..kkkk....', '.krrrrkk..', 'krrwrrrrk.', 'krrrrrrrk.', 'krrrrrrrk.', '.krrrrrk..', '..kkkkk...', '..........'],
  pan: ['..........', '.......kk.', '......kNNk', '.....kNNk.', '....kNNk..', '...kNNk...', '..kNNk....', '.kNNk.....', 'kNNk......', '.kk.......'],
  queso: ['..........', '......kk..', '....kkyyk.', '..kkyyyyyk', 'kkyyyyyyyk', 'kyyyykyyyk', 'kyykyyyyyk', 'kyyyyyykyk', 'kkkkkkkkkk', '..........'],
  leche: ['...kkkk...', '...kbbk...', '..kwwwwk..', '.kwwwwwwk.', '.kbbbbbbk.', '.kbwwwwbk.', '.kbwwwwbk.', '.kbbbbbbk.', '.kwwwwwwk.', '.kkkkkkkk.'],
  naranja: ['....kgk...', '...kkkk...', '..kooook..', '.kooyoook.', '.koooooook', '.kooooook.', '.kooooook.', '..kooook..', '...kkkk...', '..........'],
  fresa: ['..kgggk...', '..kkkkk...', '.krrrrrk..', 'krwrrrwrk.', 'krrrwrrrk.', 'krwrrrwrk.', '.krrwrrk..', '..krrrk...', '...kkk....', '..........'],
  platano: ['........k.', '.......kk.', '.......kyk', '......kyyk', '.....kyyk.', '...kkyyyk.', 'kkkyyyyk..', '.kyyyykk..', '..kkkk....', '..........'],
  cafe: ['..k..k....', '...k..k...', '..........', 'kkkkkkkk..', 'kwwwwwwkkk', 'knnnnnnk.k', 'kwwwwwwkkk', '.kwwwwk...', 'kkkkkkkkk.', '..........'],
  plato: ['k........k', 'k..kkkk..k', 'k.kwwwwk.k', 'kkwweewwkk', 'k.kweewk.k', 'k.kwwwwk.k', 'k..kkkk..k', 'k........k', 'k........k', '..........'],
  circuloAzul: ['..........', '...kkkk...', '..kbbbbk..', '.kbwbbbbk.', '.kbbbbbbk.', '.kbbbbbbk.', '..kbbbbk..', '...kkkk...', '..........', '..........'],
  circuloRojo: ['..........', '...kkkk...', '..krrrrk..', '.krwrrrrk.', '.krrrrrrk.', '.krrrrrrk.', '..krrrrk..', '...kkkk...', '..........', '..........'],
  circuloVerde: ['..........', '...kkkk...', '..kggggk..', '.kgwggggk.', '.kggggggk.', '.kggggggk.', '..kggggk..', '...kkkk...', '..........', '..........'],
  diente: ['.kkk..kkk.', 'kwwwkkwwwk', 'kwwwwwwwwk', 'kwwwwwwwwk', 'kwwwwwwwwk', '.kwwwwwwk.', '.kwwkkwwk.', '.kwk..kwk.', '..k....k..', '..........'],
  enfermo: ['..kkkkkk..', '.kyyyyyyk.', 'kyykyykyyk', 'kyyyyyyyyk', 'kyyyyyyyyk', 'kyykkkkyyk', 'kyyyyyyyyk', '.kyyyyyykw', '..kkkkkkwe', '.......ee.'],
  abrigo: ['..kk..kk..', '.kNNkkNNk.', 'kNNNkkNNNk', 'kNNNNNNNNk', 'kNkNNkNNkN', 'kNkNNNNNkN', 'kNkNNkNNkN', 'kNkNNNNNkN', 'kkkNNNNNkk', '..kkkkkk..'],
  bufanda: ['..........', '.kkkkkkkk.', 'krrwrrwrrk', 'kkkkkkkkkk', '......krrk', '......kwwk', '......krrk', '......kwwk', '......kkkk', '..........'],
  paraguas: ['....kk....', '..kkvvkk..', '.kvvvvvvk.', 'kvvvvvvvvk', 'kkkkkkkkkk', '....k.....', '....k.....', '....k.....', '..k.k.....', '...k......'],
  balon: ['..kkkkkk..', '.kwwkkwwk.', 'kwwkkkkwwk', 'kkwwkkwwkk', 'kkkwwwwkkk', 'kwkwwwwkwk', 'kwwkkkkwwk', 'kwwkkkkwwk', '.kwwkkwwk.', '..kkkkkk..'],
  paleta: ['..kkkkkk..', '.kNNNNNNk.', 'kNrNNbNNNk', 'kNNNNNNyNk', 'kNgNNkkNNk', 'kNNNk..kNk', 'kNNNNkkNNk', '.kNNNNNNk.', '..kkkkkk..', '..........'],
  camara: ['..........', '..kkk.....', 'kkkkkkkkkk', 'keeekkkeek', 'keekBBkeek', 'keekBBkeek', 'keeekkeeek', 'keeeeeeeek', 'kkkkkkkkkk', '..........'],
  cama: ['..........', 'k.........', 'k.........', 'kkk.......', 'kwwkkkkkkk', 'kwwbbbbbbk', 'kkkkkkkkkk', 'k........k', 'k........k', '..........'],
  ciudad: ['......kkk.', '.kkk..kyk.', '.kyk..kkk.', '.kkkkkkyk.', '.kykkykkk.', '.kkkkkkyk.', '.kykkykkk.', '.kkkkkkyk.', 'oooooooooo', 'oooooooooo'],
  entrada: ['..........', 'kkkkkkkkkk', 'kyykyyyyyk', 'kyyykyyyyk', '.kyykyyyk.', '.kyykyyyk.', 'kyyykyyyyk', 'kyykyyyyyk', 'kkkkkkkkkk', '..........'],
  maleta: ['...kkkk...', '...k..k...', 'kkkkkkkkkk', 'knnnnnnnnk', 'kkkkkkkkkk', 'knnnnnnnnk', 'knnnyynnnk', 'knnnnnnnnk', 'kkkkkkkkkk', '.k......k.'],
  radio: ['......k...', '.....k....', 'kkkkkkkkkk', 'keekkkkeek', 'kekkeeekkk', 'keekkkkeek', 'kekkeeekkk', 'keekkkkeek', 'kkkkkkkkkk', '.k......k.'],
  megafono: ['........k.', '......kkk.', '....kkeek.', 'kkkkeeeek.', 'keeeeeeek.', 'keeeeeeek.', 'kkkkeeeek.', '..k.kkeek.', '..kk..kkk.', '........k.'],
};

// emoji (sin el selector de variación FE0F) → dibujo
const EMOJIS = {
  '🔊': 'altavoz', '🔉': 'altavoz', '📢': 'megafono', '📻': 'radio', '🔇': 'mudo', '✅': 'check', '⚠': 'aviso', '☁': 'nube',
  '🔥': 'fuego', '⚡': 'rayo', '👆': 'senalar', '👉': 'senalar', '👋': 'saludo', '🏆': 'copa', '🏅': 'medalla', '👑': 'corona',
  '💡': 'bombilla', '🏛': 'edificio', '🏦': 'edificio', '⛪': 'iglesia', '🏥': 'hospital', '🃏': 'cartas', '🎴': 'cartas',
  '🎉': 'fiesta', '🎇': 'destellos', '🔎': 'lupa', '🔍': 'lupa', '🕵': 'espia', '🎯': 'diana', '🎱': 'bola',
  '📖': 'libro', '📘': 'libroAzul', '📗': 'libroVerde', '📚': 'libros', '📒': 'cuaderno', '📝': 'papel', '🧾': 'papel',
  '📋': 'portapapeles', '🗃': 'caja', '🙈': 'ojoTapado', '👁': 'ojo', '🔒': 'candado', '🔑': 'llave', '⚙': 'engranaje',
  '📞': 'telefono', '🗑': 'papelera', '✉': 'sobre', '🗣': 'bocadillo', '💬': 'bocadillo', '🔔': 'campana', '⏰': 'despertador',
  '⏱': 'reloj', '⏳': 'arena', '🕒': 'reloj', '🕗': 'reloj', '🕚': 'reloj', '🕥': 'reloj', '🔁': 'repetir', '🎮': 'mando',
  '🧭': 'brujula', '✏': 'lapiz', '🖍': 'lapiz', '✍': 'lapiz', '💪': 'musculo', '📅': 'calendario', '🧩': 'puzle',
  '🧰': 'herramientas', '📦': 'caja', '🔧': 'llaveInglesa', '🌳': 'arbol', '🌱': 'brote', '🌿': 'brote', '🧠': 'cerebro',
  '🐢': 'tortuga', '⭐': 'estrella', '🌟': 'estrella', '✨': 'destellos', '💫': 'destellos', '⬇': 'flechaAbajo',
  '⬆': 'flechaArriba', '🗺': 'mapa', '🇪🇸': 'banderaEs', '🎓': 'birrete', '🎙': 'micro', '🎤': 'micro', '🎬': 'claqueta',
  '🎈': 'globo', '🛟': 'salvavidas', '🚦': 'semaforo', '🛒': 'carrito', '🚌': 'bus', '🚇': 'tren', '🚆': 'tren', '🚂': 'tren',
  '☀': 'sol', '🎒': 'mochila', '💰': 'dinero', '💳': 'tarjeta', '🏔': 'montana', '⛰': 'montana', '🌋': 'montana',
  '🦉': 'pajaro', '🐓': 'pajaro', '🎵': 'nota', '🎶': 'nota', '🎧': 'auriculares', '👨': 'persona', '🧑': 'persona',
  '👩': 'mujer', '👴': 'mayor', '👵': 'mayor', '👨‍👩‍👧': 'familia', '⏸': 'pausa', '⏹': 'parar', '💾': 'disquete',
  '🎭': 'mascaras', '🏮': 'farol', '👂': 'oreja', '🔤': 'letras', '⌨': 'teclado', '🏁': 'meta', '🍗': 'pollo', '🐟': 'pez',
  '🥩': 'carne', '🍎': 'manzana', '🥖': 'pan', '🧀': 'queso', '🥛': 'leche', '🍊': 'naranja', '🍓': 'fresa', '🍌': 'platano',
  '☕': 'cafe', '🍽': 'plato', '🔵': 'circuloAzul', '🔴': 'circuloRojo', '🟢': 'circuloVerde', '🦷': 'diente',
  '🤒': 'enfermo', '🤕': 'enfermo', '🧥': 'abrigo', '🧣': 'bufanda', '☂': 'paraguas', '⚽': 'balon', '🎨': 'paleta',
  '📷': 'camara', '🛏': 'cama', '🌇': 'ciudad', '🎫': 'entrada', '🧳': 'maleta', '💼': 'maleta', '👓': null,
};

// los símbolos tipográficos se quedan como letras
const TEXTO = new Set([...'✔✓✘✕✖★☆♀♂☾☐✦✗⌫♪♥▶◀▸▼▲→←↑↓©®™']);
const SECUENCIA = /\p{RI}\p{RI}|\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}️?|‍[\u{1F9B0}-\u{1F9B3}]|[\u{1F3FB}-\u{1F3FF}])*/gu;

const cache = new Map();
/** El SVG de un dibujo (filas de color seguidas juntas en un solo rectángulo). */
export function svgDe(nombre) {
  if (cache.has(nombre)) return cache.get(nombre);
  const filas = D[nombre];
  if (!filas) return null;
  let rects = '';
  filas.forEach((fila, y) => {
    for (let x = 0; x < 10;) {
      const color = fila[x];
      let fin = x + 1;
      while (fin < 10 && fila[fin] === color) fin += 1;
      if (color && color !== '.' && PALETA[color]) rects += `<rect x="${x}" y="${y}" width="${fin - x}" height="1" fill="${PALETA[color]}"/>`;
      x = fin;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" shape-rendering="crispEdges">${rects}</svg>`;
  cache.set(nombre, svg);
  return svg;
}

/** El dibujo que toca a un emoji (o a la primera de sus partes), o null si es un símbolo de texto. */
function dibujoDe(secuencia) {
  const limpio = secuencia.replace(/️/g, '');
  if (TEXTO.has(limpio)) return null;
  if (limpio in EMOJIS) return EMOJIS[limpio] ?? '';
  for (const parte of limpio.split('‍')) {
    const base = [...parte][0];
    if (base in EMOJIS) return EMOJIS[base] ?? '';
  }
  return undefined; // sin dibujo: se deja el emoji
}

const plantillas = new Map();
function nodoDe(nombre, etiqueta) {
  if (!plantillas.has(nombre)) {
    const t = document.createElement('template');
    t.innerHTML = svgDe(nombre).replace('<svg ', '<svg class="px-emoji" role="img" aria-hidden="true" ');
    plantillas.set(nombre, t.content.firstChild);
  }
  const svg = plantillas.get(nombre).cloneNode(true);
  if (etiqueta) svg.setAttribute('data-emoji', etiqueta);
  return svg;
}

const SALTAR = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'SELECT', 'TITLE', 'svg', 'CANVAS', 'NOSCRIPT']);
const posible = /[⌀-➿⬀-⯿\u{1F000}-\u{1FAFF}]/u;

function cambiarTexto(nodo) {
  const texto = nodo.data;
  if (!posible.test(texto)) return;
  const padre = nodo.parentNode;
  if (!padre || SALTAR.has(padre.nodeName) || padre.closest?.('[contenteditable], svg, .sin-pixeles')) return;
  SECUENCIA.lastIndex = 0;
  let m;
  let desde = 0;
  let trozos = null;
  while ((m = SECUENCIA.exec(texto))) {
    const nombre = dibujoDe(m[0]);
    if (nombre === undefined || nombre === null) continue;
    trozos ??= document.createDocumentFragment();
    if (m.index > desde) trozos.append(texto.slice(desde, m.index));
    if (nombre) trozos.append(nodoDe(nombre, m[0]));
    desde = m.index + m[0].length;
  }
  if (!trozos) return;
  if (desde < texto.length) trozos.append(texto.slice(desde));
  padre.replaceChild(trozos, nodo);
}

function recorrer(raiz) {
  if (raiz.nodeType === Node.TEXT_NODE) { cambiarTexto(raiz); return; }
  if (raiz.nodeType !== Node.ELEMENT_NODE || SALTAR.has(raiz.nodeName)) return;
  const andador = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  const textos = [];
  while (andador.nextNode()) if (posible.test(andador.currentNode.data)) textos.push(andador.currentNode);
  textos.forEach(cambiarTexto);
}

/** Cambia los emojis de la página por los dibujos y vigila lo que se pinte después. Se llama una vez al arrancar. */
export function ponerPixeles() {
  recorrer(document.body);
  new MutationObserver(cambios => {
    for (const c of cambios) {
      if (c.type === 'characterData') cambiarTexto(c.target);
      else c.addedNodes.forEach(recorrer);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
