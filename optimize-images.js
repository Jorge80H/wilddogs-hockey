import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.join(process.cwd(), 'attached_assets', 'client_images');

async function optimizeImages() {
  try {
    console.log(`Starting to optimize images in ${inputDir}`);
    const files = fs.readdirSync(inputDir);

    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

      const inputPath = path.join(inputDir, file);
      const ext = path.extname(file);
      const basename = path.basename(file, ext);
      
      // We overwrite the same file name but as a WebP
      // Since some code may hardcode .JPG or .jpg, let's just create a .webp version
      // and update the TSX files to use .webp
      const outputPath = path.join(inputDir, `${basename}.webp`);

      console.log(`Processing ${file}...`);
      
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
        
      console.log(`Saved ${basename}.webp`);
      
      // Optional: Remove original if we're replacing
      // fs.unlinkSync(inputPath);
    }
    
    console.log('Finished optimizing images to WebP.');
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages();
