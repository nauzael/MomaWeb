<?php
// public/api/utils/thumb.php
// Script to generate thumbnails on the fly for gallery images

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'image_utils.php';

$src = $_GET['src'] ?? $_GET['file'] ?? null;

if (!$src) {
    header("HTTP/1.1 400 Bad Request");
    exit("Missing src or file parameter");
}

// Security: Prevent directory traversal
$cleanSrc = str_replace(['../', '..\\'], '', $src);

// Determine the relative path to gallery
// We expect something like 'uploads/gallery/filename.webp' or just 'filename.webp'
if (strpos($cleanSrc, 'uploads/gallery/') === false) {
    $galleryRelativePath = 'uploads/gallery/' . ltrim($cleanSrc, '/');
} else {
    $galleryRelativePath = $cleanSrc;
}

// Absolute path on server
$baseDir = realpath(dirname(dirname(__DIR__))); // Usually public_html
$fullSourcePath = $baseDir . '/' . $galleryRelativePath;

if (!file_exists($fullSourcePath)) {
    header("HTTP/1.1 404 Not Found");
    error_log("Thumb Generator: Source not found at $fullSourcePath");
    exit("Source image not found: " . $galleryRelativePath);
}

// Thumbnail path
$thumbRelativePath = str_replace('uploads/gallery/', 'uploads/gallery/thumbs/', $galleryRelativePath);
$fullThumbPath = $baseDir . '/' . $thumbRelativePath;
$thumbDir = dirname($fullThumbPath);

// Try to create thumb directory if missing
if (!is_dir($thumbDir)) {
    @mkdir($thumbDir, 0755, true);
}

// Generate thumbnail if missing or outdated
$servedFullRes = true;
if (is_writable($thumbDir) || (!file_exists($fullThumbPath) && @mkdir($thumbDir, 0755, true))) {
    if (!file_exists($fullThumbPath) || filemtime($fullSourcePath) > filemtime($fullThumbPath)) {
        if (generateThumbnail($fullSourcePath, $fullThumbPath, 400, 400, 80)) {
            $servedFullRes = false;
        }
    } else {
        $servedFullRes = false;
    }
}

$pathToServe = (!$servedFullRes && file_exists($fullThumbPath)) ? $fullThumbPath : $fullSourcePath;

// Serve the image
$info = @getimagesize($pathToServe);
if (!$info) {
    header("HTTP/1.1 500 Internal Server Error");
    exit("Could not determine image type for $pathToServe");
}

header("Content-Type: " . $info['mime']);
header("Content-Length: " . filesize($pathToServe));
header("Cache-Control: public, max-age=31536000, immutable");
header("X-Thumbnail-Generated: " . ($servedFullRes ? 'No' : 'Yes'));
readfile($pathToServe);
exit;
?>
