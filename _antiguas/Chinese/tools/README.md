# Cómo añadir ejercicios (a mano)

## Frases (seis tipos de ejercicio) · lo más rápido

Archivo `data/hskN/frases.txt`, una frase por línea:

```
你好吗？ | Nǐ hǎo ma? | ¿Qué tal estás?
```

- Chino, pinyin y español, separados por `|`. Las líneas que empiezan por `#` se ignoran.
- Hacen falta al menos 4 frases por nivel (las opciones falsas salen de las demás).
- Las frases nuevas entran solas en el repaso, como mucho 10 nuevas al día por nivel.
- Si cambias el texto chino de una frase, cuenta como frase nueva y su progreso empieza de cero.
- Con cada frase la web prepara sola seis ejercicios: **¿qué oyes?**, **¿qué significa?** (sin texto chino), **¿sí o no?**, **hueco** (falta una palabra), **ordenar** (trozos desordenados) y **dictado** (escribirla en hanzi o en pinyin sin tonos). En **MEZCLA** van saliendo según lo bien que te sepas cada frase.
- Para que funcionen **hueco** y **ordenar**, escribe el pinyin con espacios entre palabras (`Wǒ hěn xǐhuan hē chá.`): cada palabra pinyin se empareja con sus caracteres. Los nombres propios, cada palabra con mayúscula (`Xiǎo Gāng`). Si una frase lleva números (`3点`), esos dos tipos se la saltan.

---

No hace falta instalar nada ni ejecutar ningún script: **la web encuentra sola los ejercicios nuevos**.

## Dónde van

Cada nivel tiene dos carpetas, una por tipo de ejercicio:

```
data/hsk1/lectura/   data/hsk1/escucha/
data/hsk2/lectura/   data/hsk2/escucha/
…
data/hsk6/lectura/   data/hsk6/escucha/
```

- **lectura** = comprensión escrita: se ve el texto.
- **escucha** = comprensión oral: el texto empieza oculto y se escucha.
- **escritura** (opcional, `data/hskN/escritura/`) = como la parte 书写 del examen: ordenar trozos de frase y escribir una redacción con palabras obligatorias. Tiene su propio formato, más corto: copia `tools/plantilla-escritura.json` (ver «Escritura» más abajo).

Dentro de cada carpeta, los archivos se numeran `001.json`, `002.json`… Cada carpeta empieza por `001`.

## Pasos

1. Copia la plantilla en la carpeta que toque, con el siguiente número libre:
   - lectura → `tools/plantilla-lectura.json`
   - escucha → `tools/plantilla-escucha.json`
   - Siempre con 3 cifras y **sin saltarte números**. La web busca en orden: si falta el 005, no verá el 006.
2. Ajusta `"id"` (igual que el nombre del archivo), `"level"` (1–6) y `"skill"` (`"lectura"` o `"escucha"`) para que coincidan con la carpeta.
3. Escribe el texto, las frases y las preguntas (formato abajo).
   - **Atajo:** abre `http://localhost:8000/tools/asistente.html`, escribe las frases con las palabras separadas por espacios (`我/sub 叫/verb 王小明/obj。`) y copia los tokens ya formateados. También te avisa de las palabras que no están en el diccionario, de los roles que faltan y de los 一/不 sin tono.
4. Abre la web con el servidor local (doble clic en `tools/servir.cmd`) y **recarga la página**.
   - Si el archivo tiene algún problema, la tarjeta sale en rojo con **ERROR**. Al abrirla verás la lista exacta de fallos, o la línea y la columna si el JSON está mal escrito.
   - Para revisar todo de golpe: abre `http://localhost:8000/tools/check.html`.
5. Sube el archivo a GitHub. En GitHub Pages aparecerá igual, sin tocar nada más.

## Formato de un ejercicio

