<?php
// migrate_itinerary.php
require_once 'config/database.php';
require_once 'utils/auth_check.php';
checkAuth('admin');

$database = new Database();
$db = $database->getConnection();

try {
    $sql = "ALTER TABLE experiences ADD COLUMN itinerary JSON AFTER max_capacity";
    $db->exec($sql);
    echo "Successfully added 'itinerary' column to 'experiences' table.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column 'itinerary' already exists.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>
