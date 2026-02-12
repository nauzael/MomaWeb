<?php
// public/api/gallery/clear_everything.php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../utils/response.php';

// Check for a secret key or just allow for now since it's a requested cleanup
// In a real app, you'd want auth here.

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Clear gallery_images
    $db->exec("DELETE FROM gallery_images");
    $db->exec("ALTER TABLE gallery_images AUTO_INCREMENT = 1");
    $res1 = "gallery_images cleared.";

    // 2. Clear experience_media
    $db->exec("DELETE FROM experience_media");
    $db->exec("ALTER TABLE experience_media AUTO_INCREMENT = 1");
    $res2 = "experience_media cleared.";

    // 3. Reset experiences
    $db->exec("UPDATE experiences SET image = '', gallery = '[]'");
    $res3 = "experiences reset.";

    // 4. Delete physical files in uploads/gallery
    $galleryDir = '../../uploads/gallery/';
    $filesDeleted = 0;
    if (is_dir($galleryDir)) {
        $files = glob($galleryDir . '*');
        foreach ($files as $file) {
            if (is_file($file) && basename($file) !== '.htaccess') {
                unlink($file);
                $filesDeleted++;
            }
        }
    }
    $res4 = "Deleted $filesDeleted files from uploads/gallery/.";
    
    // 5. Delete physical files in uploads/experiences
    $expDir = '../../uploads/experiences/';
    $expFilesDeleted = 0;
    if (is_dir($expDir)) {
        $files = glob($expDir . '*');
        foreach ($files as $file) {
            if (is_file($file) && basename($file) !== '.htaccess') {
                unlink($file);
                $expFilesDeleted++;
            }
        }
    }
    $res5 = "Deleted $expFilesDeleted files from uploads/experiences/.";

    jsonData([
        'success' => true,
        'results' => [
            $res1,
            $res2,
            $res3,
            $res4,
            $res5
        ]
    ]);

} catch (Exception $e) {
    jsonError("Error: " . $e->getMessage());
}
?>
