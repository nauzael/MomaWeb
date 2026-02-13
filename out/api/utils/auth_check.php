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

// Hardening session cookies
if (PHP_VERSION_ID < 70300) {
    session_set_cookie_params(0, '/; HttpOnly; SameSite=Lax');
} else {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

// Soporte para sesión vía header únicamente (seguridad: eliminar $_GET['php_session_id'])
$sessionId = $_SERVER['HTTP_X_SESSION_ID'] ?? null;

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
