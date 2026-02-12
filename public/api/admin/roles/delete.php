<?php
// public/api/admin/roles/delete.php
require_once '../../config/database.php';
require_once '../../config/cors.php';
require_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    jsonError('ID de rol requerido', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "DELETE FROM roles WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);

    if ($stmt->execute()) {
        jsonData(['success' => true]);
    } else {
        jsonError('Error al eliminar el rol');
    }

} catch (PDOException $e) {
    jsonError("Error en base de datos: " . $e->getMessage());
}
?>
