# Plan de seguridad de Paglot

17-10-2026 · Copia guardada del documento https://claude.ai/code/artifact/3c1cbde7-8e4c-40a4-81ef-da133dbb2ee2

Lista de 200 problemas posibles al pasar Paglot de Supabase a un VPS propio con PHP y MySQL, ordenados por zona. Cada entrada dice qué puede fallar y cómo se evita; las marcadas como **CRÍTICO** tienen que estar resueltas antes de que entre el primer usuario real. Se marcan con la casilla a medida que se hagan.

Decisiones tomadas: VPS propio (Hetzner) con Ubuntu LTS, PHP 8.4/8.5, MariaDB, correos con Resend (plan Pro, 20 $/mes), dominio en Namecheap, HTTPS con Let's Encrypt. Servidor dedicado, solo en el futuro. No se aplica todo ahora: esta copia es para tenerlo registrado.

## Las imprescindibles

29 de las 200 entradas son críticas: sin ellas no se abre a usuarios reales. Por orden de trabajo:

| Fase | Entradas críticas | En pocas palabras |
| --- | --- | --- |
| Montar el servidor | 1, 4, 13, 15, 16 | Parches automáticos, sin root, SSH solo con clave, cortafuegos, base cerrada |
| HTTPS y PHP | 24, 36, 37 | Todo por HTTPS, PHP con soporte, errores ocultos |
| Base de datos | 48 | Usuario propio con los permisos mínimos |
| Cuentas | 60, 65, 75, 78, 87 | Argon2id, límite de intentos, tokens aleatorios, anular sesiones, enlaces de un uso |
| Correo | 91 | SPF, DKIM y DMARC |
| API | 98, 99, 108, 112, 122, 126 | El usuario sale del token, filtro por usuario, consultas preparadas, nombre como texto, CORS cerrado, límite de peticiones |
| Archivos y app | 140, 145, 152 | Foto regenerada, sin secretos en la APK, clave de firma a salvo |
| Copias y registros | 156, 157, 169 | Copia diaria, restauración probada, sin contraseñas en registros |
| Publicar | 178, 188 | Sin claves en GitHub, aviso legal al día |

## 1. Servidor VPS y sistema operativo

- [ ] **1. Sistema sin parches** — **CRÍTICO**. Un fallo conocido de Linux u OpenSSL se explota en horas. Ubuntu LTS con `unattended-upgrades` activado para las actualizaciones de seguridad.
- [ ] **2. Reinicios pendientes** — el núcleo nuevo no se aplica hasta reiniciar. Reinicio automático de madrugada cuando haga falta (`Automatic-Reboot`), después de la copia de seguridad.
- [ ] **3. Versión de Ubuntu sin soporte** — deja de recibir parches. Usar una LTS (24.04) y apuntar en el calendario su fin de soporte.
- [ ] **4. Trabajar como root** — **CRÍTICO**. Un error o un robo da control total. Usuario propio con `sudo` y root sin acceso por SSH.
- [ ] **5. Servicios que no se usan** — cada uno es una puerta más. Instalar solo Nginx, PHP-FPM, MariaDB y lo imprescindible; revisar con `ss -tlnp`.
- [ ] **6. Permisos de archivos demasiado abiertos** — otro proceso puede leer las contraseñas. Código propiedad de un usuario de despliegue, PHP con su propio usuario, nada con 777.
- [ ] **7. El archivo de configuración con claves dentro de la carpeta pública** — se descarga desde el navegador. Guardar `.env` o `config.php` fuera de la carpeta que sirve Nginx.
- [ ] **8. Disco lleno** — la base de datos se corrompe o deja de escribir. Aviso al 80 % y rotación de registros con `logrotate`.
- [ ] **9. Sin límite de memoria** — un pico tumba el servidor entero. Ajustar los procesos de PHP-FPM a la RAM del plan y añadir un archivo de intercambio pequeño.
- [ ] **10. Hora del servidor mal** — fallan los tokens que caducan y los registros no cuadran. `systemd-timesyncd` activo y zona horaria UTC.
- [ ] **11. Panel de control del proveedor sin doble factor** — quien entre en tu cuenta de Hetzner borra el servidor. Activar 2FA en Hetzner, Namecheap, Resend y GitHub.
- [ ] **12. Sin instantáneas del servidor** — una actualización rompe algo y no hay vuelta atrás. Copias automáticas del proveedor (unos 20 % del precio en Hetzner) además de las de la base de datos.

## 2. Red, cortafuegos y SSH

