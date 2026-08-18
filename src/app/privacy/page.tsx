import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Media Suite",
  description: "Privacy Policy for Media Suite. Learn how we handle and protect your files and data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-emerald-600 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Privacy Policy</h1>
        </div>

        <div className="glass-card p-8 space-y-6 text-text-secondary leading-relaxed">
          <p className="text-xs text-text-muted">Last updated: August 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">1. Overview</h2>
            <p>
              Media Suite is built with privacy as a foundational principle. We believe your media files,
              documents, and extracted data belong exclusively to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">2. Local & Serverless Processing</h2>
            <p>
              Uploaded files are processed strictly in temporary execution environments in-memory or ephemeral
              temporary storage. Files are automatically destroyed immediately after processing completes. We do not
              permanently store, index, or harvest your media files or text data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">3. No Accounts or Tracking</h2>
            <p>
              We do not require accounts, logins, or payment details. We do not sell or share personal information
              with third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">4. Contact</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us through our official channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
