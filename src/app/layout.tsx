import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ParticleField from "@/components/ui/ParticleField";
import { SpeedInsights } from "@vercel/speed-insights/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Media Suite — Professional Media Processing",
  description:
    "A comprehensive media and document utility suite with 25+ tools for image editing, PDF processing, OCR, video compression, and creative tools. Free, fast, and private.",
  keywords: [
    "image resizer",
    "pdf converter",
    "image compressor",
    "ocr",
    "video compressor",
    "background remover",
    "meme generator",
    "heic to jpg",
    "image to pdf",
    "pdf to jpg",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.className}`}>
      <body className="bg-void text-text-primary antialiased font-sans">
        <div className="relative flex flex-col min-h-screen bg-grid bg-radial-glow">
          {/* Interactive particle background */}
          <ParticleField />

          {/* Navigation */}
          <Navbar />

          {/* Page content */}
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
            <SpeedInsights />
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
