"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "../Logo";
import { Hamburger } from "../icons";

/* Flush app top bar: white, 1px hairline bottom border, logo + link row +
 * avatar. Reference implementation is GreenGo Devices List, which is the only
 * tenant screen with the mobile variant designed — DEV-007 applies it to the
 * other five.
 *
 * DEV-006 adds "Notifications" as the one net-new tenant nav item, needed by
 * the /notifications route from DEV-005. */

export type TenantPage =
  | "devices"
  | "irrigation"
  | "alerts"
  | "notifications"
  | "settings";

const LINKS: { href: string; label: string; id: TenantPage }[] = [
  { href: "/devices", label: "Devices", id: "devices" },
  { href: "/devices/gh-1/irrigation", label: "Irrigation log", id: "irrigation" },
  { href: "/devices/gh-1/alerts", label: "Alerts", id: "alerts" },
  { href: "/notifications", label: "Notifications", id: "notifications" },
  { href: "/settings", label: "Settings", id: "settings" },
];

export function AppTopBar({
  active,
  initials = "KA",
  userName = "Kwame Asante",
}: {
  active?: TenantPage;
  initials?: string;
  userName?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="border-hairline px-topbar-x flex items-center gap-7 border-b bg-white py-4">
        <Logo size="app" href="/" />

        {/* Desktop links. min-w-0 + overflow-x-auto restores the handoff's
            literal spec for this div ("flex:1;overflow-x:auto;white-space:
            nowrap") — see the matching fix + rationale in MarketingNav.tsx. */}
        <div className="text-body hidden min-w-0 flex-1 gap-1 overflow-x-auto whitespace-nowrap nav:flex">
          {LINKS.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              aria-current={active === l.id ? "page" : undefined}
              className={`rounded-nav px-3.5 py-2 font-semibold ${
                active === l.id
                  ? "bg-mint text-canopy"
                  : "text-muted hover:bg-mint hover:text-canopy"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Avatar initials={initials} name={userName} className="hidden nav:flex" />

        {/* Mobile: avatar + hamburger */}
        <div className="flex flex-1 items-center justify-end gap-2.5 nav:hidden">
          <Avatar initials={initials} name={userName} size={30} />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="app-mobile-menu"
            className="touch-target flex cursor-pointer items-center justify-center border-0 bg-transparent p-2"
          >
            <Hamburger open={menuOpen} width={20} />
          </button>
        </div>
      </div>

      {/* Mobile panel — flush full-width with a bottom border, per Devices List */}
      {menuOpen && (
        <div
          id="app-mobile-menu"
          data-gg-anim="1"
          className="animate-rise-panel border-hairline px-topbar-x flex flex-col gap-1 border-b bg-white pt-2.5 pb-4 nav:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active === l.id ? "page" : undefined}
              className={`rounded-nav text-md px-3.5 py-2.75 font-semibold ${
                active === l.id ? "bg-mint text-canopy" : "text-ink hover:bg-mint hover:text-canopy"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export function Avatar({
  initials,
  name,
  size = 34,
  className = "",
}: {
  initials: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-canopy text-sm flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{ width: size, height: size }}
      title={name}
    >
      <span aria-hidden="true">{initials}</span>
      {name && <span className="sr-only">{name}</span>}
    </div>
  );
}
