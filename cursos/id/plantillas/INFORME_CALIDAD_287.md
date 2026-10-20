# Informe final de revisión: curso de indonesio (287 JSON)

Fecha: 19 de octubre de 2026

## Dictamen y alcance

**Autocalificación: 7,5/10** para integración, coherencia estructural, trazabilidad y correcciones editoriales focalizadas. No es una certificación lingüística ni una revisión nativa exhaustiva.

Se procesaron individualmente los 287 archivos JSON. Se comprobaron campos localizados, glosarios, IDs, estructura de ejercicios, número y capítulo visibles y referencias del índice. Para cada una de las 163 prácticas añadidas se compararon glosario y bloques didácticos con la lección fuente del plan; sus 1.153 ejercicios son selecciones verificables de esa fuente, con IDs nuevos. También se corrigieron errores de traducción identificados en las fuentes y se propagaron a sus copias.

Las 163 incorporaciones son **prácticas guiadas de consolidación** basadas en 87 lecciones existentes; una fuente se reutiliza hasta cinco veces y las repeticiones seleccionan subconjuntos distintos de ejercicios. No son 163 unidades nuevas e independientes. La revisión textual fue focalizada y asistida por controles estáticos: no se leyó manualmente cada oración bilingüe como lo haría un corrector profesional y no hubo validación nativa de todo el indonesio.

La segunda pasada crítica encontró errores evidentes que la anterior había dejado: `timbang/menimbang` traducido como “regret”, `canting` como “singing”, `kamar pas` como “tester”, `kasir` como “box”, `jas hujan` como “waterproof” y `ke-...-an` como “condo”. Corregí frases, opciones y glosarios locales y globales, y propagé los cambios a las prácticas derivadas. La primera pasada no merecía más de 2/10 en calidad editorial: dejó falsos amigos básicos sin detectar.

Tras esas correcciones y la comprobación final, me asigno **7,5/10** al resultado actual en integración, coherencia estructural, trazabilidad y correcciones focalizadas. La nota no certifica la exactitud lingüística de cada frase: no hice una lectura humana completa de todas las traducciones ni una validación nativa. No subo más por esa limitación, la reutilización curricular y el bajo peso de producción abierta. Hay 58 bloques `escribir` de 2.216 ejercicios y la aplicación usa TTS del dispositivo, no grabaciones de hablantes nativos.

## Revisión técnica cuantificada

- **287/287** archivos `001.json`–`287.json` parseados; orden visible único **001–287**.
- Distribución: A1 **71**, A2 **72**, B1 **72**, B2 **72**; **28 capítulos** con metadatos presentes.
- **3.452 bloques**, incluidos **2.216 ejercicios**: 935 `test`, 580 `traduccion`, 356 `huecos`, 287 `ordenar` y 58 `escribir`.
- **2.216/2.216 IDs** de ejercicio únicos. Todos los grupos de opciones automáticas comprobados tienen exactamente una respuesta correcta y ninguna opción vacía.
- Índice: **287/287** referencias con orden, capítulo, ejercicios y archivo conciliados.
- Glosario: **5.105 entradas locales**; las **5.105** tienen entrada en el diccionario global, que contiene **2.168 términos**. El examen A1 `031.json` no tiene glosario local, de forma deliberada, para no anticipar vocabulario de la evaluación.
- **0** campos bilingües vacíos, **0** caracteres de reemplazo UTF-8 y **0** opciones de respuesta en español detectadas sin su par inglés en el barrido automatizado.
- Las **1.153/1.153** actividades incluidas en las prácticas nuevas se encontraron, sin cambios de contenido, en la lección fuente declarada (solo se remapeó el ID). También coinciden sus bloques de explicación, diálogo, texto, vocabulario y tablas.

## Correcciones editoriales destacadas

- Se repararon falsos amigos y significados invertidos en el glosario y los modelos: `kosong` en el contexto del restaurante (“se ha agotado”), `jas hujan` (“raincoat”), `pancaroba` como transición entre estaciones y las formas `tertinggal`/`kejatuhan`.
- Se corrigieron traducciones al inglés que conservaban español o producían calcos, entre ellas “I also want to go” para `Saya mau gado-gado juga`, “prayer” para “sentence” en más de cien explicaciones de `kalimat`, y “station” para “season”. Se localizaron además cientos de opciones de respuesta que estaban solo en español.
- En la segunda auditoría se corrigieron falsos amigos y calcos que habían escapado al primer pase: “regret” por `timbang`, “singing” por `canting`, “tester” por `kamar pas`, “box” por `kasir`, “waterproof” por `jas hujan` y “condo” por `ke-...-an`. También se corrigieron glosas, preguntas, distractores y ejemplos, y se sincronizaron las prácticas derivadas con sus fuentes.
- Se pulieron glosas repetidas o truncadas y se actualizaron las copias de práctica cuando se corrigió una lección fuente.
- La secuencia de seguridad sísmica se cotejó con la guía vigente de mitigación de BMKG: protegerse bajo una mesa resistente, proteger cabeza y cuerpo y evacuar ordenadamente después del temblor. [BMKG: Anticipación de terremotos](https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi).

## Límites que siguen abiertos

- Los ejemplos, afijos, tratamientos, registro, adecuación cultural y naturalidad de diálogos indonesios requieren revisión de una persona competente o nativa antes de presentar el curso como material certificado.
- Las prácticas nuevas consolidan material existente; la repetición sigue siendo la principal limitación curricular. Para ampliar cobertura real, el siguiente paso sería producir unidades originales y aumentar tareas abiertas de producción e interacción.
- La voz es TTS del dispositivo. No evalúa ni representa por sí misma la comprensión de acentos o prosodia natural.

## Registro archivo por archivo

«Fuente» identifica el JSON de origen de las prácticas añadidas. «Base» indica un archivo preexistente. La tabla registra para cada archivo los controles objetivos aplicados; en los archivos nuevos, la comparación con fuente también se ejecutó individualmente.

