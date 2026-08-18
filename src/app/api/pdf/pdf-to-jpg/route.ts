import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const page = Number(formData.get("page") || 1);
    const quality = Number(formData.get("quality") || 90);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("pdf-to-image.js", "pdfToImage", buffer, { page, format: "jpeg", quality });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "image/jpeg", "Content-Disposition": `attachment; filename="${file.name.replace(/\.pdf$/i, `-page${page}.jpg`)}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "PDF to JPG failed" }, { status: 500 });
  }
}
