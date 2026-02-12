# Build script without FTP deployment
# Use this when you want to build locally and deploy manually

Write-Host "Iniciando construcción local de Moma Nature..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the project
Write-Host "Construyendo el proyecto (npm run build)..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la construcción del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Construcción completada exitosamente" -ForegroundColor Green
Write-Host ""

# Step 2: Prepare standalone files
Write-Host "Preparando archivos standalone..." -ForegroundColor Yellow

$deployDir = "deploy-manual"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy public folder
Write-Host "Copiando carpeta public..." -ForegroundColor Gray
xcopy /E /I /Y "public" "$deployDir\public"

# Copy .next/static
Write-Host "Copiando archivos estáticos..." -ForegroundColor Gray
xcopy /E /I /Y ".next\static" "$deployDir\.next\static"

Write-Host ""
Write-Host "✅ Archivos preparados en la carpeta: $deployDir" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Ahora puedes subir manualmente los archivos desde:" -ForegroundColor Cyan
Write-Host "   - $deployDir\public\" -ForegroundColor White
Write-Host "   - $deployDir\.next\static\" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Destino en el servidor:" -ForegroundColor Cyan
Write-Host "   - public/ → /public_html/" -ForegroundColor White
Write-Host "   - .next/static/ → /public_html/.next/static/" -ForegroundColor White
