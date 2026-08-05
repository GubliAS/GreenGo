"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dropdown } from "../ui/Dropdown";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { StatusPill, type PillTone } from "../ui/StatusPill";

/* Admin Devices List → /admin/devices · source: GreenGo Admin Devices List.dc.html
 * Spec: handoff/admin.md §2. Only Online/Unclaimed have designed row
 * treatments (MANIFEST §D.2); Offline/Never reported/Disabled extrapolated
 * here and logged as DEV-013.
 *
 * Phase 4B: rows come from the real database via the server-component page
 * wrapper, passed in as `devices` — this component only owns the
 * search/filter UI state. */

const COLUMNS: Column[] = [
  { key: "label", header: "Label", width: "1.1fr" },
  { key: "mac", header: "MAC address", width: "1.3fr" },
  { key: "tenant", header: "Tenant", width: "1.2fr" },
  { key: "status", header: "Status", width: "0.9fr" },
  { key: "lastSeen", header: "Last seen", width: "1fr" },
  { key: "firmware", header: "Firmware", width: "0.8fr" },
  { key: "actions", header: "Actions", width: "0.8fr" },
];

export type AdminDeviceRow = {
  id: string;
  label: string;
  mac: string;
  tenant: string;
  status: "Online" | "Offline" | "Never reported" | "Unclaimed" | "Disabled";
  lastSeen: string;
  firmware: string;
  href: string;
};

const STATUS_TONE: Record<AdminDeviceRow["status"], PillTone> = {
  Online: "mint",
  Offline: "stone",
  "Never reported": "stone",
  Unclaimed: "warn",
  Disabled: "danger",
};

export function AdminDevicesTable({ devices }: { devices: AdminDeviceRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [tenant, setTenant] = useState("All tenants");

  const tenantOptions = useMemo(
    () => ["All tenants", ...Array.from(new Set(devices.map((d) => d.tenant)))],
    [devices],
  );

  const filtered = devices.filter((d) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || d.mac.toLowerCase().includes(q) || d.label.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (status === "All statuses" || d.status === status) &&
      (tenant === "All tenants" || d.tenant === tenant)
    );
  });

  return (
    <div className="flex flex-col gap-4.5">
      <div className="relative flex flex-wrap gap-2.5">
        <input
          type="text"
          placeholder="Search by MAC or label"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-hair border-line rounded-input min-w-55 box-border flex-1 bg-white px-3.5 py-2.5 text-sm"
        />
        <Dropdown
          label="Status"
          value={status}
          onChange={setStatus}
          options={["All statuses", "Online", "Offline", "Never reported", "Unclaimed", "Disabled"]}
        />
        <Dropdown label="Tenant" value={tenant} onChange={setTenant} options={tenantOptions} />
      </div>

      <DataTable columns={COLUMNS} minWidth={820} caption="Devices">
        {filtered.length === 0 ? (
          <div className="text-meta text-muted p-6.5 text-center">
            No devices match these filters.
          </div>
        ) : (
          filtered.map((d) => (
            <TableRow key={d.id} columns={COLUMNS} minWidth={820}>
              <Cell tone="canopy">{d.label}</Cell>
              <Cell tone="muted" mono className="text-meta">
                {d.mac}
              </Cell>
              <Cell>{d.tenant}</Cell>
              <Cell>
                <StatusPill tone={STATUS_TONE[d.status]}>{d.status}</StatusPill>
              </Cell>
              <Cell tone="muted" className="text-meta">
                {d.lastSeen}
              </Cell>
              <Cell tone="muted" mono className="text-meta">
                {d.firmware}
              </Cell>
              <Cell>
                <Link href={d.href} className="font-semibold">
                  View
                </Link>
              </Cell>
            </TableRow>
          ))
        )}
      </DataTable>
    </div>
  );
}
