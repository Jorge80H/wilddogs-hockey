// Escribe imágenes optimizadas en carpeta separada para evitar bloqueo en Windows
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir  = path.join(process.cwd(), 'attached_assets', 'client_images');
const outputDir = path.join(process.cwd(), 'attached_assets', 'client_images_opt');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const RULES = {
  'Jugadores_Wilddogs.webp':         { width: 1920, quality: 72 },
  'IMG_8260.webp':                   { width: 1920, quality: 72 },
  'textura-grande_wilddogs_01.webp': { width: 1440, quality: 65 },
  'textura_grande_wilddogs.webp':    { width: 1440, quality: 65 },
  'Logo_Optima.webp':                { width: 300,  quality: 80 },
  'Rooster_Sub8.webp':               { width: 800,  quality: 75 },
  'Sub12_Grupo.webp':                { width: 800,  quality: 75 },
  'sub14_Grupo.webp':                { width: 800,  quality: 75 },
  'Sub18_grupo.webp':                { width: 800,  quality: 75 },
  'Sub10_grupo.webp':                { width: 800,  quality: 75 },
  'IMG_8291_1.webp':                 { width: 800,  quality: 75 },
  'IMG_5907.webp':                   { width: 800,  quality: 75 },
  'IMG_7937.webp':                   { width: 800,  quality: 75 },
  'IMG_7933.webp':                   { width: 800,  quality: 75 },
  'IMG_8273.webp':                   { width: 1200, quality: 75 },
  'IMG_8276.webp':                   { width: 1200, quality: 75 },
  'IMG_8304_1.webp':                 { width: 1200, quality: 75 },
  'IMG_8376.webp':                   { width: 1200, quality: 75 },
  'DSC01384.webp':                   { width: 1200, quality: 75 },
  'DSC01403.webp':                   { width: 1200, quality: 75 },
  'IMG_0543.webp':                   { width: 800,  quality: 75 },
  'IMG_0795.webp':                   { width: 800,  quality: 75 },
  'IMG_0797.webp':                   { width: 800,  quality: 75 },
  'IMG-20250614-WA0010.webp':        { width: 800,  quality: 75 },
};

const DEFAULT_RULE = { width: 900, quality: 75 };

async function reoptimize() {
  const files = fs.readdirSync(inputDir).filter(f => f.match(/\.webp$/i));
  let totalSaved = 0;
  let processed = 0;

  console.log(`Procesando ${files.length} archivos WebP...`);

  for (const file of files) {
    const inputPath  = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    const sizeBefore = fs.statSync(inputPath).size;
    const rule = RULES[file] || DEFAULT_RULE;

    try {
      const meta = await sharp(inputPath).metadata();
      const shouldResize = meta.width > rule.width;

      const pipeline = sharp(inputPath);
      if (shouldResize) {
        pipeline.resize({ width: rule.width, withoutEnlargement: true });
      }
      await pipeline.webp({ quality: rule.quality, effort: 4 }).toFile(outputPath);

      const sizeAfter = fs.statSync(outputPath).size;
      const saved = sizeBefore - sizeAfter;
      totalSaved += saved;
      processed++;

      console.log(`✅ ${file}: ${Math.round(sizeBefore/1024)}KB → ${Math.round(sizeAfter/1024)}KB (-${Math.round(saved/1024)}KB)${shouldResize ? ` [→${rule.width}px]` : ''}`);
    } catch (err) {
      console.error(`❌ ${file}:`, err.message);
    }
  }

  console.log(`\n📁 Imágenes optimizadas en: ${outputDir}`);
  console.log(`✅ Procesadas: ${processed}/${files.length}`);
  console.log(`🎉 Total ahorrado: ${Math.round(totalSaved/1024)}KB (${(totalSaved/1024/1024).toFixed(2)}MB)`);
  console.log(`\nPróximo paso: copiar el contenido de client_images_opt a client_images`);
  console.log(`Copy-Item -Path "${outputDir}\\*" -Destination "${inputDir}" -Force`);
}

reoptimize();
