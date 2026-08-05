import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { PageTitle, Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/* /admin/config — DEV-005, no handoff design. Card-stack layout modeled on
 * the tenant /alerts page (handoff/admin.md §11). Values seeded from
 * .env.example — these are the platform-wide defaults new devices/tenants
 * inherit, editable here rather than only via environment variables. */

export const metadata: Metadata = { title: "Config — GreenGo Admin" };

function ConfigField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-meta text-canopy mb-1.5 block font-semibold">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        className="border-hair border-line rounded-input box-border w-24 bg-white px-3 py-2.75 text-base font-mono"
      />
    </div>
  );
}

export default function AdminConfigPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar active="config" />
      <div className="p-page max-w-form-wide mx-auto flex flex-col gap-4.5">
        <PageTitle>Global config</PageTitle>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>Default alert thresholds</CardTitle>
          <p className="text-meta text-muted m-0">
            Applied to newly claimed devices. Tenants can override per device
            on their Alerts page.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            <ConfigField label="Soil below (%)" defaultValue="30" />
            <ConfigField label="Alert cooldown (min)" defaultValue="60" />
          </div>
        </Card>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>Pump interlocks</CardTitle>
          <p className="text-meta text-muted m-0">
            Enforced server-side regardless of what the client requests.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            <ConfigField label="Max run (s)" defaultValue="600" />
            <ConfigField label="Cooldown between cycles (s)" defaultValue="900" />
            <ConfigField label="Daily runtime cap (s)" defaultValue="3600" />
            <ConfigField label="Command TTL (s)" defaultValue="60" />
          </div>
        </Card>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>SMS &amp; quiet hours</CardTitle>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            <ConfigField label="Daily SMS cap" defaultValue="10" />
            <div>
              <label className="text-meta text-canopy mb-1.5 block font-semibold">
                Quiet hours (default)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  defaultValue="9:00 PM"
                  className="border-hair border-line rounded-input box-border w-27.5 bg-white px-3 py-2.75 text-base"
                />
                <span className="text-sm text-muted">to</span>
                <input
                  type="text"
                  defaultValue="5:30 AM"
                  className="border-hair border-line rounded-input box-border w-27.5 bg-white px-3 py-2.75 text-base"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>Device staleness</CardTitle>
          <p className="text-meta text-muted m-0">
            A device with no reading for longer than this is treated as
            unknown/stale across every dashboard.
          </p>
          <ConfigField label="Stale after (s)" defaultValue="120" />
        </Card>

        <Button variant="primary" size="md" className="self-start">
          Save config
        </Button>
      </div>
    </div>
  );
}
