const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourcePath = path.join(__dirname, '..', '.documentacion', 'faviconmoma.png');
const targetPath = path.join(__dirname, '..', 'public', 'favicon.png');

async function generateFavicon() {
    try {
        console.log(`Processing ${sourcePath}...`);

        // Read the source image to get its dimensions
        const image = sharp(sourcePath);
        const metadata = await image.metadata();

        // Calculate the size for the square canvas (max of width and height)
        const size = Math.max(metadata.width, metadata.height);

        // Add transparent padding to make it square and resize to 512x512 for a high-quality favicon
        await sharp(sourcePath)
            .extend({
                top: Math.floor((size - metadata.height) / 2),
                bottom: Math.ceil((size - metadata.height) / 2),
                left: Math.floor((size - metadata.width) / 2),
                right: Math.ceil((size - metadata.width) / 2),
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .resize(512, 512)
            .toFile(targetPath);

        console.log(`Successfully generated ${targetPath}`);
    } catch (error) {
        console.error('Error generating favicon:', error);
        process.exit(1);
    }
}

generateFavicon();
