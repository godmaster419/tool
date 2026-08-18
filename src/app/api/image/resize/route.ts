import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const width = Number(formData.get("width") || 800);
    const height = formData.get("height") ? Number(formData.get("height")) : undefined;
    const fit = (formData.get("fit") as string) || "inside";
    const maintainAspectRatio = formData.get("maintainAspectRatio") !== "false";
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("image-resize.js", "resizeImage", buffer, { width, height, fit, maintainAspectRatio });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": file.type || "image/png", "Content-Disposition": `attachment; filename="resized-${file.name}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Resize failed" }, { status: 500 });
  }
}
