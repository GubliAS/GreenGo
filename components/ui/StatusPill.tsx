import type { ReactNode } from "react";

/* One shape, four colour pairs — every pill in the handoff resolves to these.
 *   mint   → Online · Claimed · AUTO · Confirmed        (bg mint / fg canopy)
 *   warn   → Unclaimed · expired                        (bg warn-bg / fg warn-text)
 *   danger → Failed                                     (bg danger-bg / fg danger)
 *   stone  → MANUAL · Mode: X · Super admin             (bg stone / fg ink|muted)
 * Radius is always --radius-card (20px), which reads as fully round at these
 * heights — the handoff never uses a true pill radius here. */

export type PillTone = "mint" | "warn" | "danger" | "stone";

const TONES: Record<PillTone, string> = {
  mint: "bg-mint text-canopy",
  warn: "bg-warn-bg text-warn-text",
  danger: "bg-danger-bg text-danger",
  stone: "bg-stone text-ink",
};

export type PillSize = "xs" | "sm" | "md";

const SIZES: Record<PillSize, string> = {
  xs: "text-micro px-2.25 py-0.75", // 11px · 3px 9px — command outcome
  sm: "text-label px-2.5 py-1", // 11.5px · 4px 10px — table status
  md: "text-caption px-3 py-1.25", // 12px · 5px 12px — device card, role
};

export function StatusPill({
  tone = "mint",
  size = "sm",
  dot = false,
  dotClassName = "bg-leaf",
  children,
}: {
  tone?: PillTone;
  size?: PillSize;
  /** The Online badge and device cards prefix a 6px status dot. */
  dot?: boolean;
  dotClassName?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`rounded-card inline-flex items-center gap-1.5 font-semibold ${TONES[tone]} ${SIZES[size]}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

/* ── Device state dot ──────────────────────────────────────────────────────
   The three-state vocabulary as a single dot. confirmed=solid leaf (or the
   muted dot-off when the pump is idle), pending=amber + gg-pulse,
   unknown=faint grey with no animation. */

export function StateDot({
  state,
  on = true,
  size = 10,
}: {
  state: "confirmed" | "pending" | "unknown";
  /** Only meaningful for `confirmed`. Defaults to true: a bare connection/
   *  last-seen dot (Admin Device Detail's Live snapshot tab) means "confirmed
   *  = connected = green" with no pump concept involved. PumpControl passes
   *  this explicitly (on={pumpOn}) since ITS confirmed dot specifically
   *  distinguishes pump-on from pump-off-but-still-connected. Found via the
   *  Phase 6 "does every state render correctly" check — the connection dot
   *  was silently defaulting to the pump's "off" grey instead of leaf green. */
  on?: boolean;
  size?: number;
}) {
  const color =
    state === "unknown"
      ? "var(--color-faint)"
      : state === "pending"
        ? "var(--color-pending)"
        : on
          ? "var(--color-leaf)"
          : "var(--color-dot-off)";

  return (
    <span
      className={`shrink-0 rounded-full ${state === "pending" ? "animate-pulse-soft" : ""}`}
      style={{ width: size, height: size, background: color }}
      data-gg-anim={state === "pending" ? "1" : undefined}
      aria-hidden="true"
    />
  );
}
