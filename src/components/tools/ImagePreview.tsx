// Placeholder — Full implementation in Step 3
"use client";
export default function ImagePreview({ src, alt = "Preview" }: { src: string; alt?: string }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <img src={src} alt={alt} className="w-full h-auto" />
    </div>
  );
}
