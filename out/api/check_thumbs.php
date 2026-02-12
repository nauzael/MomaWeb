<?php
header('Content-Type: application/json');
$path = '../../uploads/gallery/thumbs';
echo json_encode([
    'exists' => is_dir($path),
    'writable' => is_writable($path),
    'parent_writable' => is_writable('../../uploads/gallery'),
    'contents' => is_dir($path) ? scandir($path) : []
], JSON_PRETTY_PRINT);
?>
