<?php
// public/api/upload.php

require_once 'config/cors.php';
require_once 'utils/response.php';
require_once 'utils/auth_check.php';
require_once 'utils/image_processor.php';

// Allow uploads from authenticated admin only
checkAuth('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    jsonError('Error al subir archivo', 400);
}

$file = $_FILES['file'];
$uploadDir = '../uploads/'; // Relative to public/api/
$publicUrl = '/uploads/';

// Ensure directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedTypes)) {
    jsonError('Tipo de archivo no permitido. Solo imágenes.', 400);
}

// Forzar extensión .webp para el archivo optimizado
$filename = uniqid('img_', true) . '.webp';
$targetFile = $uploadDir . $filename;

// Procesar y optimizar la imagen
if (processImageToWebP($file['tmp_name'], $targetFile)) {
    jsonData(['url' => $publicUrl . $filename]);
} else {
    // Fallback por si falla GD: intentar mover el archivo original
    $originalExt = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_', true) . '.' . $originalExt;
    $targetFile = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        jsonData(['url' => $publicUrl . $filename]);
    } else {
        error_log("Upload Failed: Could not move file to $targetFile");
        jsonError('Error al procesar y guardar la imagen', 500);
    }
}
?>
