# Configuración de Permisos en Supabase para Eliminar Reservas

## Problema
Las reservas no se eliminan de la lista porque Supabase tiene políticas RLS (Row Level Security) que bloquean las operaciones DELETE.

## Solución

### Opción 1: Configurar Política RLS para DELETE (Recomendado)

1. Ve a tu proyecto en Supabase (https://supabase.com)
2. Ve a **Authentication** > **Policies**
3. Busca la tabla `bookings`
4. Agrega una nueva política para DELETE:

```sql
-- Política para permitir DELETE a usuarios autenticados (administradores)
CREATE POLICY "Allow authenticated users to delete bookings"
ON bookings
FOR DELETE
TO authenticated
USING (true);
```

O si quieres ser más específico y solo permitir a administradores:

```sql
-- Política para permitir DELETE solo a administradores
CREATE POLICY "Allow admins to delete bookings"
ON bookings
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR
  auth.jwt() ->> 'email' IN (
    SELECT email FROM profiles WHERE role = 'admin'
  )
);
```

### Opción 2: Usar Service Role (Temporal para pruebas)

Si necesitas una solución rápida para probar, puedes modificar el endpoint de la API para usar el service role:

**ADVERTENCIA**: Esta opción bypasea todas las políticas RLS. Úsala solo temporalmente.

En `app/api/admin/bookings/delete/route.ts`, cambia:

```typescript
const supabase = await createClient();
```

Por:

```typescript
import { createClient as createServiceClient } from '@supabase/supabase-js';

const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Esta key bypasea RLS
);
```

### Opción 3: Verificar Políticas Existentes

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `bookings`
3. Ve a la pestaña **Policies**
4. Verifica que exista una política para DELETE
5. Si no existe, créala usando el SQL del Opción 1

## Verificar que Funciona

1. Abre la consola del navegador (F12)
2. Ve a la página de reservas
3. Intenta eliminar una reserva
4. Revisa los logs en la consola:
   - Deberías ver: `Deleting booking with ID: [id]`
   - Deberías ver: `Delete response: { status: 200, data: { success: true, ... } }`
5. Si ves un error 401 o 403, es un problema de permisos
6. Si ves un error 500, revisa los logs del servidor

## Comandos SQL Útiles

### Ver todas las políticas de la tabla bookings:
```sql
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

### Eliminar una política existente:
```sql
DROP POLICY IF EXISTS "nombre_de_la_politica" ON bookings;
```

### Ver qué usuario está autenticado:
```sql
SELECT auth.uid(), auth.jwt();
```
