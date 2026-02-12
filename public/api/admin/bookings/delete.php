<?php
// public/api/admin/bookings/delete.php

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

if (!isset($input['id'])) {
    jsonError('Falta ID de reserva', 400);
}

$id = $input['id'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "DELETE FROM bookings WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        jsonData(['success' => true, 'message' => 'Reserva eliminada']);
    } else {
        jsonError('Error al eliminar', 500);
    }
} catch (PDOException $e) {
    error_log("Booking Delete Error: " . $e->getMessage());
    jsonError('Error de base de datos', 500);
}
?>
