<?php
header('Content-Type: application/json');
$path = __DIR__ . '/gallery';
echo json_encode([
    'dir' => $path,
    'files' => is_dir($path) ? scandir($path) : 'not a dir'
], JSON_PRETTY_PRINT);
