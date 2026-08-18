"use client";

import { useState, useCallback } from "react";

interface UploadState {
  file: File | null;
  files: File[];
  preview: string | null;
  isDragging: boolean;
  error: string | null;
}

interface UseFileUploadReturn extends UploadState {
  onFileSelect: (files: FileList | File[]) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  reset: () => void;
  removeFile: (index: number) => void;
}

interface UseFileUploadOptions {
  acceptedFormats?: string[];
  maxSize?: number; // bytes
  multiple?: boolean;
}

export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const {
    acceptedFormats = [],
    maxSize = 50 * 1024 * 1024, // 50MB default
    multiple = false,
  } = options;

  const [state, setState] = useState<UploadState>({
    file: null,
    files: [],
    preview: null,
    isDragging: false,
    error: null,
  });

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
      }
      if (acceptedFormats.length > 0) {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const isAccepted =
          acceptedFormats.some((f) => file.type.match(f)) ||
          acceptedFormats.includes(ext);
        if (!isAccepted) {
          return `Unsupported file format. Accepted: ${acceptedFormats.join(", ")}`;
        }
      }
      return null;
    },
    [acceptedFormats, maxSize]
  );

  const createPreview = useCallback((file: File): void => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setState((prev) => ({ ...prev, preview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onFileSelect = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      // Validate all files
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          setState((prev) => ({ ...prev, error }));
          return;
        }
      }

      if (multiple) {
        setState((prev) => ({
          ...prev,
          files: [...prev.files, ...fileArray],
          file: fileArray[0],
          error: null,
        }));
        createPreview(fileArray[0]);
      } else {
        setState((prev) => ({
          ...prev,
          file: fileArray[0],
          files: [fileArray[0]],
          error: null,
        }));
        createPreview(fileArray[0]);
      }
    },
    [multiple, validateFile, createPreview]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, isDragging: false }));
      if (e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files);
      }
    },
    [onFileSelect]
  );

  const reset = useCallback(() => {
    setState({
      file: null,
      files: [],
      preview: null,
      isDragging: false,
      error: null,
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setState((prev) => {
      const newFiles = prev.files.filter((_, i) => i !== index);
      return {
        ...prev,
        files: newFiles,
        file: newFiles[0] || null,
        preview: newFiles.length === 0 ? null : prev.preview,
      };
    });
  }, []);

  return {
    ...state,
    onFileSelect,
    onDragOver,
    onDragLeave,
    onDrop,
    reset,
    removeFile,
  };
}
