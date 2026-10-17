# Rutas y funciones compartidas por los scripts de local/ (se cargan con «source»).
# PHP y MariaDB portátiles: _herramientas/servidor_local (no van a GitHub; ver servidor/LEEME.md).

SERVIDOR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROYECTO="$(cd "$SERVIDOR/.." && pwd)"
HERRAMIENTAS="$PROYECTO/_herramientas/servidor_local"
# Otra versión de PHP para probar: PAGLOT_PHP=php-8.3 (carpeta dentro de _herramientas/servidor_local).
PHP_DIR="$HERRAMIENTAS/${PAGLOT_PHP:-php}"
PHP="$PHP_DIR/php.exe"
MARIADB="$HERRAMIENTAS/mariadb/bin/mariadb.exe"
MARIADBD="$HERRAMIENTAS/mariadb/bin/mariadbd.exe"
PUERTO_BD=3307
PUERTO_API=8180
CLAVES="$SERVIDOR/local/.claves"

win() { cygpath -w "$1"; }

fallar() { echo "  ✘ $*" >&2; exit 1; }

comprobar_herramientas() {
  [ -n "${PAGLOT_PHP:-}" ] && echo "  · Con $("$PHP" -r "echo PHP_VERSION;")"
  [ -x "$PHP" ] || fallar "No encuentro PHP en $HERRAMIENTAS/php (mira servidor/LEEME.md)."
  [ -x "$MARIADBD" ] || fallar "No encuentro MariaDB en $HERRAMIENTAS/mariadb (mira servidor/LEEME.md)."
}

# PHP con el php.ini del proyecto, las extensiones portátiles y los certificados para HTTPS.
php_api() {
  "$PHP" -c "$(win "$SERVIDOR/local/php.ini")" \
    -d extension_dir="$(win "$PHP_DIR/ext")" \
    -d curl.cainfo="$(win "$HERRAMIENTAS/cacert.pem")" \
    -d openssl.cafile="$(win "$HERRAMIENTAS/cacert.pem")" \
    "$@"
}

# PHP para herramientas (pruebas, tareas): mismas extensiones, sin las funciones prohibidas.
php_cli() {
  "$PHP" -n \
    -d extension_dir="$(win "$PHP_DIR/ext")" \
    -d extension=curl -d extension=gd -d extension=intl -d extension=mbstring \
    -d extension=openssl -d extension=pdo_mysql -d extension=sodium \
    -d curl.cainfo="$(win "$HERRAMIENTAS/cacert.pem")" \
    -d date.timezone=UTC -d error_reporting=-1 -d display_errors=stderr -d zend.exception_ignore_args=On \
    -d sys_temp_dir="$(win "$HERRAMIENTAS/tmp")" \
    "$@"
}

bd_root() {
  # shellcheck disable=SC1091
  source "$HERRAMIENTAS/local.env"
  "$MARIADB" -h127.0.0.1 -P"$PUERTO_BD" -uroot -p"$MARIADB_ROOT" --default-character-set=utf8mb4 "$@"
}

bd_responde() { bd_root -e "SELECT 1" >/dev/null 2>&1; }

arrancar_bd() {
  if bd_responde; then return 0; fi
  echo "  · Arrancando MariaDB (puerto $PUERTO_BD, solo este ordenador)…"
  mkdir -p "$HERRAMIENTAS/tmp"
  ( "$MARIADBD" --defaults-file="$(win "$HERRAMIENTAS/datos/my.ini")" --console >"$HERRAMIENTAS/mariadb.log" 2>&1 & )
  for _ in $(seq 1 30); do bd_responde && return 0; sleep 1; done
  fallar "MariaDB no arranca. Mira $HERRAMIENTAS/mariadb.log"
}
