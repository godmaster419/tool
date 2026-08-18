import { NextRequest, NextResponse } from "next/server";
import { generateNativeMeme } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const topText = (formData.get("topText") as string) || "";
    const bottomText = (formData.get("bottomText") as string) || "";
    const fontSize = Number(formData.get("fontSize") || 0.08);

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: resultBuffer, metadata } = await generateNativeMeme(
      buffer,
      topText,
      bottomText,
      fontSize
    );

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="meme-${file.name}"`,
        "X-Metadata": JSON.stringify(metadata),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Meme generation failed" },
      { status: 500 }
    );
  }
}
