import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "jpeg";
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("pdf-to-image.js", "pdfToImage", buffer, { page: 1, format });
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const ext = format === "png" ? "png" : "jpg";
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": mimeType, "Content-Disposition": `attachment; filename="converted.${ext}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Conversion failed" }, { status: 500 });
  }
}
