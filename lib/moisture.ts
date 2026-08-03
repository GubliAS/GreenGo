import type { Segment } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   The signature element — segmented moisture bar.

   A DISCRETE segmented bar, not a smooth gradient fill, echoing the LCD
   bar-graph characters on the physical device. The handoff README: "We didn't
   design a new chart for the app. We redrew the one that's already there."

   rampRgb() and buildSegments() below are ported verbatim from the handoff,
   where they appear byte-identical in five files:
     GreenGo Landing Page · GreenGo Live Demo · GreenGo Device Dashboard
     GreenGo Devices List · GreenGo Admin Fleet Overview
   ═══════════════════════════════════════════════════════════════════════════ */

/** Four-stop interpolation ramp, dry → wet.
 *  NOTE: stops 0 and 1 are deliberately NOT the flat palette's
 *  --color-dry-critical (#C24A2C) / --color-warn (#DE8A3E). The handoff README
 *  documents the ramp with these rgb() values and the JS uses them, so the two
 *  sets coexist by design. Retained separately per ruling #2. See MANIFEST §B.5. */
const STOPS: readonly [number, number, number, number][] = [
  [0, 193, 56, 46], // #C1382E
  [0.33, 184, 121, 30], // #B8791E
  [0.66, 47, 157, 70], // #2F9D46 — matches --color-leaf
  [1, 23, 53, 42], // #17352A — matches --color-canopy
];

/** Interpolate the ramp at position `t` (0–1). Verbatim port. */
export function rampRgb(t: number): [number, number, number] {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const from = STOPS[i]!;
    const to = STOPS[i + 1]!;
    const [t0, r0, g0, b0] = from;
    const [t1, r1, g1, b1] = to;
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0 || 1);
      return [
        Math.round(r0 + (r1 - r0) * f),
        Math.round(g0 + (g1 - g0) * f),
        Math.round(b0 + (b1 - b0) * f),
      ];
    }
  }
  const last = STOPS[STOPS.length - 1]!;
  return [last[1], last[2], last[3]];
}

/** `rgb(r,g,b)` string for the ramp at position `t`. */
export function rampColor(t: number): string {
  const [r, g, b] = rampRgb(t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Build `count` segments for a bar showing `percent`.
 *
 * Two details worth preserving exactly, both from the handoff:
 *  1. Fill test is on the segment's RIGHT EDGE — `((i+1)/count)*100 <= percent`
 *     — so a segment only lights once fully covered.
 *  2. Colour is POSITION-based, `t = i/(count-1)`, not value-based. Each
 *     segment's hue depends on where it sits along the bar, not on the reading.
 *     A 40% bar and a 90% bar therefore share the same colours for their first
 *     40% of segments.
 */
export function buildSegments(count: number, percent: number): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < count; i++) {
    const rightEdge = ((i + 1) / count) * 100;
    const t = i / (count - 1 || 1);
    segments.push(
      rightEdge <= percent
        ? { index: i, filled: true, color: rampColor(t) }
        : { index: i, filled: false, color: null },
    );
  }
  return segments;
}

/** Reading description thresholds — verbatim from the handoff's
 *  describeMoisture(), identical across all five files that define it. */
export function describeMoisture(percent: number): string {
  if (percent < 20) return "Critically dry";
  if (percent < 30) return "Dry";
  if (percent < 70) return "Moist — healthy range";
  return "Saturated";
}

/* ── Calibration ────────────────────────────────────────────────────────────
   Raw ADC → percentage. A resistive probe reads HIGHER when dry, so dryRaw is
   the larger value and the mapping is inverted. Returns null when the device
   has never been calibrated: a percentage derived from guessed endpoints is
   worse than no percentage, and the UI has a designed state for "uncalibrated".
   ─────────────────────────────────────────────────────────────────────────── */

export function soilRawToPercent(
  soilRaw: number,
  calibration: { dryRaw: number; wetRaw: number } | null,
): number | null {
  if (!calibration) return null;
  const { dryRaw, wetRaw } = calibration;
  if (dryRaw === wetRaw) return null;
  const pct = ((dryRaw - soilRaw) / (dryRaw - wetRaw)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
