"use client";

import { useState } from "react";
import { UnderlineTabs, StateSwitcher } from "../ui/SegmentedControl";
import { Card } from "../ui/Card";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { StateDot } from "../ui/StatusPill";
import { MetricReadout } from "../ui/StatCard";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { StatusPill } from "../ui/StatusPill";
import type { AdminRole, DeviceState } from "@/lib/types";

/* Admin Device Detail → /admin/devices/[id] · source: GreenGo Admin Device Detail.dc.html
 * Spec: handoff/admin.md §3. 6 tabs. canDestroy = role === 'super_admin' —
 * destructive controls are REMOVED from the DOM when support is active, not
 * disabled (the handoff README is explicit about this). */

type Tab = "identity" | "live" | "calibration" | "binding" | "telemetry" | "commands";

const TABS: { value: Tab; label: string }[] = [
  { value: "identity", label: "Identity" },
  { value: "live", label: "Live snapshot" },
  { value: "calibration", label: "Calibration" },
  { value: "binding", label: "Tenant binding" },
  { value: "telemetry", label: "Raw telemetry" },
  { value: "commands", label: "Commands" },
];

export function DeviceDetailTabs({
  role,
  device,
}: {
  /* The role toggle itself lives in AdminTopBar (the handoff renders it in
   * the top bar row, not above the tabs) — this component only reads it to
   * decide whether destructive controls exist in the DOM at all. */
  role: AdminRole;
  device: {
    mac: string;
    claimCode: string;
    firmware: string;
    uptime: string;
    signalDbm: number;
    batteryV: number;
    tenantName: string;
    claimedLabel: string;
  };
}) {
  const [tab, setTab] = useState<Tab>("identity");
  const canDestroy = role === "super_admin";

  return (
    <div className="flex flex-col gap-4.5">
      <UnderlineTabs ariaLabel="Device detail" value={tab} onChange={setTab} options={TABS} />

      {tab === "identity" && <IdentityTab device={device} canDestroy={canDestroy} />}
      {tab === "live" && <LiveSnapshotTab />}
      {tab === "calibration" && <CalibrationTab />}
      {tab === "binding" && <TenantBindingTab device={device} canDestroy={canDestroy} />}
      {tab === "telemetry" && <TelemetryTab />}
      {tab === "commands" && <CommandsTab />}
    </div>
  );
}

