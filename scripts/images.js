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
  const outputOriginal = path.join(outputDir, file);
  const outputWebp = path.join(outputDir, `${name}.webp`);

  // ✅ Copiar original (fallback)
  fs.copyFileSync(inputPath, outputOriginal);

  // ✅ WebP de ALTA calidad (optimizado para UI)
  sharp(inputPath)
    .resize({
      width: 1600,              // 🔥 evita imágenes gigantes
      withoutEnlargement: true
    })
    .webp({
      quality: 90,              // 🔥 gran mejora visual
      effort: 6,                // mejor compresión
      smartSubsample: true      // ideal para texto y bordes
    })
    .toFile(outputWebp)
    .catch(err => {
      console.error(`❌ Error procesando ${file}:`, err);
    });
});

console.log('✅ Imágenes procesadas con Sharp (alta calidad)');