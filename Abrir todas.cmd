@echo off
rem Doble clic: abre Vietnamese, Danish, Portuguese, Spanish, Chinese, French, Italian, English, German, Norwegian, Swedish, Polish, Romanian, Greek, Turkish, Japanese, Korean, Thai, Dutch, Indonesian y Russian en Edge.
rem Hace falta un servidor local (si no, el navegador no carga las lecciones).
rem Esta ventana es ese servidor. Cierrala para pararlo.
title Aplicaciones de idiomas
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-Content -LiteralPath '%~f0' -Raw; $i = $t.IndexOf('#' + 'SERVIDOR'); if ($i -lt 0) { throw 'Marcador no encontrado' }; Invoke-Expression $t.Substring($i)"
exit /b

#SERVIDOR
$ErrorActionPreference = 'Stop'
$raiz = (Get-Location).Path.TrimEnd('\') + '\'
$puerto = 8090

$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1

if (-not $edge) {
  Write-Host ''
  Write-Host '  No encuentro Microsoft Edge.' -ForegroundColor Red
  Read-Host '  Pulsa Enter para salir'
  exit 1
}

$urls = @(
  "http://localhost:$puerto/Vietnamese/",
  "http://localhost:$puerto/Danish/",
  "http://localhost:$puerto/Portuguese/",
  "http://localhost:$puerto/Spanish/",
  "http://localhost:$puerto/Chinese/",
  "http://localhost:$puerto/French/",
  "http://localhost:$puerto/Italian/",
  "http://localhost:$puerto/English/",
  "http://localhost:$puerto/German/",
  "http://localhost:$puerto/Norwegian/",
  "http://localhost:$puerto/Swedish/",
  "http://localhost:$puerto/Polish/",
  "http://localhost:$puerto/Romanian/",
  "http://localhost:$puerto/Greek/",
  "http://localhost:$puerto/Turkish/",
  "http://localhost:$puerto/Japanese/",
  "http://localhost:$puerto/Korean/",
  "http://localhost:$puerto/Thai/",
  "http://localhost:$puerto/Dutch/",
  "http://localhost:$puerto/Indonesian/",
  "http://localhost:$puerto/Russian/"
)

function Abrir-Edge {
  Start-Process -FilePath $edge -ArgumentList (@('--new-window') + $urls)
}

function Puerto-Ocupado {
  try {
    $cliente = New-Object System.Net.Sockets.TcpClient
    $cliente.Connect('127.0.0.1', $puerto)
    $cliente.Close()
    return $true
  } catch {
    return $false
  }
}

if (Puerto-Ocupado) {
  Write-Host ''
  Write-Host "  El servidor ya esta en marcha (puerto $puerto). Abro Edge." -ForegroundColor Cyan
  Abrir-Edge
  exit 0
}

$tipos = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.ico'  = 'image/x-icon'
  '.webp' = 'image/webp'
  '.ttf'  = 'font/ttf'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.mp3'  = 'audio/mpeg'
  '.ogg'  = 'audio/ogg'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
}

$servidor = New-Object System.Net.HttpListener
$servidor.Prefixes.Add("http://localhost:${puerto}/")
try {
  $servidor.Start()
} catch {
  Write-Host ''
  Write-Host "  No se pudo abrir el puerto $puerto." -ForegroundColor Red
  Write-Host '  Cierra la otra ventana del servidor y vuelve a intentarlo.'
  Read-Host '  Pulsa Enter para salir'
  exit 1
}

Write-Host ''
Write-Host '  ============================================' -ForegroundColor DarkCyan
Write-Host '   Aplicaciones de idiomas' -ForegroundColor Cyan
Write-Host "   http://localhost:$puerto/" -ForegroundColor Yellow
Write-Host '   Vietnamese, Danish, Portuguese, Spanish, Chinese, French, Italian, English, German, Norwegian, Swedish, Polish, Romanian, Greek, Turkish, Japanese, Korean, Thai, Dutch, Indonesian, Russian' -ForegroundColor Cyan
Write-Host '   Para pararlo, cierra esta ventana.' -ForegroundColor Cyan
Write-Host '  ============================================' -ForegroundColor DarkCyan
Write-Host ''

Abrir-Edge

try {
  while ($servidor.IsListening) {
    $tarea = $servidor.GetContextAsync()
    while (-not $tarea.AsyncWaitHandle.WaitOne(500)) { }
    $contexto = $tarea.GetAwaiter().GetResult()
    $peticion = $contexto.Request
    $respuesta = $contexto.Response
    try {
      $ruta = [Uri]::UnescapeDataString($peticion.Url.AbsolutePath)
      if ($ruta.EndsWith('/')) { $ruta += 'index.html' }
      $relativa = ($ruta.TrimStart('/') -replace '/', '\')
      $archivo = [IO.Path]::GetFullPath((Join-Path $raiz $relativa))
      $dentro = $archivo.StartsWith($raiz, [StringComparison]::OrdinalIgnoreCase)
      if ($dentro -and (Test-Path -LiteralPath $archivo -PathType Leaf)) {
        $extension = [IO.Path]::GetExtension($archivo).ToLower()
        $tipo = $tipos[$extension]
        if (-not $tipo) { $tipo = 'application/octet-stream' }
        $bytes = [IO.File]::ReadAllBytes($archivo)
        $respuesta.StatusCode = 200
        $respuesta.ContentType = $tipo
      } else {
        $bytes = [Text.Encoding]::UTF8.GetBytes('No encontrado')
        $respuesta.StatusCode = 404
        $respuesta.ContentType = 'text/plain; charset=utf-8'
      }
      $respuesta.Headers.Add('Cache-Control', 'no-store')
      $respuesta.ContentLength64 = $bytes.Length
      $respuesta.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("  {0}  {1}" -f $respuesta.StatusCode, $ruta)
    } catch {
      Write-Host "  Error al servir $($peticion.Url.AbsolutePath): $_" -ForegroundColor Red
      try { $respuesta.StatusCode = 500 } catch { }
    } finally {
      $respuesta.Close()
    }
  }
} finally {
  $servidor.Stop()
  $servidor.Close()
}
