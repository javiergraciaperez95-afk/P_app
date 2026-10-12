# Formato del curso (lecciones de PORTUGUÉS)

Documentación interna para crear o convertir lecciones. La app enseña **portugués europeo**;
el **inglés** y el **vietnamita** son solo los idiomas de la interfaz y de las explicaciones.

Separación de responsabilidades:

| Qué | Dónde | Quién lo cambia |
|---|---|---|
| Contenido didáctico (unidades, lecciones, ejercicios) | `lessons/*.json`, `phrases/frases.json` | autores / conversión de materiales |
| Textos de la interfaz (botones, menús, mensajes) | `locales/en.json`, `locales/vi.json` | traducción de la interfaz |
| Lógica | `js/` | desarrollo |
| Catálogo y progreso en la nube | `supabase/esquema.sql`, `supabase/catalogo.sql` | se genera / se ejecuta en Supabase |

Ningún componente visual contiene contenido didáctico: añadir una unidad no exige tocar código.

## 1. Unidades: `lessons/curso.json`

```json
{
  "unidades": [
    {
      "id": "u01",
      "titulo": "Olá! Primeiros passos",
      "subtitulo": { "en": "Hello! First steps", "vi": "Xin chào! Những bước đầu tiên" },
      "descripcion": { "en": "…", "vi": "…" },
      "lecciones": ["u01-l01", "u01-l02"]
    }
  ]
}
```

- El **orden** de unidades y lecciones es el de este archivo.
- Cada id de lección es el nombre de su archivo: `lessons/u01-l01.json`.
- **Ids estables**: minúsculas, números, `-` y `_` (máx. 64). El progreso de los usuarios
  (local y en Supabase) se guarda por id: **no cambies ni reutilices un id** una vez publicado.
  Para reordenar, cambia el orden de la lista, no los ids.
- Las unidades de muestra usan los ids `sample-u1`, `sample-u2` y `sample-u*-l*`, para que el
  contenido definitivo use ids nuevos y no herede el progreso de las lecciones de prueba.
  Para quitarlas, basta con borrar sus entradas de `curso.json` y sus archivos.

## 2. Textos traducibles

Cualquier texto que no sea portugués (traducciones, explicaciones, preguntas…) se escribe así:

```json
{ "en": "Good morning", "vi": "Chào buổi sáng" }
```

Si falta un idioma se usa el inglés (y el validador avisa). Un texto simple `"…"` se muestra igual en los dos.
**Nunca** se escribe en estos campos el portugués que hay que aprender: ese va en los campos en portugués.

## 3. Lección: `lessons/<id>.json`

```json
{
  "titulo": "Olá! Bom dia!",
  "subtitulo": { "en": "Greetings and goodbyes", "vi": "Chào hỏi và tạm biệt" },
  "intro": { "en": "What the tutor says when the lesson opens", "vi": "…" },
  "palabras": { … },
  "bloques": [ … ]
}
```

Campos en portugués: `titulo`, las claves de `palabras`, `pt` de las frases, `frase`, `respuestas`, `audio`
y las opciones escritas como texto. El resto, traducible (`{ "en", "vi" }`).

### Palabras

```json
"palabras": {
  "obrigado": {
    "trad": { "en": "thank you (said by a man)", "vi": "cảm ơn (người nói là nam)" },
    "ipa": "obɾiˈɣaðu",
    "cat": "interjeccion",
    "genero": "m",
    "femenino": "obrigada",
    "plural": "…",
    "pron": { "en": "approximate pronunciation", "vi": "…" },
    "consejo": { "en": "pronunciation tip", "vi": "…" },
    "nota": { "en": "…", "vi": "…" },
    "ejemplo": "Muito obrigado!"
  },
  "de nada": { "en": "you're welcome", "vi": "không có gì" }
}
```

- Forma corta: `"palabra": { "en": "…", "vi": "…" }`.
- Las expresiones de varias palabras (`"bom dia"`) se reconocen en los diálogos y se pueden tocar.
- `genero`: `m`, `f` o `mf`. `cat` (y la función en `analisis`) puede ser una de estas claves, que
  se traducen solas: `sujeto, verbo, infinitivo, complemento, atributo, objeto, interrogativo, negacion,
  articulo, sustantivo, adjetivo, pronombre, reflexivo, posesivo, preposicion, adverbio, conjuncion,
  interjeccion, expresion, nombre, numero, saludo`; o un texto `{ "en", "vi" }`.

### Bloques de contenido

```json
{ "tipo": "explicacion", "titulo": { "en": "…", "vi": "…" },
  "texto": { "en": "Paragraph.\n\nAnother with **bold**.\n\n- list\n- items", "vi": "…" } }

{ "tipo": "dialogo", "titulo": { … }, "frases": [
  { "quien": "Rita", "pt": "Bom dia!", "trad": { "en": "Good morning!", "vi": "Chào buổi sáng!" },
    "literal": { … }, "nota": { … }, "pron": { … },
    "analisis": [["Bom dia", "saludo"]], "estructura": { … } }
] }

{ "tipo": "texto", … }            ← igual que «dialogo», para textos de lectura

{ "tipo": "vocabulario", "titulo": { … }, "palabras": ["olá", "bom dia"] }

{ "tipo": "tabla", "titulo": { … }, "columnas": [{ "en": "Person", "vi": "Ngôi" }, "ser"],
  "filas": [["eu", "**sou**", { "en": "I am", "vi": "tôi là" }]], "nota": { … } }

{ "tipo": "imagen", "archivo": "assets/img/lisboa.png", "descripcion": { … }, "pie": { … } }
```

