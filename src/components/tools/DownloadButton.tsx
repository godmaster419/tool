// Placeholder — Full implementation in Step 3
"use client";
import { Download } from "lucide-react";

export default function DownloadButton({ url, filename, disabled = false }: {
  url: string;
  filename: string;
  disabled?: boolean;
}) {
  return (
    <a
      href={url}
      download={filename}
      className={`btn-primary inline-flex items-center gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <Download size={18} />
      <span>Download</span>
    </a>
  );
}
