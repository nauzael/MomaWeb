<?php
// public/api/admin/experiences/delete.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth_check.php';

// Verify Admin headers
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

// Check session
checkAuth('admin');

$input = json_decode(file_get_contents("php://input"), true);
$identifier = isset($input['slug']) ? $input['slug'] : (isset($input['id']) ? $input['id'] : null);

if (!$identifier) {
    jsonError('Falta el identificador (slug o id)', 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Get the ID if slug was provided
    $queryFetch = "SELECT id FROM experiences WHERE slug = :id OR id = :id";
    $stmtFetch = $db->prepare($queryFetch);
    $stmtFetch->bindParam(":id", $identifier);
    $stmtFetch->execute();
    $exp = $stmtFetch->fetch(PDO::FETCH_ASSOC);

    if (!$exp) {
        jsonError('Experiencia no encontrada', 404);
        exit;
    }

    $experienceId = $exp['id'];

    // 2. Delete related records (FK Constraints)
    // Delete bookings
    $stmtDelBookings = $db->prepare("DELETE FROM bookings WHERE experience_id = :id");
    $stmtDelBookings->bindParam(":id", $experienceId);
    $stmtDelBookings->execute();

    // Delete media
    $stmtDelMedia = $db->prepare("DELETE FROM experience_media WHERE experience_id = :id");
    $stmtDelMedia->bindParam(":id", $experienceId);
    $stmtDelMedia->execute();

    // 3. Delete the experience
    $query = "DELETE FROM experiences WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $experienceId);
    
    if ($stmt->execute()) {
        jsonData(['message' => 'Experiencia y registros relacionados eliminados correctamente']);
    } else {
        jsonError('Error al eliminar la experiencia', 500);
    }

} catch (PDOException $e) {
    error_log("Delete Error: " . $e->getMessage());
    jsonError('Error de base de datos: ' . $e->getMessage(), 500);
}
?>
