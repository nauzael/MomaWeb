# Plan de Optimización - Integración PHP

> **Proyecto:** Moma Web (Next.js + PHP API)  
> **Fecha:** Febrero 2026  
> **Objetivo:** Mejorar seguridad y mantenibilidad sin romper funcionalidades existentes

---

## Estado Actual (Lo que ya está bien)

| Aspecto | Estado |
|---------|--------|
| CORS | ✅ Configurado con headers de seguridad |
| Sesiones PHP | ✅ HttpOnly + SameSite=Lax |
| Prepared statements | ✅ En la mayoría de endpoints |
| Auth centralizado | ✅ `auth_check.php` reusable |
| Estructura API | ✅ Carpeta organizada por módulos |

---

## Problemas Críticos a Resolver

| # | Problema | Ubicación | Severidad |
|---|----------|-----------|-----------|
| 1 | **SQL Injection** en actualización de user_id | `bookings/create.php:61` | 🔴 Crítica |
| 2 | Credenciales BD hardcodeadas | `config/database.php:5-8` | 🔴 Crítica |
| 3 | Sesión en localStorage (XSS vulnerable) | `auth-client.tsx:70` | 🟠 Alta |
| 4 | Doble auth (PHP + NextAuth sin usar) | Varios archivos | 🟡 Media |
| 5 | Errores PHP expuestos en producción | Varios endpoints | 🟠 Alta |

---

## Plan de Implementación (Fases)

### Fase 1: Seguridad Crítica (Semana 1)

#### 1.1 Mover credenciales BD a variables de entorno

**Archivo:** `public/api/config/database.php`

```php
// ANTES (inseguro)
private $host = "localhost";
private $db_name = "momaexcu_web";
private $username = "momaexcu_admin";
private $password = "u%!(IE[n8^AzMdYZ";

// DESPUÉS
private $host;
private $db_name;
private $username;
private $password;

public function __construct() {
    $this->host = getenv('DB_HOST') ?: 'localhost';
    $this->db_name = getenv('DB_NAME') ?: 'momaexcu_web';
    $this->username = getenv('DB_USER') ?: 'momaexcu_admin';
    $this->password = getenv('DB_PASSWORD') ?: '';
}
```

**Archivo:** `.env` (agregar al final)
```bash
# Database
DB_HOST=localhost
DB_NAME=momaexcu_web
DB_USER=momaexcu_admin
DB_PASSWORD=u%!(IE[n8^AzMdYZ
```

**Riesgo:** Bajo - Solo mueve valores a variables de entorno

---

#### 1.2 Corregir SQL Injection

**Archivo:** `public/api/bookings/create.php` (línea 61)

```php
// ANTES (vulnerable - interpolación directa de variables)
if ($userId) {
    try {
        $db->exec("UPDATE bookings SET user_id = '$userId' WHERE id = '$id'");
    } catch (Exception $e) {
        // Ignore if column doesn't exist
    }
}

// DESPUÉS (prepared statement)
if ($userId) {
    try {
        $updateStmt = $db->prepare("UPDATE bookings SET user_id = :uid WHERE id = :id");
        $updateStmt->execute([':uid' => $userId, ':id' => $id]);
    } catch (Exception $e) {
        // Ignore if column doesn't exist
    }
}
```

**Riesgo:** Bajo - Corrige vulnerabilidad sin cambiar funcionalidad

---

#### 1.3 Centralizar manejo de errores

**Archivo:** `public/api/utils/response.php` (agregar función)

```php
/**
 * Envía error genérico para producción (no expone detalles)
 */
function jsonErrorProduction($message = 'Error del servidor', $code = 500) {
    http_response_code($code);
    error_log("API Error: $message"); // Loguea el error real
    echo json_encode([
        'error' => $message,
        'code' => $code
    ]);
    exit;
}

/**
 * Valida y sanitiza input
 */
function sanitizeInput($data, $fields) {
    $sanitized = [];
    foreach ($fields as $field => $type) {
        if (!isset($data[$field])) {
            continue;
        }
        
        $value = $data[$field];
        
        switch ($type) {
            case 'string':
                $sanitized[$field] = htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
                break;
            case 'email':
                $sanitized[$field] = filter_var($value, FILTER_SANITIZE_EMAIL);
                break;
            case 'int':
                $sanitized[$field] = (int) $value;
                break;
            case 'float':
                $sanitized[$field] = (float) $value;
                break;
            case 'date':
                $sanitized[$field] = date('Y-m-d', strtotime($value));
                break;
            default:
                $sanitized[$field] = $value;
        }
    }
    return $sanitized;
}
```

