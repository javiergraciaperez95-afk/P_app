# 日本語 · Lecciones de japonés

Curso interactivo de japonés para hispanohablantes, con una tutora chibi en pixel art.
Web estática: HTML, CSS y JavaScript sin frameworks. Funciona en GitHub Pages.

De momento hay tres lecciones de muestra: saludos, presentarse y pedir un café.

## Secciones

- **Lecciones**: agrupadas por capítulos. Explicaciones, diálogos, palabras interactivas (con pronunciación para hispanohablantes), vocabulario y ejercicios. En los diálogos: «Solo escuchar» para ocultar el texto japonés.
- **Práctica**: tandas de ejercicios de oído al azar de todo el curso, y «Repasar mis fallos» (los ejercicios cuya última respuesta fue un error).
- **Frases**: unas pocas frases de las primeras lecciones. Botón «Tapar el japonés» para practicar.
- **Cuaderno**: lo que guardas con la estrella ☆ (palabras y frases). También puedes añadir palabras a mano y buscar en el **diccionario** de todo el curso.
- **Repaso** (el menú muestra cuántas tarjetas te tocan hoy): repetición espaciada al estilo Anki (Otra vez / Difícil / Bien / Fácil).
- **Perfil**: nombre, estadísticas, cuenta (registro, inicio de sesión, recuperar contraseña), ajustes (tema, sonidos, voz), copia de seguridad y reinicio del progreso.

## Probarlo en tu ordenador (Windows)

1. Descarga el proyecto (botón **Code → Download ZIP**) y descomprímelo.
2. Haz doble clic en **`start-server.cmd`**.
3. Se abre el navegador en `http://localhost:8000/`. Para pararlo, cierra la ventana negra.

No hace falta instalar Node ni Python: usa PowerShell, que ya viene con Windows.
Si abres `index.html` directamente, la web te avisará de que uses `start-server.cmd`.

## Publicarlo en GitHub Pages

Settings → Pages → *Deploy from a branch* → elige la rama y la carpeta `/ (root)` → Save.

## Añadir contenido

- **Lecciones**: crea `lessons/005.json`, `006.json`… La web las encuentra sola.
- **Capítulos**: `lessons/capitulos.json`.
- **Frases útiles**: `phrases/frases.json`.

La guía del formato está en [`notes/formato.md`](notes/formato.md).
Si un archivo tiene un error, la web lo indica (archivo, línea y pista) sin romper el resto.

## Cuentas y nube (Supabase)

Mientras `js/config.js` esté vacío, el progreso se guarda solo en el navegador.
Para activarlo:

1. En Supabase: **SQL Editor → New query**, pega el contenido de `supabase/esquema.sql` y pulsa **Run**.
   Crea una tabla nueva (`japones_progreso`) con seguridad por usuario (RLS). No toca `public.progress`.
2. En Supabase: **Project Settings → API**. Copia la *Project URL* y la clave **pública** (`anon` / `publishable`).
3. Pégalas en `js/config.js`. **Nunca** pongas la clave secreta (`service_role`).
4. En Supabase: **Authentication → URL Configuration**, añade la dirección de tu web de GitHub Pages
   (para que los correos de confirmación vuelvan a ella).

## Si añades un archivo JavaScript nuevo

Añádelo también a la lista `importmap` de `index.html`. Esa lista hace que, tras cada publicación,
el navegador descargue los archivos nuevos en vez de usar los antiguos que tenía guardados.

## Estructura

```text
index.html            página única
css/styles.css        estilos (modo oscuro y diurno)
js/app.js             arranque, menú y navegación
js/vistas/            una pantalla por archivo
js/lessons.js         carga y revisión de lecciones, capítulos y frases
js/progress.js        datos del estudiante (navegador)
js/sync.js            cuentas y nube (Supabase)
js/srs.js             algoritmo de repaso
js/tutor.js           cuadro de diálogo de la tutora
js/tutor-sprite.js    dibujo y animación de la tutora (canvas)
js/sonidos.js         efectos 8-bit y voz japonesa
lessons/  phrases/    contenido en JSON
notes/                formato y dudas lingüísticas
server/serve.ps1      servidor local para Windows
```

La fuente pixel es [Pixelify Sans](https://github.com/eifetx/Pixelify-Sans) (licencia OFL, ver `assets/fonts/OFL.txt`).
