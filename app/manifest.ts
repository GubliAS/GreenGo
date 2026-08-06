import type { MetadataRoute } from "next";

/* PWA web app manifest (DEV-014 — outside the handoff's own scope, added on
 * request). Next's App Router convention: this file, once present, is
 * automatically served at /manifest.webmanifest and linked from every page's
 * <head> — no manual <link rel="manifest"> needed. */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GreenGo — Soil Moisture & Greenhouse Monitor",
    short_name: "GreenGo",
    description:
      "Watch soil moisture, temperature and humidity, get texted when the soil runs dry, and switch the pump on from anywhere.",
    start_url: "/devices",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#17352A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
