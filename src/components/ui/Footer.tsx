"use client";

import Link from "next/link";
import { Zap, Shield, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const trustHighlights = [
    {
      icon: Zap,
      label: "Lightning Fast Processing",
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10 border-neon-cyan/25",
    },
    {
      icon: Shield,
      label: "100% In-Memory Privacy",
      color: "text-neon-green",
      bg: "bg-neon-green/10 border-neon-green/25",
    },
    {
      icon: Globe,
      label: "Free & Serverless Suite",
      color: "text-neon-purple",
      bg: "bg-neon-purple/10 border-neon-purple/25",
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-void/95 backdrop-blur-2xl border-t border-glass-border shadow-[0_-12px_40px_rgba(0,0,0,0.85)] min-h-[76px] sm:min-h-[82px] flex items-center">
      {/* Top glowing ambient highlight line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1.5px] bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-5 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Left: Trust Badges (Prominent & Clear) */}
        <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6">
          {trustHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border ${item.bg} text-text-secondary transition-all shadow-sm`}
              >
                <Icon size={15} className={item.color} />
                <span className="font-semibold tracking-wide text-xs">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Copyright & Legal Links */}
        <div className="flex items-center gap-6 text-text-muted text-xs">
          <span className="font-medium">© {currentYear} Media Suite</span>
          <span className="w-1 h-1 rounded-full bg-glass-border" />
          <nav aria-label="Footer Legal Links" className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/privacy"
              className="hover:text-neon-purple transition-colors font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-neon-purple transition-colors font-medium"
            >
              Terms of Service
            </Link>
            <Link
              href="/disclaimer"
              className="hover:text-neon-purple transition-colors font-medium"
            >
              Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
