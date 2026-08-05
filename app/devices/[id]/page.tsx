import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { DeviceDashboard } from "@/components/device/DeviceDashboard";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";

/* Device dashboard → /devices/[id] · source: GreenGo Device Dashboard.dc.html
 * Spec: handoff/tenant.md §2.
 *
 * tenantId comes ONLY from the session (middleware.ts already guarantees a
 * tenant session exists for this route) — the device is looked up by BOTH
 * id and tenantId in one query, so a tenant guessing another tenant's device
 * id gets exactly the same "not found" as a nonexistent id. Never scope by
 * request parameter alone. */

export const metadata: Metadata = { title: "Device — GreenGo" };
export const dynamic = "force-dynamic"; // live device + reading rows

const STALE_AFTER_SECONDS = Number(process.env.DEVICE_STALE_AFTER_SECONDS ?? 120);

export default async function DeviceDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);

  const device = await db.device.findFirst({ where: { id, tenantId } });
  if (!device) notFound();

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
      <AppTopBar active="devices" />
      <div className="p-page">
        <DeviceDashboard
          deviceId={device.id}
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
