import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark native Node.js packages as external so they aren't bundled
  serverExternalPackages: ["sharp", "pdf2pic", "tesseract.js", "heic-convert"],

  // Allow larger file uploads (50MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  // Allow local network IP access in dev
  allowedDevOrigins: ["10.255.253.223", "10.18.125.223", "10.110.168.223", "localhost", "127.0.0.1"],

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
