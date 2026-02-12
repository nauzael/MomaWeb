<?php
require_once 'config/database.php';
require_once 'utils/response.php';
$database = new Database();
$db = $database->getConnection();
try {
    $stmt = $db->query("DESCRIBE bookings");
    $schema = $stmt->fetchAll(PDO::FETCH_ASSOC);
    jsonData($schema);
} catch (Exception $e) {
    jsonError($e->getMessage());
}
?>
