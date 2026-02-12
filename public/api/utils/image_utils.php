<?php
// public/api/utils/image_utils.php

function generateThumbnail($sourcePath, $targetPath, $maxWidth = 400, $maxHeight = 400, $quality = 80) {
    if (!file_exists($sourcePath)) return false;

    $info = getimagesize($sourcePath);
    if (!$info) return false;

    $width = $info[0];
    $height = $info[1];
    $mime = $info['mime'];

    // Avoid upscaling
    if ($width <= $maxWidth && $height <= $maxHeight) {
        return copy($sourcePath, $targetPath);
    }

    $ratio = min($maxWidth / $width, $maxHeight / $height);
    $newWidth = (int)($width * $ratio);
    $newHeight = (int)($height * $ratio);

    $thumb = imagecreatetruecolor($newWidth, $newHeight);
    
    // Handle transparency for PNG/WebP
    if ($mime == 'image/png' || $mime == 'image/webp') {
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);
        $transparent = imagecolorallocatealpha($thumb, 255, 255, 255, 127);
        imagefilledrectangle($thumb, 0, 0, $newWidth, $newHeight, $transparent);
    }

    switch ($mime) {
        case 'image/jpeg':
            $source = imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $source = imagecreatefrompng($sourcePath);
            break;
        case 'image/webp':
            $source = imagecreatefromwebp($sourcePath);
            break;
        default:
            return false;
    }

    imagecopyresampled($thumb, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    switch ($mime) {
        case 'image/jpeg':
            imagejpeg($thumb, $targetPath, $quality);
            break;
        case 'image/png':
            // PNG quality is 0-9
            imagepng($thumb, $targetPath, (int)(($quality-100)/-11.11));
            break;
        case 'image/webp':
            imagewebp($thumb, $targetPath, $quality);
            break;
    }

    imagedestroy($thumb);
    imagedestroy($source);
    return true;
}
?>
