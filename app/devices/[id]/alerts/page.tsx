import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { Card, CardTitle, PageTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/* Alerts & thresholds → /devices/[id]/alerts · source: GreenGo Alerts.dc.html
 * Spec: handoff/tenant.md §4. Copy verbatim. Form is non-functional in Phase 2;
 * wired in Phase 4B. No validation errors designed for these numeric fields;
 * hysteresis and daily SMS cap exist in the schema but have no UI here. */

export const metadata: Metadata = { title: "Alerts & thresholds — GreenGo" };

// py-2.75, not the handoff's literal py-2.5 (10px): at 10px this renders
// 43px tall, 1px under the ≥44px primary-input floor the handoff's own
// README states. Same DEV-001 reasoning — the explicit requirement wins.
const numberField =
  "border-hair border-line rounded-input box-border w-full bg-white px-3 py-2.75 text-base font-mono";
const timeField =
  "border-hair border-line rounded-input box-border w-27.5 bg-white px-3 py-2.75 text-base";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <div className="min-h-screen">
      <AppTopBar active="alerts" />
      <div className="p-page max-w-form-wide mx-auto flex flex-col gap-4.5">
        <PageTitle>Alerts &amp; thresholds — Greenhouse 1</PageTitle>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>Soil moisture</CardTitle>
          <div>
            <label
              htmlFor="soil-threshold"
              className="text-meta text-canopy mb-1.5 block font-semibold"
            >
              Alert when soil drops below
            </label>
            <div className="flex items-center gap-2.5">
              <input
                id="soil-threshold"
                type="text"
                defaultValue="30"
                className={`${numberField} w-20`}
              />
              <span className="text-base text-muted">%</span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>Temperature &amp; humidity bands</CardTitle>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            <div>
              <label className="text-meta text-canopy mb-1.5 block font-semibold">
                Temp min / max (°C)
              </label>
              <div className="flex gap-2">
                <input type="text" defaultValue="18" className={numberField} />
                <input type="text" defaultValue="32" className={numberField} />
              </div>
            </div>
            <div>
              <label className="text-meta text-canopy mb-1.5 block font-semibold">
                Humidity min / max (%)
              </label>
              <div className="flex gap-2">
                <input type="text" defaultValue="40" className={numberField} />
                <input type="text" defaultValue="85" className={numberField} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <CardTitle>SMS recipients</CardTitle>
          <div className="flex flex-col gap-2.5">
            <div className="bg-app rounded-tile flex items-center justify-between px-3.5 py-2.5">
              <span className="text-body text-canopy">+233 24 XXX XX01 (you)</span>
              <span className="text-caption text-muted">Primary</span>
            </div>
            <div className="bg-app rounded-tile flex items-center justify-between px-3.5 py-2.5">
              <span className="text-body text-canopy">+233 20 XXX XX45</span>
              <button className="text-caption cursor-pointer border-0 bg-transparent font-semibold">
                Remove
              </button>
            </div>
          </div>
          <button className="text-sm self-start cursor-pointer border-0 bg-transparent font-semibold">
            + Add a recipient
          </button>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <CardTitle>Quiet hours</CardTitle>
          <p className="text-sm text-muted m-0">
            No SMS sent in this window, unless soil is critically dry.
          </p>
          <div className="flex items-center gap-3">
            <input type="text" defaultValue="9:00 PM" className={timeField} />
            <span className="text-sm text-muted">to</span>
            <input type="text" defaultValue="5:30 AM" className={timeField} />
          </div>
        </Card>

        <Button variant="primary" size="md" className="self-start">
          Save thresholds
        </Button>
      </div>
    </div>
  );
}
