"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  X,
  ArrowRight,
} from "lucide-react";
import { CATEGORIES, getToolsByCategory, TOOLS } from "@/lib/constants";

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCategories = CATEGORIES.filter((cat) => {
    if (selectedCategory === "all") return true;
    return cat.id === selectedCategory;
  });

  return (
    <main className="min-h-screen pt-28 sm:pt-32 pb-24">
      <div className="w-full max-w-[1650px] mx-auto">
        {/* Page Heading — Single Clean Straight Line, Smaller Size */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary"
          >
            All <span className="gradient-text">Media Tools</span>
          </motion.h1>
        </div>

        {/* Separated & Spacious Controls Area */}
        <div className="w-full max-w-5xl mx-auto mb-14 space-y-5">
          {/* 1. Large, Dedicated Search Bar (Separated & Centered) */}
          <div className="relative w-full shadow-2xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-purple pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all 25+ tools (e.g. Crop, Compress, OCR, PDF, Meme, Video)..."
              className="w-full bg-void/80 border border-glass-border focus:border-neon-purple/70 rounded-2xl pl-12 pr-11 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-neon-purple/20 transition-all shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-glass"
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* 2. Spacious Category Filter Tabs (Separated, Wider & Distinct) */}
          <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-1 custom-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/35 scale-105"
                  : "bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:bg-glass-hover"
              }`}
            >
              All Tools ({TOOLS.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = getToolsByCategory(cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? "bg-neon-purple/25 text-neon-purple border border-neon-purple/50 shadow-md shadow-neon-purple/20 scale-105"
                      : "bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:bg-glass-hover"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] sm:text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grouped By Category */}
        <div className="space-y-16">
          {filteredCategories.map((cat) => {
            const allCatTools = getToolsByCategory(cat.id);
            const tools = searchQuery.trim()
              ? allCatTools.filter(
                  (t) =>
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : allCatTools;

            if (searchQuery.trim() && tools.length === 0) return null;

            const Icon = cat.icon;

            return (
              <motion.section
                key={cat.id}
                id={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="scroll-mt-36"
              >
                {/* Category Heading with Symmetrical Bar */}
                <div className="flex items-center justify-between gap-4 mb-6 border-b border-glass-border/70 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-md`}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-text-muted hidden sm:block">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-glass border border-glass-border text-text-muted shrink-0">
                    {tools.length} {tools.length === 1 ? "tool" : "tools"}
                  </span>
                </div>

                {/* Wide Dimensions (Chauda Cards) Grid in 3 Columns with Compact Icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
                  {tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link key={tool.id} href={tool.href} className="group flex">
                        <motion.div
                          whileHover={{ y: -4, scale: 1.015 }}
                          transition={{ duration: 0.2 }}
                          className="glass p-5 rounded-2xl border border-glass-border hover:border-glass-border-hover group-hover:bg-glass-hover w-full flex items-center justify-between gap-4 transition-all relative overflow-hidden shadow-md group-hover:shadow-xl"
                          style={
                            {
                              "--glow-color": cat.glowColor,
                            } as React.CSSProperties
                          }
                        >
                          {/* Left: Compact Small Icon */}
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}
                            >
                              <ToolIcon size={16} className="text-white" />
                            </div>

                            {/* Middle: Title & Description */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-bold text-sm sm:text-base text-text-primary group-hover:text-neon-purple transition-colors truncate">
                                  {tool.name}
                                </h3>
                                {tool.badge && (
                                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-neon-purple/20 text-neon-purple border border-neon-purple/35 shrink-0">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-text-muted leading-relaxed line-clamp-1 group-hover:text-text-secondary transition-colors">
                                {tool.description}
                              </p>
                            </div>
                          </div>

                          {/* Right: Sleek Action Arrow Button */}
                          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 border border-white/10 group-hover:bg-neon-purple group-hover:text-white group-hover:border-neon-purple/40 text-text-muted transition-all duration-300 group-hover:translate-x-0.5 shadow-sm">
                            <ArrowRight size={14} />
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