function IdentityTab({
  device,
  canDestroy,
}: {
  device: DeviceDetailTabsDevice;
  canDestroy: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [confirm, setConfirm] = useState("");
  const regenDisabled = confirm !== "Greenhouse 1";

  return (
    <div className="flex flex-col gap-3.5">
      <Card className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
        <Field label="MAC address" value={device.mac} />
        <Field
          label="Claim code"
          value={
            <>
              {device.claimCode}{" "}
              <StatusPill tone="mint" size="xs" >
                Claimed
              </StatusPill>
            </>
          }
        />
        <Field label="Firmware" value={device.firmware} />
        <Field label="Uptime" value={device.uptime} />
        <Field label="Signal" value={`${device.signalDbm} dBm`} />
        <Field label="Battery" value={`${device.batteryV}V`} />
      </Card>

      <Card className="flex flex-col gap-3.5">
        <div className="text-base text-canopy font-bold">Device API key</div>
        <div className="flex items-center gap-2.5">
          <div className="bg-app rounded-sm font-mono text-md text-canopy flex-1 px-3.5 py-2.5">
            {revealed ? "ggk_4f9a2c8b1e6d3f7a2c8b1e6d3f2a" : "••••••••••••••••••••••3F2A"}
          </div>
          <Button variant="outline" size="sm" onClick={() => setRevealed((v) => !v)}>
            {revealed ? "Hide" : "Reveal"}
          </Button>
        </div>

        {canDestroy && (
          <div className="border-hairline flex flex-col gap-2.5 border-t pt-3.5">
            <div className="text-meta text-danger font-semibold">
              Regenerating breaks this device until it is reflashed with the
              new key.
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder='Type "Greenhouse 1" to confirm'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="border-hair border-line rounded-sm box-border flex-1 px-3 py-2.25 text-sm"
              />
              <Button variant="destructive" size="sm" disabled={regenDisabled}>
                Regenerate key
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function LiveSnapshotTab() {
  const [state, setState] = useState<DeviceState>("confirmed");

  const soil = state === "unknown" ? "—" : "38%";
  const relay = state === "unknown" ? "Unknown" : state === "pending" ? "Pending" : "ON";
  const lastSeen =
    state === "confirmed" ? "8s ago" : state === "pending" ? "Awaiting ack" : "4 min ago — stale";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex justify-end">
        <StateSwitcher
          ariaLabel="Live state (demo)"
          value={state}
          onChange={setState}
          options={[
            { value: "confirmed", label: "Confirmed" },
            { value: "pending", label: "Pending" },
            { value: "unknown", label: "Unknown" },
          ]}
        />
      </div>
      <Card className="grid grid-cols-[repeat(auto-fit,minmax(min(140px,100%),1fr))] gap-4">
        <MetricReadout label="Soil moisture" value={soil} size="sm" />
        <MetricReadout label="Relay" value={relay} size="sm" />
        <MetricReadout label="Mode" value="AUTO" size="sm" />
        <div>
          <div className="text-label text-muted mb-1.25 uppercase">Last seen</div>
          <div className="flex items-center gap-1.5">
            <StateDot state={state} />
            <span className="text-base text-canopy font-semibold">{lastSeen}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CalibrationTab() {
  const [calibrated, setCalibrated] = useState(true);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex justify-end">
        <StateSwitcher
          ariaLabel="Calibration state (demo)"
          value={calibrated ? "calibrated" : "uncalibrated"}
          onChange={(v) => setCalibrated(v === "calibrated")}
          options={[
            { value: "calibrated", label: "Calibrated" },
            { value: "uncalibrated", label: "Uncalibrated" },
          ]}
        />
      </div>

      {!calibrated && (
        <AlertBanner tone="warn">
          This device has never been calibrated. Soil moisture readings are
          meaningless until dry and wet raw values are set.
        </AlertBanner>
      )}

      <Card
        className={`grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5 ${
          calibrated ? "opacity-100" : "opacity-40"
        }`}
      >
        <MetricReadout label="Dry raw value" value={612} size="sm" />
        <MetricReadout label="Wet raw value" value={198} size="sm" />
        <Field label="Set by" value="Kwame Asante" />
        <Field label="Set on" value="2 months ago" />
      </Card>
    </div>
  );
}

function TenantBindingTab({
  device,
  canDestroy,
}: {
  device: DeviceDetailTabsDevice;
  canDestroy: boolean;
}) {
  const [confirm, setConfirm] = useState("");
  const disabled = confirm !== device.tenantName;

  return (
    <div className="flex flex-col gap-3.5">
      <Card className="flex items-center justify-between">
        <div>
          <div className="text-label text-muted mb-1.25 uppercase">Current tenant</div>
          <div className="text-lg text-canopy font-semibold">{device.tenantName}</div>
          <div className="text-meta text-muted mt-0.5">{device.claimedLabel}</div>
        </div>
      </Card>

      {canDestroy && (
        <Card className="flex flex-col gap-3.5">
          <div className="text-base text-danger font-bold">Destructive actions</div>
          <div className="flex flex-col gap-2.5">
            <div className="text-meta text-muted">
              Unclaiming removes this device from {device.tenantName}&apos;s
              dashboard immediately. Type the tenant&apos;s name to confirm.
            </div>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder={`Type ${device.tenantName} to confirm`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="border-hair border-line rounded-sm box-border flex-1 px-3 py-2.25 text-sm"
              />
              <Button variant="destructive" size="sm" disabled={disabled} className="whitespace-nowrap">
                Unclaim device
              </Button>
            </div>
            <button className="text-sm self-start cursor-pointer border-0 bg-transparent font-semibold">
              Transfer to another tenant
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

function TelemetryTab() {
  const [liveTail, setLiveTail] = useState(false);
  const columns: Column[] = [
    { key: "ts", header: "Timestamp", width: "1.2fr" },
    { key: "soil", header: "Soil", width: "0.8fr" },
    { key: "temp", header: "Temp", width: "0.8fr" },
    { key: "hum", header: "Humidity", width: "0.8fr" },
    { key: "relay", header: "Relay", width: "0.7fr" },
  ];
  const rows = Array.from({ length: 8 }, (_, i) => ({
    ts: `06:${(14 - i).toString().padStart(2, "0")}:0${i}`,
    soil: 38 - i,
    temp: (26.5 - i * 0.1).toFixed(1),
    hum: 61 + i,
    relay: i < 2 ? "ON" : "OFF",
  }));

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="text-body text-muted">Last 100 payloads, newest first</div>
        <button
          onClick={() => setLiveTail((v) => !v)}
          className={`rounded-sm text-meta border-hair cursor-pointer px-3.5 py-2 font-semibold ${
            liveTail ? "border-leaf bg-mint text-canopy" : "border-line bg-white text-ink"
          }`}
        >
          {liveTail ? "● Live-tailing" : "Enable live-tail"}
        </button>
      </div>
      <DataTable columns={columns} minWidth={640} density="compact" caption="Raw telemetry">
        {rows.map((r) => (
          <TableRow key={r.ts} columns={columns} minWidth={640} density="compact">
            <Cell tone="canopy" mono>{r.ts}</Cell>
            <Cell tone="canopy" mono>{r.soil}%</Cell>
            <Cell tone="canopy" mono>{r.temp}°</Cell>
            <Cell tone="canopy" mono>{r.hum}%</Cell>
            <Cell tone="canopy" mono>{r.relay}</Cell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}

function CommandsTab() {
  const columns: Column[] = [
    { key: "ts", header: "Timestamp", width: "1.1fr" },
    { key: "actor", header: "Actor", width: "1fr" },
    { key: "action", header: "Action", width: "0.8fr" },
    { key: "outcome", header: "Outcome", width: "0.8fr" },
    { key: "reason", header: "Stop reason", width: "1.3fr" },
  ];
  const rows: { ts: string; actor: string; action: string; outcome: "Confirmed" | "Failed"; reason: string }[] = [
    { ts: "Today 6:14 AM", actor: "AUTO", action: "Pump on", outcome: "Confirmed", reason: "Soil reached 70%" },
    { ts: "Yesterday 9:02 PM", actor: "Kwame Asante", action: "Pump off", outcome: "Confirmed", reason: "Manual stop" },
    { ts: "3 days ago 2:30 PM", actor: "Kwame Asante", action: "Pump on", outcome: "Failed", reason: "Device offline" },
    { ts: "4 days ago 6:08 AM", actor: "AUTO", action: "Pump on", outcome: "Confirmed", reason: "Soil reached 69%" },
  ];

  return (
    <DataTable columns={columns} minWidth={680} caption="Command history">
      {rows.map((r) => (
        <TableRow key={r.ts} columns={columns} minWidth={680}>
          <Cell tone="canopy">{r.ts}</Cell>
          <Cell>{r.actor}</Cell>
          <Cell>{r.action}</Cell>
          <Cell>
            <StatusPill tone={r.outcome === "Confirmed" ? "mint" : "danger"} size="xs">
              {r.outcome}
            </StatusPill>
          </Cell>
          <Cell tone="muted">{r.reason}</Cell>
        </TableRow>
      ))}
    </DataTable>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-label text-muted mb-1.25 uppercase">{label}</div>
      <div className="font-mono text-lg text-canopy">{value}</div>
    </div>
  );
}

type DeviceDetailTabsDevice = {
  mac: string;
  claimCode: string;
  firmware: string;
  uptime: string;
  signalDbm: number;
  batteryV: number;
  tenantName: string;
  claimedLabel: string;
};
