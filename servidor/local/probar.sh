#!/usr/bin/env bash
# Ejecuta todas las pruebas de la API contra la base paglot_pruebas (que se vacía en cada caso).
# Arranca dos copias de la API (8181 y 8183, para probar carreras de verdad) y un Resend de mentira (8182),
# y las para al terminar.
#
#   bash servidor/local/probar.sh            todas
#   bash servidor/local/probar.sh progreso   solo las que tengan «progreso» en el nombre
set -euo pipefail
source "$(dirname "$0")/comun.sh"

comprobar_herramientas
[ -f "$SERVIDOR/local/config.pruebas.php" ] || fallar "Falta la configuración de pruebas: ejecuta antes bash servidor/local/preparar.sh"
arrancar_bd

export PAGLOT_CONFIG="$(win "$SERVIDOR/local/config.pruebas.php")"
export PAGLOT_API="http://127.0.0.1:8181"
export PAGLOT_API2="http://127.0.0.1:8183"
FALSO="$HERRAMIENTAS/tmp/falso-resend"
mkdir -p "$FALSO" "$HERRAMIENTAS/tmp"
export FALSO_RESEND_DIR="$(win "$FALSO")"

parar_puerto() {  # para lo que escuche en ese puerto (lo que hayamos arrancado nosotros)
  powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort $1 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1 || true
}
limpiar_servidores() { parar_puerto 8181; parar_puerto 8182; parar_puerto 8183; }
trap limpiar_servidores EXIT
limpiar_servidores

PUERTO=8181 bash "$SERVIDOR/local/arrancar.sh" --pruebas >"$HERRAMIENTAS/tmp/api-8181.log" 2>&1 &
PUERTO=8183 bash "$SERVIDOR/local/arrancar.sh" --pruebas >"$HERRAMIENTAS/tmp/api-8183.log" 2>&1 &
php_cli -S 127.0.0.1:8182 "$(win "$SERVIDOR/pruebas/falso-resend.php")" >"$HERRAMIENTAS/tmp/falso-resend.log" 2>&1 &

for _ in $(seq 1 40); do
  if curl -s -o /dev/null http://127.0.0.1:8181/api/v1/salud && curl -s -o /dev/null http://127.0.0.1:8183/api/v1/salud \
     && curl -s -o /dev/null http://127.0.0.1:8182/; then break; fi
  sleep 0.5
done

# Los avisos que la API escribe a propósito durante las pruebas de fallos van a un archivo, no a la pantalla.
php_cli -d error_log="$(win "$HERRAMIENTAS/tmp/pruebas-avisos.log")" "$(win "$SERVIDOR/pruebas/ejecutar.php")" "${1:-}"
