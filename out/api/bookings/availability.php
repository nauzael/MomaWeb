<?php
// public/api/bookings/availability.php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método no permitido', 405);
}

$experienceId = $_GET['experienceId'] ?? null;

if (!$experienceId) {
    jsonError('Falta ID de experiencia', 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    // Select booked guests count per date for this experience, excluding cancelled bookings
    $query = "SELECT travel_date, SUM(guests_count) as total_guests 
              FROM bookings 
              WHERE experience_id = :experienceId 
              AND status != 'cancelled'
              GROUP BY travel_date";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':experienceId', $experienceId);
    $stmt->execute();
    
    $availability = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Ensure date format matches 'yyyy-MM-dd' which is standard HTML date
        // substr(0, 10) ensures we just get the date part if it's datetime
        $date = substr($row['travel_date'], 0, 10);
        $availability[$date] = (int)$row['total_guests'];
    }
    
    jsonData(['availability' => $availability]);

} catch (PDOException $e) {
    error_log("Availability Fetch Error: " . $e->getMessage());
    jsonError('Error de base de datos', 500);
}
?>
