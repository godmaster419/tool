"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Home, type LucideIcon } from "lucide-react";

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
  const pathname = usePathname();

  // Build breadcrumb segments from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + pathSegments.slice(0, i + 1).join("/"),
    isLast: i === pathSegments.length - 1,
  }));

  return (
    <main className="min-h-screen pt-28 sm:pt-32 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Trail */}
        <motion.nav
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs mb-6 overflow-x-auto"
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <Home size={12} />
            <span className="font-medium">Home</span>
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5 shrink-0">
              <ChevronRight size={11} className="text-text-muted/50" />
              {crumb.isLast ? (
                <span className="font-semibold text-text-primary">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-text-muted hover:text-text-primary transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </motion.nav>

        {/* Tool header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-3">
            {Icon && (
              <div className="relative">
                {/* Ambient glow behind icon */}
                <div
                  className={`absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} blur-xl opacity-40`}
                />
                <div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                >
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
              {title}
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-text-secondary text-sm sm:text-base max-w-2xl leading-relaxed"
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Tool content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}
