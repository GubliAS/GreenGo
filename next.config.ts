import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Users are on Android over 3G — keep payloads small and images modern.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
