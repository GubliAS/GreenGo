import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/Feedback";
import { PageTitle } from "@/components/ui/Card";
import Link from "next/link";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";

/* Devices list → /devices · source: GreenGo Devices List.dc.html
 * Spec: handoff/tenant.md §1. Reference implementation for the app top bar's
 * mobile variant.
 *
 * tenantId comes only from the session (see /devices/[id]/page.tsx for the
 * same invariant applied to a single-device lookup). */

export const metadata: Metadata = { title: "Your greenhouses — GreenGo" };
export const dynamic = "force-dynamic"; // per-tenant device rows from the session

const STALE_AFTER_SECONDS = Number(process.env.DEVICE_STALE_AFTER_SECONDS ?? 120);

export default async function DevicesListPage() {
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);

  const devices = await db.device.findMany({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });

  const latestByDevice = await Promise.all(
    devices.map((d) =>
      db.reading.findFirst({ where: { deviceId: d.id }, orderBy: { recordedAt: "desc" } }),
    ),
  );

  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" />

      <div className="p-devices-page">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <PageTitle size="lg">Your greenhouses</PageTitle>
          <div className="text-body text-muted">
            {devices.length} device{devices.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="max-w-app grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4.5">
          {devices.map((device, i) => {
            const reading = latestByDevice[i];
            const percent = reading?.soilPct ?? 0;
            const isOnline =
              !!device.lastSeenAt &&
              Date.now() - device.lastSeenAt.getTime() <= STALE_AFTER_SECONDS * 1000;
            const lastSeen = device.lastSeenAt ? relativeSeconds(device.lastSeenAt) : "never";

            return (
              <Link
                key={device.id}
                href={`/devices/${device.id}`}
                className="border-hair border-hairline rounded-card flex flex-col gap-4 bg-white p-6 text-inherit"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl text-canopy mb-1 font-bold">
                      {device.label ?? device.mac}
                    </div>
                    <div className="text-meta text-muted">{device.mac}</div>
                  </div>
                  <StatusPill tone={isOnline ? "mint" : "stone"} dot size="md">
                    {isOnline ? "Online" : "Offline"}
                  </StatusPill>
                </div>

                <SegmentedBar percent={percent} count={16} height={24} surface="app" radius="sm" />

                <div className="text-sm text-ink flex items-center justify-between">
                  <span>
                    Soil <strong className="font-mono text-canopy">{percent}%</strong> · last
                    seen {lastSeen} ago
                  </span>
                </div>
              </Link>
            );
          })}

          <EmptyState
            title="Add a device"
            body="You already have an account — just enter the claim code for the next greenhouse."
            action={
              <Link href="/devices/add" className="text-sm text-leaf font-semibold">
                I have a claim code
              </Link>
            }
          />
        </div>
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
