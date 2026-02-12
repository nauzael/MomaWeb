---
description: Guía para realizar cambios y desplegar usando Git
---

Para mantener tu proyecto organizado y desplegar los cambios al servidor de producción de forma segura, sigue estos pasos:

### 1. Guardar tus cambios (Git Commit)
Cuando hayas terminado una tarea (como los ajustes de UI o el mapa), guarda tus cambios en Git:

```powershell
# 1. Mira qué archivos han cambiado
git status

# 2. Agrega todos los cambios
git add .

# 3. Crea el commit con un mensaje descriptivo
git commit -m "feat: Ajustes de UI en detalles de experiencia y mapa interactivo"
```

### 2. Subir a GitHub
Envía tus cambios a la nube para que estén seguros y sincronizados:

```powershell
git push origin main
```

### 3. Desplegar al Servidor (momaexcursiones.co)
Como este proyecto usa Next.js con exportación estática y una API de PHP, debes subir ambos:

// turbo
#### A. Desplegar la API (PHP)
Este comando subirá todos los archivos de la carpeta `public/api` a tu servidor por FTP:
```powershell
node scripts/upload-api-all.js
```

#### B. Construir y Desplegar el Frontend (Next.js)
Este comando genera los archivos estáticos y los sube a la raíz de tu servidor:
```powershell
# Primero construye el proyecto
npm run build

# Luego sube la carpeta 'out' generada
node scripts/ftp-deploy.js
```

---

### Pro-Tip: Sincronización Automática
Si quieres hacer todo en un solo paso, puedes configurar un script en `package.json` o simplemente pedirme:
**"Despliega todos los cambios actuales"** y yo me encargaré de hacer el commit, el push y los uploads por ti.
