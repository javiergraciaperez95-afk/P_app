-- =====================================================================
-- PAGLOT · BASE DE DATOS PROPIA (MySQL 8 / MariaDB 10.6+) para el hosting de paglot.eu
-- Cómo se instala: phpMyAdmin (o la consola) → la base de datos de Paglot → Importar este archivo. Se puede volver a
-- ejecutar: no borra nada (todo es «if not exists»).
--
-- Pensada para ocupar poco y no guardar nada que sobre:
--  · el progreso va comprimido (gzip) por curso;
--  · contraseñas con password_hash (argon2id o bcrypt); sesiones, códigos y regalos, solo como huella SHA-256;
--  · fechas como DATETIME en UTC; textos cortos con su largo justo.
-- La cuenta 78910021 es la de desarrollador: lo tiene todo y no se puede borrar (disparador de abajo).
-- =====================================================================

SET NAMES utf8mb4;

-- Las cuentas. id = el número público de la cuenta (8 cifras al azar), el que se ve en el Perfil.
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT UNSIGNED PRIMARY KEY,
  correo      VARCHAR(254) NOT NULL UNIQUE,
  clave       VARCHAR(255) NOT NULL,                 -- password_hash()
  nombre      VARCHAR(60)  NOT NULL DEFAULT '',
  idioma      CHAR(2)      NOT NULL DEFAULT 'es',     -- el de los correos
  verificado  TINYINT(1)   NOT NULL DEFAULT 0,        -- el correo se confirmó con un código
  es_dev      TINYINT(1)   NOT NULL DEFAULT 0,        -- todo desbloqueado
  protegido   TINYINT(1)   NOT NULL DEFAULT 0,        -- no se puede borrar
  creado      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visto       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sesiones: el navegador guarda el token; aquí solo su huella.
