// ─── PNG to JPG Converter ───────────────────────────────────────
// Uses: sharp
// Converts PNG images to JPEG format with alpha flattening.

const sharp = require("sharp");

/**
 * Convert a PNG buffer to JPEG.
 * @param {Buffer} inputBuffer - The PNG image buffer.
 * @param {object} options
 * @param {number} [options.quality] - JPEG quality 1-100 (default 90).
 * @param {string} [options.background] - Background color for transparency (default "#ffffff").
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function pngToJpg(inputBuffer, options = {}) {
  const { quality = 90, background = "#ffffff" } = options;

  const result = await sharp(inputBuffer)
    .flatten({ background }) // replace transparency with background
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

module.exports = { pngToJpg };
