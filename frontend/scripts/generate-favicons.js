const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Path to the source SVG logo
const svgPath = path.join(__dirname, '..', 'public', 'logo.svg');
const outputDir = path.join(__dirname, '..', 'public');

// Ensure output directory exists
ensureDirectoryExists(outputDir);

// Define the sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 }
];

// Generate PNG files from SVG
async function generateFavicons() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate each size
    for (const { name, size } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${name} (${size}x${size})`);
    }
    
    // Generate ICO file (using the 32x32 PNG)
    // Note: For proper ICO generation, you might need a dedicated library
    // This is a simple copy of the 32x32 PNG for demonstration
    const faviconPath = path.join(outputDir, 'favicon.ico');
    const png32Path = path.join(outputDir, 'favicon-32x32.png');
    
    fs.copyFileSync(png32Path, faviconPath);
    console.log('Generated favicon.ico (copied from 32x32 PNG)');
    
    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
