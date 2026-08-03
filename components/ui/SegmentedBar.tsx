import { buildSegments } from "@/lib/moisture";

/* The signature element. A discrete segmented bar echoing the LCD bar-graph
 * characters on the physical device — never a smooth gradient fill.
 *
 * Observed in the handoff at three scales and five exact configurations:
 *   hero        · 24 seg · 44px (Live Demo) / 40px (Dashboard) · radius 3px
 *   card-inline · 20 seg · 36px (Landing explainer) / 32px (Landing hero card)
 *   list-row    · 16 seg · 24px (Devices List) · radius 2px
 *   fleet strip · 24 seg · 32px on dark (Fleet Overview) · radius 2px
 *
 * Empty-segment border differs by surface, and the handoff is inconsistent
 * between .14 (app pages) and .16 (marketing pages) for the same component.
 * Both retained per ruling #2 — pick with the `surface` prop.
 */

export type BarSurface = "app" | "marketing" | "dark";

const EMPTY_CLASS: Record<BarSurface, string> = {
  app: "segment-empty",
  marketing: "segment-empty-marketing",
  dark: "segment-empty-dark",
};

export function SegmentedBar({
  percent,
  count = 24,
  height = 40,
  surface = "app",
  radius = "lg",
  /** Live-updating bars fade between colours; static ones don't. */
  animateFill = false,
  label,
}: {
  percent: number;
  count?: number;
  /** Bar container height in px — one of the handoff's 24/32/36/40/44. */
  height?: number;
  surface?: BarSurface;
  radius?: "sm" | "lg";
  animateFill?: boolean;
  /** Accessible description. Without it the bar is decorative to a screen
   *  reader, which would hide the page's primary reading. */
  label?: string;
}) {
  const segments = buildSegments(count, percent);
  const gap = radius === "lg" ? "gap-1" : "gap-0.75";
  const seg = radius === "lg" ? "rounded-segment-lg" : "rounded-segment";

  return (
    <div
      className={`flex ${gap}`}
      style={{ height }}
      role="meter"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Soil moisture ${percent}%`}
    >
      {segments.map((s) =>
        s.filled ? (
          <div
            key={s.index}
            className={`flex-1 ${seg} ${animateFill ? "transition-colors duration-320 ease-out" : ""}`}
            style={{ background: s.color! }}
          />
        ) : (
          <div key={s.index} className={`flex-1 ${seg} ${EMPTY_CLASS[surface]}`} />
        ),
      )}
    </div>
  );
}
