import { NextRequest, NextResponse } from "next/server";
import { runPythonProcessor } from "@/lib/processors";
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
    await fs.writeFile(inputPath, buffer);

    const args = [inputPath, outputPath];
    if (alphaMatting) args.push("--alpha-matting");

    const { stdout, stderr, code } = await runPythonProcessor("bg_remove.py", args);

    if (code !== 0) {
      throw new Error(stderr || "Background removal failed");
    }

    const resultBuffer = await fs.readFile(outputPath);
    const metadata = stdout.trim() ? JSON.parse(stdout.trim()) : {};

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
