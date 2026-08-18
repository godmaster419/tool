import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "png";
    const width = formData.get("width") ? Number(formData.get("width")) : undefined;
    const quality = Number(formData.get("quality") || 90);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("svg-convert.js", "convertSvg", buffer, { format, width, quality });
    const mimeType = format === "jpeg" || format === "jpg" ? "image/jpeg" : `image/${format}`;
    const ext = format === "jpeg" ? "jpg" : format;
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": mimeType, "Content-Disposition": `attachment; filename="${file.name.replace(/\.svg$/i, `.${ext}`)}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "SVG conversion failed" }, { status: 500 });
  }
}
