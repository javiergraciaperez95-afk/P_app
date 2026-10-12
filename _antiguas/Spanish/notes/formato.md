# Cómo escribir una lección

Cada lección es un archivo en `lessons/` con número de tres cifras: `001.json`, `002.json`…
La web las encuentra sola (se para cuando faltan 3 números seguidos).

## Idiomas

- Lo que se aprende (el español) va siempre en **`es`** (o en la clave de la palabra, en `palabras`).
- Las traducciones van en **`en`** (inglés) y **`vi`** (vietnamita).
- Cualquier otro texto para el estudiante (títulos, explicaciones, notas, preguntas, explicaciones de las opciones…)
  puede ser un texto normal, igual en los dos idiomas, o un grupo con los dos:

```json
"texto": { "en": "In Spanish we say **hola**.", "vi": "Trong tiếng Tây Ban Nha ta nói **hola**." }
```

Si falta un idioma, se muestra el inglés.

## Esqueleto

```json
{
  "capitulo": 1,
  "titulo_es": "¡Hola!",
  "titulo": { "en": "Greetings", "vi": "Chào hỏi" },
  "intro": { "en": "What the tutor says when the lesson opens (optional).", "vi": "…" },

  "palabras": {
    "hola": { "en": "hello", "vi": "xin chào", "pron": "O-la", "cat": { "en": "interjection", "vi": "thán từ" } },
    "gracias": { "en": "thank you", "vi": "cảm ơn" }
  },

  "bloques": [ … ]
}
```

Obligatorio: `titulo_es`, `titulo` y `bloques`. Todo lo demás es opcional.

## Palabras

Cada palabra se escribe **una sola vez** en `palabras`, con la palabra en español como clave.
En los diálogos se reconoce sola y se puede tocar. También vale una expresión de varias palabras: `"me llamo": { … }`.

| Campo | Qué es |
|---|---|
| `en`, `vi` | significado en inglés y en vietnamita |
| `pron` | pronunciación aproximada (MAYÚSCULAS = sílaba tónica) |
| `consejo` | una frase corta: cómo pronunciarla |
| `ipa` | transcripción IPA (opcional) |
| `cat` | tipo de palabra |
| `genero` | `m`, `f` o `m/f` |
| `plural`, `ejemplo`, `nota` | lo que haga falta |

## Bloques

```json
{ "tipo": "explicacion", "titulo": { "en": "…", "vi": "…" }, "texto": { "en": "Paragraph.\n\nAnother with **bold**.\n\n- a\n- list", "vi": "…" } }

{ "tipo": "dialogo", "titulo": { "en": "…", "vi": "…" }, "frases": [
  { "quien": "Ana", "es": "¡Hola!", "en": "Hello!", "vi": "Xin chào!", "literal": { "en": "…", "vi": "…" }, "nota": [{ "en": "…", "vi": "…" }] }
] }

{ "tipo": "vocabulario", "palabras": ["hola", "gracias"] }
```

`"tipo": "texto"` es igual que un diálogo, pero se presenta como un texto para leer.

## Análisis sintáctico (en cada frase)

Cada frase de un diálogo (y de las frases útiles) lleva su análisis: una lista de partes,
cada una con el trozo en español y su función. `estructura` es opcional y resume el esquema.

```json
{
  "es": "¿De dónde eres?",
  "en": "Where are you from?",
  "vi": "Bạn đến từ đâu?",
  "analisis": [
    ["¿De dónde", { "en": "interrogative (where from)", "vi": "từ để hỏi (từ đâu)" }],
    ["eres", { "en": "verb ser (you are)", "vi": "động từ ser (bạn là)" }]
  ],
  "estructura": { "en": "Question word + verb (subject is implied).", "vi": "Từ để hỏi + động từ (chủ ngữ ẩn)." }
}
```

El color de cada parte sale solo de la función, en cualquiera de los idiomas:
sujeto / subject / chủ ngữ, verbo / verb / động từ, complemento / object / tân ngữ, interrogativo / question / nghi vấn,
negación / negation / phủ định. Si falta el análisis o un trozo no aparece en la frase, la web lo avisa.

## Tablas e imágenes

```json
{
  "tipo": "tabla",
  "titulo": { "en": "The verb «ser» (to be)", "vi": "Động từ «ser» (thì, là)" },
  "columnas": [{ "en": "Person", "vi": "Ngôi" }, "ser"],
  "filas": [
    ["yo", "**soy**"],
    ["tú", "**eres**"]
  ],
  "nota": { "en": "…", "vi": "…" }
}

{ "tipo": "imagen", "archivo": "assets/img/mapa.png", "descripcion": { "en": "Map of Spain", "vi": "Bản đồ Tây Ban Nha" }, "pie": "…" }
```

