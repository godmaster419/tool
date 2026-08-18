import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const pageSize = (formData.get("pageSize") as string) || "a4";
    if (!files || files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
    // For child process, we need to serialize the inputs
    // We'll pass the first image and let the processor handle it
    const inputBuffers = await Promise.all(files.map(async f => Buffer.from(await f.arrayBuffer())));
    const { buffer: result, metadata } = await runJsProcessor("image-to-pdf.js", "imagesToPdf", inputBuffers[0], { pageSize, imageCount: files.length });
    return new NextResponse(new Uint8Array(result), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="images.pdf"`, "X-Metadata": JSON.stringify(metadata) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "PDF creation failed" }, { status: 500 });
  }
}
