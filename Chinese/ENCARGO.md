# ENCARGO · Biblioteca de lectura HSK 6 (pixel art)

> Este documento es el punto de partida de cada sesión. Léelo entero antes de tocar nada.
> Si algo de aquí choca con lo que veas en el código, **pregunta** antes de decidir.

---

## 1. Objetivo

Una web estática de ejercicios de **comprensión lectora HSK 6**, pensada para que no sea aburrida: una tutora en pixel art acompaña la lectura, explica palabras, gramática y errores.

Existe un **prototipo** funcional en `prototipo/hsk6-lectura.html` (un solo archivo, con un único ejercicio incrustado). Hay que convertirlo en:

- un **motor** pequeño que lee un ejercicio desde un JSON y lo dibuja;
- una **biblioteca de ~200 ejercicios**, cada uno en su propio JSON;
- todo publicable en **GitHub Pages** (sin servidor, sin backend, sin build obligatorio).

El usuario estudia chino y habla español. **Toda la interfaz y las explicaciones van en español.**

---

## 2. Decisiones ya tomadas (no reabrir sin motivo)

1. **Datos separados del motor.** El HTML/JS/CSS no contiene ejercicios; los ejercicios son JSON.
2. **Un JSON por ejercicio**, descargado solo cuando se elige (`fetch`), más un `index.json` ligero que se carga al abrir.
3. **Diccionario compartido** (`dictionary.json`) para no repetir pinyin y significados en cada ejercicio.
4. **JavaScript vanilla con módulos ES.** Sin frameworks, sin bundlers, sin dependencias en runtime.
5. **Progreso del usuario en `localStorage`.**
6. **Formato versionado** (`"schema": 1`).
7. **Validador** (`tools/validate.js`, Node) que se ejecuta antes de cada commit.
8. Alojamiento: **GitHub Pages**. Importante: abrir `index.html` con `file://` no funciona con `fetch`; para probar en local usar `python3 -m http.server` (o `npx serve`) en la raíz.

---

## 3. Estructura del repositorio

```
hsk6-lectura/
├── index.html
├── ENCARGO.md              (este documento; puede ser también CLAUDE.md)
├── prototipo/
│   └── hsk6-lectura.html   (referencia: NO se publica, NO se modifica)
├── css/
│   └── style.css
├── js/
│   ├── app.js              (arranque, menú de ejercicios, navegación)
│   ├── reader.js           (dibuja texto, preguntas, análisis de frases)
│   ├── tutor.js            (sprite pixel art + diálogo con máquina de escribir)
│   ├── progress.js         (localStorage: hechos, aciertos, fallos, repaso)
│   └── data.js             (fetch de index/dictionary/ejercicios con caché)
├── data/
│   ├── index.json
│   ├── dictionary.json
│   └── exercises/
│       ├── 001.json
│       └── ...
└── tools/
    ├── validate.js
    └── README.md           (cómo generar y validar un lote)
```

Nombres de archivo en minúsculas, numéricos con ceros (`001.json`), sin espacios.

---

## 4. Qué debe conservar el motor del prototipo

El prototipo es la **fuente de verdad del diseño y del comportamiento**. Migrar, no reinventar.

### 4.1 Funcionalidades (todas obligatorias)

1. **Tutora animada** en pixel art, siempre **abajo a la derecha**.
2. **Palabra → traducción.** Al pasar el ratón (o tocar en móvil) sobre una palabra, el cuadro de diálogo muestra hanzi, **pinyin** y **traducción al español** (la de ese contexto).
3. **Frase → análisis.** Cada frase empieza con un **sello numerado**. Al pulsarlo:
   - la frase se colorea por **función sintáctica** (sujeto, verbo, objeto, circunstancial, modificador, complemento, partícula, conector);
   - el diálogo muestra pinyin completo, traducción, **estructura** y varios **puntos de gramática**.
   - Pulsar de nuevo el mismo sello deselecciona. `Esc` también.
4. **Respuesta incorrecta → explicación.** Cada opción tiene su propia explicación del porqué es (in)correcta, y un botón **"Ver la frase N en el texto"** que hace scroll y resalta la frase de la pista.
5. **Texto arriba con barra de scroll** (pixelada). Las preguntas van al final del mismo scroll.
6. **Cuadro de diálogo debajo del texto**, con la tutora a su derecha.
7. Botón **"✦ traducir pregunta y opciones"** en cada pregunta.
8. Marcador de **aciertos a la primera** y de fallos; botón de reinicio.

