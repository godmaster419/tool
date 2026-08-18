import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const width = Number(formData.get("width") || 800);
    if (!files || files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
    // Process each file individually
    const results = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { buffer: result, metadata } = await runJsProcessor("image-resize.js", "resizeImage", buffer, { width, fit: "inside", maintainAspectRatio: true });
      results.push({ filename: `resized-${file.name}`, data: result.toString("base64"), metadata });
    }
    if (results.length === 1) {
      const buf = Buffer.from(results[0].data, "base64");
      return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg", "Content-Disposition": `attachment; filename="${results[0].filename}"` } });
    }
    return NextResponse.json({ results });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Bulk resize failed" }, { status: 500 });
  }
}
