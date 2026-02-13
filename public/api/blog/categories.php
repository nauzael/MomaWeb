<?php
// public/api/blog/categories.php
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM blog_categories ORDER BY name ASC");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "categories" => $categories]);
        exit;
    }

    // Following methods require admin
    require_once '../utils/auth_check.php';
    checkAuth('admin');

    $data = json_decode(file_get_contents("php://input"));

    if ($method === 'POST') {
        if (!$data || !isset($data->name)) jsonError('Nombre es requerido');
        $slug = isset($data->slug) ? $data->slug : slugify($data->name);
        
        $stmt = $db->prepare("INSERT INTO blog_categories (name, slug) VALUES (?, ?)");
        $stmt->execute([$data->name, $slug]);
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);

    } elseif ($method === 'PUT') {
        if (!$data || !isset($data->id) || !isset($data->name)) jsonError('ID y nombre son requeridos');
        $slug = isset($data->slug) ? $data->slug : slugify($data->name);

        $stmt = $db->prepare("UPDATE blog_categories SET name = ?, slug = ? WHERE id = ?");
        $stmt->execute([$data->name, $slug, $data->id]);
        echo json_encode(["success" => true]);

    } elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? $_GET['id'] : (isset($data->id) ? $data->id : null);
        if (!$id) jsonError('ID es requerido');

        $stmt = $db->prepare("DELETE FROM blog_categories WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'n-a' : $text;
}

function jsonError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(["success" => false, "error" => $message]);
    exit;
}
?>
