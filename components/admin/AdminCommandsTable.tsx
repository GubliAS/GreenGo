"use client";

import { useState } from "react";
import { Dropdown } from "../ui/Dropdown";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { StatusPill, type PillTone } from "../ui/StatusPill";
import { Pagination } from "../ui/Pagination";
import type { CommandStatus } from "@/lib/types";

/* /admin/commands — DEV-005, no handoff design. Widens the Device Detail
 * Commands tab to fleet scope: adds a Device column and a status filter
 * covering all 5 CommandStatus values (handoff/admin.md §9). Only
 * Confirmed/Failed have designed pill treatments in the handoff — pending/
 * sent/expired extrapolated here (DEV-013). */

const COLUMNS: Column[] = [
  { key: "ts", header: "Timestamp", width: "1.1fr" },
  { key: "device", header: "Device", width: "1fr" },
  { key: "actor", header: "Actor", width: "1fr" },
  { key: "action", header: "Action", width: "0.8fr" },
  { key: "status", header: "Status", width: "0.8fr" },
  { key: "reason", header: "Stop reason", width: "1.3fr" },
];

const STATUS_TONE: Record<CommandStatus, PillTone> = {
  confirmed: "mint",
  failed: "danger",
  pending: "warn",
  sent: "warn",
  expired: "stone",
};

const ROWS: { ts: string; device: string; actor: string; action: string; status: CommandStatus; reason: string }[] = [
  { ts: "Today 6:14 AM", device: "Greenhouse 1", actor: "AUTO", action: "Pump on", status: "confirmed", reason: "Soil reached 70%" },
  { ts: "Yesterday 9:02 PM", device: "Greenhouse 1", actor: "Kwame Asante", action: "Pump off", status: "confirmed", reason: "Manual stop" },
  { ts: "3 days ago 2:30 PM", device: "Greenhouse 1", actor: "Kwame Asante", action: "Pump on", status: "failed", reason: "Device offline" },
  { ts: "4 days ago 6:08 AM", device: "Greenhouse 1", actor: "AUTO", action: "Pump on", status: "confirmed", reason: "Soil reached 69%" },
];

const STATUS_OPTIONS = ["All statuses", "pending", "sent", "confirmed", "failed", "expired"];

export function AdminCommandsTable() {
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);

  const filtered = ROWS.filter((r) => status === "All statuses" || r.status === status);

  return (
    <div className="flex flex-col gap-4.5">
      <Dropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />

      <DataTable columns={COLUMNS} minWidth={780} caption="Fleet command history">
        {filtered.map((r, i) => (
          <TableRow key={r.ts + i} columns={COLUMNS} minWidth={780}>
            <Cell tone="canopy">{r.ts}</Cell>
            <Cell tone="canopy">{r.device}</Cell>
            <Cell>{r.actor}</Cell>
            <Cell>{r.action}</Cell>
            <Cell>
              <StatusPill tone={STATUS_TONE[r.status]} size="xs">
                {r.status}
              </StatusPill>
            </Cell>
            <Cell tone="muted">{r.reason}</Cell>
          </TableRow>
        ))}
      </DataTable>
      <Pagination page={page} pageCount={1} onPageChange={setPage} label="Command pages" />
    </div>
  );
}
