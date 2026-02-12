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

$id = isset($input['bookingId']) ? $input['bookingId'] : (isset($input['id']) ? $input['id'] : null);

if (!$id) {
    jsonError('Falta ID de reserva', 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    // Build dynamic update query
    $fields = [];
    $params = [':id' => $id];

    if (isset($input['status'])) {
        $fields[] = "status = :status";
        $params[':status'] = $input['status'];
    }
    if (isset($input['travel_date'])) {
        $fields[] = "travel_date = :travel_date";
        $params[':travel_date'] = $input['travel_date'];
    }
    if (isset($input['guests_count'])) {
        $fields[] = "guests_count = :guests_count";
        $params[':guests_count'] = (int)$input['guests_count'];
    }
    if (isset($input['total_amount'])) {
        $fields[] = "total_amount = :total_amount";
        $params[':total_amount'] = (float)$input['total_amount'];
    }

    if (empty($fields)) {
        jsonError('Nada para actualizar', 400);
    }

    $query = "UPDATE bookings SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute($params)) {
        jsonData(['success' => true, 'message' => 'Reserva actualizada']);
    } else {
        jsonError('Error al actualizar', 500);
    }
} catch (PDOException $e) {
    error_log("Booking Update Error: " . $e->getMessage());
    jsonError('Error de base de datos: ' . $e->getMessage(), 500);
}
?>