CREATE TABLE IF NOT EXISTS sesiones (
  huella      BINARY(32)   PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  caduca      DATETIME     NOT NULL,
  creada      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Códigos de 6 cifras por correo: verificar la cuenta, entrar sin contraseña o cambiarla. Uno vivo por correo y uso.
CREATE TABLE IF NOT EXISTS codigos (
  correo      VARCHAR(254) NOT NULL,
  uso         ENUM('verificar', 'entrar', 'clave') NOT NULL,
  huella      BINARY(32)   NOT NULL,
  intentos    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  caduca      DATETIME     NOT NULL,
  PRIMARY KEY (correo, uso)
) ENGINE=InnoDB;

-- El progreso de cada curso (lo mismo que copiaCompleta() en js/progress.js), comprimido.
CREATE TABLE IF NOT EXISTS progreso (
  usuario_id  INT UNSIGNED NOT NULL,
  curso       VARCHAR(8)   NOT NULL,
  datos       MEDIUMBLOB   NOT NULL,                  -- gzcompress(JSON)
  cuando      BIGINT       NOT NULL,                  -- marca de la app (ms), para juntar sin pisar
  PRIMARY KEY (usuario_id, curso),
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Lo que da derecho a un plan. Cada fila: de qué plan, hasta cuándo (NULL = para siempre) y de dónde sale.
-- Las de pago (stripe, play) se comprueban además en Supabase (doble seguridad, ver inc/planes.php).
CREATE TABLE IF NOT EXISTS suscripciones (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  plan        ENUM('plus', 'max', 'familia') NOT NULL,
  hasta       DATETIME     NULL,
  origen      ENUM('stripe', 'play', 'regalo', 'hucha', 'fundador', 'dev') NOT NULL,
  referencia  VARCHAR(80)  NOT NULL UNIQUE,           -- id del pago, del regalo o del movimiento de la hucha
  creada      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comprobada  DATETIME     NULL,                      -- última vez que Supabase dijo que sí (se guarda 6 h)
  INDEX (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Los pagos tal como llegan del proveedor (para facturas y devoluciones).
CREATE TABLE IF NOT EXISTS pagos (
  referencia  VARCHAR(80)  PRIMARY KEY,
  usuario_id  INT UNSIGNED NULL,
  producto    VARCHAR(24)  NOT NULL,                  -- plus-mes, max-ano, familia-ano, fundadores, regalo-max-ano…
  centimos    INT UNSIGNED NOT NULL,
  moneda      CHAR(3)      NOT NULL,
  pais        CHAR(2)      NULL,
  estado      ENUM('pagado', 'devuelto') NOT NULL DEFAULT 'pagado',
  creado      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (usuario_id)
) ENGINE=InnoDB;

-- Regalos: solo la huella del código (el código en claro no se guarda nunca). Un solo uso.
CREATE TABLE IF NOT EXISTS regalos (
  huella      CHAR(64)     PRIMARY KEY,
  tipo        ENUM('max-mes', 'max-ano') NOT NULL,
  lote        VARCHAR(40)  NOT NULL,
  usado_por   INT UNSIGNED NULL,
  usado_en    DATETIME     NULL
) ENGINE=InnoDB;

-- La Hucha: lo que se ha ganado viendo anuncios (en céntimos) y en qué se ha gastado.
CREATE TABLE IF NOT EXISTS hucha (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  centimos    INT          NOT NULL,                  -- + anuncio visto, − compra
  motivo      VARCHAR(24)  NOT NULL,                  -- anuncio · plus-mes · max-mes · libro…
  referencia  VARCHAR(80)  NOT NULL UNIQUE,           -- id de la recompensa del anuncio (no se paga dos veces)
  creado      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Plan Familia: la titular paga; hasta 5 personas más entran con una invitación.
CREATE TABLE IF NOT EXISTS familias (
  titular_id  INT UNSIGNED PRIMARY KEY,
  creada      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (titular_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS familia_miembros (
  titular_id  INT UNSIGNED NOT NULL,
  usuario_id  INT UNSIGNED NOT NULL UNIQUE,           -- una persona, una familia
  desde       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (titular_id, usuario_id),
  FOREIGN KEY (titular_id) REFERENCES familias (titular_id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS familia_invitaciones (
  huella      BINARY(32)   PRIMARY KEY,
  titular_id  INT UNSIGNED NOT NULL,
  correo      VARCHAR(254) NOT NULL,
  caduca      DATETIME     NOT NULL,
  FOREIGN KEY (titular_id) REFERENCES familias (titular_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pedidos de libros (impresión bajo demanda: Lulu) y de la tienda.
CREATE TABLE IF NOT EXISTS pedidos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NULL,
  producto    VARCHAR(40)  NOT NULL,
  direccion   TEXT         NOT NULL,                  -- JSON con la dirección de envío
  estado      ENUM('nuevo', 'enviado', 'entregado', 'cancelado') NOT NULL DEFAULT 'nuevo',
  creado      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (usuario_id)
) ENGINE=InnoDB;

-- Mensajes del formulario de contacto (además del correo que llega por Resend).
CREATE TABLE IF NOT EXISTS contacto (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(60)  NOT NULL,
  correo      VARCHAR(254) NOT NULL,
  asunto      VARCHAR(24)  NOT NULL,
  mensaje     TEXT         NOT NULL,
  creado      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- El laboratorio de ideas y los avisos de errores (lo que antes iba a Supabase).
CREATE TABLE IF NOT EXISTS ideas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  texto       VARCHAR(400) NOT NULL,
  nombre      VARCHAR(40)  NOT NULL DEFAULT '',
  marca       CHAR(32)     NOT NULL,                  -- la marca al azar del dispositivo que la propuso
  votos       INT UNSIGNED NOT NULL DEFAULT 0,
  avisos      TINYINT UNSIGNED NOT NULL DEFAULT 0,    -- con 3 avisos se oculta
  creada      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ideas_votos (
  idea_id     INT UNSIGNED NOT NULL,
  marca       CHAR(32)     NOT NULL,
  PRIMARY KEY (idea_id, marca),
  FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS errores (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mensaje     VARCHAR(500) NOT NULL,
  pantalla    VARCHAR(80)  NOT NULL DEFAULT '',
  curso       VARCHAR(8)   NOT NULL DEFAULT '',
  version     VARCHAR(60)  NOT NULL DEFAULT '',
  navegador   VARCHAR(80)  NOT NULL DEFAULT '',
  creado      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Límite de peticiones por IP y acción (contra abusos): una fila por ventana de tiempo.
CREATE TABLE IF NOT EXISTS limites (
  clave       BINARY(32)   PRIMARY KEY,               -- huella de IP + acción + ventana
  cuenta      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  caduca      DATETIME     NOT NULL
) ENGINE=InnoDB;

-- La cuenta de desarrollador: número 78910021, todo desbloqueado, protegida. Su correo y su contraseña se ponen con
-- «php api/herramientas/cuenta-dev.php correo contraseña» (aquí va una contraseña imposible, para que no se pueda entrar
-- hasta ponerla).
INSERT IGNORE INTO usuarios (id, correo, clave, nombre, verificado, es_dev, protegido)
VALUES (78910021, 'dev@paglot.eu', '!sin-clave', 'Desarrollo', 1, 1, 1);
INSERT IGNORE INTO suscripciones (usuario_id, plan, hasta, origen, referencia) VALUES (78910021, 'max', NULL, 'dev', 'dev-78910021');

-- Que la cuenta protegida no se pueda borrar ni dejar de ser de desarrollo, ni a mano.
DROP TRIGGER IF EXISTS usuarios_protegidos_no_se_borran;
DROP TRIGGER IF EXISTS usuarios_protegidos_no_cambian;
DELIMITER //
CREATE TRIGGER usuarios_protegidos_no_se_borran BEFORE DELETE ON usuarios FOR EACH ROW
BEGIN
  IF OLD.protegido = 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'cuenta protegida: no se puede borrar'; END IF;
END//
CREATE TRIGGER usuarios_protegidos_no_cambian BEFORE UPDATE ON usuarios FOR EACH ROW
BEGIN
  IF OLD.protegido = 1 AND (NEW.protegido = 0 OR NEW.es_dev = 0 OR NEW.id <> OLD.id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'cuenta protegida: no se puede cambiar';
  END IF;
END//
DELIMITER ;
