<?php
require_once '../../config/database.php';
require_once '../../utils/response.php';

$database = new Database();
$db = $database->getConnection();

try {
    $tables = [];
    $stmt = $db->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    
    $schema = [];
    foreach ($tables as $table) {
        $columns = [];
        $stmt = $db->query("DESCRIBE `$table`");
        while ($col = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = $col['Field'];
        }
        $schema[$table] = $columns;
    }
    
    jsonData(['tables' => $tables, 'schema' => $schema]);
} catch (Exception $e) {
    jsonError($e->getMessage(), 500);
}
?>