Las casillas admiten **negrita** y pueden ser un texto o `{ "en", "vi" }`. Las imágenes se guardan en `assets/img/`.

## Ejercicios

Los tres tipos de elegir (`test`, `traduccion`, `huecos`) se escriben igual:

```json
{
  "tipo": "huecos",
  "frase": "Yo ___ de España.",
  "opciones": {
    "soy": { "en": "Origin uses «ser».", "vi": "Nói về nguồn gốc dùng «ser»." },
    "estoy": { "en": "«Estar» is for states and places, not origin.", "vi": "…" }
  },
  "correcta": "soy"
}
```

Cuando las opciones están en el idioma del estudiante (por ejemplo, «¿qué significa?»), se escriben como lista de grupos
y la correcta lleva `"correcta": true`:

```json
{
  "tipo": "traduccion",
  "frase": "Muchas gracias.",
  "opciones": [
    { "texto": { "en": "Thank you very much", "vi": "Cảm ơn rất nhiều" }, "correcta": true },
    { "texto": { "en": "You're welcome", "vi": "Không có gì" }, "explicacion": { "en": "That's «de nada».", "vi": "Đó là «de nada»." } }
  ]
}
```

- `pregunta`: obligatoria en `test`.
- `frase`: obligatoria en `huecos` (el hueco se escribe `___`).
- Las opciones se barajan solas.
- La tutora ya felicita sola: en la explicación de la opción correcta, explica, no hace falta «¡Bien!».
- `"tutora": "apurada"` cambia la expresión de la tutora cuando fallan (normal, pensando, contenta, apurada, sorprendida, confundida).
- `"id": "ej-saludos-1"` (opcional): si lo pones, el progreso de ese ejercicio se conserva aunque luego cambies el texto de la pregunta.

### Ejercicios de escuchar

Cualquier ejercicio admite `"audio": "texto en español"`: aparecen los botones 🔊 Escuchar, 🐢 Despacio y «Ver texto».
Con `"audio": true` en un ejercicio de huecos u ordenar, se lee la propia `frase` (en los huecos, con la respuesta correcta en su sitio).

### Escribir la respuesta

```json
{
  "tipo": "escribir",
  "pregunta": { "en": "Translate into Spanish: «My name is Ana».", "vi": "Dịch sang tiếng Tây Ban Nha: «Tôi tên là Ana»." },
  "respuestas": ["Me llamo Ana", "Soy Ana"],
  "explicacion": { "en": "…", "vi": "…" }
}
```

Se aceptan todas las `respuestas` de la lista. No importan las mayúsculas ni los signos (. , ? ! ¿ ¡).
Debajo aparecen botones para escribir á, é, í, ó, ú, ñ, ü, ¿ y ¡. Si el estudiante solo falla en las tildes o la ñ, la tutora se lo dice.

### Ordenar las palabras

```json
{
  "tipo": "ordenar",
  "frase": "¿De dónde eres?",
  "traduccion": { "en": "Where are you from?", "vi": "Bạn đến từ đâu?" },
  "explicacion": { "en": "…", "vi": "…" }
}
```

Las palabras de la `frase` se desordenan solas.

## Capítulos (`lessons/capitulos.json`)

```json
[
  { "numero": 1, "titulo_es": "Primeros pasos", "titulo": { "en": "First steps", "vi": "Những bước đầu tiên" }, "descripcion": { "en": "…", "vi": "…" } }
]
```

## Frases útiles (`phrases/frases.json`)

```json
{ "categorias": [
  { "titulo": { "en": "Politeness", "vi": "Phép lịch sự" }, "frases": [
    { "es": "De nada", "en": "You're welcome", "vi": "Không có gì", "pron": "de NA-da", "analisis": [["De nada", { "en": "set phrase", "vi": "cụm cố định" }]] }
  ] }
] }
```

Una categoría también puede tener `grupos` (tareas orales), cada uno con `titulo`, `tarea`, `leccion` (número de lección) y `frases`.

## Errores típicos

- Comillas “curvas” (al copiar de Word): usa siempre comillas rectas `"`.
- Coma antes de `}` o `]`: sobra.
- Falta una coma entre dos campos.

La web te dirá el archivo y la línea.

## Modo juego (opcional, por lección)

Una lección puede tener además un **juego**: la misma información en pasos cortos e interactivos, con la tutora en escena. Si existe, la lección se abre en modo juego y arriba hay un botón para pasar a la vista de libro (y al revés).

