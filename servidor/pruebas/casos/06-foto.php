<?php
declare(strict_types=1);

use Paglot\Bd;

grupo('Foto de perfil');

/** Una imagen de prueba hecha con GD, como data URL. */
function imagen(string $tipo, int $ancho = 200, int $alto = 120): string
{
    $im = imagecreatetruecolor($ancho, $alto);
    imagefill($im, 0, 0, imagecolorallocate($im, 200, 40, 60));
    imagefilledrectangle($im, 0, 0, intdiv($ancho, 2), $alto, imagecolorallocate($im, 30, 120, 220));
    ob_start();
    match ($tipo) { 'png' => imagepng($im), 'jpeg' => imagejpeg($im, null, 90), 'webp' => imagewebp($im), 'gif' => imagegif($im) };
    return 'data:image/' . $tipo . ';base64,' . base64_encode((string) ob_get_clean());
}

function foto_guardada(): array
{
    $bytes = Bd::uno('SELECT foto FROM usuarios')['foto'];
    verdad(is_string($bytes) && $bytes !== '', 'hay foto guardada');
    return [$bytes, getimagesizefromstring($bytes)];
}

prueba('PNG, JPEG y WebP: se guardan regeneradas como JPEG cuadrado de 96 px', function () {
    $c = cuenta();
    foreach (['png', 'jpeg', 'webp'] as $tipo) {
        $r = espera(api('PATCH', '/api/v1/yo', ['foto' => imagen($tipo)], $c['token']), 200);
        verdad(str_starts_with($r['json']['usuario']['foto'], 'data:image/jpeg;base64,'), "{$tipo}: vuelve como JPEG");
        [, $info] = foto_guardada();
        igual([96, 96, IMAGETYPE_JPEG], [$info[0], $info[1], $info[2]], "{$tipo}: 96×96 JPEG");
    }
    // La miniatura que hace la app (96×96 JPEG) también vale, claro.
    espera(api('PATCH', '/api/v1/yo', ['foto' => imagen('jpeg', 96, 96)], $c['token']), 200);
});

prueba('los datos de ubicación (EXIF) desaparecen', function () {
    $c = cuenta();
    $jpeg = base64_decode(substr(imagen('jpeg'), strlen('data:image/jpeg;base64,')));
    $exif = "Exif\0\0MM\0*\0\0\0\x08\0\x01\x88\x25\0\x04\0\0\0\x01\0\0\0\x1aGPSLatitude=40.4168;Madrid";
    $conExif = "\xFF\xD8" . "\xFF\xE1" . pack('n', strlen($exif) + 2) . $exif . substr($jpeg, 2);
    verdad(getimagesizefromstring($conExif) !== false, 'la imagen de prueba es válida');
    espera(api('PATCH', '/api/v1/yo', ['foto' => 'data:image/jpeg;base64,' . base64_encode($conExif)], $c['token']), 200);
    [$bytes] = foto_guardada();
    verdad(!str_contains($bytes, 'Exif') && !str_contains($bytes, 'GPS') && !str_contains($bytes, 'Madrid'), 'sin EXIF');
});

prueba('lo que no es una imagen de verdad se rechaza', function () {
    $c = cuenta();
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script></svg>';
    $png = base64_decode(substr(imagen('png'), strlen('data:image/png;base64,')));
    $malas = [
        'svg'                 => 'data:image/svg+xml;base64,' . base64_encode($svg),
        'svg disfrazado'      => 'data:image/png;base64,' . base64_encode($svg),
        'php disfrazado'      => 'data:image/jpeg;base64,' . base64_encode('<?php system($_GET["c"]); ?>'),
        'html'                => 'data:text/html;base64,' . base64_encode('<b>hola</b>'),
        'gif (no aceptado)'   => imagen('gif'),
        'png cortado'         => 'data:image/png;base64,' . base64_encode(substr($png, 0, 60)),
        'base64 roto'         => 'data:image/png;base64,@@@@',
        'sin data:'           => base64_encode($png),
        'enlace'              => 'https://example.com/foto.png',
        'ruta'                => 'file:///etc/passwd',
        'vacía'               => 'data:image/png;base64,',
        'demasiado ancha'     => imagen('png', 2000, 10),
        'polígloto png+php'   => 'data:image/png;base64,' . base64_encode($png . '<?php echo 1; ?>'),
    ];
    foreach ($malas as $que => $foto) {
        $r = api('PATCH', '/api/v1/yo', ['foto' => $foto], $c['token']);
        if ($que === 'polígloto png+php') {
            // GD lo abre como PNG, pero lo que se guarda es un JPEG nuevo: el código de detrás se pierde.
            espera($r, 200);
            [$bytes] = foto_guardada();
            verdad(!str_contains($bytes, '<?php'), 'el código no llega a la foto guardada');
            continue;
        }
        espera($r, 400, 'foto_invalida');
    }
    espera(api('PATCH', '/api/v1/yo', ['foto' => 123], $c['token']), 400, 'datos_invalidos');
});

prueba('fotos enormes: 413', function () {
    $c = cuenta();
    $grande = 'data:image/png;base64,' . base64_encode(random_bytes(600_000));
    espera(api('PATCH', '/api/v1/yo', ['foto' => $grande], $c['token']), 413, 'demasiado_grande');
});

prueba('quitar la foto', function () {
    $c = cuenta();
    espera(api('PATCH', '/api/v1/yo', ['foto' => imagen('png')], $c['token']), 200);
    $r = espera(api('PATCH', '/api/v1/yo', ['foto' => null], $c['token']), 200);
    igual(null, $r['json']['usuario']['foto']);
    igual(null, Bd::uno('SELECT foto FROM usuarios')['foto']);
});
