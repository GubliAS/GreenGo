"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BackLink, Card, PageTitle } from "../ui/Card";
import { AlertBanner } from "../ui/AlertBanner";
import { SegmentedBar } from "../ui/SegmentedBar";
import { RangePills } from "../ui/SegmentedControl";
import { MoistureChart } from "./MoistureChart";
import { PumpControl } from "./PumpControl";
import { MetricReadout } from "../ui/StatCard";
import { useToast } from "../ui/Toast";
import { describeMoisture } from "@/lib/moisture";
import type { DeviceState, PumpMode } from "@/lib/types";

/* Device dashboard → /devices/[slug] · source: GreenGo Device Dashboard.dc.html
 * Spec: handoff/tenant.md §2.
 *
 * Live values: short polling (3s) against GET /api/devices/[id]/live. The ESP
 * posts every ~5s; polling is simpler and more reliable on serverless than
 * SSE, and matches that cadence without holding open streams.
 * Device state (confirmed / pending / unknown) is derived only from live
 * telemetry + in-flight pump commands — no demo overrides. */

const RANGES = ["12h", "24h", "48h", "Week", "Month"] as const;
/* Poll a bit faster than ESP telemetry (~5s) so a new reading usually shows
 * within one browser tick. Sub-2s polls add load without much freshness gain. */
const POLL_MS = 3000;

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
  deviceSlug,
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
  deviceSlug: string;
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
  const awaitingRelayRef = useRef<boolean | null>(null);

  const state: DeviceState =
    pendingUntil && Date.now() < pendingUntil ? "pending" : liveState;
  const isUnknown = state === "unknown";

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/devices/${deviceId}/live`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data.ok) return;

        const nextRelay = !!data.relayOn;
        setLiveState(data.state as DeviceState);
        if (typeof data.soilPct === "number") setPercent(data.soilPct);
        setRelayOn(nextRelay);
        setMode(data.mode as PumpMode);
        setMetrics(data.metrics as LiveMetrics);
        setSeenLabel(data.lastSeenLabel as string);
        if (Array.isArray(data.chartSeed)) {
          setChartPoints(buildChartPoints(data.chartSeed as number[]));
        }

        // Drop optimistic pending once the device reports the expected relay
        // state, or when the wait window expires.
        const wanted = awaitingRelayRef.current;
        if (wanted !== null && nextRelay === wanted) {
          awaitingRelayRef.current = null;
          setPendingUntil(null);
        } else {
          setPendingUntil((until) => {
            if (!until) return null;
            if (Date.now() >= until) {
              awaitingRelayRef.current = null;
              return null;
            }
            return until;
          });
        }
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
      awaitingRelayRef.current = null;
      setPendingUntil(null);
      return;
    }
    const t = window.setTimeout(() => {
      awaitingRelayRef.current = null;
      setPendingUntil(null);
    }, remaining);
    return () => window.clearTimeout(t);
  }, [pendingUntil]);

  async function handleToggle() {
    setBusy(true);
    const action = relayOn ? "PUMP_OFF" : "PUMP_ON";
    const wantedRelay = action === "PUMP_ON";
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
      awaitingRelayRef.current = wantedRelay;
      setPendingUntil(Date.now() + 15000);
      toast.push({
        tone: "success",
        title: "Command queued",
        body: "Waiting for the device to check in (~5s).",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-wide mx-auto flex flex-col gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-4.5">
      <div className="min-w-0">
        <BackLink href="/devices">← All devices</BackLink>
        <PageTitle className="mt-1.5 truncate">{deviceLabel}</PageTitle>
      </div>

      {isUnknown && (
        <AlertBanner tone="warn" icon live="alert">
          Device hasn&apos;t reported recently. Readings below are the last
          known values, not live.
        </AlertBanner>
      )}

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-4.5">
        <Card variant="hero" className="flex flex-col gap-4 sm:gap-4.5" data-gg-anim="1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-caption text-muted tracking-caps uppercase">
              Soil moisture
            </span>
            <span
              className={`text-meta flex shrink-0 items-center gap-1.5 font-semibold ${
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

          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
            <div className="font-mono text-canopy text-[clamp(2.75rem,14vw,4rem)] leading-none font-semibold">
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
            {isUnknown ? `${seenLabel} — treat as stale` : seenLabel}
          </div>

          <div className="border-hairline flex flex-col gap-3.5 border-t pt-4.5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-canopy font-semibold">
                Moisture, last 24h
              </span>
              <div className="-mx-1 overflow-x-auto px-1">
                <RangePills
                  value={range}
                  onChange={setRange}
                  options={RANGES.map((r) => ({ value: r, label: r }))}
                />
              </div>
            </div>
            <MoistureChart points={chartPoints} height={64} />
            <Link
              href={`/devices/${deviceSlug}/history`}
              className="text-meta text-leaf inline-flex min-h-11 items-center self-start font-semibold"
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

          <Card
            variant="compact"
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-[repeat(auto-fit,minmax(min(130px,100%),1fr))]"
          >
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
