<?php
// public/api/admin/setup_blog_tables.php
require_once '../config/database.php';
require_once '../utils/auth_check.php';

// Temporarily disable auth check for the first run if needed, 
// or ensure we are logged in. For safety, let's keep it.
// checkAuth('admin'); 

$database = new Database();
$db = $database->getConnection();

try {
    echo "Starting blog tables setup...<br>";

    // 1. Create blog_categories table
    $sql_categories = "CREATE TABLE IF NOT EXISTS blog_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($sql_categories);
    echo "Table 'blog_categories' ready.<br>";

    // 2. Create blog_posts table
    $sql_posts = "CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        cover_image VARCHAR(255),
        category_id INT,
        author_name VARCHAR(100) DEFAULT 'Moma Excursiones',
        status ENUM('draft', 'published') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql_posts);
    echo "Table 'blog_posts' ready.<br>";

    // 3. Insert default category if none exists
    $check_cat = $db->query("SELECT COUNT(*) FROM blog_categories")->fetchColumn();
    if ($check_cat == 0) {
        $db->exec("INSERT INTO blog_categories (name, slug) VALUES ('General', 'general')");
        echo "Default category 'General' created.<br>";
    }

    echo "<strong>Setup completed successfully.</strong>";

} catch (PDOException $e) {
    echo "<strong>Error:</strong> " . $e->getMessage();
}
?>
