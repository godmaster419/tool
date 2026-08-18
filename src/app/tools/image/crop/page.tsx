"use client";

import { Crop } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import ImageStudioEditor from "@/components/tools/ImageStudioEditor";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function CropToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });

  return (
    <ToolLayout
      title="Crop & Multi-Tool Studio"
      description="Interactive image cropping with aspect ratio presets, flip, rotate, slider resizing & target KB compression."
      icon={Crop}
      gradient="from-violet-500 via-purple-600 to-cyan-500"
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
          label="Drop an image to Crop, Flip, Rotate & Resize"
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
