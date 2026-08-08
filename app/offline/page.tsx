import type { Metadata } from "next";
import { StatusScreen } from "@/components/StatusScreen";
import { ReloadButton } from "@/components/ReloadButton";

/* Service-worker fallback (DEV-014) — shown when a navigation fails and
 * nothing cached matches the request. Precached by public/sw.js's install
 * handler so it's available even on a page never visited before. */

export const metadata: Metadata = { title: "You're offline — GreenGo" };

export default function OfflinePage() {
  return (
    <StatusScreen
      eyebrow="No connection"
      title="You're offline"
      body="GreenGo needs a connection to reach your device and the server. Readings and pump commands are never cached for offline use — that would risk showing you a stale soil reading as if it were live. Reconnect and try again."
      actions={<ReloadButton />}
    />
  );
}
