import type { ReactNode } from "react";

/* Mono numeral + muted caption. Five screens, three geometries:
 *   fleet   · 26px numeral · radius 16 · padding 18 · border hairline (Fleet Overview)
 *   spec    · 22px numeral · radius 16 · padding 22 · no border      (Landing specs)
 *   metric  · 22px numeral · label above, uppercase                 (Dashboard grid)
 * The numeral colour varies by meaning — zero counts render faint, unclaimed
 * renders warn-text — so it is a prop rather than fixed. */

export function StatCard({
  value,
  label,
  valueClassName = "text-canopy",
  variant = "fleet",
}: {
  value: ReactNode;
  label: ReactNode;
  valueClassName?: string;
  variant?: "fleet" | "spec";
}) {
  const shell =
    variant === "fleet"
      ? "bg-white border-hair border-hairline rounded-panel p-4.5"
      : "bg-white rounded-panel p-5.5";

  const size = variant === "fleet" ? "text-26" : "text-22";

  return (
    <div className={shell}>
      <div className={`font-mono ${size} font-semibold ${valueClassName}`}>{value}</div>
      <div className="text-caption text-muted mt-1">{label}</div>
    </div>
  );
}

/** Dashboard / Device Detail metric readout: uppercase label above a mono
 *  value. Degrades to an em-dash when the device is stale, which is why the
 *  value type is ReactNode rather than number. */
export function MetricReadout({
  label,
  value,
  unit,
  size = "md",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  /** md = 22px (tenant dashboard) · sm = 20px/16px (admin live snapshot) */
  size?: "md" | "sm";
}) {
  return (
    <div>
      <div className="text-label text-muted tracking-widest mb-1.5 uppercase">
        {label}
      </div>
      <div
        className={`font-mono ${size === "md" ? "text-22" : "text-20"} text-canopy font-semibold`}
      >
        {value}
        {unit}
      </div>
    </div>
  );
}
