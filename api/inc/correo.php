<?php
// Los correos de Paglot, enviados con Resend (https://resend.com/docs/api-reference/emails/send-email).
// Cada correo es una plantilla con sus textos en español, inglés y vietnamita, metida en el mismo diseño: el papel
// crema de la app, la tinta morada, el logo y un botón rojo. Todo con estilos en línea (los programas de correo no
// leen hojas de estilo) y con una versión de solo texto.
declare(strict_types=1);

const PLANTILLAS = [
    'verificar' => [
        'es' => ['Tu código para confirmar la cuenta', '¡Hola{nombre}! Este es tu código para confirmar tu cuenta de Paglot:', 'Caduca en 15 minutos. Si no has creado una cuenta, ignora este correo.'],
        'en' => ['Your code to confirm your account', 'Hi{nombre}! Here is your code to confirm your Paglot account:', 'It expires in 15 minutes. If you didn’t create an account, just ignore this email.'],
        'vi' => ['Mã xác nhận tài khoản của bạn', 'Xin chào{nombre}! Đây là mã để xác nhận tài khoản Paglot của bạn:', 'Mã hết hạn sau 15 phút. Nếu bạn không tạo tài khoản, hãy bỏ qua email này.'],
    ],
    'entrar' => [
        'es' => ['Tu código para entrar en Paglot', 'Para entrar sin contraseña, escribe este código en la app:', 'Caduca en 15 minutos. Si no lo has pedido tú, no pasa nada: sin el código nadie puede entrar.'],
        'en' => ['Your code to sign in to Paglot', 'To sign in without your password, type this code in the app:', 'It expires in 15 minutes. If you didn’t ask for it, don’t worry: nobody can sign in without the code.'],
        'vi' => ['Mã đăng nhập Paglot của bạn', 'Để đăng nhập không cần mật khẩu, hãy nhập mã này vào ứng dụng:', 'Mã hết hạn sau 15 phút. Nếu không phải bạn yêu cầu, đừng lo: không ai vào được nếu không có mã.'],
    ],
    'clave' => [
        'es' => ['Cambia tu contraseña de Paglot', 'Has pedido cambiar tu contraseña. Escribe este código en la app para elegir una nueva:', 'Caduca en 15 minutos. Si no lo has pedido tú, tu contraseña sigue igual.'],
        'en' => ['Change your Paglot password', 'You asked to change your password. Type this code in the app to choose a new one:', 'It expires in 15 minutes. If you didn’t ask for it, your password stays the same.'],
        'vi' => ['Đổi mật khẩu Paglot', 'Bạn đã yêu cầu đổi mật khẩu. Nhập mã này vào ứng dụng để chọn mật khẩu mới:', 'Mã hết hạn sau 15 phút. Nếu không phải bạn yêu cầu, mật khẩu vẫn giữ nguyên.'],
    ],
    'bienvenida' => [
        'es' => ['¡Te damos la bienvenida a Paglot!', '¡Ya tienes tu cuenta{nombre}! Tu número de cuenta es el {numero}. Tu progreso se guarda solo y lo tienes en todos tus dispositivos.', 'Tus tutoras te esperan. Un poquito cada día y verás cómo se queda.'],
        'en' => ['Welcome to Paglot!', 'Your account is ready{nombre}! Your account number is {numero}. Your progress saves itself and follows you on every device.', 'Your tutors are waiting. A little every day and you’ll see it stick.'],
        'vi' => ['Chào mừng đến với Paglot!', 'Tài khoản của bạn đã sẵn sàng{nombre}! Số tài khoản của bạn là {numero}. Tiến độ tự lưu và có trên mọi thiết bị.', 'Các cô giáo đang chờ bạn. Mỗi ngày một chút là nhớ lâu.'],
    ],
    'plan' => [
        'es' => ['Tu plan {plan} ya está activo', '¡Gracias{nombre}! Hemos recibido tu pago y tu plan {plan} ya está activo{hasta}.', 'Puedes ver y cancelar tu plan cuando quieras desde Perfil. Tu precio no sube mientras sigas suscrito.'],
        'en' => ['Your {plan} plan is active', 'Thank you{nombre}! We’ve received your payment and your {plan} plan is now active{hasta}.', 'You can see and cancel your plan any time from Profile. Your price won’t go up while you stay subscribed.'],
        'vi' => ['Gói {plan} của bạn đã kích hoạt', 'Cảm ơn bạn{nombre}! Chúng tôi đã nhận thanh toán và gói {plan} đã được kích hoạt{hasta}.', 'Bạn có thể xem và hủy gói bất cứ lúc nào trong Hồ sơ. Giá không tăng chừng nào bạn còn đăng ký.'],
    ],
    'regalo-comprado' => [
        'es' => ['Tu regalo de Paglot Max', '¡Gracias por regalar Paglot! Este es el código de tu regalo ({tipo}). Dáselo a quien quieras: lo canjea en paglot.eu → Perfil → Canjear un regalo.', 'Solo se puede usar una vez. El plan empieza el día que se canjea.'],
        'en' => ['Your Paglot Max gift', 'Thank you for giving Paglot! Here is your gift code ({tipo}). Give it to anyone you like: they redeem it at paglot.eu → Profile → Redeem a gift.', 'It can only be used once. The plan starts the day it’s redeemed.'],
        'vi' => ['Quà tặng Paglot Max của bạn', 'Cảm ơn bạn đã tặng Paglot! Đây là mã quà tặng ({tipo}). Hãy tặng cho người bạn muốn: họ đổi tại paglot.eu → Hồ sơ → Đổi quà tặng.', 'Mã chỉ dùng được một lần. Gói bắt đầu từ ngày đổi.'],
    ],
    'regalo-canjeado' => [
        'es' => ['¡Tu regalo ya está activo!', '¡Qué bien{nombre}! Has canjeado un regalo: tu plan Max está activo{hasta}.', 'Que lo disfrutes. Tus tutoras ya te están esperando.'],
        'en' => ['Your gift is active!', 'Great{nombre}! You’ve redeemed a gift: your Max plan is active{hasta}.', 'Enjoy it. Your tutors are already waiting for you.'],
        'vi' => ['Quà tặng của bạn đã kích hoạt!', 'Tuyệt quá{nombre}! Bạn đã đổi quà: gói Max đã kích hoạt{hasta}.', 'Chúc bạn học vui. Các cô giáo đang chờ bạn.'],
    ],
    'familia' => [
        'es' => ['Te invitan al plan Familia de Paglot', '{titular} te invita a su plan Familia: Plus para ti, con tu propia cuenta y tu propio progreso. Este es tu código de invitación:', 'Entra en paglot.eu → Perfil → Familia y escríbelo. Caduca en 7 días.'],
        'en' => ['You’re invited to a Paglot Family plan', '{titular} invites you to their Family plan: Plus for you, with your own account and progress. Here is your invitation code:', 'Go to paglot.eu → Profile → Family and type it. It expires in 7 days.'],
        'vi' => ['Bạn được mời vào gói Gia đình của Paglot', '{titular} mời bạn vào gói Gia đình: Plus cho bạn, với tài khoản và tiến độ riêng. Đây là mã mời của bạn:', 'Vào paglot.eu → Hồ sơ → Gia đình và nhập mã. Mã hết hạn sau 7 ngày.'],
    ],
    'contacto' => [
        'es' => ['Hemos recibido tu mensaje', '¡Gracias por escribirnos{nombre}! Hemos recibido tu mensaje y te responderemos en cuanto podamos (normalmente en unos días).', 'Esto es lo que nos has enviado:'],
        'en' => ['We’ve received your message', 'Thanks for writing to us{nombre}! We’ve received your message and will reply as soon as we can (usually within a few days).', 'This is what you sent us:'],
        'vi' => ['Chúng tôi đã nhận tin nhắn của bạn', 'Cảm ơn bạn đã viết cho chúng tôi{nombre}! Chúng tôi đã nhận tin nhắn và sẽ trả lời sớm nhất có thể (thường trong vài ngày).', 'Đây là nội dung bạn đã gửi:'],
    ],
    'borrada' => [
        'es' => ['Tu cuenta de Paglot se ha borrado', 'Como pediste, hemos borrado tu cuenta y todo tu progreso de nuestros servidores.', 'Si algún día vuelves, aquí estaremos. ¡Gracias por aprender con Paglot!'],
        'en' => ['Your Paglot account has been deleted', 'As you asked, we’ve deleted your account and all your progress from our servers.', 'If you ever come back, we’ll be here. Thanks for learning with Paglot!'],
        'vi' => ['Tài khoản Paglot của bạn đã bị xóa', 'Theo yêu cầu, chúng tôi đã xóa tài khoản và toàn bộ tiến độ của bạn khỏi máy chủ.', 'Nếu một ngày bạn quay lại, chúng tôi vẫn ở đây. Cảm ơn bạn đã học cùng Paglot!'],
    ],
];

