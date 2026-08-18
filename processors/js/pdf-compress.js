// ─── PDF Compress Processor ─────────────────────────────────────
// Uses: pdf-lib
// Compresses a PDF by removing unused objects and optimizing streams.

const { PDFDocument } = require("pdf-lib");

/**
 * Compress a PDF buffer by removing unused objects.
 * @param {Buffer} inputBuffer - The input PDF buffer.
 * @param {object} options
 * @param {"low"|"medium"|"high"} [options.level] - Compression level.
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function compressPdf(inputBuffer, options = {}) {
  const { level = "medium" } = options;

  // Load and re-save the PDF (removes unused objects)
  const pdfDoc = await PDFDocument.load(inputBuffer, {
    updateMetadata: false,
  });

  // Remove metadata for additional savings in high compression
  if (level === "high") {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
  }

  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true, // enables cross-reference streams
    addDefaultPage: false,
  });

  const result = Buffer.from(compressedBytes);

  return {
    buffer: result,
    metadata: {
      originalSize: inputBuffer.length,
      compressedSize: result.length,
      savings: Math.round((1 - result.length / inputBuffer.length) * 100),
      pageCount: pdfDoc.getPageCount(),
      level,
    },
  };
}

module.exports = { compressPdf };
