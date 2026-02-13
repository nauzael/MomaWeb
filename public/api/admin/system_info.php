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

    // 2. Monitor de Git en Tiempo Real (Radar)
    $git_info = [
        'hash' => 'N/A',
        'author' => 'System',
        'date_full' => date('d/m/Y H:i:s'),
        'subject' => 'Monitor Activo',
        'is_outdated' => false
    ];

    // Local Info (Lo que está en el servidor)
    $staticInfoPath = __DIR__ . '/git_info.json';
    if (file_exists($staticInfoPath)) {
        $localData = json_decode(file_get_contents($staticInfoPath), true);
        if ($localData) $git_info = array_merge($git_info, $localData);
    }

    // Remote Info (Lo que está en GitHub - Fuente de la Verdad)
    // Usamos caché de 1 minuto para no saturar la API de GitHub
    $cacheFile = __DIR__ . '/github_cache.json';
    $remoteData = null;
    $shouldFetch = !file_exists($cacheFile) || (time() - filemtime($cacheFile) > 60);

    if ($shouldFetch) {
        $opts = [
            "http" => [
                "method" => "GET",
                "header" => "User-Agent: Moma-Nature-Deployment-Monitor\r\n"
            ]
        ];
        $context = stream_context_create($opts);
        $apiUrl = "https://api.github.com/repos/nauzael/MomaWeb/commits/main";
        $response = @file_get_contents($apiUrl, false, $context);
        
        if ($response) {
            $data = json_decode($response, true);
            $remoteData = [
                'hash' => $data['sha'],
                'author' => $data['commit']['author']['name'],
                'date' => $data['commit']['author']['date'],
                'subject' => $data['commit']['message']
            ];
            @file_put_contents($cacheFile, json_encode($remoteData));
        }
    } else {
        $remoteData = json_decode(file_get_contents($cacheFile), true);
    }

    // Comparamos versiones
    if ($remoteData && isset($git_info['hash'])) {
        $git_info['remote'] = $remoteData;
        $git_info['is_outdated'] = (substr($git_info['hash'], 0, 7) !== substr($remoteData['hash'], 0, 7));
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
            'is_outdated' => $git_info['is_outdated']
        ]
    ]);

} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
