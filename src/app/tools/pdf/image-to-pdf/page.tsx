"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileImage, Download, RotateCcw, X } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";
import { formatFileSize } from "@/lib/utils";

export default function ImageToPdfToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"], multiple: true });
  const processing = useProcessing();
  const [pageSize, setPageSize] = useState("a4");

  const handleProcess = useCallback(async () => {
    if (upload.files.length === 0) return;
    const formData = new FormData();
    upload.files.forEach((f) => formData.append("files", f));
    formData.append("pageSize", pageSize);
    await processing.processFile("/api/pdf/image-to-pdf", formData, "images.pdf");
  }, [upload.files, pageSize, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  return (
    <ToolLayout title="Image to PDF" description="Convert one or more images into a single PDF document" icon={FileImage} gradient="from-rose-500 to-pink-600">
      {upload.files.length === 0 && processing.status !== "complete" && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} multiple label="Drop images to create PDF" />
      )}

      {upload.files.length > 0 && processing.status !== "complete" && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{upload.files.length} Image{upload.files.length > 1 ? "s" : ""} Selected</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {upload.files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-glass">
                  <FileImage size={16} className="text-neon-pink shrink-0" />
                  <span className="text-sm text-text-primary truncate flex-1">{f.name}</span>
                  <span className="text-xs text-text-muted">{formatFileSize(f.size)}</span>
                  <button onClick={() => upload.removeFile(i)} className="text-text-muted hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Page Size</h3>
            <div className="flex gap-3">
              {[{ l: "A4", v: "a4" }, { l: "Letter", v: "letter" }, { l: "Fit Image", v: "fit" }].map((p) => (
                <button key={p.v} onClick={() => setPageSize(p.v)} className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${pageSize === p.v ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white" : "bg-glass border border-glass-border text-text-secondary hover:text-text-primary"}`}>
                  {p.l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"} glowColor="rgba(244, 63, 94, 0.4)">{processing.status === "processing" ? "Creating PDF..." : "Create PDF"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
              <FileImage size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-1">PDF Created!</h3>
            <p className="text-sm text-text-muted">{upload.files.length} image{upload.files.length > 1 ? "s" : ""} merged into one PDF</p>
          </div>
          <div className="flex gap-3 justify-center">
            <a href={processing.resultUrl} download={processing.resultFilename || "images.pdf"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download PDF</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Create Another</FloatingButton>
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
