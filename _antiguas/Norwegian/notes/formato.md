# Cómo escribir una lección

El noruego se escribe en los campos `titulo_da` y `da`. El programa los lee con esos nombres.
Cada lección es un archivo en `lessons/` con número de tres cifras: `001.json`, `002.json`…
La web las encuentra sola (se para cuando faltan 3 números seguidos).

## Esqueleto

```json
{
  "capitulo": 1,
  "titulo_da": "Hej!",
  "titulo_es": "Saludos",
  "intro": "Lo que dice la tutora al abrir la lección (opcional).",

  "palabras": {
    "hej": { "es": "hola", "pron": "hai", "cat": "interjección" },
    "tak": "gracias"
  },

  "bloques": [ … ]
}
```

Obligatorio: `titulo_da`, `titulo_es` y `bloques`. Todo lo demás es opcional.

## Palabras

Cada palabra se escribe **una sola vez** en `palabras`. En los diálogos se reconoce sola y se puede tocar.
Puede ser solo el significado (`"tak": "gracias"`) o un grupo con:

| Campo | Qué es |
|---|---|
| `es` | significado en español |
| `pron` | pronunciación aproximada (MAYÚSCULAS = sílaba tónica) |
| `consejo` | una frase corta: cómo pronunciarla siendo hispanohablante |
| `ipa` | transcripción IPA (opcional) |
| `cat` | tipo de palabra |
| `genero` | `en` o `et` |
| `definida`, `plural`, `ejemplo`, `nota` | lo que haga falta |

También vale una expresión de varias palabras: `"mange tak": { … }`.

## Bloques

```json
{ "tipo": "explicacion", "titulo": "…", "texto": "Párrafo.\n\nOtro párrafo con **negrita**.\n\n- lista\n- de cosas" }

{ "tipo": "dialogo", "titulo": "…", "frases": [
  { "quien": "Anna", "da": "Hej!", "es": "¡Hola!", "literal": "…", "nota": ["nota 1", "nota 2"] }
] }

{ "tipo": "vocabulario", "palabras": ["hej", "tak"] }
```

## Análisis sintáctico (obligatorio en cada frase)

Cada frase de un diálogo (y de las frases útiles) lleva su análisis: una lista de partes,
cada una con el trozo en noruego y su función. `estructura` es opcional y resume el esquema.

```json
{
  "da": "Hvor kommer du fra?",
  "es": "¿De dónde eres?",
  "analisis": [
    ["Hvor", "adverbio interrogativo (dónde)"],
    ["kommer", "verbo (venir)"],
    ["du", "sujeto (tú)"],
    ["fra", "preposición (de, desde) al final"]
  ],
  "estructura": "Palabra interrogativa + verbo + sujeto + preposición."
}
```

El color de cada parte sale solo de la función: «sujeto», «verbo» o «infinitivo», «complemento»/«atributo»/«objeto»,
«interrogativo» y «negación». Si falta el análisis o un trozo no aparece en la frase, la web lo avisa.

## Tablas e imágenes

```json
{
  "tipo": "tabla",
  "titulo": "El verbo «være» (ser/estar)",
  "columnas": ["Persona", "Presente", "Pasado"],
  "filas": [
    ["jeg", "**er**", "var"],
    ["du", "**er**", "var"]
  ],
  "nota": "Igual para todas las personas."
}

{ "tipo": "imagen", "archivo": "assets/img/mapa.png", "descripcion": "Mapa de Dinamarca", "pie": "Texto opcional debajo" }
```

Las casillas de las tablas admiten **negrita**. Las imágenes se guardan en `assets/img/`.

## Ejercicios

Los tres tipos (`test`, `traduccion`, `huecos`) se escriben igual:

```json
{
  "tipo": "huecos",
  "frase": "Jeg ___ fra Spanien.",
  "opciones": {
    "er": "Explicación que se muestra si eligen esta.",
    "har": "Por qué esta no es correcta."
  },
  "correcta": "er"
}
```

- `pregunta`: obligatoria en `test`.
- `frase`: obligatoria en `huecos` (el hueco se escribe `___`).
- Las opciones se barajan solas. La correcta se indica por su texto.
- La tutora ya felicita sola: en la explicación de la opción correcta, explica, no hace falta «¡Bien!».
- `"tutora": "apurada"` cambia la expresión de la tutora cuando fallan (normal, pensando, contenta, apurada, sorprendida, confundida).
- `"id": "ej-saludos-1"` (opcional): si lo pones, el progreso de ese ejercicio se conserva aunque luego cambies el texto de la pregunta.

### Ejercicios de escuchar

Cualquier ejercicio admite `"audio": "texto en noruego"`: aparecen los botones 🔊 Escuchar, 🐢 Despacio y «Ver texto».
Con `"audio": true` en un ejercicio de huecos u ordenar, se lee la propia `frase` (en los huecos, con la respuesta correcta en su sitio: se escucha y se elige).

### Escribir la respuesta

```json
{
  "tipo": "escribir",
  "pregunta": "Traduce al noruego: «Me llamo Ana».",
  "respuestas": ["Jeg hedder Ana"],
  "explicacion": "Sujeto + verbo + nombre."
}
```

Se aceptan todas las `respuestas` de la lista. No importan las mayúsculas ni los signos (. , ? !).
Debajo aparecen botones para escribir æ, ø y å. Si el estudiante falla por una letra, la tutora se lo dice.

### Ordenar las palabras

```json
{
  "tipo": "ordenar",
  "frase": "Hvor kommer du fra?",
  "traduccion": "¿De dónde eres?",
  "explicacion": "La preposición «fra» va al final."
}
```

Las palabras de la `frase` se desordenan solas.

## Capítulos (`lessons/capitulos.json`)

```json
[
  { "numero": 1, "titulo_da": "Første skridt", "titulo_es": "Primeros pasos", "descripcion": "…" }
]
```

## Frases útiles (`phrases/frases.json`)

```json
{ "categorias": [
  { "titulo": "Cortesía", "frases": [ { "da": "Selv tak", "es": "De nada", "pron": "sel tak", "nota": "…" } ] }
] }
```

## Errores típicos

- Comillas “curvas” (al copiar de Word): usa siempre comillas rectas `"`.
- Coma antes de `}` o `]`: sobra.
- Falta una coma entre dos campos.

La web te dirá el archivo y la línea.
