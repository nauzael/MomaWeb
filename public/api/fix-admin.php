<?php
// public/api/fix-admin.php
// Script to fix/create admin user in the correct database table

require_once 'config/cors.php';
require_once 'config/database.php';
require_once 'utils/response.php'; // Optional, but good for JSON response helpers

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$email = 'admin@moma.com';
$password = 'Matrix17';
$hashed_password = password_hash($password, PASSWORD_BCRYPT);

try {
    // 1. Check if 'User' table exists and use it (Prisma standard)
    $table = 'User';
    
    // Simple check Query
    $check_table = $db->query("SHOW TABLES LIKE '$table'");
    if ($check_table->rowCount() == 0) {
        $table = 'users'; // Fallback to 'users' if 'User' doesn't exist
        $check_table_fallback = $db->query("SHOW TABLES LIKE '$table'");
        if ($check_table_fallback->rowCount() == 0) {
            echo json_encode(['error' => 'No User table found (checked User and users)']);
            exit;
        }
    }

    // 2. Check if user exists
    $query = "SELECT id FROM $table WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        // User exists, update password
        $update_query = "UPDATE $table SET password = :password, role = 'admin' WHERE email = :email";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(":password", $hashed_password);
        $update_stmt->bindParam(":email", $email);
        $update_stmt->execute();
        
        echo json_encode([
            'status' => 'success',
            'message' => "User $email updated in table '$table'. Password reset to '$password'.",
            'table' => $table
        ]);
    } else {
        // User does not exist, insert
        $id = bin2hex(random_bytes(16)); // Generate UUID v4 approximation or random string
        
        // Try to insert with createdAt/updatedAt if columns exist, otherwise fallback
        // We'll inspect columns first for safety, or just try-catch
        
        try {
            // Attempt with standard timestamps
            $insert_query = "INSERT INTO $table (id, name, email, password, role, createdAt, updatedAt) VALUES (:id, 'Admin User', :email, :password, 'admin', NOW(), NOW())";
            $insert_stmt = $db->prepare($insert_query);
            $insert_stmt->bindParam(":id", $id);
            $insert_stmt->bindParam(":email", $email);
            $insert_stmt->bindParam(":password", $hashed_password);
            
            $insert_stmt->execute();
            
            echo json_encode([
                'status' => 'success',
                'message' => "User $email created in table '$table'.",
                'table' => $table,
                'id' => $id
            ]);
            
        } catch (PDOException $e) {
            // If failed (maybe columns don't exist), try minimal insert
             $insert_query = "INSERT INTO $table (id, name, email, password, role) VALUES (:id, 'Admin User', :email, :password, 'admin')";
             $insert_stmt = $db->prepare($insert_query);
             $insert_stmt->bindParam(":id", $id);
             $insert_stmt->bindParam(":email", $email);
             $insert_stmt->bindParam(":password", $hashed_password);
             
             $insert_stmt->execute();
             
             echo json_encode([
                'status' => 'success',
                'message' => "User $email created in table '$table' (minimal fields).",
                'table' => $table,
                'id' => $id
            ]);
        }
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
