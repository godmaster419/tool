import { NextRequest, NextResponse } from "next/server";
import { runJsProcessor } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const count = Number(formData.get("count") || 6);
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { metadata } = await runJsProcessor("color-picker.js", "extractColors", buffer, { count });
    return NextResponse.json(metadata);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Color extraction failed" }, { status: 500 });
  }
}
