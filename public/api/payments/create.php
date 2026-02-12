<?php
// public/api/payments/create.php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['bookingId'])) {
    jsonError('Falta ID de reserva', 400);
}

$bookingId = $input['bookingId'];
$gateway = isset($input['paymentMethod']) ? $input['paymentMethod'] : 'manual';
$transactionId = isset($input['transactionRef']) ? $input['transactionRef'] : 'N/A';
$status = isset($input['status']) ? $input['status'] : 'pending';

$database = new Database();
$db = $database->getConnection();

try {
    $db->beginTransaction();

    $id = uniqid();
    $query = "INSERT INTO payments (id, booking_id, gateway, transaction_id, payment_status, created_at) 
              VALUES (:id, :booking_id, :gateway, :transaction_id, :status, NOW())";
    
    $stmt = $db->prepare($query);
    $params = [
        ':id' => $id,
        ':booking_id' => $bookingId,
        ':gateway' => $gateway,
        ':transaction_id' => $transactionId,
        ':status' => $status
    ];
    
    if ($stmt->execute($params)) {
        // If success or confirmed, update booking status
        if ($status === 'success' || $status === 'confirmed') {
            $updateQuery = "UPDATE bookings SET status = 'confirmed' WHERE id = :booking_id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([':booking_id' => $bookingId]);
        }
        
        $db->commit();
        jsonData(['success' => true, 'paymentId' => $id]);
    } else {
        $db->rollBack();
        jsonError('Error al registrar pago', 500);
    }
} catch (PDOException $e) {
    $db->rollBack();
    error_log("Payment Create Error: " . $e->getMessage());
    jsonError('Error de base de datos', 500);
}
?>
