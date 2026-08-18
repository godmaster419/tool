import { NextRequest, NextResponse } from "next/server";
import { generateNativeCollage } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const layout = (formData.get("layout") as "grid" | "horizontal" | "vertical") || "grid";
    const cols = Number(formData.get("cols") || 3);
    const spacing = Number(formData.get("spacing") || 12);
    const cellWidth = Number(formData.get("cellWidth") || 400);
    const cellHeight = Number(formData.get("cellHeight") || 400);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length < 2) {
      return NextResponse.json({ error: "Please upload at least 2 images" }, { status: 400 });
    }

    const buffers: Buffer[] = [];
    for (const f of files) {
      buffers.push(Buffer.from(await f.arrayBuffer()));
    }

    const { buffer: resultBuffer, metadata } = await generateNativeCollage(buffers, {
      layout,
      cols,
      spacing,
      cellWidth,
      cellHeight,
    });

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="collage.jpg"`,
        "X-Metadata": JSON.stringify(metadata),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Collage creation failed" },
      { status: 500 }
    );
  }
}
