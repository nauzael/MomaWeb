<?php
// public/api/utils/image_processor.php

/**
 * Optimiza y convierte una imagen a WebP.
 * 
 * @param string $sourcePath Ruta temporal del archivo subido.
 * @param string $targetPath Ruta final donde se guardará.
 * @param int $maxDimension Dimensión máxima permitida (ancho o alto, predeterminado 1920 para FullHD).
 * @param int $quality Calidad de compresión WebP (0-100, óptimo 80 para web).
 * @return bool
 */
function processImageToWebP($sourcePath, $targetPath, $maxDimension = 1920, $quality = 80) {
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

    // Redimensionar si excede la dimensión máxima permitida en cualquier eje
    if ($width > $maxDimension || $height > $maxDimension) {
        $ratio = min($maxDimension / $width, $maxDimension / $height);
        $newWidth = floor($width * $ratio);
        $newHeight = floor($height * $ratio);
        
        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Configurar transparencia para el nuevo lienzo
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
        imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
        
        // Resample con la mejor calidad interpolada
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
