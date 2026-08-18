"use client";

import { ImageIcon } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import ImageStudioEditor from "@/components/tools/ImageStudioEditor";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function ResizeToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });

  return (
    <ToolLayout
      title="Image Studio & Resizer"
      description="All-in-One Studio: Crop, Flip, Rotate, Resize with sliders & specify exact target file size in KB/MB."
      icon={ImageIcon}
      gradient="from-cyan-500 via-purple-600 to-pink-500"
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
          label="Drop an image to Crop, Flip, Rotate, Resize & Compress to Target KB"
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
