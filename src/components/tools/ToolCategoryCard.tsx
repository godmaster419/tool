"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { getToolsByCategory, type ToolCategory } from "@/lib/constants";

interface ToolCategoryCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
  categoryId: ToolCategory;
  index: number;
}

export default function ToolCategoryCard({
  name,
  description,
  icon: Icon,
  gradient,
  glowColor,
  categoryId,
  index,
}: ToolCategoryCardProps) {
  const tools = getToolsByCategory(categoryId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <motion.div
        className="glass-card p-7 h-full group cursor-pointer relative overflow-hidden"
        style={{ "--glow-color": glowColor } as React.CSSProperties}
        animate={{
          y: [0, -8 - (index % 3) * 2, 0],
        }}
        transition={{
          duration: 5 + index * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3,
        }}
        whileHover={{
          y: -16,
          scale: 1.03,
          transition: { duration: 0.35, ease: "easeOut" },
        }}
      >
        {/* Background glow effect */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"
          style={{ background: glowColor.replace("0.3", "0.6") }}
        />

        {/* Top Folder Header */}
        <div className="flex items-center justify-between mb-5">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
            style={{
              boxShadow: `0 8px 24px -8px ${glowColor}`,
            }}
          >
            <Icon size={26} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-text-muted group-hover:text-text-secondary transition-colors">
            {tools.length} Tools
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:gradient-text transition-all duration-300">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-secondary mb-5 leading-relaxed min-h-[38px]">
          {description}
        </p>


        {/* Tool links */}
        <div className="space-y-1.5 mb-5">
          {tools.slice(0, 4).map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-glass transition-all duration-200 group/tool"
              >
                <ToolIcon
                  size={15}
                  className="opacity-50 group-hover/tool:opacity-100 transition-opacity"
                />
                <span>{tool.name}</span>
                {tool.badge && (
                  <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                    {tool.badge}
                  </span>
                )}
              </Link>
            );
          })}
          {tools.length > 4 && (
            <p className="text-xs text-text-muted pl-3 pt-1">
              +{tools.length - 4} more tools
            </p>
          )}
        </div>

        {/* View All Arrow */}
        <Link
          href={`/tools#${categoryId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary group-hover:text-neon-purple transition-colors pt-2"
        >
          <span>View all {tools.length} tools</span>
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}
