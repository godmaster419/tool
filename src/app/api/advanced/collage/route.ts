import { NextRequest, NextResponse } from "next/server";
import { runPythonProcessor } from "@/lib/processors";
import path from "path";
import fs from "fs/promises";
import os from "os";

export async function POST(request: NextRequest) {
  const tmpDir = os.tmpdir();
  const id = `collage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const outputPath = path.join(tmpDir, `${id}-output.jpg`);
  const inputPaths: string[] = [];

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const layout = (formData.get("layout") as string) || "grid";
    const cols = (formData.get("cols") as string) || "3";
    const spacing = (formData.get("spacing") as string) || "10";
    const cellWidth = (formData.get("cellWidth") as string) || "400";
    const cellHeight = (formData.get("cellHeight") as string) || "400";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length < 2) {
      return NextResponse.json({ error: "Please upload at least 2 images" }, { status: 400 });
    }

    // Write all images to temp files
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(tmpDir, `${id}-img-${i}`);
      const buffer = Buffer.from(await files[i].arrayBuffer());
      await fs.writeFile(filePath, buffer);
      inputPaths.push(filePath);
    }

    const args = [
      "--images", ...inputPaths,
      "--output", outputPath,
      "--layout", layout,
      "--cols", cols,
      "--spacing", spacing,
      "--cell-width", cellWidth,
      "--cell-height", cellHeight,
    ];

    const { stdout, stderr, code } = await runPythonProcessor("collage_maker.py", args);

    if (code !== 0) {
      throw new Error(stderr || "Collage creation failed");
    }

    const resultBuffer = await fs.readFile(outputPath);
    const metadata = stdout.trim() ? JSON.parse(stdout.trim()) : {};

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="collage.jpg"`,
        "X-Metadata": JSON.stringify(metadata),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Collage creation failed" },
      { status: 500 }
    );
  } finally {
    await Promise.allSettled([
      ...inputPaths.map((p) => fs.unlink(p)),
      fs.unlink(outputPath),
    ]);
  }
}
