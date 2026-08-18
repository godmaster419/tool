"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import ToolCategoryCard from "@/components/tools/ToolCategoryCard";
import FloatingButton from "@/components/ui/FloatingButton";

// ─── Hero Section (Generous Top Headroom, Compact & Centered) ───────

function HeroSection() {
  return (
    <section className="relative pt-44 sm:pt-48 md:pt-52 pb-12 sm:pb-16 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Orbital rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        {[260, 380, 500].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-glass-border"
            style={{
              width: size,
              height: size,
              top: -size / 2,
              left: -size / 2,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 30 + i * 15,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Orbital dot */}
            <motion.div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: -4,
                left: size / 2 - 4,
                background: `rgba(${
                  ["168,85,247", "59,130,246", "6,182,212"][i]
                }, 0.6)`,
                boxShadow: `0 0 12px rgba(${
                  ["168,85,247", "59,130,246", "6,182,212"][i]
                }, 0.4)`,
              }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-xs font-medium text-neon-purple mb-5 shadow-sm"
        >
          <Sparkles size={13} />
          <span>25+ Professional Media Tools</span>
        </motion.div>

        {/* Compact Heading with Full Headroom */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold leading-[1.14] mb-4 tracking-tight"
        >
          <span className="text-text-primary">Media Tools </span>
          <span className="gradient-text">Made Fast & Simple</span>
        </motion.h1>

        {/* Compact Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-7 leading-relaxed"
        >
          Image editing, PDF conversion, OCR, video compression, and AI-powered
          creative utilities — 100% free, fast, and in-memory private.
        </motion.p>

        {/* Compact CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Link href="/tools">
            <FloatingButton size="md" glowColor="rgba(168, 85, 247, 0.4)">
              <span>Explore All Tools</span>
              <ArrowRight size={17} />
            </FloatingButton>
          </Link>
          <Link href="#categories">
            <FloatingButton variant="ghost" size="md">
              <span>View Categories</span>
            </FloatingButton>
          </Link>
        </motion.div>

        {/* Compact Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-14 border-t border-glass-border/40 pt-7"
        >
          {[
            { value: "25+", label: "Tools" },
            { value: "100%", label: "Free" },
            { value: "0", label: "Uploads Stored" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl sm:text-2xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-[11px] text-text-muted uppercase tracking-widest mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Categories Section (Centered, Compact & Clean) ────────────────

function CategoriesSection() {
  return (
    <section id="categories" className="w-full px-6 sm:px-10 lg:px-16 pt-6 pb-36 relative scroll-mt-28">
      {/* Section heading — Centered & Compact */}
      <div className="w-full max-w-2xl mx-auto mb-9 text-center flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-center"
        >
          <span className="gradient-text">Top Tool Categories</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-xs sm:text-sm max-w-md mx-auto text-center leading-relaxed"
        >
          Everything you need for media processing, organized cleanly in one place.
        </motion.p>
      </div>

      {/* Category Folder Cards Grid — Screen Centered */}
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center items-stretch">
        {CATEGORIES.map((cat, i) => (
          <ToolCategoryCard
            key={cat.id}
            name={cat.name}
            description={cat.description}
            icon={cat.icon}
            gradient={cat.gradient}
            glowColor={cat.glowColor}
            categoryId={cat.id}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
    </main>
  );
}
