<?php
// public/api/utils/thumb.php
// Script to generate thumbnails on the fly for gallery images

require_once 'image_utils.php';

// Support both 'src' with path or just 'file' name
$src = $_GET['src'] ?? $_GET['file'] ?? null;

if (!$src) {
    header("HTTP/1.1 400 Bad Request");
    exit("Missing src or file parameter");
}

// Security: Prevent directory traversal and normalize path
$cleanSrc = str_replace(['../', '..\\'], '', $src);

// If it doesn't start with uploads/gallery/, prepend it if it's just a filename
if (strpos($cleanSrc, 'uploads/gallery/') !== 0) {
    $fullCleanPath = 'uploads/gallery/' . ltrim($cleanSrc, '/');
} else {
    $fullCleanPath = $cleanSrc;
}

// Absolute path on server
$baseDir = dirname(dirname(__DIR__)); // This should be public_html/
$fullSourcePath = $baseDir . '/' . $fullCleanPath;

if (!file_exists($fullSourcePath)) {
    header("HTTP/1.1 404 Not Found");
    error_log("Thumbnail Generator: Source not found at $fullSourcePath");
    exit("Source image not found");
}

// Thumbnail path
$thumbRelativePath = str_replace('uploads/gallery/', 'uploads/gallery/thumbs/', $fullCleanPath);
$fullThumbPath = $baseDir . '/' . $thumbRelativePath;
$thumbDir = dirname($fullThumbPath);

// Try to create thumb directory if missing
if (!is_dir($thumbDir)) {
    @mkdir($thumbDir, 0755, true);
}

// Generate thumbnail if missing or outdated
$generated = false;
if (!file_exists($fullThumbPath) || filemtime($fullSourcePath) > filemtime($fullThumbPath)) {
    if (generateThumbnail($fullSourcePath, $fullThumbPath, 400, 400, 80)) {
        $generated = true;
    }
} else {
    $generated = true; // Exists and is fresh
}

$pathToServe = ($generated && file_exists($fullThumbPath)) ? $fullThumbPath : $fullSourcePath;

// Serve the image
$info = @getimagesize($pathToServe);
if (!$info) {
    header("HTTP/1.1 500 Internal Server Error");
    exit("Could not determine image type");
}

header("Content-Type: " . $info['mime']);
header("Content-Length: " . filesize($pathToServe));
header("Cache-Control: public, max-age=31536000, immutable");
header("X-Generated: " . ($generated ? 'Yes' : 'No'));
readfile($pathToServe);
exit;
?>
