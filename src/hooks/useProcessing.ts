"use client";

import { useState, useCallback } from "react";

export type ProcessingStatus = "idle" | "processing" | "complete" | "error";

interface ProcessingState {
  status: ProcessingStatus;
  progress: number;
  resultUrl: string | null;
  resultBlob: Blob | null;
  resultFilename: string | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
}

interface UseProcessingReturn extends ProcessingState {
  processFile: (
    apiEndpoint: string,
    formData: FormData,
    outputFilename?: string
  ) => Promise<void>;
  reset: () => void;
}

export function useProcessing(): UseProcessingReturn {
  const [state, setState] = useState<ProcessingState>({
    status: "idle",
    progress: 0,
    resultUrl: null,
    resultBlob: null,
    resultFilename: null,
    error: null,
    metadata: null,
  });

  const processFile = useCallback(
    async (
      apiEndpoint: string,
      formData: FormData,
      outputFilename?: string
    ) => {
      setState({
        status: "processing",
        progress: 10,
        resultUrl: null,
        resultBlob: null,
        resultFilename: null,
        error: null,
        metadata: null,
      });

      try {
        // Simulate progress while fetching
        const progressInterval = setInterval(() => {
          setState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 5, 85),
          }));
        }, 200);

        const response = await fetch(apiEndpoint, {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Processing failed (${response.status})`
          );
        }

        // Check content type — JSON means metadata/text response, otherwise binary
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          setState({
            status: "complete",
            progress: 100,
            resultUrl: data.url || null,
            resultBlob: null,
            resultFilename: data.filename || outputFilename || null,
            error: null,
            metadata: data,
          });
        } else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const disposition = response.headers.get("content-disposition");
          const filenameMatch = disposition?.match(/filename="?(.+?)"?$/);
          const filename =
            filenameMatch?.[1] || outputFilename || "processed-file";

          // Try to parse metadata from X-Metadata header
          let metadata: Record<string, unknown> | null = null;
          const metaHeader = response.headers.get("X-Metadata");
          if (metaHeader) {
            try { metadata = JSON.parse(metaHeader); } catch { /* ignore */ }
          }

          setState({
            status: "complete",
            progress: 100,
            resultUrl: url,
            resultBlob: blob,
            resultFilename: filename,
            error: null,
            metadata,
          });
        }
      } catch (err) {
        setState({
          status: "error",
          progress: 0,
          resultUrl: null,
          resultBlob: null,
          resultFilename: null,
          error:
            err instanceof Error ? err.message : "An unexpected error occurred",
          metadata: null,
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    // Revoke any existing object URL
    if (state.resultUrl && state.resultUrl.startsWith("blob:")) {
      URL.revokeObjectURL(state.resultUrl);
    }
    setState({
      status: "idle",
      progress: 0,
      resultUrl: null,
      resultBlob: null,
      resultFilename: null,
      error: null,
      metadata: null,
    });
  }, [state.resultUrl]);

  return {
    ...state,
    processFile,
    reset,
  };
}
