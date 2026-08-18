// ─── Bulk Image Resize Processor ────────────────────────────────
// Uses: sharp
// Resizes multiple images in parallel with the same target dimensions.

const sharp = require("sharp");

/**
 * Resize multiple images to the same dimensions.
 * @param {Array<{buffer: Buffer, filename: string}>} inputs - Array of image buffers with filenames.
 * @param {object} options
 * @param {number} options.width - Target width.
 * @param {number} [options.height] - Target height.
 * @param {"cover"|"contain"|"fill"|"inside"|"outside"} [options.fit] - Fit mode.
 * @returns {Promise<Array<{buffer: Buffer, filename: string, metadata: object}>>}
 */
async function bulkResizeImages(inputs, options) {
  const { width, height, fit = "inside" } = options;

  const results = await Promise.all(
    inputs.map(async ({ buffer, filename }) => {
      const originalMeta = await sharp(buffer).metadata();

      const resized = await sharp(buffer)
        .resize({
          width: Math.round(width),
          height: height ? Math.round(height) : undefined,
          fit,
          withoutEnlargement: false,
        })
        .toBuffer();

      const newMeta = await sharp(resized).metadata();

      // Generate output filename
      const ext = filename.lastIndexOf(".");
      const name = ext > 0 ? filename.slice(0, ext) : filename;
      const extension = ext > 0 ? filename.slice(ext) : ".jpg";
      const outputFilename = `${name}_${width}x${height || "auto"}${extension}`;

      return {
        buffer: resized,
        filename: outputFilename,
        metadata: {
          originalFilename: filename,
          originalWidth: originalMeta.width,
          originalHeight: originalMeta.height,
          newWidth: newMeta.width,
          newHeight: newMeta.height,
          originalSize: buffer.length,
          newSize: resized.length,
        },
      };
    })
  );

  return results;
}

module.exports = { bulkResizeImages };
