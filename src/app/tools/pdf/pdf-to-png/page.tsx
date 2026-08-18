"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileImage, Download, RotateCcw, FileText, Settings2 } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function PdfToPngToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["application/pdf", ".pdf"] });
  const processing = useProcessing();
  const [page, setPage] = useState(1);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    formData.append("page", String(page));
    await processing.processFile("/api/pdf/pdf-to-png", formData, upload.file.name.replace(/\.pdf$/i, `-page${page}.png`));
  }, [upload.file, page, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); setPage(1); }, [upload, processing]);

  return (
    <ToolLayout title="PDF to PNG" description="Extract and convert PDF pages into high-quality PNG images" icon={FileImage} gradient="from-orange-500 to-red-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["application/pdf", ".pdf"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a PDF to convert to PNG" />
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
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2"><Settings2 size={16} /> Page Selection</h3>
            <div>
              <label className="text-xs text-text-muted mb-2 block">Page Number</label>
              <input type="number" min={1} max={999} value={page} onChange={(e) => setPage(Math.max(1, Number(e.target.value)))} className="glass-input w-32 px-4 py-2.5 text-sm rounded-xl" />
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>{processing.status === "processing" ? "Converting..." : "Convert to PNG"}</FloatingButton>
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
            <a href={processing.resultUrl} download={processing.resultFilename || `page-${page}.png`}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download PNG</FloatingButton></a>
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
