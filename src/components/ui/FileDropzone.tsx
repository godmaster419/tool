"use client";

import { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage, X, AlertCircle, Image, Maximize2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface FileDropzoneProps {
  onFiles: (files: FileList | File[]) => void;
  acceptedFormats?: string[];
  multiple?: boolean;
  file?: File | null;
  files?: File[];
  preview?: string | null;
  isDragging?: boolean;
  error?: string | null;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onRemove?: () => void;
  compact?: boolean;
  label?: string;
}

export default function FileDropzone({
  onFiles,
  acceptedFormats = [],
  multiple = false,
  file,
  preview,
  isDragging = false,
  error,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  compact = false,
  label,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFiles(e.target.files);
      }
    },
    [onFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragOver?.(e);
    },
    [onDragOver]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragLeave?.(e);
    },
    [onDragLeave]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onDrop) {
        onDrop(e);
      } else if (e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [onDrop, onFiles]
  );

  // Format badges for accepted types
  const formatBadges = acceptedFormats
    .map((f) => f.replace("image/", "").replace("application/", "").toUpperCase())
    .filter((v, i, a) => a.indexOf(v) === i);

  // If a file is selected, show preview
  if (file && !compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="studio-panel rounded-2xl p-5 relative"
      >
        {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 hover:bg-red-500/25 hover:border-red-500/40 transition-all"
            aria-label="Remove file"
          >
            <X size={15} />
          </button>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Image preview */}
          {preview && (
            <div className="w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-checkerboard flex-shrink-0 border border-white/[0.06]">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* File info */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <FileImage size={16} className="text-neon-purple shrink-0" />
              <span className="font-semibold text-text-primary truncate text-sm">
                {file.name}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs">
              <span className="px-2 py-0.5 rounded-md bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 font-bold">
                {formatFileSize(file.size)}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-text-muted font-semibold uppercase text-[10px]">
                {file.type?.split("/")[1] || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "dropzone-premium flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
          compact ? "p-8" : "p-12 md:p-16",
          isDragging && "dragging"
        )}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <motion.div
          animate={
            isDragging
              ? { y: -10, scale: 1.15 }
              : { y: [0, -8, 0] }
          }
          transition={
            isDragging
              ? { duration: 0.2 }
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
            isDragging
              ? "bg-neon-purple/15 border border-neon-purple/30 shadow-lg shadow-neon-purple/20"
              : "bg-white/[0.04] border border-white/[0.08]"
          )}
        >
          <Upload
            size={26}
            className={cn(
              "transition-colors duration-300",
              isDragging ? "text-neon-purple" : "text-text-muted"
            )}
          />
        </motion.div>

        <p className="text-text-primary font-semibold mb-1 text-sm">
          {label || "Drop your file here"}
        </p>
        <p className="text-xs text-text-muted mb-4">
          or <span className="text-neon-purple font-medium">click to browse</span>
        </p>

        {/* Format Badges */}
        {formatBadges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {formatBadges.map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-text-muted uppercase tracking-wider"
              >
                {fmt}
              </span>
            ))}
          </div>
        )}

        {/* Size limit hint */}
        <p className="text-[10px] text-text-muted mt-3 opacity-60">
          Max 50 MB per file
        </p>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
          >
            <AlertCircle size={15} />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
