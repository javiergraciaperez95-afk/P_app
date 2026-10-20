<?php
// La API de Paglot en el hosting (paglot.eu/api/?r=<acción>). Responde siempre JSON. La app (js/servidor.js) la usa
// cuando no está en local; en local usa Supabase con las mismas acciones (_herramientas/supabase-cuentas-v2.sql).
declare(strict_types=1);
require __DIR__ . '/inc/base.php';
require __DIR__ . '/inc/correo.php';
require __DIR__ . '/inc/planes.php';

cors();
set_exception_handler(function (Throwable $e) {
    error_log('[paglot] ' . $e->getMessage());
    responder(['error' => 'servidor'], 500);
});

// de vez en cuando se barre lo caducado (sesiones, códigos, límites, invitaciones)
if (random_int(1, 50) === 1) {
    sql('DELETE FROM sesiones WHERE caduca < UTC_TIMESTAMP()');
    sql('DELETE FROM codigos WHERE caduca < UTC_TIMESTAMP()');
    sql('DELETE FROM limites WHERE caduca < UTC_TIMESTAMP()');
    sql('DELETE FROM familia_invitaciones WHERE caduca < UTC_TIMESTAMP()');
    sql('DELETE FROM contacto WHERE creado < UTC_TIMESTAMP() - INTERVAL 1 YEAR'); // lo que dice el aviso legal
}

const IDIOMAS = ['es', 'en', 'vi'];
const DIAS = ['plus-mes' => 30, 'plus-ano' => 365, 'max-mes' => 30, 'max-ano' => 365, 'familia-ano' => 365];
const PLAN_DE = ['plus-mes' => 'plus', 'plus-ano' => 'plus', 'max-mes' => 'max', 'max-ano' => 'max', 'familia-ano' => 'familia'];

function idioma_de_la_peticion(): string
{
    $i = texto('idioma', 2);
    return in_array($i, IDIOMAS, true) ? $i : 'es';
}

/** Lo que la app sabe de la cuenta: nunca la contraseña ni nada interno. */
function usuario_publico(array $u): array
{
    return ['numero' => (int) $u['id'], 'correo' => $u['correo'], 'nombre' => $u['nombre'], 'idioma' => $u['idioma']] + plan_de($u);
}

function nuevo_codigo(string $correo, string $uso): string
{
    $codigo = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);
    sql('REPLACE INTO codigos (correo, uso, huella, intentos, caduca) VALUES (?, ?, ?, 0, UTC_TIMESTAMP() + INTERVAL 15 MINUTE)',
        [$correo, $uso, huella($codigo)]);
    return $codigo;
}

/** Comprueba un código (5 intentos como mucho) y lo gasta. */
function gastar_codigo(string $correo, string $uso, string $codigo): bool
{
    $fila = sql('SELECT * FROM codigos WHERE correo = ? AND uso = ? AND caduca > UTC_TIMESTAMP()', [$correo, $uso])->fetch();
    if (!$fila || $fila['intentos'] >= 5) return false;
    if (!hash_equals($fila['huella'], huella(preg_replace('/\D/', '', $codigo)))) {
        sql('UPDATE codigos SET intentos = intentos + 1 WHERE correo = ? AND uso = ?', [$correo, $uso]);
        return false;
    }
    sql('DELETE FROM codigos WHERE correo = ? AND uso = ?', [$correo, $uso]);
    return true;
}

function clave_valida(string $clave): bool
{
    return mb_strlen($clave) >= 8 && mb_strlen($clave) <= 200;
}

function zona(): string
{
    $z = texto('zona', 1);
    return in_array($z, ['A', 'B', 'C', 'D'], true) ? $z : 'A';
}

function plazas_fundadores(): int
{
    $vendidas = (int) sql("SELECT COUNT(*) FROM suscripciones WHERE origen = 'fundador'")->fetchColumn();
    return max(0, (int) config('plazas_fundadores') - $vendidas);
}