### 4.2 Diseño visual

- Estética **pixel art**: bordes gruesos escalonados (`box-shadow`), sin bordes redondeados, sombras duras.
- Paleta: fondo verde muy oscuro con trama de píxeles; panel de texto **pergamino**; diálogo verde oscuro; acentos dorado y verde. Tokens CSS en `:root`, **con variante oscura** (`prefers-color-scheme` y `data-theme`).
- Tipografías: `Press Start 2P` solo para etiquetas cortas en ASCII; `Noto Sans SC` para chino; `Noto Sans` para español y pinyin (el pinyin lleva diacríticos que la fuente pixel no soporta).
- **Responsive real**: probar en 360 px de ancho. La tutora escala ×3 en móvil y ×4 en escritorio (siempre factor entero, `image-rendering: pixelated`).
- Respetar `viewport-fit=cover` y `env(safe-area-inset-*)`.
- Accesibilidad mínima: foco visible, botones reales, `prefers-reduced-motion`.

### 4.3 La tutora (sprite)

- Es un sprite **dibujado por código** sobre un `<canvas>` de 48×56 px (rectángulos de 1 px + pase automático de contorno). **Mover ese código a `tutor.js` tal cual**, sin rediseñarlo ni "mejorarlo".
- Personaje: chica de pelo rubio largo peinado hacia atrás con raya, ojos verdes, aros, túnica negra con forro verde, chaleco gris, corbata a rayas verdes. Gesto de superioridad.
- **No añadir escudos, logotipos ni marcas** de ninguna franquicia.
- Estados: `idle`, `think`, `happy` (chispas), `oops` (gota de sudor). Respira, parpadea, balancea el pelo y mueve la boca mientras habla.
- Personalidad al hablar: **segura de sí misma, algo vanidosa, pero cariñosa y didáctica**. Frases cortas. Nunca humilla al alumno.

---

## 5. Formato de datos

### 5.1 `data/index.json`

```json
{
  "schema": 1,
  "exercises": [
    {
      "id": "001",
      "file": "exercises/001.json",
      "title": "最后一家旧书店",
      "titleEs": "La última librería antigua",
      "topic": "sociedad",
      "sentences": 7,
      "questions": 4,
      "chars": 286,
      "added": "2026-10-02"
    }
  ]
}
```

El índice **se genera con un script** (`tools/build-index.js`) leyendo los ejercicios; no se edita a mano.

### 5.2 `data/exercises/NNN.json`

```json
{
  "schema": 1,
  "id": "001",
  "title": { "zh": "最后一家旧书店", "es": "La última librería antigua" },
  "topic": "sociedad",
  "titleTokens": [
    { "p": "《" },
    { "zh": "最后", "role": "attr" },
    { "zh": "一", "py": "yì", "es": "un, una", "role": "attr" },
    { "zh": "家", "role": "attr" },
    { "zh": "旧", "role": "attr" },
    { "zh": "书店", "role": "obj" },
    { "p": "》" }
  ],
  "paragraphs": [[1, 2, 3], [4, 5], [6, 7]],
  "sentences": [
    {
      "n": 1,
      "tokens": [
        { "zh": "在", "role": "adv" },
        { "zh": "这", "role": "attr" },
        { "zh": "座", "py": "zuò", "es": "(clasificador de ciudades y edificios grandes)", "role": "attr" },
        { "p": "，" }
      ],
      "es": "Traducción natural de la frase completa.",
      "pattern": "Estructura resumida con <b>negritas</b> en los elementos clave.",
      "points": [
        "<b>在……里</b>: explicación breve y concreta.",
        "<b>有</b>: otro punto de gramática."
      ]
    }
  ],
  "questions": [
    {
      "stem": "关于这家书店的店主，可以知道什么？",
      "stemEs": "¿Qué se puede saber sobre el dueño de esta librería?",
      "answer": 1,
      "options": [
        { "zh": "经常打折促销", "es": "A menudo hace descuentos", "why": "Explicación de por qué falla.", "evidence": 2 },
        { "zh": "不愿意做宣传", "es": "No quiere hacer publicidad", "why": "Explicación de por qué acierta.", "evidence": 2 }
      ]
    }
  ]
}
```

### 5.3 Reglas de los tokens

