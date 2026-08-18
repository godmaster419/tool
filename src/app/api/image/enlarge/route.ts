import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const scale = Number(formData.get("scale") || 2);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("image-enlarge.js", "enlargeImage", buffer, { scale });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": file.type || "image/png", "Content-Disposition": `attachment; filename="enlarged-${file.name}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Enlarge failed" }, { status: 500 });
  }
}
