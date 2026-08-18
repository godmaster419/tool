// ─── Image Flip Processor ───────────────────────────────────────
// Uses: sharp
// Flips an image horizontally (flop) or vertically (flip).

const sharp = require("sharp");

/**
 * Flip an image buffer.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {object} options
 * @param {"horizontal"|"vertical"|"both"} options.direction - Flip direction.
 * @returns {Promise<Buffer>} The flipped image buffer.
 */
async function flipImage(inputBuffer, options) {
  const { direction = "horizontal" } = options;

  let pipeline = sharp(inputBuffer);

  if (direction === "horizontal" || direction === "both") {
    pipeline = pipeline.flop(); // mirror horizontally
  }
  if (direction === "vertical" || direction === "both") {
    pipeline = pipeline.flip(); // mirror vertically
  }

  return pipeline.toBuffer();
}

module.exports = { flipImage };
