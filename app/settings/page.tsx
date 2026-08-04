import type { Metadata } from "next";
import Link from "next/link";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { Card, CardTitle, PageTitle } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

/* Settings → /settings · source: GreenGo Settings.dc.html
 * Spec: handoff/tenant.md §6. Copy verbatim. */

export const metadata: Metadata = { title: "Settings — GreenGo" };

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <AppTopBar active="settings" />
      <div className="p-page max-w-form mx-auto flex flex-col gap-4.5">
        <PageTitle>Settings</PageTitle>

        <Card className="flex flex-col gap-4">
          <CardTitle>Account</CardTitle>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            <FormField label="Name" size="sm" defaultValue="Kwame Asante" name="name" />
            <FormField
              label="Email or phone"
              size="sm"
              defaultValue="kwame@farm.com"
              readOnly
              hint="Contact support to change your login email or phone."
              name="contact"
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <CardTitle>Device</CardTitle>
          <div className="bg-app rounded-tile flex items-center justify-between px-3.5 py-3">
            <span className="text-body text-canopy">
              Greenhouse 1 — claim code GG-4F82-K1
            </span>
            <span className="text-caption text-muted">Claimed 2 months ago</span>
          </div>
          <Link
            href="/devices/gh-1/calibration"
            className="text-sm self-start font-semibold"
          >
            Re-run calibration
          </Link>
        </Card>

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

        <div className="flex items-center justify-between">
          <Button variant="primary" size="form">
            Save changes
          </Button>
          <Link href="/" className="text-sm text-danger font-semibold">
            Log out
          </Link>
        </div>
      </div>
    </div>
  );
}
