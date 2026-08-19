import sharp, { type ResizeOptions, type OverlayOptions } from "sharp";
import { PDFDocument } from "pdf-lib";
import path from "path";

// ─── Color Helper ──────────────────────────────────────────────────
function parseHexColor(hex: string) {
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

// ─── Unified Multi-Tool Image Studio & Target KB Optimizer ──────────

export interface UnifiedStudioOptions {
  crop?: { left: number; top: number; width: number; height: number };
  rotateAngle?: number;
  flipDirection?: "none" | "horizontal" | "vertical" | "both";
  resize?: {
    width?: number;
    height?: number;
    scale?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    maintainAspectRatio?: boolean;
  };
  targetSizeKb?: number;
  format?: "jpeg" | "png" | "webp";
  quality?: number;
}

export async function processUnifiedImageStudio(
  inputBuffer: Buffer,
  options: UnifiedStudioOptions
) {
  // Normalize EXIF orientation first
  let pipeline = sharp(inputBuffer).rotate();
  const originalMeta = await pipeline.metadata();
  const origW = originalMeta.width || 800;
  const origH = originalMeta.height || 600;

  // 1. Interactive Crop with Safe Clamping
  if (options.crop && options.crop.width > 0 && options.crop.height > 0) {
    const left = Math.max(0, Math.min(origW - 2, Math.round(options.crop.left)));
    const top = Math.max(0, Math.min(origH - 2, Math.round(options.crop.top)));
    const width = Math.max(1, Math.min(origW - left, Math.round(options.crop.width)));
    const height = Math.max(1, Math.min(origH - top, Math.round(options.crop.height)));
    pipeline = pipeline.extract({ left, top, width, height });
  }

  // 2. Rotate with Smooth Anti-Aliasing
  if (options.rotateAngle && options.rotateAngle !== 0) {
    pipeline = pipeline.rotate(options.rotateAngle, {
      background: options.format === "jpeg" ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  // 3. Flip / Flop
  if (options.flipDirection === "horizontal" || options.flipDirection === "both") {
    pipeline = pipeline.flop();
  }
  if (options.flipDirection === "vertical" || options.flipDirection === "both") {
    pipeline = pipeline.flip();
  }

  // Intermediate buffer after transformations
  let transformedBuffer = await pipeline.toBuffer();
  const currentMeta = await sharp(transformedBuffer).metadata();
  const currentW = currentMeta.width || origW;
  const currentH = currentMeta.height || origH;

  // 4. Resize with Sliders
  let targetWidth = currentW;
  let targetHeight = currentH;

  if (options.resize) {
    if (options.resize.scale && options.resize.scale !== 100) {
      const factor = options.resize.scale / 100;
      targetWidth = Math.max(16, Math.round(currentW * factor));
      targetHeight = Math.max(16, Math.round(currentH * factor));
    } else if (options.resize.width || options.resize.height) {
      if (options.resize.width && options.resize.height) {
        targetWidth = Math.max(16, Math.round(options.resize.width));
        targetHeight = Math.max(16, Math.round(options.resize.height));
      } else if (options.resize.width) {
        targetWidth = Math.max(16, Math.round(options.resize.width));
        targetHeight = options.resize.maintainAspectRatio !== false
          ? Math.round(currentH * (targetWidth / currentW))
          : currentH;
      } else if (options.resize.height) {
        targetHeight = Math.max(16, Math.round(options.resize.height));
        targetWidth = options.resize.maintainAspectRatio !== false
          ? Math.round(currentW * (targetHeight / currentH))
          : currentW;
      }
    }
  }

  // 5. Format & Target File Size (KB/MB) Optimization
  const targetFormat = options.format || (originalMeta.format === "png" ? "png" : "jpeg");
  let outputQuality = options.quality || 85;
  let finalBuffer: Buffer;

  if (options.targetSizeKb && options.targetSizeKb > 0) {
    const targetBytes = options.targetSizeKb * 1024;
    const formatForTarget = targetFormat === "png" && options.targetSizeKb < 150 ? "jpeg" : targetFormat;

    // Binary search for optimal quality between 5 and 95
    let lowQ = 5;
    let highQ = 95;
    let bestBuffer: Buffer | null = null;
    let currentScale = 1.0;

    for (let attempt = 0; attempt < 12; attempt++) {
      const midQ = Math.round((lowQ + highQ) / 2);
      const testW = Math.max(16, Math.round(targetWidth * currentScale));
      const testH = Math.max(16, Math.round(targetHeight * currentScale));

      let testPipeline = sharp(transformedBuffer).resize(testW, testH, {
        fit: options.resize?.maintainAspectRatio !== false ? "inside" : "fill",
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false,
      });

      if (formatForTarget === "jpeg") {
        if (currentMeta.hasAlpha) {
          testPipeline = testPipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
        }
        testPipeline = testPipeline.jpeg({ quality: midQ, mozjpeg: true });
      } else if (formatForTarget === "webp") {
        testPipeline = testPipeline.webp({ quality: midQ, effort: 4 });
      } else {
        testPipeline = testPipeline.png({ compressionLevel: 9, palette: midQ < 60 });
      }

      const testBuf = await testPipeline.toBuffer();

      if (testBuf.length <= targetBytes) {
        bestBuffer = testBuf;
        lowQ = midQ + 1; // Try higher quality
      } else {
        highQ = midQ - 1; // Needs lower quality
      }

      // If even at minimum quality it exceeds target size, reduce resolution scale
      if (highQ < lowQ && !bestBuffer && currentScale > 0.3) {
        currentScale *= 0.82;
        lowQ = 10;
        highQ = 80;
      }
    }

    if (bestBuffer) {
      finalBuffer = bestBuffer;
    } else {
      // Fallback
      let fallbackPipeline = sharp(transformedBuffer)
        .resize(Math.max(16, Math.round(targetWidth * 0.5)), Math.max(16, Math.round(targetHeight * 0.5)), {
          fit: options.resize?.maintainAspectRatio !== false ? "inside" : "fill",
          kernel: sharp.kernel.lanczos3,
        });
      if (currentMeta.hasAlpha) {
        fallbackPipeline = fallbackPipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
      }
      finalBuffer = await fallbackPipeline.jpeg({ quality: 25, mozjpeg: true }).toBuffer();
    }
  } else {
    // Normal single-pass render
    let renderPipeline = sharp(transformedBuffer).resize(targetWidth, targetHeight, {
      fit: options.resize?.maintainAspectRatio !== false ? "inside" : "fill",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    });

    if (targetFormat === "jpeg") {
      if (currentMeta.hasAlpha) {
        renderPipeline = renderPipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
      }
      renderPipeline = renderPipeline.jpeg({ quality: outputQuality, mozjpeg: true });
    } else if (targetFormat === "webp") {
      renderPipeline = renderPipeline.webp({ quality: outputQuality });
    } else {
      renderPipeline = renderPipeline.png({ quality: outputQuality, compressionLevel: 8 });
    }

    finalBuffer = await renderPipeline.toBuffer();
  }

  const finalMeta = await sharp(finalBuffer).metadata();

  return {
    buffer: finalBuffer,
    metadata: {
      originalWidth: origW,
      originalHeight: origH,
      finalWidth: finalMeta.width || targetWidth,
      finalHeight: finalMeta.height || targetHeight,
      originalSize: inputBuffer.length,
      originalSizeKb: Math.round(inputBuffer.length / 1024),
      finalSize: finalBuffer.length,
      finalSizeKb: Math.round(finalBuffer.length / 1024),
      targetSizeKb: options.targetSizeKb || null,
      savings: Math.round((1 - finalBuffer.length / inputBuffer.length) * 100),
      format: targetFormat,
    },
  };
}


export async function resizeImage(
  inputBuffer: Buffer,
  options: {
    width?: number;
    height?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    maintainAspectRatio?: boolean;
  }
) {
  const { width = 800, height, fit = "inside", maintainAspectRatio = true } = options;
  const originalMeta = await sharp(inputBuffer).rotate().metadata();

  const resizeOptions: ResizeOptions = {
    width: Math.round(width),
    height: height ? Math.round(height) : undefined,
    fit: maintainAspectRatio ? fit : "fill",
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: false,
  };

  const result = await sharp(inputBuffer).rotate().resize(resizeOptions).toBuffer();
  const newMeta = await sharp(result).metadata();

  return {
    buffer: result,
    metadata: {
      originalWidth: originalMeta.width,
      originalHeight: originalMeta.height,
      newWidth: newMeta.width,
      newHeight: newMeta.height,
      originalSize: inputBuffer.length,
      newSize: result.length,
    },
  };
}

export async function cropImage(
  inputBuffer: Buffer,
  options: { left?: number; top?: number; width?: number; height?: number; x?: number; y?: number }
) {
  const meta = await sharp(inputBuffer).rotate().metadata();
  const origW = meta.width || 800;
  const origH = meta.height || 600;

  const rawLeft = Math.round(options.left ?? options.x ?? 0);
  const rawTop = Math.round(options.top ?? options.y ?? 0);
  const rawWidth = Math.round(options.width ?? 100);
  const rawHeight = Math.round(options.height ?? 100);

  const left = Math.max(0, Math.min(origW - 2, rawLeft));
  const top = Math.max(0, Math.min(origH - 2, rawTop));
  const width = Math.max(1, Math.min(origW - left, rawWidth));
  const height = Math.max(1, Math.min(origH - top, rawHeight));

  const result = await sharp(inputBuffer)
    .rotate()
    .extract({ left, top, width, height })
    .toBuffer();

  return { buffer: result, metadata: { left, top, width, height } };
}

export async function flipImage(
  inputBuffer: Buffer,
  options: { direction?: "horizontal" | "vertical" | "both" }
) {
  const { direction = "horizontal" } = options;
  let pipeline = sharp(inputBuffer).rotate();

  if (direction === "horizontal" || direction === "both") {
    pipeline = pipeline.flop();
  }
  if (direction === "vertical" || direction === "both") {
    pipeline = pipeline.flip();
  }

  const result = await pipeline.toBuffer();
  return { buffer: result, metadata: { direction } };
}

export async function rotateImage(
  inputBuffer: Buffer,
  options: { angle?: number; background?: string }
) {
  const { angle = 90, background = "#00000000" } = options;
  const bg = parseHexColor(background);

  const result = await sharp(inputBuffer)
    .rotate(angle, { background: bg })
    .toBuffer();

  return { buffer: result, metadata: { angle } };
}

export async function enlargeImage(
  inputBuffer: Buffer,
  options: { scale?: number; width?: number; height?: number }
) {
  const { scale = 2, width, height } = options;
  const metadata = await sharp(inputBuffer).metadata();
  const origWidth = metadata.width || 100;
  const origHeight = metadata.height || 100;

  const targetWidth = width || Math.round(origWidth * scale);
  const targetHeight = height || Math.round(origHeight * scale);

  const result = await sharp(inputBuffer)
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .toBuffer();

  return {
    buffer: result,
    metadata: {
      originalWidth: origWidth,
      originalHeight: origHeight,
      newWidth: targetWidth,
      newHeight: targetHeight,
      scale,
    },
  };
}

export async function compressImage(
  inputBuffer: Buffer,
  options: {
    quality?: number;
    format?: "jpeg" | "jpg" | "png" | "webp" | "avif";
    maxWidth?: number;
  }
) {
  const { quality = 80, format, maxWidth } = options;
  const metadata = await sharp(inputBuffer).metadata();
  const detectedFormat = format || metadata.format || "jpeg";

  let pipeline = sharp(inputBuffer);

  if (maxWidth && metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  switch (detectedFormat) {
    case "jpeg":
    case "jpg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ quality, compressionLevel: 9, palette: quality < 50 });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality, effort: 6 });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality, effort: 6 });
      break;
    default:
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const result = await pipeline.toBuffer();
  return {
    buffer: result,
    metadata: {
      originalSize: inputBuffer.length,
      compressedSize: result.length,
      savings: Math.round((1 - result.length / inputBuffer.length) * 100),
      format: detectedFormat,
      quality,
    },
  };
}

export async function extractColors(
  inputBuffer: Buffer,
  options: { count?: number } = {}
) {
  const { count = 8 } = options;
  const { data, info } = await sharp(inputBuffer)
    .resize(120, 120, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorMap = new Map<string, number>();
  const binSize = 24; // Finer color quantization for accurate tone capture

  for (let i = 0; i < data.length; i += 3) {
    const r = Math.round(data[i] / binSize) * binSize;
    const g = Math.round(data[i + 1] / binSize) * binSize;
    const b = Math.round(data[i + 2] / binSize) * binSize;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  const totalPixels = info.width * info.height;
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

  const colors = sorted.map(([key, freq]) => {
    const [r, g, b] = key.split(",").map(Number);
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    return {
      hex,
      rgb: { r, g, b },
      percentage: Math.round((freq / totalPixels) * 100),
    };
  });

  return { buffer: Buffer.alloc(0), metadata: { colors } };
}

export async function pngToJpg(
  inputBuffer: Buffer,
  options: { quality?: number; background?: string } = {}
) {
  const { quality = 90, background = "#ffffff" } = options;
  const result = await sharp(inputBuffer)
    .flatten({ background })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  const metadata = await sharp(result).metadata();
  return {
    buffer: result,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      originalSize: inputBuffer.length,
      convertedSize: result.length,
      format: "jpeg",
    },
  };
}

export async function jpgToPng(
  inputBuffer: Buffer,
  options: { compressionLevel?: number } = {}
) {
  const { compressionLevel = 6 } = options;
  const result = await sharp(inputBuffer).png({ compressionLevel }).toBuffer();
  const metadata = await sharp(result).metadata();
  return {
    buffer: result,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      originalSize: inputBuffer.length,
      convertedSize: result.length,
      format: "png",
    },
  };
}

export async function convertSvg(
  inputBuffer: Buffer,
  options: {
    format?: "png" | "jpeg" | "jpg" | "webp";
    width?: number;
    height?: number;
    density?: number;
    quality?: number;
  } = {}
) {
  const { format = "png", width, height, density = 150, quality = 90 } = options;

  // 1. Sanitize SVG and add fallback viewBox if missing
  let svgStr = inputBuffer.toString("utf8");
  svgStr = svgStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");

  if (!svgStr.includes("viewBox") && !svgStr.includes("viewbox")) {
    svgStr = svgStr.replace(/<svg\b/i, '<svg viewBox="0 0 800 600" ');
  }

  const safeBuffer = Buffer.from(svgStr, "utf8");
  let pipeline = sharp(safeBuffer, { density });

  if (width || height) {
    pipeline = pipeline.resize({
      width: width ? Math.round(width) : undefined,
      height: height ? Math.round(height) : undefined,
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
    });
  }

  if (format === "jpeg" || format === "jpg") {
    pipeline = pipeline.flatten({ background: "#ffffff" }).jpeg({ quality, mozjpeg: true });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality });
  } else {
    pipeline = pipeline.png({ compressionLevel: 8 });
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

export async function heicToJpg(
  inputBuffer: Buffer,
  options: { quality?: number } = {}
) {
  const { quality = 92 } = options;
  try {
    // @ts-expect-error heic-convert lacks bundled ts types
    const heicModule = await import("heic-convert");
    const convert = heicModule.default || heicModule;
    const jpegBuffer = await convert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: quality / 100,
    });
    const result = await sharp(Buffer.from(jpegBuffer))
      .toColorspace("srgb")
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    const metadata = await sharp(result).metadata();
    return {
      buffer: result,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        originalSize: inputBuffer.length,
        convertedSize: result.length,
        format: "jpeg",
      },
    };
  } catch {
    const result = await sharp(inputBuffer)
      .toColorspace("srgb")
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    const metadata = await sharp(result).metadata();
    return {
      buffer: result,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        originalSize: inputBuffer.length,
        convertedSize: result.length,
        format: "jpeg",
      },
    };
  }
}

// ─── PDF Processors ─────────────────────────────────────────────────

export async function imagesToPdf(
  inputBuffers: Buffer | Buffer[],
  options: { pageSize?: "a4" | "letter" | "fit"; margin?: number; imageCount?: number } = {}
) {
  const { pageSize = "a4", margin = 36 } = options;
  const buffers = Array.isArray(inputBuffers) ? inputBuffers : [inputBuffers];

  const pageSizes = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
  };

  const pdfDoc = await PDFDocument.create();

  for (const imgBuffer of buffers) {
    const rawMeta = await sharp(imgBuffer).metadata();
    const isPng = rawMeta.format === "png" && !rawMeta.hasAlpha;

    let image;
    if (isPng) {
      const cleanPng = await sharp(imgBuffer).png().toBuffer();
      image = await pdfDoc.embedPng(cleanPng);
    } else {
      // Flatten any transparency to pure white and normalize color space to sRGB
      const cleanJpg = await sharp(imgBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .toColorspace("srgb")
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
      image = await pdfDoc.embedJpg(cleanJpg);
    }

    const imgWidth = image.width;
    const imgHeight = image.height;

    let pageWidth: number, pageHeight: number;
    if (pageSize === "fit") {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    } else {
      const preset = pageSizes[pageSize] || pageSizes.a4;
      // Auto-orient page to landscape if image is wide
      if (imgWidth > imgHeight) {
        pageWidth = preset.height;
        pageHeight = preset.width;
      } else {
        pageWidth = preset.width;
        pageHeight = preset.height;
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight, 1);

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const x = margin + (availableWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;

    page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
  }

  const pdfBytes = await pdfDoc.save();
  const result = Buffer.from(pdfBytes);

  return {
    buffer: result,
    metadata: {
      pageCount: buffers.length,
      pageSize,
      totalSize: result.length,
    },
  };
}

export async function compressPdf(
  inputBuffer: Buffer,
  options: { level?: "low" | "medium" | "high" } = {}
) {
  const { level = "medium" } = options;
  let pdfDoc: PDFDocument;

  try {
    pdfDoc = await PDFDocument.load(inputBuffer, {
      updateMetadata: false,
      ignoreEncryption: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("encrypt") || msg.includes("password")) {
      throw new Error("This PDF is password-protected or encrypted. Please remove the password before compressing.");
    }
    throw new Error("Invalid or corrupted PDF file. Please ensure the file is a standard PDF.");
  }

  if (level === "high") {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
  }

  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const result = Buffer.from(compressedBytes);
  return {
    buffer: result,
    metadata: {
      originalSize: inputBuffer.length,
      compressedSize: result.length,
      savings: Math.max(0, Math.round((1 - result.length / inputBuffer.length) * 100)),
      pageCount: pdfDoc.getPageCount(),
    },
  };
}

// ─── OCR Processors ─────────────────────────────────────────────────

export async function ocrImage(
  inputBuffer: Buffer,
  options: { language?: string } = {}
) {
  const { language = "eng" } = options;

  // Pre-process image for optimal OCR recognition (grayscale + contrast normalization + sharpen)
  const preprocessedBuffer = await sharp(inputBuffer)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.5 })
    .toBuffer();

  const Tesseract = (await import("tesseract.js")).default || (await import("tesseract.js"));
  const worker = await Tesseract.createWorker(language);
  const { data } = await worker.recognize(preprocessedBuffer);
  await worker.terminate();

  return {
    buffer: Buffer.alloc(0),
    metadata: {
      text: data.text.trim(),
      confidence: Math.round(data.confidence),
      language,
      lineCount: (data as unknown as { lines?: unknown[] }).lines?.length || 0,
      wordCount: (data as unknown as { words?: unknown[] }).words?.length || 0,
      characterCount: data.text.trim().length,
    },
  };
}

// ─── Native Creative Tools (Zero-Python Fallback / Standalone) ────────

export async function generateNativeMeme(
  inputBuffer: Buffer,
  topText: string = "",
  bottomText: string = "",
  fontSizeRatio: number = 0.08
) {
  const meta = await sharp(inputBuffer).rotate().metadata();
  const width = meta.width || 800;
  const height = meta.height || 600;
  const fontSize = Math.max(24, Math.round(height * fontSizeRatio));

  const sanitize = (t: string) =>
    t
      .toUpperCase()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  // Helper for multi-line SVG text
  const formatSvgText = (text: string, yStart: number) => {
    if (!text.trim()) return "";
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const w of words) {
      if ((currentLine + " " + w).length > 28) {
        if (currentLine) lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = currentLine ? `${currentLine} ${w}` : w;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines
      .map(
        (line, idx) =>
          `<text x="50%" y="${yStart + idx * (fontSize * 1.15)}" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="${fontSize}px" font-weight="900" fill="white" stroke="black" stroke-width="${Math.max(3, fontSize / 10)}px" paint-order="stroke fill">${sanitize(line)}</text>`
      )
      .join("\n");
  };

  const topSvg = formatSvgText(topText, fontSize + 15);
  const bottomLinesCount = bottomText.length > 28 ? Math.ceil(bottomText.length / 28) : 1;
  const bottomStartY = height - 25 - (bottomLinesCount - 1) * (fontSize * 1.15);
  const bottomSvg = formatSvgText(bottomText, bottomStartY);

  const overlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${topSvg}
      ${bottomSvg}
    </svg>
  `);

  const result = await sharp(inputBuffer)
    .rotate()
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  return {
    buffer: result,
    metadata: {
      width,
      height,
      topText,
      bottomText,
      size: result.length,
    },
  };
}

export async function generateNativeCollage(
  imageBuffers: Buffer[],
  options: {
    layout?: "grid" | "horizontal" | "vertical";
    cols?: number;
    spacing?: number;
    cellWidth?: number;
    cellHeight?: number;
  } = {}
) {
  const {
    layout = "grid",
    cols = 3,
    spacing = 12,
    cellWidth = 400,
    cellHeight = 400,
  } = options;

  const count = imageBuffers.length;
  if (count === 0) throw new Error("No images provided");
  if (count > 16) throw new Error("Please select up to 16 images for collage generation to maintain performance.");

  let computedCols = cols;
  let computedRows = Math.ceil(count / cols);

  if (layout === "horizontal") {
    computedCols = count;
    computedRows = 1;
  } else if (layout === "vertical") {
    computedCols = 1;
    computedRows = count;
  }

  const canvasWidth = computedCols * cellWidth + (computedCols + 1) * spacing;
  const canvasHeight = computedRows * cellHeight + (computedRows + 1) * spacing;

  const composites: OverlayOptions[] = [];

  for (let idx = 0; idx < count; idx++) {
    const row = Math.floor(idx / computedCols);
    const col = idx % computedCols;

    const cellImg = await sharp(imageBuffers[idx])
      .rotate()
      .resize(cellWidth, cellHeight, { fit: "cover", kernel: sharp.kernel.lanczos3 })
      .toBuffer();

    composites.push({
      input: cellImg,
      left: spacing + col * (cellWidth + spacing),
      top: spacing + row * (cellHeight + spacing),
    });
  }

  const result = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 3,
      background: { r: 18, g: 18, b: 32 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toBuffer();

  return {
    buffer: result,
    metadata: {
      width: canvasWidth,
      height: canvasHeight,
      imageCount: count,
      layout,
      cols: computedCols,
      rows: computedRows,
      size: result.length,
    },
  };
}

// ─── Central Dispatcher: runJsProcessor ─────────────────────────────

export async function runJsProcessor(
  processorFile: string,
  functionName: string,
  inputBuffer: Buffer,
  options: Record<string, unknown> = {}
): Promise<{ buffer: Buffer; metadata: Record<string, unknown> }> {
  switch (functionName) {
    case "resizeImage":
      return resizeImage(inputBuffer, options as Parameters<typeof resizeImage>[1]);
    case "cropImage":
      return cropImage(inputBuffer, options as Parameters<typeof cropImage>[1]);
    case "flipImage":
      return flipImage(inputBuffer, options as Parameters<typeof flipImage>[1]);
    case "rotateImage":
      return rotateImage(inputBuffer, options as Parameters<typeof rotateImage>[1]);
    case "enlargeImage":
      return enlargeImage(inputBuffer, options as Parameters<typeof enlargeImage>[1]);
    case "compressImage":
      return compressImage(inputBuffer, options as Parameters<typeof compressImage>[1]);
    case "extractColors":
      return extractColors(inputBuffer, options as Parameters<typeof extractColors>[1]);
    case "pngToJpg":
      return pngToJpg(inputBuffer, options as Parameters<typeof pngToJpg>[1]);
    case "jpgToPng":
      return jpgToPng(inputBuffer, options as Parameters<typeof jpgToPng>[1]);
    case "convertSvg":
      return convertSvg(inputBuffer, options as Parameters<typeof convertSvg>[1]);
    case "heicToJpg":
      return heicToJpg(inputBuffer, options as Parameters<typeof heicToJpg>[1]);
    case "imagesToPdf":
      return imagesToPdf(inputBuffer, options as Parameters<typeof imagesToPdf>[1]);
    case "compressPdf":
      return compressPdf(inputBuffer, options as Parameters<typeof compressPdf>[1]);
    case "ocrImage":
      return ocrImage(inputBuffer, options as Parameters<typeof ocrImage>[1]);
    default:
      return resizeImage(inputBuffer, options as Parameters<typeof resizeImage>[1]);
  }
}

// ─── Safe Python Runner with Fallback Support ───────────────────────

export async function runPythonProcessor(
  script: string,
  args: string[]
): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { exec } = await import("child_process");
    const scriptPath = path.join(process.cwd(), "processors", "python", script);
    const escapedArgs = args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(" ");

    return await new Promise((resolve) => {
      exec(
        `python3 "${scriptPath}" ${escapedArgs}`,
        {
          maxBuffer: 100 * 1024 * 1024,
          timeout: 120000,
        },
        (error, stdout, stderr) => {
          if (error) {
            resolve({ stdout: stdout || "", stderr: stderr || error.message, code: 1 });
          } else {
            resolve({ stdout: stdout || "", stderr: stderr || "", code: 0 });
          }
        }
      );
    });
  } catch (err: unknown) {
    return { stdout: "", stderr: err instanceof Error ? err.message : "Python unavailable", code: 1 };
  }
}
