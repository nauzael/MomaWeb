<?php
// public/api/blog/update.php
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

    $fields = [];
    $values = [];

    if (isset($data->title)) {
        $fields[] = "title = ?";
        $values[] = $data->title;
        
        // Update slug only if provided or if title changed significantly? 
        // Better to let admin set slug if they want to.
    }

    if (isset($data->slug)) {
        $fields[] = "slug = ?";
        $values[] = $data->slug;
    }

    if (isset($data->content)) {
        $fields[] = "content = ?";
        $values[] = $data->content;
    }

    if (isset($data->excerpt)) {
        $fields[] = "excerpt = ?";
        $values[] = $data->excerpt;
    }

    if (isset($data->cover_image)) {
        $fields[] = "cover_image = ?";
        $values[] = $data->cover_image;
    }

    if (isset($data->category_id)) {
        $fields[] = "category_id = ?";
        $values[] = $data->category_id;
    }

    if (isset($data->status)) {
        $fields[] = "status = ?";
        $values[] = $data->status;
    }

    if (isset($data->author_name)) {
        $fields[] = "author_name = ?";
        $values[] = $data->author_name;
    }

    if (empty($fields)) {
        jsonError('No hay campos para actualizar');
    }

    $query = "UPDATE blog_posts SET " . implode(", ", $fields) . " WHERE id = ?";
    $values[] = $id;

    $stmt = $db->prepare($query);
    $stmt->execute($values);

    echo json_encode([
        "success" => true,
        "message" => "Entrada de blog actualizada"
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
