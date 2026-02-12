<?php
// public/api/admin/roles/index.php
require_once '../../config/database.php';
require_once '../../config/cors.php';
require_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método no permitido', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM roles ORDER BY created_at ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $roles = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['permissions'] = json_decode($row['permissions'] ?? '[]');
        $roles[] = $row;
    }

    jsonData($roles);

} catch (PDOException $e) {
    jsonError("Error en base de datos: " . $e->getMessage());
}
?>
