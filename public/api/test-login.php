<?php
header('Content-Type: application/json');

require_once 'config/database.php';

$email = 'admin@moma.com';
$password = 'Matrix17';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, name, email, password, role FROM User WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'user_found' => $stmt->rowCount() > 0,
        'user_data' => $row,
        'password_match' => $row ? password_verify($password, $row['password']) : false,
        'hash_in_db' => $row['password'] ?? 'NO USER'
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
