"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Maximize, Download, RotateCcw, Sparkles, ArrowUp } from "lucide-react";
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
    <ToolLayout title="Image Enlarge" description="Upscale and enlarge images while preserving quality with Lanczos3 interpolation." icon={Maximize} gradient="from-violet-500 to-purple-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to enlarge" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-5">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />

          <div className="studio-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <ArrowUp size={13} className="text-neon-purple" /> Scale Factor
            </h3>

            <div className="grid grid-cols-4 gap-2.5">
              {[1.5, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`relative p-3.5 rounded-xl text-center transition-all border ${
                    scale === s
                      ? "bg-gradient-to-b from-neon-purple/20 to-neon-purple/5 border-neon-purple/40 shadow-lg shadow-neon-purple/15"
                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <motion.span
                    className={`block text-lg font-extrabold ${
                      scale === s ? "text-neon-purple" : "text-text-secondary"
                    }`}
                    animate={scale === s ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {s}x
                  </motion.span>
                  {scale === s && (
                    <motion.div
                      layoutId="scale-indicator"
                      className="absolute inset-x-0 -bottom-px h-[2px] bg-neon-purple rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-text-muted flex items-center gap-1.5">
              <Sparkles size={11} className="text-neon-purple" />
              {scale}x will upscale your image using Lanczos3 interpolation for best quality.
              {scale >= 3 && <span className="text-neon-orange font-semibold ml-1">Large output files expected.</span>}
            </p>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>
              {processing.status === "processing" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Enlarging...
                </>
              ) : (
                <>
                  <Maximize size={16} /> Enlarge {scale}x
                </>
              )}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={15} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="studio-panel result-shimmer rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
              <ArrowUp size={12} className="text-neon-green" /> Enlarged Result ({scale}x)
            </h3>
            <div className="rounded-xl overflow-hidden bg-checkerboard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={processing.resultUrl} alt="Enlarged" className="w-full h-auto max-h-96 object-contain" />
            </div>
          </div>

          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "enlarged.png"}>
              <FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={17} /> Download</FloatingButton>
            </a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={15} /> Enlarge Another</FloatingButton>
          </div>
        </motion.div>
      )}

      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="studio-panel rounded-2xl p-5" style={{ borderColor: "rgba(239, 68, 68, 0.25)" }}>
          <p className="text-red-400 text-sm font-medium">{processing.error}</p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-3">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
