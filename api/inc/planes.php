<?php
// El plan de cada persona, comprobado dos veces.
//  1. Aquí: las filas de «suscripciones» vigentes (pagos, regalos, Hucha, Fundadores…) y la familia de la que forma parte.
//  2. En Supabase: cada concesión se apunta también allí (apuntar_en_supabase) y, para darla por buena, Supabase tiene que
//     decir que existe (confirmada_en_supabase). Si las dos bases no coinciden, no hay plan: así no basta con tocar una.
//     La respuesta de Supabase se guarda 6 horas (columna «comprobada») para no preguntar en cada petición.
// La cuenta de desarrollador (es_dev) lo tiene todo siempre, sin preguntar a nadie.
declare(strict_types=1);

const ORDEN_PLANES = ['gratis' => 0, 'plus' => 1, 'max' => 2];

function supabase_rpc(string $funcion, array $datos)
{
    $s = config('supabase');
    $c = curl_init(rtrim($s['url'], '/') . "/rest/v1/rpc/$funcion");
    curl_setopt_array($c, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => ['apikey: ' . $s['clave_servicio'], 'Authorization: Bearer ' . $s['clave_servicio'], 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($datos),
    ]);
    $respuesta = curl_exec($c);
    $estado = curl_getinfo($c, CURLINFO_HTTP_CODE);
    curl_close($c);
    if ($estado < 200 || $estado >= 300) throw new RuntimeException("supabase $estado");
    return json_decode((string) $respuesta, true);
}

/** Apunta una concesión en Supabase (la segunda llave). Si falla, la concesión no vale hasta que se apunte. */
function apuntar_en_supabase(array $s): bool
{
    try {
        supabase_rpc('paglot_apuntar_concesion', [
            'p_referencia' => $s['referencia'], 'p_numero' => (int) $s['usuario_id'], 'p_plan' => $s['plan'],
            'p_hasta' => $s['hasta'], 'p_origen' => $s['origen'],
        ]);
        sql('UPDATE suscripciones SET comprobada = UTC_TIMESTAMP() WHERE referencia = ?', [$s['referencia']]);
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function confirmada_en_supabase(array $s): bool
{
    if ($s['comprobada'] !== null && strtotime($s['comprobada'] . ' UTC') > time() - 6 * 3600) return true;
    try {
        $ok = supabase_rpc('paglot_concesion_valida', ['p_referencia' => $s['referencia'], 'p_numero' => (int) $s['usuario_id'], 'p_plan' => $s['plan']]) === true;
    } catch (Throwable $e) {
        return false;
    }
    if ($ok) sql('UPDATE suscripciones SET comprobada = UTC_TIMESTAMP() WHERE id = ?', [$s['id']]);
    return $ok;
}

/** Da un plan (un pago, un regalo, la Hucha…) y lo apunta en las dos bases. */
function conceder(int $usuario, string $plan, ?string $hasta, string $origen, string $referencia): void
{
    sql('INSERT IGNORE INTO suscripciones (usuario_id, plan, hasta, origen, referencia) VALUES (?, ?, ?, ?, ?)',
        [$usuario, $plan, $hasta, $origen, $referencia]);
    $s = sql('SELECT * FROM suscripciones WHERE referencia = ?', [$referencia])->fetch();
    if ($s) apuntar_en_supabase($s);
}

/** Hasta cuándo dura un plan nuevo de $dias, sumado al que ya tenga del mismo plan (no se pierden días). */
function hasta_sumando(int $usuario, string $plan, int $dias): string
{
    $actual = sql("SELECT MAX(hasta) FROM suscripciones WHERE usuario_id = ? AND plan = ? AND hasta > UTC_TIMESTAMP()", [$usuario, $plan])->fetchColumn();
    $desde = $actual ? strtotime($actual . ' UTC') : time();
    return gmdate('Y-m-d H:i:s', $desde + $dias * 86400);
}

/** El plan efectivo: { plan: gratis|plus|max, hasta, familia: titular|miembro|null, fundador: bool, dev: bool } */
function plan_de(array $u): array
{
    if ((int) $u['es_dev'] === 1) return ['plan' => 'max', 'hasta' => null, 'familia' => null, 'fundador' => false, 'dev' => true];
    $mejor = 'gratis';
    $hasta = null;
    $fundador = false;
    $titularFamilia = false;
    $filas = sql('SELECT * FROM suscripciones WHERE usuario_id = ? AND (hasta IS NULL OR hasta > UTC_TIMESTAMP())', [$u['id']])->fetchAll();
    foreach ($filas as $s) {
        if (!confirmada_en_supabase($s)) continue;
        $p = $s['plan'] === 'familia' ? 'plus' : $s['plan'];
        if ($s['plan'] === 'familia') $titularFamilia = true;
        if ($s['origen'] === 'fundador') $fundador = true;
        if (ORDEN_PLANES[$p] > ORDEN_PLANES[$mejor] || (ORDEN_PLANES[$p] === ORDEN_PLANES[$mejor] && $hasta !== null && ($s['hasta'] === null || $s['hasta'] > $hasta))) {
            $mejor = $p;
            $hasta = $s['hasta'];
        }
    }
    // miembro de una familia cuya titular tiene el plan Familia en vigor (comprobado igual)
    $familia = $titularFamilia ? 'titular' : null;
    if ($mejor === 'gratis') {
        $titular = sql('SELECT titular_id FROM familia_miembros WHERE usuario_id = ?', [$u['id']])->fetchColumn();
        if ($titular) {
            foreach (sql("SELECT * FROM suscripciones WHERE usuario_id = ? AND plan = 'familia' AND (hasta IS NULL OR hasta > UTC_TIMESTAMP())", [$titular])->fetchAll() as $s) {
                if (confirmada_en_supabase($s)) { $mejor = 'plus'; $hasta = $s['hasta']; $familia = 'miembro'; break; }
            }
        }
    }
    return ['plan' => $mejor, 'hasta' => $hasta, 'familia' => $familia, 'fundador' => $fundador, 'dev' => false];
}

/** Para los endpoints de pago: corta si el plan no llega. */
function exigir_plan(array $u, string $minimo): void
{
    if (ORDEN_PLANES[plan_de($u)['plan']] < ORDEN_PLANES[$minimo]) fallo('sin-plan', 402);
}
