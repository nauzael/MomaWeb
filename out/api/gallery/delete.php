<?php
// public/api/gallery/delete.php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../utils/response.php';
require_once '../utils/auth_check.php';

checkAuth('admin');

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    jsonError('Falta ID de imagen', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Obtener la URL de la imagen para borrar el archivo físico
    $stmt = $db->prepare("SELECT url FROM gallery_images WHERE id = :id");
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();
    $image = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$image) {
        // Si no existe en la base de datos, ya es un error 404
        jsonError('Imagen no encontrada en la base de datos', 404);
        exit;
    }

    $urlPath = $image['url'];
    
    // 2. Eliminar de la base de datos PRIMERO
    // Hacemos esto primero para que, aunque el archivo no exista, el registro se limpie
    $delStmt = $db->prepare("DELETE FROM gallery_images WHERE id = :id");
    $delStmt->bindParam(':id', $data->id);
    
    if ($delStmt->execute()) {
        // 3. Intentar eliminar el archivo físico si existe
        // En public/api/gallery/, ../../ apunta a public/
        // Fix path: if url starts with /, remove it.
        $relativePath = ltrim($urlPath, '/');
        $filePath = realpath(__DIR__ . '/../../') . '/' . $relativePath;
        error_log("Trying to delete file at: " . $filePath);
        
        $fileDeleted = false;
        if (file_exists($filePath)) {
            $fileDeleted = unlink($filePath);
        }
        
        jsonData([
            'success' => true, 
            'message' => 'Registro eliminado de la base de datos',
            'file_deleted' => $fileDeleted,
            'path_tried' => $filePath
        ]);
    } else {
        jsonError('Error al eliminar el registro de la base de datos');
    }

} catch (PDOException $e) {
    jsonError("Error en base de datos: " . $e->getMessage(), 500);
}
?>
