<?php
header('Content-Type: application/json');

/**
 * Moma Nature - System Info & Deployment API
 */

$deployPath = '/home/momaexcu/public_html';

try {
    $action = $_GET['action'] ?? 'info';

    // 1. Manual Deployment Action
    if ($action === 'deploy') {
        // This simulates what .cpanel.yml does but triggered manually
        // 1. Copy out (static build) to public_html
        $cmd1 = "cp -rf ../../../out/* $deployPath/ 2>&1";
        // 2. Copy public/api to public_html/api
        $cmd2 = "cp -rf ../../../public/api/* $deployPath/api/ 2>&1";
        
        exec($cmd1, $out1, $ret1);
        exec($cmd2, $out2, $ret2);

        echo json_encode([
            'success' => $ret1 === 0 && $ret2 === 0,
            'message' => 'Despliegue manual completado',
            'details' => [
                'static' => $out1,
                'api' => $out2
            ]
        ]);
        exit;
    }

    // 2. Git Information
    $commit_format = '%H|%an|%ar|%ad|%s';
    exec('git log -1 --format="' . $commit_format . '"', $output, $return_var);
    
    $git_info = null;
    if ($return_var === 0 && !empty($output)) {
        $parts = explode('|', $output[0]);
        $git_info = [
            'hash' => $parts[0] ?? 'N/A',
            'author' => $parts[1] ?? 'N/A',
            'date_relative' => $parts[2] ?? 'N/A',
            'date_full' => $parts[3] ?? 'N/A',
            'subject' => $parts[4] ?? 'N/A'
        ];
    } else {
        $git_info = ['hash' => 'No disponible', 'author' => 'System', 'date_relative' => 'Desconocido', 'date_full' => date('Y-m-d H:i:s'), 'subject' => 'No se pudo obtener información de Git'];
    }

    // 3. Deployment Status (Live Check)
    $is_deployed = file_exists($deployPath);
    $last_deploy_time = $is_deployed ? date("Y-m-d H:i:s", filemtime($deployPath)) : 'Nunca';

    echo json_encode([
        'success' => true,
        'git' => $git_info,
        'server' => [
            'php_version' => PHP_VERSION,
            'server_time' => date('Y-m-d H:i:s'),
            'os' => PHP_OS,
            'deploy_path' => $deployPath,
            'is_deployed' => $is_deployed,
            'last_deploy' => $last_deploy_time
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
