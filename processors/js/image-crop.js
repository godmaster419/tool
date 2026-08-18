// ─── Image Crop Processor ───────────────────────────────────────
// Uses: sharp
// Crops an image to the specified region (left, top, width, height).

const sharp = require("sharp");

/**
 * Crop an image buffer to the specified region.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {object} options - Crop options.
 * @param {number} options.left - X offset from the left edge.
 * @param {number} options.top - Y offset from the top edge.
 * @param {number} options.width - Width of the crop region.
 * @param {number} options.height - Height of the crop region.
 * @returns {Promise<Buffer>} The cropped image buffer.
 */
async function cropImage(inputBuffer, options) {
  const { left, top, width, height } = options;

  const result = await sharp(inputBuffer)
    .extract({
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(width),
      height: Math.round(height),
    })
    .toBuffer();

  return result;
}

module.exports = { cropImage };
