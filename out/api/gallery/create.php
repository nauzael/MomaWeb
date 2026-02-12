<?php
// public/api/gallery/create.php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../utils/response.php';
require_once '../utils/auth_check.php';
require_once '../utils/image_processor.php';

checkAuth('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$uploadDir = '../../uploads/gallery/';
$publicUrlBase = '/uploads/gallery/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Handle single or multiple files
$files = $_FILES['files'] ?? null;

if (!$files) {
    jsonError('No se subieron archivos', 400);
}

$uploadedImages = [];
$errors = [];

try {
    $database = new Database();
    $db = $database->getConnection();

    // Standardize $_FILES structure if recursive
    $fileCount = is_array($files['name']) ? count($files['name']) : 1;

    for ($i = 0; $i < $fileCount; $i++) {
        $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
        $tmp_name = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
        $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];

        if ($error !== UPLOAD_ERR_OK) {
            $errors[] = "Error al subir $name: código $error";
            continue;
        }

        // Validate type
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $tmp_name);
        finfo_close($finfo);

        if (!in_array($mime, $allowed)) {
             $errors[] = "$name tiene un tipo no permitido ($mime)";
             continue;
        }

        // Generate filename with .webp extension
        $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', substr($name, 0, 10));
        $filename = time() . '_' . $cleanName . '_' . uniqid() . '.webp';
        $target = $uploadDir . $filename;

        // Process and Optimize
        if (processImageToWebP($tmp_name, $target)) {
            $url = $publicUrlBase . $filename;
            
            // Insert logic
            $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            $stmt = $db->prepare("INSERT INTO gallery_images (id, url, alt_text) VALUES (:id, :url, :alt_text)");
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':url', $url);
            $stmt->bindParam(':alt_text', $name);

            if ($stmt->execute()) {
                $uploadedImages[] = [
                    'id' => $id,
                    'url' => $url,
                    'alt_text' => $name,
                    'status' => 'success'
                ];
            } else {
                 $errors[] = "Error BD al guardar $name";
                 unlink($target);
            }
        } else {
            // Fallback: move original if processing fails
            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $filename = time() . '_' . $cleanName . '_' . uniqid() . '.' . $ext;
            $target = $uploadDir . $filename;
            
            if (move_uploaded_file($tmp_name, $target)) {
                $url = $publicUrlBase . $filename;
                // Add to DB... (repeat insert logic or refactor out)
                $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
                $stmt = $db->prepare("INSERT INTO gallery_images (id, url, alt_text) VALUES (:id, :url, :alt_text)");
                $stmt->bindParam(':id', $id); $stmt->bindParam(':url', $url); $stmt->bindParam(':alt_text', $name);
                if ($stmt->execute()) {
                    $uploadedImages[] = ['id' => $id, 'url' => $url, 'alt_text' => $name, 'status' => 'success'];
                } else { 
                    $errors[] = "Error BD al guardar $name"; 
                    unlink($target); 
                }
            } else {
                error_log("Fallback Failed for $name");
                $errors[] = "Error al procesar y guardar $name";
            }
        }
    }

    if (empty($uploadedImages) && !empty($errors)) {
        error_log("Gallery Upload Failures: " . implode(', ', $errors));
        jsonError("Fallaron todas las subidas: " . implode(', ', $errors), 500);
    }

    jsonData([
        'success' => true,
        'results' => $uploadedImages,
        'errors' => $errors
    ]);

} catch (Exception $e) {
    error_log("Gallery Create Error: " . $e->getMessage());
    jsonError("Excepción del servidor: " . $e->getMessage());
}
?>
