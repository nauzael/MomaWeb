<?php
// public/api/blog/list.php
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : 'published'; // Default to published for public view
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $query = "SELECT p.*, c.name as category_name 
              FROM blog_posts p 
              LEFT JOIN blog_categories c ON p.category_id = c.id 
              WHERE 1=1";
    
    $params = [];

    if ($status !== 'all') {
        $query .= " AND p.status = ?";
        $params[] = $status;
    }

    if ($category) {
        $query .= " AND (c.slug = ? OR c.id = ?)";
        $params[] = $category;
        $params[] = $category;
    }

    $query .= " ORDER BY p.created_at DESC LIMIT $limit OFFSET $offset";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count for pagination
    $count_query = "SELECT COUNT(*) FROM blog_posts p ";
    if ($category) {
        $count_query .= " LEFT JOIN blog_categories c ON p.category_id = c.id WHERE (c.slug = ? OR c.id = ?)";
    }
    
    $stmt_count = $db->prepare($count_query);
    if ($category) {
        $stmt_count->execute([$category, $category]);
    } else {
        $stmt_count->execute();
    }
    $total = $stmt_count->fetchColumn();

    echo json_encode([
        "success" => true,
        "posts" => $posts,
        "total" => (int)$total,
        "limit" => $limit,
        "offset" => $offset
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
