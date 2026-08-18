// ─── Image to PDF Processor ─────────────────────────────────────
// Uses: pdf-lib
// Embeds one or more images into a PDF document.

const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");

/**
 * Convert one or more images into a PDF document.
 * @param {Array<Buffer>} imageBuffers - Array of image buffers.
 * @param {object} options
 * @param {"a4"|"letter"|"fit"} [options.pageSize] - Page size preset.
 * @param {number} [options.margin] - Page margin in points (default 36).
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
async function imagesToPdf(imageBuffers, options = {}) {
  const { pageSize = "a4", margin = 36 } = options;

  const pageSizes = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
  };

  const pdfDoc = await PDFDocument.create();

  for (const imgBuffer of imageBuffers) {
    // Get image metadata
    const metadata = await sharp(imgBuffer).metadata();
    const format = metadata.format;

    // Convert to PNG or JPEG for PDF embedding
    let processedBuffer;
    let embedFn;

    if (format === "png") {
      processedBuffer = imgBuffer;
      embedFn = pdfDoc.embedPng.bind(pdfDoc);
    } else {
      processedBuffer = await sharp(imgBuffer).jpeg({ quality: 95 }).toBuffer();
      embedFn = pdfDoc.embedJpg.bind(pdfDoc);
    }

    const image = await embedFn(processedBuffer);
    const imgWidth = image.width;
    const imgHeight = image.height;

    let pageWidth, pageHeight;

    if (pageSize === "fit") {
      // Page fits the image
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    } else {
      const preset = pageSizes[pageSize] || pageSizes.a4;
      pageWidth = preset.width;
      pageHeight = preset.height;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Scale image to fit within the page margins
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const scale = Math.min(
      availableWidth / imgWidth,
      availableHeight / imgHeight,
      1
    );

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    // Center the image
    const x = margin + (availableWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();

  return {
    buffer: Buffer.from(pdfBytes),
    metadata: {
      pageCount: imageBuffers.length,
      pageSize,
      totalSize: pdfBytes.length,
    },
  };
}

module.exports = { imagesToPdf };
