import type { ReactNode } from "react";

/* The handoff's card shell, which recurs on nearly every app/admin screen:
 *   bg-white · 1.5px --color-hairline border · --radius-card (20px) · 26px pad
 * Variants cover the geometries actually observed:
 *   default → radius 20 / pad 26   (Alerts, Settings, Provision, most)
 *   compact → radius 20 / pad 22   (pump card, metrics grid)
 *   hero    → radius 24 / fluid pad (Device Dashboard + Live Demo hero cards)
 *   flat    → no border            (mint-panel children on marketing)
 */

export function Card({
  variant = "default",
  className = "",
  children,
}: {
  variant?: "default" | "compact" | "hero" | "flat";
  className?: string;
  children: ReactNode;
}) {
  const styles = {
    default: "border-hair border-hairline rounded-card bg-white p-6.5",
    compact: "border-hair border-hairline rounded-card bg-white p-5.5",
    hero: "border-hair border-hairline rounded-card-sm bg-white p-hero-card",
    flat: "rounded-card bg-white p-6.5",
  } as const;

  return <div className={`${styles[variant]} ${className}`}>{children}</div>;
}

/** Section heading inside a card — 14.5px bold canopy. */
export function CardTitle({ children }: { children: ReactNode }) {
  return <div className="text-md text-canopy font-bold">{children}</div>;
}

/** Page heading. 24px on app/admin pages, 26px on Devices List. */
export function PageTitle({
  children,
  size = "md",
  className = "",
}: {
  children: ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <h1
      className={`font-display ${size === "lg" ? "text-26" : "text-24"} text-canopy m-0 font-extrabold ${className}`}
    >
      {children}
    </h1>
  );
}

/** Mono uppercase eyebrow above a section heading. */
export function Eyebrow({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "light";
}) {
  return (
    <div
      className={`font-mono text-micro tracking-caps-lg uppercase ${
        tone === "light" ? "text-white/85" : "text-muted"
      }`}
    >
      {children}
    </div>
  );
}

/** The "← All devices" back link. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-meta text-muted hover:text-canopy font-semibold">
      {children}
    </a>
  );
}
