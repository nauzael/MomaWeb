<?php
// Moma Nature - System Info & Deployment Engine PRO
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../config/cors.php';
header('Content-Type: application/json');

$deployPath = '/home/momaexcu/public_html';

try {
    $action = $_GET['action'] ?? 'info';

    function phpRecursiveCopy($src, $dst) {
        if (!is_dir($src)) return false;
        if (!is_dir($dst)) @mkdir($dst, 0755, true);
        $dir = opendir($src);
        $count = 0;
        while(false !== ( $file = readdir($dir)) ) {
            if (( $file != '.' ) && ( $file != '..' ) && ( $file != '.git' )) {
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

    if ($action === 'deploy-head') {
        clearstatcache();
        $filesCopied = 0;
        
        // Buscador de rutas inteligente (Orden de prioridad)
        $possiblePaths = [
            '/home/momaexcu/repositories/MomaWeb/out', // Tu ruta de cPanel
            '/home/momaexcu/moma-web/out',
            '/home/momaexcu/out_deploy', 
            '/home/momaexcu/out',
            realpath(__DIR__ . '/../../../out')
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
            $srcApi = realpath($srcStatic . '/../public/api');
            if ($srcApi && is_dir($srcApi)) phpRecursiveCopy($srcApi, $deployPath . '/api');

            @file_put_contents(__DIR__ . '/deploy_log.json', json_encode([
                'time' => date('d/m/Y H:i:s'),
                'count' => $filesCopied,
                'source' => basename($srcStatic)
            ]));

            echo json_encode([
                'success' => true,
                'message' => "¡ÉXITO! $filesCopied archivos actualizados desde: " . basename($srcStatic),
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'ERROR: No se encontró la carpeta de construcción (out). Por favor, asegúrate de que GitHub o el cPanel Git hayan descargado los archivos en el servidor.',
                'debug_paths' => $possiblePaths
            ]);
        }
        exit;
    }

    // Información del Git (Monitor)
    $git_info = ['hash' => 'N/A', 'author' => 'System', 'date_full' => date('d/m/Y H:i:s'), 'subject' => 'Monitor Activo'];
    $staticInfoPath = __DIR__ . '/git_info.json';
    if (file_exists($staticInfoPath)) {
        $data = json_decode(file_get_contents($staticInfoPath), true);
        if ($data) $git_info = array_merge($git_info, $data);
    }

    $last_log = ['time' => 'Nunca', 'count' => 0];
    if (file_exists(__DIR__ . '/deploy_log.json')) {
        $last_log = json_decode(file_get_contents(__DIR__ . '/deploy_log.json'), true);
    }

    echo json_encode([
        'success' => true,
        'git' => $git_info,
        'server' => [
            'last_deploy' => $last_log['time'],
            'php_version' => PHP_VERSION,
            'status' => 'Conectado'
        ]
    ]);

} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
