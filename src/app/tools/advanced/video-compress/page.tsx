"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Video, Download, RotateCcw, Settings2, FileVideo, HardDrive } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

type Quality = "low" | "medium" | "high" | "ultra";

const QUALITY_INFO: Record<Quality, { label: string; desc: string; bitrate: string }> = {
  low:    { label: "Low",    desc: "Maximum compression, smaller file", bitrate: "500 kbps" },
  medium: { label: "Medium", desc: "Balanced quality and file size",    bitrate: "1.5 Mbps" },
  high:   { label: "High",   desc: "High quality, moderate compression", bitrate: "3 Mbps" },
  ultra:  { label: "Ultra",  desc: "Minimal compression, large file",   bitrate: "5 Mbps" },
};

export default function VideoCompressToolPage() {
  const upload = useFileUpload({
    acceptedFormats: ["video/mp4", "video/webm", "video/quicktime", ".mp4", ".webm", ".mov"],
    maxSize: 500 * 1024 * 1024, // 500MB
  });
  const processing = useProcessing();
  const [quality, setQuality] = useState<Quality>("medium");

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("quality", quality);
    await processing.processFile("/api/advanced/video-compress", formData, `compressed-${upload.file.name}`);
  }, [upload.file, quality, processing]);

  const handleReset = useCallback(() => {
    upload.reset();
    processing.reset();
    setQuality("medium");
  }, [upload, processing]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <ToolLayout title="Video Compressor" description="Compress video files while maintaining visual quality" icon={Video} gradient="from-amber-500 to-yellow-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["video/mp4", "video/webm", "video/quicktime", ".mp4", ".webm", ".mov"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a video file to compress (up to 500MB)" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          {/* File info */}
          <div className="glass rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
              <FileVideo size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{upload.file.name}</p>
              <p className="text-xs text-text-muted flex items-center gap-2">
                <HardDrive size={12} />
                {formatSize(upload.file.size)}
              </p>
            </div>
            <button onClick={handleReset} className="text-text-muted hover:text-text-primary transition-colors"><RotateCcw size={16} /></button>
          </div>

          {/* Quality presets */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2"><Settings2 size={16} /> Quality Preset</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(QUALITY_INFO) as [Quality, typeof QUALITY_INFO[Quality]][]).map(([key, info]) => (
                <button key={key} onClick={() => setQuality(key)} className={`p-4 rounded-xl text-left transition-all ${quality === key ? "bg-neon-purple/20 border border-neon-purple/30" : "bg-glass border border-glass-border hover:border-glass-border-hover"}`}>
                  <div className={`text-sm font-semibold ${quality === key ? "text-neon-purple" : "text-text-primary"}`}>{info.label}</div>
                  <p className="text-xs text-text-muted mt-0.5">{info.desc}</p>
                  <p className="text-[10px] text-text-muted mt-1 opacity-60">{info.bitrate}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>
              {processing.status === "processing" ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Compressing Video...
                </>
              ) : (
                <>
                  <Video size={18} />
                  Compress Video
                </>
              )}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>

          {processing.status === "processing" && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm text-text-secondary">Compressing video with ffmpeg... This may take a few minutes for large files.</p>
            </div>
          )}
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Compression stats */}
          {processing.metadata && (() => {
            const m = processing.metadata as { originalSize?: number; compressedSize?: number; savings?: number; duration?: number };
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {m.originalSize != null && (
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-text-primary">{formatSize(m.originalSize)}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Original</div>
                  </div>
                )}
                {m.compressedSize != null && (
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-lg font-bold gradient-text">{formatSize(m.compressedSize)}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Compressed</div>
                  </div>
                )}
                {m.savings != null && (
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-neon-green">{m.savings}%</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Savings</div>
                  </div>
                )}
                {m.duration != null && (
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-text-primary">{m.duration}s</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Duration</div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Video preview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Compressed Video</h3>
            <div className="rounded-xl overflow-hidden bg-abyss">
              <video src={processing.resultUrl} controls className="w-full max-h-96" />
            </div>
          </div>

          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "compressed-video.mp4"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download Video</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Compress Another</FloatingButton>
          </div>
        </motion.div>
      )}

      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400">{processing.error}</p>
          <p className="text-xs text-text-muted mt-2">Make sure Python 3, moviepy, and ffmpeg are installed: <code className="text-neon-cyan">pip3 install moviepy &amp;&amp; brew install ffmpeg</code></p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