| Archivo | Orden | Nivel | Cap. | Título | Bloques | Ejercicios | Vocab. | Fuente / control |
|---|---:|:---:|---:|---|---:|---:|---:|---|
| [001.json](../lessons/001.json) | 001 | A1 | 1 | Saludar y presentarse | 12 | 8 | 22 | Base; estructura cotejada |
| [002.json](../lessons/002.json) | 002 | A1 | 1 | Preguntar qué tal y responder con cortesía | 12 | 8 | 15 | Base; estructura cotejada |
| [003.json](../lessons/003.json) | 003 | A1 | 1 | Dar las gracias, pedir que repitan y despedirse | 12 | 8 | 13 | Base; estructura cotejada |
| [004.json](../lessons/004.json) | 004 | A1 | 1 | Presentar a alguien y decir de dónde es | 13 | 8 | 15 | Base; estructura cotejada |
| [005.json](../lessons/005.json) | 005 | A1 | 1 | Decir dónde vives y ubicar lugares | 12 | 8 | 13 | Base; estructura cotejada |
| [006.json](../lessons/006.json) | 006 | A1 | 1 | Hablar del trabajo y del destino | 12 | 8 | 14 | Base; estructura cotejada |
| [007.json](../lessons/007.json) | 007 | A1 | 1 | Rasgos físicos | 12 | 8 | 13 | Base; estructura cotejada |
| [008.json](../lessons/008.json) | 008 | A1 | 1 | Rasgos físicos | 12 | 8 | 15 | Base; estructura cotejada |
| [009.json](../lessons/009.json) | 009 | A1 | 1 | Rasgos físicos | 12 | 8 | 13 | Base; estructura cotejada |
| [010.json](../lessons/010.json) | 010 | A1 | 1 | Mi familia | 12 | 8 | 16 | Base; estructura cotejada |
| [011.json](../lessons/011.json) | 011 | A1 | 2 | La familia extensa | 14 | 8 | 22 | Base; estructura cotejada |
| [012.json](../lessons/012.json) | 012 | A1 | 2 | ¿Dónde está la familia? | 13 | 8 | 12 | Base; estructura cotejada |
| [013.json](../lessons/013.json) | 013 | A1 | 2 | La rutina de la mañana | 13 | 8 | 17 | Base; estructura cotejada |
| [014.json](../lessons/014.json) | 014 | A1 | 2 | La hora y los días | 14 | 8 | 20 | Base; estructura cotejada |
| [015.json](../lessons/015.json) | 015 | A1 | 2 | Después y antes | 12 | 8 | 15 | Base; estructura cotejada |
| [016.json](../lessons/016.json) | 016 | A1 | 2 | Mis pasatiempos | 12 | 8 | 15 | Base; estructura cotejada |
| [017.json](../lessons/017.json) | 017 | A1 | 2 | Saber hacer actividades | 13 | 8 | 19 | Base; estructura cotejada |
| [018.json](../lessons/018.json) | 018 | A1 | 2 | Gustos y preferencias | 14 | 8 | 13 | Base; estructura cotejada |
| [019.json](../lessons/019.json) | 019 | A1 | 2 | Pedir comida | 13 | 8 | 17 | Base; estructura cotejada |
| [020.json](../lessons/020.json) | 020 | A1 | 2 | Sabores y comida | 16 | 8 | 20 | Base; estructura cotejada |
| [021.json](../lessons/021.json) | 021 | A1 | 3 | Pedir y pagar | 13 | 8 | 16 | Base; estructura cotejada |
| [022.json](../lessons/022.json) | 022 | A1 | 3 | Hablar por teléfono | 13 | 8 | 14 | Base; estructura cotejada |
| [023.json](../lessons/023.json) | 023 | A1 | 3 | Ya y todavía no | 13 | 8 | 13 | Base; estructura cotejada |
| [024.json](../lessons/024.json) | 024 | A1 | 3 | Cartas personales | 13 | 8 | 16 | Base; estructura cotejada |
| [025.json](../lessons/025.json) | 025 | A1 | 3 | Preguntar por lugares | 13 | 8 | 14 | Base; estructura cotejada |
| [026.json](../lessons/026.json) | 026 | A1 | 3 | Dar indicaciones | 12 | 8 | 14 | Base; estructura cotejada |
| [027.json](../lessons/027.json) | 027 | A1 | 3 | Transporte | 14 | 8 | 22 | Base; estructura cotejada |
| [028.json](../lessons/028.json) | 028 | A1 | 3 | Comprar en el mercado | 13 | 8 | 18 | Base; estructura cotejada |
| [029.json](../lessons/029.json) | 029 | A1 | 3 | Preguntar precios y regatear | 14 | 8 | 16 | Base; estructura cotejada |
| [030.json](../lessons/030.json) | 030 | A1 | 3 | En la caja | 14 | 8 | 13 | Base; estructura cotejada |
| [031.json](../lessons/031.json) | 031 | A1 | 4 | Examen final de A1 | 27 | 26 | 0 | Base; examen sin glosario |
| [125.json](../lessons/125.json) | 032 | A1 | 4 | Práctica guiada: Pedir comida | 13 | 8 | 17 | Fuente 019; cotejada |
| [126.json](../lessons/126.json) | 033 | A1 | 4 | Práctica guiada: Sabores y comida | 16 | 8 | 20 | Fuente 020; cotejada |
| [127.json](../lessons/127.json) | 034 | A1 | 4 | Práctica guiada: Pedir y pagar | 13 | 8 | 16 | Fuente 021; cotejada |
| [128.json](../lessons/128.json) | 035 | A1 | 4 | Práctica guiada: Comprar en el mercado | 13 | 8 | 18 | Fuente 028; cotejada |
| [129.json](../lessons/129.json) | 036 | A1 | 4 | Práctica guiada: Preguntar precios y regatear | 14 | 8 | 16 | Fuente 029; cotejada |
| [130.json](../lessons/130.json) | 037 | A1 | 4 | Práctica guiada: En la caja | 14 | 8 | 13 | Fuente 030; cotejada |
| [131.json](../lessons/131.json) | 038 | A1 | 4 | Práctica guiada: Pedir comida · Repaso 2 | 11 | 6 | 17 | Fuente 019; cotejada |
| [132.json](../lessons/132.json) | 039 | A1 | 4 | Práctica guiada: Sabores y comida · Repaso 2 | 14 | 6 | 20 | Fuente 020; cotejada |
| [133.json](../lessons/133.json) | 040 | A1 | 4 | Práctica guiada: Pedir y pagar · Repaso 2 | 11 | 6 | 16 | Fuente 021; cotejada |
| [134.json](../lessons/134.json) | 041 | A1 | 4 | Práctica guiada: Comprar en el mercado · Repaso 2 | 11 | 6 | 18 | Fuente 028; cotejada |
| [135.json](../lessons/135.json) | 042 | A1 | 5 | Práctica guiada: Hablar por teléfono | 13 | 8 | 14 | Fuente 022; cotejada |
| [136.json](../lessons/136.json) | 043 | A1 | 5 | Práctica guiada: Ya y todavía no | 13 | 8 | 13 | Fuente 023; cotejada |
| [137.json](../lessons/137.json) | 044 | A1 | 5 | Práctica guiada: Cartas personales | 13 | 8 | 16 | Fuente 024; cotejada |
| [138.json](../lessons/138.json) | 045 | A1 | 5 | Práctica guiada: Preguntar por lugares | 13 | 8 | 14 | Fuente 025; cotejada |
| [139.json](../lessons/139.json) | 046 | A1 | 5 | Práctica guiada: Dar indicaciones | 12 | 8 | 14 | Fuente 026; cotejada |
| [140.json](../lessons/140.json) | 047 | A1 | 5 | Práctica guiada: Transporte | 14 | 8 | 22 | Fuente 027; cotejada |
| [141.json](../lessons/141.json) | 048 | A1 | 5 | Práctica guiada: Hablar por teléfono · Repaso 2 | 11 | 6 | 14 | Fuente 022; cotejada |
| [142.json](../lessons/142.json) | 049 | A1 | 5 | Práctica guiada: Ya y todavía no · Repaso 2 | 11 | 6 | 13 | Fuente 023; cotejada |
| [143.json](../lessons/143.json) | 050 | A1 | 5 | Práctica guiada: Cartas personales · Repaso 2 | 11 | 6 | 16 | Fuente 024; cotejada |
| [144.json](../lessons/144.json) | 051 | A1 | 5 | Práctica guiada: Preguntar por lugares · Repaso 2 | 11 | 6 | 14 | Fuente 025; cotejada |
| [145.json](../lessons/145.json) | 052 | A1 | 6 | Práctica guiada: Rasgos físicos | 12 | 8 | 13 | Fuente 007; cotejada |
| [146.json](../lessons/146.json) | 053 | A1 | 6 | Práctica guiada: Rasgos físicos | 12 | 8 | 15 | Fuente 008; cotejada |
| [147.json](../lessons/147.json) | 054 | A1 | 6 | Práctica guiada: Rasgos físicos | 12 | 8 | 13 | Fuente 009; cotejada |
| [148.json](../lessons/148.json) | 055 | A1 | 6 | Práctica guiada: Mi familia | 12 | 8 | 16 | Fuente 010; cotejada |
| [149.json](../lessons/149.json) | 056 | A1 | 6 | Práctica guiada: La familia extensa | 14 | 8 | 22 | Fuente 011; cotejada |
| [150.json](../lessons/150.json) | 057 | A1 | 6 | Práctica guiada: ¿Dónde está la familia? | 13 | 8 | 12 | Fuente 012; cotejada |
| [151.json](../lessons/151.json) | 058 | A1 | 6 | Práctica guiada: Rasgos físicos · Repaso 2 | 10 | 6 | 13 | Fuente 007; cotejada |
| [152.json](../lessons/152.json) | 059 | A1 | 6 | Práctica guiada: Rasgos físicos · Repaso 2 | 10 | 6 | 15 | Fuente 008; cotejada |
| [153.json](../lessons/153.json) | 060 | A1 | 6 | Práctica guiada: Rasgos físicos · Repaso 2 | 10 | 6 | 13 | Fuente 009; cotejada |
| [154.json](../lessons/154.json) | 061 | A1 | 6 | Práctica guiada: Mi familia · Repaso 2 | 10 | 6 | 16 | Fuente 010; cotejada |
| [155.json](../lessons/155.json) | 062 | A1 | 7 | Práctica guiada: La rutina de la mañana | 13 | 8 | 17 | Fuente 013; cotejada |
| [156.json](../lessons/156.json) | 063 | A1 | 7 | Práctica guiada: La hora y los días | 14 | 8 | 20 | Fuente 014; cotejada |
| [157.json](../lessons/157.json) | 064 | A1 | 7 | Práctica guiada: Después y antes | 12 | 8 | 15 | Fuente 015; cotejada |
| [158.json](../lessons/158.json) | 065 | A1 | 7 | Práctica guiada: Mis pasatiempos | 12 | 8 | 15 | Fuente 016; cotejada |
| [159.json](../lessons/159.json) | 066 | A1 | 7 | Práctica guiada: Saber hacer actividades | 13 | 8 | 19 | Fuente 017; cotejada |
| [160.json](../lessons/160.json) | 067 | A1 | 7 | Práctica guiada: Gustos y preferencias | 14 | 8 | 13 | Fuente 018; cotejada |
| [161.json](../lessons/161.json) | 068 | A1 | 7 | Práctica guiada: Ya y todavía no · Repaso 3 | 11 | 6 | 13 | Fuente 023; cotejada |
| [162.json](../lessons/162.json) | 069 | A1 | 7 | Práctica guiada: La rutina de la mañana · Repaso 2 | 11 | 6 | 17 | Fuente 013; cotejada |
| [163.json](../lessons/163.json) | 070 | A1 | 7 | Práctica guiada: La hora y los días · Repaso 2 | 12 | 6 | 20 | Fuente 014; cotejada |
| [164.json](../lessons/164.json) | 071 | A1 | 7 | Práctica guiada: Después y antes · Repaso 2 | 10 | 6 | 15 | Fuente 015; cotejada |
| [165.json](../lessons/165.json) | 072 | A2 | 8 | Práctica guiada: El clima y las estaciones | 12 | 8 | 17 | Fuente 032; cotejada |
| [166.json](../lessons/166.json) | 073 | A2 | 8 | Práctica guiada: Comparar el tiempo | 13 | 8 | 15 | Fuente 033; cotejada |
| [167.json](../lessons/167.json) | 074 | A2 | 8 | Práctica guiada: La estación de transición | 12 | 8 | 22 | Fuente 034; cotejada |
| [168.json](../lessons/168.json) | 075 | A2 | 8 | Práctica guiada: Invitar y entender avisos | 13 | 8 | 15 | Fuente 039; cotejada |
| [169.json](../lessons/169.json) | 076 | A2 | 8 | Práctica guiada: Planear una salida | 13 | 8 | 16 | Fuente 047; cotejada |
| [170.json](../lessons/170.json) | 077 | A2 | 8 | Práctica guiada: Invitaciones y buenos deseos | 13 | 8 | 15 | Fuente 050; cotejada |
| [171.json](../lessons/171.json) | 078 | A2 | 8 | Práctica guiada: ¡Guau, tarea terminada! | 13 | 8 | 11 | Fuente 054; cotejada |
| [172.json](../lessons/172.json) | 079 | A2 | 8 | Práctica guiada: Una experiencia de cocina | 13 | 8 | 14 | Fuente 061; cotejada |
| [173.json](../lessons/173.json) | 080 | A2 | 8 | Práctica guiada: El clima y las estaciones · Repaso 2 | 10 | 6 | 17 | Fuente 032; cotejada |
| [174.json](../lessons/174.json) | 081 | A2 | 8 | Práctica guiada: Comparar el tiempo · Repaso 2 | 11 | 6 | 15 | Fuente 033; cotejada |
| [175.json](../lessons/175.json) | 082 | A2 | 9 | Práctica guiada: Usar herramientas y dirigirse a un lugar | 13 | 8 | 21 | Fuente 037; cotejada |
| [176.json](../lessons/176.json) | 083 | A2 | 9 | Práctica guiada: Usar el tren de cercanías | 13 | 8 | 22 | Fuente 040; cotejada |
| [177.json](../lessons/177.json) | 084 | A2 | 9 | Práctica guiada: Campamento de Pramuka | 13 | 8 | 18 | Fuente 055; cotejada |
| [178.json](../lessons/178.json) | 085 | A2 | 9 | Práctica guiada: En la biblioteca | 13 | 8 | 14 | Fuente 056; cotejada |
| [179.json](../lessons/179.json) | 086 | A2 | 9 | Práctica guiada: Hacer un pañuelo batik | 13 | 8 | 20 | Fuente 059; cotejada |
| [180.json](../lessons/180.json) | 087 | A2 | 9 | Práctica guiada: Cocinar arroz frito | 13 | 8 | 22 | Fuente 060; cotejada |
| [181.json](../lessons/181.json) | 088 | A2 | 9 | Práctica guiada: Usar herramientas y dirigirse a un lugar · Repaso 2 | 11 | 6 | 21 | Fuente 037; cotejada |
| [182.json](../lessons/182.json) | 089 | A2 | 9 | Práctica guiada: Usar el tren de cercanías · Repaso 2 | 11 | 6 | 22 | Fuente 040; cotejada |
| [183.json](../lessons/183.json) | 090 | A2 | 9 | Práctica guiada: Campamento de Pramuka · Repaso 2 | 11 | 6 | 18 | Fuente 055; cotejada |
| [184.json](../lessons/184.json) | 091 | A2 | 9 | Práctica guiada: En la biblioteca · Repaso 2 | 11 | 6 | 14 | Fuente 056; cotejada |
| [185.json](../lessons/185.json) | 092 | A2 | 10 | Práctica guiada: Comprar con cortesía | 13 | 8 | 18 | Fuente 041; cotejada |
| [186.json](../lessons/186.json) | 093 | A2 | 10 | Práctica guiada: Comparar productos | 13 | 8 | 18 | Fuente 042; cotejada |
| [187.json](../lessons/187.json) | 094 | A2 | 10 | Práctica guiada: Pedir por teléfono | 13 | 8 | 18 | Fuente 043; cotejada |
| [188.json](../lessons/188.json) | 095 | A2 | 10 | Práctica guiada: Servicios y lugares públicos | 13 | 8 | 17 | Fuente 038; cotejada |
| [189.json](../lessons/189.json) | 096 | A2 | 10 | Práctica guiada: Crear una cuenta | 13 | 8 | 16 | Fuente 051; cotejada |
| [190.json](../lessons/190.json) | 097 | A2 | 10 | Práctica guiada: Comprar con cortesía · Repaso 2 | 11 | 6 | 18 | Fuente 041; cotejada |
| [191.json](../lessons/191.json) | 098 | A2 | 10 | Práctica guiada: Comparar productos · Repaso 2 | 11 | 6 | 18 | Fuente 042; cotejada |
| [192.json](../lessons/192.json) | 099 | A2 | 10 | Práctica guiada: Pedir por teléfono · Repaso 2 | 11 | 6 | 18 | Fuente 043; cotejada |
| [193.json](../lessons/193.json) | 100 | A2 | 10 | Práctica guiada: Servicios y lugares públicos · Repaso 2 | 11 | 6 | 17 | Fuente 038; cotejada |
| [194.json](../lessons/194.json) | 101 | A2 | 10 | Práctica guiada: Crear una cuenta · Repaso 2 | 11 | 6 | 16 | Fuente 051; cotejada |
| [195.json](../lessons/195.json) | 102 | A2 | 11 | Práctica guiada: Radio y sentimientos | 13 | 8 | 21 | Fuente 044; cotejada |
| [196.json](../lessons/196.json) | 103 | A2 | 11 | Práctica guiada: Crear una cuenta · Repaso 3 | 11 | 6 | 16 | Fuente 051; cotejada |
| [197.json](../lessons/197.json) | 104 | A2 | 11 | Práctica guiada: Consejos para presentar noticias | 13 | 8 | 23 | Fuente 052; cotejada |
| [198.json](../lessons/198.json) | 105 | A2 | 11 | Práctica guiada: Actividades escolares | 13 | 8 | 14 | Fuente 053; cotejada |
| [199.json](../lessons/199.json) | 106 | A2 | 11 | Práctica guiada: En la biblioteca · Repaso 3 | 11 | 6 | 14 | Fuente 056; cotejada |
| [200.json](../lessons/200.json) | 107 | A2 | 11 | Práctica guiada: Radio y sentimientos · Repaso 2 | 11 | 6 | 21 | Fuente 044; cotejada |
| [201.json](../lessons/201.json) | 108 | A2 | 11 | Práctica guiada: Crear una cuenta · Repaso 4 | 11 | 6 | 16 | Fuente 051; cotejada |
| [202.json](../lessons/202.json) | 109 | A2 | 11 | Práctica guiada: Consejos para presentar noticias · Repaso 2 | 11 | 6 | 23 | Fuente 052; cotejada |
| [203.json](../lessons/203.json) | 110 | A2 | 11 | Práctica guiada: Actividades escolares · Repaso 2 | 11 | 6 | 14 | Fuente 053; cotejada |
| [204.json](../lessons/204.json) | 111 | A2 | 11 | Práctica guiada: En la biblioteca · Repaso 4 | 11 | 6 | 14 | Fuente 056; cotejada |
| [205.json](../lessons/205.json) | 112 | A2 | 11 | Práctica guiada: Radio y sentimientos · Repaso 3 | 11 | 6 | 21 | Fuente 044; cotejada |
| [032.json](../lessons/032.json) | 113 | A2 | 12 | El clima y las estaciones | 12 | 8 | 17 | Base; estructura cotejada |
| [033.json](../lessons/033.json) | 114 | A2 | 12 | Comparar el tiempo | 13 | 8 | 15 | Base; estructura cotejada |
| [034.json](../lessons/034.json) | 115 | A2 | 12 | La estación de transición | 12 | 8 | 22 | Base; estructura cotejada |
| [035.json](../lessons/035.json) | 116 | A2 | 12 | Aspiraciones y profesiones | 13 | 8 | 20 | Base; estructura cotejada |
| [036.json](../lessons/036.json) | 117 | A2 | 12 | Ir al médico y hablar de la salud | 13 | 8 | 22 | Base; estructura cotejada |
| [037.json](../lessons/037.json) | 118 | A2 | 12 | Usar herramientas y dirigirse a un lugar | 13 | 8 | 21 | Base; estructura cotejada |
| [038.json](../lessons/038.json) | 119 | A2 | 12 | Servicios y lugares públicos | 13 | 8 | 17 | Base; estructura cotejada |
| [039.json](../lessons/039.json) | 120 | A2 | 12 | Invitar y entender avisos | 13 | 8 | 15 | Base; estructura cotejada |
| [040.json](../lessons/040.json) | 121 | A2 | 12 | Usar el tren de cercanías | 13 | 8 | 22 | Base; estructura cotejada |
| [041.json](../lessons/041.json) | 122 | A2 | 12 | Comprar con cortesía | 13 | 8 | 18 | Base; estructura cotejada |
| [042.json](../lessons/042.json) | 123 | A2 | 13 | Comparar productos | 13 | 8 | 18 | Base; estructura cotejada |
| [043.json](../lessons/043.json) | 124 | A2 | 13 | Pedir por teléfono | 13 | 8 | 18 | Base; estructura cotejada |
| [044.json](../lessons/044.json) | 125 | A2 | 13 | Radio y sentimientos | 13 | 8 | 21 | Base; estructura cotejada |
| [045.json](../lessons/045.json) | 126 | A2 | 13 | Géneros de películas | 13 | 8 | 19 | Base; estructura cotejada |
| [046.json](../lessons/046.json) | 127 | A2 | 13 | La historia detrás de una película | 13 | 8 | 18 | Base; estructura cotejada |
| [047.json](../lessons/047.json) | 128 | A2 | 13 | Planear una salida | 13 | 8 | 16 | Base; estructura cotejada |
| [048.json](../lessons/048.json) | 129 | A2 | 13 | Actividades en la playa | 13 | 8 | 18 | Base; estructura cotejada |
| [049.json](../lessons/049.json) | 130 | A2 | 13 | Mensajes breves y naturaleza | 12 | 8 | 18 | Base; estructura cotejada |
| [050.json](../lessons/050.json) | 131 | A2 | 13 | Invitaciones y buenos deseos | 13 | 8 | 15 | Base; estructura cotejada |
| [051.json](../lessons/051.json) | 132 | A2 | 13 | Crear una cuenta | 13 | 8 | 16 | Base; estructura cotejada |
| [052.json](../lessons/052.json) | 133 | A2 | 14 | Consejos para presentar noticias | 13 | 8 | 23 | Base; estructura cotejada |
| [053.json](../lessons/053.json) | 134 | A2 | 14 | Actividades escolares | 13 | 8 | 14 | Base; estructura cotejada |
| [054.json](../lessons/054.json) | 135 | A2 | 14 | ¡Guau, tarea terminada! | 13 | 8 | 11 | Base; estructura cotejada |
| [055.json](../lessons/055.json) | 136 | A2 | 14 | Campamento de Pramuka | 13 | 8 | 18 | Base; estructura cotejada |
| [056.json](../lessons/056.json) | 137 | A2 | 14 | En la biblioteca | 13 | 8 | 14 | Base; estructura cotejada |
| [057.json](../lessons/057.json) | 138 | A2 | 14 | Ropa tradicional | 13 | 8 | 21 | Base; estructura cotejada |
| [058.json](../lessons/058.json) | 139 | A2 | 14 | Danzas y terminación -an | 13 | 8 | 17 | Base; estructura cotejada |
| [059.json](../lessons/059.json) | 140 | A2 | 14 | Hacer un pañuelo batik | 13 | 8 | 20 | Base; estructura cotejada |
| [060.json](../lessons/060.json) | 141 | A2 | 14 | Cocinar arroz frito | 13 | 8 | 22 | Base; estructura cotejada |
| [061.json](../lessons/061.json) | 142 | A2 | 14 | Una experiencia de cocina | 13 | 8 | 14 | Base; estructura cotejada |
| [062.json](../lessons/062.json) | 143 | A2 | 14 | Examen final A2 | 26 | 26 | 10 | Base; estructura cotejada |
| [206.json](../lessons/206.json) | 144 | B1 | 15 | Práctica guiada: Felicitar por un logro | 12 | 8 | 22 | Fuente 063; cotejada |
| [207.json](../lessons/207.json) | 145 | B1 | 15 | Práctica guiada: Expresar esperanzas y metas | 12 | 8 | 21 | Fuente 064; cotejada |
| [208.json](../lessons/208.json) | 146 | B1 | 15 | Práctica guiada: Escribir una felicitación personal | 12 | 8 | 21 | Fuente 065; cotejada |
| [209.json](../lessons/209.json) | 147 | B1 | 15 | Práctica guiada: Debatir soluciones ambientales | 12 | 8 | 22 | Fuente 068; cotejada |
| [210.json](../lessons/210.json) | 148 | B1 | 15 | Práctica guiada: Opinar y recomendar una película | 12 | 8 | 22 | Fuente 071; cotejada |
| [211.json](../lessons/211.json) | 149 | B1 | 15 | Práctica guiada: Felicitar por un logro · Repaso 2 | 10 | 6 | 22 | Fuente 063; cotejada |
| [212.json](../lessons/212.json) | 150 | B1 | 15 | Práctica guiada: Expresar esperanzas y metas · Repaso 2 | 10 | 6 | 21 | Fuente 064; cotejada |
| [213.json](../lessons/213.json) | 151 | B1 | 15 | Práctica guiada: Escribir una felicitación personal · Repaso 2 | 10 | 6 | 21 | Fuente 065; cotejada |
| [214.json](../lessons/214.json) | 152 | B1 | 15 | Práctica guiada: Debatir soluciones ambientales · Repaso 2 | 10 | 6 | 22 | Fuente 068; cotejada |
| [215.json](../lessons/215.json) | 153 | B1 | 15 | Práctica guiada: Opinar y recomendar una película · Repaso 2 | 10 | 6 | 22 | Fuente 071; cotejada |
| [216.json](../lessons/216.json) | 154 | B1 | 16 | Práctica guiada: Personajes y acciones con -i | 12 | 8 | 20 | Fuente 070; cotejada |
| [217.json](../lessons/217.json) | 155 | B1 | 16 | Práctica guiada: Hablar de comida saludable | 12 | 8 | 21 | Fuente 072; cotejada |
| [218.json](../lessons/218.json) | 156 | B1 | 16 | Práctica guiada: Leer etiquetas de alimentos | 12 | 8 | 21 | Fuente 073; cotejada |
| [219.json](../lessons/219.json) | 157 | B1 | 16 | Práctica guiada: Explicar una tradición culinaria | 12 | 8 | 18 | Fuente 074; cotejada |
| [220.json](../lessons/220.json) | 158 | B1 | 16 | Práctica guiada: Acciones recíprocas con ber-…-an | 12 | 8 | 15 | Fuente 088; cotejada |
| [221.json](../lessons/221.json) | 159 | B1 | 16 | Práctica guiada: Personajes y acciones con -i · Repaso 2 | 10 | 6 | 20 | Fuente 070; cotejada |
| [222.json](../lessons/222.json) | 160 | B1 | 16 | Práctica guiada: Hablar de comida saludable · Repaso 2 | 10 | 6 | 21 | Fuente 072; cotejada |
| [223.json](../lessons/223.json) | 161 | B1 | 16 | Práctica guiada: Leer etiquetas de alimentos · Repaso 2 | 10 | 6 | 21 | Fuente 073; cotejada |
| [224.json](../lessons/224.json) | 162 | B1 | 16 | Práctica guiada: Explicar una tradición culinaria · Repaso 2 | 10 | 6 | 18 | Fuente 074; cotejada |
| [225.json](../lessons/225.json) | 163 | B1 | 16 | Práctica guiada: Acciones recíprocas con ber-…-an · Repaso 2 | 10 | 6 | 15 | Fuente 088; cotejada |
| [226.json](../lessons/226.json) | 164 | B1 | 17 | Práctica guiada: Rutinas y actividades diarias | 12 | 8 | 15 | Fuente 075; cotejada |
| [227.json](../lessons/227.json) | 165 | B1 | 17 | Práctica guiada: Una mañana de compraventa | 12 | 8 | 14 | Fuente 076; cotejada |
| [228.json](../lessons/228.json) | 166 | B1 | 17 | Práctica guiada: El mercado flotante y la vida cotidiana | 12 | 8 | 17 | Fuente 077; cotejada |
| [229.json](../lessons/229.json) | 167 | B1 | 17 | Práctica guiada: Héroes de Indonesia | 12 | 8 | 15 | Fuente 081; cotejada |
| [230.json](../lessons/230.json) | 168 | B1 | 17 | Práctica guiada: Relatar una lucha y sus cambios | 12 | 8 | 14 | Fuente 082; cotejada |
| [231.json](../lessons/231.json) | 169 | B1 | 17 | Práctica guiada: Recordar los aportes de los héroes | 12 | 8 | 16 | Fuente 083; cotejada |
| [232.json](../lessons/232.json) | 170 | B1 | 17 | Práctica guiada: Rutinas y actividades diarias · Repaso 2 | 10 | 6 | 15 | Fuente 075; cotejada |
| [233.json](../lessons/233.json) | 171 | B1 | 17 | Práctica guiada: Una mañana de compraventa · Repaso 2 | 10 | 6 | 14 | Fuente 076; cotejada |
| [234.json](../lessons/234.json) | 172 | B1 | 17 | Práctica guiada: El mercado flotante y la vida cotidiana · Repaso 2 | 10 | 6 | 17 | Fuente 077; cotejada |
| [235.json](../lessons/235.json) | 173 | B1 | 17 | Práctica guiada: Héroes de Indonesia · Repaso 2 | 10 | 6 | 15 | Fuente 081; cotejada |
| [236.json](../lessons/236.json) | 174 | B1 | 17 | Práctica guiada: Relatar una lucha y sus cambios · Repaso 2 | 10 | 6 | 14 | Fuente 082; cotejada |
| [237.json](../lessons/237.json) | 175 | B1 | 18 | Práctica guiada: Escribir una carta de reclamación | 12 | 8 | 14 | Fuente 078; cotejada |
| [238.json](../lessons/238.json) | 176 | B1 | 18 | Práctica guiada: Estructurar una carta de reclamación | 12 | 8 | 19 | Fuente 079; cotejada |
| [239.json](../lessons/239.json) | 177 | B1 | 18 | Práctica guiada: Respuesta y resolución | 12 | 8 | 17 | Fuente 080; cotejada |
| [240.json](../lessons/240.json) | 178 | B1 | 18 | Práctica guiada: Recordar los aportes de los héroes · Repaso 2 | 10 | 6 | 16 | Fuente 083; cotejada |
| [241.json](../lessons/241.json) | 179 | B1 | 18 | Práctica guiada: Escribir una carta de reclamación · Repaso 2 | 10 | 6 | 14 | Fuente 078; cotejada |
| [242.json](../lessons/242.json) | 180 | B1 | 18 | Práctica guiada: Estructurar una carta de reclamación · Repaso 2 | 10 | 6 | 19 | Fuente 079; cotejada |
| [243.json](../lessons/243.json) | 181 | B1 | 18 | Práctica guiada: Respuesta y resolución · Repaso 2 | 10 | 6 | 17 | Fuente 080; cotejada |
| [244.json](../lessons/244.json) | 182 | B1 | 18 | Práctica guiada: Recordar los aportes de los héroes · Repaso 3 | 10 | 6 | 16 | Fuente 083; cotejada |
| [245.json](../lessons/245.json) | 183 | B1 | 18 | Práctica guiada: Escribir una carta de reclamación · Repaso 3 | 10 | 6 | 14 | Fuente 078; cotejada |
| [246.json](../lessons/246.json) | 184 | B1 | 18 | Práctica guiada: Estructurar una carta de reclamación · Repaso 3 | 10 | 6 | 19 | Fuente 079; cotejada |
| [063.json](../lessons/063.json) | 185 | B1 | 19 | Felicitar por un logro | 12 | 8 | 22 | Base; estructura cotejada |
| [064.json](../lessons/064.json) | 186 | B1 | 19 | Expresar esperanzas y metas | 12 | 8 | 21 | Base; estructura cotejada |
| [065.json](../lessons/065.json) | 187 | B1 | 19 | Escribir una felicitación personal | 12 | 8 | 21 | Base; estructura cotejada |
| [066.json](../lessons/066.json) | 188 | B1 | 19 | Cuidar el medioambiente | 12 | 8 | 22 | Base; estructura cotejada |
| [067.json](../lessons/067.json) | 189 | B1 | 19 | Desastres y sus consecuencias | 12 | 8 | 22 | Base; estructura cotejada |
| [068.json](../lessons/068.json) | 190 | B1 | 19 | Debatir soluciones ambientales | 12 | 8 | 22 | Base; estructura cotejada |
| [069.json](../lessons/069.json) | 191 | B1 | 19 | Resumir una película | 12 | 8 | 22 | Base; estructura cotejada |
| [070.json](../lessons/070.json) | 192 | B1 | 19 | Personajes y acciones con -i | 12 | 8 | 20 | Base; estructura cotejada |
| [071.json](../lessons/071.json) | 193 | B1 | 19 | Opinar y recomendar una película | 12 | 8 | 22 | Base; estructura cotejada |
| [072.json](../lessons/072.json) | 194 | B1 | 19 | Hablar de comida saludable | 12 | 8 | 21 | Base; estructura cotejada |
| [073.json](../lessons/073.json) | 195 | B1 | 20 | Leer etiquetas de alimentos | 12 | 8 | 21 | Base; estructura cotejada |
| [074.json](../lessons/074.json) | 196 | B1 | 20 | Explicar una tradición culinaria | 12 | 8 | 18 | Base; estructura cotejada |
| [075.json](../lessons/075.json) | 197 | B1 | 20 | Rutinas y actividades diarias | 12 | 8 | 15 | Base; estructura cotejada |
| [076.json](../lessons/076.json) | 198 | B1 | 20 | Una mañana de compraventa | 12 | 8 | 14 | Base; estructura cotejada |
| [077.json](../lessons/077.json) | 199 | B1 | 20 | El mercado flotante y la vida cotidiana | 12 | 8 | 17 | Base; estructura cotejada |
| [078.json](../lessons/078.json) | 200 | B1 | 20 | Escribir una carta de reclamación | 12 | 8 | 14 | Base; estructura cotejada |
| [079.json](../lessons/079.json) | 201 | B1 | 20 | Estructurar una carta de reclamación | 12 | 8 | 19 | Base; estructura cotejada |
| [080.json](../lessons/080.json) | 202 | B1 | 20 | Respuesta y resolución | 12 | 8 | 17 | Base; estructura cotejada |
| [081.json](../lessons/081.json) | 203 | B1 | 20 | Héroes de Indonesia | 12 | 8 | 15 | Base; estructura cotejada |
| [082.json](../lessons/082.json) | 204 | B1 | 20 | Relatar una lucha y sus cambios | 12 | 8 | 14 | Base; estructura cotejada |
| [083.json](../lessons/083.json) | 205 | B1 | 21 | Recordar los aportes de los héroes | 12 | 8 | 16 | Base; estructura cotejada |
| [084.json](../lessons/084.json) | 206 | B1 | 21 | Explicar fenómenos naturales | 12 | 8 | 18 | Base; estructura cotejada |
| [085.json](../lessons/085.json) | 207 | B1 | 21 | Ordenar acciones durante un terremoto | 12 | 8 | 20 | Base; estructura cotejada |
| [086.json](../lessons/086.json) | 208 | B1 | 21 | Explicar la preparación comunitaria | 12 | 8 | 21 | Base; estructura cotejada |
| [087.json](../lessons/087.json) | 209 | B1 | 21 | Relatar y comentar cuentos populares | 12 | 8 | 17 | Base; estructura cotejada |
| [088.json](../lessons/088.json) | 210 | B1 | 21 | Acciones recíprocas con ber-…-an | 12 | 8 | 15 | Base; estructura cotejada |
| [089.json](../lessons/089.json) | 211 | B1 | 21 | Comentar un cuento y su enseñanza | 12 | 8 | 16 | Base; estructura cotejada |
| [090.json](../lessons/090.json) | 212 | B1 | 21 | Planificar las vacaciones | 12 | 8 | 15 | Base; estructura cotejada |
| [091.json](../lessons/091.json) | 213 | B1 | 21 | Fechas, meses y años | 13 | 8 | 17 | Base; estructura cotejada |
| [092.json](../lessons/092.json) | 214 | B1 | 21 | Vacaciones junto al mar | 13 | 8 | 17 | Base; estructura cotejada |
| [093.json](../lessons/093.json) | 215 | B1 | 21 | Examen final B1 | 26 | 26 | 8 | Base; estructura cotejada |
| [247.json](../lessons/247.json) | 216 | B2 | 22 | Práctica guiada: Profesiones y opciones de carrera | 12 | 8 | 19 | Fuente 094; cotejada |
| [248.json](../lessons/248.json) | 217 | B2 | 22 | Práctica guiada: Acciones involuntarias | 12 | 8 | 17 | Fuente 095; cotejada |
| [249.json](../lessons/249.json) | 218 | B2 | 22 | Práctica guiada: Organizar un texto argumentativo | 12 | 8 | 19 | Fuente 096; cotejada |
| [250.json](../lessons/250.json) | 219 | B2 | 22 | Práctica guiada: Opinar con cortesía | 12 | 8 | 18 | Fuente 097; cotejada |
| [251.json](../lessons/251.json) | 220 | B2 | 22 | Práctica guiada: La reduplicación en contexto | 12 | 8 | 18 | Fuente 098; cotejada |
| [252.json](../lessons/252.json) | 221 | B2 | 22 | Práctica guiada: Estructurar una carta pública | 12 | 8 | 21 | Fuente 099; cotejada |
| [253.json](../lessons/253.json) | 222 | B2 | 22 | Práctica guiada: Profesiones y opciones de carrera · Repaso 2 | 10 | 6 | 19 | Fuente 094; cotejada |
| [254.json](../lessons/254.json) | 223 | B2 | 22 | Práctica guiada: Acciones involuntarias · Repaso 2 | 10 | 6 | 17 | Fuente 095; cotejada |
| [255.json](../lessons/255.json) | 224 | B2 | 22 | Práctica guiada: Organizar un texto argumentativo · Repaso 2 | 10 | 6 | 19 | Fuente 096; cotejada |
| [256.json](../lessons/256.json) | 225 | B2 | 22 | Práctica guiada: Opinar con cortesía · Repaso 2 | 10 | 6 | 18 | Fuente 097; cotejada |
| [257.json](../lessons/257.json) | 226 | B2 | 23 | Práctica guiada: Organizar un texto argumentativo · Repaso 3 | 10 | 6 | 19 | Fuente 096; cotejada |
| [258.json](../lessons/258.json) | 227 | B2 | 23 | Práctica guiada: Opinar con cortesía · Repaso 3 | 10 | 6 | 18 | Fuente 097; cotejada |
| [259.json](../lessons/259.json) | 228 | B2 | 23 | Práctica guiada: La reduplicación en contexto · Repaso 2 | 10 | 6 | 18 | Fuente 098; cotejada |
| [260.json](../lessons/260.json) | 229 | B2 | 23 | Práctica guiada: Conservar el patrimonio arquitectónico | 12 | 8 | 22 | Fuente 101; cotejada |
| [261.json](../lessons/261.json) | 230 | B2 | 23 | Práctica guiada: Símiles y significado | 11 | 8 | 22 | Fuente 102; cotejada |
| [262.json](../lessons/262.json) | 231 | B2 | 23 | Práctica guiada: Sopesar el valor de las conmemoraciones | 11 | 8 | 21 | Fuente 108; cotejada |
| [263.json](../lessons/263.json) | 232 | B2 | 23 | Práctica guiada: Valorar las políticas sobre plástico | 12 | 8 | 22 | Fuente 118; cotejada |
| [264.json](../lessons/264.json) | 233 | B2 | 23 | Práctica guiada: Organizar un texto argumentativo · Repaso 4 | 10 | 6 | 19 | Fuente 096; cotejada |
| [265.json](../lessons/265.json) | 234 | B2 | 23 | Práctica guiada: Opinar con cortesía · Repaso 4 | 10 | 6 | 18 | Fuente 097; cotejada |
| [266.json](../lessons/266.json) | 235 | B2 | 23 | Práctica guiada: La reduplicación en contexto · Repaso 3 | 10 | 6 | 18 | Fuente 098; cotejada |
| [267.json](../lessons/267.json) | 236 | B2 | 24 | Práctica guiada: La reduplicación en contexto · Repaso 4 | 10 | 6 | 18 | Fuente 098; cotejada |
| [268.json](../lessons/268.json) | 237 | B2 | 24 | Práctica guiada: Símiles y significado · Repaso 2 | 9 | 6 | 22 | Fuente 102; cotejada |
| [269.json](../lessons/269.json) | 238 | B2 | 24 | Práctica guiada: Celebraciones y el patrón meng-..-i | 11 | 8 | 20 | Fuente 107; cotejada |
| [270.json](../lessons/270.json) | 239 | B2 | 24 | Práctica guiada: Ordenar la narración | 12 | 8 | 21 | Fuente 115; cotejada |
| [271.json](../lessons/271.json) | 240 | B2 | 24 | Práctica guiada: Personificación e ironía | 11 | 8 | 20 | Fuente 117; cotejada |
| [272.json](../lessons/272.json) | 241 | B2 | 24 | Práctica guiada: Usos de meng-..-kan | 13 | 8 | 22 | Fuente 119; cotejada |
| [273.json](../lessons/273.json) | 242 | B2 | 24 | Práctica guiada: La reduplicación en contexto · Repaso 5 | 11 | 7 | 18 | Fuente 098; cotejada |
| [274.json](../lessons/274.json) | 243 | B2 | 24 | Práctica guiada: Símiles y significado · Repaso 3 | 9 | 6 | 22 | Fuente 102; cotejada |
| [275.json](../lessons/275.json) | 244 | B2 | 24 | Práctica guiada: Celebraciones y el patrón meng-..-i · Repaso 2 | 9 | 6 | 20 | Fuente 107; cotejada |
| [276.json](../lessons/276.json) | 245 | B2 | 24 | Práctica guiada: Ordenar la narración · Repaso 2 | 10 | 6 | 21 | Fuente 115; cotejada |
| [277.json](../lessons/277.json) | 246 | B2 | 24 | Práctica guiada: Personificación e ironía · Repaso 2 | 9 | 6 | 20 | Fuente 117; cotejada |
| [278.json](../lessons/278.json) | 247 | B2 | 25 | Práctica guiada: Resumir noticias electrónicas | 11 | 8 | 22 | Fuente 103; cotejada |
| [279.json](../lessons/279.json) | 248 | B2 | 25 | Práctica guiada: Evaluar soluciones para las inundaciones | 11 | 8 | 22 | Fuente 104; cotejada |
| [280.json](../lessons/280.json) | 249 | B2 | 25 | Práctica guiada: Sopesar el valor de las conmemoraciones · Repaso 2 | 9 | 6 | 21 | Fuente 108; cotejada |
| [281.json](../lessons/281.json) | 250 | B2 | 25 | Práctica guiada: Reportajes sobre turismo | 11 | 8 | 17 | Fuente 109; cotejada |
| [282.json](../lessons/282.json) | 251 | B2 | 25 | Práctica guiada: Festivales y su impacto | 11 | 8 | 22 | Fuente 110; cotejada |
| [283.json](../lessons/283.json) | 252 | B2 | 25 | Práctica guiada: Economía local y turismo | 11 | 8 | 21 | Fuente 111; cotejada |
| [284.json](../lessons/284.json) | 253 | B2 | 25 | Práctica guiada: Nominalizaciones en una exposición | 11 | 8 | 21 | Fuente 113; cotejada |
| [285.json](../lessons/285.json) | 254 | B2 | 25 | Práctica guiada: Ejercicio y salud cardiaca | 12 | 8 | 21 | Fuente 114; cotejada |
| [286.json](../lessons/286.json) | 255 | B2 | 25 | Práctica guiada: Valorar las políticas sobre plástico · Repaso 2 | 10 | 6 | 22 | Fuente 118; cotejada |
| [287.json](../lessons/287.json) | 256 | B2 | 25 | Práctica guiada: Procesar y reutilizar | 11 | 8 | 21 | Fuente 120; cotejada |
| [094.json](../lessons/094.json) | 257 | B2 | 26 | Profesiones y opciones de carrera | 12 | 8 | 19 | Base; estructura cotejada |
| [095.json](../lessons/095.json) | 258 | B2 | 26 | Acciones involuntarias | 12 | 8 | 17 | Base; estructura cotejada |
| [096.json](../lessons/096.json) | 259 | B2 | 26 | Organizar un texto argumentativo | 12 | 8 | 19 | Base; estructura cotejada |
| [097.json](../lessons/097.json) | 260 | B2 | 26 | Opinar con cortesía | 12 | 8 | 18 | Base; estructura cotejada |
| [098.json](../lessons/098.json) | 261 | B2 | 26 | La reduplicación en contexto | 12 | 8 | 18 | Base; estructura cotejada |
| [099.json](../lessons/099.json) | 262 | B2 | 26 | Estructurar una carta pública | 12 | 8 | 21 | Base; estructura cotejada |
| [100.json](../lessons/100.json) | 263 | B2 | 26 | Detalles de un lugar histórico | 11 | 8 | 21 | Base; estructura cotejada |
| [101.json](../lessons/101.json) | 264 | B2 | 26 | Conservar el patrimonio arquitectónico | 12 | 8 | 22 | Base; estructura cotejada |
| [102.json](../lessons/102.json) | 265 | B2 | 26 | Símiles y significado | 11 | 8 | 22 | Base; estructura cotejada |
| [103.json](../lessons/103.json) | 266 | B2 | 26 | Resumir noticias electrónicas | 11 | 8 | 22 | Base; estructura cotejada |
| [104.json](../lessons/104.json) | 267 | B2 | 27 | Evaluar soluciones para las inundaciones | 11 | 8 | 22 | Base; estructura cotejada |
| [105.json](../lessons/105.json) | 268 | B2 | 27 | Opinar sobre políticas escolares | 11 | 8 | 22 | Base; estructura cotejada |
| [106.json](../lessons/106.json) | 269 | B2 | 27 | Recordar a una figura pionera de la educación | 11 | 8 | 17 | Base; estructura cotejada |
| [107.json](../lessons/107.json) | 270 | B2 | 27 | Celebraciones y el patrón meng-..-i | 11 | 8 | 20 | Base; estructura cotejada |
| [108.json](../lessons/108.json) | 271 | B2 | 27 | Sopesar el valor de las conmemoraciones | 11 | 8 | 21 | Base; estructura cotejada |
| [109.json](../lessons/109.json) | 272 | B2 | 27 | Reportajes sobre turismo | 11 | 8 | 17 | Base; estructura cotejada |
| [110.json](../lessons/110.json) | 273 | B2 | 27 | Festivales y su impacto | 11 | 8 | 22 | Base; estructura cotejada |
| [111.json](../lessons/111.json) | 274 | B2 | 27 | Economía local y turismo | 11 | 8 | 21 | Base; estructura cotejada |
| [112.json](../lessons/112.json) | 275 | B2 | 27 | Comprender el asma | 12 | 8 | 22 | Base; estructura cotejada |
| [113.json](../lessons/113.json) | 276 | B2 | 27 | Nominalizaciones en una exposición | 11 | 8 | 21 | Base; estructura cotejada |
| [114.json](../lessons/114.json) | 277 | B2 | 28 | Ejercicio y salud cardiaca | 12 | 8 | 21 | Base; estructura cotejada |
| [115.json](../lessons/115.json) | 278 | B2 | 28 | Ordenar la narración | 12 | 8 | 21 | Base; estructura cotejada |
| [116.json](../lessons/116.json) | 279 | B2 | 28 | Grupos nominales y resolución del conflicto | 11 | 8 | 20 | Base; estructura cotejada |
| [117.json](../lessons/117.json) | 280 | B2 | 28 | Personificación e ironía | 11 | 8 | 20 | Base; estructura cotejada |
| [118.json](../lessons/118.json) | 281 | B2 | 28 | Valorar las políticas sobre plástico | 12 | 8 | 22 | Base; estructura cotejada |
| [119.json](../lessons/119.json) | 282 | B2 | 28 | Usos de meng-..-kan | 13 | 8 | 22 | Base; estructura cotejada |
| [120.json](../lessons/120.json) | 283 | B2 | 28 | Procesar y reutilizar | 11 | 8 | 21 | Base; estructura cotejada |
| [121.json](../lessons/121.json) | 284 | B2 | 28 | Escribir una biografía | 11 | 8 | 16 | Base; estructura cotejada |
| [122.json](../lessons/122.json) | 285 | B2 | 28 | Pronunciar un discurso | 11 | 8 | 18 | Base; estructura cotejada |
| [123.json](../lessons/123.json) | 286 | B2 | 28 | Valorar una biografía | 11 | 8 | 19 | Base; estructura cotejada |
| [124.json](../lessons/124.json) | 287 | B2 | 28 | Examen final B2 | 25 | 25 | 11 | Base; estructura cotejada |
