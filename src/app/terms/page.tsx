import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use — Media Suite",
  description: "Terms of Use for Media Suite media and document tools.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-28 sm:pt-32 pb-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-cyan-600 flex items-center justify-center">
            <FileCheck size={20} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Terms of Use</h1>
        </div>

        <div className="glass-card p-8 space-y-6 text-text-secondary leading-relaxed">
          <p className="text-xs text-text-muted">Last updated: August 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Media Suite, you agree to comply with and be bound by these Terms of Use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">2. Permitted Use</h2>
            <p>
              You may use our free media processing tools for personal and lawful commercial workflows. You agree not to
              attempt to abuse, disrupt, or perform malicious actions against the service infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">3. Intellectual Property</h2>
            <p>
              You retain all ownership and copyright to the files and content you process with Media Suite.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">4. Modifications</h2>
            <p>
              We reserve the right to modify or discontinue any part of the service at any time without prior notice.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
