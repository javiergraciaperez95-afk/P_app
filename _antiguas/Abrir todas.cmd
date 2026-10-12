@echo off
rem Doble clic: abre las 21 apps de idiomas en Edge, cada una en su propio puerto (8101 a 8121).
rem Cada app tiene siempre el mismo puerto, asi no comparten datos guardados entre ellas.
rem Hace falta un servidor local (si no, el navegador no carga las lecciones).
rem Esta ventana es ese servidor. Cierrala para pararlo.
title Aplicaciones de idiomas
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-Content -LiteralPath '%~f0' -Raw; $i = $t.IndexOf('#' + 'SERVIDOR'); if ($i -lt 0) { throw 'Marcador no encontrado' }; Invoke-Expression $t.Substring($i)"
exit /b

#SERVIDOR
$ErrorActionPreference = 'Stop'
$raiz = (Get-Location).Path.TrimEnd('\') + '\'
# Una app por puerto. No cambies los numeros: el progreso guardado en el navegador va ligado al puerto.
$apps = @(
  @{ Nombre = 'Chinese'; Puerto = 8101 }
  @{ Nombre = 'Danish'; Puerto = 8102 }
  @{ Nombre = 'Dutch'; Puerto = 8103 }
  @{ Nombre = 'English'; Puerto = 8104 }
  @{ Nombre = 'French'; Puerto = 8105 }
  @{ Nombre = 'German'; Puerto = 8106 }
  @{ Nombre = 'Greek'; Puerto = 8107 }
  @{ Nombre = 'Indonesian'; Puerto = 8108 }
  @{ Nombre = 'Italian'; Puerto = 8109 }
  @{ Nombre = 'Japanese'; Puerto = 8110 }
  @{ Nombre = 'Korean'; Puerto = 8111 }
  @{ Nombre = 'Norwegian'; Puerto = 8112 }
  @{ Nombre = 'Polish'; Puerto = 8113 }
  @{ Nombre = 'Portuguese'; Puerto = 8114 }
  @{ Nombre = 'Romanian'; Puerto = 8115 }
  @{ Nombre = 'Russian'; Puerto = 8116 }
  @{ Nombre = 'Spanish'; Puerto = 8117 }
  @{ Nombre = 'Swedish'; Puerto = 8118 }
  @{ Nombre = 'Thai'; Puerto = 8119 }
  @{ Nombre = 'Turkish'; Puerto = 8120 }
  @{ Nombre = 'Vietnamese'; Puerto = 8121 }
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

$urls = $apps | ForEach-Object { "http://localhost:$($_.Puerto)/" }

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
  Write-Host "  No se pudieron abrir los puertos $($apps[0].Puerto) a $($apps[-1].Puerto): alguno esta ocupado." -ForegroundColor Red
  Write-Host '  Cierra la otra ventana del servidor y vuelve a intentarlo.'
  Read-Host '  Pulsa Enter para salir'
  exit 1
}

Write-Host ''
Write-Host '  ============================================' -ForegroundColor DarkCyan
Write-Host '   Aplicaciones de idiomas' -ForegroundColor Cyan
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
