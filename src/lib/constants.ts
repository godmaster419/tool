import {
  Crop,
  FlipHorizontal,
  RotateCw,
  Maximize,
  Pipette,
  ImageIcon,
  Layers,
  Minimize2,
  FileImage,
  FileText,
  FileType,
  FileOutput,
  ScanText,
  LayoutGrid,
  Smile,
  Eraser,
  Video,
  ArrowRightLeft,
  type LucideIcon,
} from "lucide-react";

// ─── Tool Definition ───────────────────────────────────────────────

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  apiEndpoint: string;
  category: ToolCategory;
  acceptedFormats: string[];
  badge?: string;
}

export type ToolCategory =
  | "image-editing"
  | "resize-compress"
  | "image-convert"
  | "pdf-tools"
  | "ocr-tools"
  | "advanced";

// ─── Category Definitions ──────────────────────────────────────────

export interface CategoryDefinition {
  id: ToolCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "image-editing",
    name: "Image Editing",
    description: "Crop, flip, rotate, enlarge, and pick colors from your images",
    icon: Crop,
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139, 92, 246, 0.3)",
  },
  {
    id: "resize-compress",
    name: "Resize & Compress",
    description: "Resize single or bulk images and compress for optimal file size",
    icon: Minimize2,
    gradient: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.3)",
  },
  {
    id: "image-convert",
    name: "Image Conversions",
    description: "Convert between HEIC, SVG, JPG, PNG and other formats",
    icon: ArrowRightLeft,
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.3)",
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    description: "Compress, convert, merge and extract from PDF documents",
    icon: FileText,
    gradient: "from-orange-500 to-red-600",
    glowColor: "rgba(249, 115, 22, 0.3)",
  },
  {
    id: "ocr-tools",
    name: "OCR Tools",
    description: "Extract text from images and PDF documents with AI-powered OCR",
    icon: ScanText,
    gradient: "from-pink-500 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
  {
    id: "advanced",
    name: "Advanced & Creative",
    description: "Collage maker, meme generator, AI background remover, and video tools",
    icon: Layers,
    gradient: "from-amber-500 to-yellow-600",
    glowColor: "rgba(245, 158, 11, 0.3)",
  },
];

// ─── Tool Definitions ──────────────────────────────────────────────

