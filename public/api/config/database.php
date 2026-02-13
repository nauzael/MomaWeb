<?php
// public/api/config/database.php

class Database {
    private $host = "localhost";
    private $db_name = "momaexcu_web";
    private $username = "momaexcu_admin";
    private $password = "u%!(IE[n8^AzMdYZ";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            // Add charset=utf8mb4 for full potential character support
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4", $this->username, $this->password);
            
            // Set error mode to exception for better debugging
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Set fetch mode to associative array by default
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } catch(PDOException $exception) {
            // Security: Return generic error for production, avoid leaking details
            http_response_code(500);
            echo json_encode([
                "error" => "Error de conexión con la base de datos."
            ]);
            exit;
        }

        return $this->conn;
    }
}
?>
