import { NextRequest, NextResponse } from "next/server";
import { processUnifiedImageStudio, UnifiedStudioOptions } from "@/lib/processors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const optionsJson = formData.get("options") as string | null;
    let studioOptions: UnifiedStudioOptions = {};

    if (optionsJson) {
      try {
        studioOptions = JSON.parse(optionsJson);
      } catch {
        studioOptions = {};
      }
    } else {
      // Fallback to direct form data fields
      const width = formData.get("width") ? Number(formData.get("width")) : undefined;
      const height = formData.get("height") ? Number(formData.get("height")) : undefined;
      const scale = formData.get("scale") ? Number(formData.get("scale")) : undefined;
      const rotateAngle = formData.get("rotateAngle") ? Number(formData.get("rotateAngle")) : 0;
      const flipDirection = (formData.get("flipDirection") as UnifiedStudioOptions["flipDirection"]) || "none";
      const targetSizeKb = formData.get("targetSizeKb") ? Number(formData.get("targetSizeKb")) : undefined;
      const format = (formData.get("format") as "jpeg" | "png" | "webp") || undefined;
      const quality = formData.get("quality") ? Number(formData.get("quality")) : 85;

      studioOptions = {
        rotateAngle,
        flipDirection,
        resize: {
          width,
          height,
          scale,
          maintainAspectRatio: formData.get("maintainAspectRatio") !== "false",
        },
        targetSizeKb,
        format,
        quality,
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: resultBuffer, metadata } = await processUnifiedImageStudio(buffer, studioOptions);

    const ext = metadata.format === "png" ? "png" : metadata.format === "webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const outputFilename = `edited-${baseName}.${ext}`;

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        "Content-Type": metadata.format === "png" ? "image/png" : metadata.format === "webp" ? "image/webp" : "image/jpeg",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "X-Metadata": JSON.stringify(metadata),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unified image processing failed" },
      { status: 500 }
    );
  }
}