`analisis` es opcional: `[["texto en portugués", "función", { glosa opcional }]]`.

### Ejercicios

Todos llevan **`"id"`** (estable, único en la lección): así el progreso se conserva aunque se corrija el texto.
Opcionales en todos: `"audio"` (texto en portugués que se escucha; `true` = la propia `frase`) y
`"tutora"` (expresión al fallar: normal, pensando, contenta, apurada, sorprendida, confundida).

```json
{ "tipo": "test", "id": "boa-tarde",
  "pregunta": { "en": "It is 4 p.m. How do you greet someone?", "vi": "…" },
  "opciones": { "Boa tarde": { "en": "explanation", "vi": "…" }, "Bom dia": { … } },
  "correcta": "Boa tarde" }

{ "tipo": "huecos", "id": "ser-eu-sou", "frase": "Eu ___ de Lisboa.",
  "opciones": { "sou": { … }, "és": { … } }, "correcta": "sou", "audio": true }

{ "tipo": "traduccion", "id": "ate-amanha", "frase": "Até amanhã!",
  "opciones": [
    { "texto": { "en": "See you tomorrow!", "vi": "Hẹn gặp lại ngày mai!" }, "correcta": true, "explicacion": { … } },
    { "texto": { "en": "Good morning!", "vi": "Chào buổi sáng!" } }
  ] }

{ "tipo": "escribir", "id": "escrever-nao", "pregunta": { "en": "Write in Portuguese: «no».", "vi": "…" },
  "respuestas": ["não"], "explicacion": { … } }

{ "tipo": "ordenar", "id": "ordenar-pao", "frase": "Um pão, por favor.",
  "traduccion": { "en": "A bread roll, please.", "vi": "…" }, "explicacion": { … } }
```

- Opciones en portugués: objeto `{ "texto": explicación }` o lista `["a", "b"]`, con `"correcta": "texto"`.
- Opciones en el idioma de la interfaz: lista de `{ "texto": { "en", "vi" }, "explicacion", "correcta": true }`.
- `escribir`: no importan mayúsculas ni signos; los acentos **sí** (si solo fallan los acentos o la ç, la tutora lo dice).
  Debajo aparecen botones para ã, õ, ç, á, à, â, é, ê, í, ó, ô, ú.

## 4. Frases útiles: `phrases/frases.json`

```json
{ "categorias": [
  { "titulo": { "en": "…", "vi": "…" }, "descripcion": { … },
    "frases": [ { "pt": "De nada.", "trad": { "en": "You're welcome.", "vi": "Không có gì." } } ],
    "grupos": [ { "titulo": { … }, "tarea": { … }, "leccion": "sample-u2-l2", "frases": [ … ] } ] }
] }
```

## 5. Incorporar los materiales definitivos (.txt y .json)

1. **Analizar antes de convertir**: leer los archivos recibidos y respetar fielmente su contenido
   didáctico (vocabulario, explicaciones, soluciones). Se interpretan como materiales para aprender
   portugués salvo que indiquen lo contrario. Variante por defecto: portugués europeo.
2. **Correspondencia** (orientativa, a confirmar con el formato real de los archivos):
   - tema / capítulo → entrada de `unidades` (id nuevo y estable, p. ej. `u01`);
   - apartado / lección → `lessons/u01-l01.json`;
   - listas de vocabulario → `palabras` + bloque `vocabulario`;
   - textos y diálogos → bloques `dialogo` / `texto` (una frase por línea, con su traducción);
   - teoría → bloques `explicacion` y `tabla`;
   - ejercicios con solución → `test`, `huecos`, `traduccion`, `escribir`, `ordenar` (con `id`).
3. Los `.json` que ya tengan otra estructura se transforman a este formato con un script de
   conversión específico (se escribirá cuando se conozca su estructura), nunca a mano en los componentes.
4. **Comprobar**: `npm run validar -- --estricto` (errores y avisos, en inglés; `--vi` en vietnamita) y `npm test`.
5. **Catálogo de Supabase**: `npm run catalogo-sql` y ejecutar `supabase/catalogo.sql` en el SQL Editor.
   Mientras una lección no esté en el catálogo, su progreso se guarda solo en el navegador (la app lo avisa).
6. Si se añade un archivo `.js` nuevo, añadirlo al `importmap` de `index.html`.

## 6. Errores típicos de JSON

- Comillas “curvas” (al copiar de Word): usar comillas rectas `"`.
- Coma antes de `}` o `]`: sobra.
- Falta una coma entre dos campos.
- Comentarios `//`: no se admiten.

La app y `npm run validar` dicen el archivo, la línea y una pista, sin romper el resto del curso.
