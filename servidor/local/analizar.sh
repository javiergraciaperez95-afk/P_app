#!/usr/bin/env bash
# Análisis estático del código con PHPStan (descargado en _herramientas/servidor_local/phpstan.phar).
#
#   bash servidor/local/analizar.sh
set -euo pipefail
source "$(dirname "$0")/comun.sh"
[ -f "$HERRAMIENTAS/phpstan.phar" ] || fallar "Falta phpstan.phar en $HERRAMIENTAS (mira servidor/LEEME.md)."
cd "$SERVIDOR"
php_cli -d memory_limit=1G "$(win "$HERRAMIENTAS/phpstan.phar")" analyse --no-progress --configuration=phpstan.neon "$@"
