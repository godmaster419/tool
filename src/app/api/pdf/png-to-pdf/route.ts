import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: result, metadata } = await runJsProcessor("image-to-pdf.js", "imagesToPdf", buffer, { pageSize: "fit" });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${file.name.replace(/\.png$/i, ".pdf")}"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Conversion failed" }, { status: 500 });
  }
}
