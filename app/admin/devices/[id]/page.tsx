import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { BackLink, PageTitle } from "@/components/ui/Card";
import { DeviceDetailTabs } from "@/components/admin/DeviceDetailTabs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/* Admin Device Detail → /admin/devices/[id] · source: GreenGo Admin Device Detail.dc.html
 * Spec: handoff/admin.md §3. */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const device = await db.device.findUnique({ where: { id }, select: { label: true, mac: true } });
  const title = device?.label ?? device?.mac ?? "Device";
  return { title: `${title} — GreenGo Admin` };
}

export default async function AdminDeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.kind !== "admin") {
    redirect("/admin/login");
  }

  const [device, adminUser] = await Promise.all([
    db.device.findUnique({
      where: { id },
      include: {
        tenant: true,
        claimCodes: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.user.findUnique({ where: { id: session.userId }, select: { email: true } }),
  ]);
  if (!device) notFound();

  const now = new Date();
  const isClaimed = !!device.tenantId;
  const unconsumed = device.claimCodes.find(
    (c) => !c.consumedAt && (!c.expiresAt || c.expiresAt > now),
  );
  const consumed = device.claimCodes.find((c) => c.consumedAt);
  const claimCode = (isClaimed ? consumed?.code : unconsumed?.code) ?? device.claimCodes[0]?.code ?? "—";

  const claimedLabel = isClaimed
    ? device.claimedAt
      ? `Claimed ${relativeTime(device.claimedAt)}`
      : "Claimed"
    : unconsumed
      ? "Give this claim code to the farmer to bind the device"
      : device.claimCodes[0]?.consumedAt
        ? "Claim code already used"
        : "No active claim code — provision again if needed";

  const role = session.role === "SUPPORT" ? "support" : "super_admin";

  return (
    <div className="min-h-screen">
      <AdminTopBar
        active="devices"
        role={role}
        adminName={session.name}
        adminEmail={adminUser?.email ?? ""}
        initials={initials(session.name)}
      />
      <div className="p-page max-w-app mx-auto flex flex-col gap-4.5">
        <div>
          <BackLink href="/admin/devices">← All devices</BackLink>
          <PageTitle className="mt-1.5">{device.label ?? device.mac}</PageTitle>
        </div>
        <DeviceDetailTabs
          role={role}
          device={{
            mac: device.mac,
            claimCode,
            claimStatus: isClaimed ? "claimed" : "unclaimed",
            firmware: device.firmware,
            uptime: device.uptimeSeconds != null ? formatUptime(device.uptimeSeconds) : "—",
            signalDbm: device.signalDbm ?? 0,
            batteryV: device.batteryV ?? 0,
            tenantName: device.tenant?.name ?? "Unclaimed",
            claimedLabel,
          }}
        />
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
