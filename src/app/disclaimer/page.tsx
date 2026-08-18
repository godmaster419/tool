import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer — Media Suite",
  description: "Disclaimer and limitation of liability for Media Suite.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen pt-36 sm:pt-40 pb-32 sm:pb-36 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-orange to-amber-600 flex items-center justify-center">
            <AlertCircle size={20} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Disclaimer</h1>
        </div>

        <div className="glass-card p-8 space-y-6 text-text-secondary leading-relaxed">
          <p className="text-xs text-text-muted">Last updated: August 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">1. "As Is" Warranty</h2>
            <p>
              Media Suite and its conversion/processing tools are provided on an "as is" and "as available" basis
              without warranties of any kind, whether express or implied.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">2. Accuracy & AI Outputs</h2>
            <p>
              While we strive to provide high-quality conversions, OCR text extraction and AI models may produce
              variations depending on input quality. Users are advised to review converted files and extracted text.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">3. Limitation of Liability</h2>
            <p>
              In no event shall Media Suite be liable for any direct, indirect, incidental, or consequential damages
              resulting from the use or inability to use this service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