**Aplicar en cada endpoint:**

```php
// ANTES (expone error detallado)
} catch (PDOException $e) {
    jsonError('Error de base de datos: ' . $e->getMessage(), 500);
}

// DESPUÉS
} catch (PDOException $e) {
    error_log("Booking Create PDO Error: " . $e->getMessage());
    jsonError('Error al procesar la solicitud', 500);
}
```

**Riesgo:** Bajo - Solo cambia mensajes de error

---

#### 1.4 Implementar Rate Limiting básico

**Archivo:** `public/api/config/rate_limit.php` (nuevo)

```php
<?php
// public/api/config/rate_limit.php

class RateLimiter {
    private $maxRequests = 60; // Por minuto
    private $window = 60;
    
    public function check($identifier = null) {
        $ip = $identifier ?? ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
        $key = "rate_limit_" . md5($ip);
        
        $now = time();
        $requests = @file_get_contents("/tmp/$key");
        
        if (!$requests) {
            $requests = [];
        } else {
            $requests = json_decode($requests, true);
        }
        
        // Filtrar requests antiguos
        $requests = array_filter($requests, function($time) use ($now) {
            return ($now - $time) < $this->window;
        });
        
        if (count($requests) >= $this->maxRequests) {
            http_response_code(429);
            echo json_encode(['error' => 'Demasiadas solicitudes. Intenta más tarde.']);
            exit;
        }
        
        $requests[] = $now;
        @file_put_contents("/tmp/$key", json_encode($requests));
        
        return true;
    }
}
```

**Usar en endpoints:**

```php
require_once '../config/rate_limit.php';
$limiter = new RateLimiter();
$limiter->check();
```

**Riesgo:** Bajo - Añade protección sin cambiar funcionalidad

---

### Fase 2: Autenticación (Semana 2)

#### 2.1 Cambiar de localStorage a cookies httpOnly

**ADVERTENCIA:** Esta fase tiene riesgo alto de romper el login. Realizar pruebas exhaustivas.

**Archivo:** `lib/api-client.ts` (modificar)

```typescript
// ANTES
const sessionId = typeof window !== 'undefined' ? localStorage.getItem('php_session_id') : null;

// Añadir session_id a la URL como fallback
if (sessionId) {
    const separator = finalEndpoint.includes('?') ? '&' : '?';
    finalEndpoint += `${separator}php_session_id=${sessionId}`;
}

// ...headers
if (sessionId) {
    headers['X-Session-ID'] = sessionId;
}

// DESPUÉS
// Eliminar todo manejo de sessionId en cliente
// Usar credentials: 'include' para enviar cookies automáticamente

const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Envía cookies automáticamente
    signal: controller.signal,
    cache: 'no-store'
};
```

**Archivo:** `lib/auth-client.tsx` (modificar)

```typescript
// ANTES
const login = async (credentials: any) => {
    const data = await fetchApi<{ user: User }>('auth/login.php', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
    setUser(data.user);
    router.refresh();
};

// DESPUÉS (elimir localStorage)
const login = async (credentials: any) => {
    const data = await fetchApi<{ user: User }>('auth/login.php', {
        method: 'POST',
        body: JSON.stringify(credentials),
        credentials: 'include' // Importante para cookies
    });
    setUser(data.user);
    router.refresh();
};

// Eliminar en logout
const logout = async () => {
    await fetchApi('auth/logout.php', { 
        method: 'POST',
        credentials: 'include' 
    });
    setUser(null);
    router.push('/');
    router.refresh();
};
```

**Archivo:** `public/api/auth/login.php` (modificar)

```php
// Añadir al inicio después de verificar credenciales
session_start();

// ANTES: devolver session_id en JSON
jsonData([
    'message' => 'Login exitoso',
    'session_id' => $session_id, // Eliminar esto
    'user' => [...]
]);

// DESPUÉS: no devolver session_id (la cookie ya lo maneja)
jsonData([
    'message' => 'Login exitoso',
    'user' => [...]
]);
```

**Riesgo:** Alto - Requiere testing completo de login/logout

---

### Fase 3: Mantenibilidad (Semana 3)

#### 3.1 Crear BaseController reutilizable

**Archivo:** `public/api/config/BaseController.php` (nuevo)

