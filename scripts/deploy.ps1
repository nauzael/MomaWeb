# Deploy Script for Moma Nature (Next.js Standalone to cPanel via FTP)

Write-Host "Iniciando despliegue de Moma Nature (FTP Mode)..."

# 1. Build the project
Write-Host "Construyendo el proyecto (npm run build)..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en la construccion. Abortando."
    exit
}

# 2. Prepare Standalone folder (Next.js requirement)
Write-Host "Preparando archivos standalone..."
xcopy /E /I /Y "public" ".next\standalone\public"
xcopy /E /I /Y ".next\static" ".next\standalone\.next\static"

# 3. Upload via FTP
Write-Host "Subiendo archivos al servidor por FTP..."
node "scripts\ftp-deploy.js"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir los archivos."
    exit
}

Write-Host "Despliegue completado!"
Write-Host "Recuerda reiniciar la App de Node en tu cPanel."