- El guion está en `juegos/NNN.json` y la lección debe aparecer en `juegos/index.json` (una lista de números: `["001"]`).
- El guion es una lista de `pasos`. Cada paso tiene `etapa` (nombre del tramo), `tipo`, `dice` (lo que dice la tutora al empezar) y los datos de ese tipo.
- Tipos de paso: `elige-pieza` (una pieza buena entre varias), `reloj` (arrastrar el sol; tramos del día), `descifra` (diálogo trozo a trozo), `rellena` (huecos con opciones), `rol` (contestar por un personaje), `cartas` (un mazo: se oye la palabra y se elige qué significa; `distractores` añade palabras para las opciones), `parejas` (unir palabra y significado), `elige` (preguntas rápidas), `reto` (un ejercicio de la lección), `mision` (la tarea libre) y `fin`.
- Segunda tanda (en `js/juego/escenas-b.js`): `presentate` (la persona escribe su nombre; `plantilla` con `{x}` y `preguntas`), `conversa` (ordenar las frases de un diálogo; un fallo reinicia), `mensajera` (la tutora camina por una escena y lleva cada frase a quien la diría; `personajes` con `id`, `nombre`, `icono`, `marca` ♀/♂ y `etiqueta`; `frases` con `quien` y `pista`), `maquina` (`ruedas` de palabras y `retos` con `solucion`), `globos` (explotar la palabra que significa lo pedido) y `lectura` (`texto` en líneas y `preguntas`: con `opciones`, o con `linea` para tocar la frase que lo demuestra).
- Tercera tanda (en `js/juego/escenas-c.js`): `mando` (frases fijas como botones y `situaciones` con `correcta`), `pizarra` (palabra con hueco; `antes`, `despues`, `correcta`, `opciones`, `oye`, `mal` por letra), `letras` (escribir la palabra tocando sus letras), `rayuela` (`nombres` de las casillas y `retos`), `velas` (poner la cantidad que dice la frase: `retos` con `es` y `n`), `telefono` (`nombres` de las cifras y `retos` con `quien` y `numero`), `bingo` (`numeros` y `cartones`), `parada` (`retos` con `es`, `buena` y `otras`) y `clasifica` (`cestas` y `cosas` con `cesta` y `por`). En `pizarra`, `rayuela`, `parada`, `clasifica` y `mensajera` la tutora sale a una escena.
- `explica` es la explicación, hecha juguete: `palancas`, cada una con `titulo`, `posiciones` (`etiqueta`, `es` con lo que cambia en `**negrita**`, `trad`) y `retos` (`pide`, `correcta`). Primero se prueban todas las posiciones; luego, misiones sin traducción ni etiquetas. Va delante de cualquier juego que use algo que aún no se ha enseñado: ningún juego debe dar nada por sabido.
- Para explicar hay varias formas y conviene alternarlas: `explica` con `control` (`deslizador` para arrastrar, `teclas` para un teclado de sonidos con misiones de oído: `retos` con `oye`), `paseo` (`sitios` con `donde`, `es`, `trad`: la tutora va a cada situación y dice lo que toca) y `detector` (`modelo` y `frases` con `ok` y `por`: ¿está bien dicho, sí o no?).
- `aduana` (juego único de la unidad 2): `viajeros` con `nombre`, `marca`, `de`, `oficio`, `es`, `ok` y `por`; se sella PASA solo si la frase es verdad y está bien dicha.
- Todo paso tiene que caber sin desplazar en un móvil de 375×667.
- En los textos solo vale `**negrita**`; la cursiva con un asterisco no se pinta (usar «comillas»).
- Los `reto` van repartidos, cada uno cerrando su tramo, no todos al final.
- `"bloque": 3` señala un bloque de la lección por su posición (el primero es el 0). Si se añaden o quitan bloques en la lección, hay que revisar esos números en el guion.
- Los `reto` usan los ejercicios de la lección, así que cuentan para el progreso igual que en el libro. En el juego hay que acertarlos para seguir.
- **Regla de oro:** ningún paso se completa solo por tocar. Siempre hay que acertar algo que exige haber leído, y lo que se falla vuelve más tarde (la carta al mazo, la pregunta al final). Pensar tiene que salir más barato que tocar al azar.
- El motor está en `js/juego/motor.js`, los tipos de paso en `js/juego/escenas.js` y la purpurina (chispas, confeti) en `js/juego/efectos.js`. La música de fondo y los sonidos se generan por código en `js/sonidos.js`; no hay archivos de audio.
- Las escenas avisan de cada acierto y fallo con `bien(nodo)` y `mal(nodo)`: el motor pone el sonido, las chispas y la racha.