```php
<?php
// public/api/config/BaseController.php

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/rate_limit.php';

class BaseController {
    protected $db;
    protected $limiter;
    
    public function __construct() {
        // CORS
        $this->handleCors();
        
        // Rate limiting (opcional, comentar si no se usa)
        // $this->limiter = new RateLimiter();
        // $this->limiter->check();
        
        // Database
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    private function handleCors() {
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
        }
        
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            exit(0);
        }
    }
    
    protected function requireMethod($method) {
        if ($_SERVER['REQUEST_METHOD'] !== $method) {
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            exit;
        }
    }
    
    protected function getJsonInput() {
        $input = json_decode(file_get_contents("php://input"), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido']);
            exit;
        }
        return $input;
    }
    
    protected function jsonSuccess($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
    
    protected function jsonError($message, $code = 400) {
        http_response_code($code);
        error_log("API Error: $message");
        echo json_encode(['error' => $message]);
        exit;
    }
}
```

**Ejemplo de uso en endpoint:**

```php
<?php
// public/api/experiences/index.php (refactorizado)

require_once '../config/BaseController.php';

class ExperiencesController extends BaseController {
    public function __construct() {
        parent::__construct();
        $this->requireMethod('GET');
    }
    
    public function index() {
        try {
            $query = "SELECT * FROM experiences ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $experiences = [];
            while ($row = $stmt->fetch()) {
                $experiences[] = $this->mapExperience($row);
            }
            
            $this->jsonSuccess($experiences);
            
        } catch (Exception $e) {
            error_log("Error fetching experiences: " . $e->getMessage());
            $this->jsonError('Error al cargar experiencias', 500);
        }
    }
    
    private function mapExperience($row) {
        return [
            'id' => $row['id'],
            'title' => $row['title'],
            // ... resto de campos
        ];
    }
}

$controller = new ExperiencesController();
$controller->index();
?>
```

**Riesgo:** Bajo - Nueva estructura opcional

---

#### 3.2 Estandarizar validación de entrada

Crear archivo `public/api/config/validation.php`:

```php
<?php
// public/api/config/validation.php

class Validator {
    public static function required($data, $fields) {
        $missing = [];
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $missing[] = $field;
            }
        }
        if (!empty($missing)) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Campos requeridos faltantes',
                'missing' => $missing
            ]);
            exit;
        }
        return true;
    }
    
    public static function email($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email inválido']);
            exit;
        }
        return true;
    }
}
```

---

### Checklist de Pruebas (Post-Cambios)

| Prueba | Método |
|--------|--------|
| Login usuario | Verificar que cookie se guarda |
| Logout usuario | Verificar que cookie se elimina |
| Crear reserva | Verificar que funciona con nueva sesión |
| Admin crear experiencia | Verificar autenticación funciona |
| Error 500 | Verificar que no expone detalles |
| Rate limiting | Probar múltiples requests rápidos |

---

## Archivos a Modificar (Resumen)

| Fase | Archivo | Cambio |
|------|---------|--------|
| 1.1 | `public/api/config/database.php` | Variables de entorno |
| 1.2 | `public/api/bookings/create.php` | Prepared statement |
| 1.3 | `public/api/utils/response.php` | Funciones de error |
| 1.4 | `public/api/config/rate_limit.php` | **NUEVO** |
| 2.1 | `lib/api-client.ts` | Eliminar localStorage |
| 2.2 | `lib/auth-client.tsx` | Cookies httpOnly |
| 2.3 | `public/api/auth/login.php` | No devolver session_id |
| 3.1 | `public/api/config/BaseController.php` | **NUEVO** |
| 3.2 | `public/api/config/validation.php` | **NUEVO** |

---

## ¿Qué NO se debe cambiar?

| Mantener | Razón |
|----------|-------|
| Estructura de carpetas API | Ya funciona correctamente |
| Endpoints existentes | Frontend depende de ellos |
| Formato de respuestas JSON | Consistencia con el cliente |
| Sistema de sesiones PHP | Ya está configurado correctamente |

---

## Recomendación de Prioridades

1. **Inmediato:** Corregir SQL injection y mover credenciales (riesgo bajo, seguridad alta)
2. **Esta semana:** Implementar manejo de errores centralizado
3. **Próxima semana:** Rate limiting
4. **Semana 2:** Cambiar de localStorage a cookies (requiere testing)

---

*Documento generado automáticamente - Febrero 2026*
