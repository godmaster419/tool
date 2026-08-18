"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Maximize, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function EnlargeToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();
  const [scale, setScale] = useState(2);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("scale", String(scale));
    await processing.processFile("/api/image/enlarge", formData, `enlarged-${upload.file.name}`);
  }, [upload.file, scale, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); setScale(2); }, [upload, processing]);

  return (
    <ToolLayout title="Image Enlarge" description="Upscale and enlarge images while preserving quality with Lanczos3" icon={Maximize} gradient="from-violet-500 to-purple-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to enlarge" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Scale Factor</h3>
            <div className="flex gap-3">
              {[1.5, 2, 3, 4].map((s) => (
                <button key={s} onClick={() => setScale(s)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${scale === s ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg" : "bg-glass border border-glass-border text-text-secondary hover:text-text-primary"}`}>
                  {s}x
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-3">Higher scale factors produce larger files. 2x is recommended for best quality-to-size ratio.</p>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>{processing.status === "processing" ? "Enlarging..." : `Enlarge ${scale}x`}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Enlarged Result ({scale}x)</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Enlarged" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "enlarged.png"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Enlarge Another</FloatingButton>
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
