import type { Metadata } from "next";
import Link from "next/link";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { PageTitle, Card, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { db } from "@/lib/db";

/* Fleet overview → /admin · source: GreenGo Admin Fleet Overview.dc.html
 * Spec: handoff/admin.md §1. Copy verbatim.
 *
 * Not tenant-scoped — this is the fleet-wide admin view, so it reads across
 * all devices/tenants deliberately (unlike every tenant-facing page, which
 * must never do this). */

export const metadata: Metadata = { title: "Fleet overview — GreenGo Admin" };
// Reads the fleet live — every device/reading/alert/audit row is
// request-time state, not something a build-time prerender could ever see.
export const dynamic = "force-dynamic";

const STALE_AFTER_SECONDS = Number(process.env.DEVICE_STALE_AFTER_SECONDS ?? 120);

const ACTIVITY_DOT: Record<string, string> = {
  DEVICE_CLAIMED: "bg-leaf",
  DEVICE_PROVISIONED: "bg-leaf",
  COMMAND_ISSUED: "bg-canopy",
  LOGIN_FAILURE: "bg-danger",
  DEVICE_UNCLAIMED: "bg-warn",
  API_KEY_REGENERATED: "bg-warn",
};

export default async function AdminFleetPage() {
  const devices = await db.device.findMany();
  const now = Date.now();

  const total = devices.length;
  const unclaimed = devices.filter((d) => !d.tenantId).length;
  const neverReported = devices.filter((d) => !d.lastSeenAt).length;
  const online = devices.filter(
    (d) => d.lastSeenAt && now - d.lastSeenAt.getTime() <= STALE_AFTER_SECONDS * 1000,
  ).length;
  const offline = total - online - neverReported;

  const openAlerts = await db.alert.count({ where: { clearedAt: null } });

  const mostRecentDevice = devices
    .filter((d) => d.lastSeenAt)
    .sort((a, b) => (b.lastSeenAt?.getTime() ?? 0) - (a.lastSeenAt?.getTime() ?? 0))[0];
  const liveReading = mostRecentDevice
    ? await db.reading.findFirst({
        where: { deviceId: mostRecentDevice.id },
        orderBy: { recordedAt: "desc" },
      })
    : null;

  const activity = await db.auditEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const smsToday = await db.smsMessage.aggregate({
    where: {
      queuedAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
      status: { in: ["SENT", "DELIVERED"] },
    },
    _sum: { costMinor: true },
  });
  const smsThisMonth = await db.smsMessage.aggregate({
    where: {
      queuedAt: { gte: new Date(new Date().setUTCDate(1)) },
      status: { in: ["SENT", "DELIVERED"] },
    },
    _sum: { costMinor: true },
  });

  const counts = [
    { value: String(total), label: "Total devices", tone: "text-canopy" },
    { value: String(online), label: "Online", tone: online > 0 ? "text-leaf" : "text-faint" },
    { value: String(offline), label: "Offline", tone: offline > 0 ? "text-warn-text" : "text-faint" },
    { value: String(neverReported), label: "Never reported", tone: "text-faint" },
    { value: String(unclaimed), label: "Unclaimed", tone: unclaimed > 0 ? "text-warn-text" : "text-faint" },
    { value: String(openAlerts), label: "Alerting now", tone: openAlerts > 0 ? "text-danger" : "text-faint" },
  ];

  return (
    <div className="min-h-screen">
      <AdminTopBar active="fleet" />
      <div className="p-page max-w-wide mx-auto flex flex-col gap-5.5">
        <PageTitle>Fleet overview</PageTitle>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(120px,100%),1fr))] gap-3">
          {counts.map((c) => (
            <StatCard key={c.label} value={c.value} label={c.label} valueClassName={c.tone} />
          ))}
        </div>

        {mostRecentDevice && liveReading && (
          <div className="bg-canopy rounded-card flex flex-wrap items-center justify-between gap-6 p-6">
            <div>
              <div className="font-mono text-micro tracking-caps mb-2 uppercase text-white/60">
                {mostRecentDevice.label ?? mostRecentDevice.mac} · live from the fleet
              </div>
              <div className="flex items-baseline gap-2.5">
                <div className="font-mono text-36 font-semibold text-white">
                  {liveReading.soilPct ?? "—"}%
                </div>
                <div className="text-sm text-white/75">
                  soil moisture · updated{" "}
                  {mostRecentDevice.lastSeenAt ? relativeSeconds(mostRecentDevice.lastSeenAt) : "—"} ago
                </div>
              </div>
            </div>
            <div className="max-w-105 min-w-55 flex-1">
              <SegmentedBar
                percent={liveReading.soilPct ?? 0}
                count={24}
                height={32}
                surface="dark"
                radius="sm"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
          <Card>
            <CardTitle>Recent activity</CardTitle>
            <div className="mt-4 flex flex-col gap-3.5">
              {activity.length === 0 && (
                <div className="text-meta text-muted">No activity yet.</div>
              )}
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ACTIVITY_DOT[a.action] ?? "bg-muted"}`}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="text-body text-canopy">
                      <strong>{a.actorName}</strong> {a.details}
                    </div>
                    <div className="text-label text-muted mt-0.5">{relativeSeconds(a.createdAt)} ago</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/admin/commands"
              className="text-meta text-leaf mt-4 inline-block font-semibold"
            >
              View all commands →
            </Link>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardTitle>SMS spend</CardTitle>
              <div className="mt-3.5 flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Today</span>
                  <span className="font-mono text-lg text-canopy font-semibold">
                    {formatGhs(smsToday._sum.costMinor ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">This month</span>
                  <span className="font-mono text-lg text-canopy font-semibold">
                    {formatGhs(smsThisMonth._sum.costMinor ?? 0)}
                  </span>
                </div>
              </div>
              <Link href="/admin/sms" className="text-meta text-leaf mt-3.5 inline-block font-semibold">
                View SMS log →
              </Link>
            </Card>
            <div className="bg-mint rounded-card p-6">
              <div className="text-body text-canopy mb-2 font-semibold">
                Fleet is small on purpose
              </div>
              <div className="text-meta text-ink leading-body">
                {total} device{total === 1 ? "" : "s"} total, {unclaimed} awaiting provisioning.
                Every number above is exact, not a placeholder.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatGhs(minor: number): string {
  return `GHS ${(minor / 100).toFixed(2)}`;
}

function relativeSeconds(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}
