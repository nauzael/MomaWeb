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

require_once __DIR__ . '/config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
$query = $input['query'] ?? '';
$params = $input['params'] ?? [];

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Query is required']);
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
    $database = new Database();
    $conn = $database->getConnection();

    if ($command === 'SELECT' || $command === 'SHOW' || $command === 'DESCRIBE') {
        if (!empty($params)) {
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $results = $stmt->fetchAll();
        } else {
            $results = $conn->query($query)->fetchAll();
        }
        echo json_encode(['success' => true, 'data' => $results]);
    } else {
        if (!empty($params)) {
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
        } else {
            $conn->exec($query);
        }
        echo json_encode(['success' => true, 'affected_rows' => $conn->rowCount()]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
