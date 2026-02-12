<?php
// public/api/experiences/index.php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/response.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT * FROM experiences ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $experiences = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Map DB columns to frontend interface
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
        array_push($experiences, $item);
    }
    
    jsonData($experiences);
} catch (Exception $e) {
    error_log("Error fetching experiences: " . $e->getMessage());
    jsonError('Error al cargar experiencias', 500);
}
?>
