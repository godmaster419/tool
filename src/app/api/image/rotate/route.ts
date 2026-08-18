import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const angle = Number(formData.get("angle") || 90);
    const background = (formData.get("background") as string) || "#00000000";
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result } = await runJsProcessor("image-rotate.js", "rotateImage", buffer, { angle, background });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="rotated-${file.name}"` },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Rotate failed" }, { status: 500 });
  }
}
