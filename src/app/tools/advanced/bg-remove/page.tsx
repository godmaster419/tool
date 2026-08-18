"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eraser,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  Copy,
  Layers,
  Zap,
  SplitSquareVertical,
  Palette,
} from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import ImageCompareSlider from "@/components/ui/ImageCompareSlider";
import BackgroundReplacer from "@/components/ui/BackgroundReplacer";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function BgRemoveToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();
  const [alphaMatting, setAlphaMatting] = useState(false);
  const [activeTab, setActiveTab] = useState<"compare" | "studio">("compare");
  const [copied, setCopied] = useState(false);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("alphaMatting", String(alphaMatting));
    await processing.processFile(
      "/api/advanced/bg-remove",
      formData,
      `nobg-${upload.file.name.replace(/\.[^.]+$/, ".png")}`
    );
  }, [upload.file, alphaMatting, processing]);

  const handleReset = useCallback(() => {
    upload.reset();
    processing.reset();
    setAlphaMatting(false);
    setActiveTab("compare");
    setCopied(false);
  }, [upload, processing]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!processing.resultUrl) return;
    try {
      const response = await fetch(processing.resultUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  }, [processing.resultUrl]);

  return (
    <ToolLayout
      title="AI Background Remover"
      description="Instant pixel-perfect background cutout powered by U2Net AI Neural Networks."
      icon={Eraser}
      gradient="from-amber-500 via-purple-600 to-cyan-500"
    >
      {/* Upload Stage */}
      {!upload.file && (
        <FileDropzone
          onFiles={upload.onFileSelect}
          acceptedFormats={["image/jpeg", "image/png", "image/webp"]}
          isDragging={upload.isDragging}
          onDragOver={upload.onDragOver}
          onDragLeave={upload.onDragLeave}
          onDrop={upload.onDrop}
          error={upload.error}
          label="Drop an image to remove background with AI"
        />
      )}

      {/* Selected & Processing Stage */}
      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone
            onFiles={upload.onFileSelect}
            file={upload.file}
            preview={upload.preview}
            onRemove={handleReset}
            acceptedFormats={[]}
          />

          {/* AI Settings */}
          <div className="glass rounded-2xl p-6 border border-glass-border">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders size={16} className="text-neon-purple" /> Precision Settings
            </h3>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`w-11 h-6 rounded-full relative transition-colors mt-0.5 ${
                  alphaMatting ? "bg-neon-purple" : "bg-glass-border"
                }`}
                onClick={() => setAlphaMatting(!alphaMatting)}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    alphaMatting ? "left-6" : "left-1"
                  }`}
                />
              </div>
              <div>
                <span className="text-sm font-semibold text-text-primary group-hover:text-neon-purple transition-colors">
                  Alpha Matting (Fine-Edge Precision)
                </span>
                <p className="text-xs text-text-muted mt-0.5">
                  Ultra-detailed edge extraction tailored for fine hair strands, fur, feathers, and transparent objects.
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <FloatingButton
              onClick={handleProcess}
              disabled={processing.status === "processing"}
              size="lg"
              glowColor="rgba(168, 85, 247, 0.5)"
            >
              {processing.status === "processing" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  AI Neural Model Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Remove Background
                </>
              )}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}>
              <RotateCcw size={16} /> Reset
            </FloatingButton>
          </div>

          {/* Animated Processing Indicator */}
          {processing.status === "processing" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 text-center space-y-3 border border-neon-purple/30 bg-neon-purple/5"
            >
              <div className="flex items-center justify-center gap-2 text-neon-purple font-medium text-sm">
                <Zap size={16} className="animate-pulse" />
                <span>Running U2Net Deep Neural Segmentation...</span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-blue rounded-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: "60%" }}
                />
              </div>
              <p className="text-xs text-text-muted">
                Extracting foreground mask and calculating alpha matte...
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Result Stage */}
      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 p-1.5 glass rounded-xl border border-glass-border w-fit">
            <button
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === "compare"
                  ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/30"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <SplitSquareVertical size={14} />
              <span>Interactive Comparison</span>
            </button>
            <button
              onClick={() => setActiveTab("studio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === "studio"
                  ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/30"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Palette size={14} />
              <span>Custom Backdrop Studio</span>
            </button>
          </div>

          {/* Active View */}
          <AnimatePresence mode="wait">
            {activeTab === "compare" && upload.preview && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <ImageCompareSlider
                  originalImage={upload.preview}
                  processedImage={processing.resultUrl}
                  originalLabel="Original Photo"
                  processedLabel="Clean Cutout"
                />
              </motion.div>
            )}

            {activeTab === "studio" && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <BackgroundReplacer
                  transparentImageUrl={processing.resultUrl}
                  originalFileName={upload.file?.name || "cutout.png"}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata Badges */}
          {processing.metadata && (() => {
            const m = processing.metadata as {
              width?: number;
              height?: number;
              originalSize?: number;
              outputSize?: number;
              mode?: string;
            };
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {m.width && (
                  <div className="glass rounded-xl p-4 text-center border border-glass-border">
                    <div className="text-base font-bold gradient-text">{m.width} × {m.height}</div>
                    <div className="text-[11px] text-text-muted uppercase tracking-wider mt-1">Resolution</div>
                  </div>
                )}
                {m.originalSize && (
                  <div className="glass rounded-xl p-4 text-center border border-glass-border">
                    <div className="text-base font-bold text-text-primary">{(m.originalSize / 1024).toFixed(0)} KB</div>
                    <div className="text-[11px] text-text-muted uppercase tracking-wider mt-1">Original Size</div>
                  </div>
                )}
                {m.outputSize && (
                  <div className="glass rounded-xl p-4 text-center border border-glass-border">
                    <div className="text-base font-bold text-neon-cyan">{(m.outputSize / 1024).toFixed(0)} KB</div>
                    <div className="text-[11px] text-text-muted uppercase tracking-wider mt-1">PNG Cutout</div>
                  </div>
                )}
                <div className="glass rounded-xl p-4 text-center border border-glass-border">
                  <div className="text-base font-bold text-neon-green flex items-center justify-center gap-1">
                    <CheckCircle2 size={15} /> AI U2Net
                  </div>
                  <div className="text-[11px] text-text-muted uppercase tracking-wider mt-1">Neural Engine</div>
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a href={processing.resultUrl} download={processing.resultFilename || "nobg.png"}>
              <FloatingButton glowColor="rgba(16, 185, 129, 0.4)">
                <Download size={18} /> Download HD PNG
              </FloatingButton>
            </a>
            <FloatingButton variant="secondary" onClick={handleCopyToClipboard}>
              {copied ? (
                <>
                  <CheckCircle2 size={16} className="text-neon-green" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy to Clipboard
                </>
              )}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}>
              <RotateCcw size={16} /> Process Another Photo
            </FloatingButton>
          </div>
        </motion.div>
      )}

      {/* Error View */}
      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400 font-medium">{processing.error}</p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">
            Try Again
          </FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
