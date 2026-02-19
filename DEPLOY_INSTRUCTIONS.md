# Instrucciones de Despliegue (Social Media Update)

Se ha migrado la lógica backend de las redes sociales a PHP para ser compatible con el hosting estático (cPanel).

## Pasos para Desplegar:

1.  **Subir Archivos PHP:**
    Asegúrate de subir los nuevos archivos PHP a tu servidor en la carpeta `public/api`:
    - `public/api/admin/social/setup.php`
    - `public/api/admin/social/publish.php`
    - `public/api/utils/settings.php`

2.  **Base de Datos:**
    Si no lo has hecho en producción, asegúrate de que la tabla `system_settings` exista.
    Puedes ejecutar este SQL en tu phpMyAdmin:
    ```sql
    CREATE TABLE IF NOT EXISTS `system_settings` (
      `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
      `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
      `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      `updated_at` datetime(3) NOT NULL,
      PRIMARY KEY (`key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ```
    *(Probablemente Prisma ya lo hizo si corriste migraciones, pero es bueno verificar).*

3.  **Frontend:**
    Ejecuta `npm run build` (ya fue probado y funciona) y sube la carpeta `out/` a tu servidor `public_html`.

4.  **Verificación:**
    - Entra a `https://www.momaexcursiones.co/admin/social`
    - Inicia sesión como `admin@moma.com` (pass: `admin`).
    - Configura la integración con Facebook/Instagram.

## Solución de Problemas

- Si ves errores 404 en `/api/admin/social/setup.php`, verifica que el archivo exista en el servidor.
- Si ves errores 500, revisa el `error_log` de PHP en tu servidor.
- Asegúrate de que `public/api/config/database.php` tenga las credenciales correctas de producción.
