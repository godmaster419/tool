"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: LucideIcon;
  gradient?: string;
  backHref?: string;
  backLabel?: string;
}

export default function ToolLayout({
  children,
  title,
  description,
  icon: Icon,
  gradient = "from-neon-purple to-neon-blue",
  backHref = "/",
  backLabel = "All Tools",
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen pt-36 sm:pt-40 pb-32 sm:pb-36 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>{backLabel}</span>
          </Link>
        </motion.div>

        {/* Tool header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            {Icon && (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <Icon size={24} className="text-white" />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              {title}
            </h1>
          </div>
          <p className="text-text-secondary text-lg max-w-2xl">{description}</p>
        </motion.div>

        {/* Tool content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
