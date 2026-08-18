"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FlipHorizontal, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function FlipToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();
  const [direction, setDirection] = useState<"horizontal" | "vertical" | "both">("horizontal");

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("direction", direction);
    await processing.processFile("/api/image/flip", formData, `flipped-${upload.file.name}`);
  }, [upload.file, direction, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  return (
    <ToolLayout title="Flip Image" description="Flip images horizontally or vertically with one click" icon={FlipHorizontal} gradient="from-violet-500 to-purple-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to flip" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Direction</h3>
            <div className="flex gap-3">
              {(["horizontal", "vertical", "both"] as const).map((d) => (
                <button key={d} onClick={() => setDirection(d)} className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${direction === d ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white" : "bg-glass border border-glass-border text-text-secondary hover:text-text-primary"}`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>{processing.status === "processing" ? "Processing..." : "Flip Image"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Result</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Flipped" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "flipped.png"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Flip Another</FloatingButton>
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