const BOTON = ['es' => 'Abrir Paglot', 'en' => 'Open Paglot', 'vi' => 'Mở Paglot'];
const PIE = [
    'es' => 'Recibes este correo por tu cuenta de Paglot (paglot.eu). Paglot no te pedirá nunca tu contraseña por correo.',
    'en' => 'You’re getting this email because of your Paglot account (paglot.eu). Paglot will never ask for your password by email.',
    'vi' => 'Bạn nhận email này vì tài khoản Paglot của bạn (paglot.eu). Paglot sẽ không bao giờ hỏi mật khẩu qua email.',
];

function rellenar(string $texto, array $datos): string
{
    return preg_replace_callback('/\{(\w+)\}/', fn($m) => (string) ($datos[$m[1]] ?? ''), $texto);
}

/** El HTML del correo, con el diseño de Paglot. $codigo: el código grande (si lo hay); $extra: un bloque más (texto). */
function cuerpo_html(string $titulo, string $parrafo, string $nota, string $idioma, ?string $codigo = null, ?string $extra = null): string
{
    $e = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    $web = config('web');
    $bloqueCodigo = $codigo === null ? '' :
        '<tr><td align="center" style="padding:6px 0 18px"><div style="display:inline-block;padding:14px 22px;background:#ffffff;border:3px solid #2b2136;box-shadow:0 0 0 4px #f4c84a;font:700 30px/1 \'Courier New\',monospace;letter-spacing:6px;color:#2b2136">' . $e($codigo) . '</div></td></tr>';
    $bloqueExtra = $extra === null ? '' :
        '<tr><td style="padding:0 0 16px"><div style="padding:12px 14px;background:#f1e7d0;border-left:4px solid #e8607a;font:14px/1.5 Arial,sans-serif;color:#2b2136;white-space:pre-wrap">' . $e($extra) . '</div></td></tr>';
    return '<!doctype html><html lang="' . $e($idioma) . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>' . $e($titulo) . '</title></head>'
        . '<body style="margin:0;padding:0;background:#efe4cc">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efe4cc;padding:24px 12px"><tr><td align="center">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf6ea;border:3px solid #2b2136;box-shadow:6px 6px 0 #c9b48c">'
        . '<tr><td style="padding:18px 24px;background:#4a3f5e;border-bottom:3px solid #2b2136"><span style="font:700 26px/1 \'Courier New\',monospace;color:#f2e8da">Pa</span><span style="font:700 26px/1 \'Courier New\',monospace;color:#f4c84a">glot</span></td></tr>'
        . '<tr><td style="padding:24px 24px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        . '<tr><td style="padding:0 0 12px;font:700 22px/1.25 Arial,sans-serif;color:#2b2136">' . $e($titulo) . '</td></tr>'
        . '<tr><td style="padding:0 0 16px;font:16px/1.55 Arial,sans-serif;color:#2b2136">' . $e($parrafo) . '</td></tr>'
        . $bloqueCodigo . $bloqueExtra
        . '<tr><td style="padding:0 0 18px;font:14px/1.5 Arial,sans-serif;color:#5d5168">' . $e($nota) . '</td></tr>'
        . '<tr><td style="padding:0 0 24px"><a href="' . $e($web) . '" style="display:inline-block;padding:12px 22px;background:#d2353d;border:3px solid #2b2136;color:#ffffff;font:700 15px Arial,sans-serif;text-decoration:none">' . $e(BOTON[$idioma] ?? BOTON['es']) . '</a></td></tr>'
        . '</table></td></tr>'
        . '<tr><td style="padding:14px 24px;background:#f1e7d0;border-top:3px dashed #2b2136;font:12px/1.5 Arial,sans-serif;color:#5d5168">' . $e(PIE[$idioma] ?? PIE['es']) . '</td></tr>'
        . '</table></td></tr></table></body></html>';
}

