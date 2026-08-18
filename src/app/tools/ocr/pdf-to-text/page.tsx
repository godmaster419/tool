"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ScanText, Copy, RotateCcw, Check, Languages, FileText } from "lucide-react";
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
];

interface PageResult {
  page: number;
  text: string;
  confidence: number;
}

interface OcrPdfResult {
  text: string;
  pages: PageResult[];
  language: string;
  pageCount: number;
  totalCharacters: number;
  averageConfidence: number;
}

export default function PdfToTextToolPage() {
  const upload = useFileUpload({ acceptedFormats: ["application/pdf", ".pdf"] });
  const [language, setLanguage] = useState("eng");
  const [result, setResult] = useState<OcrPdfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activePage, setActivePage] = useState<number | null>(null);

  const handleProcess = useCallback(async () => {
    if (!upload.file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", upload.file);
      formData.append("language", language);
      const res = await fetch("/api/ocr/pdf-to-text", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `PDF OCR failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF OCR processing failed");
    } finally {
      setLoading(false);
    }
  }, [upload.file, language]);

  const copyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleReset = useCallback(() => {
    upload.reset();
    setResult(null);
    setError(null);
    setActivePage(null);
    setLanguage("eng");
  }, [upload]);

  const displayText = activePage !== null
    ? result?.pages.find((p) => p.page === activePage)?.text || ""
    : result?.text || "";

  return (
    <ToolLayout title="PDF to Text" description="Extract all text content from PDF documents with OCR" icon={ScanText} gradient="from-pink-500 to-rose-600">
      {!upload.file && (
        <FileDropzone onFiles={upload.onFileSelect} acceptedFormats={["application/pdf", ".pdf"]} isDragging={upload.isDragging} onDragOver={upload.onDragOver} onDragLeave={upload.onDragLeave} onDrop={upload.onDrop} error={upload.error} label="Drop a PDF to extract text" />
      )}

      {upload.file && !result && !error && (
        <div className="space-y-6">
          {/* File info */}
          <div className="glass rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shrink-0">
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

          {/* Language selector */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Languages size={16} />
              OCR Language
            </h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${language === lang.code ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary"}`}>
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
                  Processing PDF...
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

          {loading && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-sm text-text-secondary">Processing PDF pages with OCR... This may take a while for multi-page documents.</p>
            </div>
          )}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Pages", value: result.pageCount },
              { label: "Avg Confidence", value: `${result.averageConfidence}%` },
              { label: "Characters", value: result.totalCharacters.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 text-center">
                <div className="text-xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Page tabs */}
          {result.pages.length > 1 && (
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActivePage(null)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activePage === null ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary"}`}>
                  All Pages
                </button>
                {result.pages.map((p) => (
                  <button key={p.page} onClick={() => setActivePage(p.page)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activePage === p.page ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-glass border border-glass-border text-text-muted hover:text-text-primary"}`}>
                    Page {p.page}
                    <span className="ml-1.5 text-[10px] opacity-60">{p.confidence}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extracted text */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                {activePage !== null ? `Page ${activePage}` : "Full Text"}
              </h3>
              <button onClick={() => copyText(displayText)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-glass border border-glass-border text-text-muted hover:text-text-primary transition-all">
                {copied ? <><Check size={14} className="text-neon-green" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <div className="bg-abyss rounded-xl p-5 max-h-[500px] overflow-y-auto">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed">{displayText || "No text detected."}</pre>
            </div>
          </div>

          <FloatingButton variant="ghost" onClick={handleReset}><RotateCcw size={16} /> Extract from Another PDF</FloatingButton>
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
