import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const direction = (formData.get("direction") as string) || "horizontal";
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result } = await runJsProcessor("image-flip.js", "flipImage", buffer, { direction });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": file.type || "image/png", "Content-Disposition": `attachment; filename="flipped-${file.name}"` },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Flip failed" }, { status: 500 });
  }
}
