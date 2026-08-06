"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { Hamburger } from "../icons";
import { Button, ButtonLink } from "../ui/Button";

/* The floating pill nav. Two states driven by scrollY > 24:
 *   unscrolled → opaque white, no shadow, max-width 1400px
 *   scrolled   → white/92 + blur(10px), shadow-nav, max-width 1200px
 *
 * DEV-002: only GreenGo Landing Page implements this. How It Works, Live Demo,
 * Pricing and Contact hardcode the *scrolled* values permanently and have no
 * mobile nav. Per ruling #4 all five pages now share this behaviour.
 *
 * DEV-007/008: the mobile switch is a real CSS breakpoint at 760px
 * (--breakpoint-nav) rather than the handoff's JS width check. The panel and
 * hamburger-to-X morph are ported from Landing.
 */

export type MarketingPage = "how-it-works" | "live-demo" | "pricing" | "contact" | null;

const LINKS: { href: string; label: string; id: MarketingPage }[] = [
  { href: "/how-it-works", label: "How it works", id: "how-it-works" },
  { href: "/live-demo", label: "Live demo", id: "live-demo" },
  { href: "/pricing", label: "Pricing", id: "pricing" },
  { href: "/contact", label: "Contact", id: "contact" },
];

export function MarketingNav({
  active = null,
  /** Swaps "Log in" for "Dashboard". Wired to the real session in Phase 4. */
  loggedIn = false,
}: {
  active?: MarketingPage;
  loggedIn?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loginHref = loggedIn ? "/devices" : "/login";
  const loginLabel = loggedIn ? "Dashboard" : "Log in";

  return (
    <div className="sticky top-4 z-40 flex flex-col items-center px-5">
      <div
        className={`gap-nav-gap rounded-button flex w-full items-center py-4 pr-5 pl-6.5 transition-all duration-350 ${
          scrolled
            ? "shadow-nav max-w-nav backdrop-blur-nav bg-white/92"
            : "max-w-nav-open bg-white shadow-none"
        }`}
      >
        <Logo size="marketing" href="/" />

        {/* Desktop links. min-w-0 + overflow-x-auto restores the handoff's own
            literal spec for this div ("flex:1;...;overflow-x:auto;white-space:
            nowrap") — without min-w-0 a flex child won't shrink below its
            content's natural width, so right at the 760-820px band (just
            above the mobile cutoff) the nav-links + login + button collectively
            need more room than the pill has, and the rightmost items get
            pushed past the viewport edge instead of scrolling internally.

            justify-center lived on THIS div in the handoff's literal spec too
            — but centering a flex row that's wider than its own container
            clips equal amounts off BOTH ends instead of scrolling from a
            natural start (confirmed at 768px: "How it works" and "Contact"
            both lost their first/last letter). The fix is the standard one
            for "centered until it needs to scroll": move the flex+gap to an
            inner w-max div and center THAT with margin auto instead of
            justify-content — CSS resolves auto margins to zero once content
            is wider than its container, so it falls back to a flush-left,
            fully-scrollable start with nothing clipped, and centers exactly
            as before whenever it actually fits. */}
        <div className="hidden min-w-0 flex-1 overflow-x-auto whitespace-nowrap nav:block">
          <div className="gap-nav-links text-body text-ink mx-auto flex w-max">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active === l.id ? "page" : undefined}
                className={`rounded-nav px-4 py-2.25 font-medium ${
                  active === l.id
                    ? "bg-mint text-canopy"
                    : "text-inherit hover:bg-mint hover:text-canopy active:bg-mint-deep"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-2 nav:flex">
          <Link
            href={loginHref}
            className="text-body text-canopy hover:text-leaf px-1 py-2.25 font-semibold whitespace-nowrap"
          >
            {loginLabel}
          </Link>
          <ButtonLink href="/pricing" variant="primary" size="nav">
            Request a device
          </ButtonLink>
        </div>

        {/* Mobile hamburger */}
        <div className="flex flex-1 items-center justify-end nav:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="marketing-mobile-menu"
            className="touch-target flex cursor-pointer items-center justify-center border-0 bg-transparent p-2"
          >
            <Hamburger open={menuOpen} width={22} />
          </button>
        </div>
      </div>

      {/* Mobile panel — floating card, per Landing's variant */}
      {menuOpen && (
        <div
          id="marketing-mobile-menu"
          data-gg-anim="1"
          className="animate-rise-fast rounded-panel shadow-panel mt-2 flex w-full flex-col gap-1 bg-white p-3.5 nav:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active === l.id ? "page" : undefined}
              className={`rounded-nav text-lg px-3.5 py-3.25 font-semibold ${
                active === l.id ? "bg-mint text-canopy" : "text-canopy hover:bg-mint"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="bg-hairline mx-1 my-1.5 h-px" />
          <Link
            href={loginHref}
            onClick={() => setMenuOpen(false)}
            className="rounded-nav text-lg text-canopy hover:bg-mint px-3.5 py-3.25 font-semibold"
          >
            {loginLabel}
          </Link>
          <Button
            variant="primary"
            size="md"
            className="mt-1 w-full"
            onClick={() => setMenuOpen(false)}
          >
            Request a device
          </Button>
        </div>
      )}
    </div>
  );
}
