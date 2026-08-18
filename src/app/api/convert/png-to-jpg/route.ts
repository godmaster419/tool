import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const quality = Number(formData.get("quality") || 90);
    const background = (formData.get("background") as string) || "#ffffff";
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("png-to-jpg.js", "pngToJpg", buffer, { quality, background });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "image/jpeg", "Content-Disposition": `attachment; filename="${file.name.replace(/\.png$/i, ".jpg")}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Conversion failed" }, { status: 500 });
  }
}
