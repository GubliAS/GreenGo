import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { PageTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { AdminDevicesTable, type AdminDeviceRow } from "@/components/admin/AdminDevicesTable";
import { db } from "@/lib/db";

/* Admin Devices List → /admin/devices · source: GreenGo Admin Devices List.dc.html
 * Spec: handoff/admin.md §2. */

export const metadata: Metadata = { title: "Devices — GreenGo Admin" };
export const dynamic = "force-dynamic"; // real device rows, not build-time data

const STALE_AFTER_SECONDS = Number(process.env.DEVICE_STALE_AFTER_SECONDS ?? 120);

export default async function AdminDevicesListPage() {
  const devices = await db.device.findMany({
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });

  const rows: AdminDeviceRow[] = devices.map((d) => {
    const isOnline =
      !!d.lastSeenAt && Date.now() - d.lastSeenAt.getTime() <= STALE_AFTER_SECONDS * 1000;
    const status: AdminDeviceRow["status"] = d.disabled
      ? "Disabled"
      : !d.tenantId
        ? "Unclaimed"
        : !d.lastSeenAt
          ? "Never reported"
          : isOnline
            ? "Online"
            : "Offline";

    return {
      id: d.id,
      label: d.label ?? "—",
      mac: d.mac,
      tenant: d.tenant?.name ?? "Unclaimed",
      status,
      lastSeen: d.lastSeenAt ? `${relativeSeconds(d.lastSeenAt)} ago` : "never",
      firmware: d.firmware,
      href: d.tenantId ? `/admin/devices/${d.id}` : "/admin/devices/provision",
    };
  });

  return (
    <div className="min-h-screen">
      <AdminTopBar active="devices" />
      <div className="p-page max-w-wide mx-auto flex flex-col gap-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageTitle>Devices</PageTitle>
          <ButtonLink href="/admin/devices/provision" variant="primary" size="admin">
            + Provision device
          </ButtonLink>
        </div>
        <AdminDevicesTable devices={rows} />
      </div>
    </div>
  );
}

function relativeSeconds(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}
