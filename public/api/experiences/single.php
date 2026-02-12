<?php
// public/api/experiences/single.php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/response.php';

$database = new Database();
$db = $database->getConnection();

$identifier = isset($_GET['slug']) ? $_GET['slug'] : (isset($_GET['id']) ? $_GET['id'] : null);

if (!$identifier) {
    jsonError('No identifier provided', 400);
}

try {
    $query = "SELECT * FROM experiences WHERE slug = :id OR id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $identifier);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
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
        
        jsonData($item);
    } else {
        jsonError('Experience not found', 404);
    }
} catch (Exception $e) {
    error_log("Error fetching single experience: " . $e->getMessage());
    jsonError('Error al cargar experiencia', 500);
}
?>