| Campo | Qué es |
|---|---|
| `schema` | Siempre `1`. |
| `id` | `"002"`. Igual que el nombre del archivo. |
| `level` | Nivel HSK, del `1` al `6`. Opcional, pero si lo pones debe coincidir con la carpeta. |
| `skill` | `"lectura"` o `"escucha"`. Opcional, con la misma regla. |
| `title` | `{ "zh": "标题", "es": "Título" }` |
| `topic` | Tema en minúsculas: `sociedad`, `ciencia`, `cultura`, `vida cotidiana`… |
| `titleTokens` | El título troceado en palabras (igual que una frase). |
| `paragraphs` | Qué frases van en cada párrafo: `[[1, 2, 3], [4, 5]]`. Todas las frases, una vez, en orden. En los diálogos, un turno por párrafo: `[[1], [2], [3]]`. |
| `sentences` | Lista de frases (ver abajo). |
| `questions` | Lista de preguntas (ver abajo). |
| `audio` | **Solo escucha, opcional.** Nombre de un MP3 en la misma carpeta (`"001.mp3"`). Si no lo pones, la web lee el texto con la voz china del navegador. |

### Frase

```json
{
  "n": 1,
  "speaker": "男",
  "tokens": [ … ],
  "es": "Traducción natural.",
  "pattern": "Esqueleto con <b>negritas</b>.",
  "points": ["<b>Estructura</b>: explicación.", "…", "…"]
}
```

- `n`: 1, 2, 3… sin huecos.
- `speaker`: **opcional**, para diálogos. Se muestra como etiqueta y cambia la voz: `"男"` (hombre) suena más grave y `"女"` (mujer) más aguda. Sin `speaker`, voz normal (para monólogos).
- `points`: de 3 a 6. Solo se permiten las etiquetas `<b>` y `<i>`.

### Tokens en formato compacto (recomendado)

Toda la frase en **una sola línea**, palabras separadas por espacios:

```json
"tokens": "然而/con ， 这/sub 是/verb 一/attr/yí 个/attr/ge 例子/obj/lìzi/ejemplo 。"
```

- `palabra/rol` si la palabra ya está en el diccionario.
- `palabra/rol/pinyin` si solo cambia el pinyin (`一/attr/yí`).
- `palabra/rol/pinyin/español` si no está en el diccionario o significa otra cosa en ese contexto.
- Si el pinyin o el español llevan espacios, usa `_`: `很久/comp/hěn_jiǔ/mucho_tiempo`.
- La puntuación china se separa sola, aunque la pegues a la palabra (`学生/obj。`).
- Igual para el título: `"titleTokens": "《 我/attr 的/par 家/obj/jiā/familia 》"`.
- En las preguntas, `"answer"` puede ser la letra: `"answer": "C"`.

El formato largo de abajo (un objeto por palabra) sigue funcionando; puedes mezclar ambos.

### Token (formato largo, una palabra)

```json
{ "zh": "书店", "role": "obj" }
{ "zh": "一", "py": "yì", "role": "attr" }
{ "zh": "例子", "py": "lìzi", "es": "ejemplo", "role": "obj" }
{ "p": "，" }
```

- Un token es **una palabra**, no un carácter (`书店`, `不得不`, `年过六旬`).
- La puntuación va sola: `{ "p": "。" }`.
- **`py` (pinyin) y `es` (traducción):**
  - Si la palabra ya está en `data/dictionary.json` (compartido por todos los niveles), puedes omitirlos.
  - Si **no** está, **ponlos** en el token. Si faltan, la web te avisará.
  - Si en ese contexto significa otra cosa que en el diccionario, ponlos también: el token manda (p. ej. `在` = «estar + gerundio», `要` = «querer», `一` = `yí`/`yì`).
- Pinyin con el tono **real** (`yí ge`, `bú shì`) y el tono neutro sin marca (`de`, `le`). Sin números de tono.
- **`role`**, solo uno de estos 8:

| role | Función | Color |
|---|---|---|
| `sub` | Sujeto 主语 | rojo |
| `verb` | Verbo / predicado 谓语 | verde |
| `obj` | Objeto / núcleo 宾语 | azul |
| `adv` | Circunstancial 状语 | ámbar |
| `attr` | Modificador 定语 | morado |
| `comp` | Complemento 补语 | turquesa |
| `par` | Partícula 助词 | gris |
| `con` | Conector 连词 | rosa |

