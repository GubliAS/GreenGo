"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "../Logo";
import { Hamburger } from "../icons";
import { StatusPill } from "../ui/StatusPill";
import { PillToggle } from "../ui/SegmentedControl";
import { Avatar } from "./AppTopBar";
import { LogoutLink } from "../auth/LogoutLink";
import type { AdminRole } from "@/lib/types";

/* Admin top bar. The handoff has two variants of the right-hand side:
 *   role PILL (static span)  — Fleet, Devices List, Provision, Account, Audit
 *   role TOGGLE (2 buttons)  — Device Detail only, to demo super_admin/support
 * and two of the profile area:
 *   interactive dropdown     — Fleet, Devices List, Device Detail, Provision
 *   static avatar div        — Account Settings, Audit Log
 * Both are exposed as props rather than hardcoded per page.
 *
 * DEV-006 adds Tenants, SMS log and Config, taking the admin nav from 2 items
 * to 5 — which is why the mobile treatment (DEV-007) matters more here than in
 * the 2-item original.
 *
 * The handoff's dropdown does not close on outside click (its README says to
 * add that in production); implemented here. */

export type AdminPage =
  | "fleet"
  | "devices"
  | "tenants"
  | "commands"
  | "sms"
  | "config";

const LINKS: { href: string; label: string; id: AdminPage }[] = [
  { href: "/admin", label: "Fleet", id: "fleet" },
  { href: "/admin/devices", label: "Devices", id: "devices" },
  { href: "/admin/tenants", label: "Tenants", id: "tenants" },
  { href: "/admin/sms", label: "SMS log", id: "sms" },
  { href: "/admin/config", label: "Config", id: "config" },
];

export function AdminTopBar({
  active,
  role = "super_admin",
  onRoleChange,
  profileInteractive = true,
  adminName = "Owusu Prempeh",
  adminEmail = "ops@greengo.dev",
  initials = "OP",
}: {
  active?: AdminPage;
  role?: AdminRole;
  /** When provided the role pill becomes the two-button toggle (Device Detail). */
  onRoleChange?: (r: AdminRole) => void;
  profileInteractive?: boolean;
  adminName?: string;
  adminEmail?: string;
  initials?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="border-hairline px-topbar-x flex items-center gap-6 border-b bg-white py-4">
        <Logo size="app" withAdminBadge asLink={false} />

        <div className="text-body hidden flex-1 gap-1 whitespace-nowrap nav:flex">
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

        <div className="hidden items-center gap-4 nav:flex">
          {onRoleChange ? (
            <PillToggle
              ariaLabel="Admin role"
              value={role}
              onChange={(r) => onRoleChange(r as AdminRole)}
              options={[
                { value: "super_admin", label: "Super admin" },
                { value: "support", label: "Support" },
              ]}
            />
          ) : (
            <StatusPill tone="stone" size="md">
              {role === "super_admin" ? "Super admin" : "Support"}
            </StatusPill>
          )}

          {profileInteractive ? (
            <ProfileMenu name={adminName} email={adminEmail} initials={initials} />
          ) : (
            <Avatar initials={initials} name={adminName} />
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5 nav:hidden">
          <Avatar initials={initials} name={adminName} size={30} />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-menu"
            className="touch-target flex cursor-pointer items-center justify-center border-0 bg-transparent p-2"
          >
            <Hamburger open={menuOpen} width={20} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="admin-mobile-menu"
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
          <div className="bg-hairline mx-1 my-1.5 h-px" />
          <Link
            href="/admin/account"
            onClick={() => setMenuOpen(false)}
            className="rounded-nav text-md text-ink hover:bg-mint px-3.5 py-2.75 font-semibold"
          >
            Account settings
          </Link>
          <Link
            href="/admin/audit"
            onClick={() => setMenuOpen(false)}
            className="rounded-nav text-md text-ink hover:bg-mint px-3.5 py-2.75 font-semibold"
          >
            Audit log
          </Link>
          <LogoutLink className="rounded-nav text-md text-danger hover:bg-danger-bg px-3.5 py-2.75 font-semibold" />
        </div>
      )}
    </>
  );
}

/* ── ProfileMenu ───────────────────────────────────────────────────────────
   Avatar button opening a floating card: user block, Account settings, Audit
   log, then a destructive red Log out. Identical on 4 admin screens. */

export function ProfileMenu({
  name,
  email,
  initials,
}: {
  name: string;
  email: string;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${name}`}
        className="bg-canopy text-sm flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full border-0 font-semibold text-white"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="border-hair border-line-soft rounded-menu shadow-menu absolute top-[calc(100%+8px)] right-0 z-30 min-w-50 bg-white p-2.5"
        >
          <div className="border-hairline mb-1.5 border-b px-2.5 py-2">
            <div className="text-body text-canopy font-semibold">{name}</div>
            <div className="text-caption text-muted">{email}</div>
          </div>
          <Link
            role="menuitem"
            href="/admin/account"
            className="rounded-sm text-sm text-ink hover:bg-mint hover:text-canopy block px-2.5 py-2"
          >
            Account settings
          </Link>
          <Link
            role="menuitem"
            href="/admin/audit"
            className="rounded-sm text-sm text-ink hover:bg-mint hover:text-canopy block px-2.5 py-2"
          >
            Audit log
          </Link>
          <LogoutLink
            role="menuitem"
            className="rounded-sm text-sm text-danger hover:bg-danger-bg px-2.5 py-2"
          />
        </div>
      )}
    </div>
  );
}
