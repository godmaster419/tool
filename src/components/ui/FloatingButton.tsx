"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "glow";
  size?: "sm" | "md" | "lg";
  glowColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function FloatingButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  glowColor,
  onClick,
  disabled = false,
  type = "button",
}: FloatingButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary: "btn-primary",
    secondary: "bg-glass border border-glass-border hover:border-glass-border-hover text-text-primary hover:bg-glass-hover rounded-xl font-medium",
    ghost: "btn-ghost",
    glow: "btn-primary",
  };


  return (
    <motion.button
      type={type}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled}
      onClick={onClick}
      whileHover={{
        y: -4,
        scale: 1.05,
        boxShadow: glowColor
          ? `0 12px 40px -8px ${glowColor}`
          : "0 12px 40px -8px rgba(168, 85, 247, 0.4)",
      }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