### Pregunta

```json
{
  "stem": "问题？",
  "stemEs": "¿Pregunta?",
  "answer": 2,
  "options": [
    { "zh": "…", "es": "…", "why": "Explicación con <b>cita</b>.", "evidence": 3 },
    …4 opciones en total…
  ]
}
```

- `answer`: la letra de la correcta, `"A"`–`"D"` (también vale 0–3). Varíala entre preguntas.
- Exactamente **4 opciones**, y todas llevan `why` (también la correcta).
- `evidence`: número de la frase que sirve de pista, o `null` si no la hay. En lectura activa «Ver la frase N»; en escucha, «▶ Escuchar la frase N».

## Escritura (书写)

Archivo en `data/hskN/escritura/NNN.json` (copia `tools/plantilla-escritura.json`). Tiene dos partes; puedes poner una sola.

- **`ordenar`**: lista de frases para ordenar.
  - `words`: los trozos, separados por espacios, tal como salen en el libro (`"挣了 出去 打工 这次 不少钱"`). La web los desordena sola.
  - `answer`: la frase correcta. Si vale más de un orden, pon una lista: `["她居然放弃了这次的机会。", "这次的机会她居然放弃了。"]`. La puntuación da igual al comparar.
  - `py`, `es`, `points` (opcionales): pinyin, traducción y gramática que la tutora enseña al resolverla.
- **`redaccion`**: el ejercicio de «写短文».
  - `words`: las palabras obligatorias con su pinyin y traducción: `"装修/zhuāngxiū/reformar 以来/yǐlái/desde_(que)"` (`_` = espacio).
  - `chars`: longitud aproximada (80 en HSK 5). `tips`: consejos (opcional). `model` y `modelEs`: texto modelo y su traducción (opcional).
- El texto que escribe el alumno se guarda solo, también en la cuenta y en la copia de seguridad.

## Orientación por nivel

| Nivel | Frases | Preguntas | Estilo |
|---|---|---|---|
| HSK 1–2 | 3–5 cortas | 3 | Presentaciones, compras, horarios. Vocabulario muy básico. |
| HSK 3–4 | 4–6 | 3–4 | Anécdotas, diálogos cotidianos, conectores sencillos (因为, 虽然…但是, 一…就). |
| HSK 5–6 | 5–10 | 4 | Artículos y reportajes, conectores formales, expresiones de cuatro caracteres, metáforas. |

## La voz en los ejercicios de escucha

La web usa la voz china que tenga instalada el navegador:
- **Edge** (Windows) trae voces chinas muy naturales. Es la mejor opción.
- **Chrome** trae una voz de Google en chino (necesita conexión a internet).
- Si no hay ninguna, la tutora avisa. En Windows puedes añadir el idioma chino en *Configuración → Hora e idioma → Idioma → Agregar un idioma → Chino (simplificado)*.
- Si prefieres una grabación real, pon el MP3 en la misma carpeta y añade `"audio": "001.mp3"` al ejercicio.

## Errores típicos al escribir JSON a mano

- **Coma de más o de menos**: entre elementos va una coma; después del último, **no**.
- Comillas rectas `"` para el JSON. Dentro del texto chino usa las chinas `“ ”`, y en español `« »`.
- Guarda el archivo en **UTF-8** (en el Bloc de notas: *Guardar como → Codificación: UTF-8*).
- Te recomiendo editar con **VS Code**: marca en rojo los errores de sintaxis mientras escribes.

## Herramientas opcionales (requieren Node.js)

Solo si algún día instalas Node; no hacen falta para que la web funcione.

- `node tools/validate.js`: lo mismo que `tools/check.html`, en la terminal.
- `node tools/update-dictionary.js [--strip]`: pasa al diccionario las palabras nuevas que tengan `py` y `es` en sus tokens. Con `--strip` quita de los tokens lo que ya repite el diccionario.
- `node tools/build-index.js`: crea un `index.json` en cada carpeta para que las listas carguen algo más rápido.
