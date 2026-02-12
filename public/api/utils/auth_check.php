<?php
// public/api/utils/auth_check.php

// Ensure CORS headers for OPTIONS requests (Preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // These should be handled by cors.php, but we add a safety exit here
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

// Soporte para sesión vía header o query string
$sessionId = $_SERVER['HTTP_X_SESSION_ID'] ?? $_GET['php_session_id'] ?? null;

// Intentar obtener de todos los headers si los de arriba fallan
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
    session_id($sessionId);
}

session_start();

function checkAuth($role = null) {
    // Allow OPTIONS requests to bypass auth check entirely
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        return true;
    }

    if (!isset($_SESSION['user_id'])) {
        error_log("Auth Check Failed: No session user_id.");
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
