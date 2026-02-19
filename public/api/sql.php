<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$SECRET_KEY = 'moma_db_access_2024_secure_key';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (strpos($authHeader, $SECRET_KEY) === false) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$host = '191.108.96.191';
$db_name = 'momaexcu_web';
$username = 'momaexcu_admin';
$password = 'u%!(IE[n8^AzMdYZ';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["error" => "Connection error"]);
    exit;
}

$query = $_GET['q'] ?? $_POST['q'] ?? '';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Query is required. Use ?q=SELECT 1']);
    exit;
}

$allowed_commands = ['SELECT', 'SHOW', 'DESCRIBE', 'INSERT', 'UPDATE', 'DELETE'];
$command = strtoupper(strtok(trim($query), " \n\t"));

if (!in_array($command, $allowed_commands)) {
    http_response_code(403);
    echo json_encode(['error' => 'Command not allowed']);
    exit;
}

try {
    if ($command === 'SELECT' || $command === 'SHOW' || $command === 'DESCRIBE') {
        $results = $conn->query($query)->fetchAll();
        echo json_encode(['success' => true, 'data' => $results]);
    } else {
        $conn->exec($query);
        echo json_encode(['success' => true, 'affected_rows' => $conn->exec($query)]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
