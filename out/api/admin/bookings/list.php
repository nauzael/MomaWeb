<?php
// public/api/bookings/list.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth_check.php';

// Verify Admin headers
checkAuth('admin');

$database = new Database();
$db = $database->getConnection();

try {
    // We first check if user_id exists to avoid SQL errors
    $hasUserId = false;
    try {
        $db->query("SELECT user_id FROM bookings LIMIT 1");
        $hasUserId = true;
    } catch (Exception $e) {}

    $userIdSelect = $hasUserId ? "b.user_id," : "NULL as user_id,";
    $userJoin = $hasUserId ? "LEFT JOIN User u ON b.user_id = u.id" : "";

    $query = "SELECT 
        b.id, b.experience_id, $userIdSelect b.customer_name, b.customer_email, 
        b.travel_date, b.guests_count, b.total_amount, b.currency, b.status, b.created_at,
        e.title as experience_title" . ($hasUserId ? ", u.name as user_name" : ", 'N/A' as user_name") . "
        FROM bookings b
        LEFT JOIN experiences e ON b.experience_id = e.id
        $userJoin
        ORDER BY b.created_at DESC";
        
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format if needed
    foreach ($bookings as &$booking) {
        $booking['guests_count'] = (int)$booking['guests_count'];
        $booking['total_amount'] = (float)$booking['total_amount'];
    }
    
    jsonData($bookings);
} catch (PDOException $e) {
    error_log("Bookings List Error: " . $e->getMessage());
    jsonError('Error de base de datos: ' . $e->getMessage(), 500);
}
?>
