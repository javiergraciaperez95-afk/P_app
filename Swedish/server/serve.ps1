# Servidor local muy sencillo para probar la web en Windows.
# No necesita Node.js ni Python: usa PowerShell, que ya viene con Windows.
# Se inicia con doble clic en start-server.cmd. Para pararlo, cierra la ventana.

param([int]$Puerto = 8000)

$ErrorActionPreference = 'Stop'
$raiz = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path.TrimEnd('\') + '\'

$tipos = @{
  '.html'  = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'text/javascript; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.md'    = 'text/plain; charset=utf-8'
  '.txt'   = 'text/plain; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.webp'  = 'image/webp'
  '.gif'   = 'image/gif'
  '.ico'   = 'image/x-icon'
  '.ttf'   = 'font/ttf'
  '.woff'  = 'font/woff'
  '.woff2' = 'font/woff2'
  '.mp3'   = 'audio/mpeg'
  '.ogg'   = 'audio/ogg'
}

# Busca un puerto libre entre 8000 y 8010.
$servidor = $null
foreach ($p in $Puerto..($Puerto + 10)) {
  $intento = New-Object System.Net.HttpListener
  $intento.Prefixes.Add("http://localhost:$p/")
  try {
    $intento.Start()
    $servidor = $intento
    $Puerto = $p
    break
  } catch {
    $intento.Close()
  }
}

if (-not $servidor) {
  Write-Host ''
  Write-Host '  No se ha podido abrir ningún puerto entre 8000 y 8010.' -ForegroundColor Red
  Write-Host '  Cierra otras ventanas del servidor y vuelve a intentarlo.'
  Read-Host '  Pulsa Enter para salir'
  exit 1
}

$direccion = "http://localhost:$Puerto/"
Write-Host ''
Write-Host '  ============================================' -ForegroundColor DarkCyan
Write-Host '   Svenska · servidor local en marcha' -ForegroundColor Cyan
Write-Host "   Abre en el navegador:  $direccion" -ForegroundColor Yellow
Write-Host '   Para pararlo, cierra esta ventana.' -ForegroundColor Cyan
Write-Host '  ============================================' -ForegroundColor DarkCyan
Write-Host ''

Start-Process $direccion

try {
  while ($servidor.IsListening) {
    # Espera peticiones en pequeños intervalos para que la ventana se pueda cerrar sin problemas.
    $tarea = $servidor.GetContextAsync()
    while (-not $tarea.AsyncWaitHandle.WaitOne(500)) { }
    $contexto = $tarea.GetAwaiter().GetResult()
    $peticion = $contexto.Request
    $respuesta = $contexto.Response

    try {
      $ruta = [Uri]::UnescapeDataString($peticion.Url.AbsolutePath)
      if ($ruta.EndsWith('/')) { $ruta += 'index.html' }
      $archivo = [IO.Path]::GetFullPath((Join-Path $raiz ($ruta.TrimStart('/') -replace '/', '\')))

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
