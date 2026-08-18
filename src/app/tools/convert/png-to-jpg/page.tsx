"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function PngToJpgToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/png"] });
  const processing = useProcessing();
  const [quality, setQuality] = useState(90);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("quality", String(quality));
    await processing.processFile("/api/convert/png-to-jpg", formData, upload.file.name.replace(/\.png$/i, ".jpg"));
  }, [upload.file, quality, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); setQuality(90); }, [upload, processing]);

  return (
    <ToolLayout title="PNG to JPG" description="Convert PNG images to compressed JPG format" icon={ArrowRightLeft} gradient="from-emerald-500 to-teal-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/png"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a PNG file to convert to JPG" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">PNG</div>
              <ArrowRightLeft size={20} className="text-text-muted" />
              <div className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium">JPG</div>
            </div>
            <label className="text-xs text-text-muted uppercase mb-1 block">JPG Quality: {quality}%</label>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-neon-green" />
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"} glowColor="rgba(16, 185, 129, 0.4)">{processing.status === "processing" ? "Converting..." : "Convert to JPG"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
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
