<?php
// public/api/utils/image_processor.php

/**
 * Optimiza y convierte una imagen a WebP.
 * 
 * @param string $sourcePath Ruta temporal del archivo subido.
 * @param string $targetPath Ruta final donde se guardará.
 * @param int $maxWidth Ancho máximo permitido (opcional).
 * @param int $quality Calidad de compresión WebP (0-100).
 * @return bool
 */
function processImageToWebP($sourcePath, $targetPath, $maxWidth = 2560, $quality = 85) {
    // Verificar si GD está instalado
    if (!extension_loaded('gd')) {
        error_log("Image Processor: GD extension not loaded.");
        return false;
    }

    $info = getimagesize($sourcePath);
    if (!$info) {
        error_log("Image Processor: getimagesize failed for $sourcePath");
        return false;
    }

    $mime = $info['mime'];
    $width = $info[0];
    $height = $info[1];

    // Cargar la imagen según su tipo
    switch ($mime) {
        case 'image/jpeg':
        case 'image/jpg':
            $image = @imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $image = @imagecreatefrompng($sourcePath);
            if ($image) {
                // Mantener transparencia si es posible (WebP lo soporta)
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
            }
            break;
        case 'image/webp':
            $image = @imagecreatefromwebp($sourcePath);
            break;
        case 'image/gif':
            $image = @imagecreatefromgif($sourcePath);
            if ($image) {
                imagepalettetotruecolor($image);
            }
            break;
        default:
            error_log("Image Processor: Unsupported MIME type $mime");
            return false;
    }

    if (!$image) {
        error_log("Image Processor: Failed to create image resource from $sourcePath with mime $mime");
        return false;
    }

    // Redimensionar si es más ancha que el máximo definido (ej: 1920px para pantallas 1080p)
    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = floor($height * ($maxWidth / $width));
        
        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Configurar transparencia para el nuevo lienzo
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
        imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
        
        imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($image);
        $image = $resizedImage;
    }

    // Guardar como WebP optimizado
    // php intermedio: imagewebp no siempre soporta calidad si GD es antiguo, pero suele funcionar
    $result = @imagewebp($image, $targetPath, $quality);
    
    if (!$result) {
        error_log("Image Processor: imagewebp failed to write to $targetPath");
    }

    // Liberar memoria
    imagedestroy($image);

    return $result;
}
?>
