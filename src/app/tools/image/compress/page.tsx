"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Minimize2, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";
import { formatFileSize } from "@/lib/utils";

export default function CompressToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();
  const [quality, setQuality] = useState(80);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("quality", String(quality));
    await processing.processFile("/api/image/compress", formData, `compressed-${upload.file.name}`);
  }, [upload.file, quality, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); setQuality(80); }, [upload, processing]);

  const metadata = processing.metadata as { savings?: number; originalSize?: number; compressedSize?: number } | null;

  return (
    <ToolLayout title="Image Compressor" description="Compress images to reduce file size without visible quality loss" icon={Minimize2} gradient="from-cyan-500 to-blue-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to compress" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Quality: {quality}%</h3>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-neon-cyan" />
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>Smallest file</span>
              <span>Best quality</span>
            </div>
            <div className="flex gap-2 mt-4">
              {[{ l: "Low", v: 40 }, { l: "Medium", v: 65 }, { l: "High", v: 80 }, { l: "Best", v: 95 }].map((p) => (
                <button key={p.l} onClick={() => setQuality(p.v)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${quality === p.v ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary"}`}>
                  {p.l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"} glowColor="rgba(6, 182, 212, 0.4)">{processing.status === "processing" ? "Compressing..." : "Compress Image"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Savings display */}
          {metadata?.savings !== undefined && (
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-1">{metadata.savings}%</div>
              <p className="text-sm text-text-muted">file size reduced</p>
              {metadata.originalSize && metadata.compressedSize && (
                <p className="text-xs text-text-muted mt-2">
                  {formatFileSize(metadata.originalSize)} → {formatFileSize(metadata.compressedSize)}
                </p>
              )}
            </div>
          )}
          <div className="glass rounded-2xl p-6">
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Compressed" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "compressed.jpg"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Compress Another</FloatingButton>
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
