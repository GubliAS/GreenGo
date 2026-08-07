import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Avoid picking up a parent package-lock.json (e.g. in the user home dir).
  turbopack: {
    root: path.join(__dirname),
  },
  // Users are on Android over 3G — keep payloads small and images modern.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
