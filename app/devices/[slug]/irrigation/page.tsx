import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { PageTitle } from "@/components/ui/Card";
import { Cell, DataTable, TableRow, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/Feedback";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveTenantDeviceForSubpath } from "@/lib/device-route";
import { formatDuration, formatWhen } from "@/lib/format";

/* Irrigation log → /devices/[slug]/irrigation · source: GreenGo Irrigation Log.dc.html
 * Spec: handoff/tenant.md §3. Rows come from IrrigationEvent (written when a
 * confirmed PUMP_OFF closes a cycle). */

export const metadata: Metadata = { title: "Irrigation log — GreenGo" };
export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "started", header: "Started", width: "1.1fr" },
  { key: "duration", header: "Duration", width: "1fr" },
  { key: "trigger", header: "Trigger", width: "0.8fr" },
  { key: "reason", header: "Stop reason", width: "1.3fr" },
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

  const events = await db.irrigationEvent.findMany({
    where: { deviceId: device.id },
    orderBy: { startedAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen">
      <AppTopBar active="irrigation" deviceSlug={device.slug} />
      <div className="p-page max-w-table mx-auto flex flex-col gap-4.5">
        <PageTitle>Irrigation log — {title}</PageTitle>

        {events.length === 0 ? (
          <EmptyState
            title="No irrigation events yet"
            body="Cycles appear here after the pump turns on and off — from AUTO or a dashboard command."
          />
        ) : (
          <DataTable columns={COLUMNS} minWidth={640} caption="Irrigation events">
            {events.map((e) => (
              <TableRow key={e.id} columns={COLUMNS} minWidth={640}>
                <Cell tone="canopy">{formatWhen(e.startedAt)}</Cell>
                <Cell tone="canopy" mono>
                  {formatDuration(e.durationSeconds)}
                </Cell>
                <Cell>
                  <StatusPill tone={e.trigger === "AUTO" ? "mint" : "stone"}>
                    {e.trigger}
                  </StatusPill>
                </Cell>
                <Cell tone="ink">{e.stopReason}</Cell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
