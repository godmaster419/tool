// ─── OCR PDF Processor ──────────────────────────────────────────
// Uses: pdf2pic + tesseract.js
// Renders PDF pages to images, then runs OCR on each page.

const { fromBuffer } = require("pdf2pic");
const Tesseract = require("tesseract.js");

/**
 * Extract text from a PDF using OCR.
 * @param {Buffer} inputBuffer - The PDF buffer.
 * @param {object} options
 * @param {string} [options.language] - OCR language (default "eng").
 * @param {number} [options.density] - Rendering DPI (default 200).
 * @returns {Promise<{text: string, pages: Array, metadata: object}>}
 */
async function ocrPdf(inputBuffer, options = {}) {
  const { language = "eng", density = 200 } = options;

  // Render PDF pages to images
  const converter = fromBuffer(inputBuffer, {
    density,
    saveFilename: "ocr_page",
    savePath: "/tmp",
    format: "png",
    width: 1600,
    preserveAspectRatio: true,
  });

  const worker = await Tesseract.createWorker(language);
  const pages = [];
  let fullText = "";

  for (let i = 1; i <= 200; i++) {
    try {
      const result = await converter(i, { responseType: "buffer" });
      if (!result || !result.buffer) break;

      const { data } = await worker.recognize(result.buffer);

      pages.push({
        page: i,
        text: data.text.trim(),
        confidence: Math.round(data.confidence),
      });

      fullText += `--- Page ${i} ---\n${data.text.trim()}\n\n`;
    } catch {
      break;
    }
  }

  await worker.terminate();

  return {
    text: fullText.trim(),
    pages,
    metadata: {
      language,
      pageCount: pages.length,
      totalCharacters: fullText.trim().length,
      averageConfidence:
        pages.length > 0
          ? Math.round(
              pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length
            )
          : 0,
    },
  };
}

module.exports = { ocrPdf };
