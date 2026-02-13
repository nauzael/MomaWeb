<?php
header('Content-Type: application/json');

/**
 * Moma Nature - System Info API
 * Returns information about the current deployment status and git history.
 */

try {
    // 1. Git Information
    // Format: hash | author | relative date | full date | subject
    $commit_format = '%H|%an|%ar|%ad|%s';
    
    // Attempt to run git log
    // We use a specific path if needed, but assuming git is in path
    $command = 'git log -1 --format="' . $commit_format . '"';
    
    // On Windows development, we might need to handle shell issues
    exec($command, $output, $return_var);
    
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
        // Fallback or empty state
        $git_info = [
            'hash' => 'No disponible',
            'author' => 'System',
            'date_relative' => 'Desconocido',
            'date_full' => date('Y-m-d H:i:s'),
            'subject' => 'No se pudo obtener información de Git'
        ];
    }

    // 2. Server Information
    $server_info = [
        'php_version' => PHP_VERSION,
        'server_time' => date('Y-m-d H:i:s'),
        'os' => PHP_OS,
        'last_updated' => date('Y-m-d H:i:s') // Assuming current check means it's active
    ];

    echo json_encode([
        'success' => true,
        'git' => $git_info,
        'server' => $server_info
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
