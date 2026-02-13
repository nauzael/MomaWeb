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

    // 1. Git & Deployment Actions
    if ($action === 'update' || $action === 'pull') {
        // Attempt git pull if enabled, otherwise explain
        if (function_exists('exec')) {
            @exec('git pull origin main 2>&1', $out, $ret);
            echo json_encode([
                'success' => $ret === 0,
                'message' => $ret === 0 ? 'Actualización desde remoto exitosa.' : 'Error al actualizar: ' . implode("\n", $out),
                'details' => $out
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'El hosting no permite ejecutar "git pull" directamente vía PHP. Por favor, usa el despliegue automático de GitHub o cPanel.',
            ]);
        }
        exit;
    }

    if ($action === 'deploy' || $action === 'deploy-head') {
        $filesCopied = 0;
        $currentPath = realpath(__DIR__);
        
        // Search for 'out' folder (build result)
        $possiblePaths = [
            realpath(__DIR__ . '/../../../out'),
            realpath(__DIR__ . '/../../../../out'),
            realpath('/home/momaexcu/out'),
            realpath('/home/momaexcu/moma-web/out')
        ];

        $srcStatic = null;
        foreach ($possiblePaths as $p) {
            if ($p && is_dir($p) && file_exists($p . '/index.html')) {
                $srcStatic = $p;
                break;
            }
        }

        if ($srcStatic) {
            $filesCopied += phpRecursiveCopy($srcStatic, $deployPath);
            // Sync API as well
            $srcApi = $srcStatic . '/../public/api';
            if (is_dir($srcApi)) phpRecursiveCopy($srcApi, $deployPath . '/api');

            echo json_encode([
                'success' => true,
                'message' => "¡Commit HEAD desplegado con éxito! $filesCopied archivos actualizados en vivo.",
                'details' => ['count' => $filesCopied, 'path' => $deployPath]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se encontró la carpeta "out" para desplegar. Asegúrate de que el build esté en el servidor.',
            ]);
        }
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
