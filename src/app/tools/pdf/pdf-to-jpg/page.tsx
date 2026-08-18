"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileImage, Download, RotateCcw, FileText, Settings2 } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function PdfToJpgToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["application/pdf", ".pdf"] });
  const processing = useProcessing();
  const [page, setPage] = useState(1);
  const [quality, setQuality] = useState(90);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("page", String(page));
    formData.append("quality", String(quality));
    await processing.processFile("/api/pdf/pdf-to-jpg", formData, upload.file.name.replace(/\.pdf$/i, `-page${page}.jpg`));
  }, [upload.file, page, quality, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); setPage(1); setQuality(90); }, [upload, processing]);

  return (
    <ToolLayout title="PDF to JPG" description="Extract and convert PDF pages into JPG images" icon={FileImage} gradient="from-orange-500 to-red-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["application/pdf", ".pdf"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a PDF to convert to JPG" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
              <FileText size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{upload.file.name}</p>
              <p className="text-xs text-text-muted">{(upload.file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleReset} className="text-text-muted hover:text-text-primary transition-colors"><RotateCcw size={16} /></button>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2"><Settings2 size={16} /> Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-text-muted mb-2 block">Page Number</label>
                <input type="number" min={1} max={999} value={page} onChange={(e) => setPage(Math.max(1, Number(e.target.value)))} className="glass-input w-full px-4 py-2.5 text-sm rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-2 block">Quality ({quality}%)</label>
                <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-neon-purple" />
                <div className="flex justify-between text-xs text-text-muted mt-1"><span>Smaller</span><span>Higher Quality</span></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>{processing.status === "processing" ? "Converting..." : "Convert to JPG"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Result — Page {page}</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="PDF page" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || `page-${page}.jpg`}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download JPG</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Convert Another</FloatingButton>
          </div>
        </motion.div>
      )}

      {processing.status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400">{processing.error}</p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
