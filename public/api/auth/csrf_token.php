<?php
// public/api/auth/csrf_token.php

require_once '../config/cors.php';

// Don't start a new session - just return empty token if no session exists
// This endpoint should work without authentication
if (session_status() === PHP_SESSION_NONE) {
    // Don't start a new session - just try to resume if cookie is sent
    session_start();
}

// Get existing CSRF token if session has one
$csrfToken = $_SESSION['csrf_token'] ?? '';

header('Content-Type: application/json');
echo json_encode([
    'csrf_token' => $csrfToken
]);
?>
