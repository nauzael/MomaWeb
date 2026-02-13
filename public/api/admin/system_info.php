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
        echo json_encode([
            'success' => false,
            'message' => 'El hosting no permite ejecutar "git pull" vía PHP. Sigue esta guía: En GitHub -> Settings -> Webhooks, añade la URL de tu cPanel para que se actualice solo al hacer push.',
            'details' => ['tip' => 'Usa la integración nativa de cPanel Git™ para máxima velocidad.']
        ]);
        exit;
    }

    if ($action === 'deploy' || $action === 'deploy-head') {
        $filesCopied = 0;
        $possiblePaths = [
            realpath(__DIR__ . '/../../../out'),
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
            $srcApi = $srcStatic . '/../public/api';
            if (is_dir($srcApi)) phpRecursiveCopy($srcApi, $deployPath . '/api');

            // Store deploy log
            $log = [
                'time' => date('Y-m-d H:i:s'),
                'count' => $filesCopied,
                'sha' => 'HEAD'
            ];
            @file_put_contents(__DIR__ . '/deploy_log.json', json_encode($log));

            echo json_encode([
                'success' => true,
                'message' => "¡Despliegue exitoso! $filesCopied archivos sincronizados con la carpeta pública.",
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se encontró el build (carpeta out). Asegúrate de que los archivos estén en el servidor fuera de public_html.',
            ]);
        }
        exit;
    }

    // 2. Information Retrieval
    $git_info = [
        'hash' => 'No disponible',
        'author' => 'System',
        'date_relative' => 'Desconocido',
        'date_full' => date('d/m/Y H:i:s'),
        'subject' => 'Repositorio no sincronizado localmente',
        'build_time' => 'N/A'
    ];

    $staticInfoPath = __DIR__ . '/git_info.json';
    if (file_exists($staticInfoPath)) {
        $staticData = json_decode(file_get_contents($staticInfoPath), true);
        if ($staticData) $git_info = array_merge($git_info, $staticData);
    }

    // 3. Deployment Log
    $last_log = ['time' => 'Nunca', 'count' => 0];
    if (file_exists(__DIR__ . '/deploy_log.json')) {
        $last_log = json_decode(file_get_contents(__DIR__ . '/deploy_log.json'), true);
    }

    echo json_encode([
        'success' => true,
        'git' => $git_info,
        'server' => [
            'php_version' => PHP_VERSION,
            'server_time' => date('Y-m-d H:i:s'),
            'os' => PHP_OS,
            'deploy_path' => $deployPath,
            'last_deploy' => $last_log['time'],
            'is_deployed' => true
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
