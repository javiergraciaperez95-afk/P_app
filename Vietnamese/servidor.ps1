# Servidor local sencillo para probar la web (no necesita Python ni Node).
# Uso normal: doble clic en iniciar.cmd
param(
  [int]$Puerto = 8080,
  [switch]$SinNavegador
)

$ErrorActionPreference = 'Stop'
$raiz = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') + '\'

$tipos = @{
  '.html'  = 'text/html; charset=utf-8'
  '.js'    = 'text/javascript; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.md'    = 'text/plain; charset=utf-8'
  '.txt'   = 'text/plain; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.gif'   = 'image/gif'
  '.webp'  = 'image/webp'
  '.ico'   = 'image/x-icon'
  '.woff2' = 'font/woff2'
  '.mp3'   = 'audio/mpeg'
  '.wav'   = 'audio/wav'
}

# Busca un puerto libre (8080, 8081, ...). Ojo: los enlaces de confirmacion de la cuenta
# solo vuelven a direcciones permitidas en Supabase (http://localhost:8080/** debe estar en
# Authentication -> URL Configuration -> Redirect URLs). En este equipo el 8000 lo reserva Windows.
$listener = $null
for ($p = $Puerto; $p -lt $Puerto + 10; $p++) {
  $intento = New-Object System.Net.HttpListener
  $intento.Prefixes.Add("http://localhost:$p/")
  try { $intento.Start(); $listener = $intento; $Puerto = $p; break } catch { $intento.Close() }
}
if (-not $listener) {
  Write-Host "No se pudo abrir ningun puerto entre $Puerto y $($Puerto + 9)."
  exit 1
}

$url = "http://localhost:$Puerto/"
Write-Host ''
Write-Host "  Servidor en marcha: $url"
Write-Host '  Deja esta ventana abierta mientras usas la web.'
Write-Host '  Para pararlo: cierra la ventana o pulsa Ctrl+C.'
Write-Host ''
if (-not $SinNavegador) { Start-Process $url }

try {
  while ($listener.IsListening) {
    $tarea = $listener.GetContextAsync()
    # Espera en trozos cortos para que Ctrl+C funcione
    while (-not $tarea.AsyncWaitHandle.WaitOne(300)) { }
    $ctx = $tarea.GetAwaiter().GetResult()
    $resp = $ctx.Response
    try {
      $ruta = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($ruta.EndsWith('/')) { $ruta += 'index.html' }
      $archivo = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($raiz, $ruta.TrimStart('/')))
      $dentro = $archivo.StartsWith($raiz, [System.StringComparison]::OrdinalIgnoreCase)
      if ($dentro -and (Test-Path -LiteralPath $archivo -PathType Leaf)) {
        $ext = [System.IO.Path]::GetExtension($archivo).ToLower()
        $resp.ContentType = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($archivo)
      } else {
        $resp.StatusCode = 404
        $resp.ContentType = 'text/plain; charset=utf-8'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 - No encontrado')
      }
      $resp.Headers.Add('Cache-Control', 'no-store')
      $resp.ContentLength64 = $bytes.Length
      $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      try { $resp.StatusCode = 500 } catch { }
    } finally {
      $resp.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
