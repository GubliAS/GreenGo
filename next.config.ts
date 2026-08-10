import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so a parent package-lock.json (e.g. in the user
  // home dir) does not become Turbopack's inferred root and break routing.
  turbopack: {
    root: process.cwd(),
  },
  // Users are on Android over 3G — keep payloads small and images modern.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
