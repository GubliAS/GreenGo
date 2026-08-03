import type { ReactNode } from "react";

/* The handoff's table shell, used on five screens. It is a CSS grid inside an
 * overflow-x:auto wrapper with a min-width on both header and body rows, so
 * data-dense tables scroll horizontally on narrow viewports rather than
 * compressing into unreadable columns.
 *
 * Observed min-widths: 640px (Irrigation Log, Audit Log, Raw telemetry),
 * 680px (Commands), 820px (Admin Devices List).
 *
 * Phase 5 will add the mobile card treatment the handoff README offers as an
 * alternative ("or a card-based mobile layout ... if preferred"). Until then
 * this is the designed behaviour, verbatim.
 */

export type Column = {
  key: string;
  header: ReactNode;
  /** Grid fraction, e.g. "1.1fr" — taken from the handoff's grid-template-columns. */
  width: string;
  /** Right-aligned action column. */
  align?: "start" | "end";
};

export function DataTable({
  columns,
  minWidth,
  density = "comfortable",
  caption,
  children,
}: {
  columns: Column[];
  minWidth: number;
  /** comfortable = 16px 22px rows (logs) · compact = 11px 20px (telemetry) */
  density?: "comfortable" | "compact";
  /** Screen-reader description. The handoff has no table captions; tables are
   *  bare grids, so this is added for the a11y floor. */
  caption?: string;
  children: ReactNode;
}) {
  const template = columns.map((c) => c.width).join(" ");
  const headerPad = density === "comfortable" ? "px-5.5 py-3.5" : "px-5 py-3";

  return (
    <div className="border-hair border-hairline rounded-card overflow-x-auto bg-white">
      {caption && <span className="sr-only">{caption}</span>}
      <div
        role="row"
        className={`bg-app text-micro text-muted tracking-wider grid font-semibold uppercase ${headerPad}`}
        style={{ minWidth, gridTemplateColumns: template }}
      >
        {columns.map((c) => (
          <div
            key={c.key}
            role="columnheader"
            className={c.align === "end" ? "text-right" : undefined}
          >
            {c.header}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

export function TableRow({
  columns,
  minWidth,
  density = "comfortable",
  children,
}: {
  columns: Column[];
  minWidth: number;
  density?: "comfortable" | "compact";
  children: ReactNode;
}) {
  const template = columns.map((c) => c.width).join(" ");
  const pad = density === "comfortable" ? "px-5.5 py-4" : "px-5 py-2.75";
  const text = density === "comfortable" ? "text-body" : "text-meta";

  return (
    <div
      role="row"
      className={`border-hairline-soft grid items-center border-t ${pad} ${text}`}
      style={{ minWidth, gridTemplateColumns: template }}
    >
      {children}
    </div>
  );
}

/** Cell helper so pages don't repeat role="cell" and the colour classes. */
export function Cell({
  children,
  tone = "ink",
  mono = false,
  align,
  className,
}: {
  children: ReactNode;
  tone?: "canopy" | "ink" | "muted";
  mono?: boolean;
  align?: "start" | "end";
  className?: string;
}) {
  const tones = {
    canopy: "text-canopy font-semibold",
    ink: "text-ink",
    muted: "text-muted",
  } as const;

  return (
    <div
      role="cell"
      className={[
        tones[tone],
        mono ? "font-mono" : "",
        align === "end" ? "text-right" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
