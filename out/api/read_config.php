<?php
// public/api/read_config.php
$configPath = 'config/database.php';
if (file_exists($configPath)) {
    $content = file_get_contents($configPath);
    // Mask password
    $content = preg_replace("/'password' => '.*'/", "'password' => '****'", $content);
    $content = preg_replace('/"password" => ".*"/', '"password" => "****"', $content);
    // Mask properties
    $content = preg_replace("/private \$password = \".*\";/", "private \$password = \"****\";", $content);
    echo "<pre>" . htmlspecialchars($content) . "</pre>";
} else {
    echo "File not found: $configPath";
}
echo "<br>Current working dir: " . getcwd();
?>
