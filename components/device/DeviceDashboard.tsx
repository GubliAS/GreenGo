"use client";

import { useEffect, useState } from "react";
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
 * Spec: handoff/tenant.md §2.
 *
 * Live values: short polling (5s) against GET /api/devices/[id]/live. The ESP
 * posts every ~10s; polling is simpler and more reliable on serverless than
 * SSE, and matches that cadence without holding open streams. */

const RANGES = ["12h", "24h", "48h", "Week", "Month"] as const;
const POLL_MS = 5000;

type LiveMetrics = {
  tempC: number | null;
  humidityPct: number | null;
  lightLux: number | null;
  batteryV: number | null;
};

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
  initialMetrics?: LiveMetrics;
  lastSeenLabel?: string;
  chartSeed?: number[];
}) {
  const toast = useToast();
  const [demoState, setDemoState] = useState<DeviceState | null>(null);
  const [liveState, setLiveState] = useState<DeviceState>(initialState);
  const [percent, setPercent] = useState(initialPercent);
  const [range, setRange] = useState<(typeof RANGES)[number]>("24h");
  const [relayOn, setRelayOn] = useState(initialRelayOn);
  const [mode, setMode] = useState<PumpMode>(initialMode);
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
  const [seenLabel, setSeenLabel] = useState(lastSeenLabel);
  const [chartPoints, setChartPoints] = useState(() => buildChartPoints(chartSeed));
  const [busy, setBusy] = useState(false);
  const [pendingUntil, setPendingUntil] = useState<number | null>(null);

  const state: DeviceState =
    pendingUntil && Date.now() < pendingUntil
      ? "pending"
      : (demoState ?? liveState);
  const isUnknown = state === "unknown";

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/devices/${deviceId}/live`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data.ok) return;

        setLiveState(data.state as DeviceState);
        if (typeof data.soilPct === "number") setPercent(data.soilPct);
        setRelayOn(!!data.relayOn);
        setMode(data.mode as PumpMode);
        setMetrics(data.metrics as LiveMetrics);
        setSeenLabel(data.lastSeenLabel as string);
        if (Array.isArray(data.chartSeed)) {
          setChartPoints(buildChartPoints(data.chartSeed as number[]));
        }

        // Clear optimistic pending once the live relay matches, or timeout.
        setPendingUntil((until) => {
          if (!until) return null;
          if (Date.now() >= until) return null;
          return until;
        });
      } catch {
        // Keep last good snapshot on transient network blips.
      }
    }

    poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [deviceId]);

  useEffect(() => {
    if (!pendingUntil) return;
    const remaining = pendingUntil - Date.now();
    if (remaining <= 0) {
      setPendingUntil(null);
      return;
    }
    const t = window.setTimeout(() => setPendingUntil(null), remaining);
    return () => window.clearTimeout(t);
  }, [pendingUntil]);

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
      setDemoState(null);
      setPendingUntil(Date.now() + 15000);
      toast.push({
        tone: "success",
        title: "Command queued",
        body: "Waiting for the device to check in (~10s).",
      });
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
          onChange={(v) => {
            setDemoState(v);
            setPendingUntil(null);
          }}
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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4.5">
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
            {isUnknown ? "Last reading 4 min ago — treat as stale" : seenLabel}
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
            mode={mode}
            relayOn={relayOn}
            onToggle={handleToggle}
          />

          <Card variant="compact" className="grid grid-cols-[repeat(auto-fit,minmax(min(130px,100%),1fr))] gap-3.5">
            <MetricReadout
              label="Air temp"
              value={isUnknown || metrics.tempC === null ? "—" : metrics.tempC}
              unit={isUnknown || metrics.tempC === null ? "" : "°C"}
            />
            <MetricReadout
              label="Humidity"
              value={isUnknown || metrics.humidityPct === null ? "—" : metrics.humidityPct}
              unit={isUnknown || metrics.humidityPct === null ? "" : "%"}
            />
            <MetricReadout
              label="Light"
              value={isUnknown || metrics.lightLux === null ? "—" : metrics.lightLux}
              unit={isUnknown || metrics.lightLux === null ? "" : "%"}
            />
            <MetricReadout
              label="Battery"
              value={metrics.batteryV ?? "—"}
              unit={metrics.batteryV !== null ? "V" : ""}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
