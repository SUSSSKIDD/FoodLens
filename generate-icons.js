const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const sourceIcon = 'frontend/src/assets/logo.svg';
const publicDir = 'frontend/public';

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Generate PNG icons
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
      console.log(`Generated icon-${size}x${size}.png`);
    }

    // Generate favicon
    await sharp(sourceIcon)
      .resize(32, 32)
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('Generated favicon.ico');

    // Generate apple touch icon
    await sharp(sourceIcon)
      .resize(180, 180)
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');

    // Copy the SVG as masked icon
    fs.copyFileSync(sourceIcon, path.join(publicDir, 'masked-icon.svg'));
    console.log('Copied masked-icon.svg');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 