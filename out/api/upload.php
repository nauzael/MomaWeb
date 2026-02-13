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

// Helper to slugify filenames
function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'n-a' : $text;
}

$file = $_FILES['file'];
$uploadDir = '../uploads/'; // Relative to public/api/
$publicUrl = '/uploads/';

// Ensure directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Check for duplicates by cleaning the original name
$originalName = pathinfo($file['name'], PATHINFO_FILENAME);
$cleanName = slugify($originalName);
$filename = $cleanName . '.webp';
$targetFile = $uploadDir . $filename;

// REUSE LOGIC: If file already exists, return its URL immediately
if (file_exists($targetFile)) {
    jsonData([
        'url' => $publicUrl . $filename,
        'reused' => true,
        'message' => 'Imagen reutilizada (ya existe en el servidor)'
    ]);
    exit;
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = @finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedTypes)) {
    jsonError('Tipo de archivo no permitido. Solo imágenes.', 400);
}

// Procesar y optimizar la imagen
if (processImageToWebP($file['tmp_name'], $targetFile)) {
    jsonData(['url' => $publicUrl . $filename, 'reused' => false]);
} else {
    // Fallback por si falla GD: intentar mover el archivo original con nombre limpio
    $originalExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = $cleanName . '.' . $originalExt;
    $targetFile = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        jsonData(['url' => $publicUrl . $filename, 'reused' => false]);
    } else {
        error_log("Upload Failed: Could not move file to $targetFile");
        jsonError('Error al procesar y guardar la imagen', 500);
    }
}
?>
