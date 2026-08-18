// ─── OCR Image Processor ────────────────────────────────────────
// Uses: tesseract.js
// Extracts text from images using Tesseract OCR engine.

const Tesseract = require("tesseract.js");

/**
 * Extract text from an image buffer using OCR.
 * @param {Buffer} inputBuffer - The image buffer.
 * @param {object} options
 * @param {string} [options.language] - OCR language (default "eng").
 * @returns {Promise<{text: string, confidence: number, metadata: object}>}
 */
async function ocrImage(inputBuffer, options = {}) {
  const { language = "eng" } = options;

  const worker = await Tesseract.createWorker(language);

  const {
    data: { text, confidence, lines, words },
  } = await worker.recognize(inputBuffer);

  await worker.terminate();

  return {
    text: text.trim(),
    confidence: Math.round(confidence),
    metadata: {
      language,
      lineCount: lines?.length || 0,
      wordCount: words?.length || 0,
      characterCount: text.trim().length,
    },
  };
}

module.exports = { ocrImage };
