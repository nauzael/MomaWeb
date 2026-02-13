<?php
// public/api/blog/delete.php
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/database.php';
require_once '../utils/auth_check.php';

checkAuth('admin');

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || !isset($data->id)) {
        jsonError('ID es requerido');
    }

    $id = $data->id;
    
    // Check if post exists
    $check = $db->prepare("SELECT id FROM blog_posts WHERE id = ?");
    $check->execute([$id]);
    if (!$check->fetch()) {
        jsonError('Entrada no encontrada', 404);
    }

    $stmt = $db->prepare("DELETE FROM blog_posts WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode([
        "success" => true,
        "message" => "Entrada de blog eliminada"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

function jsonError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(["success" => false, "error" => $message]);
    exit;
}
?>
