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

  // Copiar original
  fs.copyFileSync(inputPath, path.join(outputDir, file));

  // Crear WebP
  sharp(inputPath)
    .webp({ quality: 75 })
    .toFile(path.join(outputDir, `${name}.webp`));
});

console.log('✅ Imágenes procesadas con Sharp');
