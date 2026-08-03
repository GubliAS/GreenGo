import type { ReactNode } from "react";
import { IconCheck } from "../icons";

/* ── SuccessPanel ──────────────────────────────────────────────────────────
   Three instances: Login claim success and Add Device success both use a 52px
   mint circle with a 24px checkmark; Provision uses a 36px circle with an 18px
   check, inline beside a heading. */

export function SuccessPanel({
  title,
  body,
  action,
  size = "lg",
  headingLevel = "h1",
}: {
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  size?: "lg" | "sm";
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  const circle = size === "lg" ? "h-13 w-13" : "h-9 w-9";
  const icon = size === "lg" ? 24 : 18;

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2.5">
        <span
          className={`bg-mint text-leaf flex shrink-0 items-center justify-center rounded-full ${circle}`}
        >
          <IconCheck size={icon} />
        </span>
        <span className="text-lg text-canopy font-bold">{title}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3.5">
      <span
        className={`bg-mint text-leaf flex shrink-0 items-center justify-center rounded-full ${circle}`}
      >
        <IconCheck size={icon} />
      </span>
      <Heading className="font-display text-auth-h1 tracking-tight text-canopy m-0 font-extrabold">
        {title}
      </Heading>
      {body && <p className="text-md text-muted m-0">{body}</p>}
      {action}
    </div>
  );
}

/* ── NumberedStep ──────────────────────────────────────────────────────────
   Landing (4 steps) and How It Works (4 steps). Mono numeral in leaf-soft. */

export function NumberedStep({
  number,
  title,
  body,
}: {
  number: string;
  title: ReactNode;
  body: ReactNode;
}) {
  return (
    <div className="rounded-card bg-white p-6.5">
      <div className="font-mono text-sm text-leaf-soft mb-3.5 font-semibold">{number}</div>
      <div className="text-lg-alt text-canopy mb-2 font-semibold">{title}</div>
      <div className="text-body text-muted leading-relaxed">{body}</div>
    </div>
  );
}

/* ── EmptyState ────────────────────────────────────────────────────────────
   Generalised from the handoff's single designed instance: the dashed
   "Add a device" tile on Devices List (1.5px dashed border, radius 20,
   centred, min-height 150px). DEV-004. */

export function EmptyState({
  title,
  body,
  action,
  minHeight = 150,
}: {
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  minHeight?: number;
}) {
  return (
    <div
      className="border-hair border-line-dashed rounded-card text-muted flex flex-col items-center justify-center gap-2.5 border-dashed bg-white p-6 text-center"
      style={{ minHeight }}
    >
      <div className="text-base text-canopy font-semibold">{title}</div>
      {body && <div className="text-meta max-w-55">{body}</div>}
      {action}
    </div>
  );
}

/* ── InlineHint ────────────────────────────────────────────────────────────
   The handoff's small explanatory line under a control, e.g. "Contact support
   to change your login email or phone." — 11.5px faint or 12px muted. */

export function InlineHint({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "faint";
}) {
  return (
    <div
      className={`text-label leading-normal ${tone === "faint" ? "text-faint" : "text-muted"}`}
    >
      {children}
    </div>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────────────
   DEV-004 — no handoff reference. Stone fill with the existing gg-pulse
   keyframe, so loading states share the pending state's rhythm. */

export function Skeleton({
  className = "",
  rounded = "rounded-tile",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`bg-stone animate-pulse-soft ${rounded} ${className}`}
      data-gg-anim="1"
      aria-hidden="true"
    />
  );
}

/** Indeterminate progress bar — the pending state's 4px track with a 40%-wide
 *  amber bar sliding back and forth. Verbatim from the Device Dashboard. */
export function IndeterminateBar() {
  return (
    <div className="bg-stone rounded-segment h-1 overflow-hidden">
      <div
        className="bg-pending rounded-segment animate-indeterminate h-full w-2/5"
        data-gg-anim="1"
      />
    </div>
  );
}
