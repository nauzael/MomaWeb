<?php
header('Content-Type: application/json');

$results = [
    'doc_root' => $_SERVER['DOCUMENT_ROOT'],
    'api_dir' => __DIR__,
    'parent_dir' => dirname(__DIR__),
    'api_files' => scandir(__DIR__),
    'parent_files' => scandir(dirname(__DIR__)),
];

$uploads_path = dirname(__DIR__) . '/uploads';
$results['uploads'] = [
    'path' => $uploads_path,
    'exists' => is_dir($uploads_path),
    'writable' => is_writable($uploads_path),
];

if (is_dir($uploads_path)) {
    $results['uploads']['files'] = scandir($uploads_path);
    $gallery_path = $uploads_path . '/gallery';
    $results['gallery'] = [
        'path' => $gallery_path,
        'exists' => is_dir($gallery_path),
        'writable' => is_writable($gallery_path),
        'files' => is_dir($gallery_path) ? scandir($gallery_path) : []
    ];
}

echo json_encode($results, JSON_PRETTY_PRINT);
