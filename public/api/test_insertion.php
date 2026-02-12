<?php
// public/api/test_insertion.php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

echo "Inserting test image...\n";
$db->exec("INSERT INTO gallery_images (url) VALUES ('test-image-".time().".jpg')");

$count = $db->query("SELECT COUNT(*) FROM gallery_images")->fetchColumn();
echo "New count: $count\n";

$images = $db->query("SELECT * FROM gallery_images ORDER BY id DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
print_r($images);
?>
