// ─── Image Rotate Processor ─────────────────────────────────────
// Uses: sharp
// Rotates an image by a given angle with optional background color.

const sharp = require("sharp");

/**
 * Rotate an image buffer by the specified angle.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {object} options
 * @param {number} options.angle - Rotation angle in degrees (clockwise).
 * @param {string} [options.background] - Background color for uncovered areas (hex).
 * @returns {Promise<Buffer>} The rotated image buffer.
 */
async function rotateImage(inputBuffer, options) {
  const { angle = 90, background = "#00000000" } = options;

  // Parse hex color to RGBA
  const bg = parseHexColor(background);

  const result = await sharp(inputBuffer)
    .rotate(angle, { background: bg })
    .toBuffer();

  return result;
}

function parseHexColor(hex) {
  const clean = hex.replace("#", "");
  if (clean.length === 8) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
      alpha: parseInt(clean.slice(6, 8), 16) / 255,
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
      alpha: 1,
    };
  }
  return { r: 0, g: 0, b: 0, alpha: 0 };
}

module.exports = { rotateImage };
