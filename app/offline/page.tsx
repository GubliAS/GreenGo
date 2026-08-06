import type { Metadata } from "next";
import { Logo } from "@/components/Logo";

/* Service-worker fallback (DEV-014) — shown when a navigation fails and
 * nothing cached matches the request. Precached by public/sw.js's install
 * handler so it's available even on a page never visited before. */

export const metadata: Metadata = { title: "You're offline — GreenGo" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <Logo size="marketing" />
      <h1 className="font-display text-h2 text-canopy m-0 font-extrabold">
        You&apos;re offline
      </h1>
      <p className="text-md text-muted m-0 max-w-105">
        GreenGo needs a connection to reach your device and the server.
        Readings and pump commands are never cached for offline use — that
        would risk showing you a stale soil reading as if it were live.
        Reconnect and try again.
      </p>
    </div>
  );
}
