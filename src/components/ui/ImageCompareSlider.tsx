"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, Maximize2, SplitSquareVertical } from "lucide-react";

interface ImageCompareSliderProps {
  originalImage: string;
  processedImage: string;
  originalLabel?: string;
  processedLabel?: string;
  aspectRatio?: string;
  className?: string;
}

export default function ImageCompareSlider({
  originalImage,
  processedImage,
  originalLabel = "Original",
  processedLabel = "Clean AI Result",
  className = "",
}: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setSliderPosition(percent);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleInteractionEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleInteractionEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleInteractionEnd]);

  return (
    <div className={`relative select-none ${className}`}>
      {/* Top Bar with Badges */}
      <div className="flex items-center justify-between px-3 py-2 bg-abyss/80 backdrop-blur-md border-b border-glass-border rounded-t-2xl text-xs">
        <div className="flex items-center gap-2 text-text-secondary font-medium">
          <SplitSquareVertical size={14} className="text-neon-cyan" />
          <span>Interactive Split Slider</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-glass border border-glass-border text-text-muted">
            Drag to compare
          </span>
          <span className="font-mono text-neon-purple font-semibold">
            {Math.round(sliderPosition)}%
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          if (e.touches.length > 0) handleMove(e.touches[0].clientX);
        }}
        className="relative w-full overflow-hidden cursor-ew-resize rounded-b-2xl border border-t-0 border-glass-border bg-black/40 shadow-2xl"
        style={{ minHeight: "380px" }}
      >
        {/* Background checkerboard for transparent image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "repeating-conic-gradient(rgba(255,255,255,0.07) 0% 25%, transparent 0% 50%) 0 0 / 24px 24px #0c0d19",
          }}
        />

        {/* Processed (Background Removed) Image — full container */}
        <div className="relative w-full h-full flex items-center justify-center p-4 min-h-[380px]">
          <img
            src={processedImage}
            alt={processedLabel}
            className="w-full h-auto max-h-[500px] object-contain drop-shadow-2xl pointer-events-none"
            draggable={false}
          />
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-neon-cyan/40 text-neon-cyan text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
            <Sparkles size={12} />
            {processedLabel}
          </div>
        </div>

        {/* Original Image (Clipped by slider position) */}
        <div
          className="absolute inset-0 z-10 overflow-hidden flex items-center justify-center p-4"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={originalImage}
              alt={originalLabel}
              className="w-full h-auto max-h-[500px] object-contain pointer-events-none"
              draggable={false}
            />
          </div>
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-text-primary text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
            <Eye size={12} />
            {originalLabel}
          </div>
        </div>

        {/* Divider Handle Line */}
        <div
          className="absolute top-0 bottom-0 z-30 w-1 bg-gradient-to-b from-neon-cyan via-white to-neon-purple shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          {/* Circular Drag Handle */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-md border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.6)] cursor-grab active:cursor-grabbing transition-colors ${
              isDragging ? "border-neon-cyan scale-110 shadow-[0_0_25px_rgba(6,182,212,0.9)]" : ""
            }`}
          >
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3.5 bg-text-secondary rounded-full" />
              <div className="w-0.5 h-3.5 bg-text-primary rounded-full" />
              <div className="w-0.5 h-3.5 bg-text-secondary rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
