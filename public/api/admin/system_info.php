<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Keep it JSON friendly

// Load configuration and utilities
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

/**
 * Moma Nature - System Info & Deployment API
 */

$deployPath = '/home/momaexcu/public_html';

try {
    $action = $_GET['action'] ?? 'info';

    // Helper for recursive copy without exec()
    function phpRecursiveCopy($src, $dst) {
        if (!is_dir($src)) return false;
        if (!is_dir($dst)) @mkdir($dst, 0755, true);
        $dir = opendir($src);
        $count = 0;
        while(false !== ( $file = readdir($dir)) ) {
            if (( $file != '.' ) && ( $file != '..' )) {
                if ( is_dir($src . '/' . $file) ) {
                    $count += phpRecursiveCopy($src . '/' . $file, $dst . '/' . $file);
                } else {
                    if (@copy($src . '/' . $file, $dst . '/' . $file)) {
                        $count++;
                    }
                }
            }
        }
        closedir($dir);
        return $count;
    }

    // 1. Manual Deployment Action
    if ($action === 'deploy') {
        $filesCopied = 0;
        
        // Potential roots:
        // 1. One level above public_html (typical for private folder uploads)
        // 2. Same level as public_html
        $currentPath = realpath(__DIR__);
        $possiblePaths = [
            realpath(__DIR__ . '/../../../out'),          // Assumes project root is parent of public/api
            realpath(__DIR__ . '/../../../../out'),       // Assumes project is sibling of public_html
            realpath('/home/momaexcu/moma-web/out'),      // Fixed path if known
            realpath('/home/momaexcu/out')                // Another common spot
        ];

        $srcStatic = null;
        foreach ($possiblePaths as $p) {
            if ($p && is_dir($p) && file_exists($p . '/index.html')) {
                $srcStatic = $p;
                break;
            }
        }

        $debug = [
            'tried_paths' => $possiblePaths,
            'found_src' => $srcStatic,
            'current_script_dir' => __DIR__
        ];
        
        if ($srcStatic) {
            $filesCopied += phpRecursiveCopy($srcStatic, $deployPath);
            
            // Also copy API folder if found nearby
            $srcApi = $srcStatic . '/../public/api';
            if (is_dir($srcApi)) {
                $filesCopied += phpRecursiveCopy($srcApi, $deployPath . '/api');
            }
        }

        echo json_encode([
            'success' => $filesCopied > 0,
            'message' => $filesCopied > 0 
                ? "Sincronización exitosa: $filesCopied archivos actualizados." 
                : "No se encontraron archivos para sincronizar. Asegúrate de que la carpeta 'out' (del build) esté subida al servidor.",
            'details' => [
                'files_count' => $filesCopied,
                'target' => $deployPath,
                'debug_info' => $debug
            ]
        ]);
        exit;
    }
    // 2. Git Information
    $git_info = [
        'hash' => 'No disponible',
        'author' => 'System',
        'date_relative' => 'Desconocido',
        'date_full' => date('Y-m-d H:i:s'),
        'subject' => 'Información no sincronizada'
    ];

    $staticInfoPath = __DIR__ . '/git_info.json';
    $hasStatic = file_exists($staticInfoPath);

    // Try exec() first if available
    if (function_exists('exec')) {
        $commit_format = '%H|%an|%ar|%ad|%s';
        @exec('git log -1 --format="' . $commit_format . '" 2>&1', $output, $return_var);
        
        if ($return_var === 0 && !empty($output)) {
            $parts = explode('|', $output[0]);
            if (count($parts) >= 5) {
                $git_info = [
                    'hash' => $parts[0],
                    'author' => $parts[1],
                    'date_relative' => $parts[2],
                    'date_full' => $parts[3],
                    'subject' => $parts[4]
                ];
            }
        } elseif ($hasStatic) {
            // Fallback to static JSON if exec fails (e.g. no .git folder or git command)
            $staticData = json_decode(file_get_contents($staticInfoPath), true);
            if ($staticData) $git_info = $staticData;
        }
    } elseif ($hasStatic) {
        // exec is disabled, use static JSON
        $staticData = json_decode(file_get_contents($staticInfoPath), true);
        if ($staticData) $git_info = $staticData;
    }

    // 3. Deployment Status
    $is_deployed = @file_exists($deployPath);
    $last_deploy_time = $is_deployed ? @date("Y-m-d H:i:s", @filemtime($deployPath)) : 'Nunca';

    echo json_encode([
        'success' => true,
        'git' => $git_info,
        'server' => [
            'php_version' => PHP_VERSION,
            'server_time' => date('Y-m-d H:i:s'),
            'os' => PHP_OS,
            'deploy_path' => $deployPath,
            'is_deployed' => $is_deployed,
            'last_deploy' => $last_deploy_time ?: 'Desconocido'
        ]
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(200); // Return 200 even on catch but with success=false to avoid "Failed to fetch" browser alerts
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
}
