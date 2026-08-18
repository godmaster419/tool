"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  floatDelay?: number;
  floatDuration?: number;
  floatDistance?: number;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  glowColor = "rgba(168, 85, 247, 0.2)",
  floatDelay = 0,
  floatDuration = 6,
  floatDistance = 12,
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn("glass-card p-6 relative overflow-hidden", className)}
      style={{ "--glow-color": glowColor } as React.CSSProperties}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: floatDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      animate={{
        y: [0, -floatDistance, 0],
      }}
      whileHover={
        hover
          ? {
              y: -floatDistance - 8,
              scale: 1.03,
              transition: { duration: 0.4, ease: "easeOut" },
            }
          : undefined
      }
      onClick={onClick}
    >
      {/* Subtle shimmer overlay */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.5s linear infinite",
        }}
      />
      {children}
    </motion.div>
  );
}
