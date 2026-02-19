<?php
// public/api/admin/social/publish.php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/settings.php';
require_once '../../utils/auth_check.php';

// Check Auth (handles session_start and validation)
checkAuth('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$message = $input['message'] ?? '';
$imageUrl = $input['imageUrl'] ?? '';
$link = $input['link'] ?? '';
$platforms = $input['platforms'] ?? [];

if (empty($platforms) || !is_array($platforms)) {
    jsonError('Invalid platforms specified', 400);
}

$pageId = getSetting('fb_page_id');
$accessToken = getSetting('fb_page_access_token');
$instagramId = getSetting('instagram_account_id');

if (!$pageId || !$accessToken) {
    jsonError('Facebook integration not configured', 400);
}

$results = [];
$errors = [];

// Helper function for POST requests to Graph API
function graphApiPost($endpoint, $params) {
    $url = "https://graph.facebook.com/v19.0/" . $endpoint;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if ($httpCode >= 400 || isset($data['error'])) {
        throw new Exception($data['error']['message'] ?? 'Unknown Graph API Error');
    }
    
    return $data;
}

// 1. Publish to Facebook
if (in_array('facebook', $platforms)) {
    try {
        $params = [
            'access_token' => $accessToken,
            'message' => $message
        ];
        
        if ($imageUrl) {
            $params['url'] = $imageUrl;
            $endpoint = "{$pageId}/photos";
            // If caption is used for photos
            if ($message) $params['caption'] = $message;
            unset($params['message']); // Photo endpoint uses caption or message? usually caption.
        } elseif ($link) {
            $params['link'] = $link;
            $endpoint = "{$pageId}/feed";
        } else {
            $endpoint = "{$pageId}/feed";
        }
        
        $res = graphApiPost($endpoint, $params);
        $results['facebook'] = $res;
        
    } catch (Exception $e) {
        error_log("FB Publish Error: " . $e->getMessage());
        $errors['facebook'] = $e->getMessage();
    }
}

// 2. Publish to Instagram
if (in_array('instagram', $platforms)) {
    if (!$instagramId) {
        $errors['instagram'] = "Instagram ID not configured";
    } elseif (empty($imageUrl)) {
        $errors['instagram'] = "Image URL is required for Instagram";
    } else {
        try {
            // Step 1: Create Container
            $containerParams = [
                'access_token' => $accessToken,
                'image_url' => $imageUrl,
            ];
            if ($message) $containerParams['caption'] = $message;
            
            $containerRes = graphApiPost("{$instagramId}/media", $containerParams);
            $creationId = $containerRes['id'];
            
            // Step 2: Publish Container
            $publishParams = [
                'access_token' => $accessToken,
                'creation_id' => $creationId
            ];
            
            $publishRes = graphApiPost("{$instagramId}/media_publish", $publishParams);
            $results['instagram'] = $publishRes;
            
        } catch (Exception $e) {
            error_log("IG Publish Error: " . $e->getMessage());
            $errors['instagram'] = $e->getMessage();
        }
    }
}

jsonData([
    'success' => empty($errors),
    'results' => $results,
    'errors' => $errors
]);
?>
