<?php
// public/api/gallery/index.php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método no permitido', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM gallery_images ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonData(['images' => $images]);

} catch (PDOException $e) {
    jsonError("Error en base de datos: " . $e->getMessage(), 500);
}
?>
