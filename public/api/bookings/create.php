<?php
// public/api/bookings/create.php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/response.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$input = json_decode(file_get_contents("php://input"), true);
// Allow 'booking' key or direct payload
$data = isset($input['booking']) ? $input['booking'] : $input;

// Basic validation
if (!isset($data['experience_id']) || !isset($data['customer_name']) || !isset($data['customer_email']) || !isset($data['travel_date'])) {
    error_log(print_r($data, true)); // Log input for debugging
    jsonError('Datos incompletos', 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    $id = uniqid();
    // Use session user_id if available, otherwise null
    $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    
    // We remove user_id from the main INSERT to prevent "Column not found" errors 
    // if the table was created without it or with a different name (like userId).
    // It can be added back or handled via a separate UPDATE if needed.
    
    $query = "INSERT INTO bookings (
        id, experience_id, customer_name, customer_email, 
        travel_date, guests_count, total_amount, currency, status, created_at
    ) VALUES (
        :id, :experience_id, :customer_name, :customer_email, 
        :travel_date, :guests_count, :total_amount, :currency, 'pending', NOW()
    )";
    
    $stmt = $db->prepare($query);
    
    $params = [
        ':id' => $id,
        ':experience_id' => $data['experience_id'],
        ':customer_name' => $data['customer_name'] . (isset($data['customer_phone']) ? ' | ' . $data['customer_phone'] : ''),
        ':customer_email' => $data['customer_email'],
        ':travel_date' => $data['travel_date'], // Ensure YYYY-MM-DD
        ':guests_count' => (int)$data['guests_count'],
        ':total_amount' => (float)$data['total_amount'],
        ':currency' => isset($data['currency']) ? $data['currency'] : 'COP'
    ];
    
    if ($stmt->execute($params)) {
        // If we have a userId and the column exists, we could try to update it separately
        if ($userId) {
            try {
                $db->exec("UPDATE bookings SET user_id = '$userId' WHERE id = '$id'");
            } catch (Exception $e) {
                // Ignore if column doesn't exist
            }
        }

        jsonData([
            'success' => true,
            'bookingId' => $id,
            'message' => 'Reserva creada exitosamente'
        ]);
    } else {
        jsonError('Error al crear reserva', 500);
    }
} catch (PDOException $e) {
    error_log("Booking Create Error: " . $e->getMessage());
    jsonError('Error de base de datos: ' . $e->getMessage(), 500);
}
?>
