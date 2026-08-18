// ─── Image Enlarge (Upscale) Processor ──────────────────────────
// Uses: sharp
// Enlarges/upscales an image by a scale factor using Lanczos3 resampling.

const sharp = require("sharp");

/**
 * Enlarge an image buffer by a scale factor.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {object} options
 * @param {number} options.scale - Scale factor (e.g., 2 for 2x, 4 for 4x).
 * @param {number} [options.width] - Target width (overrides scale if set).
 * @param {number} [options.height] - Target height (overrides scale if set).
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function enlargeImage(inputBuffer, options) {
  const { scale = 2, width, height } = options;

  const metadata = await sharp(inputBuffer).metadata();
  const origWidth = metadata.width || 100;
  const origHeight = metadata.height || 100;

  const targetWidth = width || Math.round(origWidth * scale);
  const targetHeight = height || Math.round(origHeight * scale);

  const result = await sharp(inputBuffer)
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false, // allow upscaling
    })
    .toBuffer();

  return {
    buffer: result,
    metadata: {
      originalWidth: origWidth,
      originalHeight: origHeight,
      newWidth: targetWidth,
      newHeight: targetHeight,
      scale: scale,
    },
  };
}

module.exports = { enlargeImage };
