# Fuentes de vocabulario HSK 2.0

## Fuente usada para planificar y asignar vocabulario

Instituto Confucio PUCP: <https://confucio.pucp.edu.pe/certificaciones/examenes/hsk/>

Los seis PDF `pucp-hsk1.pdf`–`pucp-hsk6.pdf` son las listas acumulativas de referencia. Esta serie es anidada y sirve como base única para calcular qué formas nuevas corresponden a cada nivel. Los totales publicados son 150, 300, 600, 1.200, 2.500 y 5.000 entradas.

La extracción conserva el orden de las filas y normaliza las variantes tipográficas de puntos suspensivos. Cada entrada se identifica por grafía y categoría gramatical; por eso se conservan pares como 对（形容词）/对（介词） y 花（名词）/花（动词）. Las seis listas declaran 150, 300, 600, 1.200, 2.500 y 5.000 filas, y la extracción recupera esos seis totales. «Grafías únicas» es menor cuando una forma escrita tiene más de una categoría; el JSON informa por separado filas, entradas léxicas y grafías.

| Nivel | Filas declaradas y recuperadas | Entradas léxicas | Grafías únicas | Con pinyin | Con glosa española |
|---|---:|---:|---:|---:|---:|
| HSK 1 | 150 | 150 | 150 | 150 | 141 |
| HSK 2 | 300 | 300 | 299 | 299 | 285 |
| HSK 3 | 600 | 600 | 594 | 596 | 572 |
| HSK 4 | 1.200 | 1.200 | 1.192 | 1.194 | 1.144 |
| HSK 5 | 2.500 | 2.500 | 2.492 | 2.432 | 1.147 |
| HSK 6 | 5.000 | 5.000 | 4.991 | 4.815 | 1.147 |

## Fuente complementaria de pinyin y glosas

Instituto Confucio Santo Tomás: <https://www.confucioust.cl/examen-hsk/>

Los PDF `hsk1.pdf`–`hsk6.pdf` se usan solo para añadir pinyin o glosas españolas cuando una entrada coincide con PUCP. Las listas de ambos institutos no son idénticas, así que no determinan la selección ni el nivel de asignación. Santo Tomás publica glosas españolas en HSK 1–4; sus listas HSK 5–6 ofrecen pinyin sin glosas españolas. Los campos sin dato coincidente se dejan vacíos; por ello las tablas de HSK 5–6 requieren una fuente de significado adicional antes de ser un glosario autosuficiente.

## Especificación del examen

La referencia de examen y descargas de Chinese Test Service está en <https://admin.chinesetest.cn/godownload.do>. La estructura del proyecto sigue el formato de seis niveles HSK 2.0 solicitado; no mezcla las listas de niveles de una revisión distinta.
