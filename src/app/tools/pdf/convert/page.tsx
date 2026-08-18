"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileOutput, Download, RotateCcw, FileText } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function PdfConverterToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["application/pdf", ".pdf"] });
  const processing = useProcessing();
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("format", format);
    const ext = format === "png" ? "png" : "jpg";
    await processing.processFile("/api/pdf/convert", formData, `converted-${upload.file.name.replace(/\.pdf$/i, `.${ext}`)}`);
  }, [upload.file, format, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); setFormat("jpeg"); }, [upload, processing]);

  return (
    <ToolLayout title="PDF Converter" description="Convert PDF pages to JPG or PNG image format" icon={FileOutput} gradient="from-orange-500 to-red-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["application/pdf", ".pdf"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a PDF to convert" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          {/* File info */}
          <div className="glass rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
              <FileText size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{upload.file.name}</p>
              <p className="text-xs text-text-muted">{(upload.file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={handleReset} className="text-text-muted hover:text-text-primary transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Format selector */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Output Format</h3>
            <div className="flex gap-3">
              {([["jpeg", "JPG — Smaller file, compressed"], ["png", "PNG — Lossless, transparent"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setFormat(val)} className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${format === val ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>
              {processing.status === "processing" ? "Converting..." : "Convert PDF"}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Converted Image</h3>
            <div className="rounded-xl overflow-hidden bg-abyss"><img src={processing.resultUrl} alt="Converted" className="w-full h-auto max-h-96 object-contain" /></div>
          </div>
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || `converted.${format === "png" ? "png" : "jpg"}`}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download</FloatingButton></a>
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
