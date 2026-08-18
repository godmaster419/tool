"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Crop, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";
import { formatFileSize } from "@/lib/utils";

export default function CropToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();

  const [cropArea, setCropArea] = useState({ left: 0, top: 0, width: 400, height: 300 });

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("left", String(cropArea.left));
    formData.append("top", String(cropArea.top));
    formData.append("width", String(cropArea.width));
    formData.append("height", String(cropArea.height));
    await processing.processFile("/api/image/crop", formData, `cropped-${upload.file.name}`);
  }, [upload.file, cropArea, processing]);

  const handleReset = useCallback(() => {
    upload.reset();
    processing.reset();
    setCropArea({ left: 0, top: 0, width: 400, height: 300 });
  }, [upload, processing]);

  return (
    <ToolLayout title="Crop Image" description="Precisely crop your images to any dimension or aspect ratio" icon={Crop} gradient="from-violet-500 to-purple-600">
      {/* Upload */}
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to crop" />
      )}

      {/* Controls */}
      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />

          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Crop Area (pixels)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(["left", "top", "width", "height"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs text-text-muted uppercase mb-1 block">{field}</label>
                  <input type="number" value={cropArea[field]} onChange={(e) => setCropArea((p) => ({ ...p, [field]: Number(e.target.value) }))} className="glass-input w-full px-4 py-3 text-sm" min={0} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              {[{ label: "Square 500×500", v: { left: 0, top: 0, width: 500, height: 500 } }, { label: "16:9 (1280×720)", v: { left: 0, top: 0, width: 1280, height: 720 } }, { label: "4:3 (800×600)", v: { left: 0, top: 0, width: 800, height: 600 } }].map((preset) => (
                <button key={preset.label} onClick={() => setCropArea(preset.v)} className="text-xs px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all">
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"} glowColor="rgba(139, 92, 246, 0.4)">
              {processing.status === "processing" ? "Processing..." : "Crop Image"}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}>
              <RotateCcw size={16} /> Reset
            </FloatingButton>
          </div>
        </div>
      )}

      {/* Result */}
      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Result</h3>
            <div className="rounded-xl overflow-hidden bg-abyss">
              <img src={processing.resultUrl} alt="Cropped" className="w-full h-auto max-h-96 object-contain" />
            </div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "cropped.png"}>
              <FloatingButton glowColor="rgba(16, 185, 129, 0.4)">
                <Download size={18} /> Download
              </FloatingButton>
            </a>
            <FloatingButton variant="ghost" onClick={handleReset}>
              <RotateCcw size={16} /> Crop Another
            </FloatingButton>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400">{processing.error}</p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
