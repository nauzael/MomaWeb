<?php
// public/api/utils/thumb.php
// Script to generate thumbnails on the fly for gallery images

require_once 'image_utils.php';

$imagePath = $_GET['src'] ?? null;
if (!$imagePath) {
    header("HTTP/1.1 400 Bad Request");
    exit("Missing src");
}

// Security: Prevent directory traversal and only allow thumbnails for gallery images
$cleanPath = str_replace(['../', '..\\'], '', $imagePath);
if (strpos($cleanPath, 'uploads/gallery/') !== 0) {
    header("HTTP/1.1 403 Forbidden");
    exit("Invalid path scope");
}

$fullSourcePath = dirname(dirname(__DIR__)) . '/' . $cleanPath;
if (!file_exists($fullSourcePath)) {
    header("HTTP/1.1 404 Not Found");
    exit("Image not found: " . $cleanPath);
}

// Thumbnail path
$thumbPath = str_replace('uploads/gallery/', 'uploads/gallery/thumbs/', $fullSourcePath);
$thumbDir = dirname($thumbPath);

if (!is_dir($thumbDir)) {
    mkdir($thumbDir, 0755, true);
}

// Generate thumbnail if it doesn't exist
if (!file_exists($thumbPath) || filemtime($fullSourcePath) > filemtime($thumbPath)) {
    if (!generateThumbnail($fullSourcePath, $thumbPath, 400, 400, 80)) {
        // Fallback to source if generation fails
        $thumbPath = $fullSourcePath;
    }
}

// Serve the thumbnail
$info = getimagesize($thumbPath);
header("Content-Type: " . $info['mime']);
header("Content-Length: " . filesize($thumbPath));
header("Cache-Control: public, max-age=31536000, immutable");
readfile($thumbPath);
exit;
?>
