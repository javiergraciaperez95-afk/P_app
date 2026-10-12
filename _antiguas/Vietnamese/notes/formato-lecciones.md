# Cómo se escribe una lección

Cada lección es un archivo en la carpeta `lecciones/`, numerado: `001.json`, `002.json`, `003.json`…
La web los encuentra sola (deja de buscar cuando faltan 3 números seguidos).
Si algo está mal escrito, la web lo marca en rojo con la línea exacta: no se rompe.

## Esqueleto

```json
{
  "titulo": "Xin chào!",
  "tituloEs": "¡Hola!",

  "palabras": {
    "xin chào": "hola | sin chao↘",
    "học sinh": "estudiante | joc↓ sin | nota opcional"
  },

  "bloques": [
    { "tipo": "explicacion", ... },
    { "tipo": "dialogo", ... },
    { "tipo": "vocabulario", ... },
    { "tipo": "test", ... }
  ]
}
```

- **titulo** (vietnamita) y **tituloEs** (español): obligatorios.
- **palabras**: el diccionario de la lección. Una palabra por línea:
  `"palabra": "traducción | pronunciación | nota"` (la pronunciación y la nota son opcionales).
  - Las palabras de 2 o más sílabas se escriben tal cual, con su espacio: `"Việt Nam"`, `"học sinh"`.
  - Al mostrar una frase, la web agrupa sola las sílabas buscando en esta lista la palabra
    más larga posible (hasta 4 sílabas). Mayúsculas y minúsculas dan igual.
  - Si una palabra de una frase no está aquí, sale sin globo y se avisa al final de la lección.
- **bloques**: la lección, en orden, como las páginas del libro.
- **pronunciacion** (opcional): la web explica sola cómo suena cada palabra (sonido + tono) a
  partir de su ortografía. Si en alguna palabra prefieres tu propia explicación del sonido:
  `"pronunciacion": { "khỏe": "kh como una j suave; oe como «ue»" }` (el tono se sigue explicando solo).

## Tipos de bloque

### Explicación
```json
{ "tipo": "explicacion", "titulo": "Opcional", "texto": ["Párrafo 1", "Párrafo 2 con **negrita**"] }
```
`texto` puede ser un solo texto o una lista de párrafos.

### Diálogo / texto
```json
{ "tipo": "dialogo", "titulo": "Opcional", "frases": [
  { "quien": "Lan", "vi": "Chào em!", "es": "¡Hola!", "nota": "Explicación de gramática (opcional)" },
  { "vi": "Frase sin personaje.", "es": "Traducción." }
]}
```
Obligatorio: `vi` y `es`. Muy recomendado (si falta, la web avisa): `analisis`. Opcional: `quien` y `nota`.

**Análisis sintáctico** (`analisis`): trozos separados por `·`, cada uno `palabra: función (explicación)`.
```json
"analisis": "Em: sujeto (yo, el menor) · chào: verbo (saludar) · chị: complemento (a quién)"
```
El color de cada ficha sale de la primera palabra de la función:
- **sujeto** / **tema** → azul
- **verbo** / **predicado** → rojo
- **complemento** / **atributo** / **objeto** → verde
- cualquier otra (partícula, adverbio, conector, interrogativo…) → lila

Al pulsar el sello (?) la tutora explica: traducción → palabra por palabra → análisis → pronunciación → nota.
El botón «Ver traducción y análisis» muestra las fichas de colores bajo cada frase.

### Vocabulario
```json
{ "tipo": "vocabulario", "palabras": ["xin chào", "chào", "em"] }
```
Las palabras deben estar en el diccionario `palabras`. Si quitas la lista, salen todas.

### Ejercicios (3 tipos)
Las opciones van en una línea cada una: `"texto | explicación"`.
La buena lleva un **asterisco delante**. El orden se baraja solo al mostrarlas.

```json
{ "tipo": "test", "pregunta": "¿Cómo se dice «adiós»?", "opciones": [
  "*Tạm biệt | Eso es: «tạm biệt» = adiós.",
  "Xin chào | Eso es «hola»."
]}

{ "tipo": "traducir", "frase": "Chị cũng khỏe.", "opciones": [
  "*Yo también estoy bien. | Por qué es la buena.",
  "¿Estás bien? | Por qué no."
]}

{ "tipo": "hueco", "frase": "Em khỏe ___?", "es": "¿Estás bien?", "opciones": [
  "*không | Por qué es la buena.",
  "cũng | Por qué no."
]}
```
- `traducir`: la `pregunta` es opcional (por defecto: «¿Qué significa esta frase?»).
- `hueco`: el hueco se escribe `___` (uno solo por frase). `es` (pista en español) es opcional.
- Opcional en los tres: `"id": "saludo-1"`. Sirve para que el progreso no se descoloque si
  más adelante metes bloques nuevos en medio de una lección ya hecha. Si no lo pones, se usa
  la posición del bloque.

### Práctica de pronunciación (filas de sílabas para pulsar y oír)
```json
{ "tipo": "practica", "titulo": "Repite", "texto": "Opcional", "lineas": [
  "ba bá bà",
  "hai mươi mốt=21 · ba mươi=30"
]}
```
Se separan por espacios; si la fila lleva «·», se separa por «·» (palabras de varias sílabas).
`palabra=traducción` muestra la traducción debajo.

### Ejercicio de escucha (suena con la voz del navegador)
```json
{ "tipo": "escucha", "audio": "bá", "opciones": ["ba | plano", "*bá | sube", "bà | baja"] }
```

## Pronunciación aproximada (convención propuesta)
Letras a la española + flecha del tono: `↘` baja (à), `↗` sube (á), `↘↗` baja y sube (ả),
`~↗` sube quebrada (ã), `↓` corta y grave (ạ), sin flecha = llano (a). Acento del norte.

## Trucos para no romper el JSON
- Todo entre comillas dobles `"…"`. Las comillas españolas «…» sí se pueden usar dentro del texto.
- Coma entre elementos, pero **no** después del último antes de `}` o `]`.
- Guarda el archivo en UTF-8 (el Bloc de notas de Windows lo hace por defecto).
