import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Newsreader,
  Public_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

/* Fonts are self-hosted by next/font at build time — no render-blocking
 * request to fonts.googleapis.com. The handoff loaded all four from the CDN;
 * these users are on 3G, so that request is the first thing to remove.
 * Handoff weights: Bricolage 500–800, Newsreader italic 400, Public Sans
 * 400/500/600/700, IBM Plex Mono 500/600. */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GreenGo — soil moisture & greenhouse monitor",
  description:
    "GreenGo watches soil moisture, temperature and humidity every 10 seconds, texts you when the soil runs dry, and lets you switch the pump on from anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${newsreader.variable} ${publicSans.variable} ${plexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