$ruta = preg_replace('/[^a-z_\/-]/', '', $_GET['r'] ?? '');

switch ($ruta) {
    // ----------------------------------------------------------------- cuenta
    case 'cuenta/registro': {
        limitar('registro', 10, 3600);
        $correo = mb_strtolower(texto('correo'));
        $clave = (string) (entrada()['clave'] ?? '');
        if (!correo_valido($correo)) fallo('correo');
        if (!clave_valida($clave)) fallo('clave-corta');
        $idioma = idioma_de_la_peticion();
        $ya = sql('SELECT * FROM usuarios WHERE correo = ?', [$correo])->fetch();
        if ($ya && (int) $ya['verificado'] === 1) fallo('correo-usado', 409);
        if ($ya) {
            sql('UPDATE usuarios SET clave = ?, nombre = ?, idioma = ? WHERE id = ?', [password_hash($clave, PASSWORD_DEFAULT), texto('nombre', 60), $idioma, $ya['id']]);
            $numero = (int) $ya['id'];
        } else {
            $numero = numero_nuevo();
            sql('INSERT INTO usuarios (id, correo, clave, nombre, idioma) VALUES (?, ?, ?, ?, ?)',
                [$numero, $correo, password_hash($clave, PASSWORD_DEFAULT), texto('nombre', 60), $idioma]);
        }
        mandar($correo, 'verificar', $idioma, ['codigo' => nuevo_codigo($correo, 'verificar'), 'nombre' => texto('nombre', 60) ? ', ' . texto('nombre', 60) : '']);
        responder(['ok' => true, 'verificar' => true]);
    }
    case 'cuenta/verificar': {
        limitar('verificar', 20, 900);
        $correo = mb_strtolower(texto('correo'));
        if (!gastar_codigo($correo, 'verificar', texto('codigo', 12))) fallo('codigo');
        sql('UPDATE usuarios SET verificado = 1 WHERE correo = ?', [$correo]);
        $u = sql('SELECT * FROM usuarios WHERE correo = ?', [$correo])->fetch();
        if (!$u) fallo('codigo');
        mandar($correo, 'bienvenida', $u['idioma'], ['nombre' => $u['nombre'] ? ', ' . $u['nombre'] : '', 'numero' => $u['id']]);
        responder(['token' => abrir_sesion((int) $u['id']), 'usuario' => usuario_publico($u)]);
    }
    case 'cuenta/entrar': {
        limitar('entrar', 20, 900);
        $correo = mb_strtolower(texto('correo'));
        $u = sql('SELECT * FROM usuarios WHERE correo = ?', [$correo])->fetch();
        // misma respuesta si no existe o si la contraseña no es: no se dice qué correos tienen cuenta
        if (!$u || !password_verify((string) (entrada()['clave'] ?? ''), $u['clave'])) fallo('credenciales', 401);
        if ((int) $u['verificado'] !== 1) {
            mandar($correo, 'verificar', $u['idioma'], ['codigo' => nuevo_codigo($correo, 'verificar'), 'nombre' => '']);
            fallo('sin-verificar', 403);
        }
        if (password_needs_rehash($u['clave'], PASSWORD_DEFAULT)) sql('UPDATE usuarios SET clave = ? WHERE id = ?', [password_hash((string) entrada()['clave'], PASSWORD_DEFAULT), $u['id']]);
        responder(['token' => abrir_sesion((int) $u['id']), 'usuario' => usuario_publico($u)]);
    }
    case 'cuenta/pedir-codigo': {
        // entrar sin contraseña o cambiarla: se responde igual exista o no la cuenta
        limitar('pedir-codigo', 6, 900);
        $correo = mb_strtolower(texto('correo'));
        $uso = texto('uso', 10) === 'clave' ? 'clave' : 'entrar';
        $u = correo_valido($correo) ? sql('SELECT * FROM usuarios WHERE correo = ? AND verificado = 1', [$correo])->fetch() : null;
        if ($u) mandar($correo, $uso, $u['idioma'], ['codigo' => nuevo_codigo($correo, $uso)]);
        responder(['ok' => true]);
    }
    case 'cuenta/entrar-codigo': {
        limitar('entrar-codigo', 20, 900);
        $correo = mb_strtolower(texto('correo'));
        if (!gastar_codigo($correo, 'entrar', texto('codigo', 12))) fallo('codigo');
        $u = sql('SELECT * FROM usuarios WHERE correo = ?', [$correo])->fetch();
        if (!$u) fallo('codigo');
        responder(['token' => abrir_sesion((int) $u['id']), 'usuario' => usuario_publico($u)]);
    }
    case 'cuenta/cambiar-clave': {
        limitar('cambiar-clave', 20, 900);
        $correo = mb_strtolower(texto('correo'));
        $clave = (string) (entrada()['clave'] ?? '');
        if (!clave_valida($clave)) fallo('clave-corta');
        if (!gastar_codigo($correo, 'clave', texto('codigo', 12))) fallo('codigo');
        $u = sql('SELECT * FROM usuarios WHERE correo = ?', [$correo])->fetch();
        if (!$u) fallo('codigo');
        sql('UPDATE usuarios SET clave = ? WHERE id = ?', [password_hash($clave, PASSWORD_DEFAULT), $u['id']]);
        sql('DELETE FROM sesiones WHERE usuario_id = ?', [$u['id']]); // fuera de todos los dispositivos
        responder(['token' => abrir_sesion((int) $u['id']), 'usuario' => usuario_publico($u)]);
    }
    case 'cuenta/yo': {
        $u = exigir_usuario();
        responder(['usuario' => usuario_publico($u)]);
    }
    case 'cuenta/nombre': {
        $u = exigir_usuario();
        sql('UPDATE usuarios SET nombre = ? WHERE id = ?', [texto('nombre', 60), $u['id']]);
        responder(['ok' => true]);
    }
    case 'cuenta/salir': {
        $cabecera = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/^Bearer\s+(\S+)$/', $cabecera, $m)) sql('DELETE FROM sesiones WHERE huella = ?', [huella($m[1])]);
        responder(['ok' => true]);
    }
    case 'cuenta/borrar': {
        $u = exigir_usuario();
        if ((int) $u['protegido'] === 1) fallo('protegida', 403);
        if (!password_verify((string) (entrada()['clave'] ?? ''), $u['clave'])) fallo('credenciales', 401);
        sql('DELETE FROM usuarios WHERE id = ?', [$u['id']]);
        mandar($u['correo'], 'borrada', $u['idioma']);
        responder(['ok' => true]);
    }

    // ----------------------------------------------------------------- progreso
    case 'progreso/leer': {
        $u = exigir_usuario();
        $cursos = [];
        foreach (sql('SELECT curso, datos, cuando FROM progreso WHERE usuario_id = ?', [$u['id']]) as $f) {
            $cursos[$f['curso']] = ['datos' => json_decode((string) gzuncompress($f['datos']), true), 'cuando' => (int) $f['cuando']];
        }
        responder(['cursos' => $cursos]);
    }
    case 'progreso/guardar': {
        $u = exigir_usuario();
        limitar('guardar-' . $u['id'], 40, 60);
        $curso = preg_replace('/[^a-z]/', '', texto('curso', 8));
        $datos = entrada()['datos'] ?? null;
        if ($curso === '' || !is_array($datos)) fallo('datos');
        $json = json_encode($datos, JSON_UNESCAPED_UNICODE);
        if (strlen($json) > 2_000_000) fallo('demasiados-datos', 413);
        sql('REPLACE INTO progreso (usuario_id, curso, datos, cuando) VALUES (?, ?, ?, ?)',
            [$u['id'], $curso, gzcompress($json, 6), (int) (entrada()['cuando'] ?? 0)]);
        responder(['ok' => true]);
    }

    // ----------------------------------------------------------------- regalos
    case 'regalo/canjear': {
        $u = exigir_usuario();
        limitar('regalo', 10, 3600);
        $codigo = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', texto('codigo', 40)));
        $h = hash('sha256', $codigo);
        db()->beginTransaction();
        $r = sql('SELECT * FROM regalos WHERE huella = ? FOR UPDATE', [$h])->fetch();
        if (!$r) { db()->rollBack(); fallo('regalo-no-existe', 404); }
        if ($r['usado_por'] !== null) { db()->rollBack(); fallo('regalo-usado', 409); }
        sql('UPDATE regalos SET usado_por = ?, usado_en = UTC_TIMESTAMP() WHERE huella = ?', [$u['id'], $h]);
        db()->commit();
        $hasta = hasta_sumando((int) $u['id'], 'max', $r['tipo'] === 'max-ano' ? 365 : 30);
        conceder((int) $u['id'], 'max', $hasta, 'regalo', 'regalo-' . substr($h, 0, 40));
        mandar($u['correo'], 'regalo-canjeado', $u['idioma'], ['nombre' => $u['nombre'] ? ', ' . $u['nombre'] : '', 'hasta' => ' (' . substr($hasta, 0, 10) . ')']);
        responder(['ok' => true, 'usuario' => usuario_publico($u)]);
    }

    // ----------------------------------------------------------------- Fundadores
    case 'fundadores/plazas': {
        responder(['restantes' => plazas_fundadores(), 'total' => (int) config('plazas_fundadores')]);
    }

    // ----------------------------------------------------------------- la Hucha
    case 'hucha/estado': {
        $u = exigir_usuario();
        $saldo = (int) sql('SELECT COALESCE(SUM(centimos), 0) FROM hucha WHERE usuario_id = ?', [$u['id']])->fetchColumn();
        $hoy = (int) sql("SELECT COUNT(*) FROM hucha WHERE usuario_id = ? AND motivo = 'anuncio' AND creado >= UTC_DATE()", [$u['id']])->fetchColumn();
        responder(['saldo' => $saldo, 'anunciosHoy' => $hoy, 'anunciosMax' => (int) config('hucha')['anuncios_al_dia'],
            'porAnuncio' => (int) config('hucha')['centimos_por_anuncio'], 'precios' => config('precios')[zona()]]);
    }
    case 'hucha/recompensa': {
        // la llama la red de anuncios (verificación en el servidor, SSV) cuando alguien termina de ver un anuncio:
        // ?usuario=<número>&ref=<id de la recompensa>&firma=hmac_sha256(clave_ssv, "usuario|ref")
        $usuario = (int) ($_GET['usuario'] ?? 0);
        $ref = preg_replace('/[^A-Za-z0-9_.:-]/', '', (string) ($_GET['ref'] ?? ''));
        $firma = (string) ($_GET['firma'] ?? '');
        $h = config('hucha');
        if ($ref === '' || !hash_equals(hash_hmac('sha256', "$usuario|$ref", $h['clave_ssv']), $firma)) fallo('firma', 403);
        $hoy = (int) sql("SELECT COUNT(*) FROM hucha WHERE usuario_id = ? AND motivo = 'anuncio' AND creado >= UTC_DATE()", [$usuario])->fetchColumn();
        if ($hoy >= (int) $h['anuncios_al_dia']) responder(['ok' => true, 'tope' => true]);
        sql("INSERT IGNORE INTO hucha (usuario_id, centimos, motivo, referencia) VALUES (?, ?, 'anuncio', ?)", [$usuario, (int) $h['centimos_por_anuncio'], "anuncio-$ref"]);
        responder(['ok' => true]);
    }
    case 'hucha/gastar': {
        $u = exigir_usuario();
        $producto = texto('producto', 12);
        if (!in_array($producto, ['plus-mes', 'max-mes'], true)) fallo('producto');
        $precio = (int) config('precios')[zona()][$producto];
        db()->beginTransaction();
        $saldo = (int) sql('SELECT COALESCE(SUM(centimos), 0) FROM hucha WHERE usuario_id = ? FOR UPDATE', [$u['id']])->fetchColumn();
        if ($saldo < $precio) { db()->rollBack(); fallo('saldo', 402); }
        $ref = 'hucha-' . bin2hex(random_bytes(8));
        sql('INSERT INTO hucha (usuario_id, centimos, motivo, referencia) VALUES (?, ?, ?, ?)', [$u['id'], -$precio, $producto, $ref]);
        db()->commit();
        $plan = PLAN_DE[$producto];
        conceder((int) $u['id'], $plan, hasta_sumando((int) $u['id'], $plan, DIAS[$producto]), 'hucha', $ref);
        responder(['ok' => true, 'usuario' => usuario_publico($u)]);
    }

    // ----------------------------------------------------------------- Familia
    case 'familia/estado': {
        $u = exigir_usuario();
        $titular = sql('SELECT titular_id FROM familias WHERE titular_id = ?', [$u['id']])->fetchColumn()
            ?: sql('SELECT titular_id FROM familia_miembros WHERE usuario_id = ?', [$u['id']])->fetchColumn();
        if (!$titular) responder(['familia' => null]);
        $miembros = sql('SELECT u.id AS numero, u.nombre FROM familia_miembros m JOIN usuarios u ON u.id = m.usuario_id WHERE m.titular_id = ?', [$titular])->fetchAll();
        responder(['familia' => ['titular' => (int) $titular, 'soyTitular' => (int) $titular === (int) $u['id'], 'miembros' => $miembros, 'plazas' => 5]]);
    }
    case 'familia/invitar': {
        $u = exigir_usuario();
        limitar('familia-invitar', 10, 3600);
        if (plan_de($u)['familia'] !== 'titular') fallo('sin-plan', 402);
        $correo = mb_strtolower(texto('correo'));
        if (!correo_valido($correo)) fallo('correo');
        sql('INSERT IGNORE INTO familias (titular_id) VALUES (?)', [$u['id']]);
        $n = (int) sql('SELECT COUNT(*) FROM familia_miembros WHERE titular_id = ?', [$u['id']])->fetchColumn();
        if ($n >= 5) fallo('familia-llena', 409);
        $codigo = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        sql('INSERT INTO familia_invitaciones (huella, titular_id, correo, caduca) VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL 7 DAY)', [huella($codigo), $u['id'], $correo]);
        mandar($correo, 'familia', idioma_de_la_peticion(), ['codigo' => $codigo, 'titular' => $u['nombre'] ?: $u['correo']]);
        responder(['ok' => true]);
    }
    case 'familia/unirse': {
        $u = exigir_usuario();
        limitar('familia-unirse', 10, 3600);
        $codigo = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', texto('codigo', 20)));
        $inv = sql('SELECT * FROM familia_invitaciones WHERE huella = ? AND caduca > UTC_TIMESTAMP()', [huella($codigo)])->fetch();
        if (!$inv) fallo('codigo');
        $n = (int) sql('SELECT COUNT(*) FROM familia_miembros WHERE titular_id = ?', [$inv['titular_id']])->fetchColumn();
        if ($n >= 5) fallo('familia-llena', 409);
        if ((int) $inv['titular_id'] === (int) $u['id']) fallo('codigo');
        sql('DELETE FROM familia_miembros WHERE usuario_id = ?', [$u['id']]);
        sql('INSERT INTO familia_miembros (titular_id, usuario_id) VALUES (?, ?)', [$inv['titular_id'], $u['id']]);
        sql('DELETE FROM familia_invitaciones WHERE huella = ?', [huella($codigo)]);
        responder(['ok' => true, 'usuario' => usuario_publico($u)]);
    }
    case 'familia/quitar': {
        $u = exigir_usuario();
        $numero = (int) (entrada()['numero'] ?? 0);
        // la titular quita a alguien; cualquiera puede salirse a sí mismo
        sql('DELETE FROM familia_miembros WHERE usuario_id = ? AND (titular_id = ? OR usuario_id = ?)', [$numero, $u['id'], $u['id']]);
        responder(['ok' => true]);
    }

    // ----------------------------------------------------------------- pagos (Stripe)
    case 'pagos/checkout': {
        $u = exigir_usuario();
        limitar('checkout', 20, 3600);
        $producto = texto('producto', 20);
        $regalo = !empty(entrada()['regalo']);
        $precios = config('precios')[zona()];
        $base = $regalo ? str_replace('regalo-', '', $producto) : $producto;
        if (!isset($precios[$base]) || ($regalo && !in_array($base, ['max-mes', 'max-ano'], true))) fallo('producto');
        if ($base === 'fundadores' && plazas_fundadores() <= 0) fallo('fundadores-agotado', 409);
        $web = config('web');
        $datos = [
            'mode' => 'payment',
            'success_url' => "$web/#/perfil?pago=ok",
            'cancel_url' => "$web/#/precios",
            'customer_email' => $u['correo'],
            'client_reference_id' => (string) $u['id'],
            'metadata[usuario]' => (string) $u['id'],
            'metadata[producto]' => ($regalo ? 'regalo-' : '') . $base,
            'metadata[zona]' => zona(),
            'line_items[0][quantity]' => 1,
            'line_items[0][price_data][currency]' => 'eur',
            'line_items[0][price_data][unit_amount]' => $precios[$base],
            'line_items[0][price_data][product_data][name]' => 'Paglot ' . ($regalo ? 'regalo ' : '') . $base,
            'automatic_tax[enabled]' => 'true',
        ];
        $c = curl_init('https://api.stripe.com/v1/checkout/sessions');
        curl_setopt_array($c, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15,
            CURLOPT_USERPWD => config('stripe')['secreta'] . ':', CURLOPT_POSTFIELDS => http_build_query($datos)]);
        $r = json_decode((string) curl_exec($c), true);
        curl_close($c);
        if (empty($r['url'])) fallo('pago', 502);
        responder(['url' => $r['url']]);
    }
    case 'pagos/stripe': {
        // el webhook de Stripe: se comprueba la firma antes de hacer nada
        $crudo = file_get_contents('php://input') ?: '';
        $cab = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        parse_str(str_replace(',', '&', $cab), $partes);
        $firmado = hash_hmac('sha256', ($partes['t'] ?? '') . '.' . $crudo, config('stripe')['webhook']);
        if (empty($partes['v1']) || !hash_equals($firmado, (string) $partes['v1']) || abs(time() - (int) ($partes['t'] ?? 0)) > 300) fallo('firma', 400);
        $evento = json_decode($crudo, true);
        if (($evento['type'] ?? '') !== 'checkout.session.completed') responder(['ok' => true]);
        $s = $evento['data']['object'];
        if (($s['payment_status'] ?? '') !== 'paid') responder(['ok' => true]);
        $usuario = (int) ($s['metadata']['usuario'] ?? 0);
        $producto = (string) ($s['metadata']['producto'] ?? '');
        $ref = 'stripe-' . $s['id'];
        sql('INSERT IGNORE INTO pagos (referencia, usuario_id, producto, centimos, moneda, pais) VALUES (?, ?, ?, ?, ?, ?)',
            [$ref, $usuario, $producto, (int) $s['amount_total'], strtoupper((string) $s['currency']), $s['customer_details']['address']['country'] ?? null]);
        $u = sql('SELECT * FROM usuarios WHERE id = ?', [$usuario])->fetch();
        if (!$u) responder(['ok' => true]);
        if (str_starts_with($producto, 'regalo-')) {
            // un regalo: se hace el código, se guarda su huella y se manda a quien lo compró
            $letras = '';
            for ($i = 0; $i < 12; $i++) $letras .= '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[random_int(0, 31)];
            $codigo = 'PGM-' . substr($letras, 0, 4) . '-' . substr($letras, 4, 4) . '-' . substr($letras, 8);
            sql('INSERT INTO regalos (huella, tipo, lote) VALUES (?, ?, ?)', [hash('sha256', str_replace('-', '', $codigo)), substr($producto, 7), $ref]);
            mandar($u['correo'], 'regalo-comprado', $u['idioma'], ['codigo' => $codigo, 'tipo' => substr($producto, 7)]);
        } elseif ($producto === 'fundadores') {
            conceder($usuario, 'plus', null, 'fundador', $ref);
            mandar($u['correo'], 'plan', $u['idioma'], ['plan' => 'Fundadores (Plus)', 'nombre' => $u['nombre'] ? ', ' . $u['nombre'] : '', 'hasta' => '']);
        } elseif (isset(PLAN_DE[$producto])) {
            $plan = PLAN_DE[$producto];
            $hasta = hasta_sumando($usuario, $plan, DIAS[$producto]);
            if ($plan === 'familia') sql('INSERT IGNORE INTO familias (titular_id) VALUES (?)', [$usuario]);
            conceder($usuario, $plan, $hasta, 'stripe', $ref);
            mandar($u['correo'], 'plan', $u['idioma'], ['plan' => ucfirst($plan), 'nombre' => $u['nombre'] ? ', ' . $u['nombre'] : '', 'hasta' => ' (' . substr($hasta, 0, 10) . ')']);
        }
        responder(['ok' => true]);
    }

    // ----------------------------------------------------------------- contacto
    case 'contacto/enviar': {
        limitar('contacto', 5, 3600);
        // el captcha: Cloudflare Turnstile comprueba el token con la clave secreta
        $c = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
        curl_setopt_array($c, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
            CURLOPT_POSTFIELDS => http_build_query(['secret' => config('turnstile_secreta'), 'response' => texto('captcha', 2048), 'remoteip' => ip()])]);
        $v = json_decode((string) curl_exec($c), true);
        curl_close($c);
        if (empty($v['success'])) fallo('captcha', 403);
        $nombre = texto('nombre', 60);
        $correo = mb_strtolower(texto('correo'));
        $asunto = preg_replace('/[^a-z-]/', '', texto('asunto', 24));
        $mensaje = texto('mensaje', 4000);
        if ($nombre === '' || !correo_valido($correo) || $mensaje === '') fallo('datos');
        sql('INSERT INTO contacto (nombre, correo, asunto, mensaje) VALUES (?, ?, ?, ?)', [$nombre, $correo, $asunto, $mensaje]);
        $interno = "De: $nombre <$correo>\nAsunto: $asunto\n\n$mensaje";
        enviar_resend(config('resend')['contacto_a'], "[Contacto · $asunto] $nombre", nl2br(htmlspecialchars($interno)), $interno, $correo);
        mandar($correo, 'contacto', idioma_de_la_peticion(), ['nombre' => ", $nombre"], $mensaje);
        responder(['ok' => true]);
    }

    // ----------------------------------------------------------------- laboratorio y errores
    // Las mismas llamadas (y respuestas) que las funciones de Supabase que usa la app (_herramientas/supabase-errores-e-ideas.sql),
    // para que js/vistas/laboratorio.js y js/errores.js no cambien: js/nube.js las manda aquí en el hosting.
    case 'rpc/paglot_ideas_ver': {
        $quien = preg_replace('/[^a-f0-9]/', '', texto('p_quien', 32));
        $filas = sql('SELECT i.id, i.texto, i.nombre AS autora, i.votos, UNIX_TIMESTAMP(i.creada) * 1000 AS creada,
                             EXISTS (SELECT 1 FROM ideas_votos v WHERE v.idea_id = i.id AND v.marca = ?) AS votada
                      FROM ideas i WHERE i.avisos < 3 ORDER BY i.votos DESC, i.creada LIMIT 200', [$quien])->fetchAll();
        foreach ($filas as &$f) { $f['id'] = (int) $f['id']; $f['votos'] = (int) $f['votos']; $f['creada'] = (int) $f['creada']; $f['votada'] = (bool) $f['votada']; }
        echo json_encode($filas, JSON_UNESCAPED_UNICODE); exit;
    }
    case 'rpc/paglot_idea_nueva': {
        limitar('idea', 10, 3600);
        $quien = texto('p_quien', 32);
        $textoIdea = texto('p_texto', 400);
        $autora = texto('p_autora', 32);
        if (!preg_match('/^[0-9a-f]{32}$/', $quien)) fallo('quien');
        if (mb_strlen($textoIdea) < 3 || mb_strlen($textoIdea) > 180) responder(['message' => 'texto'], 400);
        if (preg_match('~(https?://|www\.|\.(com|net|org|io|es|ly)\b)~i', $textoIdea . ' ' . $autora)) responder(['message' => 'enlace'], 400);
        if ((int) sql('SELECT COUNT(*) FROM ideas WHERE marca = ? AND creada > UTC_TIMESTAMP() - INTERVAL 1 DAY', [$quien])->fetchColumn() >= 3
            || (int) sql('SELECT COUNT(*) FROM ideas WHERE creada > UTC_TIMESTAMP() - INTERVAL 1 HOUR')->fetchColumn() >= 60) responder(['message' => 'limite'], 429);
        sql('INSERT INTO ideas (texto, nombre, marca) VALUES (?, ?, ?)', [$textoIdea, $autora, $quien]);
        echo json_encode((int) db()->lastInsertId()); exit;
    }
    case 'rpc/paglot_votar': {
        limitar('votar', 120, 3600);
        $quien = texto('p_quien', 32);
        $idea = (int) (entrada()['p_idea'] ?? 0);
        if (!preg_match('/^[0-9a-f]{32}$/', $quien)) fallo('quien');
        if (!empty(entrada()['p_si'])) {
            if (sql('INSERT IGNORE INTO ideas_votos (idea_id, marca) VALUES (?, ?)', [$idea, $quien])->rowCount()) sql('UPDATE ideas SET votos = votos + 1 WHERE id = ?', [$idea]);
        } elseif (sql('DELETE FROM ideas_votos WHERE idea_id = ? AND marca = ?', [$idea, $quien])->rowCount()) {
            sql('UPDATE ideas SET votos = GREATEST(votos, 1) - 1 WHERE id = ?', [$idea]);
        }
        echo json_encode((int) sql('SELECT votos FROM ideas WHERE id = ?', [$idea])->fetchColumn()); exit;
    }
    case 'rpc/paglot_denunciar': {
        limitar('avisar', 20, 3600);
        sql('UPDATE ideas SET avisos = LEAST(avisos + 1, 255) WHERE id = ?', [(int) (entrada()['p_idea'] ?? 0)]);
        echo 'true'; exit;
    }
    case 'rpc/paglot_error': {
        limitar('errores', 30, 3600);
        $p = entrada()['p'] ?? [];
        $t = fn($k, $n) => is_string($p[$k] ?? null) ? mb_substr($p[$k], 0, $n) : '';
        sql('INSERT INTO errores (mensaje, pantalla, curso, version, navegador) VALUES (?, ?, ?, ?, ?)',
            [mb_substr($t('mensaje', 400) . ' @ ' . $t('donde', 200), 0, 500), $t('pantalla', 80), $t('curso', 8), $t('version', 60), $t('navegador', 80)]);
        sql('DELETE FROM errores WHERE creado < UTC_TIMESTAMP() - INTERVAL 90 DAY');
        echo 'true'; exit;
    }

    default:
        fallo('ruta', 404);
}
