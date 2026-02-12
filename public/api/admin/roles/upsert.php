<?php
// public/api/admin/roles/upsert.php
require_once '../../config/database.php';
require_once '../../config/cors.php';
require_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['name'])) {
    jsonError('Datos incompletos', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $id = isset($data['id']) ? $data['id'] : null;
    $name = $data['name'];
    $description = isset($data['description']) ? $data['description'] : '';
    $permissions = json_encode(isset($data['permissions']) ? $data['permissions'] : []);

    if ($id) {
        // Update
        $query = "UPDATE roles SET name = :name, description = :description, permissions = :permissions, updated_at = NOW() WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
    } else {
        // Insert
        $id = bin2hex(random_bytes(16)); // Simple UUID version
        $query = "INSERT INTO roles (id, name, description, permissions, created_at, updated_at) VALUES (:id, :name, :description, :permissions, NOW(), NOW())";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
    }

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':permissions', $permissions);

    if ($stmt->execute()) {
        jsonData(['success' => true, 'id' => $id]);
    } else {
        jsonError('Error al guardar el rol');
    }

} catch (PDOException $e) {
    jsonError("Error en base de datos: " . $e->getMessage());
}
?>
