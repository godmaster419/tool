"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ScanText, Copy, RotateCcw, Check, Languages } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import FloatingButton from "@/components/ui/FloatingButton";
import { useFileUpload } from "@/hooks/useFileUpload";

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "hin", label: "Hindi" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "ara", label: "Arabic" },
  { code: "por", label: "Portuguese" },
];

interface OcrResult {
  text: string;
  confidence: number;
  language: string;
  lineCount: number;
  wordCount: number;
  characterCount: number;
}

export default function ImageToTextToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["image/jpeg", "image/png", "image/webp"] });
  const [language, setLanguage] = useState("eng");
  const [result, setResult] = useState<OcrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", upload.file);
      formData.append("language", language);
      const res = await fetch("/api/ocr/image-to-text", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `OCR failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR processing failed");
    } finally {
      setLoading(false);
    }
  }, [upload.file, language]);

  const copyText = useCallback(() => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    upload.reset();
    setResult(null);
    setError(null);
    setLanguage("eng");
  }, [upload]);

  return (
    <ToolLayout title="Image to Text" description="Extract text from images using AI-powered optical character recognition" icon={ScanText} gradient="from-pink-500 to-rose-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["image/jpeg", "image/png", "image/webp"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop an image to extract text" />
      )}

      {upload.file && !result && !error && (
        <div className="space-y-6">
          <FileDropzone onFiles={upload.onFileSelect} file={upload.file} preview={upload.preview} onRemove={handleReset} acceptedFormats={[]} />

          {/* Language selector */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Languages size={16} />
              OCR Language
            </h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${language === lang.code ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary hover:border-glass-border-hover"}`}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <FloatingButton onClick={handleProcess} disabled={loading}>
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <ScanText size={18} />
                  Extract Text
                </>
              )}
            </FloatingButton>
            <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Reset</FloatingButton>
          </div>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Confidence", value: `${result.confidence}%` },
              { label: "Words", value: result.wordCount },
              { label: "Lines", value: result.lineCount },
              { label: "Characters", value: result.characterCount },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 text-center">
                <div className="text-xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Extracted text */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Extracted Text</h3>
              <button onClick={copyText} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-glass border border-glass-border text-text-muted hover:text-text-primary transition-all">
                {copied ? <><Check size={14} className="text-neon-green" /> Copied!</> : <><Copy size={14} /> Copy All</>}
              </button>
            </div>
            <div className="bg-abyss rounded-xl p-5 max-h-96 overflow-y-auto">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed">{result.text || "No text detected in this image."}</pre>
            </div>
          </div>

          {/* Image preview */}
          {upload.preview && (
            <div className="glass rounded-2xl p-4">
              <img src={upload.preview} alt="Source" className="w-full h-auto rounded-xl max-h-60 object-contain" />
            </div>
          )}

          <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Extract from Another Image</FloatingButton>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border-red-500/30 border">
          <p className="text-red-400">{error}</p>
          <FloatingButton variant="ghost" onClick={handleReset} className="mt-4">Try Again</FloatingButton>
        </motion.div>
      )}
    </ToolLayout>
  );
}
