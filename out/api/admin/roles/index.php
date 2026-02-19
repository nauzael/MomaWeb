<?php
// public/api/admin/roles/index.php
require_once '../../config/database.php';
require_once '../../config/cors.php';
require_once '../../utils/auth_check.php';
require_once '../../utils/response.php';

checkAuth('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método no permitido', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM roles ORDER BY created_at ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $roles = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['permissions'] = json_decode($row['permissions'] ?? '[]');
        $roles[] = $row;
    }

    if (empty($roles)) {
        $insertQuery = "INSERT INTO roles (id, name, description, permissions, created_at) VALUES 
            ('admin', 'Administrador', 'Acceso completo al sistema', '[\"dashboard\",\"bookings\",\"experiences\",\"customers\",\"reports\",\"settings\",\"blog\"]', NOW()),
            ('editor', 'Editor', 'Puede crear y editar contenido', '[\"dashboard\",\"blog\",\"experiences\"]', NOW()),
            ('viewer', 'Visor', 'Solo puede ver información', '[\"dashboard\"]', NOW())";
        $db->exec($insertQuery);
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['permissions'] = json_decode($row['permissions'] ?? '[]');
            $roles[] = $row;
        }
    }

    jsonData($roles);

} catch (PDOException $e) {
    if ($e->getCode() == '42S02') {
        $createTable = "CREATE TABLE IF NOT EXISTS roles (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            permissions JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $db->exec($createTable);
        
        $insertQuery = "INSERT INTO roles (id, name, description, permissions, created_at) VALUES 
            ('admin', 'Administrador', 'Acceso completo al sistema', '[\"dashboard\",\"bookings\",\"experiences\",\"customers\",\"reports\",\"settings\",\"blog\"]', NOW()),
            ('editor', 'Editor', 'Puede crear y editar contenido', '[\"dashboard\",\"blog\",\"experiences\"]', NOW()),
            ('viewer', 'Visor', 'Solo puede ver información', '[\"dashboard\"]', NOW())";
        $db->exec($insertQuery);
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $roles = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['permissions'] = json_decode($row['permissions'] ?? '[]');
            $roles[] = $row;
        }
        
        jsonData($roles);
    } else {
        jsonError("Error en base de datos: " . $e->getMessage());
    }
}
?>
