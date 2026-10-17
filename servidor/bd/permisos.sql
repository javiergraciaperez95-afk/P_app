-- =====================================================================
-- Usuarios de la base de datos y sus permisos (plan de seguridad, entrada 48).
--
-- Antes de ejecutarlo, cambia BASE, HOST, CLAVE_APP y CLAVE_TAREAS por la base, el equipo desde el que
-- se conecta PHP («localhost» en el servidor, que usa el socket; «127.0.0.1» en el ordenador) y por dos
-- contraseñas largas y aleatorias (las mismas que pongas en config.php).
-- En el ordenador lo hace solo servidor/local/preparar.sh.
--
--   paglot_app     lo que usa la API: lee y escribe lo suyo, y en «eventos» solo puede AÑADIR.
--   paglot_tareas  la limpieza nocturna y el reenvío de correos: además puede leer y borrar eventos.
-- Ninguno puede crear ni borrar tablas, ni tocar otras bases.
-- =====================================================================

CREATE USER IF NOT EXISTS 'paglot_app'@'HOST' IDENTIFIED BY 'CLAVE_APP';
ALTER USER 'paglot_app'@'HOST' IDENTIFIED BY 'CLAVE_APP';
CREATE USER IF NOT EXISTS 'paglot_tareas'@'HOST' IDENTIFIED BY 'CLAVE_TAREAS';
ALTER USER 'paglot_tareas'@'HOST' IDENTIFIED BY 'CLAVE_TAREAS';

GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.usuarios           TO 'paglot_app'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.sesiones           TO 'paglot_app'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.tokens             TO 'paglot_app'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.progreso           TO 'paglot_app'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.progreso_historial TO 'paglot_app'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.limites            TO 'paglot_app'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.correos_pendientes TO 'paglot_app'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.codigos            TO 'paglot_app'@'HOST';
GRANT INSERT                         ON BASE.eventos            TO 'paglot_app'@'HOST';

GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.usuarios           TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.sesiones           TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.tokens             TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.progreso           TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.progreso_historial TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.limites            TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.correos_pendientes TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, UPDATE, DELETE ON BASE.codigos            TO 'paglot_tareas'@'HOST';
GRANT SELECT, INSERT, DELETE         ON BASE.eventos            TO 'paglot_tareas'@'HOST';

FLUSH PRIVILEGES;
