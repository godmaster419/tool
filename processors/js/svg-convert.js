// ─── SVG Converter ──────────────────────────────────────────────
// Uses: sharp
// Converts SVG files to raster formats (PNG, JPG, WebP).

const sharp = require("sharp");

/**
 * Convert an SVG buffer to a raster image format.
 * @param {Buffer} inputBuffer - The SVG buffer.
 * @param {object} options
 * @param {"png"|"jpeg"|"webp"} [options.format] - Output format (default "png").
 * @param {number} [options.width] - Output width in pixels.
 * @param {number} [options.height] - Output height in pixels.
 * @param {number} [options.density] - SVG rendering density/DPI (default 150).
 * @param {number} [options.quality] - Output quality for lossy formats (default 90).
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function convertSvg(inputBuffer, options) {
  const {
    format = "png",
    width,
    height,
    density = 150,
    quality = 90,
  } = options;

  let pipeline = sharp(inputBuffer, { density });

  // Resize if dimensions provided
  if (width || height) {
    pipeline = pipeline.resize({
      width: width ? Math.round(width) : undefined,
      height: height ? Math.round(height) : undefined,
      fit: "inside",
    });
  }

  // Convert to target format
  switch (format) {
    case "jpeg":
    case "jpg":
      pipeline = pipeline.flatten({ background: "#ffffff" }).jpeg({ quality });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "png":
    default:
      pipeline = pipeline.png();
      break;
  }

  const result = await pipeline.toBuffer();
  const metadata = await sharp(result).metadata();

  return {
    buffer: result,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      format,
      size: result.length,
    },
  };
}

module.exports = { convertSvg };
