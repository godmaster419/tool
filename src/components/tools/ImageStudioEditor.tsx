"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Sparkles,
  Download,
  RotateCcw as ResetIcon,
  Sliders,
  CheckCircle2,
  HardDrive,
  Layers,
  ChevronRight,
  Maximize2,
  Move,
} from "lucide-react";
import FloatingButton from "@/components/ui/FloatingButton";
import { useProcessing } from "@/hooks/useProcessing";

interface ImageStudioEditorProps {
  file: File;
  previewUrl: string;
  onReset: () => void;
}

type TabType = "crop" | "transform" | "resize" | "targetSize";

const TABS: { id: TabType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "resize", label: "Resize", icon: Sliders, color: "neon-cyan" },
  { id: "targetSize", label: "File Size", icon: HardDrive, color: "neon-purple" },
  { id: "crop", label: "Crop", icon: Crop, color: "neon-cyan" },
  { id: "transform", label: "Transform", icon: RotateCw, color: "neon-pink" },
];

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
  const [activeTab, setActiveTab] = useState<TabType>("resize");

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

  // Crop drag state
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0, boxX: 0, boxY: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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

    if (Math.abs(deg) === 90 || Math.abs(deg) === 270) {
      setNaturalWidth((prevW) => {
        setNaturalHeight(prevW);
        return naturalHeight;
      });
      setTargetWidth((prevW) => {
        setTargetHeight(prevW);
        return targetHeight;
      });
    }
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

  // Interactive crop drag handler
  const handleCropMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enableCrop || !canvasContainerRef.current || !imgRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingCrop(true);

      const containerRect = canvasContainerRef.current.getBoundingClientRect();
      const imgRect = imgRef.current.getBoundingClientRect();

      const mouseX = e.clientX - imgRect.left;
      const mouseY = e.clientY - imgRect.top;

      const scaleX = naturalWidth / imgRect.width;
      const scaleY = naturalHeight / imgRect.height;

      setCropDragStart({
        x: mouseX * scaleX,
        y: mouseY * scaleY,
        boxX: cropBox.x,
        boxY: cropBox.y,
      });
    },
    [enableCrop, naturalWidth, naturalHeight, cropBox]
  );

  useEffect(() => {
    if (!isDraggingCrop) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!imgRef.current) return;
      const imgRect = imgRef.current.getBoundingClientRect();
      const scaleX = naturalWidth / imgRect.width;
      const scaleY = naturalHeight / imgRect.height;

      const mouseX = (e.clientX - imgRect.left) * scaleX;
      const mouseY = (e.clientY - imgRect.top) * scaleY;

      const dx = mouseX - cropDragStart.x;
      const dy = mouseY - cropDragStart.y;

      let newX = cropDragStart.boxX + dx;
      let newY = cropDragStart.boxY + dy;

      // Clamp
      newX = Math.max(0, Math.min(naturalWidth - cropBox.width, newX));
      newY = Math.max(0, Math.min(naturalHeight - cropBox.height, newY));

      setCropBox((prev) => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
    };

    const handleMouseUp = () => setIsDraggingCrop(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingCrop, cropDragStart, naturalWidth, naturalHeight, cropBox.width, cropBox.height]);

  // Count active modifications for tab badges
  const modCount = {
    resize: scalePercent !== 100 || targetWidth !== naturalWidth || targetHeight !== naturalHeight ? 1 : 0,
    targetSize: targetSizeMode === "target" ? 1 : 0,
    crop: enableCrop ? 1 : 0,
    transform: (rotateAngle !== 0 ? 1 : 0) + (flipH ? 1 : 0) + (flipV ? 1 : 0),
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

  // Compute crop overlay style in CSS percentages
  const getCropOverlayStyle = () => {
    if (!naturalWidth || !naturalHeight) return {};
    return {
      left: `${(cropBox.x / naturalWidth) * 100}%`,
      top: `${(cropBox.y / naturalHeight) * 100}%`,
      width: `${(cropBox.width / naturalWidth) * 100}%`,
      height: `${(cropBox.height / naturalHeight) * 100}%`,
    };
  };

  return (
    <div className="space-y-6">
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="result-shimmer studio-panel rounded-xl p-4 text-center"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">Original</div>
                  <div className="text-base font-bold text-text-primary">
                    {m.originalWidth} × {m.originalHeight}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{m.originalSizeKb} KB</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="result-shimmer studio-panel rounded-xl p-4 text-center border-neon-cyan/30"
                  style={{ borderColor: "rgba(6, 182, 212, 0.3)" }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan mb-1.5">Output</div>
                  <div className="text-base font-bold text-text-primary">
                    {m.finalWidth} × {m.finalHeight}
                  </div>
                  <div className="text-xs text-neon-cyan mt-0.5">{m.format?.toUpperCase()}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="result-shimmer studio-panel rounded-xl p-4 text-center"
                  style={{ borderColor: "rgba(168, 85, 247, 0.3)" }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neon-purple mb-1.5">Target</div>
                  <div className="text-base font-bold text-neon-purple">
                    {m.targetSizeKb ? `${m.targetSizeKb} KB` : "Auto HD"}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">Requested</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="result-shimmer studio-panel rounded-xl p-4 text-center"
                  style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neon-green flex items-center justify-center gap-1 mb-1.5">
                    <CheckCircle2 size={11} /> Final
                  </div>
                  <div className="text-base font-bold text-neon-green">
                    {m.finalSizeKb} KB
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {m.savings && m.savings > 0 ? `${m.savings}% Reduced` : "Preserved"}
                  </div>
                </motion.div>
              </div>
            );
          })()}

          {/* Processed Image Display */}
          <div className="studio-panel rounded-2xl p-5 text-center overflow-hidden">
            <div className="max-h-[500px] flex items-center justify-center bg-checkerboard rounded-xl p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={processing.resultUrl}
                alt="Processed Result"
                className="max-h-[440px] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Download & Reset Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
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
        <div className="space-y-5">
          {/* Two-Column Desktop Layout */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* LEFT — Visual Preview Canvas */}
            <div className="flex-1 min-w-0">
              <div
                ref={containerRef}
                className="studio-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden"
              >
                {/* Live Metrics Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Source</span>
                    <span className="font-bold text-text-primary">
                      {naturalWidth} × {naturalHeight}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] font-mono text-neon-cyan text-[11px] font-bold">
                      {originalKb > 1024 ? `${(originalKb / 1024).toFixed(1)} MB` : `${originalKb} KB`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ChevronRight size={12} className="text-text-muted" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Output</span>
                    <span className="font-bold text-neon-green text-[11px]">
                      {targetWidth} × {targetHeight}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-neon-green/10 text-neon-green border border-neon-green/25 font-bold text-[11px]">
                      {targetSizeMode === "target" ? `~${targetKb} KB` : "Auto"}
                    </span>
                  </div>
                </div>

                {/* Interactive Preview Canvas */}
                <div
                  ref={canvasContainerRef}
                  className="min-h-[280px] sm:min-h-[360px] flex items-center justify-center bg-checkerboard rounded-xl relative overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="Source preview"
                    onLoad={handleImageLoad}
                    style={{
                      transform: `rotate(${rotateAngle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                      transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                    }}
                    className="max-h-[340px] max-w-full object-contain rounded select-none pointer-events-none"
                  />

                  {/* Interactive Crop Box Overlay */}
                  {enableCrop && naturalWidth > 0 && (
                    <div
                      className="absolute inset-0"
                      style={{ pointerEvents: "none" }}
                    >
                      {/* Dimmed area outside crop */}
                      <div className="absolute inset-0 bg-black/50 rounded-xl" />

                      {/* Crop selection - clear window */}
                      <div
                        onMouseDown={handleCropMouseDown}
                        className="absolute border-2 border-neon-cyan bg-transparent rounded-sm z-10"
                        style={{
                          ...getCropOverlayStyle(),
                          pointerEvents: "auto",
                          cursor: isDraggingCrop ? "grabbing" : "grab",
                          boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                        }}
                      >
                        {/* Rule of thirds gridlines */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-neon-cyan/30" />
                          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-neon-cyan/30" />
                          <div className="absolute top-1/3 left-0 right-0 h-px bg-neon-cyan/30" />
                          <div className="absolute top-2/3 left-0 right-0 h-px bg-neon-cyan/30" />
                        </div>

                        {/* Crop info label */}
                        <div className="absolute -top-7 left-1 px-2 py-0.5 rounded bg-black/80 text-[9px] text-neon-cyan font-bold whitespace-nowrap flex items-center gap-1.5 pointer-events-none">
                          <Move size={9} />
                          {cropBox.width} × {cropBox.height} ({cropAspect})
                        </div>

                        {/* Corner handles */}
                        <div className="crop-handle" style={{ top: -6, left: -6, cursor: "nw-resize" }} />
                        <div className="crop-handle" style={{ top: -6, right: -6, cursor: "ne-resize" }} />
                        <div className="crop-handle" style={{ bottom: -6, left: -6, cursor: "sw-resize" }} />
                        <div className="crop-handle" style={{ bottom: -6, right: -6, cursor: "se-resize" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Control Panels */}
            <div className="lg:w-[420px] xl:w-[460px] shrink-0">
              <div className="studio-panel rounded-2xl p-4 sm:p-5 space-y-4">
                {/* Premium Tab Navigation */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const count = modCount[tab.id];
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-b from-white/[0.08] to-white/[0.03] text-white shadow-lg border border-white/[0.1]"
                            : "text-text-muted hover:text-text-secondary"
                        }`}
                      >
                        <Icon size={13} className={isActive ? `text-${tab.color}` : ""} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {count > 0 && (
                          <span className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full bg-neon-purple text-[8px] font-bold text-white flex items-center justify-center shadow-lg shadow-neon-purple/40">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ─── 1. RESIZE SLIDERS SECTION ───────────────────────────── */}
                <AnimatePresence mode="wait">
                  {activeTab === "resize" && (
                    <motion.div
                      key="resize"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                          <Sliders size={13} className="text-neon-cyan" /> Resize
                        </h3>
                        <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-white/[0.03] border border-white/[0.06] text-[10px]">
                          <button
                            onClick={() => setResizeMode("scale")}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                              resizeMode === "scale" ? "bg-neon-cyan/20 text-neon-cyan" : "text-text-muted"
                            }`}
                          >
                            Scale %
                          </button>
                          <button
                            onClick={() => setResizeMode("dimensions")}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                              resizeMode === "dimensions" ? "bg-neon-cyan/20 text-neon-cyan" : "text-text-muted"
                            }`}
                          >
                            Pixels
                          </button>
                        </div>
                      </div>

                      {resizeMode === "scale" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted font-medium">Scale</span>
                            <span className="font-bold text-neon-cyan text-sm tabular-nums">{scalePercent}%</span>
                          </div>

                          <input
                            type="range"
                            min={10}
                            max={200}
                            step={5}
                            value={scalePercent}
                            onChange={(e) => handleScaleChange(Number(e.target.value))}
                            className="slider-cyan"
                          />

                          <div className="flex flex-wrap items-center gap-1.5">
                            {[25, 50, 75, 100, 150, 200].map((p) => (
                              <button
                                key={p}
                                onClick={() => handleScaleChange(p)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                  scalePercent === p
                                    ? "bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan"
                                    : "bg-white/[0.02] border-white/[0.06] text-text-muted hover:text-text-primary"
                                }`}
                              >
                                {p}%
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-text-muted">
                              <span className="uppercase tracking-wider font-semibold">Width</span>
                              <span className="font-bold text-text-primary text-xs tabular-nums">{targetWidth} px</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={Math.max(3840, naturalWidth * 2)}
                              step={10}
                              value={targetWidth}
                              onChange={(e) => handleWidthChange(Number(e.target.value))}
                              className="slider-purple"
                            />
                            <input
                              type="number"
                              value={targetWidth}
                              onChange={(e) => handleWidthChange(Number(e.target.value))}
                              className="input-premium w-full px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-text-muted">
                              <span className="uppercase tracking-wider font-semibold">Height</span>
                              <span className="font-bold text-text-primary text-xs tabular-nums">{targetHeight} px</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={Math.max(3840, naturalHeight * 2)}
                              step={10}
                              value={targetHeight}
                              onChange={(e) => handleHeightChange(Number(e.target.value))}
                              className="slider-purple"
                            />
                            <input
                              type="number"
                              value={targetHeight}
                              onChange={(e) => handleHeightChange(Number(e.target.value))}
                              className="input-premium w-full px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Aspect Ratio Lock */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px]">
                        <span className="flex items-center gap-1.5 text-text-muted">
                          {lockAspect ? <Lock size={11} className="text-neon-green" /> : <Unlock size={11} />}
                          <span className="uppercase tracking-wider font-semibold">Aspect Ratio</span>
                        </span>
                        <button
                          onClick={() => setLockAspect(!lockAspect)}
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${
                            lockAspect ? "bg-neon-green/15 text-neon-green border border-neon-green/30" : "bg-white/[0.03] border border-white/[0.06] text-text-muted"
                          }`}
                        >
                          {lockAspect ? "Locked" : "Free"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── 2. TARGET FILE SIZE (KB / MB) ────────────── */}
                  {activeTab === "targetSize" && (
                    <motion.div
                      key="targetSize"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                          <HardDrive size={13} className="text-neon-purple" /> Target Size
                        </h3>
                        <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-white/[0.03] border border-white/[0.06] text-[10px]">
                          <button
                            onClick={() => setTargetSizeMode("target")}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                              targetSizeMode === "target" ? "bg-neon-purple/20 text-neon-purple" : "text-text-muted"
                            }`}
                          >
                            Exact KB/MB
                          </button>
                          <button
                            onClick={() => setTargetSizeMode("auto")}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                              targetSizeMode === "auto" ? "bg-neon-purple/20 text-neon-purple" : "text-text-muted"
                            }`}
                          >
                            Auto
                          </button>
                        </div>
                      </div>

                      {targetSizeMode === "target" ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={10}
                              max={50000}
                              value={sizeUnit === "MB" ? Number((targetKb / 1024).toFixed(2)) : targetKb}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setTargetKb(sizeUnit === "MB" ? Math.round(val * 1024) : val);
                              }}
                              className="input-premium flex-1 px-3 py-2 text-center text-base text-neon-purple"
                            />
                            <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
                              <button
                                onClick={() => setSizeUnit("KB")}
                                className={`px-2.5 py-2 text-[10px] font-bold ${
                                  sizeUnit === "KB" ? "bg-neon-purple text-white" : "bg-white/[0.03] text-text-muted"
                                }`}
                              >
                                KB
                              </button>
                              <button
                                onClick={() => setSizeUnit("MB")}
                                className={`px-2.5 py-2 text-[10px] font-bold ${
                                  sizeUnit === "MB" ? "bg-neon-purple text-white" : "bg-white/[0.03] text-text-muted"
                                }`}
                              >
                                MB
                              </button>
                            </div>
                          </div>

                          <input
                            type="range"
                            min={20}
                            max={Math.max(5000, originalKb * 1.5)}
                            step={10}
                            value={targetKb}
                            onChange={(e) => setTargetKb(Number(e.target.value))}
                            className="slider-purple"
                          />

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] text-text-muted font-semibold uppercase tracking-wider mr-1">Quick:</span>
                            {[50, 100, 200, 500, 1000, 2000].map((kb) => (
                              <button
                                key={kb}
                                onClick={() => {
                                  setTargetKb(kb);
                                  setSizeUnit(kb >= 1000 ? "MB" : "KB");
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                  targetKb === kb
                                    ? "bg-neon-purple/20 text-neon-purple border-neon-purple/40 shadow-sm shadow-neon-purple/20"
                                    : "bg-white/[0.02] border-white/[0.06] text-text-muted hover:text-text-primary"
                                }`}
                              >
                                {kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}
                              </button>
                            ))}
                          </div>

                          <p className="text-[10px] text-text-muted flex items-center gap-1.5">
                            <Sparkles size={11} className="text-neon-purple" />
                            Binary search optimizer will tune quality + resolution to hit your target.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-text-muted">
                            <span className="uppercase tracking-wider font-semibold">Quality</span>
                            <span className="font-bold text-text-primary text-xs">{quality}%</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="slider-purple"
                          />
                        </div>
                      )}

                      {/* Output Format */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px]">
                        <span className="text-text-muted uppercase tracking-wider font-semibold">Format</span>
                        <div className="flex items-center gap-1.5">
                          {(["jpeg", "webp", "png"] as const).map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => setFormat(fmt)}
                              className={`px-2.5 py-1 rounded-md font-bold uppercase transition-all ${
                                format === fmt
                                  ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                                  : "bg-white/[0.02] text-text-muted hover:text-text-primary border border-white/[0.06]"
                              }`}
                            >
                              {fmt === "jpeg" ? "JPG" : fmt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── 3. CROP ─────────────────────────────────────── */}
                  {activeTab === "crop" && (
                    <motion.div
                      key="crop"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                          <Crop size={13} className="text-neon-cyan" /> Crop
                        </h3>
                        <button
                          onClick={() => setEnableCrop(!enableCrop)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            enableCrop
                              ? "bg-neon-cyan text-black shadow-md shadow-neon-cyan/30"
                              : "bg-white/[0.04] border border-white/[0.08] text-text-muted"
                          }`}
                        >
                          {enableCrop ? "✓ Active" : "Enable"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: "Free", ratio: "free" },
                          { label: "1:1 Square", ratio: "1:1" },
                          { label: "16:9 YouTube", ratio: "16:9" },
                          { label: "9:16 Reels", ratio: "9:16" },
                          { label: "4:3 Standard", ratio: "4:3" },
                          { label: "Passport", ratio: "35:45" },
                        ].map((item) => (
                          <button
                            key={item.ratio}
                            onClick={() => applyCropAspect(item.ratio)}
                            className={`px-2.5 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                              enableCrop && cropAspect === item.ratio
                                ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40"
                                : "bg-white/[0.02] border-white/[0.06] text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {enableCrop && (
                        <div className="text-[10px] text-text-muted bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.06]">
                          <span className="text-neon-cyan font-bold">Drag</span> the crop box to reposition • Corner handles to resize
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ─── 4. FLIP & ROTATE ────────────────────────────── */}
                  {activeTab === "transform" && (
                    <motion.div
                      key="transform"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <RotateCw size={13} className="text-neon-pink" /> Transform
                      </h3>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleRotateBy(-90)}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-text-secondary hover:text-text-primary hover:border-neon-pink/40 transition-all"
                        >
                          <RotateCcw size={14} /> 90° Left
                        </button>
                        <button
                          onClick={() => handleRotateBy(90)}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-text-secondary hover:text-text-primary hover:border-neon-pink/40 transition-all"
                        >
                          <RotateCw size={14} /> 90° Right
                        </button>
                        <button
                          onClick={() => setFlipH(!flipH)}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                            flipH
                              ? "bg-neon-pink/15 text-neon-pink border-neon-pink/40 shadow-sm shadow-neon-pink/15"
                              : "bg-white/[0.03] border-white/[0.06] text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <FlipHorizontal size={14} /> Flip H
                        </button>
                        <button
                          onClick={() => setFlipV(!flipV)}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                            flipV
                              ? "bg-neon-pink/15 text-neon-pink border-neon-pink/40 shadow-sm shadow-neon-pink/15"
                              : "bg-white/[0.03] border-white/[0.06] text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <FlipVertical size={14} /> Flip V
                        </button>
                      </div>

                      {/* Fine Rotation Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-text-muted uppercase tracking-wider font-semibold">Rotation</span>
                          <span className="font-bold text-neon-pink text-xs tabular-nums">{rotateAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={rotateAngle}
                          onChange={(e) => setRotateAngle(Number(e.target.value))}
                          className="slider-pink"
                        />
                        <div className="flex items-center justify-between text-[9px] text-text-muted">
                          <span>-180°</span>
                          <button
                            onClick={() => setRotateAngle(0)}
                            className="text-neon-pink hover:underline font-semibold"
                          >
                            Reset to 0°
                          </button>
                          <span>+180°</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── ACTION EXECUTE BUTTON ──────────────────────────── */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <FloatingButton
                    onClick={handleProcessStudio}
                    disabled={processing.status === "processing"}
                    size="lg"
                    glowColor="rgba(168, 85, 247, 0.5)"
                    className="w-full"
                  >
                    {processing.status === "processing" ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Process & Download</span>
                        <span className="text-[10px] opacity-70 ml-1">
                          ({targetSizeMode === "target" ? `${targetKb} KB` : "HD"})
                        </span>
                      </>
                    )}
                  </FloatingButton>

                  <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all"
                  >
                    <ResetIcon size={13} /> Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {processing.status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="studio-panel rounded-xl p-4 border-red-500/30"
              style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
            >
              <p className="text-red-400 text-sm font-medium">{processing.error}</p>
              <button
                onClick={onReset}
                className="mt-2 text-xs text-red-300 hover:text-red-200 underline font-semibold"
              >
                Try again with a different image
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
