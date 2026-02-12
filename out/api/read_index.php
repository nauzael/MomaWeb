<?php
// public/api/read_index.php
$path = 'gallery/index.php';
if (file_exists($path)) {
    echo "<pre>" . htmlspecialchars(file_get_contents($path)) . "</pre>";
} else {
    echo "File not found: $path";
}
?>
