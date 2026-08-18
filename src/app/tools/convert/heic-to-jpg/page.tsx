"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { FileImage, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function HeicToJpgToolPage() {
  const upload = useFileUpload({ acceptedFormats: [".heic", ".heif", "image/heic", "image/heif"] });
  const processing = useProcessing();

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    await processing.processFile("/api/convert/heic-to-jpg", formData, upload.file.name.replace(/\.heic$/i, ".jpg"));
  }, [upload.file, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  return (
    <ToolLayout title="HEIC to JPG" description="Convert Apple HEIC photos to universally compatible JPG format" icon={FileImage} gradient="from-emerald-500 to-teal-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={[".heic", ".heif"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a HEIC file to convert" />
      )}

      {upload.file && processing.status === "idle" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} onRemove={handleReset} acceptedFormats={[]} />
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} glowColor="rgba(16, 185, 129, 0.4)">Convert to JPG</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "processing" && (
        <div className="glass rounded-2xl p-12 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-2 border-neon-green/30 border-t-neon-green rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Converting HEIC to JPG...</p>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Converted JPG</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Converted" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "converted.jpg"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download JPG</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Convert Another</FloatingButton>
          </div>
        </motion.div>
      )}

      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400">{processing.error}</p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
