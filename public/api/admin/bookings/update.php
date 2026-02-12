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

$input_raw = file_get_contents("php://input");
$input = json_decode($input_raw, true);

error_log("Booking Update Request Received. Raw input: " . $input_raw);

$id = isset($input['bookingId']) ? $input['bookingId'] : (isset($input['id']) ? $input['id'] : null);

if (!$id) {
    error_log("Booking Update Error: Missing ID. Input: " . print_r($input, true));
    jsonError('Falta ID de reserva', 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    // Build dynamic update query
    $fields = [];
    $params = [':id' => $id];

    if (isset($input['status'])) {
        $fields[] = "`status` = :status";
        $params[':status'] = $input['status'];
    }
    if (isset($input['travel_date'])) {
        $fields[] = "`travel_date` = :travel_date";
        $params[':travel_date'] = $input['travel_date'];
    }
    if (isset($input['guests_count'])) {
        $fields[] = "`guests_count` = :guests_count";
        $params[':guests_count'] = (int)$input['guests_count'];
    }
    if (isset($input['total_amount'])) {
        $fields[] = "`total_amount` = :total_amount";
        $params[':total_amount'] = (float)$input['total_amount'];
    }

    if (empty($fields)) {
        error_log("Booking Update Error: Nothing to update for ID: $id");
        jsonError('Nada para actualizar', 400);
    }

    $query = "UPDATE `bookings` SET " . implode(', ', $fields) . " WHERE `id` = :id";
    error_log("Executing Query: $query with params: " . print_r($params, true));
    
    $stmt = $db->prepare($query);
    
    if ($stmt->execute($params)) {
        $rowCount = $stmt->rowCount();
        error_log("Booking Update Success. Rows affected: $rowCount");
        jsonData(['success' => true, 'message' => 'Reserva actualizada', 'rowsAffected' => $rowCount]);
    } else {
        $errorInfo = $stmt->errorInfo();
        error_log("Booking Update Failed. SQL Error: " . print_r($errorInfo, true));
        jsonError('Error al actualizar: ' . ($errorInfo[2] ?? 'Error desconocido') . " (Query: $query)", 500);
    }
} catch (PDOException $e) {
    error_log("Booking Update PDO Exception: " . $e->getMessage());
    jsonError('Error de base de datos: ' . $e->getMessage() . " (Query: $query)", 500);
} catch (Exception $e) {
    error_log("Booking Update General Exception: " . $e->getMessage());
    jsonError('Error interno: ' . $e->getMessage(), 500);
}
?>
