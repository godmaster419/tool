"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Smile, Download, RotateCcw, Type } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function MemeGeneratorToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const processing = useProcessing();
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(0.08);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    if (!topText && !bottomText) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("topText", topText);
    formData.append("bottomText", bottomText);
    formData.append("fontSize", String(fontSize));
    await processing.processFile("/api/advanced/meme", formData, `meme-${upload.file.name}`);
  }, [upload.file, topText, bottomText, fontSize, processing]);

  const handleReset = useCallback(() => {
    upload.reset();
    processing.reset();
    setTopText("");
    setBottomText("");
    setFontSize(0.08);
  }, [upload, processing]);

  return (
    <ToolLayout title="Meme Generator" description="Create memes with custom text overlays and popular templates" icon={Smile} gradient="from-amber-500 to-yellow-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to create a meme" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          {/* Preview with text overlay indicators */}
          <div className="glass rounded-2xl p-4">
            <div className="relative rounded-xl overflow-hidden bg-abyss">
              {upload.preview && <img src={upload.preview} alt="Meme base" className="w-full h-auto max-h-80 object-contain" />}
              {/* Text preview overlays */}
              {topText && (
                <div className="absolute top-4 left-0 right-0 text-center">
                  <span className="text-white font-black text-2xl uppercase px-3" style={{ textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000" }}>
                    {topText}
                  </span>
                </div>
              )}
              {bottomText && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-white font-black text-2xl uppercase px-3" style={{ textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000" }}>
                    {bottomText}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Text inputs */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Type size={16} />
              Meme Text
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-2 block">Top Text</label>
                <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="TOP TEXT" className="glass-input w-full px-4 py-3 text-sm rounded-xl uppercase font-bold placeholder:font-normal placeholder:normal-case" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-2 block">Bottom Text</label>
                <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="BOTTOM TEXT" className="glass-input w-full px-4 py-3 text-sm rounded-xl uppercase font-bold placeholder:font-normal placeholder:normal-case" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-2 block">Font Size ({Math.round(fontSize * 100)}%)</label>
                <input type="range" min={0.03} max={0.15} step={0.01} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-neon-purple" />
                <div className="flex justify-between text-xs text-text-muted mt-1"><span>Smaller</span><span>Larger</span></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing" || (!topText && !bottomText)}>
              {processing.status === "processing" ? "Generating..." : "Generate Meme"}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Your Meme</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Generated meme" className="w-full h-auto max-h-[500px] object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "meme.jpg"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download Meme</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Create Another</FloatingButton>
          </div>
        </motion.div>
      )}

      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400">{processing.error}</p>
          <p className="text-xs text-text-muted mt-2">Make sure Python 3 and Pillow are installed: <code className="text-neon-cyan">pip3 install Pillow</code></p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
