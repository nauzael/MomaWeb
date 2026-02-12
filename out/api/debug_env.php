<?php
// public/api/debug_env.php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "Database Host: " . $db->query("SELECT @@hostname")->fetchColumn() . "\n";
echo "Current Database: " . $db->query("SELECT DATABASE()")->fetchColumn() . "\n";

$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "Tables found:\n";
foreach ($tables as $table) {
    $count = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    echo "- $table: $count records\n";
}
?>
