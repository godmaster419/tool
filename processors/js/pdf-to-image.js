// ─── PDF to Image Processor ─────────────────────────────────────
// Uses: pdf2pic
// Renders PDF pages as JPG or PNG images.

const { fromBuffer } = require("pdf2pic");

/**
 * Convert PDF pages to images.
 * @param {Buffer} inputBuffer - The PDF buffer.
 * @param {object} options
 * @param {"png"|"jpeg"} [options.format] - Output image format (default "png").
 * @param {number} [options.density] - DPI for rendering (default 150).
 * @param {number} [options.width] - Output width in pixels (default 1200).
 * @param {number[]} [options.pages] - Specific pages to convert (1-indexed). Empty = all pages.
 * @returns {Promise<Array<{buffer: Buffer, page: number, width: number, height: number}>>}
 */
async function pdfToImages(inputBuffer, options = {}) {
  const {
    format = "png",
    density = 150,
    width = 1200,
    pages = [],
  } = options;

  const converter = fromBuffer(inputBuffer, {
    density,
    saveFilename: "page",
    savePath: "/tmp",
    format: format === "jpeg" ? "jpg" : "png",
    width,
    preserveAspectRatio: true,
  });

  const results = [];

  if (pages.length > 0) {
    // Convert specific pages
    for (const pageNum of pages) {
      try {
        const result = await converter(pageNum, { responseType: "buffer" });
        if (result && result.buffer) {
          results.push({
            buffer: result.buffer,
            page: pageNum,
            width: result.width || width,
            height: result.height || 0,
          });
        }
      } catch {
        // Skip pages that fail to render
      }
    }
  } else {
    // Convert all pages — try up to 200 pages
    for (let i = 1; i <= 200; i++) {
      try {
        const result = await converter(i, { responseType: "buffer" });
        if (result && result.buffer) {
          results.push({
            buffer: result.buffer,
            page: i,
            width: result.width || width,
            height: result.height || 0,
          });
        } else {
          break;
        }
      } catch {
        break; // No more pages
      }
    }
  }

  return results;
}

module.exports = { pdfToImages };
