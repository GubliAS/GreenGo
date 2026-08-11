"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "../Logo";
import { Hamburger } from "../icons";

/* Flush app top bar: white, 1px hairline bottom border, logo + link row +
 * avatar. Logo returns to /devices (tenant home) so a signed-in session is
 * not dumped onto the marketing site. */

export type TenantPage =
  | "devices"
  | "irrigation"
  | "alerts"
  | "notifications"
  | "settings";

export function AppTopBar({
  active,
  deviceSlug,
  initials = "KA",
  userName = "Kwame Asante",
}: {
  active?: TenantPage;
  /** When set, Irrigation / Alerts deep-link to that device. */
  deviceSlug?: string;
  initials?: string;
  userName?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links: { href: string; label: string; id: TenantPage }[] = [
    { href: "/devices", label: "Devices", id: "devices" },
    {
      href: deviceSlug ? `/devices/${deviceSlug}/irrigation` : "/devices",
      label: "Irrigation log",
      id: "irrigation",
    },
    {
      href: deviceSlug ? `/devices/${deviceSlug}/alerts` : "/devices",
      label: "Alerts",
      id: "alerts",
    },
    { href: "/notifications", label: "Notifications", id: "notifications" },
    { href: "/settings", label: "Settings", id: "settings" },
  ];

  return (
    <>
      <div className="border-hairline px-topbar-x sticky top-0 z-30 flex items-center gap-4 border-b bg-white/95 py-3.5 backdrop-blur-sm nav:gap-7 nav:py-4 pt-[max(0.875rem,env(safe-area-inset-top))]">
        <Logo size="app" href="/devices" />

        <div className="text-body hidden min-w-0 flex-1 gap-1 overflow-x-auto whitespace-nowrap nav:flex">
          {links.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              aria-current={active === l.id ? "page" : undefined}
              className={`rounded-nav px-3.5 py-2.5 font-semibold ${
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

        <div className="flex flex-1 items-center justify-end gap-2 nav:hidden">
          <Avatar initials={initials} name={userName} size={30} />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="app-mobile-menu"
            className="touch-target flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent p-2"
          >
            <Hamburger open={menuOpen} width={20} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="app-mobile-menu"
          data-gg-anim="1"
          className="animate-rise-panel border-hairline px-topbar-x flex flex-col gap-1 border-b bg-white pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] nav:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active === l.id ? "page" : undefined}
              className={`rounded-nav text-md min-h-11 px-3.5 py-3 font-semibold ${
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
