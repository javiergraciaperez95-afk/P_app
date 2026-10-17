# La API de Paglot (cuentas y progreso)

PHP + MariaDB, sin librerías de fuera. Sustituye a Supabase: cuentas, sesiones, correos de cuenta y el progreso de cada curso.
Escrita y probada en el ordenador el 17-10-2026 (paso 2 del plan). **Todavía no está en ningún servidor ni conectada a la app.**

El plan de seguridad que sigue está en `_notas/plan_seguridad_paglot.md`; los números «(plan, entrada N)» del código remiten a él.

## Qué hay aquí

```
servidor/
  publico/index.php     La ÚNICA puerta de entrada. Es lo único que debe servir Nginx.
  src/                  El código (fuera de la carpeta pública).
    Api.php, Rutas.php    Cada petición: CORS, la ruta, los errores. La tabla de rutas está en Rutas.php.
    Api/Cuentas.php       Lo que se hace sin sesión: registro, confirmar, entrar, recuperar.
    Api/Acceso.php        Entrar sin contraseña: código de 6 cifras por correo y Google (crean la cuenta si no existe).
    Google.php            Comprueba el token de Google (firma RS256 con sus claves públicas, aud, iss, caducidad).
    Api/Perfil.php        Lo que se hace con sesión: perfil, contraseña, correo, sesiones, progreso, borrar.
    Sesiones.php, Contrasenas.php, Limites.php, Validar.php, Foto.php, Progreso.php
    Correo.php, Plantillas.php   Envío (Resend, o archivos para probar) y los textos de los correos (es, en).
  bd/esquema.sql        Las tablas. bd/permisos.sql: los dos usuarios de la base y sus permisos.
  tareas/               limpieza.php (cada noche) y correos.php (cada 5 min): para cron.
  datos/                La lista de contraseñas comunes que se rechazan.
  pruebas/              115 pruebas automáticas (pruebas/casos/), el marco y un Resend de mentira.
  local/                Scripts para el ordenador: preparar, arrancar, probar, analizar, parar. Y php.ini.
  config.ejemplo.php    Plantilla de config.php (config.php lleva las contraseñas y NO va a GitHub).
  phpstan.neon          Análisis estático (nivel 8, sin errores).
```

## En el ordenador

PHP 8.4 y MariaDB 11.8 portátiles en `_herramientas/servidor_local/` (no van a GitHub y no se instalan en Windows).
También hay PHP 8.3 y 8.5 para probar con otras versiones, `phpstan.phar` y `cacert.pem` (certificados para HTTPS).
Si un día faltan, se descargan de windows.php.net, archive.mariadb.org, github.com/phpstan y curl.se/ca.

Desde la carpeta del proyecto, en Git Bash:

```bash
bash servidor/local/preparar.sh
```
Crea las bases `paglot` (para usar) y `paglot_pruebas`, sus usuarios y `config.php` con contraseñas aleatorias. Se puede repetir.

```bash
bash servidor/local/probar.sh
```
Todas las pruebas (unos 2 minutos). Con una palabra, solo las que la contengan: `bash servidor/local/probar.sh progreso`.
Con otra versión de PHP: `PAGLOT_PHP=php-8.3 bash servidor/local/probar.sh`.

```bash
bash servidor/local/arrancar.sh
```
La API en http://127.0.0.1:8180/api/v1/salud. Los correos no se envían: quedan como `.json` en `servidor/buzon/`.

```bash
bash servidor/local/analizar.sh
```
PHPStan.

```bash
bash servidor/local/parar.sh
```
Para MariaDB.

## Cómo funciona (decisiones)

- **Sesiones**: token aleatorio de 256 bits en `Authorization: Bearer …`. En la base solo va su huella SHA-256.
  Caduca a los 30 días sin uso y a los 180 en cualquier caso. Cambiar o recuperar la contraseña cierra las demás sesiones.
- **Contraseñas**: Argon2id. Mínimo 8 y máximo 128 caracteres. Se rechazan las comunes, las triviales, las iguales al correo
  y (en el servidor) las filtradas según Have I Been Pwned. Las cuentas que vengan de Supabase (bcrypt) entran y se pasan solas a Argon2id.
- **Nada delata si un correo tiene cuenta**: registrarse, recuperar o reenviar responden siempre igual y tardan lo mismo.
  Los correos se envían después de responder.
