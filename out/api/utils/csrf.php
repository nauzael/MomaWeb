<?php
// public/api/utils/csrf.php

/**
 * Funciones de protección CSRF
 */

function csrf_init() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

function csrf_token() {
    csrf_init();
    return $_SESSION['csrf_token'];
}

function csrf_field() {
    $token = csrf_token();
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
}

function csrf_validate($token) {
    if (!$token) {
        return false;
    }
    
    csrf_init();
    
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

function csrf_check() {
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Solo validar en métodos que modifican datos
    if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        return true;
    }
    
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
    
    if (!csrf_validate($token)) {
        http_response_code(403);
        echo json_encode(['error' => 'Token CSRF inválido']);
        exit;
    }
    
    return true;
}
