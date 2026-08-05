"use client";

import { useState } from "react";
import Link from "next/link";
import { BackLink, Card, PageTitle } from "../ui/Card";
import { AlertBanner } from "../ui/AlertBanner";
import { SegmentedBar } from "../ui/SegmentedBar";
import { StateSwitcher, RangePills } from "../ui/SegmentedControl";
import { MoistureChart } from "./MoistureChart";
import { PumpControl } from "./PumpControl";
import { MetricReadout } from "../ui/StatCard";
import { useToast } from "../ui/Toast";
import { describeMoisture } from "@/lib/moisture";
import type { DeviceState, PumpMode } from "@/lib/types";

/* Device dashboard → /devices/[id] · source: GreenGo Device Dashboard.dc.html
 * Spec: handoff/tenant.md §2. The reference screen — all three device states
 * designed.
 *
 * Phase 4B: the page wrapper fetches the real device (ownership-checked
 * against the session) and passes its actual state down as `initial*` props.
 * The 3-state switcher stays — it is a designed showcase control in the
 * handoff itself (the "demoState/liveState switcher" the README calls out),
 * not Phase-2 scaffolding — but it now starts from the device's REAL derived
 * state instead of a hardcoded "confirmed". The pump button, when the real
 * state is confirmed, calls the real POST /api/devices/[id]/pump endpoint;
 * switching the demo control to pending/unknown previews those states
 * without touching the backend, exactly as the handoff's own switcher does. */

const RANGES = ["12h", "24h", "48h", "Week", "Month"] as const;

function buildChartPoints(seed: number[]): number[] {
  if (seed.length > 0) return seed;
  return Array.from({ length: 24 }, (_, i) => {
    const h = 22 + Math.round(Math.sin(i / 2.4) * 14 + (i % 5) * 3);
    return Math.max(8, Math.min(100, h));
  });
}

export function DeviceDashboard({
  deviceId,
  deviceLabel,
  initialState = "confirmed",
  initialPercent = 38,
  initialRelayOn = false,
  initialMode = "AUTO",
  initialMetrics = { tempC: null, humidityPct: null, lightLux: null, batteryV: null },
  lastSeenLabel = "Last updated 6s ago",
  chartSeed = [],
}: {
  deviceId: string;
  deviceLabel: string;
  initialState?: DeviceState;
  initialPercent?: number;
  initialRelayOn?: boolean;
  initialMode?: PumpMode;
  initialMetrics?: {
    tempC: number | null;
    humidityPct: number | null;
    lightLux: number | null;
    batteryV: number | null;
  };
  lastSeenLabel?: string;
  chartSeed?: number[];
}) {
  const toast = useToast();
  const [state, setState] = useState<DeviceState>(initialState);
  const [range, setRange] = useState<(typeof RANGES)[number]>("24h");
  const [relayOn, setRelayOn] = useState(initialRelayOn);
  const [busy, setBusy] = useState(false);

  const isUnknown = state === "unknown";
  const percent = isUnknown ? initialPercent : initialPercent;
  const chartPoints = buildChartPoints(chartSeed);

  async function handleToggle() {
    setBusy(true);
    const action = relayOn ? "PUMP_OFF" : "PUMP_ON";
    try {
      const res = await fetch(`/api/devices/${deviceId}/pump`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.push({ tone: "danger", title: "Pump command failed", body: data.error });
        return;
      }
      setState("pending");
      setTimeout(() => {
        setRelayOn(action === "PUMP_ON");
        setState("confirmed");
        toast.push({
          tone: "success",
          title: action === "PUMP_ON" ? "Pump turned on" : "Pump turned off",
        });
      }, 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-wide mx-auto flex flex-col gap-4.5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <BackLink href="/devices">← All devices</BackLink>
          <PageTitle className="mt-1.5">{deviceLabel}</PageTitle>
        </div>
        <StateSwitcher
          ariaLabel="Device state (demo)"
          value={state}
          onChange={setState}
          options={[
            { value: "confirmed", label: "Confirmed" },
            { value: "pending", label: "Pending" },
            { value: "unknown", label: "Unknown" },
          ]}
        />
      </div>

      {isUnknown && (
        <AlertBanner tone="warn" icon live="alert">
          Device hasn&apos;t reported in 4 minutes. Readings below are the last
          known values, not live.
        </AlertBanner>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4.5">
        <Card variant="hero" className="flex flex-col gap-4.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-caption text-muted tracking-caps uppercase">
              Soil moisture
            </span>
            <span
              className={`text-meta flex items-center gap-1.5 font-semibold ${
                isUnknown ? "text-faint" : "text-leaf"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isUnknown ? "bg-faint" : "bg-leaf"}`}
                aria-hidden="true"
              />
              {isUnknown ? "Offline" : "Connected"}
            </span>
          </div>

          <div className="flex items-baseline gap-3.5">
            <div className="font-mono text-64 text-canopy leading-none font-semibold">
              {percent}%
            </div>
            <div className="text-lg text-ink font-semibold">
              {describeMoisture(percent)}
            </div>
          </div>

          <SegmentedBar
            percent={percent}
            count={24}
            height={40}
            surface="app"
            radius="lg"
            label={`Soil moisture ${percent}% — ${describeMoisture(percent)}`}
          />

          <div className="text-meta text-muted">
            {isUnknown ? "Last reading 4 min ago — treat as stale" : lastSeenLabel}
          </div>

          <div className="border-hairline flex flex-col gap-3.5 border-t pt-4.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-canopy font-semibold">
                Moisture, last 24h
              </span>
              <RangePills
                value={range}
                onChange={setRange}
                options={RANGES.map((r) => ({ value: r, label: r }))}
              />
            </div>
            <MoistureChart points={chartPoints} height={64} />
            <Link
              href={`/devices/${deviceId}/history`}
              className="text-meta text-leaf self-start font-semibold"
            >
              View full history →
            </Link>
          </div>
        </Card>

        <div className="flex flex-col gap-3.5">
          <PumpControl
            state={busy ? "pending" : state}
            mode={initialMode}
            relayOn={relayOn}
            onToggle={handleToggle}
          />

          <Card variant="compact" className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3.5">
            <MetricReadout
              label="Air temp"
              value={isUnknown || initialMetrics.tempC === null ? "—" : initialMetrics.tempC}
              unit={isUnknown || initialMetrics.tempC === null ? "" : "°C"}
            />
            <MetricReadout
              label="Humidity"
              value={isUnknown || initialMetrics.humidityPct === null ? "—" : initialMetrics.humidityPct}
              unit={isUnknown || initialMetrics.humidityPct === null ? "" : "%"}
            />
            <MetricReadout
              label="Light"
              value={isUnknown || initialMetrics.lightLux === null ? "—" : initialMetrics.lightLux}
              unit={isUnknown || initialMetrics.lightLux === null ? "" : " lx"}
            />
            <MetricReadout
              label="Battery"
              value={initialMetrics.batteryV ?? "—"}
              unit={initialMetrics.batteryV !== null ? "V" : ""}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
