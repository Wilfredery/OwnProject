/**
 * ============================================================
 *  IMAGE OPTIMIZATION SCRIPT – SHARP
 * ============================================================
 *
 * This script processes images from the source directory
 * and generates optimized versions inside the build folder.
 *
 * Responsibilities:
 * - Copy original image (fallback version)
 * - Generate high-quality WebP version
 * - Resize images for large/retina displays
 * - Improve sharpness for text/UI clarity
 *
 * Supported formats:
 * - .png
 * - .jpg
 * - .jpeg
 *
 * Output:
 * - Original file (copied)
 * - Optimized .webp version
 *
 * Execution:
 * node scripts/images.cjs
 *
 * ============================================================
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------
// 📁 Directory Configuration
// ------------------------------------------------------------

/**
 * Source directory:
 * Raw images before processing.
 */
const inputDir = path.join(__dirname, '../src/img');

/**
 * Output directory:
 * Optimized images for production usage.
 */
const outputDir = path.join(__dirname, '../public/build/img');

// ------------------------------------------------------------
// 📂 Ensure Output Directory Exists
// ------------------------------------------------------------

/**
 * Creates the output directory if it does not exist.
 * "recursive: true" ensures nested directories are created.
 */
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ------------------------------------------------------------
// 🖼 Image Processing
// ------------------------------------------------------------

/**
 * Reads all files inside the input directory
 * and processes supported image formats.
 */
fs.readdirSync(inputDir).forEach(file => {

  const ext = path.extname(file).toLowerCase();

  // Only process supported image types
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  const inputPath = path.join(inputDir, file);
  const name = path.parse(file).name;

  // ----------------------------------------------------------
  // 📦 Fallback Original Copy
  // ----------------------------------------------------------

  /**
   * Copies the original image into the build folder.
   * This ensures compatibility for browsers
   * that do not support WebP.
   */
  fs.copyFileSync(inputPath, path.join(outputDir, file));

  // ----------------------------------------------------------
  // 🚀 High-Quality WebP Generation
  // ----------------------------------------------------------

  /**
   * Image optimization pipeline:
   * - Resize (max width 2000px, retina-ready)
   * - Sharpen to improve clarity
   * - Convert to WebP with high quality
   */
  sharp(inputPath)
    .resize({
      width: 2000,              // High-detail output (retina-ready)
      withoutEnlargement: true  // Prevent upscaling smaller images
    })
    .sharpen({
      sigma: 1.1,
      m1: 0.5,
      m2: 0.5
    })
    .webp({
      quality: 92,              // Ultra high quality
      effort: 6,                // Maximum compression effort
      smartSubsample: false     // Prevents blur on text/UI elements
    })
    .toFile(path.join(outputDir, `${name}.webp`))
    .catch(err => {
      console.error(`❌ Error processing ${file}:`, err);
    });
});

// ------------------------------------------------------------
// ✅ Process Completed
// ------------------------------------------------------------

console.log('✨ Images processed successfully (ULTRA quality)');