<?php
// public/api/utils/response.php

function jsonData($data, $statusCode = 200) {
    // Ensure CORS headers if missed
    if (isset($_SERVER['HTTP_ORIGIN']) && !headers_sent()) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
    }
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function jsonError($message, $statusCode = 400) {
    if (isset($_SERVER['HTTP_ORIGIN']) && !headers_sent()) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
    }
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $message]);
    exit;
}
?>
