<?php
// public/api/admin/experiences/upsert.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth_check.php';
require_once '../../utils/csrf.php';

// Verify Admin headers
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

// CSRF check
csrf_check();

// Check session
error_log("UPSERT HIT. Method: " . $_SERVER['REQUEST_METHOD']);
checkAuth('admin');

$input = json_decode(file_get_contents("php://input"), true);
if (!isset($input['experience'])) {
    jsonError('Datos incompletos', 400);
}

$data = $input['experience'];
$database = new Database();
$db = $database->getConnection();

try {
    // Generate ID if not present
    $id = isset($data['id']) ? $data['id'] : uniqid();
    $isUpdate = isset($data['id']);

    // Prepare fields
    $title = $data['title'];
    $slug = $data['slug'];
    $description = $data['description'];
    $image = $data['image'];
    // Gallery handled below
    $price_cop = $data['price_cop'];
    $price_usd = $data['price_usd'];
    $location_name = $data['location_name'];
    $recommendations = $data['recommendations'] ?? '';
    // Handle location structure
    $lat = isset($data['location_coords']['lat']) ? $data['location_coords']['lat'] : 0;
    $lng = isset($data['location_coords']['lng']) ? $data['location_coords']['lng'] : 0;
    
    // Includes/Excludes handled below
    $max_capacity = isset($data['max_capacity']) ? $data['max_capacity'] : 10;
    
    // Check slug uniqueness (if new or changed)
    // Simplified: we rely on DB unique constraint violation to catch this or do a check.
    // Let's do a quick check.
    $checkQuery = "SELECT id FROM experiences WHERE slug = :slug AND id != :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([':slug' => $slug, ':id' => $id]);
    if ($checkStmt->rowCount() > 0) {
        jsonError('El slug ya existe', 409);
    }

    if ($isUpdate) {
        $query = "UPDATE experiences SET 
            title = :title, 
            slug = :slug, 
            description = :description, 
            image = :image, 
            gallery = :gallery, 
            price_cop = :price_cop, 
            price_usd = :price_usd, 
        jsonData(['experience' => $item]);
    } else {
        jsonError('Error al guardar en base de datos', 500);
    }

} catch (PDOException $e) {
    error_log("Upsert Error: " . $e->getMessage());
    jsonError('Error de base de datos: ' . $e->getMessage(), 500);
}
?>
