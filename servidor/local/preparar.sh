#!/usr/bin/env bash
# Prepara la API en este ordenador: bases de datos (paglot y paglot_pruebas), sus usuarios con
# permisos mínimos, y los archivos de configuración con contraseñas aleatorias.
# Se puede ejecutar las veces que haga falta: no borra datos.
#
#   bash servidor/local/preparar.sh
set -euo pipefail
source "$(dirname "$0")/comun.sh"

comprobar_herramientas
arrancar_bd

# Contraseñas: se generan una vez y se guardan en local/.claves (no va a GitHub).
if [ ! -f "$CLAVES" ]; then
  echo "  · Generando contraseñas nuevas para la base de datos…"
  {
    echo "CLAVE_APP=$(php_cli -r 'echo bin2hex(random_bytes(24));')"
    echo "CLAVE_TAREAS=$(php_cli -r 'echo bin2hex(random_bytes(24));')"
    echo "SECRETO=$(php_cli -r 'echo bin2hex(random_bytes(32));')"
  } > "$CLAVES"
fi
# shellcheck disable=SC1090
source "$CLAVES"

for BASE in paglot paglot_pruebas; do
  echo "  · Base de datos $BASE"
  bd_root -e "CREATE DATABASE IF NOT EXISTS \`$BASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
  bd_root "$BASE" < "$SERVIDOR/bd/esquema.sql"
  sed -e "s/BASE\./\`$BASE\`./g" -e "s/'HOST'/'127.0.0.1'/g" \
      -e "s/CLAVE_APP/$CLAVE_APP/g" -e "s/CLAVE_TAREAS/$CLAVE_TAREAS/g" \
      "$SERVIDOR/bd/permisos.sql" | bd_root
done

escribir_config() {  # $1 archivo, $2 base, $3 buzón, $4 registro de errores
  cat > "$1" <<EOF
<?php
// Generado por servidor/local/preparar.sh: configuración para ESTE ordenador. No va a GitHub.
return [
    'entorno' => 'local',
    'secreto' => '$SECRETO',
    'bd' => [
        'dsn'               => 'mysql:host=127.0.0.1;port=$PUERTO_BD;dbname=$2;charset=utf8mb4',
        'usuario'           => 'paglot_app',
        'contrasena'        => '$CLAVE_APP',
        'tareas_usuario'    => 'paglot_tareas',
        'tareas_contrasena' => '$CLAVE_TAREAS',
    ],
    // La app en el ordenador («Abrir Paglot.cmd») va en el puerto 8100.
    'origenes' => ['http://localhost:8100', 'http://127.0.0.1:8100'],
    'proxys' => [],
    'correo' => [
        'modo'      => 'archivo',
        'remitente' => 'Paglot <hola@correo.paglot.app>',
        'resend_clave' => '',
        'resend_url'   => 'https://api.resend.com/emails',
        'buzon'     => $3,
        'enlace'    => 'http://localhost:8100/#/enlace/%1\$s/%2\$s',
    ],
    'pwned' => false,
    'app_minima' => '1.0.0',
    'registro_errores' => $4,
];
EOF
}

escribir_config "$SERVIDOR/config.php" paglot "__DIR__ . '/buzon'" "__DIR__ . '/registros/errores.log'"
escribir_config "$SERVIDOR/local/config.pruebas.php" paglot_pruebas "__DIR__ . '/pruebas-buzon'" "__DIR__ . '/pruebas-registros/errores.log'"

echo "  ✔ Listo. Bases: paglot (para usar) y paglot_pruebas (la vacían las pruebas)."
