import { NextRequest, NextResponse } from "next/server";
import { runPythonProcessor } from "@/lib/processors";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import os from "os";

export async function POST(request: NextRequest) {
  const tmpDir = os.tmpdir();
  const id = `bgrem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const inputPath = path.join(tmpDir, `${id}-input`);
  const outputPath = path.join(tmpDir, `${id}-output.png`);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const alphaMatting = formData.get("alphaMatting") === "true";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Try Python U2Net first
    let resultBuffer: Buffer | null = null;
    let metadata: Record<string, unknown> = {};

    try {
      await fs.writeFile(inputPath, buffer);
      const args = [inputPath, outputPath];
      if (alphaMatting) args.push("--alpha-matting");

      const { stdout, code } = await runPythonProcessor("bg_remove.py", args);
      if (code === 0) {
        resultBuffer = await fs.readFile(outputPath);
        metadata = stdout.trim() ? JSON.parse(stdout.trim()) : {};
      }
    } catch {
      // Python unavailable (e.g. Vercel Serverless environment)
    }

    // Fallback: Smart Sharp Alpha Cutout (Works 100% on Vercel without Python)
    if (!resultBuffer) {
      const img = sharp(buffer);
      const meta = await img.metadata();
      const width = meta.width || 800;
      const height = meta.height || 600;

      // Extract raw pixels to calculate background color from corners
      const raw = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const data = raw.data;

      // Sample 4 corners to detect background color
      const corners = [
        0, // top-left
        (width - 1) * 4, // top-right
        (width * (height - 1)) * 4, // bottom-left
        (width * height - 1) * 4, // bottom-right
      ];

      let bgR = 0, bgG = 0, bgB = 0;
      for (const idx of corners) {
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      }
      bgR = Math.round(bgR / 4);
      bgG = Math.round(bgG / 4);
      bgB = Math.round(bgB / 4);

      // Create alpha mask by color distance thresholding
      const threshold = 38;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (dist < threshold) {
          data[i + 3] = 0; // Transparent
        } else if (dist < threshold + 20) {
          data[i + 3] = Math.round(((dist - threshold) / 20) * 255); // Soft antialiased edge
        }
      }

      resultBuffer = await sharp(data, {
        raw: { width, height, channels: 4 },
      })
        .png()
        .toBuffer();

      metadata = {
        width,
        height,
        originalSize: buffer.length,
        outputSize: resultBuffer.length,
        engine: "Smart Sharp Alpha Mask",
      };
    }

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="nobg-${file.name.replace(/\.[^.]+$/, ".png")}"`,
        "X-Metadata": JSON.stringify(metadata),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Background removal failed" },
      { status: 500 }
    );
  } finally {
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);
  }
}
