// ─── Color Picker Processor ─────────────────────────────────────
// Uses: sharp
// Extracts dominant colors from an image using pixel sampling.

const sharp = require("sharp");

/**
 * Extract dominant colors from an image.
 * @param {Buffer} inputBuffer - The input image buffer.
 * @param {object} options
 * @param {number} [options.count] - Number of colors to extract (default 6).
 * @returns {Promise<{colors: Array<{hex: string, rgb: object, percentage: number}>}>}
 */
async function extractColors(inputBuffer, options) {
  const { count = 6 } = options;

  // Resize image to small size for faster color analysis
  const { data, info } = await sharp(inputBuffer)
    .resize(100, 100, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Simple color quantization via histogram binning
  const colorMap = new Map();
  const binSize = 32; // Group similar colors

  for (let i = 0; i < data.length; i += 3) {
    const r = Math.round(data[i] / binSize) * binSize;
    const g = Math.round(data[i + 1] / binSize) * binSize;
    const b = Math.round(data[i + 2] / binSize) * binSize;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  const totalPixels = info.width * info.height;

  // Sort by frequency and take top N
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

  const colors = sorted.map(([key, freq]) => {
    const [r, g, b] = key.split(",").map(Number);
    return {
      hex: `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
      rgb: { r, g, b },
      percentage: Math.round((freq / totalPixels) * 100),
    };
  });

  return { colors };
}

module.exports = { extractColors };
