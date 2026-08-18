import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("pdf-compress.js", "compressPdf", buffer);
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="compressed-${file.name}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "PDF compression failed" }, { status: 500 });
  }
}
