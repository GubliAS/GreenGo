"use client";

import type { ReactNode } from "react";

/* Four distinct switcher mechanisms in the handoff. Their geometry differs
 * enough that collapsing them into one component would misrepresent the
 * design, so each is its own export.
 *
 * 1. SlidingTabs   — Login "Log in" / "Claim your device". An absolutely
 *                    positioned white pill slides via translateX over 320ms.
 * 2. StateSwitcher — confirmed/pending/unknown demo toggle (Device Dashboard,
 *                    Device Detail live tab) and the calibrated/uncalibrated
 *                    toggle. Active = canopy fill, white text.
 * 3. PillToggle    — admin role toggle. Active = white fill + shadow-pill.
 * 4. RangePills    — 12h/24h/48h/Week/Month. Active = mint fill.
 */

export type Option<T extends string> = { value: T; label: string };

/** 1. Sliding-pill tabs — two options only, pill width is calc(50% - 5px). */
export function SlidingTabs<T extends string>({
  options,
  value,
  onChange,
  width = 320,
  ariaLabel,
}: {
  options: [Option<T>, Option<T>];
  value: T;
  onChange: (v: T) => void;
  width?: number;
  ariaLabel: string;
}) {
  const activeIndex = options.findIndex((o) => o.value === value);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="bg-stone rounded-menu relative grid grid-cols-2 p-1.25"
      style={{ width }}
    >
      <div
        aria-hidden="true"
        className="rounded-pill-sm shadow-pill absolute inset-1.25 bg-white transition-transform duration-320"
        style={{
          width: "calc(50% - 5px)",
          transform: `translateX(${activeIndex * 100}%)`,
          transitionTimingFunction: "var(--ease-ui)",
        }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-pill-sm text-sm relative z-1 cursor-pointer border-0 bg-transparent px-2.5 py-2.25 font-semibold whitespace-nowrap transition-colors duration-250 ${
              active ? "text-canopy" : "text-muted"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 2. State switcher — canopy fill when active. Track is white on the tenant
 *  dashboard (border line-soft) and also white on the admin live tab. */
export function StateSwitcher<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="border-hair border-line-soft rounded-menu flex gap-2 bg-white p-1.25"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-pill-sm text-meta cursor-pointer border-0 px-3.5 py-1.75 font-semibold ${
              active ? "bg-canopy text-white" : "text-muted bg-transparent"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 3. Pill toggle — admin role switch. Active = white fill + subtle shadow. */
export function PillToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="bg-stone rounded-tile flex gap-1 p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-sm text-caption cursor-pointer border-0 px-3 py-1.75 font-semibold ${
              active ? "text-canopy shadow-pill bg-white" : "text-muted bg-transparent"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 4. Time-range pills — mint fill when active. Device Dashboard history. */
export function RangePills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Time range",
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-sm text-label cursor-pointer border-0 px-2.5 py-1.25 font-semibold ${
              active ? "bg-mint text-canopy" : "text-muted bg-transparent"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Underline tab bar — Admin Device Detail's 6 tabs. Active tab carries a 2px
 *  leaf bottom border that overlaps the container's own 1.5px rule. */
export function UnderlineTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="border-b-hair border-hairline flex gap-1.5 overflow-x-auto whitespace-nowrap"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`text-sm -mb-px cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-2.5 font-semibold ${
              active ? "border-leaf text-canopy" : "text-muted border-transparent"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Convenience re-export so pages can build option lists inline. */
export function opt<T extends string>(value: T, label: string): Option<T> {
  return { value, label };
}

export type { ReactNode };
