<?php
// public/api/admin/fix_bookings_table.php
require_once 'config/database.php';
require_once 'utils/auth_check.php';
checkAuth('admin');

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Check if user_id exist, if not add it
    try {
        $db->exec("ALTER TABLE bookings ADD COLUMN user_id VARCHAR(255) AFTER experience_id");
        echo "Successfully added 'user_id' column to 'bookings' table.<br>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "Column 'user_id' already exists.<br>";
        } else {
            throw $e;
        }
    }

    // 2. Check if customer_phone is needed? 
    // The create.php uses customer_name . '|' . customer_phone currently.
    
    echo "Done.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
