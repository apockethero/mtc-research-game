# ============================================================================
# MTC Research Game - Servidor Local Ligero para Participantes
# Escucha estrictamente en 127.0.0.1 (Loopback / Localhost)
# Sin dependencias externas ni privilegios de administrador
# ============================================================================

$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot

# Mapa de tipos MIME
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".json" = "application/json; charset=utf-8"
    ".txt"  = "text/plain; charset=utf-8"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

# 1. Encontrar puerto disponible a partir de 8080
$port = 8080
$maxPort = 8099
$listener = $null

while ($port -le $maxPort) {
    try {
        $temp = New-Object System.Net.HttpListener
        $prefix = "http://127.0.0.1:$port/"
        $temp.Prefixes.Add($prefix)
        $temp.Start()
        $listener = $temp
        break
    } catch {
        $port++
    }
}

if (-not $listener) {
    Write-Host "[ERROR] No se pudo encontrar un puerto libre entre 8080 y $maxPort." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

$url = "http://127.0.0.1:$port/"

Clear-Host
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  MTC RESEARCH GAME - SERVIDOR LOCAL PARA PARTICIPANTES" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  El juego esta listo y ejecutandose en: $url" -ForegroundColor Green
Write-Host "  Abriendo tu navegador web predeterminado..." -ForegroundColor White
Write-Host ""
Write-Host "  ----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  IMPORTANTE: Para cerrar el juego y apagar este servidor," -ForegroundColor White
Write-Host "  presiona Ctrl + C en esta ventana o simplemente cierrala." -ForegroundColor White
Write-Host "  ----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Abrir navegador predeterminado
try {
    Start-Process $url
} catch {
    Write-Host "Aviso: No se pudo abrir el navegador automaticamente. Abre manualmente: $url" -ForegroundColor Yellow
}

# 2. Bucle principal de atención de peticiones
try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath
        if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq "/") {
            $rawPath = "/index.html"
        }

        # Decodificar URL y sanitizar ruta
        $cleanPath = [System.Uri]::UnescapeDataString($rawPath.TrimStart('/'))
        $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootDir, $cleanPath))

        # Protección contra Directory Traversal
        if (-not $filePath.StartsWith($rootDir, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($filePath)) {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.OutputStream.Close()
            continue
        }

        # Determinar Content-Type
        $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $contentType = $mimeTypes[$ext]
        if (-not $contentType) {
            $contentType = "application/octet-stream"
        }

        $response.ContentType = $contentType
        $response.AddHeader("Cache-Control", "no-cache")
        $response.StatusCode = 200

        try {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } catch {
            $response.StatusCode = 500
        } finally {
            $response.OutputStream.Close()
        }
    }
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        $listener.Close()
    }
}
