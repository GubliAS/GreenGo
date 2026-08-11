import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { DeviceDashboard } from "@/components/device/DeviceDashboard";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveTenantDevice } from "@/lib/device-route";

/* Device dashboard → /devices/[slug] · source: GreenGo Device Dashboard.dc.html
 * Spec: handoff/tenant.md §2.
 *
 * tenantId comes ONLY from the session. Public URL uses human-readable slug;
 * internal cuid is used for API calls only. */

export const metadata: Metadata = { title: "Device — GreenGo" };
export const dynamic = "force-dynamic";

const STALE_AFTER_SECONDS = Number(process.env.DEVICE_STALE_AFTER_SECONDS ?? 120);

export default async function DeviceDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);
  const device = await resolveTenantDevice(slug, tenantId);

  const latestReading = await db.reading.findFirst({
    where: { deviceId: device.id },
    orderBy: { recordedAt: "desc" },
  });

  const isStale =
    !device.lastSeenAt || Date.now() - device.lastSeenAt.getTime() > STALE_AFTER_SECONDS * 1000;

  const recentReadings = await db.reading.findMany({
    where: { deviceId: device.id },
    orderBy: { recordedAt: "desc" },
    take: 24,
  });
  const chartSeed = recentReadings
    .slice()
    .reverse()
    .map((r) => r.soilPct)
    .filter((v): v is number => v !== null);

  const lastSeenLabel = device.lastSeenAt
    ? `Last updated ${relativeSeconds(device.lastSeenAt)} ago`
    : "Never reported";

  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" deviceSlug={device.slug} />
      <div className="p-page">
        <DeviceDashboard
          deviceId={device.id}
          deviceSlug={device.slug}
          deviceLabel={device.label ?? device.mac}
          initialState={isStale ? "unknown" : "confirmed"}
          initialPercent={latestReading?.soilPct ?? 0}
          initialRelayOn={device.relayOn}
          initialMode={device.mode}
          initialMetrics={{
            tempC: latestReading?.tempC ?? null,
            humidityPct: latestReading?.humidityPct ?? null,
            lightLux: latestReading?.lightLux ?? null,
            batteryV: device.batteryV,
          }}
          lastSeenLabel={lastSeenLabel}
          chartSeed={chartSeed}
        />
      </div>
    </div>
  );
}

function relativeSeconds(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}