export const TOOLS: ToolDefinition[] = [
  // Image Editing
  {
    id: "crop",
    name: "Crop Image",
    description: "Precisely crop your images to any dimension or aspect ratio",
    icon: Crop,
    href: "/tools/image/crop",
    apiEndpoint: "/api/image/crop",
    category: "image-editing",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "flip",
    name: "Flip Image",
    description: "Flip images horizontally or vertically with one click",
    icon: FlipHorizontal,
    href: "/tools/image/flip",
    apiEndpoint: "/api/image/flip",
    category: "image-editing",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "rotate",
    name: "Rotate Image",
    description: "Rotate images by any angle with precision controls",
    icon: RotateCw,
    href: "/tools/image/rotate",
    apiEndpoint: "/api/image/rotate",
    category: "image-editing",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "enlarge",
    name: "Image Enlarge",
    description: "Upscale and enlarge images while preserving quality",
    icon: Maximize,
    href: "/tools/image/enlarge",
    apiEndpoint: "/api/image/enlarge",
    category: "image-editing",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Extract dominant colors and palettes from any image",
    icon: Pipette,
    href: "/tools/image/color-picker",
    apiEndpoint: "/api/image/color-picker",
    category: "image-editing",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },

  // Resize & Compress
  {
    id: "resize",
    name: "Image Resizer",
    description: "Resize images to exact dimensions with quality control",
    icon: ImageIcon,
    href: "/tools/image/resize",
    apiEndpoint: "/api/image/resize",
    category: "resize-compress",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "bulk-resize",
    name: "Bulk Image Resizer",
    description: "Resize multiple images at once with batch processing",
    icon: Layers,
    href: "/tools/image/bulk-resize",
    apiEndpoint: "/api/image/bulk-resize",
    category: "resize-compress",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
    badge: "Batch",
  },
  {
    id: "compress",
    name: "Image Compressor",
    description: "Compress images to reduce file size without visible quality loss",
    icon: Minimize2,
    href: "/tools/image/compress",
    apiEndpoint: "/api/image/compress",
    category: "resize-compress",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },

  // Image Conversions
  {
    id: "heic-to-jpg",
    name: "HEIC to JPG",
    description: "Convert Apple HEIC photos to universally compatible JPG",
    icon: FileImage,
    href: "/tools/convert/heic-to-jpg",
    apiEndpoint: "/api/convert/heic-to-jpg",
    category: "image-convert",
    acceptedFormats: ["image/heic", "image/heif", ".heic", ".heif"],
  },
  {
    id: "svg-convert",
    name: "SVG Converter",
    description: "Convert SVG files to PNG, JPG, or other raster formats",
    icon: FileType,
    href: "/tools/convert/svg-convert",
    apiEndpoint: "/api/convert/svg-convert",
    category: "image-convert",
    acceptedFormats: ["image/svg+xml", ".svg"],
  },
  {
    id: "jpg-to-png",
    name: "JPG to PNG",
    description: "Convert JPG images to PNG format with transparency support",
    icon: ArrowRightLeft,
    href: "/tools/convert/jpg-to-png",
    apiEndpoint: "/api/convert/jpg-to-png",
    category: "image-convert",
    acceptedFormats: ["image/jpeg"],
  },
  {
    id: "png-to-jpg",
    name: "PNG to JPG",
    description: "Convert PNG images to compressed JPG format",
    icon: ArrowRightLeft,
    href: "/tools/convert/png-to-jpg",
    apiEndpoint: "/api/convert/png-to-jpg",
    category: "image-convert",
    acceptedFormats: ["image/png"],
  },

  // PDF Tools
  {
    id: "pdf-compress",
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining readability",
    icon: Minimize2,
    href: "/tools/pdf/compress",
    apiEndpoint: "/api/pdf/compress",
    category: "pdf-tools",
    acceptedFormats: ["application/pdf"],
  },
  {
    id: "pdf-convert",
    name: "PDF Converter",
    description: "Convert documents between PDF and other formats",
    icon: FileOutput,
    href: "/tools/pdf/convert",
    apiEndpoint: "/api/pdf/convert",
    category: "pdf-tools",
    acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Combine one or more images into a single PDF document",
    icon: FileText,
    href: "/tools/pdf/image-to-pdf",
    apiEndpoint: "/api/pdf/image-to-pdf",
    category: "pdf-tools",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "png-to-pdf",
    name: "PNG to PDF",
    description: "Convert PNG images directly into PDF pages",
    icon: FileText,
    href: "/tools/pdf/png-to-pdf",
    apiEndpoint: "/api/pdf/png-to-pdf",
    category: "pdf-tools",
    acceptedFormats: ["image/png"],
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Extract and convert PDF pages into JPG images",
    icon: FileImage,
    href: "/tools/pdf/pdf-to-jpg",
    apiEndpoint: "/api/pdf/pdf-to-jpg",
    category: "pdf-tools",
    acceptedFormats: ["application/pdf"],
  },
  {
    id: "pdf-to-png",
    name: "PDF to PNG",
    description: "Extract and convert PDF pages into high-quality PNG images",
    icon: FileImage,
    href: "/tools/pdf/pdf-to-png",
    apiEndpoint: "/api/pdf/pdf-to-png",
    category: "pdf-tools",
    acceptedFormats: ["application/pdf"],
  },

  // OCR Tools
  {
    id: "image-to-text",
    name: "Image to Text",
    description: "Extract text from images using AI-powered optical character recognition",
    icon: ScanText,
    href: "/tools/ocr/image-to-text",
    apiEndpoint: "/api/ocr/image-to-text",
    category: "ocr-tools",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
    badge: "AI",
  },
  {
    id: "pdf-to-text",
    name: "PDF to Text",
    description: "Extract all text content from PDF documents with OCR fallback",
    icon: ScanText,
    href: "/tools/ocr/pdf-to-text",
    apiEndpoint: "/api/ocr/pdf-to-text",
    category: "ocr-tools",
    acceptedFormats: ["application/pdf"],
    badge: "AI",
  },

  // Advanced & Creative
  {
    id: "collage",
    name: "Collage Maker",
    description: "Create beautiful photo collages with customizable layouts",
    icon: LayoutGrid,
    href: "/tools/advanced/collage",
    apiEndpoint: "/api/advanced/collage",
    category: "advanced",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "meme",
    name: "Meme Generator",
    description: "Create memes with custom text overlays and popular templates",
    icon: Smile,
    href: "/tools/advanced/meme",
    apiEndpoint: "/api/advanced/meme",
    category: "advanced",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    id: "bg-remove",
    name: "AI Background Remover",
    description: "Remove backgrounds from images using AI neural networks",
    icon: Eraser,
    href: "/tools/advanced/bg-remove",
    apiEndpoint: "/api/advanced/bg-remove",
    category: "advanced",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
    badge: "AI",
  },
  {
    id: "video-compress",
    name: "Video Compressor",
    description: "Compress video files while maintaining visual quality",
    icon: Video,
    href: "/tools/advanced/video-compress",
    apiEndpoint: "/api/advanced/video-compress",
    category: "advanced",
    acceptedFormats: ["video/mp4", "video/webm", "video/quicktime"],
    badge: "Heavy",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getCategoryById(id: ToolCategory): CategoryDefinition | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

// ─── Site Metadata ─────────────────────────────────────────────────

export const SITE = {
  name: "Media Suite",
  tagline: "Professional Media Processing",
  description:
    "A comprehensive media and document utility suite with 25+ tools for image editing, PDF processing, OCR, video compression, and creative tools.",
  url: "https://mediasuite.dev",
} as const;
