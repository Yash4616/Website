// Script to generate PWA icons from source image
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceImage = path.join(__dirname, '..', 'public', 'myimage.jpg');
const outputDir = path.join(__dirname, '..', 'public');

const sizes = [192, 512];

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    // Regular icon (square with padding)
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
    
    console.log(`Created icon-${size}.png`);

    // Maskable icon (with safe zone padding - 10% on each side)
    const padding = Math.round(size * 0.1);
    const innerSize = size - (padding * 2);
    
    await sharp(sourceImage)
      .resize(innerSize, innerSize, {
        fit: 'cover',
        position: 'center'
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, `icon-maskable-${size}.png`));
    
    console.log(`Created icon-maskable-${size}.png`);
  }

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
