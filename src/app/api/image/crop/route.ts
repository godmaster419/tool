import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const left = Number(formData.get("left") || 0);
    const top = Number(formData.get("top") || 0);
    const width = Number(formData.get("width") || 0);
    const height = Number(formData.get("height") || 0);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!width || !height) return NextResponse.json({ error: "Width and height are required" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result } = await runJsProcessor("image-crop.js", "cropImage", buffer, { left, top, width, height });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": file.type || "image/png", "Content-Disposition": `attachment; filename="cropped-${file.name}"` },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Crop failed" }, { status: 500 });
  }
}