- **Cuentas sin confirmar**: no pueden entrar. Si alguien se vuelve a registrar con el mismo correo, gana el último y
  los enlaces anteriores dejan de valer (van atados a la contraseña). Se borran a los 7 días.
- **Enlaces de los correos**: un solo uso, solo vale el último pedido. Confirmar dura 48 h, recuperar 1 h y cambiar de correo 24 h.
  Llevan el token detrás de `#` (`…/#/enlace/confirmar/TOKEN`), así no llega a ningún servidor ni a ningún registro.
- **Código por correo**: 6 cifras, 10 minutos, se gasta al 5.º fallo y solo vale el último. Se guarda su HMAC, no el código.
  Como mucho 5 códigos por correo y hora. Entrar con código (o con Google) en una cuenta SIN CONFIRMAR la confirma y le
  QUITA la contraseña: esa contraseña la pudo poner cualquiera. Las cuentas sin contraseña (`hash` = '') ponen la primera
  sin «actual» y borran sin contraseña (basta la sesión).
- **Google**: se busca la cuenta por `google_sub` (no cambia aunque cambie el correo) y, si no, por correo (y se enlaza).
- **Límites**: 5 contraseñas fallidas por correo y la espera se va doblando (15 min, 30, 60…). Nunca hay bloqueo para siempre.
  Los límites por IP son generosos (una clase entera sale por la misma IP) y con sesión se cuenta por persona.
- **Progreso**: el mismo JSON que guarda la app (`js/progress.js`), una fila por persona y curso, con `version`.
  La app sigue siendo quien junta los datos de varios dispositivos (`unirDatos`). Si guarda con una versión vieja,
  recibe 409 con lo que hay ahora, lo junta y vuelve a guardar: nadie pisa a nadie (probado con dos servidores a la vez).
  Una subida que vacíe más de la mitad del progreso se rechaza (`retroceso`), salvo que sea un reinicio de verdad.
  Se guarda una copia de lo anterior como mucho cada hora, durante 14 días.
- **Foto de perfil**: llega como data URL y se vuelve a dibujar con GD en un JPEG de 96 px. Así se quita cualquier código
  o dato de ubicación. Se guarda en la base (pocos KB), no en una carpeta: no hay que servir archivos subidos y entra en las copias.
- **Base de datos**: la API usa `paglot_app`, que en `eventos` solo puede AÑADIR. La limpieza usa `paglot_tareas`.
  Ninguno puede cambiar tablas ni leer archivos del disco.
- **Errores**: la app recibe un código corto y nunca detalles. El registro de errores no lleva cuerpos de petición ni argumentos.

## Las rutas (todas bajo `/api/v1`)

Los cuerpos son JSON (`Content-Type: application/json`). Un campo que no toca se rechaza (`datos_invalidos`, `motivo: sobra`).
Los errores llegan así: `{"error": "codigo", …}`.

