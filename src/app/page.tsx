"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Lock } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import ToolCategoryCard from "@/components/tools/ToolCategoryCard";
import FloatingButton from "@/components/ui/FloatingButton";

/* ─────────────────────────────────────────────────────────────
   HERO
   Responsive: mobile-first, compact, balanced on desktop.
   ───────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      className="
        relative isolate overflow-hidden
        px-4 sm:px-6 lg:px-8
        min-h-[calc(100vh-76px)] sm:min-h-[calc(100vh-80px)]
        flex flex-col items-center justify-center
        py-12 sm:py-16 lg:py-20
      "
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_50%_18%,rgba(168,85,247,0.14),transparent_32%),
              radial-gradient(circle_at_75%_38%,rgba(59,130,246,0.08),transparent_28%)]
        "
      />

      {/* Orbital rings — hidden on very small screens to keep the UI clean */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-1/2
          hidden -translate-x-1/2 -translate-y-1/2 opacity-30
          sm:block
        "
      >
        {[280, 420, 560].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-white/[0.055]"
            style={{
              width: size,
              height: size,
              top: -size / 2,
              left: -size / 2,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 34 + i * 12,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                top: -3,
                left: size / 2 - 3,
                background: [
                  "rgba(168,85,247,0.65)",
                  "rgba(59,130,246,0.65)",
                  "rgba(6,182,212,0.65)",
                ][i],
                boxShadow: [
                  "0 0 14px rgba(168,85,247,0.55)",
                  "0 0 14px rgba(59,130,246,0.55)",
                  "0 0 14px rgba(6,182,212,0.55)",
                ][i],
              }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.45,
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="
            mx-auto mb-5 inline-flex max-w-full items-center gap-2
            rounded-full border border-neon-purple/20
            bg-neon-purple/[0.08]
            px-3 py-1.5
            text-[11px] font-semibold tracking-wide text-neon-purple
            shadow-[0_0_30px_rgba(168,85,247,0.08)]
            sm:px-3.5 sm:text-xs
          "
        >
          <Sparkles size={13} className="shrink-0" />
          <span>25+ Professional Media Tools</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="
            mx-auto max-w-4xl
            text-[2.15rem] font-extrabold leading-[1.08]
            tracking-[-0.035em]
            sm:text-5xl sm:leading-[1.08]
            md:text-6xl
            lg:text-[4.25rem]
          "
        >
          <span className="text-text-primary">Media Tools </span>
          <span className="gradient-text">Made Fast & Simple</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="
            mx-auto mt-5 max-w-2xl
            text-sm leading-6 text-text-secondary
            sm:mt-6 sm:text-base sm:leading-7
            lg:text-[17px]
          "
        >
          Image editing, PDF conversion, OCR, video compression, and
          AI-powered creative utilities — all free, fast, and processed
          privately in memory.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="
            mt-7 flex w-full flex-col items-stretch justify-center gap-3
            sm:mt-8 sm:flex-row sm:items-center
          "
        >
          <Link href="/tools" className="w-full sm:w-auto">
            <FloatingButton
              size="md"
              glowColor="rgba(168, 85, 247, 0.4)"
              className="w-full justify-center sm:w-auto"
            >
              <span>Explore All Tools</span>
              <ArrowRight size={17} />
            </FloatingButton>
          </Link>

          <Link href="#categories" className="w-full sm:w-auto">
            <FloatingButton
              variant="ghost"
              size="md"
              className="w-full justify-center sm:w-auto"
            >
              <span>View Categories</span>
            </FloatingButton>
          </Link>
        </motion.div>

        {/* Trust / product points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.6 }}
          className="
            mx-auto mt-9 grid max-w-2xl
            grid-cols-1 gap-2.5
            sm:mt-10 sm:grid-cols-3 sm:gap-3
          "
        >
          {[
            {
              icon: Zap,
              title: "Fast Processing",
              text: "Optimized tools",
            },
            {
              icon: ShieldCheck,
              title: "100% Free",
              text: "No hidden charges",
            },
            {
              icon: Lock,
              title: "Private by Design",
              text: "No uploads stored",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="
                flex items-center justify-center gap-2.5
                rounded-xl border border-white/[0.06]
                bg-white/[0.025] px-3 py-2.5
                text-left backdrop-blur-sm
              "
            >
              <Icon
                size={15}
                className="shrink-0 text-neon-purple"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-text-primary">
                  {title}
                </div>
                <div className="text-[10px] text-text-muted">{text}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.6 }}
          className="
            mx-auto mt-8 grid max-w-xl
            grid-cols-3
            border-t border-glass-border/40
            pt-6 sm:mt-9 sm:pt-7
          "
        >
          {[
            { value: "25+", label: "Tools" },
            { value: "100%", label: "Free" },
            { value: "0", label: "Stored Uploads" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`
                px-2 text-center
                ${index > 0 ? "border-l border-glass-border/40" : ""}
              `}
            >
              <div className="text-xl font-bold gradient-text sm:text-2xl">
                {stat.value}
              </div>
              <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-text-muted sm:text-[10px]">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORIES
   ───────────────────────────────────────────────────────────── */

function CategoriesSection() {
  return (
    <section
      id="categories"
      className="
        relative w-full scroll-mt-24
        px-4 pb-28
        sm:px-6 sm:pb-32
        lg:px-8 lg:pb-36
      "
    >
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Section header */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mb-2.5"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-muted">
              Explore the suite
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="
              text-2xl font-bold tracking-[-0.02em]
              sm:text-3xl lg:text-4xl
            "
          >
            <span className="gradient-text">Top Tool Categories</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.08 }}
            className="
              mx-auto mt-3 max-w-xl
              text-xs leading-5 text-text-muted
              sm:text-sm sm:leading-6
            "
          >
            Everything you need for media processing, organized cleanly in one
            place.
          </motion.p>
        </div>

        {/* Responsive category grid */}
        <div
          className="
            grid grid-cols-1 items-stretch gap-4
            sm:gap-5
            md:grid-cols-2
            lg:grid-cols-3 lg:gap-6
            xl:gap-7
          "
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{
                duration: 0.45,
                delay: Math.min(i * 0.05, 0.25),
              }}
              className="min-w-0"
            >
              <ToolCategoryCard
                name={cat.name}
                description={cat.description}
                icon={cat.icon}
                gradient={cat.gradient}
                glowColor={cat.glowColor}
                categoryId={cat.id}
                index={i}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main className="min-h-screen w-full overflow-x-clip">
      <HeroSection />
      <CategoriesSection />
    </main>
  );
}