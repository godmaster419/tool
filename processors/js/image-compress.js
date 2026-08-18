// ─── Image Compress Processor ───────────────────────────────────
// Uses: sharp
// Compresses an image by adjusting quality and optionally resizing.

const sharp = require("sharp");

/**
 * Compress an image buffer.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {object} options
 * @param {number} [options.quality] - Quality 1-100 (default 80).
 * @param {"jpeg"|"png"|"webp"|"avif"} [options.format] - Output format.
 * @param {number} [options.maxWidth] - Maximum width (will resize if larger).
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function compressImage(inputBuffer, options) {
  const { quality = 80, format, maxWidth } = options;

  const metadata = await sharp(inputBuffer).metadata();
  const detectedFormat = format || metadata.format || "jpeg";

  let pipeline = sharp(inputBuffer);

  // Resize if maxWidth is specified and image exceeds it
  if (maxWidth && metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  // Apply format-specific compression
  switch (detectedFormat) {
    case "jpeg":
    case "jpg":
      pipeline = pipeline.jpeg({
        quality,
        mozjpeg: true, // better compression
      });
      break;
    case "png":
      pipeline = pipeline.png({
        quality,
        compressionLevel: 9,
        palette: quality < 50, // use palette for aggressive compression
      });
      break;
    case "webp":
      pipeline = pipeline.webp({
        quality,
        effort: 6,
      });
      break;
    case "avif":
      pipeline = pipeline.avif({
        quality,
        effort: 6,
      });
      break;
    default:
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const result = await pipeline.toBuffer();

  return {
    buffer: result,
    metadata: {
      originalSize: inputBuffer.length,
      compressedSize: result.length,
      savings: Math.round((1 - result.length / inputBuffer.length) * 100),
      format: detectedFormat,
      quality,
    },
  };
}

module.exports = { compressImage };
