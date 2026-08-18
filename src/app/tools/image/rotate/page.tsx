"use client";

import { RotateCw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import ImageStudioEditor from "@/components/tools/ImageStudioEditor";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function RotateToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });

  return (
    <ToolLayout
      title="Rotate & Transform Studio"
      description="Rotate images by any angle, flip horizontally/vertically, crop, resize with sliders & set target KB size."
      icon={RotateCw}
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
          label="Drop an image to Rotate, Flip, Crop & Resize"
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
