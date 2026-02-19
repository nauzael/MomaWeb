<?php
// public/api/admin/users/create.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/auth_check.php';
require_once '../../utils/response.php';

checkAuth('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    jsonError('Email y contraseña son requeridos', 400);
}

$email = trim($data->email);
$password = $data->password;
$role_id = $data->role_id ?? 'editor';

$database = new Database();
$db = $database->getConnection();

try {
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(":email", $email);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        jsonError('El email ya está registrado', 400);
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    try {
        $query = "INSERT INTO users (id, name, email, password, role, created_at) VALUES (:id, :name, :email, :password, :role, NOW())";
        $stmt = $db->prepare($query);
        
        $userId = bin2hex(random_bytes(16));
        $name = explode('@', $email)[0];
        
        $stmt->bindParam(":id", $userId);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->bindParam(":role", $role_id);
        
        $stmt->execute();
    } catch (PDOException $e) {
        if ($e->getCode() == '42S22') {
            $alterQuery = "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'editor'";
            $db->exec($alterQuery);
            
            $query = "INSERT INTO users (id, name, email, password, role, created_at) VALUES (:id, :name, :email, :password, :role, NOW())";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":id", $userId);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $hashedPassword);
            $stmt->bindParam(":role", $role_id);
            
            $stmt->execute();
        } else {
            throw $e;
        }
    }

    jsonData([
        'success' => true,
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'role' => $role_id
        ],
        'message' => 'Usuario creado exitosamente'
    ]);

} catch (Exception $e) {
    error_log("Create User Error: " . $e->getMessage());
    jsonError('Error al crear usuario: ' . $e->getMessage(), 500);
}
?>