- [ ] **13. Entrar por SSH con contraseña** — **CRÍTICO**. Los robots prueban millones de contraseñas al día. Solo claves (`PasswordAuthentication no`).
- [ ] **14. Clave SSH sin frase de paso** — si te roban el portátil, entran al servidor. Clave ed25519 con frase de paso.
- [ ] **15. Puertos abiertos de más** — **CRÍTICO**. Cortafuegos `ufw` que deniega todo menos 22, 80 y 443. Además, el cortafuegos del panel de Hetzner con las mismas reglas.
- [ ] **16. Base de datos accesible desde internet** — **CRÍTICO**. MariaDB escuchando solo en `127.0.0.1`; el puerto 3306 nunca se abre.
- [ ] **17. Ataques de fuerza bruta a SSH** — llenan registros y gastan CPU. `fail2ban` con bloqueo tras 5 intentos.
- [ ] **18. SSH abierto a todo el mundo** — opcional pero recomendable: limitar el puerto 22 a tu IP, o usar una VPN como Tailscale y cerrarlo del todo.
- [ ] **19. Perder la clave SSH** — te quedas fuera de tu propio servidor. Copia de la clave en un sitio seguro y la consola web de Hetzner como acceso de emergencia.
- [ ] **20. Reenvío de puertos y agentes en SSH** — un atacante dentro puede saltar a tu PC. `AllowAgentForwarding no` y `X11Forwarding no`.
- [ ] **21. IPv6 olvidado** — el cortafuegos solo cubre IPv4 y todo queda abierto por IPv6. Comprobar que `ufw` tiene `IPV6=yes`.
- [ ] **22. Ataques de denegación de servicio** — un VPS pequeño cae con poco tráfico. Hetzner incluye protección básica; para más, poner Cloudflare (plan gratis) delante del dominio.
- [ ] **23. Paneles de administración expuestos** (phpMyAdmin, Adminer) — son objetivo número uno de los robots. No instalarlos; si hace falta, entrar con un túnel SSH.

## 3. HTTPS, dominio y cabeceras de seguridad

