<?php
header('Content-Type: application/json');
$report = [
    'gd_extension' => extension_loaded('gd') ? 'Loaded' : 'Not Found',
    'gd_info' => function_exists('gd_info') ? gd_info() : 'No info',
    'permissions' => [
        'uploads' => is_writable('../../uploads'),
        'gallery' => is_writable('../../uploads/gallery'),
        'thumbs' => is_dir('../../uploads/gallery/thumbs') ? is_writable('../../uploads/gallery/thumbs') : 'Dir not found'
    ]
];
echo json_encode($report, JSON_PRETTY_PRINT);
?>
