"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Palette, Download, Sparkles, Image as ImageIcon, Check } from "lucide-react";
import FloatingButton from "./FloatingButton";

interface BackgroundReplacerProps {
  transparentImageUrl: string;
  originalFileName?: string;
}

const PRESET_COLORS = [
  { name: "Transparent", value: "transparent", isTransparent: true },
  { name: "Pure White", value: "#FFFFFF" },
  { name: "Studio Dark", value: "#12121e" },
  { name: "Soft Grey", value: "#E2E8F0" },
  { name: "Neon Blue", value: "#3B82F6" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Coral Red", value: "#EF4444" },
  { name: "Golden Amber", value: "#F59E0B" },
];

const PRESET_GRADIENTS = [
  { name: "Cyberpunk", value: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)" },
  { name: "Sunset Gold", value: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)" },
  { name: "Ocean Breeze", value: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" },
  { name: "Emerald Glow", value: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
  { name: "Studio Soft", value: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)" },
];

export default function BackgroundReplacer({
  transparentImageUrl,
  originalFileName = "image.png",
}: BackgroundReplacerProps) {
  const [activeBg, setActiveBg] = useState<string>("transparent");
  const [customColor, setCustomColor] = useState<string>("#3b82f6");
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomBgImage(url);
      setActiveBg("custom_image");
    }
  };

  const exportCompositeImage = useCallback(async () => {
    setIsExporting(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = transparentImageUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (activeBg === "transparent") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (activeBg === "custom_image" && customBgImage) {
        const bgImg = new Image();
        bgImg.src = customBgImage;
        await new Promise((res, rej) => {
          bgImg.onload = res;
          bgImg.onerror = rej;
        });
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else if (activeBg.startsWith("linear-gradient")) {
        // Simple linear gradient approximation on canvas
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (activeBg.includes("#a855f7")) {
          grad.addColorStop(0, "#a855f7");
          grad.addColorStop(1, "#3b82f6");
        } else if (activeBg.includes("#f97316")) {
          grad.addColorStop(0, "#f97316");
          grad.addColorStop(1, "#ec4899");
        } else if (activeBg.includes("#06b6d4")) {
          grad.addColorStop(0, "#06b6d4");
          grad.addColorStop(1, "#3b82f6");
        } else if (activeBg.includes("#059669")) {
          grad.addColorStop(0, "#059669");
          grad.addColorStop(1, "#10b981");
        } else {
          grad.addColorStop(0, "#f1f5f9");
          grad.addColorStop(1, "#cbd5e1");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = activeBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw foreground transparent image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mime = activeBg === "transparent" ? "image/png" : "image/jpeg";
      const ext = activeBg === "transparent" ? ".png" : "-custom-bg.jpg";
      const dataUrl = canvas.toDataURL(mime, 0.95);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = originalFileName.replace(/\.[^.]+$/, ext);
      a.click();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [transparentImageUrl, activeBg, customBgImage, originalFileName]);

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-glass-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
            <Palette size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Custom Backdrop Studio</h3>
            <p className="text-xs text-text-muted">Replace background with studio colors, gradients or custom photo</p>
          </div>
        </div>
        <FloatingButton
          size="sm"
          variant="primary"
          glowColor="rgba(168,85,247,0.4)"
          onClick={exportCompositeImage}
          disabled={isExporting}
        >
          <Download size={14} />
          {activeBg === "transparent" ? "Download PNG" : "Download Custom BG"}
        </FloatingButton>
      </div>

      {/* Preview Area with Selected Background */}
      <div
        className="relative w-full rounded-xl overflow-hidden flex items-center justify-center p-6 min-h-[320px] transition-all duration-500 border border-glass-border shadow-inner"
        style={{
          background:
            activeBg === "transparent"
              ? "repeating-conic-gradient(rgba(255,255,255,0.07) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px #0c0d19"
              : activeBg === "custom_image" && customBgImage
              ? `url(${customBgImage}) center/cover no-repeat`
              : activeBg,
        }}
      >
        <img
          src={transparentImageUrl}
          alt="Subject with background replaced"
          className="max-h-[360px] w-auto object-contain drop-shadow-xl"
        />
      </div>

      {/* Palette Selector */}
      <div className="space-y-4">
        {/* Solid colors */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-2.5 block">
            Solid Colors
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {PRESET_COLORS.map((col) => (
              <button
                key={col.name}
                onClick={() => setActiveBg(col.value)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all relative ${
                  activeBg === col.value
                    ? "ring-2 ring-neon-purple ring-offset-2 ring-offset-void scale-110 border-white"
                    : "border-white/20 hover:scale-105"
                }`}
                style={{
                  background: col.isTransparent
                    ? "repeating-conic-gradient(rgba(255,255,255,0.3) 0% 25%, transparent 0% 50%) 0 0 / 8px 8px #222"
                    : col.value,
                }}
                title={col.name}
              >
                {activeBg === col.value && (
                  <Check
                    size={14}
                    className={col.value === "#FFFFFF" || col.name === "Soft Grey" ? "text-black" : "text-white"}
                  />
                )}
              </button>
            ))}

            {/* Custom Color Input */}
            <div className="relative flex items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setActiveBg(e.target.value);
                }}
                className="w-9 h-9 rounded-xl border border-white/20 cursor-pointer opacity-0 absolute inset-0 z-10"
              />
              <div
                className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center"
                style={{ background: customColor }}
              >
                <Sparkles size={14} className="text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Gradients */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-2.5 block">
            Studio Gradients
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {PRESET_GRADIENTS.map((grad) => (
              <button
                key={grad.name}
                onClick={() => setActiveBg(grad.value)}
                className={`h-9 px-3.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeBg === grad.value
                    ? "ring-2 ring-neon-purple ring-offset-2 ring-offset-void scale-105 border-white text-white"
                    : "border-white/10 hover:border-white/30 text-white/80"
                }`}
                style={{ background: grad.value }}
              >
                {activeBg === grad.value && <Check size={12} />}
                <span>{grad.name}</span>
              </button>
            ))}

            {/* Custom Image Upload as Background */}
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomBgUpload}
              className="hidden"
            />
            <button
              onClick={() => bgInputRef.current?.click()}
              className={`h-9 px-3.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all bg-glass border-glass-border hover:bg-glass-hover text-text-secondary hover:text-text-primary ${
                activeBg === "custom_image" ? "ring-2 ring-neon-cyan border-neon-cyan text-neon-cyan" : ""
              }`}
            >
              <ImageIcon size={14} />
              <span>Upload Custom Backdrop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
