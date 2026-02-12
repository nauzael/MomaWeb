<?php
// public/api/auth/logout.php

require_once '../config/cors.php';
require_once '../utils/response.php';

// Soporte para sesión vía header
if (isset($_SERVER['HTTP_X_SESSION_ID'])) {
    session_id($_SERVER['HTTP_X_SESSION_ID']);
}
session_start();
session_destroy();

jsonData(['message' => 'Sesión cerrada exitosamente']);
?>
