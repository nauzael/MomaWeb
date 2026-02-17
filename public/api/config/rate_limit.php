<?php
// public/api/config/rate_limit.php

class RateLimiter {
    private $maxRequests = 60; // Requests per minute
    private $window = 60; // Window size in seconds
    
    /**
     * Check if the request should be rate limited.
     * Uses a simple file-based approach suitable for shared hosting.
     * 
     * @param string|null $identifier Optional identifier (IP address by default)
     * @return bool True if allowed, exits with 429 if limit exceeded
     */
    public function check($identifier = null) {
        $ip = $identifier ?? ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
        // Sanitize IP for filename
        $safeIp = preg_replace('/[^a-zA-Z0-9]/', '_', $ip);
        $key = "rate_limit_" . md5($safeIp);
        $tempDir = sys_get_temp_dir();
        $file = $tempDir . DIRECTORY_SEPARATOR . $key;
        
        $now = time();
        $requests = [];

        // Read existing requests
        if (file_exists($file)) {
            $content = @file_get_contents($file);
            if ($content) {
                $requests = json_decode($content, true);
                if (!is_array($requests)) {
                    $requests = [];
                }
            }
        }
        
        // Filter out old requests outside the window
        $requests = array_filter($requests, function($timestamp) use ($now) {
            return ($now - $timestamp) < $this->window;
        });
        
        // Check limit
        if (count($requests) >= $this->maxRequests) {
            http_response_code(429);
            header('Retry-After: ' . $this->window);
            echo json_encode([
                'error' => 'Too many requests. Please try again later.',
                'code' => 429
            ]);
            exit;
        }
        
        // Add current request
        $requests[] = $now;
        
        // Save back to file
        @file_put_contents($file, json_encode(array_values($requests)));
        
        return true;
    }
}
?>
