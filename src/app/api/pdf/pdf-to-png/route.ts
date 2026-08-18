import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const page = Number(formData.get("page") || 1);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("pdf-to-image.js", "pdfToImage", buffer, { page, format: "png" });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="${file.name.replace(/\.pdf$/i, `-page${page}.png`)}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "PDF to PNG failed" }, { status: 500 });
  }
}
