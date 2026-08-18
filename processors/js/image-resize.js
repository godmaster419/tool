// ─── Image Resize Processor ─────────────────────────────────────
// Uses: sharp
// Resizes an image to specific dimensions with various fit modes.

const sharp = require("sharp");

/**
 * Resize an image buffer.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {object} options
 * @param {number} options.width - Target width in pixels.
 * @param {number} [options.height] - Target height in pixels.
 * @param {"cover"|"contain"|"fill"|"inside"|"outside"} [options.fit] - Fit mode.
 * @param {boolean} [options.maintainAspectRatio] - Whether to maintain aspect ratio.
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function resizeImage(inputBuffer, options) {
  const { width, height, fit = "inside", maintainAspectRatio = true } = options;

  const originalMeta = await sharp(inputBuffer).metadata();

  const resizeOptions = {
    width: Math.round(width),
    height: height ? Math.round(height) : undefined,
    fit: maintainAspectRatio ? fit : "fill",
    withoutEnlargement: false,
  };

  const result = await sharp(inputBuffer).resize(resizeOptions).toBuffer();

  const newMeta = await sharp(result).metadata();

  return {
    buffer: result,
    metadata: {
      originalWidth: originalMeta.width,
      originalHeight: originalMeta.height,
      newWidth: newMeta.width,
      newHeight: newMeta.height,
      originalSize: inputBuffer.length,
      newSize: result.length,
    },
  };
}

module.exports = { resizeImage };
