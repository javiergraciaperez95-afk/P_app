#!/usr/bin/env bash
# Para MariaDB de este ordenador (la API se para con Ctrl+C en su ventana).
#
#   bash servidor/local/parar.sh
set -euo pipefail
source "$(dirname "$0")/comun.sh"
if bd_responde; then
  bd_root -e "SHUTDOWN" && echo "  ✔ MariaDB parada."
else
  echo "  · MariaDB no estaba en marcha."
fi
