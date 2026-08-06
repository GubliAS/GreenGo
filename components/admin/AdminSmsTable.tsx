import { Card } from "../ui/Card";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { StatusPill, type PillTone } from "../ui/StatusPill";
import type { SmsStatus } from "@/lib/types";

/* /admin/sms — DEV-005, no handoff design. Table shell + status pills, plus
 * the Fleet Overview's SMS-spend summary promoted to the top of its own page
 * (handoff/admin.md §10). */

const COLUMNS: Column[] = [
  { key: "queued", header: "Queued", width: "1fr" },
  { key: "to", header: "To", width: "0.9fr" },
  { key: "device", header: "Device", width: "0.9fr" },
  { key: "body", header: "Message", width: "1.6fr" },
  { key: "status", header: "Status", width: "0.7fr" },
  { key: "cost", header: "Cost", width: "0.6fr" },
];

const STATUS_TONE: Record<SmsStatus, PillTone> = {
  delivered: "mint",
  sent: "stone",
  queued: "stone",
  failed: "danger",
  undelivered: "danger",
};

const ROWS: { queued: string; to: string; device: string; body: string; status: SmsStatus; cost: string }[] = [
  {
    queued: "Yesterday · 21:02 GMT",
    to: "+233 24 XXX XX01",
    device: "Greenhouse 1",
    body: "GreenGo: soil at 24%, below your 30% threshold.",
    status: "delivered",
    cost: "GHS 0.20",
  },
  {
    queued: "Today · 06:14 GMT",
    to: "+233 24 XXX XX01",
    device: "Greenhouse 1",
    body: "GreenGo: pump turned on automatically.",
    status: "delivered",
    cost: "GHS 0.20",
  },
  {
    queued: "3 days ago · 14:47 GMT",
    to: "+233 24 XXX XX01",
    device: "Greenhouse 1",
    body: "GreenGo: verification code 4821.",
    status: "failed",
    cost: "GHS 0.00",
  },
];

export function AdminSmsTable() {
  return (
    <div className="flex flex-col gap-4.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-3">
        <Card variant="compact">
          <div className="text-caption text-muted mb-1">Today</div>
          <div className="font-mono text-lg text-canopy font-semibold">GHS 0.60</div>
        </Card>
        <Card variant="compact">
          <div className="text-caption text-muted mb-1">This month</div>
          <div className="font-mono text-lg text-canopy font-semibold">GHS 8.40</div>
        </Card>
      </div>

      <DataTable columns={COLUMNS} minWidth={780} caption="SMS log">
        {ROWS.map((r, i) => (
          <TableRow key={r.queued + i} columns={COLUMNS} minWidth={780}>
            <Cell tone="canopy">{r.queued}</Cell>
            <Cell tone="muted" mono>
              {r.to}
            </Cell>
            <Cell tone="canopy">{r.device}</Cell>
            <Cell tone="muted">{r.body}</Cell>
            <Cell>
              <StatusPill tone={STATUS_TONE[r.status]} size="xs">
                {r.status}
              </StatusPill>
            </Cell>
            <Cell tone="canopy" mono>
              {r.cost}
            </Cell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
