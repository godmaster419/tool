// ─── HEIC to JPG Converter ──────────────────────────────────────
// Uses: heic-convert, sharp
// Converts Apple HEIC/HEIF images to JPG format.

const convert = require("heic-convert");
const sharp = require("sharp");

/**
 * Convert a HEIC/HEIF image buffer to JPG.
 * @param {Buffer} inputBuffer - The HEIC image buffer.
 * @param {object} options
 * @param {number} [options.quality] - JPEG quality 1-100 (default 92).
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function heicToJpg(inputBuffer, options) {
  const { quality = 92 } = options;

  // Convert HEIC to raw JPEG first
  const jpegBuffer = await convert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: quality / 100,
  });

  // Pass through sharp for consistent output and metadata
  const result = await sharp(Buffer.from(jpegBuffer))
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  const metadata = await sharp(result).metadata();

  return {
    buffer: result,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      originalSize: inputBuffer.length,
      convertedSize: result.length,
      format: "jpeg",
    },
  };
}

module.exports = { heicToJpg };
