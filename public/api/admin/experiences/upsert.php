<?php
// public/api/admin/experiences/upsert.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth_check.php';

// Verify Admin headers
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

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
            location_name = :location_name, 
            location_lat = :lat, 
            location_lng = :lng, 
            includes = :includes, 
            excludes = :excludes, 
            recommendations = :recommendations, 
            max_capacity = :max_capacity,
            itinerary = :itinerary,
            updated_at = NOW()
            WHERE id = :id";
    } else {
        $query = "INSERT INTO experiences (
            id, title, slug, description, image, gallery, 
            price_cop, price_usd, location_name, location_lat, location_lng, 
            includes, excludes, recommendations, max_capacity, itinerary, created_at, updated_at
        ) VALUES (
            :id, :title, :slug, :description, :image, :gallery, 
            :price_cop, :price_usd, :location_name, :lat, :lng, 
            :includes, :excludes, :recommendations, :max_capacity, :itinerary, NOW(), NOW()
        )";
    }

    // Prepare JSON fields carefully
    // Force array if null
    $galleryArr = is_array($data['gallery']) ? $data['gallery'] : [];
    $includesArr = is_array($data['includes']) ? $data['includes'] : [];
    $excludesArr = is_array($data['excludes']) ? $data['excludes'] : [];

    // JSON options to handle unicode and avoid escaping slashes unnecessarily usually
    $gallery = json_encode($galleryArr, JSON_UNESCAPED_UNICODE);
    $includes = json_encode($includesArr, JSON_UNESCAPED_UNICODE);
    $excludes = json_encode($excludesArr, JSON_UNESCAPED_UNICODE);
    $itinerary = json_encode($data['itinerary'] ?? [], JSON_UNESCAPED_UNICODE);
    
    // Check for JSON errors
    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonError('Error al procesar JSON: ' . json_last_error_msg(), 400);
    }

    $stmt = $db->prepare($query);
    $params = [
        ':id' => $id,
        ':title' => $title,
        ':slug' => $slug,
        ':description' => $description,
        ':image' => $image,
        ':gallery' => $gallery,
        ':price_cop' => (float)$price_cop,
        ':price_usd' => (float)$price_usd,
        ':location_name' => $location_name,
        ':lat' => (float)$lat,
        ':lng' => (float)$lng,
        ':includes' => $includes,
        ':excludes' => $excludes,
        ':recommendations' => $recommendations,
        ':max_capacity' => (int)$max_capacity,
        ':itinerary' => $itinerary
    ];

    // Simplified debug logging
    error_log("UPSERT Params: " . print_r($params, true));
    if ($stmt->execute($params)) {
        // Fetch the updated/created record to return
        $fetchQuery = "SELECT * FROM experiences WHERE id = :id";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->execute([':id' => $id]);
        $row = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        
        // Map back to JSON
         $item = [
            'id' => $row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'description' => $row['description'],
            'image' => $row['image'],
            'gallery' => json_decode($row['gallery'] ?? '[]'),
            'price_cop' => (float)$row['price_cop'],
            'price_usd' => (float)$row['price_usd'],
            'location_name' => $row['location_name'],
            'location_coords' => [
                'lat' => (float)$row['location_lat'],
                'lng' => (float)$row['location_lng']
            ],
            'includes' => json_decode($row['includes'] ?? '[]'),
            'excludes' => json_decode($row['excludes'] ?? '[]'),
            'itinerary' => json_decode($row['itinerary'] ?? '[]'),
            'recommendations' => $row['recommendations'],
            'max_capacity' => (int)$row['max_capacity'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
        
        jsonData(['experience' => $item]);
    } else {
        jsonError('Error al guardar en base de datos', 500);
    }

} catch (PDOException $e) {
    error_log("Upsert Error: " . $e->getMessage());
    jsonError('Error de base de datos: ' . $e->getMessage(), 500);
}
?>
