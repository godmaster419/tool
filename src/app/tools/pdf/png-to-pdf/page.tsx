"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";

export default function PngToPdfToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/png"] });
  const processing = useProcessing();

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    await processing.processFile("/api/pdf/png-to-pdf", formData, upload.file.name.replace(/\.png$/i, ".pdf"));
  }, [upload.file, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  return (
    <ToolLayout title="PNG to PDF" description="Convert PNG images directly into PDF pages" icon={FileText} gradient="from-orange-500 to-red-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/png"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a PNG image to convert to PDF" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-5">
            <p className="text-sm text-text-secondary">Your PNG image will be embedded into a PDF page that fits the image dimensions exactly.</p>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"}>{processing.status === "processing" ? "Converting..." : "Convert to PDF"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
              <FileText size={36} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">PDF Ready</h3>
            <p className="text-sm text-text-muted">Your PNG has been converted to PDF successfully.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <a href={processing.resultUrl} download={processing.resultFilename || "converted.pdf"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download PDF</FloatingButton></a>
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
