<?php
// public/api/admin/bookings/update.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth_check.php';

// Verify Admin headers
checkAuth('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['bookingId'])) {
    jsonError('Falta ID de reserva', 400);
}

$id = $input['bookingId'];
// Allow updating status or other fields
$status = isset($input['status']) ? $input['status'] : null;

if (!$status) {
    jsonError('Nada para actualizar', 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "UPDATE bookings SET status = :status WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        jsonData(['success' => true, 'message' => 'Reserva actualizada']);
    } else {
        jsonError('Error al actualizar', 500);
    }
} catch (PDOException $e) {
    error_log("Booking Update Error: " . $e->getMessage());
    jsonError('Error de base de datos', 500);
}
?>
