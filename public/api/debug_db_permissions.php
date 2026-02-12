<?php
// public/api/debug_db_permissions.php

header('Content-Type: application/json');
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $report = [];
    $report['connection'] = 'OK';
    
    // Check Current User
    $stmt = $db->query("SELECT CURRENT_USER(), DATABASE()");
    $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    $report['user_info'] = $userInfo;

    // Check Permissions (GRANTS)
    // Note: This might fail if user doesn't have access to see grants
    try {
        $stmt = $db->query("SHOW GRANTS FOR CURRENT_USER()");
        $report['grants'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (Exception $e) {
        $report['grants'] = "Could not fetch grants: " . $e->getMessage();
    }

    // List Tables
    try {
        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $report['tables'] = $tables;

        // Try simple operations on each table to verify R/W
        $tableStatus = [];
        foreach ($tables as $table) {
            $status = ['read' => false, 'write' => false, 'delete' => false];
            
            // Check Read
            try {
                $db->query("SELECT 1 FROM $table LIMIT 1");
                $status['read'] = true;
            } catch (Exception $e) {}

            // Check Write (Insert then Rollback transaction if possible, or Insert and Delete)
            // Ideally we don't want to pollute DB. We can check information_schema but that's complex.
            // We'll skip actual write test to avoid garbage, but assume if Grants show INSERT/DELETE it's fine.
            
            $tableStatus[$table] = $status;
        }
        $report['table_status'] = $tableStatus;

    } catch (Exception $e) {
        $report['tables_error'] = $e->getMessage();
    }

    echo json_encode(['success' => true, 'report' => $report], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => "Connection Failed: " . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