En un VPS el certificado no lo pone Namecheap: lo instala Certbot (Let's Encrypt), gratis y con renovación automática. Namecheap solo gestiona el dominio y sus DNS.

- [ ] **24. API servida por HTTP** — **CRÍTICO**. Contraseñas y tokens viajan a la vista. Todo por HTTPS y el puerto 80 solo redirige.
- [ ] **25. Certificado caducado** — la app deja de conectar de golpe. Renovación automática de Certbot y probarla con `certbot renew --dry-run`.
- [ ] **26. Sin HSTS** — alguien en una wifi pública puede forzar HTTP. Cabecera `Strict-Transport-Security` de un año.
- [ ] **27. TLS antiguo** — TLS 1.0 y 1.1 tienen fallos conocidos. Solo TLS 1.2 y 1.3, con la configuración «intermediate» de Mozilla.
- [ ] **28. Cuenta del dominio robada** — cambian los DNS y se llevan todo el tráfico. 2FA en Namecheap, bloqueo de transferencia y renovación automática del dominio.
- [ ] **29. El dominio caduca** — otro lo compra y recibe los correos de recuperación. Renovación automática con tarjeta válida y aviso en el calendario.
- [ ] **30. Subdominios olvidados** apuntando a servidores que ya no existen — alguien los ocupa. Revisar los DNS al dar de baja cualquier cosa.
- [ ] **31. Sin registro CAA** — cualquiera de las autoridades puede emitir certificados de tu dominio. Registro CAA que solo permite Let's Encrypt.
- [ ] **32. Sin política de contenido (CSP)** — un script inyectado roba la sesión. CSP que solo permite scripts propios; para la web, sin `unsafe-inline`.
- [ ] **33. La web metida en un iframe ajeno** (clickjacking) — `frame-ancestors 'none'` en la CSP.
- [ ] **34. Cabeceras básicas ausentes** — `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` con lo mínimo (micrófono solo si se usa).
- [ ] **35. El servidor dice qué versión usa** — facilita buscar fallos concretos. `server_tokens off` en Nginx y `expose_php = Off` en PHP.

## 4. Configuración de PHP

Versión recomendada: PHP 8.4 (parches de seguridad hasta el 31-12-2028) u 8.5 (hasta el 31-12-2029). La 8.2 deja de tener soporte el 31-12-2026.

- [ ] **36. Versión de PHP sin soporte** — **CRÍTICO**. Fallos sin arreglar para siempre. Usar 8.4 o 8.5 y cambiar antes de su fin de soporte.
- [ ] **37. Errores mostrados en pantalla** — **CRÍTICO**. Enseñan rutas, consultas y a veces contraseñas. `display_errors = Off` y `log_errors = On`.
- [ ] **38. Funciones peligrosas activas** — `exec`, `shell_exec`, `system`, `passthru`, `proc_open` y `popen` desactivadas con `disable_functions`.
- [ ] **39. PHP leyendo cualquier carpeta** — `open_basedir` limitado a la carpeta de la API y a `/tmp`.
- [ ] **40. Incluir archivos desde internet** — `allow_url_include = Off`.
- [ ] **41. Subidas sin límite** — alguien llena el disco. `upload_max_filesize` y `post_max_size` pequeños (por ejemplo 1 MB; el progreso y la foto caben de sobra).
- [ ] **42. Peticiones que no acaban** — bloquean los procesos de PHP. `max_execution_time` de 10 s y `request_terminate_timeout` en PHP-FPM.
- [ ] **43. Archivos .php ejecutados donde no toca** — si algún día se suben archivos, que Nginx nunca ejecute PHP en esa carpeta.
- [ ] **44. `cgi.fix_pathinfo` y rutas engañosas** — Nginx pasa a PHP un archivo que no es PHP. Configurar `try_files $uri =404` en el bloque PHP.
- [ ] **45. Extensiones de más** — cada una puede traer fallos. Solo `pdo_mysql`, `mbstring`, `intl`, `curl`, `sodium` y `opcache`.
- [ ] **46. Archivos de copia o de pruebas olvidados** (`info.php`, `config.php.bak`, carpeta `.git`) — se descargan y revelan el código o las claves. Nginx deniega los archivos ocultos y de copia, y no se suben al servidor.
- [ ] **47. Comparaciones flojas** (`==`) — en PHP `"0e123" == "0e456"` da verdadero y se cuelan tokens. `declare(strict_types=1)`, `===` siempre y `hash_equals()` para comparar tokens.

## 5. Base de datos MySQL/MariaDB

- [ ] **48. La API entra a la base con el usuario root** — **CRÍTICO**. Una inyección lo borra todo. Usuario propio de la app con solo SELECT, INSERT, UPDATE y DELETE sobre su base.
- [ ] **49. Contraseña de la base débil o repetida** — contraseña larga y aleatoria, solo en el archivo de configuración fuera de la carpeta pública.
- [ ] **50. Instalación por defecto** — usuarios anónimos y base de pruebas. Pasar `mariadb-secure-installation`.
- [ ] **51. Juego de caracteres incompleto** — se cortan o se corrompen los nombres en chino, japonés o con emojis. Todo en `utf8mb4` y la conexión PDO con `charset=utf8mb4`.
- [ ] **52. Correos repetidos con mayúsculas** (`Ana@x.com` y `ana@x.com`) — dos cuentas para una persona. Guardar el correo normalizado en minúsculas con índice único.
- [ ] **53. Borrar un usuario y que queden sus datos** — claves foráneas con `ON DELETE CASCADE` hacia el progreso y los tokens.
- [ ] **54. Escrituras a medias** — un fallo deja el registro creado sin su progreso. Transacciones en las operaciones de varios pasos.
- [ ] **55. Dos dispositivos guardando a la vez** — uno pisa al otro. Leer y escribir el progreso dentro de una transacción con `SELECT … FOR UPDATE`, o una columna de versión.
- [ ] **56. JSON del progreso enorme** — llena la base. Límite de tamaño en la API (por ejemplo 512 KB por curso) y comprobación de que es JSON válido.
- [ ] **57. Tokens guardados tal cual** — si se filtra la base, se entra en todas las cuentas. Guardar solo el hash SHA-256 de cada token.
- [ ] **58. Tablas que crecen sin fin** (tokens caducados, intentos de entrada) — tarea nocturna que borra lo caducado.
- [ ] **59. MariaDB sin actualizar** — usar el paquete de Ubuntu, que se actualiza con el resto del sistema.

## 6. Registro, contraseñas e inicio de sesión

- [ ] **60. Contraseñas guardadas sin hash o con MD5/SHA1** — **CRÍTICO**. `password_hash()` con Argon2id (o bcrypt) y `password_verify()`; nunca un hash propio.
- [ ] **61. No mejorar los hashes antiguos** — los importados de Supabase vienen en bcrypt. Tras un inicio de sesión correcto, `password_needs_rehash()` y guardar el nuevo.
- [ ] **62. Contraseñas demasiado cortas** — mínimo 8 caracteres y máximo de 128 (para que nadie envíe un texto gigante que cuelgue el hash).
- [ ] **63. Contraseñas filtradas** («123456», «password») — comprobar contra Have I Been Pwned con su método anónimo (solo se envían los 5 primeros caracteres del hash) o, al menos, contra una lista de las 10.000 más usadas.
- [ ] **64. Reglas absurdas de composición** — obligar a símbolos hace contraseñas peores. Permitir frases largas, espacios y cualquier carácter Unicode.
- [ ] **65. Fuerza bruta contra una cuenta** — **CRÍTICO**. Límite de intentos por correo y por IP (por ejemplo 5 en 15 minutos) con espera creciente.
- [ ] **66. Relleno de credenciales** (contraseñas robadas de otras webs probadas en masa) — límite global por IP y alerta si sube mucho la tasa de fallos.
- [ ] **67. Bloquear la cuenta del todo tras fallos** — cualquiera bloquea a otra persona. Mejor esperas crecientes que bloqueo permanente.
- [ ] **68. Decir si un correo existe** («ese correo no está registrado») — permite saber quién usa la app. Mensaje igual para correo o contraseña incorrectos.
- [ ] **69. Saber si existe por el tiempo de respuesta** — responder igual de rápido aunque el correo no exista (calcular un hash de relleno).
- [ ] **70. Registro que revela cuentas** («ya está registrado») — responder siempre «te hemos enviado un correo» y que el correo diga si ya tenías cuenta.
- [ ] **71. Registros masivos de robots** — límite de registros por IP y un campo trampa oculto. Si llegan muchos, Cloudflare Turnstile (gratis y sin imágenes que resolver).
- [ ] **72. Cuentas sin confirmar que se acumulan** — borrar las que no confirmen en 7 días.
- [ ] **73. Cambiar la contraseña sin pedir la actual** — quien coja el móvil desbloqueado se queda la cuenta. Pedir la actual (salvo con el enlace de recuperación).
- [ ] **74. Cambiar el correo sin confirmar** — pedir la contraseña, confirmar el correo nuevo y avisar al antiguo.

## 7. Sesiones y tokens

Propuesta: token opaco aleatorio (no JWT), guardado como hash en la base, enviado en la cabecera `Authorization: Bearer`. Funciona igual en la web y en la APK y se puede anular al momento.

- [ ] **75. Tokens predecibles** — **CRÍTICO**. `random_bytes(32)`; nunca `rand()`, `uniqid()` ni la hora.
- [ ] **76. Tokens que no caducan** — caducidad de 30 días renovada con el uso, y tope absoluto (por ejemplo 180 días).
- [ ] **77. Cerrar sesión sin anular el token** — sigue sirviendo si alguien lo copió. Borrar el token en el servidor al salir.
- [ ] **78. Cambiar la contraseña y que sigan las sesiones** — **CRÍTICO**. Anular todas las demás sesiones al cambiarla o recuperarla.
- [ ] **79. Sin «cerrar sesión en todos los dispositivos»** — añadir el botón en el perfil.
- [ ] **80. Token en la URL** — queda en registros, historial y cabecera Referer. Siempre en cabecera, nunca en la URL (salvo los enlaces de un solo uso del correo).
- [ ] **81. JWT mal hechos** (algoritmo `none`, clave débil, imposibles de anular) — evitarlos usando tokens opacos.
- [ ] **82. Token robado por un script inyectado** — en la web, `localStorage` es legible por cualquier script. Defensa: CSP estricta (32) y no insertar HTML de usuarios. Alternativa en la web: cookie `HttpOnly; Secure; SameSite=Lax`.
- [ ] **83. Si se usan cookies, CSRF** — otra web envía peticiones con tu cookie. `SameSite=Lax` y comprobar la cabecera `Origin` en cada petición que cambie algo.
- [ ] **84. Fijación de sesión** — dar siempre un token nuevo al iniciar sesión, nunca reutilizar uno anterior.
- [ ] **85. Sin lista de sesiones abiertas** — guardar por token el dispositivo aproximado y la fecha, para que el usuario vea dónde ha entrado.
- [ ] **86. Comparar tokens con `==`** — se compara el hash con `hash_equals()` o se busca por hash en la base con índice.

## 8. Correos de confirmación y recuperación

- [ ] **87. Enlace de recuperación que no caduca o se reutiliza** — **CRÍTICO**. Un solo uso, caducidad de 30–60 minutos y guardado como hash.
- [ ] **88. Enlace construido con la cabecera Host** — un atacante hace que el correo apunte a su web y roba el token. La dirección del enlace sale de la configuración, nunca de la petición.
- [ ] **89. Recuperación que revela si el correo existe** — responder siempre «si existe, te hemos enviado un correo».
- [ ] **90. Bombardeo de correos** — alguien pide 1.000 recuperaciones para otra persona y gasta tu cupo de Resend. Máximo 3 por correo y hora.
- [ ] **91. Sin SPF, DKIM y DMARC** — **CRÍTICO**. Los correos van a spam y cualquiera puede suplantar tu dominio. Añadir en Namecheap los registros que da Resend y DMARC empezando en `p=none` hasta llegar a `p=quarantine`.
- [ ] **92. Clave de la API de Resend expuesta** — en el código de la app o en GitHub. Solo en el servidor, con permiso únicamente de enviar y limitada a tu dominio.
- [ ] **93. HTML del usuario dentro del correo** (por ejemplo, su nombre) — se puede inyectar un enlace falso. Escapar con `htmlspecialchars()` todo lo que venga del usuario.
- [ ] **94. Correos que parecen phishing** — enviar desde un subdominio propio (`correo.tudominio`), con el mismo remitente siempre y sin acortadores de enlaces.
- [ ] **95. Sin aviso de cambios importantes** — avisar por correo cuando cambian la contraseña o el correo, con un enlace para «no he sido yo».
- [ ] **96. Resend caído o sin cupo** — el registro se queda a medias. Guardar el envío pendiente y reintentarlo; mostrar «vuelve a pedir el correo en unos minutos».
- [ ] **97. Rebotes y quejas ignorados** — Resend te suspende la cuenta si hay muchos. Activar su webhook y dejar de enviar a direcciones que rebotan.

## 9. Autorización: que nadie toque datos ajenos

Es el fallo número uno del OWASP Top 10:2025. Hoy lo resuelve la seguridad por filas de Supabase; en PHP hay que hacerlo a mano en cada petición.

- [ ] **98. El id de usuario llega en la petición** (`?user_id=5`) — **CRÍTICO**. Cambiando el número se leen datos de otro. El usuario sale siempre del token, nunca de lo que envía la app.
- [ ] **99. Consultas sin filtrar por usuario** — **CRÍTICO**. Toda consulta de progreso lleva `WHERE user_id = ?` con el id del token. Una función única de acceso para no olvidarlo.
- [ ] **100. Ids correlativos** — facilitan probar números. Usar UUID o ids aleatorios en todo lo que salga hacia fuera.
- [ ] **101. Curso inventado** — el parámetro `curso` se compara con la lista cerrada de cursos; nada fuera de la lista.
- [ ] **102. Rutas sin comprobar el token** — un único punto de entrada que exige sesión a todo salvo registro, entrada, confirmar y recuperar.
- [ ] **103. Cuentas sin confirmar con acceso completo** — decidir qué pueden hacer; como mínimo, que no puedan cambiar el correo.
- [ ] **104. Funciones de administrador en la misma API** — si las hay, en otra ruta, con otro usuario de base y solo accesibles por túnel SSH.
- [ ] **105. Plan de pago comprobado solo en la app** — cuando haya cobros, el límite de 3 lecciones al día y el plan se comprueban en el servidor; lo de la app se puede trucar.
- [ ] **106. Compras falsificadas** — verificar cada compra con Google Play (y la tienda que sea) desde el servidor, nunca fiarse de lo que diga la app.
- [ ] **107. Borrar la cuenta sin confirmar** — pedir la contraseña antes de borrar la cuenta o los datos de la nube.

## 10. Validación de entradas e inyecciones

- [ ] **108. Inyección SQL** — **CRÍTICO**. Siempre consultas preparadas con PDO (`prepare` + `execute`), nunca texto del usuario pegado en la consulta.
- [ ] **109. PDO con preparación emulada** — `PDO::ATTR_EMULATE_PREPARES => false` y `ERRMODE_EXCEPTION`.
- [ ] **110. Nombres de tabla o columna variables** — no se pueden preparar. Una sola tabla de progreso con columna `curso` (ya lo hace innecesario).
- [ ] **111. Correo sin validar** — `filter_var($c, FILTER_VALIDATE_EMAIL)`, longitud máxima de 254 y sin saltos de línea (evita inyectar cabeceras de correo).
- [ ] **112. Nombre del perfil con HTML o scripts** — **CRÍTICO**. Se guarda tal cual pero la app lo pinta siempre como texto (`textContent`), nunca con `innerHTML`.
- [ ] **113. Textos enormes** — límite de longitud en cada campo (nombre 60, correo 254, contraseña 128).
- [ ] **114. Caracteres invisibles o de control** en el nombre (dirección de texto invertida, ceros de ancho) — normalizar Unicode y quitarlos.
- [ ] **115. JSON mal formado** — `json_decode` con `JSON_THROW_ON_ERROR` y profundidad máxima.
- [ ] **116. JSON con campos de más** — validar la forma del progreso (versión 2, perfil, lecciones, cuaderno, actividad) y rechazar lo demás.
- [ ] **117. Tipos cambiados** (un array donde va un texto) — comprobar el tipo de cada campo antes de usarlo; con `strict_types` muchos errores saltan solos.
- [ ] **118. Deserializar datos** — nunca `unserialize()` sobre algo que venga de fuera; solo JSON.
- [ ] **119. Rutas de archivo construidas con datos del usuario** (`../../etc/passwd`) — no construir rutas con datos externos.
- [ ] **120. SSRF: el servidor descarga una URL que manda el usuario** — no ofrecerlo; la foto llega como imagen, no como enlace.
- [ ] **121. Validar solo en la app** — toda validación se repite en el servidor; la de la app es solo para avisar antes.

## 11. La API: CORS, límites y errores

- [ ] **122. CORS abierto a todos** (`Access-Control-Allow-Origin: *`) — **CRÍTICO**. Lista cerrada: tu dominio, `https://localhost` y `capacitor://localhost` (APK). Si llega otro origen, no se responde con permiso.
- [ ] **123. Reflejar cualquier Origin** que llegue — es lo mismo que abrirlo a todos. Comparar contra la lista exacta.
- [ ] **124. CORS con credenciales y comodines** — nunca `Allow-Credentials: true` junto a orígenes amplios.
- [ ] **125. Peticiones OPTIONS mal atendidas** — la APK no conecta. Responder bien al «preflight» con los métodos y cabeceras permitidos.
- [ ] **126. Sin límite de peticiones** — **CRÍTICO**. Límite por IP y por usuario en Nginx (`limit_req`) y en la API para entrada, registro y recuperación.
- [ ] **127. Métodos HTTP sin restringir** — cada ruta acepta solo su método (GET para leer, POST/PUT para guardar, DELETE para borrar).
- [ ] **128. Respuestas con datos de más** — nunca devolver el hash de la contraseña ni campos internos. Lista explícita de lo que sale.
- [ ] **129. Mensajes de error técnicos** — la API responde un código (`credenciales`, `sin_conexion`…) que la app traduce con `t('clave')`; el detalle va solo al registro del servidor.
- [ ] **130. Excepciones sin capturar** (fallo A10 del OWASP Top 10:2025) — un manejador global que registra el error y responde 500 genérico; nunca un estado a medias.
- [ ] **131. Respuestas guardadas en caché** — datos de un usuario servidos a otro. `Cache-Control: no-store` en todo lo que lleve sesión.
- [ ] **132. Sin versión en la API** — al cambiarla, las APK antiguas se rompen. Rutas con versión (`/api/v1/`).
- [ ] **133. Tamaño de petición sin límite en Nginx** — `client_max_body_size 1m`.

## 12. Progreso, sincronización y foto de perfil

- [ ] **134. Perder el progreso al juntar datos** — la unión sigue en la app (`unirDatos`), pero el servidor guarda la versión anterior durante unos días por si algo sale mal.
- [ ] **135. Una APK con un fallo sube datos vacíos** y borra el progreso de la nube — rechazar en el servidor una subida que deje casi vacío un progreso grande, salvo que sea un reinicio explícito.
- [ ] **136. Subidas demasiado frecuentes** — la app ya espera 2 s; además, límite en el servidor (por ejemplo 30 guardados por minuto).
- [ ] **137. Una sola petición para leer y guardar** — un `PUT` que junta en el servidor ahorra la petición doble de ahora y evita carreras (55).
- [ ] **138. Relojes de dispositivos desajustados** — los campos `t` mandan en la unión. El servidor guarda su propia hora de recepción para desempatar.
- [ ] **139. Reinicio de progreso que vuelve desde otro dispositivo** — respetar el campo `reiniciado` igual que ahora.
- [ ] **140. Foto de perfil con código dentro** (SVG con scripts, archivos disfrazados) — **CRÍTICO**. Aceptar solo JPEG, PNG o WebP, comprobar el contenido real y volver a generar la imagen con GD; nunca SVG.
- [ ] **141. Foto con datos de ubicación** (EXIF con GPS) — al regenerarla se quitan los metadatos.
- [ ] **142. Fotos enormes** — límite de 2 MB al subir y miniatura de 256 px al guardar.
- [ ] **143. Foto servida desde la misma carpeta que la API** — en una carpeta sin PHP, con nombre aleatorio y `Content-Type` fijo.
- [ ] **144. Juego y otras claves locales sin sincronizar** — al meterlas en `datos` (pendiente de la revisión anterior), pasan por la misma validación de tamaño y forma.

## 13. La app y la APK

- [ ] **145. Claves secretas dentro de la app** — **CRÍTICO**. Cualquiera descomprime la APK y las lee. En la app solo va la dirección de la API; la clave de Resend y la de la base, solo en el servidor.
- [ ] **146. Tráfico sin cifrar permitido en Android** — dejar `cleartext` desactivado en Capacitor y en el manifiesto.
- [ ] **147. Enlace `idiomasapp://auth` secuestrado** — otra app puede registrar el mismo esquema y recibir el token del correo. Usar App Links verificados (`https://tudominio/auth` con `assetlinks.json`) y tokens de un solo uso.
- [ ] **148. Token en la URL del enlace que se queda en la app** — canjearlo nada más llegar y borrarlo de la URL.
- [ ] **149. Token guardado sin protección en el móvil** — en Android, `localStorage` de la WebView es privado de la app; para más, el almacén seguro del sistema (Keystore) con un plugin.
- [ ] **150. Copias de Android que se llevan el token** — excluir el almacenamiento de la sesión de las copias automáticas (`allowBackup` o reglas de exclusión).
- [ ] **151. Depuración activa en la APK publicada** — `webContentsDebuggingEnabled` en `false` y compilación de release.
- [ ] **152. Clave de firma de la APK perdida o robada** — **CRÍTICO**. Sin ella no se puede actualizar la app; con ella, otro publica una falsa. Copia cifrada fuera del PC y usar la firma de Google Play.
- [ ] **153. Insertar HTML de usuarios o del servidor** — revisar los `innerHTML` de la app para que nunca lleven datos de la API sin escapar.
- [ ] **154. Librerías cargadas desde CDN en la APK** — todo local, como ya se hace con `vendor/`.
- [ ] **155. APK antiguas sin poder actualizar** — la API devuelve una versión mínima y la app pide actualizar si es más vieja.

## 14. Copias de seguridad y recuperación

Esquema acordado: copia nocturna en el servidor, descarga diaria a tu PC con WinSCP y el Programador de tareas, y una tercera copia en Backblaze B2.

- [ ] **156. Sin copias** — **CRÍTICO**. `mysqldump --single-transaction` cada noche por cron, comprimido.
- [ ] **157. Copias que nunca se han probado** — **CRÍTICO**. Una vez al mes, restaurar en una base de pruebas y comprobar que entra un usuario.
- [ ] **158. Copias sin cifrar** — contienen correos y hashes. Cifrarlas con `age` o GPG antes de salir del servidor.
- [ ] **159. Perder la clave de cifrado** — copias inútiles. Guardarla en un gestor de contraseñas y en papel.
- [ ] **160. El usuario de descarga puede hacer de todo** — usuario SFTP propio, encerrado en la carpeta de copias y solo con lectura.
- [ ] **161. Un ransomware en el servidor cifra también las copias** — por eso el PC descarga (el servidor no puede tocar tu PC) y B2 con bloqueo de objetos para que no se puedan borrar en 30 días.
- [ ] **162. Copias que llenan el disco** — guardar 14 diarias en el servidor y, en el PC, 30 diarias más una por mes.
- [ ] **163. La copia falla y nadie se entera** — el script avisa por correo si falla o si el archivo sale más pequeño de lo normal.
- [ ] **164. El PC apagado a la hora de la descarga** — la tarea de Windows con «ejecutar lo antes posible si se pasó la hora».
- [ ] **165. Copiar solo la base** — también la configuración de Nginx y PHP, las fotos de perfil y el `.env` (cifrado).
- [ ] **166. Sin plan para un desastre** — texto paso a paso para montar un servidor nuevo desde cero con las copias, y medir cuánto se tarda.
- [ ] **167. Usuarios que pidieron borrar sus datos y siguen en las copias** — las copias caducan en un plazo fijo (30 días) y se explica en el aviso legal.

## 15. Registros, alertas y vigilancia

- [ ] **168. No registrar los hechos importantes** — apuntar entradas, fallos de entrada, registros, cambios de contraseña y de correo, y borrados de cuenta, con fecha, IP y usuario.
- [ ] **169. Registrar contraseñas o tokens** — **CRÍTICO**. Nunca aparecen en ningún registro, ni siquiera en los de error.
- [ ] **170. Registros que nadie mira** — un resumen diario por correo: fallos de entrada, errores 500 y bloqueos de fail2ban.
- [ ] **171. El servidor caído y te enteras por un usuario** — vigilancia externa gratis (UptimeRobot o similar) que llama a `/api/v1/salud` cada 5 minutos.
- [ ] **172. Certificado a punto de caducar** — la misma vigilancia avisa 14 días antes.
- [ ] **173. Registros que se pueden borrar desde la API** — que el usuario de PHP solo pueda añadir, no borrar.
- [ ] **174. Registros que guardan datos personales para siempre** — conservarlos 90 días y rotarlos.
- [ ] **175. Inyección en los registros** (saltos de línea en un correo que inventan líneas falsas) — registrar en JSON y escapar.
- [ ] **176. Sin alerta de comportamiento raro** — avisar si una IP prueba muchos correos distintos o si se disparan los registros.
- [ ] **177. Sin plan si hay una filtración** — pasos escritos: cortar el acceso, anular todos los tokens, forzar cambio de contraseña, avisar a la AEPD en 72 horas y a los usuarios afectados.

## 16. Dependencias, código y despliegue

- [ ] **178. Claves subidas a GitHub** — **CRÍTICO**. `.env` en `.gitignore` desde el primer día y activar el escaneo de secretos de GitHub. Si una clave se sube, se cambia aunque el repositorio sea privado.
- [ ] **179. Librerías de terceros con fallos** (cadena de suministro, A03 del OWASP Top 10:2025) — usar las mínimas; con Composer, `composer audit` antes de cada despliegue y versiones fijadas en `composer.lock`.
- [ ] **180. Paquetes falsos con nombres parecidos** — instalar solo paquetes conocidos y comprobar el nombre exacto.
- [ ] **181. Subir archivos a mano por FTP** — se olvidan archivos o se suben de más. Despliegue con un script (`rsync` o `git pull` de una rama) que siempre hace lo mismo.
- [ ] **182. Desplegar sin probar** — pruebas automáticas básicas de la API (registro, entrada, guardar, leer, no leer lo ajeno) antes de cada despliegue.
- [ ] **183. Sin vuelta atrás** — cada despliegue en su carpeta y un enlace simbólico a la actual; volver es cambiar el enlace.
- [ ] **184. Probar en el servidor de verdad** — un entorno de pruebas en tu PC (o un subdominio) con datos inventados.
- [ ] **185. Datos reales en pruebas** — nunca copiar usuarios reales a tu PC para probar.
- [ ] **186. Código sin revisar** — pasar un analizador como PHPStan y una revisión de seguridad antes de publicar.
- [ ] **187. Nadie más ha mirado la seguridad** — antes de abrir al público, un escaneo externo (por ejemplo OWASP ZAP) y comprobar las cabeceras en securityheaders.com y el TLS en SSL Labs.

## 17. Privacidad y RGPD

- [ ] **188. Aviso legal desactualizado** — **CRÍTICO**. Cambiar en `#/legal` que los datos ya no están en Supabase sino en Hetzner (Alemania), y que Resend envía los correos; rellenar los datos del titular en `config.js`.
- [ ] **189. Sin contrato de encargo de tratamiento** — aceptar el DPA de Hetzner y el de Resend (este último, empresa de EE. UU.: comprobar que se acoge al marco UE–EE. UU.).
- [ ] **190. Guardar más de lo necesario** — solo correo, nombre, foto opcional, progreso y registros técnicos.
- [ ] **191. Sin forma de descargar los datos propios** — la app ya exporta una copia; añadir que incluya los datos de la cuenta.
- [ ] **192. Borrar la cuenta que no borra todo** — al borrar, se eliminan la cuenta, el progreso, la foto, los tokens y los envíos pendientes; los registros y las copias caducan en su plazo.
- [ ] **193. Menores de edad** — en España, por debajo de 14 años hace falta el consentimiento de los padres. Decidir la edad mínima y ponerla en el registro.
- [ ] **194. Cuentas inactivas para siempre** — avisar y borrar tras un plazo (por ejemplo 3 años sin entrar).
- [ ] **195. Cookies o analítica sin consentimiento** — si se añade analítica, que sea sin cookies o detrás del aviso que ya existe.

## 18. Migración desde Supabase

- [ ] **196. Exportar con la clave secreta de Supabase y dejarla por ahí** — usarla solo en tu PC para exportar y cambiarla al terminar.
- [ ] **197. Archivo exportado sin proteger** — tiene correos y hashes de todos. Cifrado, fuera de GitHub y borrado tras importar.
- [ ] **198. Usuarios sin confirmar o con hash raro** — importar solo los hashes bcrypt válidos; el resto, con aviso de «restablece tu contraseña».
- [ ] **199. APK antiguas guardando en Supabase** después del cambio — mantener Supabase en solo lectura unas semanas y forzar la actualización de la app (155).
- [ ] **200. Apagar Supabase sin comprobar** — contar usuarios y filas de progreso en los dos lados, y borrar el proyecto de Supabase solo cuando cuadren.

## Fuentes

La estructura sigue el OWASP Top 10:2025 y los capítulos del OWASP ASVS 5.0; el resto sale de buenas prácticas conocidas y de cómo funciona hoy `js/sync.js`.

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/) ([versión en español](https://owasp.org/Top10/2025/es/))
- [OWASP ASVS 5.0.0 (resumen de Report URI)](https://ams.report-uri.com/solutions/owasp_asvs_500) y [novedades de ASVS 5.0](https://softwaremill.com/whats-new-in-asvs-5-0/)
- [Fechas de soporte de PHP (endoflife.date)](https://endoflife.date/PHP)
- [Precios de Resend (usecarly)](https://www.usecarly.com/blog/resend-pricing/)
