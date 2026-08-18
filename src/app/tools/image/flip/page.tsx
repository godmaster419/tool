"use client";

import { FlipHorizontal } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import ImageStudioEditor from "@/components/tools/ImageStudioEditor";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function FlipToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });

  return (
    <ToolLayout
      title="Flip & Multi-Tool Studio"
      description="Mirror images horizontally or vertically with 1-click, rotate, crop, resize with sliders & set target file size in KB/MB."
      icon={FlipHorizontal}
      gradient="from-violet-500 to-purple-600"
    >
      {!upload.file ? (
        <FileDropzone
          onFiles={upload.onFileSelect}
          acceptedFormats={["image/jpeg", "image/png", "image/webp"]}
          isDragging={upload.isDragging}
          onDragOver={upload.onDragOver}
          onDragLeave={upload.onDragLeave}
          onDrop={upload.onDrop}
          error={upload.error}
          label="Drop an image to Flip, Rotate, Crop & Resize"
        />
      ) : (
        <ImageStudioEditor
          file={upload.file}
          previewUrl={upload.preview || ""}
          onReset={upload.reset}
        />
      )}
    </ToolLayout>
  );
}
