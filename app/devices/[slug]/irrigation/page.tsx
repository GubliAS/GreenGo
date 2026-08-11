import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { PageTitle } from "@/components/ui/Card";
import { Cell, DataTable, TableRow, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveTenantDeviceForSubpath } from "@/lib/device-route";

/* Irrigation log → /devices/[slug]/irrigation · source: GreenGo Irrigation Log.dc.html
 * Spec: handoff/tenant.md §3. */

export const metadata: Metadata = { title: "Irrigation log — GreenGo" };

const COLUMNS: Column[] = [
  { key: "started", header: "Started", width: "1.1fr" },
  { key: "duration", header: "Duration", width: "1fr" },
  { key: "trigger", header: "Trigger", width: "0.8fr" },
  { key: "reason", header: "Stop reason", width: "1.3fr" },
];

const EVENTS: { started: string; duration: string; trigger: "AUTO" | "MANUAL"; reason: string }[] = [
  { started: "Today, 6:14 AM", duration: "4m 20s", trigger: "AUTO", reason: "Soil reached 70% — target saturation" },
  { started: "Yesterday, 9:02 PM", duration: "2m 05s", trigger: "MANUAL", reason: "Stopped by user from dashboard" },
  { started: "Yesterday, 6:10 AM", duration: "5m 40s", trigger: "AUTO", reason: "Soil reached 68% — target saturation" },
  { started: "2 days ago, 6:12 AM", duration: "4m 55s", trigger: "AUTO", reason: "Soil reached 71% — target saturation" },
  { started: "3 days ago, 2:30 PM", duration: "1m 10s", trigger: "MANUAL", reason: "Stopped — physical switch set to MANUAL" },
  { started: "4 days ago, 6:08 AM", duration: "6m 02s", trigger: "AUTO", reason: "Soil reached 69% — target saturation" },
];

export default async function IrrigationLogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);
  const device = await resolveTenantDeviceForSubpath(slug, tenantId, "irrigation");
  const title = device.label ?? device.mac;

  return (
    <div className="min-h-screen">
      <AppTopBar active="irrigation" deviceSlug={device.slug} />
      <div className="p-page max-w-table mx-auto flex flex-col gap-4.5">
        <PageTitle>Irrigation log — {title}</PageTitle>

        <DataTable columns={COLUMNS} minWidth={640} caption="Irrigation events">
          {EVENTS.map((e) => (
            <TableRow key={e.started + e.duration} columns={COLUMNS} minWidth={640}>
              <Cell tone="canopy">{e.started}</Cell>
              <Cell tone="canopy" mono>
                {e.duration}
              </Cell>
              <Cell>
                <StatusPill tone={e.trigger === "AUTO" ? "mint" : "stone"}>
                  {e.trigger}
                </StatusPill>
              </Cell>
              <Cell tone="ink">{e.reason}</Cell>
            </TableRow>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
