<?php
// Moma Nature - Ultra Fast Deployment Engine
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../config/cors.php';
header('Content-Type: application/json');

$deployPath = '/home/momaexcu/public_html';

try {
    $action = $_GET['action'] ?? 'info';

    // Función de copia optimizada (Sync incremental)
    function fastSync($src, $dst) {
        if (!is_dir($src)) return 0;
        if (!is_dir($dst)) @mkdir($dst, 0755, true);
        $count = 0;
        $files = scandir($src);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..' || $file === '.git') continue;
            $s = $src . '/' . $file;
            $d = $dst . '/' . $file;
            if (is_dir($s)) {
                $count += fastSync($s, $d);
            } else {
                // Solo copia si el archivo es diferente o más nuevo
                if (!file_exists($d) || filemtime($s) > filemtime($d) || filesize($s) !== filesize($d)) {
                    if (@copy($s, $d)) $count++;
                }
            }
        }
        return $count;
    }

    if ($action === 'deploy-head') {
        clearstatcache();
        $filesCopied = 0;
        
        // Prioridad máxima a la ruta de cPanel
        $possiblePaths = [
            '/home/momaexcu/repositories/MomaWeb/out',
            '/home/momaexcu/out_deploy',
            realpath(__DIR__ . '/../../../out')
        ];

        $srcStatic = null;
        foreach ($possiblePaths as $p) {
            if ($p && is_dir($p)) {
                $srcStatic = $p;
                break;
            }
        }

        if ($srcStatic) {
            $filesCopied = fastSync($srcStatic, $deployPath);
            
            // Sincronizar API también
            $srcApi = realpath($srcStatic . '/../public/api');
            if ($srcApi && is_dir($srcApi)) fastSync($srcApi, $deployPath . '/api');

            $log = [
                'time' => date('d/m/Y H:i:s'),
                'count' => $filesCopied,
                'source' => basename($srcStatic)
            ];
            @file_put_contents(__DIR__ . '/deploy_log.json', json_encode($log));

            echo json_encode([
                'success' => true,
                'message' => "¡Sincronización Rayo! $filesCopied archivos actualizados.",
                'details' => $log
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se encontraron archivos para desplegar.',
                'paths' => $possiblePaths
            ]);
        }
        exit;
    }

    // Monitor en Tiempo Real
    $git_info = ['hash' => 'N/A', 'author' => 'System', 'date_full' => date('d/m/Y H:i:s'), 'subject' => 'Monitor Activo'];
    if (file_exists(__DIR__ . '/git_info.json')) {
        $data = json_decode(file_get_contents(__DIR__ . '/git_info.json'), true);
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
            'refresh_rate' => '5s',
            'status' => 'ONLINE'
        ]
    ]);

} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
