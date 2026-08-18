"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Layers,
  ArrowRight,
  ImageIcon,
  FileText,
  Smile,
} from "lucide-react";
import { CATEGORIES, getToolsByCategory, TOOLS } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Accordion open states inside drawer (default all open)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "image-editing": true,
    "resize-compress": true,
    "image-convert": true,
    "pdf-tools": true,
    "ocr-tools": true,
    "advanced": true,
  });

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle scroll detection for glass header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer and dropdown on route change
  useEffect(() => {
    setDrawerOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Handle Escape key to close drawer or dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawerOpen) setDrawerOpen(false);
        if (activeDropdown) setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, activeDropdown]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleAccordion = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // 3 Primary Header Items: Image, PDF, Meme Generator
  const imageTools = TOOLS.filter(
    (t) =>
      t.category === "image-editing" ||
      t.category === "resize-compress" ||
      t.category === "image-convert"
  );

  const pdfTools = TOOLS.filter((t) => t.category === "pdf-tools" || t.id === "pdf-to-text");

  return (
    <>
      {/* ─── Sticky Header ────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled || activeDropdown
            ? "py-5 sm:py-6 bg-void/95 backdrop-blur-2xl border-b border-glass-border shadow-2xl shadow-black/80 min-h-[82px] flex items-center"
            : "py-6 sm:py-7 bg-void/80 backdrop-blur-xl border-b border-glass-border/60 min-h-[90px] flex items-center"
        }`}
      >
        <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 flex items-center justify-between gap-6">

          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple rounded-xl p-1"
            aria-label="Media Suite Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/25 group-hover:shadow-neon-purple/50 transition-all duration-300 group-hover:scale-105">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text tracking-tight leading-none">
                Media Suite
              </span>
              <span className="text-[10px] text-text-muted font-semibold tracking-wider uppercase mt-1">
                Pro Tools
              </span>
            </div>
          </Link>


          {/* Desktop Navigation: EXACTLY 3 Main Items (Image, PDF, Meme Generator) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-2"
          >
            {/* 1. Image Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("image")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === "image" ? null : "image")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDropdown === "image"
                    ? "text-neon-purple bg-neon-purple/10 border border-neon-purple/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-glass border border-transparent"
                }`}
                aria-expanded={activeDropdown === "image"}
                aria-haspopup="true"
                aria-label="Image tools menu"
              >
                <ImageIcon size={16} className="text-neon-purple" />
                <span>Image</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 opacity-70 ${
                    activeDropdown === "image" ? "rotate-180 text-neon-purple" : ""
                  }`}
                />
              </button>

              {/* Image Tools Dropdown */}
              <AnimatePresence>
                {activeDropdown === "image" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-80 lg:w-96 rounded-2xl bg-abyss/95 backdrop-blur-2xl border border-glass-border shadow-2xl shadow-black/80 p-3 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-glass-border mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <ImageIcon size={13} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-text-primary">
                          Image Tools
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {imageTools.length} Tools
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {imageTools.map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <Link
                            key={tool.id}
                            href={tool.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-glass hover:border-glass-border-hover border border-transparent transition-all duration-200"
                          >
                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all mt-0.5 text-text-muted group-hover:text-neon-purple">
                              <ToolIcon size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-text-primary group-hover:text-neon-purple transition-colors truncate">
                                  {tool.name}
                                </span>
                                {tool.badge && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-neon-purple/15 text-neon-purple border border-neon-purple/30">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                                {tool.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. PDF Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("pdf")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === "pdf" ? null : "pdf")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDropdown === "pdf"
                    ? "text-neon-purple bg-neon-purple/10 border border-neon-purple/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-glass border border-transparent"
                }`}
                aria-expanded={activeDropdown === "pdf"}
                aria-haspopup="true"
                aria-label="PDF tools menu"
              >
                <FileText size={16} className="text-neon-orange" />
                <span>PDF</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 opacity-70 ${
                    activeDropdown === "pdf" ? "rotate-180 text-neon-purple" : ""
                  }`}
                />
              </button>

              {/* PDF Tools Dropdown */}
              <AnimatePresence>
                {activeDropdown === "pdf" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-80 lg:w-96 rounded-2xl bg-abyss/95 backdrop-blur-2xl border border-glass-border shadow-2xl shadow-black/80 p-3 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-glass-border mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <FileText size={13} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-text-primary">
                          PDF Tools
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {pdfTools.length} Tools
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {pdfTools.map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <Link
                            key={tool.id}
                            href={tool.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-glass hover:border-glass-border-hover border border-transparent transition-all duration-200"
                          >
                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all mt-0.5 text-text-muted group-hover:text-neon-orange">
                              <ToolIcon size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-text-primary group-hover:text-neon-purple transition-colors truncate">
                                  {tool.name}
                                </span>
                                {tool.badge && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-neon-purple/15 text-neon-purple border border-neon-purple/30">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                                {tool.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Meme Generator Link */}
            <Link
              href="/tools/advanced/meme"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-glass border border-transparent hover:border-glass-border transition-all duration-200"
            >
              <Smile size={16} className="text-neon-yellow" />
              <span>Meme Generator</span>
            </Link>
          </nav>

          {/* Right Action: Clean Hamburger Menu Button (No 'All 25+ Tools' pill) */}
          <div className="flex items-center">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple ${
                drawerOpen
                  ? "bg-neon-purple/20 border-neon-purple/40 text-neon-purple"
                  : "bg-glass border-glass-border hover:border-glass-border-hover text-text-primary hover:bg-glass-hover"
              }`}
              aria-label={drawerOpen ? "Close navigation menu" : "Open all tools navigation menu"}
              aria-expanded={drawerOpen}
              aria-controls="tools-drawer"
            >
              {/* Sleek 3 horizontal lines icon */}
              <div className="w-5 h-4 flex flex-col justify-between items-center py-0.5">
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                    drawerOpen ? "rotate-45 translate-y-[5px]" : ""
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ${
                    drawerOpen ? "opacity-0 scale-x-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                    drawerOpen ? "-rotate-45 -translate-y-[5px]" : ""
                  }`}
                />
              </div>
              <span className="hidden sm:inline text-xs font-semibold tracking-wide">
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hamburger Menu Side Drawer & Overlay ───────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-void/70 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Side Drawer Panel */}
            <motion.aside
              id="tools-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="All Media Tools Navigation Drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] z-50 bg-abyss/95 backdrop-blur-2xl border-l border-glass-border shadow-2xl shadow-black flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-glass-border flex items-center justify-between gap-4 bg-void/40">
                <Link
                  href="/tools"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/20 group-hover:scale-105 transition-transform">
                    <Layers size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary flex items-center gap-2 group-hover:text-neon-purple transition-colors">
                      <span>All Media Tools</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neon-purple/15 text-neon-purple border border-neon-purple/30">
                        25+
                      </span>
                    </h2>
                    <p className="text-xs text-text-muted">
                      Select any tool to start editing
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-glass border border-transparent hover:border-glass-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Instant Search Bar inside Drawer */}
              <div className="p-4 border-b border-glass-border bg-void/20 space-y-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search all 25+ tools (e.g., Crop, OCR, PDF)..."
                    className="w-full bg-glass border border-glass-border focus:border-neon-purple/50 rounded-xl pl-10 pr-9 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Directory Page Quick Link */}
                <Link
                  href="/tools"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-xs font-medium text-text-primary hover:bg-neon-purple/20 hover:border-neon-purple/35 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-neon-purple" />
                    <span>View All Tools Directory Page</span>
                  </span>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-neon-purple group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>

              {/* Accordion Categories List (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {CATEGORIES.map((cat) => {
                  const tools = getToolsByCategory(cat.id);
                  const filteredTools = searchQuery.trim()
                    ? tools.filter(
                        (t) =>
                          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : tools;

                  if (searchQuery.trim() && filteredTools.length === 0) {
                    return null;
                  }

                  const isExpanded = searchQuery.trim()
                    ? true
                    : !!expandedCategories[cat.id];
                  const Icon = cat.icon;

                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl bg-glass border border-glass-border overflow-hidden transition-all duration-200"
                    >
                      {/* Accordion Header Button */}
                      <button
                        onClick={() => toggleAccordion(cat.id)}
                        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-glass-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple"
                        aria-expanded={isExpanded}
                        aria-controls={`accordion-${cat.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            <Icon size={16} className="text-white" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ChevronDown
                            size={16}
                            className={`text-text-muted transition-transform duration-300 ${
                              isExpanded ? "rotate-180 text-neon-purple" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Accordion Content (Tools List) */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            id={`accordion-${cat.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-2 pt-0 space-y-1 border-t border-glass-border/50">
                              {filteredTools.map((tool) => {
                                const ToolIcon = tool.icon;
                                const isActive = pathname === tool.href;

                                return (
                                  <Link
                                    key={tool.id}
                                    href={tool.href}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 group ${
                                      isActive
                                        ? "bg-neon-purple/15 text-neon-purple border border-neon-purple/30"
                                        : "hover:bg-glass text-text-secondary hover:text-text-primary border border-transparent"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-text-muted group-hover:text-neon-purple">
                                        <ToolIcon size={14} />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-medium truncate">
                                            {tool.name}
                                          </span>
                                          {tool.badge && (
                                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-neon-purple/15 text-neon-purple border border-neon-purple/25">
                                              {tool.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-text-muted line-clamp-1">
                                          {tool.description}
                                        </p>
                                      </div>
                                    </div>

                                    <ChevronRight
                                      size={14}
                                      className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                                    />
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer info */}
              <div className="p-4 border-t border-glass-border bg-void/60 flex items-center justify-between text-[11px] text-text-muted">
                <span>Free & Private Processing</span>
                <Link
                  href="/privacy"
                  onClick={() => setDrawerOpen(false)}
                  className="hover:text-text-primary transition-colors underline"
                >
                  Privacy Policy
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
