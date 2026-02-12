<?php
// public/api/utils/auth_check.php

// Soporte para sesión vía header o query string (para desarrollo local cross-domain)
$sessionId = $_SERVER['HTTP_X_SESSION_ID'] ?? $_SERVER['HTTP_X_SESSION_ID'] ?? $_GET['php_session_id'] ?? null;

// Intentar obtener de todos los headers si los de arriba fallan (algunos servidores Apache/Nginx filtran headers)
if (!$sessionId && function_exists('getallheaders')) {
    $allHeaders = getallheaders();
    foreach ($allHeaders as $name => $value) {
        if (strtolower($name) === 'x-session-id') {
            $sessionId = $value;
            break;
        }
    }
}

if ($sessionId && preg_match('/^[a-zA-Z0-9,-]{1,128}$/', $sessionId)) {

// Ensure CORS headers are sent for OPTIONS requests before any auth check logic
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // cors.php should have handled this, but if it didn't (e.g. auth_check included before cors), we exit here.
    exit(0);
}

function checkAuth($role = null) {
    // Allow OPTIONS requests to bypass auth check entirely
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        return true;
    }

    if (!isset($_SESSION['user_id'])) {
        error_log("Auth Check Failed: No session user_id. Session info: " . print_r($_SESSION, true));
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit;
    }

    if ($role && $_SESSION['role'] !== $role && $_SESSION['role'] !== 'admin') {
        error_log("Auth Check Failed: Insufficient permissions. User role: " . $_SESSION['role'] . ", Required role: $role");
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(403);
        echo json_encode(['error' => 'Permisos insuficientes']);
        exit;
    }

    return true;
}
?>
