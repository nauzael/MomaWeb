<?php
// public/api/blog/create.php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/auth_check.php';

checkAuth('admin');

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || !isset($data->title) || !isset($data->content)) {
        jsonError('Título y contenido son requeridos');
    }

    // Generate slug if not provided
    $slug = isset($data->slug) && !empty($data->slug) ? $data->slug : slugify($data->title);
    
    // Check if slug exists, if so append random string
    $check_stmt = $db->prepare("SELECT COUNT(*) FROM blog_posts WHERE slug = ?");
    $check_stmt->execute([$slug]);
    if ($check_stmt->fetchColumn() > 0) {
        $slug .= '-' . substr(md5(time()), 0, 5);
    }

    $query = "INSERT INTO blog_posts 
              (title, slug, content, excerpt, cover_image, category_id, status, author_name) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        $data->title,
        $slug,
        $data->content,
        isset($data->excerpt) ? $data->excerpt : null,
        isset($data->cover_image) ? $data->cover_image : null,
        isset($data->category_id) ? $data->category_id : null,
        isset($data->status) ? $data->status : 'draft',
        isset($data->author_name) ? $data->author_name : 'Moma Excursiones'
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Entrada de blog creada",
        "id" => $db->lastInsertId()
    ]);

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
