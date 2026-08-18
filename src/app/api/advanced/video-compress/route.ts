import { NextRequest, NextResponse } from "next/server";
import { runPythonProcessor } from "@/lib/processors";
import path from "path";
import fs from "fs/promises";
import os from "os";

export async function POST(request: NextRequest) {
  const tmpDir = os.tmpdir();
  const id = `vidcomp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const inputPath = path.join(tmpDir, `${id}-input.mp4`);
  const outputPath = path.join(tmpDir, `${id}-output.mp4`);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const quality = (formData.get("quality") as string) || "medium";
    const maxWidth = formData.get("maxWidth") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    const args = [inputPath, outputPath, "--quality", quality];
    if (maxWidth) args.push("--max-width", maxWidth);

    const { stdout, stderr, code } = await runPythonProcessor("video_compress.py", args);

    if (code !== 0) {
      throw new Error(stderr || "Video compression failed");
    }

    const resultBuffer = await fs.readFile(outputPath);
    const metadata = stdout.trim() ? JSON.parse(stdout.trim()) : {};

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
        "X-Metadata": JSON.stringify(metadata),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Video compression failed" },
      { status: 500 }
    );
  } finally {
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);
  }
}
