"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Layers, Download, RotateCcw, X, FileImage } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { formatFileSize } from "@/lib/utils";

export default function BulkResizeToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"], multiple: true });
  const [width, setWidth] = useState(800);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Array<{ filename: string; data: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = useCallback(async () => {
    if (upload.files.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      upload.files.forEach((f) => formData.append("files", f));
      formData.append("width", String(width));
      const res = await fetch("/api/image/bulk-resize", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Bulk resize failed");
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("json")) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        const blob = await res.blob();
        setResults([{ filename: `resized-${upload.files[0].name}`, data: URL.createObjectURL(blob) }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setProcessing(false); }
  }, [upload.files, width]);

  const handleReset = useCallback(() => { upload.reset(); setResults([]); setError(null); }, [upload]);

  return (
    <ToolLayout title="Bulk Image Resizer" description="Resize multiple images at once with batch processing" icon={Layers} gradient="from-cyan-500 to-blue-600">
      {upload.files.length === 0 && results.length === 0 && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} multiple label="Drop multiple images to resize" />
      )}

      {upload.files.length > 0 && results.length === 0 && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{upload.files.length} Files Selected</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {upload.files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-glass">
                  <FileImage size={16} className="text-neon-cyan shrink-0" />
                  <span className="text-sm text-text-primary truncate flex-1">{f.name}</span>
                  <span className="text-xs text-text-muted">{formatFileSize(f.size)}</span>
                  <button onClick={() => upload.removeFile(i)} className="text-text-muted hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()} className="mt-3 text-xs text-neon-purple hover:underline">+ Add more files</button>
          </div>
          <div className="glass rounded-2xl p-6">
            <label className="text-xs text-text-muted uppercase mb-1 block">Target Width (px)</label>
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="glass-input w-40 px-4 py-3 text-sm" min={1} />
            <p className="text-xs text-text-muted mt-2">Height will be calculated automatically to maintain aspect ratio.</p>
          </div>
          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={processing}>{processing ? "Processing..." : `Resize ${upload.files.length} Images`}</FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Results ({results.length} images)</h3>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-glass border border-glass-border">
                  <FileImage size={16} className="text-neon-green shrink-0" />
                  <span className="text-sm text-text-primary truncate flex-1">{r.filename}</span>
                  <a href={r.data.startsWith("blob:") ? r.data : `data:image/jpeg;base64,${r.data}`} download={r.filename} className="text-neon-cyan hover:text-neon-blue transition-colors"><Download size={16} /></a>
                </div>
              ))}
            </div>
          </div>
          <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Resize More</FloatingButton>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border mt-6">
          <p className="text-red-400">{error}</p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
