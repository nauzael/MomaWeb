<?php
// public/api/blog/get.php
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $slug = isset($_GET['slug']) ? $_GET['slug'] : null;

    if (!$id && !$slug) {
        jsonError('ID o Slug requerido', 400);
    }

    $query = "SELECT p.*, c.name as category_name 
              FROM blog_posts p 
              LEFT JOIN blog_categories c ON p.category_id = c.id 
              WHERE ";
    
    if ($id) {
        $query .= "p.id = ?";
        $param = $id;
    } else {
        $query .= "p.slug = ?";
        $param = $slug;
    }

    $stmt = $db->prepare($query);
    $stmt->execute([$param]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Entrada no encontrada"]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "post" => $post
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
