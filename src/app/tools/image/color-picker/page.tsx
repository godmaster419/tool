"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pipette, Copy, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";

interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

export default function ColorPickerToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const [colors, setColors] = useState<ColorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", upload.file);
      formData.append("count", "8");
      const res = await fetch("/api/image/color-picker", { method: "POST", body: formData });
      const data = await res.json();
      if (data.colors) setColors(data.colors);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [upload.file]);

  const copyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const handleReset = useCallback(() => { upload.reset(); setColors([]); }, [upload]);

  return (
    <ToolLayout title="Color Picker" description="Extract dominant colors and palettes from any image" icon={Pipette} gradient="from-violet-500 to-purple-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to extract colors" />
      )}

      {upload.file && colors.length === 0 && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={loading}>{loading ? "Extracting..." : "Extract Colors"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Preview + palette side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-4 overflow-hidden">
              {upload.preview && <img src={upload.preview} alt="Source" className="w-full h-auto rounded-xl max-h-80 object-contain" />}
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Extracted Palette</h3>
              <div className="space-y-3">
                {colors.map((color, i) => (
                  <motion.button key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => copyColor(color.hex)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-glass hover:bg-glass-hover border border-glass-border transition-all group">
                    <div className="w-10 h-10 rounded-lg shrink-0 border border-white/10" style={{ backgroundColor: color.hex }} />
                    <div className="flex-1 text-left">
                      <span className="text-sm font-mono font-medium text-text-primary">{color.hex}</span>
                      <p className="text-xs text-text-muted">rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b}) · {color.percentage}%</p>
                    </div>
                    <Copy size={14} className={`transition-all ${copied === color.hex ? "text-neon-green" : "text-text-muted opacity-0 group-hover:opacity-100"}`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Full palette bar */}
          <div className="glass rounded-2xl p-4">
            <div className="flex rounded-xl overflow-hidden h-16">
              {colors.map((color, i) => (
                <div key={i} className="flex-1 cursor-pointer hover:flex-[2] transition-all duration-300" style={{ backgroundColor: color.hex }} title={color.hex} onClick={() => copyColor(color.hex)} />
              ))}
            </div>
          </div>

          <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Pick from Another Image</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