| Ruta | Sesión | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| `GET /salud` | no | — | `{ok, api, app_minima, hora}` · 503 si la base no responde |
| `POST /registro` | no | `{correo, contrasena, nombre?, idioma?}` | 202 siempre (llega «confirmar» o «ya tienes cuenta») |
| `POST /confirmar` | no | `{token}` | `{token, caduca, usuario}`: abre sesión |
| `POST /confirmar/reenviar` | no | `{correo}` | 202 siempre |
| `POST /entrar` | no | `{correo, contrasena}` | `{token, caduca, usuario}` · 401 `credenciales` · 403 `sin_confirmar` |
| `POST /recuperar` | no | `{correo}` | 202 siempre |
| `POST /recuperar/nueva` | no | `{token, contrasena}` | `{token, caduca, usuario}`: cierra las demás sesiones |
| `POST /yo/correo/confirmar` | no | `{token}` | `{usuario}` |
| `POST /codigo` | no | `{correo, idioma?}` | 202 siempre (llega el código, haya o no cuenta) |
| `POST /codigo/entrar` | no | `{correo, codigo, nombre?, idioma?}` | `{token, caduca, usuario, nueva}` · 400 `codigo_invalido` |
| `POST /google` | no | `{credencial, idioma?}` | `{token, caduca, usuario, nueva}` · 401 `google_invalido` · 503 `google_desactivado` · 409 `google_enlazar` (el correo ya tiene cuenta y no es de Gmail ni de empresa de Google: entrar antes y usar `/yo/google`) |
| `POST /yo/google` | sí | `{credencial}` | `{usuario}`: enlaza Google a la cuenta abierta · 409 `google_en_uso` |
| `GET /yo` | sí | — | `{usuario}` |
| `PATCH /yo` | sí | `{nombre?, foto?, idioma?}` (`foto: null` la quita) | `{usuario}` |
| `DELETE /yo` | sí | `{contrasena}` | borra la cuenta y todo lo suyo |
| `POST /yo/contrasena` | sí | `{actual, nueva}` | cierra las demás sesiones |
| `POST /yo/correo` | sí | `{contrasena, nuevo}` | 202 (enlace al nuevo, aviso al antiguo) |
| `GET /yo/exportar` | sí | — | todo lo guardado de la cuenta |
| `GET /sesiones` | sí | — | `{sesiones: [{id, dispositivo, creada, usada, caduca, actual}]}` |
| `DELETE /sesiones/{id}` | sí | — | cierra esa sesión |
| `POST /salir` | sí | — | cierra esta sesión |
| `POST /salir/todas` | sí | — | cierra todas |
| `GET /progreso/{curso}` | sí | — | `{datos \| null, version, actualizado}` |
| `PUT /progreso/{curso}` | sí | `{datos, version}` | `{version, actualizado}` · 409 `conflicto` `{datos, version}` · 409 `retroceso` |
| `DELETE /progreso/{curso}` | sí | `{contrasena}` | borra la copia de la nube de ese curso |

`usuario` = `{id, correo, nombre, foto (data URL o null), idioma, confirmado, creado}`.

**Códigos de error** (la app los tendrá que traducir con `t('clave')`):
`datos_invalidos` (con `campo` y `motivo`), `json_invalido`, `tipo_contenido`, `demasiado_grande`, `no_encontrado`, `metodo`,
`origen`, `demasiados` (con `reintentar` en segundos y la cabecera `Retry-After`), `interno`, `mantenimiento`, `sin_base_de_datos`,
`sin_sesion`, `credenciales`, `sin_confirmar`, `correo_invalido`, `contrasena_corta` (`minimo`), `contrasena_larga` (`maximo`),
`contrasena_debil`, `contrasena_igual`, `contrasena_incorrecta`, `enlace_invalido`, `correo_igual`, `correo_en_uso`,
`foto_invalida`, `curso`, `conflicto`, `retroceso`.

## Lo que falta

**La app ya está conectada** (17-10-2026): `Idiomas/js/sync.js` usa esta API; la dirección está en `Idiomas/js/config.js`
(`API_URL`: en el ordenador, la local; publicada, vacía hasta que haya VPS, y entonces las cuentas no salen).
Queda:
- Las plantillas de correo están en español e inglés; los otros 10 idiomas reciben el inglés hasta que se escriban.
- Google: crear el proyecto en Google Cloud, el ID de cliente web en `config.php` (`google.clientes`) y en `config.js`
  (`GOOGLE_CLIENTE`). Para la APK, además, el plugin `@capgo/capacitor-social-login` y un cliente Android con la huella
  SHA-1 de la firma de la APK.

**Para el servidor (paso 3)**: Nginx sirviendo solo `publico/` con `limit_req` y `client_max_body_size`, el `php.ini` de
`local/php.ini` (con `open_basedir`), los dos usuarios de la base con `HOST = localhost`, cron para `tareas/`, `config.php`
con `entorno: produccion`, Resend y `pwned: true`, y HTTPS.

**Detalles que quedan anotados**:
- La app aún no traduce `google_enlazar` ni `google_en_uso` (sale el código tal cual) y no tiene botón para enlazar Google.
- Código de 6 cifras: además de 5 intentos por código, 10 fallos por hora y correo con espera creciente (1 h, 2 h, 4 h…).
- Recuperar la contraseña escribe en la base solo si la cuenta existe: unos milisegundos de diferencia, frente a los
  cientos que tarda Argon2. Ahora no es un riesgo práctico.
- Los avisos por correo aún no traen un enlace de «no he sido yo».
- Los rebotes de Resend (webhook) se atenderán cuando esté Resend.
