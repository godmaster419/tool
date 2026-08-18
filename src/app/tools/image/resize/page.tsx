"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function ResizeToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("width", String(width));
    if (!maintainRatio) formData.append("height", String(height));
    formData.append("maintainAspectRatio", String(maintainRatio));
    await processing.processFile("/api/image/resize", formData, `resized-${upload.file.name}`);
  }, [upload.file, width, height, maintainRatio, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  return (
    <ToolLayout title="Image Resizer" description="Resize images to exact dimensions with quality control" icon={ImageIcon} gradient="from-cyan-500 to-blue-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to resize" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Dimensions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted uppercase mb-1 block">Width (px)</label>
                <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="glass-input w-full px-4 py-3 text-sm" min={1} />
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase mb-1 block">Height (px)</label>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="glass-input w-full px-4 py-3 text-sm" min={1} disabled={maintainRatio} />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="accent-neon-purple w-4 h-4" />
              <span className="text-sm text-text-secondary">Maintain aspect ratio</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-4">
              {[{ l: "Instagram", w: 1080, h: 1080 }, { l: "Facebook", w: 1200, h: 630 }, { l: "Twitter", w: 1600, h: 900 }, { l: "HD", w: 1920, h: 1080 }, { l: "4K", w: 3840, h: 2160 }, { l: "Thumbnail", w: 300, h: 300 }].map((p) => (
                <button key={p.l} onClick={() => { setWidth(p.w); setHeight(p.h); setMaintainRatio(false); }} className="text-xs px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-text-muted hover:text-text-primary transition-all">
                  {p.l} ({p.w}×{p.h})
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>{processing.status === "processing" ? "Resizing..." : "Resize Image"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Result</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Resized" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "resized.png"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Resize Another</FloatingButton>
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
