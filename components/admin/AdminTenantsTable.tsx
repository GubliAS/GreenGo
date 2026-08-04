"use client";

import { useState } from "react";
import Link from "next/link";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { Pagination } from "../ui/Pagination";
import { EmptyState } from "../ui/Feedback";

/* /admin/tenants — DEV-005, no handoff design. Composed from the Admin
 * Devices List table shell (handoff/admin.md §7). */

const COLUMNS: Column[] = [
  { key: "name", header: "Name", width: "1.2fr" },
  { key: "phone", header: "Phone", width: "1fr" },
  { key: "devices", header: "Devices", width: "0.7fr" },
  { key: "joined", header: "Joined", width: "0.9fr" },
  { key: "actions", header: "Actions", width: "0.6fr" },
];

const TENANTS = [
  { id: "kwame-asante", name: "Kwame Asante", phone: "+233 24 XXX XX01", devices: 1, joined: "2 months ago" },
];

export function AdminTenantsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = TENANTS.filter((t) =>
    t.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4.5">
      <input
        type="text"
        placeholder="Search by name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border-hair border-line rounded-input box-border max-w-90 bg-white px-3.5 py-2.5 text-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No tenants found" body="Try a different search." />
      ) : (
        <>
          <DataTable columns={COLUMNS} minWidth={720} caption="Tenants">
            {filtered.map((t) => (
              <TableRow key={t.id} columns={COLUMNS} minWidth={720}>
                <Cell tone="canopy">{t.name}</Cell>
                <Cell tone="muted" mono className="text-meta">
                  {t.phone}
                </Cell>
                <Cell mono>{t.devices}</Cell>
                <Cell tone="muted" className="text-meta">
                  {t.joined}
                </Cell>
                <Cell>
                  <Link href={`/admin/tenants/${t.id}`} className="font-semibold">
                    View
                  </Link>
                </Cell>
              </TableRow>
            ))}
          </DataTable>
          <Pagination page={page} pageCount={1} onPageChange={setPage} label="Tenant pages" />
        </>
      )}
    </div>
  );
}
