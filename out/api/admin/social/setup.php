<?php
// public/api/admin/social/setup.php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/settings.php';
require_once '../../utils/auth_check.php';

// Check Auth (handles session_start and validation)
checkAuth('admin');

// METHOD: GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $appId = getSetting('fb_app_id');
    $pageId = getSetting('fb_page_id');
    $igId = getSetting('instagram_account_id');
    $appSecret = getSetting('fb_app_secret');
    $token = getSetting('fb_page_access_token');
    
    jsonData([
        'appId' => $appId,
        'pageId' => $pageId,
        'instagramId' => $igId,
        'isConfigured' => ($appId && $appSecret && $pageId && $token)
    ]);
}

// METHOD: POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'save_credentials') {
        $appId = $input['appId'] ?? '';
        $appSecret = $input['appSecret'] ?? '';
        
        if (!$appId || !$appSecret) {
            jsonError('App ID and Secret are required', 400);
        }
        
        setSetting('fb_app_id', $appId, 'Facebook App ID');
        setSetting('fb_app_secret', $appSecret, 'Facebook App Secret');
        
        jsonData(['success' => true]);
    }
    
    if ($action === 'exchange_token') {
        $shortLivedToken = $input['shortLivedToken'] ?? '';
        if (!$shortLivedToken) {
            jsonError('Short lived token required', 400);
        }
        
        try {
            $appId = getSetting('fb_app_id');
            $appSecret = getSetting('fb_app_secret');
            
            if (!$appId || !$appSecret) {
                jsonError('App credentials not found', 400);
            }
            
            // 1. Exchange for Long-Lived User Token
            $url = "https://graph.facebook.com/v19.0/oauth/access_token?" . http_build_query([
                'grant_type' => 'fb_exchange_token',
                'client_id' => $appId,
                'client_secret' => $appSecret,
                'fb_exchange_token' => $shortLivedToken
            ]);
            
            $res = file_get_contents($url);
            $data = json_decode($res, true);
            
            if (isset($data['error'])) throw new Exception($data['error']['message']);
            
            $userLongLivedToken = $data['access_token'];
            
            // 2. Fetch Pages to let user select
            $pagesUrl = "https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=" . $userLongLivedToken;
            $pagesRes = file_get_contents($pagesUrl);
            $pagesData = json_decode($pagesRes, true);
            
            if (isset($pagesData['error'])) throw new Exception($pagesData['error']['message']);
            
            // 3. (Debug) Check what permissions were actually granted
            $permsUrl = "https://graph.facebook.com/v19.0/me/permissions?access_token=" . $userLongLivedToken;
            $permsRes = @file_get_contents($permsUrl);
            $permsData = $permsRes ? json_decode($permsRes, true) : null;
            
            jsonData([
                'success' => true,
                'pages' => $pagesData['data'],
                'userAccessToken' => $userLongLivedToken,
                'debug' => [
                    'rawPagesResponse' => $pagesData,
                    'permissions' => $permsData
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("Token setup error: " . $e->getMessage());
            jsonError($e->getMessage(), 500);
        }
    }
    
    if ($action === 'save_page_config') {
        $pageId = $input['pageId'] ?? '';
        $pageToken = $input['pageToken'] ?? '';
        $instagramId = $input['instagramId'] ?? null;
        
        if (!$pageId || !$pageToken) {
            jsonError('Page ID and Token required', 400);
        }
        
        setSetting('fb_page_id', $pageId, 'Facebook Page ID');
        setSetting('fb_page_access_token', $pageToken, 'Facebook Page Access Token (Long Lived)');
        
        if ($instagramId) {
            setSetting('instagram_account_id', $instagramId, 'Instagram Business Account ID');
        }
        
        jsonData(['success' => true]);
    }
    
    jsonError('Invalid action', 400);
}

jsonError('Method not allowed', 405);
?>
