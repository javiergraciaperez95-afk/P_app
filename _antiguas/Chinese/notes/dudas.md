# Dudas de traducción y gramática

Lista de decisiones discutibles que conviene revisar. Si alguna está mal, se corrige en el JSON.
Las rutas son relativas a `data/`.

## Segmentación y roles
- **很久** (`hsk6/lectura/001`, frase 7) va como una sola palabra, igual que en el prototipo. En rigor son dos (很 + 久).
- **家** en el diccionario figura como clasificador ("de tiendas y empresas"), siguiendo el ejemplo del encargo. Cuando significa «casa» o «familia» lleva `es` en el token (lo hacen `hsk1/lectura/001` y `hsk5/escucha/001`).
- **区域** y **书架** (`hsk6/lectura/002`, frases 3 y 4): marcados como `comp` porque forman parte del complemento de lugar (转移到…, 放回…). Se podría defender `obj`.
- **和** (`hsk6/lectura/003`, frase 2) marcado como `con` aunque esté dentro de un bloque circunstancial.
- Agente de la pasiva con 被: en `hsk6/lectura/001` (frase 1) el prototipo usaba `attr`, porque todo el bloque modifica a 书店. En `hsk6/lectura/002` (frase 6, 比…的人) y `hsk6/lectura/003` (frases 6 y 7) he usado `adv`, porque el bloque modifica al verbo. Hay que unificar el criterio.
- **Predicados sin verbo** (edad, precio, hora): `姐姐二十岁`, `二十块`, `多少钱` y `几点` llevan el número o el sustantivo final como `verb` («predicado»). Es lo coherente con 谓语, pero puede chocar al principio.
- **Saludos e interjecciones** (你好, 好 «vale», 对 «sí»): no encajan en ninguno de los 8 roles. 你好 va como `verb` y 好/对 como `con`.

## Pinyin
- **一个个** → `yí gègè`. Algunos materiales escriben `yí gège`.
- **离不开** → `lí bu kāi` (不 en tono neutro dentro del complemento potencial). Igual con **用不上** (`yòng bu shàng`).
- **待上** → `dāishang` (上 en tono neutro), igual que en el prototipo.
- **第一次** → `dì yī cì`. El guion habitual (`dì-yī`) no lo admite el validador.
- **不一样** → `bù yíyàng` (一 cambia a yí delante de 样; 不 se queda en bù).

## Traducción
- **供在博物馆里** (`hsk6/lectura/003`, frase 7): traducido como «guardarla en un museo como una reliquia». 供 implica veneración; quizá «tenerla en un altar» sea más fiel.

## Escucha
- La voz la genera el navegador, y su calidad depende del dispositivo (Edge suena mucho mejor que Chrome). Los cambios de tono de 一/不 y el tono neutro no siempre salen bien en la voz sintética.
