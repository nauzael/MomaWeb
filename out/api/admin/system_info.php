<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Keep it JSON friendly

header('Content-Type: application/json');

/**
 * Moma Nature - System Info & Deployment API
 */

$deployPath = '/home/momaexcu/public_html';

try {
    $action = $_GET['action'] ?? 'info';

    // 1. Manual Deployment Action
    if ($action === 'deploy') {
        // Only run on Linux environments where cp is available
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            echo json_encode(['success' => false, 'message' => 'El despliegue manual no está disponible en entorno Windows local.']);
            exit;
        }

        // We still need exec for deploy, but we can check it here specifically
        if (!function_exists('exec')) {
            echo json_encode(['success' => false, 'message' => 'No se puede realizar despliegue manual: la función exec() está deshabilitada en este hosting.']);
            exit;
        }

        $cmd1 = "cp -rf ../../../out/* $deployPath/ 2>&1";
        $cmd2 = "cp -rf ../../../public/api/* $deployPath/api/ 2>&1";
        
        exec($cmd1, $out1, $ret1);
        exec($cmd2, $out2, $ret2);

        echo json_encode([
            'success' => $ret1 === 0 && $ret2 === 0,
            'message' => 'Despliegue manual completado',
            'details' => ['static' => $out1, 'api' => $out2]
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

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
