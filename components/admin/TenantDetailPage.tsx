"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminTopBar } from "../nav/AdminTopBar";
import { BackLink, PageTitle, Card } from "../ui/Card";
import { UnderlineTabs } from "../ui/SegmentedControl";
import { Button } from "../ui/Button";
import { StatusPill } from "../ui/StatusPill";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { ConfirmDialog } from "../ui/Modal";
import type { AdminRole } from "@/lib/types";
import { MOCK_ADMIN } from "@/lib/mock/admin";

/* /admin/tenants/[id] — DEV-005, no handoff design. Composed from the Device
 * Detail tab layout (handoff/admin.md §8). Tabs: Profile, Devices,
 * SMS history, Login history. Destructive actions use ConfirmDialog
 * (DEV-004) since this page has no designed inline-confirmation pattern of
 * its own — and per the handoff's rule, support cannot see them at all. */

type Tab = "profile" | "devices" | "sms" | "logins";

const TABS: { value: Tab; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "devices", label: "Devices" },
  { value: "sms", label: "SMS history" },
  { value: "logins", label: "Login history" },
];

export function TenantDetailPage({ tenantName }: { tenantName: string }) {
  const [role] = useState<AdminRole>("super_admin");
  const [tab, setTab] = useState<Tab>("profile");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const canDestroy = role === "super_admin";

  return (
    <div className="min-h-screen">
      <AdminTopBar
        active="tenants"
        role={role}
        adminName={MOCK_ADMIN.name}
        adminEmail={MOCK_ADMIN.email}
        initials={MOCK_ADMIN.initials}
      />
      <div className="p-page max-w-app mx-auto flex flex-col gap-4.5">
        <div>
          <BackLink href="/admin/tenants">← All tenants</BackLink>
          <PageTitle className="mt-1.5">{tenantName}</PageTitle>
        </div>

        <UnderlineTabs ariaLabel="Tenant detail" value={tab} onChange={setTab} options={TABS} />

        {tab === "profile" && (
          <div className="flex flex-col gap-3.5">
            <Card className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-5">
              <Field label="Name" value={tenantName} />
              <Field label="Phone" value="+233 24 XXX XX01" />
              <Field label="Joined" value="2 months ago" />
              <Field label="Devices claimed" value="1" />
            </Card>

            {canDestroy && (
              <Card className="flex flex-col gap-3.5">
                <div className="text-base text-danger font-bold">Destructive actions</div>
                <div className="flex items-center justify-between">
                  <div className="text-meta text-muted max-w-105">
                    Suspending this tenant immediately signs them out and
                    blocks login until reinstated.
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                    Suspend tenant
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "devices" && (
          <Card className="flex items-center justify-between">
            <div>
              <div className="text-lg text-canopy font-semibold">Greenhouse 1</div>
              <div className="text-meta text-muted mt-0.5">A4:CF:12:8E:3B:01</div>
            </div>
            <Link href="/admin/devices/gh-1" className="text-sm font-semibold">
              View device →
            </Link>
          </Card>
        )}

        {tab === "sms" && <SmsHistoryTable />}
        {tab === "logins" && <LoginHistoryTable />}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setTyped("");
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          setTyped("");
        }}
        title="Suspend this tenant?"
        description="They will be signed out immediately and cannot log in until reinstated."
        confirmPhrase={tenantName}
        confirmLabel="Suspend tenant"
        typedValue={typed}
        onTypedValueChange={setTyped}
      />
    </div>
  );
}

function SmsHistoryTable() {
  const columns: Column[] = [
    { key: "queued", header: "Queued", width: "1fr" },
    { key: "body", header: "Message", width: "1.6fr" },
    { key: "status", header: "Status", width: "0.7fr" },
  ];
  const rows = [
    { queued: "Yesterday · 21:02 GMT", body: "GreenGo: soil at 24%, below your 30% threshold.", status: "delivered" as const },
    { queued: "3 days ago · 14:10 GMT", body: "GreenGo: pump turned on automatically.", status: "delivered" as const },
  ];
  return (
    <DataTable columns={columns} minWidth={640} caption="SMS history">
      {rows.map((r) => (
        <TableRow key={r.queued} columns={columns} minWidth={640}>
          <Cell tone="canopy">{r.queued}</Cell>
          <Cell tone="muted">{r.body}</Cell>
          <Cell>
            <StatusPill tone="mint" size="xs">
              {r.status}
            </StatusPill>
          </Cell>
        </TableRow>
      ))}
    </DataTable>
  );
}

function LoginHistoryTable() {
  const columns: Column[] = [
    { key: "ts", header: "Timestamp", width: "1fr" },
    { key: "outcome", header: "Outcome", width: "0.7fr" },
    { key: "ip", header: "IP", width: "1fr" },
  ];
  const rows = [
    { ts: "Today · 06:02 GMT", outcome: "success" as const, ip: "154.160.XX.XX" },
    { ts: "3 days ago · 14:47 GMT", outcome: "failed" as const, ip: "unknown" },
  ];
  return (
    <DataTable columns={columns} minWidth={520} caption="Login history">
      {rows.map((r) => (
        <TableRow key={r.ts} columns={columns} minWidth={520}>
          <Cell tone="canopy">{r.ts}</Cell>
          <Cell>
            <StatusPill tone={r.outcome === "success" ? "mint" : "danger"} size="xs">
              {r.outcome}
            </StatusPill>
          </Cell>
          <Cell tone="muted" mono>
            {r.ip}
          </Cell>
        </TableRow>
      ))}
    </DataTable>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-label text-muted mb-1.25 uppercase">{label}</div>
      <div className="text-lg text-canopy">{value}</div>
    </div>
  );
}
