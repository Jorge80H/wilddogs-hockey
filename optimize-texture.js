import sharp from 'sharp';

const inputPath = 'g:/EMPLEADOS DIGITALES/CLIENTES/WILDDOGS_WEB/Brand/textura-grande_wilddogs_01.jpg';
const outputPath = 'attached_assets/client_images/textura-grande_wilddogs_01.webp';

async function optimize() {
  try {
    console.log(`Processing ${inputPath}...`);
    await sharp(inputPath, { limitInputPixels: 0 })
      .resize({ width: 1920, withoutEnlargement: true }) // Resize to max 1920px width for better web performance
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log('Successfully optimized texture!');
  } catch (error) {
    console.error('Error optimizing texture:', error);
  }
}

optimize();
