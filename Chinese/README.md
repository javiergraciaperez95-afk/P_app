# HSK · 阅读小屋

Ejercicios de chino del HSK 1 al HSK 6 con una tutora en pixel art que explica palabras, gramática y errores. Web estática para GitHub Pages, sin dependencias. Cuentas opcionales con Supabase.

Al abrirla se elige el **nivel** (HSK 1–6) y luego el **tipo**:
- **Lectura**: textos con análisis de frases y preguntas.
- **Escucha**: textos con audio, el texto empieza oculto.
- **Frases**: dictado tipo test con repetición espaciada.

Además: cuaderno de vocabulario con repaso tipo Anki, perfil, cuenta en la nube y copia de seguridad.

## Probar en local (Windows)

Doble clic en `tools/servir.cmd`. Se abre `http://localhost:8000`. Para pararlo, cierra la ventana negra.

> Abrir `index.html` directamente con doble clic **no funciona**: el navegador bloquea la carga de los ejercicios desde `file://`.
>
> La voz china la pone el navegador: usa **Microsoft Edge**. Si no suena, la web enlaza a la pantalla «Cómo activar la voz».

## Añadir contenido

- **Textos**: JSON en `data/hskN/lectura/` o `data/hskN/escucha/` (`001.json`, `002.json`…), a partir de las plantillas de `tools/`.
- **Frases**: `data/hskN/frases.txt`, una por línea: `中文 | pinyin | español`.

Recarga la web y aparecen solos. Formato, consejos y asistente en [tools/README.md](tools/README.md).

## Cuentas (Supabase)

`js/config.js` contiene la URL y la clave pública del proyecto. La tabla y sus permisos están en `tools/supabase.sql`. Sin cuenta, todo se guarda en el navegador.

## Estructura

```
index.html          página única
css/style.css       estilos pixel art
js/app.js           arranque, menús, cuaderno, frases, perfil, cuenta y navegación
js/reader.js        texto, análisis de frases, preguntas y reproductor
js/tutor.js         sprite chibi de la tutora (y su ropa) y diálogo
js/audio.js         voz del navegador (o MP3)
js/data.js          carga y descubrimiento de ejercicios y frases
js/checks.js        reglas de validación y formato compacto de tokens
js/progress.js      textos terminados
js/srs.js           repetición espaciada (frases y cuaderno)
js/notebook.js      cuaderno de vocabulario
js/profile.js       nombre y foto del perfil
js/cloud.js         cuenta y sincronización con Supabase
js/config.js        datos del proyecto de Supabase
js/backup.js        copia de seguridad en archivo
js/meter.js, sfx.js medidores de progreso y sonidos
data/               diccionario, ejercicios y frases por nivel
tools/              guía, plantillas, asistente, comprobador, SQL y servidor local
prototipo/          prototipo original (referencia)
notes/dudas.md      dudas de traducción pendientes de revisar
```

## Publicar en GitHub Pages

En el repositorio: *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*. Todas las rutas son relativas, así que funciona en `usuario.github.io/repositorio/`. Después, pon esa dirección en Supabase, en *Authentication → URL Configuration*.
