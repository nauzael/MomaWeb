<?php
// public/super_admin.php

// MOMA SUPER ADMIN TOOL - EMERGENCY USE ONLY
// Place this file in your public/ folder.
// Access via: https://momaexcursiones.co/super_admin.php

// SECURITY - Basic Auth Check
// Only allow if user is authenticated as 'admin' in the PHP session
// OR if a special secret key is provided via query param ?key=moma_emergency_key
session_start();
$isAuthed = false;

if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
    $isAuthed = true;
}

if (isset($_GET['key']) && $_GET['key'] === 'moma_emergency_key') {
    $isAuthed = true;
    $_SESSION['role'] = 'admin'; // Force session for subsequent API calls if needed
}

if (!$isAuthed) {
    die("<h1>Acceso Denegado</h1><p>Debes ser administrador o tener la llave de emergencia.</p>");
}

require_once 'api/config/database.php';

$message = "";
$error = "";

// Handle Form Submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->getConnection();

    // 1. RAW SQL EXECUTION
    if (isset($_POST['sql_query']) && !empty($_POST['sql_query'])) {
        try {
            $sql = $_POST['sql_query'];
            
            // Allow multiple statements? Only if we split and execute individually or if config allows.
            // PDO query/exec usually handles single statement unless configured. Let's try simple prepare.
            
            if (stripos(trim($sql), 'SELECT') === 0 || stripos(trim($sql), 'SHOW') === 0) {
                $stmt = $db->query($sql);
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $message = "Consulta ejecutada. " . count($results) . " filas encontradas.";
                $queryResults = $results;
            } else {
                $stmt = $db->prepare($sql);
                $stmt->execute();
                $message = "Comando ejecutado. Filas afectadas: " . $stmt->rowCount();
            }
        } catch (PDOException $e) {
            $error = "Error SQL: " . $e->getMessage();
        }
    }

    // 2. RESET DATABASE
    if (isset($_POST['action']) && $_POST['action'] === 'reset_db') {
        // Run cleanup logic similar to master_cleanup.php but direct
        try {
            $db->exec("SET FOREIGN_KEY_CHECKS = 0");
            $tables = ['payments', 'bookings', 'experience_media', 'experiences', 'gallery_images']; // Order matters less with FK=0
            $log = [];

            foreach ($tables as $table) {
                try {
                    $db->exec("DELETE FROM $table");
                    try { $db->exec("ALTER TABLE $table AUTO_INCREMENT = 1"); } catch(Exception $e) {}
                    $log[] = "Cleared $table";
                } catch (Exception $e) {
                    $log[] = "Error $table: " . $e->getMessage();
                }
            }
            $db->exec("SET FOREIGN_KEY_CHECKS = 1");
            
            // Clear Files
            $baseUploads = __DIR__ . '/uploads';
            $dirs = [$baseUploads, $baseUploads.'/gallery', $baseUploads.'/experiences'];
            foreach ($dirs as $dir) {
                if (is_dir($dir)) {
                    $files = glob($dir . '/*');
                    foreach ($files as $file) {
                        if (is_file($file) && basename($file)!=='.htaccess' && basename($file)!=='index.html') {
                            unlink($file);
                        }
                    }
                    $log[] = "Cleaned directory: $dir";
                }
            }

            $message = "Reseteo Completo Exitoso:<br>" . implode("<br>", $log);

        } catch (Exception $e) {
            $error = "Error Fatal en Reset: " . $e->getMessage();
        }
    }
}

// GET DIAGNOSTICS for View
try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check constraints
    // $db->query("SELECT * FROM information_schema.table_constraints WHERE constraint_schema = '...'");

    // Check Tables
    $tablesStmt = $db->query("SHOW TABLES");
    $dbTables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

} catch (Exception $e) {
    $dbError = $e->getMessage();
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moma Super Admin Tool</title>
    <style>
        body { font-family: -apple-system, sans-serif; background: #1c1917; color: #e7e5e4; padding: 20px; max-width: 1000px; mx-auto; }
        h1, h2 { color: #fff; }
        .card { background: #292524; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #44403c; }
        .btn { padding: 10px 20px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
        .btn-green { background: #22c55e; color: #000; }
        .btn-red { background: #ef4444; color: #fff; }
        textarea { width: 100%; height: 150px; background: #000; color: #0f0; font-family: monospace; border: 1px solid #444; padding: 10px; margin-bottom: 10px; }
        pre { background: #000; padding: 10px; overflow-x: auto; border-radius: 4px; }
        .msg { padding: 10px; border-radius: 4px; margin-bottom: 20px; }
        .success { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
        .error { background: #450a0a; color: #fca5a5; border: 1px solid #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #444; }
        th { background: #333; }
    </style>
</head>
<body>

    <h1>🛠️ Moma Force Admin Tool</h1>
    <p>Use esta herramienta si el dashboard normal falla. <strong style="color: #ef4444;">USAR CON PRECAUCIÓN.</strong></p>

    <?php if ($message): ?>
        <div class="msg success"><?php echo $message; ?></div>
    <?php endif; ?>
    
    <?php if ($error): ?>
        <div class="msg error"><?php echo $error; ?></div>
    <?php endif; ?>

    <!-- DIAGNOSTICS -->
    <div class="card">
        <h2>📊 Diagnóstico Rápido</h2>
        <p><strong>DB Status:</strong> <?php echo isset($dbTables) ? "Conectado. Tablas encontradas: " . count($dbTables) : "Error de Conexión: " . $dbError; ?></p>
        <?php if (isset($dbTables)): ?>
            <div style="font-size: 0.8em; color: #aaa;">Tablas: <?php echo implode(", ", $dbTables); ?></div>
        <?php endif; ?>
    </div>

    <!-- RAW SQL -->
    <div class="card">
        <h2>💻 Ejecutar SQL (Fuerza Bruta)</h2>
        <form method="POST">
            <textarea name="sql_query" placeholder="Ej: DELETE FROM experiences WHERE id='abc-123'"><?php echo isset($_POST['sql_query']) ? htmlspecialchars($_POST['sql_query']) : ''; ?></textarea>
            <button type="submit" class="btn btn-green">Ejecutar SQL</button>
        </form>

        <?php if (isset($queryResults)): ?>
            <h3>Resultados:</h3>
            <div style="overflow-x:auto;">
                <table>
                    <thead>
                        <tr>
                            <?php if (!empty($queryResults)) foreach (array_keys($queryResults[0]) as $header): ?>
                                <th><?php echo htmlspecialchars($header); ?></th>
                            <?php endforeach; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($queryResults as $row): ?>
                            <tr>
                                <?php foreach ($row as $cell): ?>
                                    <td><?php echo htmlspecialchars(print_r($cell, true)); ?></td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>

    <!-- DANGER ZONE -->
    <div class="card" style="border-color: #ef4444;">
        <h2 style="color: #ef4444;">☢️ Zona Nuclear</h2>
        <p>Si nada más funciona, usa esto para purgar absolutamente todo.</p>
        <form method="POST" onsubmit="return confirm('¿ESTÁS 100% SEGURO? ESTO BORRARÁ TODO Y NO SE PUEDE DESHACER.');">
            <input type="hidden" name="action" value="reset_db">
            <button type="submit" class="btn btn-red">💣 RESETEAR BASE DE DATOS Y ARCHIVOS</button>
        </form>
    </div>

</body>
</html>
