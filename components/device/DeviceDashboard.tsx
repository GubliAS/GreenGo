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
import { describeMoisture } from "@/lib/moisture";
import type { DeviceState } from "@/lib/types";

/* Device dashboard → /devices/[id] · source: GreenGo Device Dashboard.dc.html
 * Spec: handoff/tenant.md §2. The reference screen — all three device states
 * designed. Mock state toggle stands in for the real lastSeenAt-derived state
 * until Phase 4B. */

const RANGES = ["12h", "24h", "48h", "Week", "Month"] as const;

function buildChartPoints(): number[] {
  return Array.from({ length: 24 }, (_, i) => {
    const h = 22 + Math.round(Math.sin(i / 2.4) * 14 + (i % 5) * 3);
    return Math.max(8, Math.min(100, h));
  });
}

export function DeviceDashboard({
  deviceId,
  deviceLabel,
}: {
  deviceId: string;
  deviceLabel: string;
}) {
  const [state, setState] = useState<DeviceState>("confirmed");
  const [range, setRange] = useState<(typeof RANGES)[number]>("24h");
  const [relayOn, setRelayOn] = useState(false);

  const isUnknown = state === "unknown";
  const percent = isUnknown ? 24 : 38;
  const chartPoints = buildChartPoints();

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
            {isUnknown ? "Last reading 4 min ago — treat as stale" : "Last updated 6s ago"}
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
            state={state}
            mode="AUTO"
            relayOn={relayOn}
            onToggle={() => setRelayOn((v) => !v)}
          />

          <Card variant="compact" className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3.5">
            <MetricReadout label="Air temp" value={isUnknown ? "—" : "26.5"} unit={isUnknown ? "" : "°C"} />
            <MetricReadout label="Humidity" value={isUnknown ? "—" : "61"} unit={isUnknown ? "" : "%"} />
            <MetricReadout label="Light" value={isUnknown ? "—" : "820"} unit={isUnknown ? "" : " lx"} />
            <MetricReadout label="Battery" value={isUnknown ? "3.4" : "3.9"} unit="V" />
          </Card>
        </div>
      </div>
    </div>
  );
}
