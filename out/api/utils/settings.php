<?php
// public/api/utils/settings.php
require_once __DIR__ . '/../config/database.php';

function getSetting($key) {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT value FROM system_settings WHERE `key` = :key LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":key", $key);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row['value'];
        }
        return null;
    } catch (Exception $e) {
        // En producción, silenciar o loguear
        error_log("Error getting setting $key: " . $e->getMessage());
        return null;
    }
}

function setSetting($key, $value, $description = null) {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // MySQL ON DUPLICATE KEY UPDATE syntax (standard for upsert)
        $query = "INSERT INTO system_settings (`key`, `value`, `description`, `updated_at`) 
                  VALUES (:key, :value, :description, NOW()) 
                  ON DUPLICATE KEY UPDATE `value` = :value_u, `description` = :description_u, `updated_at` = NOW()";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":key", $key);
        $stmt->bindParam(":value", $value);
        $stmt->bindParam(":description", $description);
        
        // Bind parameters for update part
        $stmt->bindParam(":value_u", $value);
        $stmt->bindParam(":description_u", $description);
        
        return $stmt->execute();
        
    } catch (Exception $e) {
        error_log("Error setting setting $key: " . $e->getMessage());
        return false;
    }
}
?>
