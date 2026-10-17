-- =====================================================================
-- Paglot: la base de datos de cuentas y progreso (MariaDB 10.11+ / MySQL 8+).
--
-- Se puede ejecutar las veces que haga falta: no borra tablas ni datos.
-- Las horas se guardan siempre en UTC.
-- Los usuarios de la base y sus permisos están en bd/permisos.sql.
-- =====================================================================

SET NAMES utf8mb4;

-- Una fila por persona. El correo se guarda ya normalizado (minúsculas, NFC).
CREATE TABLE IF NOT EXISTS usuarios (
  id            CHAR(36)     NOT NULL,                       -- UUID (los de Supabase se conservan al migrar)
  correo        VARCHAR(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  hash          VARCHAR(255) NOT NULL,                       -- password_hash(): Argon2id; bcrypt si viene de Supabase
  nombre        VARCHAR(60)  NOT NULL DEFAULT '',
  foto          BLOB         NULL,                           -- miniatura JPEG regenerada por el servidor (pocos KB)
  idioma        VARCHAR(8)   NOT NULL DEFAULT 'es',          -- idioma de la interfaz: el de los correos
  confirmado    DATETIME(3)  NULL,                           -- cuándo confirmó el correo (NULL = sin confirmar)
  creado        DATETIME(3)  NOT NULL,
  actualizado   DATETIME(3)  NOT NULL,
  ultimo_acceso DATETIME(3)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY correo (correo),
  KEY sin_confirmar (confirmado, creado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sesiones abiertas. Del token solo se guarda su huella SHA-256: si se filtra la base, no sirven para entrar.
CREATE TABLE IF NOT EXISTS sesiones (
  id          CHAR(22)    CHARACTER SET ascii COLLATE ascii_bin NOT NULL,  -- id público (para listarlas y cerrarlas)
  usuario_id  CHAR(36)    NOT NULL,
  token_hash  BINARY(32)  NOT NULL,
  creada      DATETIME(3) NOT NULL,
  usada       DATETIME(3) NOT NULL,
  caduca      DATETIME(3) NOT NULL,                          -- se alarga con el uso, con un tope desde «creada»
  dispositivo VARCHAR(120) NOT NULL DEFAULT '',
  ip          VARCHAR(45)  NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY token_hash (token_hash),
  KEY usuario (usuario_id),
  KEY caduca (caduca),
  CONSTRAINT sesiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enlaces de un solo uso que van por correo: confirmar la cuenta, recuperar la contraseña, cambiar el correo.
CREATE TABLE IF NOT EXISTS tokens (
  token_hash BINARY(32)  NOT NULL,
  usuario_id CHAR(36)    NOT NULL,
  tipo       ENUM('confirmar', 'recuperar', 'correo') NOT NULL,
  dato       VARCHAR(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,  -- el correo nuevo, o la huella de la contraseña
  creado     DATETIME(3) NOT NULL,
  caduca     DATETIME(3) NOT NULL,
  usado      DATETIME(3) NULL,
  PRIMARY KEY (token_hash),
  KEY usuario_tipo (usuario_id, tipo),
  KEY caduca (caduca),
  CONSTRAINT tokens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- El progreso: una fila por persona y curso. «datos» es el mismo JSON que guarda la app (js/progress.js).
-- «version» sube en cada guardado: si dos dispositivos guardan a la vez, el segundo recibe un conflicto
-- con lo que hay ahora, lo junta y vuelve a guardar (nadie pisa a nadie).
CREATE TABLE IF NOT EXISTS progreso (
  usuario_id  CHAR(36)     NOT NULL,
  curso       VARCHAR(8)   CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  datos       LONGTEXT     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (JSON_VALID(datos)),
  version     INT UNSIGNED NOT NULL,
  actualizado DATETIME(3)  NOT NULL,
  PRIMARY KEY (usuario_id, curso),
  CONSTRAINT progreso_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copias del progreso anterior (como mucho una por hora y curso; se guardan 14 días) por si algo sale mal.
CREATE TABLE IF NOT EXISTS progreso_historial (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id CHAR(36)     NOT NULL,
  curso      VARCHAR(8)   CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  datos      LONGTEXT     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  version    INT UNSIGNED NOT NULL,
  guardado   DATETIME(3)  NOT NULL,
  PRIMARY KEY (id),
  KEY usuario_curso (usuario_id, curso, guardado),
  KEY guardado (guardado),
  CONSTRAINT historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contadores para limitar intentos (entrar, registrarse, pedir correos…).
-- La clave es «tipo:huella»: no se guardan correos ni IP tal cual.
CREATE TABLE IF NOT EXISTS limites (
  clave           VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  inicio          DATETIME(3)  NOT NULL,       -- comienzo de la ventana actual
  cuenta          INT UNSIGNED NOT NULL,
  nivel           TINYINT UNSIGNED NOT NULL DEFAULT 0,  -- cuántas veces seguidas se ha pasado del límite (espera creciente)
  bloqueado_hasta DATETIME(3)  NULL,
  PRIMARY KEY (clave),
  KEY inicio (inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Correos que no se pudieron enviar a la primera: se reintentan (tareas/correos.php) y se borran a las 24 h.
CREATE TABLE IF NOT EXISTS correos_pendientes (
  id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  para      VARCHAR(254) NOT NULL,
  asunto    VARCHAR(255) NOT NULL,
  texto     MEDIUMTEXT   NOT NULL,
  html      MEDIUMTEXT   NOT NULL,
  intentos  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  siguiente DATETIME(3)  NOT NULL,
  creado    DATETIME(3)  NOT NULL,
  PRIMARY KEY (id),
  KEY siguiente (siguiente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lo importante que pasa (entradas, fallos, cambios de contraseña, borrados…). Nunca contraseñas ni tokens.
-- La app solo puede AÑADIR filas; leerlas y borrarlas (a los 90 días) lo hace el usuario de las tareas.
-- Sin clave foránea a propósito: el aviso de «cuenta borrada» se queda aunque ya no exista la cuenta.
CREATE TABLE IF NOT EXISTS eventos (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  fecha      DATETIME(3)  NOT NULL,
  tipo       VARCHAR(40)  NOT NULL,
  usuario_id CHAR(36)     NULL,
  ip         VARCHAR(45)  NOT NULL DEFAULT '',
  detalle    VARCHAR(500) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY fecha (fecha),
  KEY tipo_fecha (tipo, fecha),
  KEY usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
