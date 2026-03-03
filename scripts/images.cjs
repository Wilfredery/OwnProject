const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../src/img');
const outputDir = path.join(__dirname, '../public/build/img');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  const inputPath = path.join(inputDir, file);
  const name = path.parse(file).name;

  // Fallback original
  fs.copyFileSync(inputPath, path.join(outputDir, file));

  // WebP calidad PRO
  sharp(inputPath)
    .resize({
      width: 2000,              // 👈 más detalle (retina ready)
      withoutEnlargement: true
    })
    .sharpen({
      sigma: 1.1,
      m1: 0.5,
      m2: 0.5
    })
    .webp({
      quality: 92,              // 🔥 ultra nítido
      effort: 6,
      smartSubsample: false     // 🔥 evita blur en texto/UI
    })
    .toFile(path.join(outputDir, `${name}.webp`))
    .catch(err => {
      console.error(`❌ Error procesando ${file}:`, err);
    });
});

console.log('✨ Imágenes procesadas con Sharp (ULTRA quality)');