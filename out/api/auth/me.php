<?php
// public/api/auth/me.php

require_once '../config/cors.php';
require_once '../utils/response.php';

// Soporte para sesión vía header
if (isset($_SERVER['HTTP_X_SESSION_ID'])) {
    session_id($_SERVER['HTTP_X_SESSION_ID']);
}
session_start();

if (isset($_SESSION['user_id'])) {
    jsonData([
        'user' => [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['email'],
            'name' => $_SESSION['name'],
            'role' => $_SESSION['role']
        ]
    ]);
} else {
    // Return null user instead of error so frontend knows state is "anonymous"
    jsonData(['user' => null]);
}
?>
