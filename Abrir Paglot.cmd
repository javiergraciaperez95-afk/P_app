@echo off
rem Doble clic: abre la app unica Idiomas (todos los cursos) en Edge. Empieza en la pantalla de inicio.
rem Usa siempre el puerto 8100: el progreso guardado en el navegador va ligado a el.
rem Hace falta un servidor local (si no, el navegador no carga las lecciones).
rem Esta ventana es ese servidor. Cierrala para pararlo.
title Paglot
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-Content -LiteralPath '%~f0' -Raw; $i = $t.IndexOf('#' + 'SERVIDOR'); if ($i -lt 0) { throw 'Marcador no encontrado' }; Invoke-Expression $t.Substring($i)"
exit /b

#SERVIDOR
$ErrorActionPreference = 'Stop'
$raiz = (Get-Location).Path.TrimEnd('\') + '\'
# No cambies el numero: el progreso guardado en el navegador va ligado al puerto.
$apps = @(
  @{ Nombre = 'Idiomas'; Puerto = 8100 }
)
$carpetas = @{}
foreach ($a in $apps) { $carpetas[$a.Puerto] = $raiz + $a.Nombre + '\' }
$puerto = $apps[0].Puerto

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

$urls = $apps | ForEach-Object { "http://localhost:$($_.Puerto)/#/inicio" }

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
  Write-Host "  El servidor ya esta en marcha. Abro Edge." -ForegroundColor Cyan
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
foreach ($a in $apps) { $servidor.Prefixes.Add("http://localhost:$($a.Puerto)/") }
try {
  $servidor.Start()
} catch {
  Write-Host ''
  Write-Host "  No se pudo abrir el puerto $($apps[0].Puerto): esta ocupado." -ForegroundColor Red
  Write-Host '  Cierra la otra ventana del servidor y vuelve a intentarlo.'
  Read-Host '  Pulsa Enter para salir'
  exit 1
}

Write-Host ''
Write-Host '  ============================================' -ForegroundColor DarkCyan
Write-Host '   Paglot' -ForegroundColor Cyan
foreach ($a in $apps) { Write-Host ("   {0,-11} http://localhost:{1}/" -f $a.Nombre, $a.Puerto) -ForegroundColor Yellow }
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
      $carpeta = $carpetas[$peticion.Url.Port]
      $archivo = [IO.Path]::GetFullPath((Join-Path $carpeta $relativa))
      $dentro = $carpeta -and $archivo.StartsWith($carpeta, [StringComparison]::OrdinalIgnoreCase)
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
      Write-Host ("  {0}  {1}  {2}" -f $respuesta.StatusCode, $peticion.Url.Port, $ruta)
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
