// ─── JPG to PNG Converter ───────────────────────────────────────
// Uses: sharp
// Converts JPEG images to PNG format.

const sharp = require("sharp");

/**
 * Convert a JPEG buffer to PNG.
 * @param {Buffer} inputBuffer - The JPEG image buffer.
 * @param {object} options
 * @param {number} [options.compressionLevel] - PNG compression 0-9 (default 6).
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function jpgToPng(inputBuffer, options = {}) {
  const { compressionLevel = 6 } = options;

  const result = await sharp(inputBuffer)
    .png({ compressionLevel })
    .toBuffer();

  const metadata = await sharp(result).metadata();

  return {
    buffer: result,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      originalSize: inputBuffer.length,
      convertedSize: result.length,
      format: "png",
    },
  };
}

module.exports = { jpgToPng };
