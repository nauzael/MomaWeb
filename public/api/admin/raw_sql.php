<?php
// public/api/admin/raw_sql.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth_check.php';

// Check session (Admin Only for such a dangerous tool)
checkAuth('admin');

$input = json_decode(file_get_contents("php://input"), true);
$sql = isset($input['sql']) ? $input['sql'] : null;

if (!$sql) {
    jsonError('No se proporcionó SQL', 400);
}

// Basic protection against obviously bad commands if desired, but user wants "control total"
// We will block DROPPING the 'users' table or critical structure unless forced, but let's just allow it for now.
// Risk: High. But requested.

$database = new Database();
$db = $database->getConnection();

try {
    // Determine if query is SELECT or specific modification
    $isSelect = stripos(trim($sql), 'SELECT') === 0 || stripos(trim($sql), 'SHOW') === 0 || stripos(trim($sql), 'DESCRIBE') === 0;

    if ($isSelect) {
        $stmt = $db->query($sql);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonData([
            'success' => true,
            'type' => 'read',
            'rows' => count($results),
            'data' => $results
        ]);
    } else {
        $stmt = $db->prepare($sql);
        $result = $stmt->execute();
        jsonData([
            'success' => true,
            'type' => 'write',
            'affected_rows' => $stmt->rowCount(),
            'message' => 'Query executed successfully'
        ]);
    }

} catch (PDOException $e) {
    error_log("Raw SQL Error: " . $e->getMessage());
    jsonError('Error SQL: ' . $e->getMessage(), 500);
}
?>
