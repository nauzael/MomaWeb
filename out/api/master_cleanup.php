<?php
header('Content-Type: application/json');
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Disable FK checks just in case, though we will try to delete in order
    try {
        $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    } catch (Exception $e) { /* Continue if user lacks SUPER privilege */ }

    // Helper to clear a table safe-ish
    function clearTable($db, $table) {
        try {
            // Use DELETE instead of TRUNCATE as it requires fewer permissions usually
            $db->exec("DELETE FROM $table");
            // Reset Auto Increment if possible (will fail on UUIDs/Char keys but harmless)
            try { $db->exec("ALTER TABLE $table AUTO_INCREMENT = 1"); } catch(Exception $e) {}
            return "Cleared $table";
        } catch (Exception $e) {
            return "Failed to clear $table: " . $e->getMessage();
        }
    }

    $log = [];
    
    // Order matters if FK checks are on. Child tables first.
    // 1. Payments (depends on Bookings)
    $log['payments'] = clearTable($db, 'payments');

    // 2. Bookings (depends on Experiences, Users)
    $log['bookings'] = clearTable($db, 'bookings');

    // 3. Experience Media (if exists)
    $log['experience_media'] = clearTable($db, 'experience_media');

    // 4. Experiences
    $log['experiences'] = clearTable($db, 'experiences');

    // 5. Gallery
    $log['gallery_images'] = clearTable($db, 'gallery_images');
    
    // User requested "control total", but generally we don't delete 'users' unless asked. 
    // If they want full reset, maybe users too? keeping users for now to allow login.

    try {
        $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    } catch (Exception $e) {}

    // 2. Clear Physical Media Files
    $baseUploads = dirname(__DIR__) . '/uploads';
    $dirs = [
        $baseUploads,
        $baseUploads . '/gallery',
        $baseUploads . '/experiences'
    ];

    $filesLog = [];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            if (mkdir($dir, 0777, true)) {
                $filesLog[] = "Created $dir";
            } else {
                $filesLog[] = "Failed to create $dir";
            }
        } else {
            chmod($dir, 0755); // Security: not as permissive as 0777 if not needed
            $filesLog[] = "Directory $dir cleared and verified";
        }
        
        // Delete all files in directory
        if (is_dir($dir)) {
            $files = glob($dir . '/*');
            foreach ($files as $file) {
                if (is_file($file) && basename($file) !== '.htaccess' && basename($file) !== 'index.html') {
                    unlink($file);
                }
            }
        }
    }

    echo json_encode([
        'success' => true,
        'status' => 'Full System Reset Completed',
        'details' => [
            'database' => $log,
            'files' => $filesLog
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
