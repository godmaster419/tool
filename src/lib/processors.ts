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

// ─── Core Image Processors ──────────────────────────────────────────

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
  const originalMeta = await sharp(inputBuffer).metadata();

  const resizeOptions: ResizeOptions = {
    width: Math.round(width),
    height: height ? Math.round(height) : undefined,
    fit: maintainAspectRatio ? fit : "fill",
    withoutEnlargement: false,
  };

  const result = await sharp(inputBuffer).resize(resizeOptions).toBuffer();
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
  const left = Math.max(0, Math.round(options.left ?? options.x ?? 0));
  const top = Math.max(0, Math.round(options.top ?? options.y ?? 0));
  const width = Math.max(1, Math.round(options.width ?? 100));
  const height = Math.max(1, Math.round(options.height ?? 100));

  const result = await sharp(inputBuffer)
    .extract({ left, top, width, height })
    .toBuffer();

  return { buffer: result, metadata: { left, top, width, height } };
}

export async function flipImage(
  inputBuffer: Buffer,
  options: { direction?: "horizontal" | "vertical" | "both" }
) {
  const { direction = "horizontal" } = options;
  let pipeline = sharp(inputBuffer);

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
  const { count = 6 } = options;
  const { data, info } = await sharp(inputBuffer)
    .resize(100, 100, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorMap = new Map<string, number>();
  const binSize = 32;

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
    return {
      hex: `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
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
  let pipeline = sharp(inputBuffer, { density });

  if (width || height) {
    pipeline = pipeline.resize({
      width: width ? Math.round(width) : undefined,
      height: height ? Math.round(height) : undefined,
      fit: "inside",
    });
  }

  if (format === "jpeg" || format === "jpg") {
    pipeline = pipeline.flatten({ background: "#ffffff" }).jpeg({ quality });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality });
  } else {
    pipeline = pipeline.png();
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
    const result = await sharp(inputBuffer).jpeg({ quality }).toBuffer();
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
    const metadata = await sharp(imgBuffer).metadata();
    const format = metadata.format;

    let processedBuffer: Buffer;
    let image;

    if (format === "png") {
      processedBuffer = imgBuffer;
      image = await pdfDoc.embedPng(processedBuffer);
    } else {
      processedBuffer = await sharp(imgBuffer).jpeg({ quality: 95 }).toBuffer();
      image = await pdfDoc.embedJpg(processedBuffer);
    }

    const imgWidth = image.width;
    const imgHeight = image.height;

    let pageWidth: number, pageHeight: number;
    if (pageSize === "fit") {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    } else {
      const preset = pageSizes[pageSize] || pageSizes.a4;
      pageWidth = preset.width;
      pageHeight = preset.height;
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
  const pdfDoc = await PDFDocument.load(inputBuffer, { updateMetadata: false });

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
      level,
    },
  };
}

// ─── OCR Processors ─────────────────────────────────────────────────

export async function ocrImage(
  inputBuffer: Buffer,
  options: { language?: string } = {}
) {
  const { language = "eng" } = options;
  const Tesseract = (await import("tesseract.js")).default || (await import("tesseract.js"));
  const worker = await Tesseract.createWorker(language);
  const { data } = await worker.recognize(inputBuffer);
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
  const meta = await sharp(inputBuffer).metadata();
  const width = meta.width || 800;
  const height = meta.height || 600;
  const fontSize = Math.max(24, Math.round(height * fontSizeRatio));

  const sanitize = (t: string) =>
    t.toUpperCase().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const topSvg = topText
    ? `<text x="50%" y="${fontSize + 15}" text-anchor="middle" font-family="Impact, sans-serif" font-size="${fontSize}px" font-weight="900" fill="white" stroke="black" stroke-width="${Math.max(3, fontSize / 12)}px">${sanitize(topText)}</text>`
    : "";

  const bottomSvg = bottomText
    ? `<text x="50%" y="${height - 25}" text-anchor="middle" font-family="Impact, sans-serif" font-size="${fontSize}px" font-weight="900" fill="white" stroke="black" stroke-width="${Math.max(3, fontSize / 12)}px">${sanitize(bottomText)}</text>`
    : "";

  const overlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${topSvg}
      ${bottomSvg}
    </svg>
  `);

  const result = await sharp(inputBuffer)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
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
      .resize(cellWidth, cellHeight, { fit: "cover" })
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
