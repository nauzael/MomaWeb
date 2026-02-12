<?php
// public/api/auth/login.php

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/response.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    jsonError('Faltan credenciales', 400);
}

$email = $data->email;
$password = $data->password;

$database = new Database();
$db = $database->getConnection();

try {
    // Check if user exists
    $query = "SELECT id, name, email, password, role FROM User WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verify password
        if (password_verify($password, $row['password'])) {
            // Soporte para sesión vía header
            if (isset($_SERVER['HTTP_X_SESSION_ID'])) {
                session_id($_SERVER['HTTP_X_SESSION_ID']);
            }
            session_start();
            
            // Devolver el ID de sesión para que el frontend pueda guardarlo
            $session_id = session_id();
            
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['role'] = $row['role'];
            $_SESSION['name'] = $row['name'];
            $_SESSION['email'] = $row['email'];
            
            jsonData([
                'message' => 'Login exitoso',
                'session_id' => $session_id,
                'user' => [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'role' => $row['role']
                ]
            ]);

        } else {
            jsonError('Credenciales inválidas', 401);
        }
    } else {
        jsonError('Credenciales inválidas', 401);
    }
} catch (Exception $e) {
    error_log("Login Error: " . $e->getMessage());
    jsonError('Error en el servidor', 500);
}
?>
