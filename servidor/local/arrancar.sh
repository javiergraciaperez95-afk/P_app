#!/usr/bin/env bash
# Arranca la API en este ordenador: http://127.0.0.1:8180/api/v1/…
# Usa la base «paglot» y guarda los correos como archivos en servidor/buzon/ (no se envía nada).
# Para pararla: Ctrl+C (MariaDB sigue en marcha; local/parar.sh la para).
#
#   bash servidor/local/arrancar.sh             con la configuración normal (config.php)
#   bash servidor/local/arrancar.sh --pruebas   con la de las pruebas (lo usa probar.sh)
set -euo pipefail
source "$(dirname "$0")/comun.sh"

comprobar_herramientas
[ -f "$SERVIDOR/config.php" ] || fallar "Falta config.php: ejecuta antes bash servidor/local/preparar.sh"
arrancar_bd

CONFIG="$SERVIDOR/config.php"
PUERTO="${PUERTO:-$PUERTO_API}"
if [ "${1:-}" = "--pruebas" ]; then CONFIG="$SERVIDOR/local/config.pruebas.php"; fi
export PAGLOT_CONFIG="$(win "$CONFIG")"

mkdir -p "$HERRAMIENTAS/tmp"
echo "  ✔ API en http://127.0.0.1:$PUERTO/api/v1/salud  (Ctrl+C para pararla)"
# open_basedir: PHP solo puede leer la carpeta del servidor y su carpeta temporal (plan, entrada 39).
exec "$PHP" -c "$(win "$SERVIDOR/local/php.ini")" \
  -d extension_dir="$(win "$PHP_DIR/ext")" \
  -d curl.cainfo="$(win "$HERRAMIENTAS/cacert.pem")" \
  -d open_basedir="$(win "$SERVIDOR");$(win "$HERRAMIENTAS/tmp")" \
  -d sys_temp_dir="$(win "$HERRAMIENTAS/tmp")" \
  -d upload_tmp_dir="$(win "$HERRAMIENTAS/tmp")" \
  -S "127.0.0.1:$PUERTO" -t "$(win "$SERVIDOR/publico")" "$(win "$SERVIDOR/publico/index.php")"
