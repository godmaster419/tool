"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { FileDown, Download, RotateCcw } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";
import { formatFileSize } from "@/lib/utils";

export default function PdfCompressToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["application/pdf", ".pdf"] });
  const processing = useProcessing();

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    const formData = new FormData();
    formData.append("file", upload.file);
    await processing.processFile("/api/pdf/compress", formData, `compressed-${upload.file.name}`);
  }, [upload.file, processing]);

  const handleReset = useCallback(() => { upload.reset(); processing.reset(); }, [upload, processing]);

  const metadata = processing.metadata as { originalSize?: number; compressedSize?: number; savings?: number } | null;

  return (
    <ToolLayout title="PDF Compressor" description="Reduce PDF file size while maintaining document quality" icon={FileDown} gradient="from-rose-500 to-pink-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["application/pdf", ".pdf"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a PDF to compress" />
      )}

      {upload.file && processing.status !== "complete" && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} onRemove={handleReset} acceptedFormats={[]} />
          <div className="glass rounded-2xl p-5">
            <p className="text-sm text-text-secondary">Original size: <span className="text-text-primary font-medium">{formatFileSize(upload.file.size)}</span></p>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing.status === "processing"} glowColor="rgba(244, 63, 94, 0.4)">{processing.status === "processing" ? "Compressing..." : "Compress PDF"}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {processing.status === "complete" && processing.resultUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {metadata?.savings !== undefined && (
            <div className="glass rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold gradient-text mb-2">{metadata.savings}%</div>
              <p className="text-text-muted text-sm">file size reduced</p>
              {metadata.originalSize && metadata.compressedSize && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-medium text-text-secondary">{formatFileSize(metadata.originalSize)}</div>
                    <div className="text-xs text-text-muted">Original</div>
                  </div>
                  <span className="text-text-muted">→</span>
                  <div className="text-center">
                    <div className="text-lg font-medium text-neon-green">{formatFileSize(metadata.compressedSize)}</div>
                    <div className="text-xs text-text-muted">Compressed</div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <a href={processing.resultUrl} download={processing.resultFilename || "compressed.pdf"}><FloatingButton glowColor="rgba(16, 185, 129, 0.4)"><Download size={18} /> Download PDF</FloatingButton></a>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Compress Another</FloatingButton>
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
