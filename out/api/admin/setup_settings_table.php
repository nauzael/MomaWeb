<?php
// public/api/admin/setup_settings_table.php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    echo "<h2>Configurando tablas de sistema...</h2>";

    // Create system_settings table
    $sql = "CREATE TABLE IF NOT EXISTS system_settings (
        `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
        `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo "Tabla 'system_settings' verificada/creada correctamente.<br>";

    // Verify if it works
    $test = $db->query("SELECT count(*) FROM system_settings");
    if ($test) {
        echo "<strong style='color:green'>¡Éxito! La base de datos está lista para guardar configuraciones.</strong>";
    }

} catch (PDOException $e) {
    echo "<strong style='color:red'>Error:</strong> " . $e->getMessage();
}
?>
