"use client";

import { useEffect, useState } from "react";
import { SegmentedBar } from "../ui/SegmentedBar";
import { describeMoisture } from "@/lib/moisture";

/* Landing hero live reading card. Ticks on the device's real 10-second
 * cadence, which the handoff README calls out as a deliberate product detail
 * ("not 'sped up' for polish").
 *
 * Initial state is fixed (percent 42, seconds 3) so SSR and hydration agree —
 * randomness only enters inside the interval, which is client-only.
 *
 * State coverage: confirmed only. The handoff hardcodes "Connected" here and
 * designs no pending/unknown treatment for this card (MANIFEST §D.2). */

export function HeroReadingCard() {
  const [percent, setPercent] = useState(42);
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= 10) {
          setPercent((p) =>
            Math.max(0, Math.min(100, Math.round(p + (Math.random() * 6 - 3)))),
          );
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="live"
      data-gg-anim="1"
      className="rounded-card shadow-hero animate-rise min-w-hero-card backdrop-blur-hero bg-white/92 px-6 py-5.5"
      style={{ animationDelay: "120ms" }}
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="font-mono text-micro text-muted tracking-caps uppercase">
          Greenhouse 1 · live
        </span>
        <span className="text-micro text-leaf flex items-center gap-1.5 font-semibold">
          <span className="bg-leaf h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          Connected
        </span>
      </div>

      <div className="font-mono text-34 text-canopy mb-0.5 font-semibold">
        {percent}%
      </div>
      <div className="text-meta text-ink mb-3.5">
        {describeMoisture(percent)} · updated {seconds}s ago
      </div>

      <SegmentedBar
        percent={percent}
        count={20}
        height={32}
        surface="marketing"
        radius="sm"
        animateFill
        label={`Soil moisture ${percent}% — ${describeMoisture(percent)}`}
      />
    </div>
  );
}
