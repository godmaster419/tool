"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function JpgToPngToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg"] });
  const processing = useProcessing();

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    await processing.processFile("/api/convert/jpg-to-png", formData, upload.file.name.replace(/\.jpe?g$/i, ".png"));
  }, [upload.file, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  return (
    <ToolLayout title="JPG to PNG" description="Convert JPG images to PNG format with transparency support" icon={ArrowRightLeft} gradient="from-emerald-500 to-teal-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a JPG file to convert to PNG" />
      )}

      {upload.file && processing.status === "idle" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium">JPG</div>
            <ArrowRightLeft size={20} className="text-text-muted" />
            <div className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">PNG</div>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} glowColor="rgba(16, 185, 129, 0.4)">Convert to PNG</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "processing" && (
        <div className="glass rounded-2xl p-12 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-2 border-neon-green/30 border-t-neon-green rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Converting...</p>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Converted" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "converted.png"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download PNG</FloatingButton></a>
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
