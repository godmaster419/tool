import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const quality = Number(formData.get("quality") || 80);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("image-compress.js", "compressImage", buffer, { quality });
    const format = (metadata.format as string) || "jpeg";
    const ext = format === "jpeg" ? "jpg" : format;
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": `image/${format}`, "Content-Disposition": `attachment; filename="compressed.${ext}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Compression failed" }, { status: 500 });
  }
}
