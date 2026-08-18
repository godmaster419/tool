// Placeholder — Full implementation in Step 2
"use client";
export default function ProgressRing({ progress = 0, size = 80 }: { progress: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="url(#gradient)" strokeWidth="4" fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
      <defs>
        <linearGradient id="gradient"><stop stopColor="#a855f7" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
      </defs>
    </svg>
  );
}
