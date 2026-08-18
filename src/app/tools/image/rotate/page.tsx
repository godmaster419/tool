"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCw, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function RotateToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();
  const [angle, setAngle] = useState(90);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("angle", String(angle));
    await processing.processFile("/api/image/rotate", formData, `rotated-${upload.file.name}`);
  }, [upload.file, angle, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); setAngle(90); }, [upload, processing]);

  return (
    <ToolLayout title="Rotate Image" description="Rotate images by any angle with precision controls" icon={RotateCw} gradient="from-violet-500 to-purple-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to rotate" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Rotation Angle</h3>
            <div className="flex items-center gap-6">
              <input type="range" min={-360} max={360} step={1} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="flex-1 accent-neon-purple" />
              <div className="flex items-center gap-2">
                <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="glass-input w-20 px-3 py-2 text-sm text-center" />
                <span className="text-text-muted text-sm">°</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {[90, 180, 270, -90, 45, -45].map((a) => (
                <button key={a} onClick={() => setAngle(a)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${angle === a ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary"}`}>
                  {a}°
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>{processing.status === "processing" ? "Processing..." : "Rotate Image"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Result</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Rotated" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "rotated.png"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Rotate Another</FloatingButton>
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
