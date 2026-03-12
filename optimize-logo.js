import sharp from 'sharp';

const inputPath = 'g:/EMPLEADOS DIGITALES/CLIENTES/WILDDOGS_WEB/Brand/Imagen corporativa/Logo_Optima.png';
const outputPath = 'attached_assets/client_images/Logo_Optima.webp';

async function optimize() {
  try {
    console.log(`Processing ${inputPath}...`);
    await sharp(inputPath, { limitInputPixels: 0 })
      .resize({ width: 600, withoutEnlargement: true }) // reasonable size for a logo
      .webp({ quality: 90 })
      .toFile(outputPath);
    console.log('Successfully optimized logo!');
  } catch (error) {
    console.error('Error optimizing logo:', error);
  }
}

optimize();
