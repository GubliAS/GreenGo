import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

/* Shared shell for offline + not-found — same brand signal, one composition,
 * one job per page. Logo is not a link on these screens (nowhere useful to go
 * while offline; 404 pages pass their own CTAs instead). */

export function StatusScreen({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  actions?: ReactNode;
}) {
  return (
    <div className="bg-app flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex max-w-md flex-col items-center gap-5">
        <Logo size="marketing" asLink={false} />
        {eyebrow ? (
          <p className="font-mono text-micro text-muted m-0 tracking-wider uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-h2 text-canopy m-0 font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="text-md text-muted m-0 leading-relaxed">{body}</p>
        {actions ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
