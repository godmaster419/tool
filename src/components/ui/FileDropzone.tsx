"use client";

import { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage, X, AlertCircle } from "lucide-react";
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

  // If a file is selected, show preview
  if (file && !compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 relative"
      >
        {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Image preview */}
          {preview && (
            <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-abyss flex-shrink-0">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* File info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <FileImage size={18} className="text-neon-purple" />
              <span className="font-medium text-text-primary truncate">
                {file.name}
              </span>
            </div>
            <p className="text-sm text-text-muted">
              {formatFileSize(file.size)} •{" "}
              {file.type || "Unknown format"}
            </p>
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
          "dropzone flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
          compact ? "p-8" : "p-12 md:p-16",
          isDragging && "dragging border-neon-purple bg-neon-purple/5"
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={
            isDragging
              ? { y: -8, scale: 1.1 }
              : { y: [0, -6, 0] }
          }
          transition={
            isDragging
              ? { duration: 0.2 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
            isDragging
              ? "bg-neon-purple/20 border border-neon-purple/40"
              : "bg-glass border border-glass-border"
          )}
        >
          <Upload
            size={28}
            className={cn(
              "transition-colors",
              isDragging ? "text-neon-purple" : "text-text-muted"
            )}
          />
        </motion.div>

        <p className="text-text-primary font-medium mb-1">
          {label || "Drop your file here"}
        </p>
        <p className="text-sm text-text-muted mb-3">
          or click to browse
        </p>

        {acceptedFormats.length > 0 && (
          <p className="text-xs text-text-muted">
            Supports:{" "}
            {acceptedFormats
              .map((f) => f.replace("image/", "").replace("application/", "").toUpperCase())
              .join(", ")}
          </p>
        )}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 text-sm text-red-400"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
