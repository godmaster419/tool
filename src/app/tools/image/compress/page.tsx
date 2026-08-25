"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Minimize2, Download, RotateCcw, TrendingDown, FileImage } from "lucide-react";
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
    <ToolLayout title="Image Compressor" description="Compress images to reduce file size without visible quality loss using MozJPEG & advanced algorithms." icon={Minimize2} gradient="from-cyan-500 to-blue-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to compress" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-5">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />

          <div className="studio-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Compression Quality</h3>
              <span className="font-bold text-neon-cyan text-base tabular-nums">{quality}%</span>
            </div>

            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="slider-cyan"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-semibold uppercase tracking-wider">
              <span>Smallest file</span>
              <span>Best quality</span>
            </div>

            <div className="flex gap-2">
              {[{ l: "Low", v: 40 }, { l: "Medium", v: 65 }, { l: "High", v: 80 }, { l: "Best", v: 95 }].map((p) => (
                <button
                  key={p.l}
                  onClick={() => setQuality(p.v)}
                  className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${
                    quality === p.v
                      ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30 shadow-sm shadow-neon-cyan/15"
                      : "bg-white/[0.02] border-white/[0.06] text-text-muted hover:text-text-primary"
                  }`}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"} glowColor="rgba(6, 182, 212, 0.4)">
              {processing.status === "processing" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Compressing...
                </>
              ) : (
                <>
                  <Minimize2 size={16} /> Compress Image
                </>
              )}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={15} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Savings Banner */}
          {metadata?.savings !== undefined && (
            <div className="studio-panel result-shimmer rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingDown size={20} className="text-neon-green" />
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="text-4xl font-extrabold text-neon-green tabular-nums"
                >
                  {metadata.savings}%
                </motion.span>
              </div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-widest">File Size Reduced</p>
              {metadata.originalSize && metadata.compressedSize && (
                <p className="text-xs text-text-muted mt-2">
                  <span className="text-text-secondary">{formatFileSize(metadata.originalSize)}</span>
                  <span className="mx-2 text-neon-green">→</span>
                  <span className="text-neon-green font-bold">{formatFileSize(metadata.compressedSize)}</span>
                </p>
              )}
            </div>
          )}

          {/* Result Image */}
          <div className="studio-panel rounded-2xl p-5">
            <div className="rounded-xl overflow-hidden bg-checkerboard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={processing.resultUrl} alt="Compressed" className="w-full h-auto max-h-96 object-contain" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "compressed.jpg"}>
              <FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={17} /> Download</FloatingButton>
            </a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={15} /> Compress Another</FloatingButton>
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
