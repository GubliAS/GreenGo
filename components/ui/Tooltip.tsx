"use client";

import { useId, useState, type ReactNode } from "react";

/* DEV-004 — no handoff reference. Uses the dropdown-menu treatment
 * (radius 8, shadow-menu) inverted to canopy so it reads as an overlay
 * rather than another card.
 *
 * Opens on hover AND on focus, so it is reachable by keyboard. On touch it
 * opens on tap, because hover never fires — a plain hover-only tooltip would
 * be invisible to this product's primary users (Android phones). */

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const position =
    side === "top"
      ? "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2"
      : "top-[calc(100%+6px)] left-1/2 -translate-x-1/2";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`bg-canopy shadow-menu rounded-sm text-label leading-normal absolute z-50 w-max max-w-64 px-2.5 py-2 text-white ${position}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
