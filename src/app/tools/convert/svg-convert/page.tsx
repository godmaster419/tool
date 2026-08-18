"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileType, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function SvgConvertToolPage() {
  const upload = useFileUpload({ acceptedFormats: [".svg", "image/svg+xml"] });
  const processing = useProcessing();
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [width, setWidth] = useState(1024);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("format", format);
    formData.append("width", String(width));
    const ext = format === "jpeg" ? "jpg" : format;
    await processing.processFile("/api/convert/svg-convert", formData, upload.file.name.replace(/\.svg$/i, `.${ext}`));
  }, [upload.file, format, width, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  return (
    <ToolLayout title="SVG Converter" description="Convert SVG files to PNG, JPG, or WebP raster formats" icon={FileType} gradient="from-emerald-500 to-teal-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={[".svg", "image/svg+xml"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an SVG file to convert" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Output Format</h3>
            <div className="flex gap-3 mb-4">
              {(["png", "jpeg", "webp"] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${format === f ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : "bg-glass border border-glass-border text-text-secondary hover:text-text-primary"}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <label className="text-xs text-text-muted uppercase mb-1 block">Output Width (px)</label>
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="glass-input w-40 px-4 py-3 text-sm" min={1} />
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"} glowColor="rgba(16, 185, 129, 0.4)">{processing.status === "processing" ? "Converting..." : `Convert to ${format.toUpperCase()}`}</FloatingButton>
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
            <a href={processing.resultUrl} download={processing.resultFilename}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download {format.toUpperCase()}</FloatingButton></a>
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
