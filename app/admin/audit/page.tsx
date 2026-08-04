import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { BackLink, PageTitle } from "@/components/ui/Card";
import { Cell, DataTable, TableRow, type Column } from "@/components/ui/DataTable";

/* Audit log → /admin/audit · source: GreenGo Admin Audit Log.dc.html
 * Spec: handoff/admin.md §6. Copy verbatim. No pagination/filters designed —
 * added per DEV-005's admin/commands & admin/sms pattern; noted here too. */

export const metadata: Metadata = { title: "Audit log — GreenGo Admin" };

const COLUMNS: Column[] = [
  { key: "ts", header: "Timestamp", width: "1.1fr" },
  { key: "actor", header: "Actor", width: "1fr" },
  { key: "action", header: "Action", width: "1fr" },
  { key: "details", header: "Details", width: "1.4fr" },
];

const ENTRIES = [
  { ts: "Today · 09:02 GMT", actor: "Owusu Prempeh", action: "Viewed device", details: "Greenhouse 1 (A4:CF:12:8E:3B:01)" },
  { ts: "Yesterday · 17:40 GMT", actor: "Owusu Prempeh", action: "Provisioned device", details: "Claim code GG-9K21-P4 generated" },
  { ts: "3 days ago · 11:15 GMT", actor: "Owusu Prempeh", action: "Logged in", details: "From 102.184.XX.XX" },
  { ts: "2 months ago · 09:14 GMT", actor: "Owusu Prempeh", action: "Provisioned device", details: "Claim code GG-4F82-K1 generated for A4:CF:12:8E:3B:01" },
  { ts: "2 months ago · 08:50 GMT", actor: "Owusu Prempeh", action: "Logged in", details: "From 102.184.XX.XX" },
];

export default function AdminAuditLogPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar profileInteractive={false} />
      <div className="p-page max-w-table mx-auto flex flex-col gap-4.5">
        <div>
          <BackLink href="/admin/devices">← Back</BackLink>
          <PageTitle className="mt-1.5">Audit log</PageTitle>
        </div>

        <DataTable columns={COLUMNS} minWidth={640} caption="Audit log entries">
          {ENTRIES.map((e) => (
            <TableRow key={e.ts + e.action} columns={COLUMNS} minWidth={640}>
              <Cell tone="canopy">{e.ts}</Cell>
              <Cell>{e.actor}</Cell>
              <Cell>{e.action}</Cell>
              <Cell tone="muted">{e.details}</Cell>
            </TableRow>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
