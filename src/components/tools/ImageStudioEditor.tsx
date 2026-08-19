"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Lock,
  Unlock,
  Sparkles,
  Download,
  RotateCcw as ResetIcon,
  Sliders,
  CheckCircle2,
  HardDrive,
  Layers,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import FloatingButton from "@/components/ui/FloatingButton";
import { useProcessing } from "@/hooks/useProcessing";

interface ImageStudioEditorProps {
  file: File;
  previewUrl: string;
  onReset: () => void;
}

type TabType = "all" | "crop" | "transform" | "resize" | "targetSize";

export default function ImageStudioEditor({
  file,
  previewUrl,
  onReset,
}: ImageStudioEditorProps) {
  const processing = useProcessing();

  // Image Dimensions
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  // Active sub-tool tab
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // 1. Crop State
  const [enableCrop, setEnableCrop] = useState<boolean>(false);
  const [cropAspect, setCropAspect] = useState<string>("free");
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // 2. Transform State (Rotate & Flip)
  const [rotateAngle, setRotateAngle] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // 3. Resize State (Sliders)
  const [resizeMode, setResizeMode] = useState<"scale" | "dimensions">("scale");
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);

  // 4. Target File Size (KB/MB) State
  const [targetSizeMode, setTargetSizeMode] = useState<"auto" | "target">("target");
  const [targetKb, setTargetKb] = useState<number>(150);
  const [sizeUnit, setSizeUnit] = useState<"KB" | "MB">("KB");
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [quality, setQuality] = useState<number>(85);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean memory on unmount / reset
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Load natural dimensions when image loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNaturalWidth(w);
    setNaturalHeight(h);
    setTargetWidth(w);
    setTargetHeight(h);
    setCropBox({ x: 0, y: 0, width: w, height: h });

    // Suggest intelligent initial target size based on original size
    const origKb = Math.round(file.size / 1024);
    if (origKb > 1000) {
      setTargetKb(Math.round(origKb * 0.4));
    } else if (origKb > 300) {
      setTargetKb(Math.round(origKb * 0.5));
    } else {
      setTargetKb(Math.min(origKb, 150));
    }
  };

  // Adjust width/height on scale slider change
  const handleScaleChange = (val: number) => {
    setScalePercent(val);
    if (naturalWidth && naturalHeight) {
      const factor = val / 100;
      setTargetWidth(Math.round(naturalWidth * factor));
      setTargetHeight(Math.round(naturalHeight * factor));
    }
  };

  // Adjust width with aspect lock
  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && naturalWidth && naturalHeight) {
      setTargetHeight(Math.round(val * (naturalHeight / naturalWidth)));
    }
  };

  // Adjust height with aspect lock
  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && naturalWidth && naturalHeight) {
      setTargetWidth(Math.round(val * (naturalWidth / naturalHeight)));
    }
  };

  // Rotate presets
  const handleRotateBy = (deg: number) => {
    setRotateAngle((prev) => {
      const next = (prev + deg) % 360;
      return next < -180 ? next + 360 : next > 180 ? next - 360 : next;
    });
  };

  // Aspect presets for crop
  const applyCropAspect = (ratio: string) => {
    setCropAspect(ratio);
    if (!naturalWidth || !naturalHeight) return;

    let w = naturalWidth;
    let h = naturalHeight;

    if (ratio === "1:1") {
      const min = Math.min(naturalWidth, naturalHeight);
      w = min;
      h = min;
    } else if (ratio === "16:9") {
      w = naturalWidth;
      h = Math.round((naturalWidth * 9) / 16);
      if (h > naturalHeight) {
        h = naturalHeight;
        w = Math.round((naturalHeight * 16) / 9);
      }
    } else if (ratio === "9:16") {
      h = naturalHeight;
      w = Math.round((naturalHeight * 9) / 16);
      if (w > naturalWidth) {
        w = naturalWidth;
        h = Math.round((naturalWidth * 16) / 9);
      }
    } else if (ratio === "4:3") {
      w = naturalWidth;
      h = Math.round((naturalWidth * 3) / 4);
      if (h > naturalHeight) {
        h = naturalHeight;
        w = Math.round((naturalHeight * 4) / 3);
      }
    } else if (ratio === "35:45") {
      // Passport Size (35mm x 45mm)
      h = naturalHeight;
      w = Math.round((naturalHeight * 35) / 45);
      if (w > naturalWidth) {
        w = naturalWidth;
        h = Math.round((naturalWidth * 45) / 35);
      }
    }

    const x = Math.round((naturalWidth - w) / 2);
    const y = Math.round((naturalHeight - h) / 2);
    setCropBox({ x, y, width: w, height: h });
    setEnableCrop(true);
  };

  // Process image with all unified options
  const handleProcessStudio = useCallback(async () => {
    const flipDirection: "none" | "horizontal" | "vertical" | "both" =
      flipH && flipV ? "both" : flipH ? "horizontal" : flipV ? "vertical" : "none";

    const studioPayload = {
      crop: enableCrop
        ? {
            left: cropBox.x,
            top: cropBox.y,
            width: cropBox.width,
            height: cropBox.height,
          }
        : undefined,
      rotateAngle: rotateAngle !== 0 ? rotateAngle : undefined,
      flipDirection: flipDirection !== "none" ? flipDirection : undefined,
      resize: {
        width: targetWidth,
        height: targetHeight,
        maintainAspectRatio: lockAspect,
      },
      targetSizeKb: targetSizeMode === "target" ? targetKb : undefined,
      format,
      quality,
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("options", JSON.stringify(studioPayload));

    const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const outputFilename = `edited-${baseName}.${ext}`;

    await processing.processFile("/api/image/studio", formData, outputFilename);
  }, [
    file,
    enableCrop,
    cropBox,
    rotateAngle,
    flipH,
    flipV,
    targetWidth,
    targetHeight,
    lockAspect,
    targetSizeMode,
    targetKb,
    format,
    quality,
    processing,
  ]);

  const originalKb = Math.round(file.size / 1024);

  return (
    <div className="space-y-8">
      {/* ─── Result Complete View ────────────────────────────────────── */}
      {processing.status === "complete" && processing.resultUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Metadata Comparison Banner */}
          {processing.metadata && (() => {
            const m = processing.metadata as {
              originalWidth?: number;
              originalHeight?: number;
              finalWidth?: number;
              finalHeight?: number;
              originalSizeKb?: number;
              finalSizeKb?: number;
              targetSizeKb?: number;
              savings?: number;
              format?: string;
            };
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center border border-glass-border">
                  <div className="text-sm font-semibold text-text-muted">Original Dimensions</div>
                  <div className="text-lg font-bold text-text-primary mt-1">
                    {m.originalWidth} × {m.originalHeight} px
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{m.originalSizeKb} KB</div>
                </div>

                <div className="glass rounded-xl p-4 text-center border border-neon-cyan/40 bg-neon-cyan/5">
                  <div className="text-sm font-semibold text-neon-cyan">Final Dimensions</div>
                  <div className="text-lg font-bold text-text-primary mt-1">
                    {m.finalWidth} × {m.finalHeight} px
                  </div>
                  <div className="text-xs text-neon-cyan mt-0.5">Optimized Size</div>
                </div>

                <div className="glass rounded-xl p-4 text-center border border-neon-purple/40 bg-neon-purple/5">
                  <div className="text-sm font-semibold text-neon-purple">Requested Size</div>
                  <div className="text-lg font-bold text-neon-purple mt-1">
                    {m.targetSizeKb ? `${m.targetSizeKb} KB` : "Auto Best Quality"}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">User Target</div>
                </div>

                <div className="glass rounded-xl p-4 text-center border border-neon-green/40 bg-neon-green/5">
                  <div className="text-sm font-semibold text-neon-green flex items-center justify-center gap-1">
                    <CheckCircle2 size={14} /> Output Size
                  </div>
                  <div className="text-lg font-bold text-neon-green mt-1">
                    {m.finalSizeKb} KB
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {m.savings && m.savings > 0 ? `${m.savings}% Reduced` : "Preserved HD"}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Processed Image Display */}
          <div className="glass rounded-2xl p-6 border border-glass-border text-center overflow-hidden">
            <div className="max-h-[500px] flex items-center justify-center bg-black/40 rounded-xl p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={processing.resultUrl}
                alt="Processed Result"
                className="max-h-[440px] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Download & Reset Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={processing.resultUrl}
              download={processing.resultFilename || "edited-image.jpg"}
            >
              <FloatingButton size="lg" glowColor="rgba(16, 185, 129, 0.4)">
                <Download size={18} /> Download Image (
                {String((processing.metadata as Record<string, unknown>)?.finalSizeKb || targetKb)} KB)
              </FloatingButton>
            </a>
            <FloatingButton variant="ghost" onClick={onReset}>
              <ResetIcon size={16} /> Edit Another Photo
            </FloatingButton>
          </div>
        </motion.div>
      ) : (
        /* ─── Studio Workstation View ────────────────────────────────── */
        <div className="space-y-6">
          {/* Main Visual Preview Area */}
          <div
            ref={containerRef}
            className="glass rounded-2xl p-4 sm:p-6 border border-glass-border relative overflow-hidden"
          >
            {/* Live Metrics Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-glass-border text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <span className="text-text-muted">Original:</span>
                <span className="font-semibold text-text-primary">
                  {naturalWidth} × {naturalHeight} px
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface border border-glass-border font-mono text-neon-cyan">
                  {originalKb > 1024 ? `${(originalKb / 1024).toFixed(2)} MB` : `${originalKb} KB`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-text-muted">Output Target:</span>
                <span className="font-semibold text-neon-green">
                  {targetWidth} × {targetHeight} px
                </span>
                <span className="px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30 font-bold">
                  {targetSizeMode === "target" ? `~${targetKb} KB` : "Auto"}
                </span>
              </div>
            </div>

            {/* Interactive Preview Canvas with Live CSS Transform */}
            <div className="min-h-[300px] sm:min-h-[380px] flex items-center justify-center bg-black/40 rounded-xl p-4 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Source preview"
                onLoad={handleImageLoad}
                style={{
                  transform: `rotate(${rotateAngle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  transition: "transform 0.2s ease-out",
                }}
                className="max-h-[360px] max-w-full object-contain rounded select-none pointer-events-none"
              />

              {/* Crop Box Overlay visual representation */}
              {enableCrop && (
                <div
                  className="absolute border-2 border-neon-cyan border-dashed bg-neon-cyan/10 pointer-events-none rounded transition-all duration-200"
                  style={{
                    width: "70%",
                    height: "70%",
                  }}
                >
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-neon-cyan font-bold">
                    Crop Region: {cropBox.width} × {cropBox.height} ({cropAspect})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Control Panels Accordion / Tabs ────────────────────────── */}
          <div className="glass rounded-2xl p-6 border border-glass-border space-y-6">
            {/* Tool Nav Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-glass-border">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20"
                    : "text-text-secondary hover:text-text-primary bg-surface/50 border border-glass-border"
                }`}
              >
                <Layers size={15} /> All Controls
              </button>
              <button
                onClick={() => setActiveTab("resize")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "resize"
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20"
                    : "text-text-secondary hover:text-text-primary bg-surface/50 border border-glass-border"
                }`}
              >
                <Sliders size={15} /> 1. Resize Sliders
              </button>
              <button
                onClick={() => setActiveTab("targetSize")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "targetSize"
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20"
                    : "text-text-secondary hover:text-text-primary bg-surface/50 border border-glass-border"
                }`}
              >
                <HardDrive size={15} /> 2. Target File Size (KB/MB)
              </button>
              <button
                onClick={() => setActiveTab("crop")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "crop"
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20"
                    : "text-text-secondary hover:text-text-primary bg-surface/50 border border-glass-border"
                }`}
              >
                <Crop size={15} /> 3. Crop Tool
              </button>
              <button
                onClick={() => setActiveTab("transform")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "transform"
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/20"
                    : "text-text-secondary hover:text-text-primary bg-surface/50 border border-glass-border"
                }`}
              >
                <RotateCw size={15} /> 4. Flip & Rotate
              </button>
            </div>

            {/* ─── 1. RESIZE SLIDERS SECTION ───────────────────────────── */}
            {(activeTab === "all" || activeTab === "resize") && (
              <div className="p-4 sm:p-5 rounded-xl bg-surface/60 border border-glass-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <Sliders size={16} className="text-neon-cyan" /> Resize Controls (Width, Height & Scale Slider)
                  </h3>
                  <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-glass-border text-xs">
                    <button
                      onClick={() => setResizeMode("scale")}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        resizeMode === "scale" ? "bg-neon-purple text-white" : "text-text-muted"
                      }`}
                    >
                      Scale %
                    </button>
                    <button
                      onClick={() => setResizeMode("dimensions")}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        resizeMode === "dimensions" ? "bg-neon-purple text-white" : "text-text-muted"
                      }`}
                    >
                      Exact Pixels
                    </button>
                  </div>
                </div>

                {/* Scale Percentage Slider */}
                {resizeMode === "scale" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Resolution Scale:</span>
                      <span className="font-bold text-neon-cyan text-base">{scalePercent}%</span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={200}
                      step={5}
                      value={scalePercent}
                      onChange={(e) => handleScaleChange(Number(e.target.value))}
                      className="w-full accent-neon-cyan h-2 bg-surface rounded-lg cursor-pointer"
                    />

                    {/* Quick Scale Preset Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {[25, 50, 75, 100, 125, 150, 200].map((p) => (
                        <button
                          key={p}
                          onClick={() => handleScaleChange(p)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            scalePercent === p
                              ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan"
                              : "bg-surface border-glass-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Width & Height Dimension Inputs */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>Width (px)</span>
                        <span className="font-bold text-text-primary">{targetWidth} px</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={Math.max(3840, naturalWidth * 2)}
                        step={10}
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full accent-neon-purple h-2 bg-surface rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full bg-surface border border-glass-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>Height (px)</span>
                        <span className="font-bold text-text-primary">{targetHeight} px</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={Math.max(3840, naturalHeight * 2)}
                        step={10}
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full accent-neon-purple h-2 bg-surface rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full bg-surface border border-glass-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Aspect Ratio Lock Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-glass-border text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    {lockAspect ? <Lock size={13} className="text-neon-green" /> : <Unlock size={13} />}
                    Aspect Ratio Constraint ({naturalWidth} : {naturalHeight})
                  </span>
                  <button
                    onClick={() => setLockAspect(!lockAspect)}
                    className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                      lockAspect ? "bg-neon-green/20 text-neon-green border border-neon-green/30" : "bg-surface border border-glass-border text-text-muted"
                    }`}
                  >
                    {lockAspect ? "Aspect Locked" : "Free Form"}
                  </button>
                </div>
              </div>
            )}

            {/* ─── 2. TARGET FILE SIZE (KB / MB) OPTIMIZER ────────────── */}
            {(activeTab === "all" || activeTab === "targetSize") && (
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 border border-neon-purple/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <HardDrive size={16} className="text-neon-purple" /> Target File Size (Kitne KB / MB ka chahiye?)
                  </h3>
                  <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-glass-border text-xs">
                    <button
                      onClick={() => setTargetSizeMode("target")}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        targetSizeMode === "target" ? "bg-neon-purple text-white shadow" : "text-text-muted"
                      }`}
                    >
                      Exact Size (KB/MB)
                    </button>
                    <button
                      onClick={() => setTargetSizeMode("auto")}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        targetSizeMode === "auto" ? "bg-neon-purple text-white shadow" : "text-text-muted"
                      }`}
                    >
                      Auto Quality
                    </button>
                  </div>
                </div>

                {targetSizeMode === "target" ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="text-text-secondary font-medium">
                        Desired Target Size: <span className="text-xs text-text-muted">(Output will not exceed this)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={10}
                          max={50000}
                          value={sizeUnit === "MB" ? (targetKb / 1024).toFixed(2) : targetKb}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setTargetKb(sizeUnit === "MB" ? Math.round(val * 1024) : val);
                          }}
                          className="w-24 bg-surface border border-neon-purple/50 rounded-lg px-3 py-1.5 text-center font-bold text-neon-purple text-base focus:outline-none focus:ring-2 focus:ring-neon-purple"
                        />
                        <div className="flex rounded-lg overflow-hidden border border-glass-border">
                          <button
                            onClick={() => setSizeUnit("KB")}
                            className={`px-2.5 py-1 text-xs font-bold ${
                              sizeUnit === "KB" ? "bg-neon-purple text-white" : "bg-surface text-text-muted"
                            }`}
                          >
                            KB
                          </button>
                          <button
                            onClick={() => setSizeUnit("MB")}
                            className={`px-2.5 py-1 text-xs font-bold ${
                              sizeUnit === "MB" ? "bg-neon-purple text-white" : "bg-surface text-text-muted"
                            }`}
                          >
                            MB
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Target Size Slider */}
                    <input
                      type="range"
                      min={20}
                      max={Math.max(5000, originalKb * 1.5)}
                      step={10}
                      value={targetKb}
                      onChange={(e) => setTargetKb(Number(e.target.value))}
                      className="w-full accent-neon-purple h-2 bg-surface rounded-lg cursor-pointer"
                    />

                    {/* Quick Target Size Presets */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-text-muted mr-1">Popular:</span>
                      {[50, 100, 200, 500, 1000, 2000].map((kb) => (
                        <button
                          key={kb}
                          onClick={() => {
                            setTargetKb(kb);
                            setSizeUnit(kb >= 1000 ? "MB" : "KB");
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            targetKb === kb
                              ? "bg-neon-purple text-white border-neon-purple shadow-lg shadow-neon-purple/30"
                              : "bg-surface border-glass-border text-text-muted hover:text-text-primary"
                          }`}
                        >
                          {kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-text-muted flex items-center gap-1.5">
                      <Sparkles size={13} className="text-neon-purple" />
                      Smart AI-optimizer will iteratively tune quality and compression to hit your target file size perfectly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>Quality Slider</span>
                      <span className="font-bold text-text-primary">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-neon-purple h-2 bg-surface rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                {/* Output Format Selector */}
                <div className="flex items-center justify-between pt-3 border-t border-neon-purple/20 text-xs">
                  <span className="text-text-muted">Output Format:</span>
                  <div className="flex items-center gap-2">
                    {(["jpeg", "webp", "png"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                          format === fmt
                            ? "bg-neon-purple text-white shadow"
                            : "bg-surface text-text-muted hover:text-text-primary border border-glass-border"
                        }`}
                      >
                        {fmt === "jpeg" ? "JPG" : fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── 3. CROP SECTION ─────────────────────────────────────── */}
            {(activeTab === "all" || activeTab === "crop") && (
              <div className="p-4 sm:p-5 rounded-xl bg-surface/60 border border-glass-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <Crop size={16} className="text-neon-cyan" /> Crop Image Tool
                  </h3>
                  <button
                    onClick={() => setEnableCrop(!enableCrop)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      enableCrop ? "bg-neon-cyan text-black" : "bg-surface border border-glass-border text-text-muted"
                    }`}
                  >
                    {enableCrop ? "Crop Active" : "Enable Crop"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Freeform", ratio: "free" },
                    { label: "1:1 Square (Insta)", ratio: "1:1" },
                    { label: "16:9 (YouTube)", ratio: "16:9" },
                    { label: "9:16 (Reels/Stories)", ratio: "9:16" },
                    { label: "4:3 Standard", ratio: "4:3" },
                    { label: "Passport (35×45mm)", ratio: "35:45" },
                  ].map((item) => (
                    <button
                      key={item.ratio}
                      onClick={() => applyCropAspect(item.ratio)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        enableCrop && cropAspect === item.ratio
                          ? "bg-neon-cyan text-black border-neon-cyan font-bold"
                          : "bg-surface border-glass-border text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 4. FLIP & ROTATE SECTION ────────────────────────────── */}
            {(activeTab === "all" || activeTab === "transform") && (
              <div className="p-4 sm:p-5 rounded-xl bg-surface/60 border border-glass-border space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <RotateCw size={16} className="text-neon-pink" /> Flip & Rotate Controls
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleRotateBy(-90)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-surface border border-glass-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-neon-pink transition-all"
                  >
                    <RotateCcw size={15} /> 90° Left
                  </button>
                  <button
                    onClick={() => handleRotateBy(90)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-surface border border-glass-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-neon-pink transition-all"
                  >
                    <RotateCw size={15} /> 90° Right
                  </button>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      flipH
                        ? "bg-neon-pink text-white border-neon-pink shadow-lg shadow-neon-pink/20"
                        : "bg-surface border-glass-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <FlipHorizontal size={15} /> Flip Horizontal
                  </button>
                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      flipV
                        ? "bg-neon-pink text-white border-neon-pink shadow-lg shadow-neon-pink/20"
                        : "bg-surface border-glass-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <FlipVertical size={15} /> Flip Vertical
                  </button>
                </div>

                {/* Fine Angle Rotation Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Fine-tune Rotation Angle:</span>
                    <span className="font-bold text-neon-pink">{rotateAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotateAngle}
                    onChange={(e) => setRotateAngle(Number(e.target.value))}
                    className="w-full accent-neon-pink h-2 bg-surface rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ─── ACTION EXECUTE BUTTON ──────────────────────────────── */}
            <div className="flex flex-wrap gap-3 pt-2">
              <FloatingButton
                onClick={handleProcessStudio}
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
                    Optimizing & Processing Image...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Apply & Process (Target: {targetSizeMode === "target" ? `${targetKb} KB` : "HD"})
                  </>
                )}
              </FloatingButton>

              <FloatingButton variant="ghost" onClick={onReset}>
                <ResetIcon size={16} /> Reset All
              </FloatingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
