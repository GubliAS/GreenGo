"use client";

import { useEffect, useState } from "react";
import { SegmentedBar } from "../ui/SegmentedBar";
import { IconHumidity, IconMoisture } from "../icons";
import { describeMoisture } from "@/lib/moisture";

/* Live Demo readings — the public, read-only view of the real device.
 * Ticks on the device's own 10-second cadence (handoff README: preserve this as
 * a product detail, don't speed it up).
 *
 * Handoff behaviour, verbatim: at seconds >= 10,
 *   percent  += random()*6-3, clamped 0-100
 *   temp     += random()*1-0.5, rounded to 1dp
 *   humidity += random()*4-2, clamped 0-100
 *   pumpOn    = percent < 30
 * Initial: percent 38, temp 27, humidity 64, seconds 0, pumpOn false.
 *
 * State coverage: confirmed only — "Connected" is hardcoded and no
 * pending/unknown treatment is designed for this page (MANIFEST §D.2). This is
 * a public page, so a stale device will eventually be visible here. */

export function LiveDemoReadings() {
  const [percent, setPercent] = useState(38);
  const [temp, setTemp] = useState(27);
  const [humidity, setHumidity] = useState(64);
  const [seconds, setSeconds] = useState(0);
  const [pumpOn, setPumpOn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 < 10) return s + 1;

        setPercent((p) => {
          const next = Math.max(
            0,
            Math.min(100, Math.round(p + (Math.random() * 6 - 3))),
          );
          setPumpOn(next < 30);
          return next;
        });
        setTemp((t) => Math.round((t + (Math.random() * 1 - 0.5)) * 10) / 10);
        setHumidity((h) =>
          Math.max(0, Math.min(100, Math.round(h + (Math.random() * 4 - 2)))),
        );
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
      {/* Hero soil card */}
      <div className="border-hair border-hairline rounded-card-sm p-card-lg flex flex-col gap-5 bg-white">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-caption text-muted tracking-caps uppercase">
            Greenhouse 1 · soil moisture
          </span>
          <span className="text-meta text-leaf flex items-center gap-1.5 font-semibold">
            <span className="bg-leaf h-1.5 w-1.5 rounded-full" aria-hidden="true" />
            Connected
          </span>
        </div>

        <div className="flex items-baseline gap-3.5">
          <div className="font-mono text-72 text-canopy leading-none font-semibold">
            {percent}%
          </div>
          <div className="text-lg text-ink font-semibold">
            {describeMoisture(percent)}
          </div>
        </div>

        <SegmentedBar
          percent={percent}
          count={24}
          height={44}
          surface="marketing"
          radius="lg"
          animateFill
          label={`Soil moisture ${percent}% — ${describeMoisture(percent)}`}
        />

        <div className="text-caption text-muted flex justify-between">
          <span>Dry</span>
          <span>Threshold 30%</span>
          <span>Saturated</span>
        </div>

        <div className="text-meta text-muted" aria-live="polite">
          Last updated {seconds}s ago · next reading in {10 - seconds}s
        </div>
      </div>

      {/* Secondary readouts */}
      <div className="flex flex-col gap-3.5">
        <MintTile label="Air temperature" value={`${temp}°C`}>
          <IconMoisture size={28} className="text-leaf" />
        </MintTile>

        <MintTile label="Humidity" value={`${humidity}%`}>
          <IconHumidity size={28} className="text-leaf" withClapper={false} />
        </MintTile>

        <div className="bg-mint rounded-card flex items-center justify-between gap-4 p-5.5">
          <div>
            <div className="text-caption text-ink tracking-widest mb-1.5 uppercase">
              Pump
            </div>
            <div className="font-mono text-20 text-canopy font-semibold">
              {pumpOn ? "Pump on" : "Pump off"}
            </div>
          </div>
          <div
            className={`h-2.5 w-2.5 rounded-full ${pumpOn ? "bg-leaf" : "bg-dot-off"}`}
            aria-hidden="true"
          />
        </div>

        <div className="text-caption text-muted leading-normal px-1">
          Light level is optional on this device and can be removed without changing
          this layout.
        </div>
      </div>
    </div>
  );
}

function MintTile({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-mint rounded-card flex items-center justify-between gap-4 p-5.5">
      <div>
        <div className="text-caption text-ink tracking-widest mb-1.5 uppercase">
          {label}
        </div>
        <div className="font-mono text-28 text-canopy font-semibold">{value}</div>
      </div>
      {children}
    </div>
  );
}
