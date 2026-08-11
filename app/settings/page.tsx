import type { Metadata } from "next";
import Link from "next/link";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { Card, CardTitle, PageTitle } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { LogoutLink } from "@/components/auth/LogoutLink";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";

/* Settings → /settings · source: GreenGo Settings.dc.html
 * Spec: handoff/tenant.md §6. Copy verbatim.
 *
 * Account/device fields are read from the real session + database. "Save
 * changes" is not wired to a write endpoint — same scope cut as the Alerts
 * page's thresholds form (handoff/tenant.md §4 notes no validation states
 * are even designed for these forms). Logged in DEVIATIONS.md, not silently
 * dropped. */

export const metadata: Metadata = { title: "Settings — GreenGo" };
export const dynamic = "force-dynamic"; // reads the real session + account row

export default async function SettingsPage() {
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);

  const user = await db.user.findUnique({ where: { id: session!.userId } });
  const device = await db.device.findFirst({ where: { tenantId }, orderBy: { createdAt: "asc" } });
  const claimCode = device
    ? await db.claimCode.findFirst({ where: { deviceId: device.id, consumedAt: { not: null } } })
    : null;

  return (
    <div className="min-h-screen">
      <AppTopBar active="settings" />
      <div className="p-page max-w-form mx-auto flex flex-col gap-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-4.5">
        <PageTitle>Settings</PageTitle>

        <Card className="flex flex-col gap-4">
          <CardTitle>Account</CardTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))]">
            <FormField label="Name" size="sm" defaultValue={user?.name} name="name" />
            <FormField
              label="Email or phone"
              size="sm"
              defaultValue={user?.email ?? user?.phoneE164}
              readOnly
              hint="Contact support to change your login email or phone."
              name="contact"
            />
          </div>
        </Card>

        {device && (
          <Card className="flex flex-col gap-3.5">
            <CardTitle>Device</CardTitle>
            <div className="bg-app rounded-tile flex flex-col gap-1.5 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-body text-canopy break-words">
                {device.label ?? device.mac}
                {claimCode ? ` — claim code ${claimCode.code}` : ""}
              </span>
              <span className="text-caption text-muted shrink-0">
                {device.claimedAt ? `Claimed ${relativeDays(device.claimedAt)}` : "Unclaimed"}
              </span>
            </div>
            <Link
              href={`/devices/${device.slug}/calibration`}
              className="text-sm inline-flex min-h-11 items-center self-start font-semibold"
            >
              Re-run calibration
            </Link>
          </Card>
        )}

        <Card className="flex flex-col gap-3.5">
          <CardTitle>Password</CardTitle>
          <FormField
            label="New password"
            type="password"
            size="sm"
            placeholder="At least 8 characters"
            name="password"
          />
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="primary" size="form">
            Save changes
          </Button>
          <LogoutLink className="text-sm text-danger inline-flex min-h-11 items-center font-semibold" />
        </div>
      </div>
    </div>
  );
}

function relativeDays(date: Date): string {
  const days = Math.max(0, Math.round((Date.now() - date.getTime()) / (24 * 3600 * 1000)));
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}