- Un token es **una palabra** (unidad de sentido HSK), no un carácter. `年过六旬`, `不得不`, `书店` son un token cada una.
- **Puntuación**: `{ "p": "，" }`. No lleva rol ni traducción.
- **`py` y `es` son opcionales.** Si faltan, se toman de `dictionary.json` por `zh`. Si están, **prevalecen** (sirve para homógrafos y significados contextuales: `地` partícula vs `dì`, `了` `le` vs `liǎo`, `得` `de`/`děi`).
- El `es` de un token es **la traducción en ese contexto**, breve. Las palabras gramaticales llevan una nota entre paréntesis: `(partícula estructural: une el modificador con el nombre)`, `(clasificador de tiendas)`.
- **Pinyin con tono real de pronunciación**: se escriben los cambios tonales de `一` y `不` (`yí wèi`, `yì jiā`, `bú shì`), y el tono neutro sin marca (`de`, `le`, `xiàlai`).
- **Roles permitidos:** `sub` (主语), `verb` (谓语), `obj` (宾语), `adv` (状语), `attr` (定语), `comp` (补语), `par` (助词/partícula), `con` (连词/conector). Ningún otro valor.
- Todo `n` de frase es único y consecutivo desde 1; `paragraphs` debe usar todas las frases exactamente una vez, en orden.

### 5.4 `data/dictionary.json`

```json
{
  "schema": 1,
  "entries": {
    "书店": { "py": "shūdiàn", "es": "librería" },
    "在":   { "py": "zài", "es": "en; estar en" }
  }
}
```

- Clave = `zh`. Solo la lectura/significado **más frecuente**; los casos especiales se resuelven con `py`/`es` en el token.
- Se **amplía automáticamente** con cada lote (ver §8), nunca se borra nada.
- Cuando el motor muestra un token, la prioridad es: token → diccionario → aviso en consola.

### 5.5 Progreso (`localStorage`)

Clave `hsk6.progress.v1`:

```json
{
  "001": { "done": true, "firstTry": 3, "total": 4, "errors": 1, "lastSeen": "2026-10-02", "wrongQuestions": [2] }
}
```

Con esto se pueden construir después: marca de "hecho" en el menú, **repaso de los fallados** y repaso espaciado. Si cambia la estructura, subir de versión la clave, no romper en silencio.

---

## 6. Criterios de calidad del contenido

### 6.1 Textos
- Inventados, **nivel HSK 6**, tono de artículo o reportaje breve.
- 6 a 10 frases, 300–500 caracteres. Variar temas (sociedad, ciencia, cultura, economía, vida cotidiana, historia…).
- Vocabulario y gramática de nivel alto: conectores formales (`然而`, `何况`, `以至于`), `被`, `把`, `让`, `一A再A`, complementos de resultado/dirección, expresiones de cuatro caracteres, metáforas.
- Nada ofensivo ni políticamente sensible. Nada copiado de fuentes reales.

### 6.2 Preguntas
- 4 por ejercicio (3–5 aceptable), tipo HSK: detalle, motivo, inferencia, sentido de una frase/metáfora, idea principal.
- Las opciones correctas **parafrasean** el texto; no lo copian.
- Cada pregunta mezcla **distintos tipos de distractor**: lo contrario de lo que dice el texto; información no mencionada; dato verdadero pero que no responde a la pregunta; exageración; lectura literal de una metáfora.
- **Cada opción** (también la correcta) lleva `why` en español, con la cita o palabra clave del texto en negrita, y `evidence` (nº de frase) cuando exista pista.
- La posición de la respuesta correcta debe **variar** entre preguntas y ejercicios.

### 6.3 Gramática y traducción
- `es` de frase: traducción natural en español, fiel, sin florituras.
- `pattern`: una línea con el esqueleto de la frase.
- `points`: 3–6 puntos, cada uno **concreto** (qué estructura, qué significa, cuándo se usa, error típico de hispanohablantes si lo hay). Sin relleno.
- Todo en español de España, claro, para un estudiante.

---

## 7. Validador (`tools/validate.js`)

Se ejecuta con `node tools/validate.js` (todo) o `node tools/validate.js data/exercises/012.json`. Debe devolver código de salida ≠ 0 si hay errores. Comprobaciones mínimas:

**Estructura**
- JSON válido, `schema` soportado, campos obligatorios presentes y con el tipo correcto.
- `id` coincide con el nombre del archivo; `id` único en toda la biblioteca.
- Frases numeradas 1..N sin huecos; `paragraphs` cubre todas exactamente una vez.

