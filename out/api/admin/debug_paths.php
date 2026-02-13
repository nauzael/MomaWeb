<?php
header('Content-Type: application/json');

function list_dir_safe($path, $max_depth = 1, $current_depth = 0) {
    if (!is_dir($path)) return ["error" => "Not a directory", "path" => $path];
    if ($current_depth > $max_depth) return "...";

    $results = [];
    $files = @scandir($path);
    if ($files === false) return ["error" => "Permission denied", "path" => $path];

    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $full_path = $path . DIRECTORY_SEPARATOR . $file;
        if (is_dir($full_path)) {
            $results[$file] = list_dir_safe($full_path, $max_depth, $current_depth + 1);
        } else {
            $results[] = $file;
        }
    }
    return $results;
}

$root = '/home/momaexcu';
echo json_encode([
    "current_dir" => __DIR__,
    "root_listing" => [
        "home_momaexcu" => list_dir_safe($root, 1)
    ]
], JSON_PRETTY_PRINT);
