"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Download, RotateCcw, Settings2, X, ImageIcon } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

type Layout = "grid" | "horizontal" | "vertical";

export default function CollageToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"], multiple: true });
  const processing = useProcessing();
  const [layout, setLayout] = useState<Layout>("grid");
  const [cols, setCols] = useState(3);
  const [spacing, setSpacing] = useState(10);

  const handleProcess = useCallback(async () => {
    if (upload.files.length < 2) return;
    const formData = new FormData();
    upload.files.forEach((f) => formData.append("files", f));
    formData.append("layout", layout);
    formData.append("cols", String(cols));
    formData.append("spacing", String(spacing));
    await processing.processFile("/api/advanced/collage", formData, "collage.jpg");
  }, [upload.files, layout, cols, spacing, processing]);

  const handleReset = useCallback(() => {
    upload.reset();
    processing.reset();
    setLayout("grid");
    setCols(3);
    setSpacing(10);
  }, [upload, processing]);

  return (
    <ToolLayout title="Collage Maker" description="Create beautiful photo collages with customizable layouts" icon={LayoutGrid} gradient="from-amber-500 to-yellow-600">
      {upload.files.length === 0 && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop 2+ images to create a collage" multiple />
      )}

      {upload.files.length > 0 && processing.status !== "complete" && (
        <div className="space-y-6">
          {/* Image thumbnails */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Images ({upload.files.length})</h3>
              <span className="text-xs text-text-muted">Drag to reorder</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {upload.files.map((file, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="relative group aspect-square rounded-xl overflow-hidden bg-abyss">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                  <button onClick={() => upload.removeFile(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} className="text-white" />
                  </button>
                </motion.div>
              ))}
              {/* Add more button */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-glass-border flex flex-col items-center justify-center cursor-pointer hover:border-neon-purple/40 transition-colors">
                <ImageIcon size={20} className="text-text-muted" />
                <span className="text-[10px] text-text-muted mt-1">Add</span>
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => e.target.files && upload.onFileSelect(e.target.files)} />
              </label>
            </div>
          </div>

          {/* Layout settings */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2"><Settings2 size={16} /> Layout Settings</h3>
            <div className="space-y-5">
              {/* Layout type */}
              <div>
                <label className="text-xs text-text-muted mb-2 block">Layout</label>
                <div className="flex gap-2">
                  {(["grid", "horizontal", "vertical"] as const).map((l) => (
                    <button key={l} onClick={() => setLayout(l)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${layout === l ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Columns */}
                {layout === "grid" && (
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Columns ({cols})</label>
                    <input type="range" min={2} max={6} step={1} value={cols} onChange={(e) => setCols(Number(e.target.value))} className="w-full accent-neon-purple" />
                  </div>
                )}

                {/* Spacing */}
                <div>
                  <label className="text-xs text-text-muted mb-2 block">Spacing ({spacing}px)</label>
                  <input type="range" min={0} max={30} step={2} value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} className="w-full accent-neon-purple" />
                </div>
              </div>
            </div>
          </div>

          {upload.files.length < 2 && (
            <div className="glass rounded-xl p-4 border border-amber-500/20">
              <p className="text-sm text-amber-400">Please add at least 2 images to create a collage.</p>
            </div>
          )}

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing" || upload.files.length < 2}>
              {processing.status === "processing" ? "Creating Collage..." : `Create Collage (${upload.files.length} images)`}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Your Collage</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Collage" className="w-full h-auto max-h-[500px] object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "collage.jpg"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download Collage</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Create Another</FloatingButton>
          </div>
        </motion.div>
      )}

      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400">{processing.error}</p>
          <p className="text-xs text-text-muted mt-2">Make sure Python 3 and Pillow are installed: <code className="text-neon-cyan">pip3 install Pillow</code></p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