**Tokens**
- Cada token tiene `{p}` **o** `{zh, role}`.
- `role` pertenece a los 8 permitidos.
- Cada token con `zh` tiene `py` y `es` (propios o en el diccionario). Si no: **error**.
- `py` solo contiene letras latinas con diacríticos, espacios y apóstrofos (`’`); sin hanzi, sin dígitos de tono.
- Alerta (warning) si el `zh` de la frase reconstruida (concatenando tokens) no es razonable (vacía, solo puntuación…).

**Preguntas**
- `answer` es un índice válido; hay exactamente 4 opciones.
- Cada opción tiene `zh`, `es` y `why` no vacíos; `evidence` es `null` o un `n` existente.
- Warning si todas las respuestas correctas de un mismo ejercicio están en la misma posición.

**Contenido**
- Warning si una frase tiene menos de 3 `points`.
- Warning si hay HTML fuera de `<b>` e `<i>`.

Complementarios:
- `tools/build-index.js`: regenera `data/index.json` desde los ejercicios.
- `tools/update-dictionary.js`: añade al diccionario las palabras nuevas de un lote, **sin sobrescribir** las existentes y listando conflictos.

---

## 8. Flujo para producir un lote de ejercicios

1. El usuario indica **tema(s) y número de ejercicios** (lotes de 5–10).
2. Se redactan los textos y preguntas.
3. Se segmenta en palabras, se asignan roles y se escribe pinyin/traducción contextual.
4. Se ejecuta `update-dictionary.js` y después `validate.js`; **se corrigen todos los errores** antes de seguir.
5. Se ejecuta `build-index.js`.
6. Se hace commit con mensaje claro (`Añade ejercicios 011–020 (tema: ciencia)`).
7. El usuario **revisa una muestra** (2–3 ejercicios del lote) en la web y da feedback; se ajusta el estilo antes del siguiente lote.

**Regla de oro:** si hay duda sobre un matiz de traducción o gramática, **marcarlo** en una lista (`notes/dudas.md`) en lugar de inventar con seguridad.

---

## 9. Plan por fases

**Fase 1 · Motor y formato**
- Crear la estructura del repo.
- Convertir el prototipo en motor modular (§3, §4).
- Migrar el ejercicio del prototipo a `data/exercises/001.json`.
- Pantalla de **menú** (lista desde `index.json`, con marca de hecho) y navegación entre ejercicios (anterior/siguiente/volver).
- Escribir `validate.js`, `build-index.js`, `update-dictionary.js`.
- Crear 2 ejercicios más para probar variedad (002 y 003).
- **Parar y esperar revisión del usuario.**

**Fase 2 · Biblioteca**
- Producir ejercicios por lotes (§8) hasta 200.

**Fase 3 · Estudio**
- Repaso de preguntas falladas, repaso espaciado, vocabulario visto, estadísticas simples.

**Fase 4 · Extras (opcionales, preguntar antes)**
- PWA / uso sin conexión (service worker + fuentes propias en el repo).
- Filtros por tema, buscador, modo oscuro manual.

---

## 10. Despliegue

- Repositorio público o privado con **GitHub Pages** activado desde la rama `main`, carpeta raíz.
- Rutas **relativas** en todo (`./js/app.js`, `data/index.json`) para que funcione en `usuario.github.io/repositorio/`.
- No subir `tools/` a producción es opcional; no pasa nada si está.
- Tras cada despliegue, comprobar que carga el menú y un ejercicio.

---

## 11. Qué NO hacer

- No incrustar ejercicios en el HTML ni en el JS.
- No añadir frameworks, librerías de UI ni dependencias de runtime.
- No cambiar el diseño pixel art, la paleta ni el sprite sin consultar.
- No inventar roles gramaticales fuera de los 8 definidos.
- No generar todos los ejercicios de golpe: **siempre por lotes con revisión**.
- No borrar ni sobrescribir ejercicios existentes sin que el usuario lo pida.
- No dar por buena una traducción dudosa: marcarla.

---

## 12. Cómo trabajar con el usuario

- Responder en **español**, claro y directo.
- Antes de cambios grandes, resumir el plan en pocas líneas y esperar el visto bueno.
- Al terminar cada fase, explicar **qué se hizo, qué falta y cómo probarlo** (comando exacto para levantar el servidor local).
- El usuario no es programador: evitar jerga innecesaria y no asumir conocimientos de git.