/** Manda una plantilla. $datos: nombre, numero, plan, hasta, tipo, titular… y, si lleva código, 'codigo'. */
function mandar(string $para, string $plantilla, string $idioma, array $datos = [], ?string $extra = null): bool
{
    $idioma = isset(PLANTILLAS[$plantilla][$idioma]) ? $idioma : 'es';
    [$asunto, $parrafo, $nota] = array_map(fn($t) => rellenar($t, $datos), PLANTILLAS[$plantilla][$idioma]);
    $codigo = $datos['codigo'] ?? null;
    $texto = "$parrafo\n\n" . ($codigo ? "$codigo\n\n" : '') . ($extra ? "$extra\n\n" : '') . "$nota\n\n" . config('web');
    return enviar_resend($para, $asunto, cuerpo_html($asunto, $parrafo, $nota, $idioma, $codigo, $extra), $texto);
}

function enviar_resend(string $para, string $asunto, string $html, string $texto, ?string $responderA = null): bool
{
    $r = config('resend');
    $cuerpo = [
        'from' => $r['remitente'],
        'to' => [$para],
        'subject' => $asunto,
        'html' => $html,
        'text' => $texto,
        'reply_to' => $responderA ?? $r['responder_a'],
    ];
    $c = curl_init('https://api.resend.com/emails');
    curl_setopt_array($c, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $r['clave'], 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($cuerpo, JSON_UNESCAPED_UNICODE),
    ]);
    curl_exec($c);
    $estado = curl_getinfo($c, CURLINFO_HTTP_CODE);
    curl_close($c);
    return $estado >= 200 && $estado < 300;
}
