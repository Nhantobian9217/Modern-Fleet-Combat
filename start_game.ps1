# start_game.ps1 - Máy chủ web cục bộ siêu nhẹ cho Windows (Không cần cài đặt thêm phần mềm)
$port = 8080
$url = "http://localhost:$port/"
$folder = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
} catch {
    # Nếu cổng 8080 bận, thử cổng 8081
    $port = 8081
    $url = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($url)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [FLEET COMBAT] MÁY CHỦ HẢI CHIẾN ĐANG KHỞI CHẠY..." -ForegroundColor Green
Write-Host " Trình duyệt sẽ tự động mở tại: $url" -ForegroundColor Yellow
Write-Host " Nhấn Ctrl + C để dừng máy chủ khi hoàn thành." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# Tự động mở trình duyệt mặc định
Start-Process $url

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".wav"  = "audio/wav"
    ".mp3"  = "audio/mpeg"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($localPath)) {
            $localPath = "index.html"
        }

        $filePath = Join-Path $folder $localPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = $mimeTypes[$ext]
            if (-not $mime) { $mime = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # Bỏ qua ngắt kết nối client thông thường
    }
}
