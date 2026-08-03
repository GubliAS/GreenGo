"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import {
  DropletMark,
  Hamburger,
  IconCaret,
  IconCheck,
  IconClose,
  IconHumidity,
  IconMoisture,
  IconPump,
  IconWarning,
} from "@/components/icons";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Button, ButtonLink, type ButtonVariant } from "@/components/ui/Button";
import { Card, CardTitle, Eyebrow, PageTitle } from "@/components/ui/Card";
import { Cell, DataTable, TableRow, type Column } from "@/components/ui/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  EmptyState,
  IndeterminateBar,
  InlineHint,
  NumberedStep,
  Skeleton,
  SuccessPanel,
} from "@/components/ui/Feedback";
import { FormField, TextareaField } from "@/components/ui/FormField";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import {
  PillToggle,
  RangePills,
  SlidingTabs,
  StateSwitcher,
  UnderlineTabs,
} from "@/components/ui/SegmentedControl";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { MetricReadout, StatCard } from "@/components/ui/StatCard";
import { StateDot, StatusPill } from "@/components/ui/StatusPill";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { Tooltip } from "@/components/ui/Tooltip";
import { ClaimCodeField } from "@/components/device/ClaimCodeField";
import { MoistureChart } from "@/components/device/MoistureChart";
import { PumpControl } from "@/components/device/PumpControl";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { Avatar } from "@/components/nav/AppTopBar";
import { ProfileMenu } from "@/components/nav/AdminTopBar";
import { describeMoisture } from "@/lib/moisture";
import type { ClaimCodeState, DeviceState, PumpMode } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   /dev/tokens — the proof that the token system and component library are
   correct BEFORE 24 pages inherit them. Phase 1 checkpoint deliverable.
   Every token is rendered with its name and resolved value; every shared
   component is rendered in every state the handoff designs.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function TokensPage() {
  return (
    <ToastProvider>
      <div className="bg-app min-h-screen">
        <div className="border-hairline px-topbar-x sticky top-0 z-30 border-b bg-white py-4">
          <div className="max-w-wide mx-auto flex items-center justify-between gap-4">
            <Logo size="app" href="/" />
            <span className="text-meta text-muted font-mono">/dev/tokens</span>
          </div>
        </div>

        <main className="p-page max-w-wide mx-auto flex flex-col gap-12">
          <header className="pt-2">
            <Eyebrow>Phase 1 · foundation proof</Eyebrow>
            <PageTitle size="lg" className="mt-2">
              Design tokens & component library
            </PageTitle>
            <p className="text-md text-muted leading-body mt-2 max-w-form-wide">
              Every value extracted from <span className="font-mono">design_handoff_greengo</span>.
              No near-duplicates collapsed (ruling #2). Deviations are marked{" "}
              <Tag>DEV-nnn</Tag> and documented in DEVIATIONS.md.
            </p>
          </header>

          <ColourSection />
          <TypographySection />
          <RadiusSection />
          <ShadowSection />
          <SpacingSection />
          <MotionSection />
          <SegmentedBarSection />
          <ComponentSection />
        </main>
      </div>
    </ToastProvider>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="border-hairline border-b pb-2">
        <h2 className="font-display text-22 text-canopy m-0 font-extrabold">{title}</h2>
        {note && <p className="text-meta text-muted leading-normal m-0 mt-1.5">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-label text-muted tracking-widest mt-2 uppercase">{children}</h3>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-mint text-canopy rounded-badge text-micro px-1.5 py-0.5 font-mono">
      {children}
    </span>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}

/* ── colours ─────────────────────────────────────────────────────────────── */

const CORE = [
  ["--color-canopy", "#17352A", 341, "dark bands, primary text, footer/CTA"],
  ["--color-leaf", "#2F9D46", 157, "buttons, links, active, brand"],
  ["--color-leaf-deep", "#24803B", 9, "primary button hover only"],
  ["--color-mint", "#EAF7EE", 172, "section tint, active nav/tab"],
  ["--color-mint-deep", "#DCEFE1", 4, "nav link :active"],
  ["--color-mint-bright", "#B7E3BC", 1, "hero italic accent"],
  ["--color-app", "#F7F8F5", 22, "app bg, table header"],
  ["--color-stone", "#F0F1EC", 22, "inert/disabled fill"],
] as const;

const TEXT = [
  ["--color-ink", "#3E4A43", 54, "body text"],
  ["--color-muted", "#64756C", 152, "muted/secondary"],
  ["--color-faint", "#AEB8AF", 16, "disabled text, placeholders"],
  ["--color-faint-deep", "#8A968B", 2, "disabled pump label · near-dup, kept"],
] as const;

const STATUS = [
  ["--color-dry-critical", "#C24A2C", 7, "critical dry"],
  ["--color-warn", "#DE8A3E", 8, "amber · activity dot"],
  ["--color-pending", "#E8A951", 8, "pending dot, banner border"],
  ["--color-warn-text", "#7A4E12", 7, "amber text"],
  ["--color-warn-icon", "#B5751F", 3, "warning triangle stroke"],
  ["--color-warn-bg", "#FCEFE3", 6, "amber banner bg"],
  ["--color-moist", "#8FBE4F", 6, "moist transition"],
  ["--color-leaf-soft", "#7FBE86", 8, "step numerals"],
  ["--color-danger", "#B0432E", 15, "destructive, error text"],
  ["--color-danger-border", "#E2A296", 3, "error border"],
  ["--color-danger-bg", "#FBEAE6", 7, "error bg"],
] as const;

const RAMP = [
  ["--color-ramp-0", "#C1382E", "t=0.00 · rgb(193,56,46)"],
  ["--color-ramp-1", "#B8791E", "t=0.33 · rgb(184,121,30)"],
  ["--color-ramp-2", "#2F9D46", "t=0.66 · rgb(47,157,70)"],
  ["--color-ramp-3", "#17352A", "t=1.00 · rgb(23,53,42)"],
] as const;

const LINES = [
  ["--color-hairline", "rgba(20,35,25,.08)", 58, "card borders, dividers"],
  ["--color-line", "rgba(20,35,25,.14)", 48, "inputs, empty segment (app)"],
  ["--color-line-soft", "rgba(20,35,25,.1)", 22, "admin cards, menus"],
  ["--color-hairline-soft", "rgba(20,35,25,.06)", 6, "table row separators"],
  ["--color-line-strong", "rgba(20,35,25,.16)", 3, "empty segment (marketing)"],
  ["--color-line-dashed", "rgba(20,35,25,.15)", 1, "dashed add tile"],
  ["--color-dot-off", "rgba(20,35,25,.25)", 2, "pump-off dot"],
] as const;

function Swatch({
  token,
  value,
  uses,
  role,
  big = false,
}: {
  token: string;
  value: string;
  uses?: number;
  role: string;
  big?: boolean;
}) {
  return (
    <div className="border-hair border-hairline rounded-tile flex min-w-56 flex-1 items-center gap-3 bg-white p-2.5">
      <div
        className="rounded-sm border-hairline shrink-0 border"
        style={{
          width: big ? 56 : 40,
          height: big ? 56 : 40,
          background: `var(${token})`,
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-label text-canopy truncate font-semibold">
          {token}
        </div>
        <div className="font-mono text-micro text-muted">{value}</div>
        <div className="text-micro text-faint mt-0.5 leading-normal">
          {uses !== undefined && <span className="font-mono">{uses}× · </span>}
          {role}
        </div>
      </div>
    </div>
  );
}

function ColourSection() {
  return (
    <Section
      title="Colour"
      note="26 product colours. Ruling #2: no near-duplicates collapsed — the three ambers, both disabled greys, and both empty-segment border alphas all survive as distinct tokens."
    >
      <Sub>Core</Sub>
      <Row>
        {CORE.map(([t, v, u, r]) => (
          <Swatch key={t} token={t} value={v} uses={u} role={r} />
        ))}
      </Row>

      <Sub>Text</Sub>
      <Row>
        {TEXT.map(([t, v, u, r]) => (
          <Swatch key={t} token={t} value={v} uses={u} role={r} />
        ))}
      </Row>

      <Sub>Status & alert</Sub>
      <Row>
        {STATUS.map(([t, v, u, r]) => (
          <Swatch key={t} token={t} value={v} uses={u} role={r} />
        ))}
      </Row>

      <Sub>Segmented-bar ramp stops — deliberately not the flat palette</Sub>
      <Row>
        {RAMP.map(([t, v, r]) => (
          <Swatch key={t} token={t} value={v} role={r} />
        ))}
      </Row>

      <Sub>Lines & scrims</Sub>
      <Row>
        {LINES.map(([t, v, u, r]) => (
          <Swatch key={t} token={t} value={v} uses={u} role={r} />
        ))}
      </Row>

      <Sub>Photo scrims</Sub>
      <div className="flex flex-wrap gap-3">
        {(
          [
            ["bg-scrim-hero", "--gradient-hero", "Landing hero"],
            ["bg-scrim-cta", "--gradient-cta", "Landing CTA band"],
            ["bg-scrim-login", "--gradient-login", "Login photo panel"],
          ] as const
        ).map(([cls, token, role]) => (
          <div key={cls} className="min-w-56 flex-1">
            <div className={`${cls} rounded-tile bg-canopy h-20`} />
            <div className="font-mono text-micro text-canopy mt-1.5">{token}</div>
            <div className="text-micro text-faint">{role}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── typography ──────────────────────────────────────────────────────────── */

const FIXED_SIZES = [
  ["--text-micro", "11px", 24],
  ["--text-label", "11.5px", 32],
  ["--text-caption", "12px", 36],
  ["--text-meta", "12.5px", 59],
  ["--text-sm", "13px", 68],
  ["--text-body", "13.5px", 81],
  ["--text-base", "14px", 33],
  ["--text-md", "14.5px", 57],
  ["--text-lg", "15px", 27],
  ["--text-lg-alt", "15.5px", 12],
  ["--text-xl", "16px", 18],
  ["--text-xl-alt", "16.5px", 1],
  ["--text-feature", "17px", 3],
  ["--text-2xl", "18px", 13],
  ["--text-19", "19px", 1],
  ["--text-20", "20px", 2],
  ["--text-21", "21px", 1],
  ["--text-22", "22px", 8],
  ["--text-24", "24px", 11],
  ["--text-26", "26px", 9],
  ["--text-28", "28px", 9],
  ["--text-30", "30px", 1],
  ["--text-34", "34px", 2],
  ["--text-36", "36px", 1],
  ["--text-38", "38px", 1],
  ["--text-64", "64px", 1],
  ["--text-72", "72px", 1],
] as const;

const FLUID_SIZES = [
  ["--text-hero-landing", "clamp(34px,4.6vw,54px)"],
  ["--text-hero-how", "clamp(32px,4.2vw,50px)"],
  ["--text-hero-demo", "clamp(30px,4vw,48px)"],
  ["--text-hero-pricing", "clamp(30px,3.8vw,46px)"],
  ["--text-hero-contact", "clamp(30px,3.6vw,44px)"],
  ["--text-cta-band", "clamp(28px,3.6vw,42px)"],
  ["--text-quote", "clamp(28px,3vw,38px)"],
  ["--text-h2-lg", "clamp(26px,3vw,36px)"],
  ["--text-h2", "clamp(24px,2.8vw,32px)"],
  ["--text-h2-alt", "clamp(24px,2.6vw,32px)"],
  ["--text-h2-sm", "clamp(22px,2.4vw,28px)"],
  ["--text-auth-h1", "clamp(24px,3vw,30px)"],
  ["--text-quotemark", "clamp(80px,9vw,120px)"],
] as const;

function TypographySection() {
  return (
    <Section
      title="Typography"
      note="Four self-hosted families via next/font — no render-blocking CDN request, because these users are on 3G. 27 fixed sizes with 0.5px steps in the 11–16px band, plus 13 fluid clamps."
    >
      <Sub>Families</Sub>
      <div className="flex flex-col gap-3">
        <Card variant="compact">
          <div className="font-display text-28 text-canopy tracking-tighter font-extrabold">
            Bricolage Grotesque — Know your soil
          </div>
          <div className="font-mono text-micro text-muted mt-1">
            --font-display · 700/800 · headlines, wordmark, page h1
          </div>
        </Card>
        <Card variant="compact">
          <div className="font-accent text-28 text-leaf italic">
            Newsreader italic — before it&apos;s too late.
          </div>
          <div className="font-mono text-micro text-muted mt-1">
            --font-accent · 400 italic · one phrase inside a headline
          </div>
        </Card>
        <Card variant="compact">
          <div className="font-body text-xl text-ink">
            Public Sans — GreenGo watches soil moisture every 10 seconds.
          </div>
          <div className="font-mono text-micro text-muted mt-1">
            --font-body · 400/500/600/700 · body & UI default
          </div>
        </Card>
        <Card variant="compact">
          <div className="font-mono text-22 text-canopy font-semibold">
            IBM Plex Mono — 38% · A4:CF:12:8E:3B:01 · GG-4F82-K1
          </div>
          <div className="font-mono text-micro text-muted mt-1">
            --font-mono · 500/600 · INSTRUMENT ONLY: readouts, MAC, keys, codes,
            timestamps. Never names or phone numbers.
          </div>
        </Card>
      </div>

      <Sub>Fixed sizes</Sub>
      <div className="border-hair border-hairline rounded-card flex flex-col divide-y divide-hairline-soft bg-white">
        {FIXED_SIZES.map(([token, value, uses]) => (
          <div key={token} className="flex flex-wrap items-baseline gap-4 px-4 py-2.5">
            <span className="font-mono text-micro text-canopy w-40 shrink-0">
              {token}
            </span>
            <span className="font-mono text-micro text-muted w-14 shrink-0">{value}</span>
            <span className="font-mono text-micro text-faint w-10 shrink-0">{uses}×</span>
            <span className="text-canopy" style={{ fontSize: `var(${token})` }}>
              Soil moisture 38%
            </span>
          </div>
        ))}
      </div>

      <Sub>Fluid sizes — resize the window to see these move</Sub>
      <div className="border-hair border-hairline rounded-card flex flex-col divide-y divide-hairline-soft bg-white">
        {FLUID_SIZES.map(([token, value]) => (
          <div key={token} className="px-4 py-2.5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-micro text-canopy">{token}</span>
              <span className="font-mono text-micro text-muted">{value}</span>
            </div>
            <div
              className="font-display text-canopy tracking-tighter leading-tight font-extrabold"
              style={{ fontSize: `var(${token})` }}
            >
              Know your soil
            </div>
          </div>
        ))}
      </div>

      <Sub>Letter spacing & line height</Sub>
      <div className="flex flex-wrap gap-3">
        <Card variant="compact" className="min-w-72 flex-1">
          {(
            [
              "tightest",
              "tighter",
              "tight",
              "slight",
              "sliver",
              "wide",
              "wider",
              "widest",
              "caps",
              "caps-lg",
            ] as const
          ).map((t) => (
            <div key={t} className="flex items-baseline gap-3 py-1">
              <span className="font-mono text-micro text-muted w-32">
                --tracking-{t}
              </span>
              <span
                className="text-base text-canopy uppercase"
                style={{ letterSpacing: `var(--tracking-${t})` }}
              >
                Greenhouse
              </span>
            </div>
          ))}
        </Card>
        <Card variant="compact" className="min-w-72 flex-1">
          {(
            ["none", "hero", "tight", "cta", "snug", "quote", "normal", "relaxed", "body", "loose"] as const
          ).map((t) => (
            <div key={t} className="border-hairline-soft flex gap-3 border-b py-1.5 last:border-0">
              <span className="font-mono text-micro text-muted w-32 shrink-0">
                --leading-{t}
              </span>
              <span
                className="text-meta text-ink"
                style={{ lineHeight: `var(--leading-${t})` }}
              >
                A probe in the ground measures moisture every 10 seconds,
                alongside air temperature and humidity.
              </span>
            </div>
          ))}
        </Card>
      </div>
    </Section>
  );
}

/* ── radius / shadow / spacing ───────────────────────────────────────────── */

const RADII = [
  ["--radius-segment", "2px", 14, "segmented bar (small)"],
  ["--radius-segment-lg", "3px", 9, "segmented bar (large)"],
  ["--radius-xs", "4px", 1, ""],
  ["--radius-5", "5px", 1, ""],
  ["--radius-badge", "6px", 6, "ADMIN badge"],
  ["--radius-sm", "8px", 24, "small buttons, menu items"],
  ["--radius-pill-sm", "9px", 5, "tab-pill inner, toggles"],
  ["--radius-tile", "10px", 0, "feedback boxes, list rows"],
  ["--radius-menu", "12px", 40, "dropdowns, tab tracks"],
  ["--radius-input", "14px", 85, "inputs · DEV-001 (was 10px)"],
  ["--radius-nav", "14px", 37, "nav links · DEV-001 (was 10/12px)"],
  ["--radius-button", "14px", 34, "buttons, nav bar"],
  ["--radius-panel", "16px", 13, "alert banners, stat cards"],
  ["--radius-card", "20px", 64, "cards, small pills"],
  ["--radius-card-sm", "24px", 2, "hero cards"],
  ["--radius-hero", "28px", 11, "hero/feature panels"],
] as const;

function RadiusSection() {
  return (
    <Section
      title="Radius"
      note="DEV-001: --radius-input and --radius-nav are 14px per the handoff README, overriding the 10px/12px the HTML renders. Ruling #3."
    >
      <div className="flex flex-wrap gap-3">
        {RADII.map(([token, value, uses, role]) => (
          <div key={token + value} className="min-w-40 flex-1">
            <div
              className="bg-mint border-hair border-leaf h-16"
              style={{ borderRadius: `var(${token})` }}
            />
            <div className="font-mono text-micro text-canopy mt-1.5">{token}</div>
            <div className="font-mono text-micro text-muted">
              {value}
              {uses > 0 && <span className="text-faint"> · {uses}×</span>}
            </div>
            {role && <div className="text-micro text-faint leading-normal">{role}</div>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ShadowSection() {
  return (
    <Section title="Shadow" note="Five product shadows.">
      <div className="flex flex-wrap gap-6 pb-4">
        {(
          [
            ["--shadow-pill", "shadow-pill", "active tab/role pill"],
            ["--shadow-nav", "shadow-nav", "scrolled pill nav"],
            ["--shadow-menu", "shadow-menu", "floating menus"],
            ["--shadow-panel", "shadow-panel", "mobile menu panel"],
            ["--shadow-hero", "shadow-hero", "hero reading card"],
          ] as const
        ).map(([token, cls, role]) => (
          <div key={token} className="min-w-48 flex-1">
            <div className={`rounded-card h-20 bg-white ${cls}`} />
            <div className="font-mono text-micro text-canopy mt-2.5">{token}</div>
            <div className="text-micro text-faint">{role}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

const FLUID_SPACING = [
  ["--spacing-page", "clamp(20px,3.5vw,40px)", 11],
  ["--spacing-nav-gap", "clamp(10px,2vw,32px)", 6],
  ["--spacing-panel", "clamp(28px,4vw,40px)", 5],
  ["--spacing-nav-links", "clamp(4px,1vw,10px)", 5],
  ["--spacing-card-lg", "clamp(28px,3.5vw,40px)", 2],
  ["--spacing-section-x", "clamp(24px,6vw,80px)", 0],
  ["--spacing-footer-x", "clamp(24px,6vw,64px)", 0],
  ["--spacing-topbar-x", "clamp(20px,4vw,48px)", 0],
  ["--spacing-auth", "clamp(32px,6vw,96px)", 1],
  ["--spacing-band", "clamp(32px,5vw,64px)", 1],
] as const;

function SpacingSection() {
  return (
    <Section
      title="Spacing"
      note="The handoff is not on a clean 4pt grid — 9, 11, 13, 22 and 26px appear freely. Those resolve through Tailwind's fractional multipliers (p-2.25 = 9px). Only the fluid clamps need named tokens."
    >
      <div className="border-hair border-hairline rounded-card flex flex-col divide-y divide-hairline-soft bg-white">
        {FLUID_SPACING.map(([token, value, uses]) => (
          <div key={token} className="flex flex-wrap items-center gap-4 px-4 py-2.5">
            <span className="font-mono text-micro text-canopy w-48 shrink-0">
              {token}
            </span>
            <span className="font-mono text-micro text-muted w-44 shrink-0">{value}</span>
            <span className="font-mono text-micro text-faint w-8 shrink-0">
              {uses > 0 ? `${uses}×` : ""}
            </span>
            <span
              className="bg-leaf rounded-segment h-3"
              style={{ width: `var(${token})` }}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── motion ──────────────────────────────────────────────────────────────── */

function MotionSection() {
  const [replay, setReplay] = useState(0);

  return (
    <Section
      title="Motion"
      note="Six keyframes from the handoff. Every animated element carries data-gg-anim so prefers-reduced-motion disables it globally — enable “reduce motion” in your OS and these stop."
    >
      <Button variant="outline" size="sm" onClick={() => setReplay((r) => r + 1)}>
        Replay entrances
      </Button>
      <div className="flex flex-wrap gap-3" key={replay}>
        {(
          [
            ["--animate-rise", "animate-rise", "520ms · section entrance"],
            ["--animate-rise-fast", "animate-rise-fast", "220ms · mobile panel"],
            ["--animate-fade", "animate-fade", "320ms · tab content"],
          ] as const
        ).map(([token, cls, role]) => (
          <Card key={token} variant="compact" className={`min-w-56 flex-1 ${cls}`}>
            <div data-gg-anim="1" className="font-mono text-micro text-canopy">
              {token}
            </div>
            <div className="text-micro text-faint mt-1">{role}</div>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Card variant="compact" className="min-w-56 flex-1">
          <div className="flex items-center gap-2.5">
            <StateDot state="pending" />
            <span className="font-mono text-micro text-canopy">--animate-pulse-soft</span>
          </div>
          <div className="text-micro text-faint mt-1">1.4s · pending dot</div>
        </Card>
        <Card variant="compact" className="min-w-56 flex-1">
          <IndeterminateBar />
          <div className="font-mono text-micro text-canopy mt-2.5">
            --animate-indeterminate
          </div>
          <div className="text-micro text-faint mt-1">1.1s · pending progress</div>
        </Card>
      </div>
    </Section>
  );
}

/* ── segmented bar ───────────────────────────────────────────────────────── */

function SegmentedBarSection() {
  const [percent, setPercent] = useState(38);

  return (
    <Section
      title="The signature element — segmented moisture bar"
      note="Discrete segments, never a gradient fill, echoing the LCD bar-graph characters on the device. Fill test is on each segment's right edge; colour is position-based, not value-based."
    >
      <Card variant="compact">
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="pct" className="text-meta text-canopy font-semibold">
            Percent
          </label>
          <input
            id="pct"
            type="range"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="accent-leaf min-w-56 flex-1"
          />
          <span className="font-mono text-22 text-canopy w-16 font-semibold">
            {percent}%
          </span>
          <span className="text-meta text-muted">{describeMoisture(percent)}</span>
        </div>
      </Card>

      <Sub>Every configuration observed in the handoff</Sub>
      <div className="flex flex-col gap-4">
        {(
          [
            [24, 44, "app", "lg", "Live Demo hero · 24 seg · 44px · radius 3"],
            [24, 40, "app", "lg", "Device Dashboard hero · 24 seg · 40px · radius 3"],
            [20, 36, "marketing", "sm", "Landing explainer · 20 seg · 36px · border .16"],
            [20, 32, "marketing", "sm", "Landing hero card · 20 seg · 32px · border .16"],
            [16, 24, "app", "sm", "Devices List row · 16 seg · 24px · radius 2"],
          ] as const
        ).map(([count, height, surface, radius, role]) => (
          <div key={role}>
            <div className="text-micro text-muted mb-1.5 font-mono">{role}</div>
            <SegmentedBar
              percent={percent}
              count={count}
              height={height}
              surface={surface}
              radius={radius}
            />
          </div>
        ))}

        <div className="bg-canopy rounded-card p-5">
          <div className="text-micro mb-1.5 font-mono text-white/60">
            Fleet Overview strip · 24 seg · 32px · on dark, border rgba(255,255,255,.28)
          </div>
          <SegmentedBar percent={percent} count={24} height={32} surface="dark" radius="sm" />
        </div>
      </div>

      <Sub>History chart — same ramp, keyed to value rather than position</Sub>
      <Card variant="compact">
        <MoistureChart
          points={Array.from({ length: 24 }, (_, i) =>
            Math.max(8, Math.min(100, 22 + Math.round(Math.sin(i / 2.4) * 14 + (i % 5) * 3))),
          )}
        />
      </Card>
      <Card variant="compact">
        <MoistureChart points={[]} />
      </Card>
    </Section>
  );
}

/* ── components ──────────────────────────────────────────────────────────── */

const BUTTON_VARIANTS: ButtonVariant[] = [
  "primary",
  "primaryDark",
  "outline",
  "destructive",
  "onGreen",
  "disabled",
];

const TABLE_COLS: Column[] = [
  { key: "started", header: "Started", width: "1.1fr" },
  { key: "duration", header: "Duration", width: "1fr" },
  { key: "trigger", header: "Trigger", width: "0.8fr" },
  { key: "reason", header: "Stop reason", width: "1.3fr" },
];

function ComponentSection() {
  const [tab, setTab] = useState<"login" | "claim">("login");
  const [demo, setDemo] = useState<DeviceState>("confirmed");
  const [mode, setMode] = useState<PumpMode>("AUTO");
  const [role, setRole] = useState("super_admin");
  const [range, setRange] = useState("24h");
  const [detailTab, setDetailTab] = useState("identity");
  const [code, setCode] = useState("GG-4F82-K1");
  const [claimState, setClaimState] = useState<ClaimCodeState | null>("valid");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [relayOn, setRelayOn] = useState(false);
  const toast = useToast();

  return (
    <Section
      title="Components"
      note="Every shared component in every state the handoff designs. Items marked DEV-004 have no handoff reference and are composed from the tokens above."
    >
      <Sub>Logo — 3 sizes</Sub>
      <Row>
        <Card variant="compact">
          <Logo size="marketing" />
        </Card>
        <Card variant="compact">
          <Logo size="app" />
        </Card>
        <Card variant="compact">
          <Logo size="app" withAdminBadge asLink={false} />
        </Card>
        <Card variant="compact">
          <DropletMark width={52} height={60} />
        </Card>
      </Row>

      <Sub>Icons — 6 hand-drawn inline SVGs, 1.8px stroke, no library</Sub>
      <Card variant="compact">
        <div className="text-canopy flex flex-wrap items-center gap-6">
          {(
            [
              [<IconMoisture key="m" size={28} />, "moisture"],
              [<IconHumidity key="h" size={28} />, "humidity"],
              [<IconPump key="p" size={28} />, "pump"],
              [<IconWarning key="w" size={28} />, "warning"],
              [<IconCheck key="c" size={28} />, "check (2.2px)"],
              [<IconCaret key="r" size={16} />, "caret"],
              [<IconClose key="x" size={20} />, "close · DEV-004"],
            ] as const
          ).map(([icon, name]) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              {icon}
              <span className="text-micro text-faint">{name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <Hamburger open={false} />
            <span className="text-micro text-faint">burger</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Hamburger open />
            <span className="text-micro text-faint">burger → X</span>
          </div>
        </div>
      </Card>

      <Sub>Buttons — 7 variants × 6 sizes</Sub>
      <Card variant="compact">
        <div className="flex flex-col gap-3">
          {BUTTON_VARIANTS.map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-micro text-muted w-28 shrink-0">{v}</span>
              <Button variant={v} size="nav">
                nav
              </Button>
              <Button variant={v} size="md">
                md
              </Button>
              <Button variant={v} size="lg">
                lg
              </Button>
              <Button variant={v} size="admin">
                admin
              </Button>
              <Button variant={v} size="sm">
                sm
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <div className="bg-scrim-cta bg-canopy rounded-card flex flex-wrap items-center gap-2.5 p-5">
        <span className="font-mono text-micro w-28 shrink-0 text-white/60">
          ghostOnPhoto
        </span>
        <Button variant="ghostOnPhoto" size="md">
          See a live reading ↓
        </Button>
        <ButtonLink href="#" variant="ghostOnPhoto" size="lg">
          Talk to us
        </ButtonLink>
      </div>
      <Card variant="compact">
        <Button variant="primary" size="block">
          block · pump control width
        </Button>
      </Card>

      <Sub>Status pills — 4 tones × 3 sizes, and the device-state dot</Sub>
      <Card variant="compact">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusPill tone="mint" dot>
            Online
          </StatusPill>
          <StatusPill tone="mint">Claimed</StatusPill>
          <StatusPill tone="mint">AUTO</StatusPill>
          <StatusPill tone="mint" size="xs">
            Confirmed
          </StatusPill>
          <StatusPill tone="warn">Unclaimed</StatusPill>
          <StatusPill tone="danger" size="xs">
            Failed
          </StatusPill>
          <StatusPill tone="stone">MANUAL</StatusPill>
          <StatusPill tone="stone" size="md">
            Super admin
          </StatusPill>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          {(
            [
              ["confirmed", true, "confirmed · on"],
              ["confirmed", false, "confirmed · off"],
              ["pending", false, "pending (pulses)"],
              ["unknown", false, "unknown"],
            ] as const
          ).map(([s, on, label]) => (
            <div key={label} className="flex items-center gap-2">
              <StateDot state={s} on={on} />
              <span className="text-micro text-muted">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Sub>Pump control — all four branches, incl. MANUAL (DEV-003)</Sub>
      <Card variant="compact">
        <div className="flex flex-wrap items-center gap-4">
          <StateSwitcher
            ariaLabel="Device state"
            value={demo}
            onChange={(v) => setDemo(v as DeviceState)}
            options={[
              { value: "confirmed", label: "Confirmed" },
              { value: "pending", label: "Pending" },
              { value: "unknown", label: "Unknown" },
            ]}
          />
          <PillToggle
            ariaLabel="Pump mode"
            value={mode}
            onChange={(v) => setMode(v as PumpMode)}
            options={[
              { value: "AUTO", label: "AUTO" },
              { value: "MANUAL", label: "MANUAL" },
            ]}
          />
        </div>
      </Card>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <PumpControl
          state={demo}
          mode={mode}
          relayOn={relayOn}
          onToggle={() => setRelayOn((v) => !v)}
        />
        <div className="flex flex-col gap-3">
          {demo === "unknown" && (
            <AlertBanner tone="warn" icon live="alert">
              Device hasn&apos;t reported in 4 minutes. Readings below are the last
              known values, not live.
            </AlertBanner>
          )}
          <Card variant="compact">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3.5">
              <MetricReadout
                label="Air temp"
                value={demo === "unknown" ? "—" : "26.5"}
                unit={demo === "unknown" ? "" : "°C"}
              />
              <MetricReadout
                label="Humidity"
                value={demo === "unknown" ? "—" : "61"}
                unit={demo === "unknown" ? "" : "%"}
              />
              <MetricReadout
                label="Light"
                value={demo === "unknown" ? "—" : "820"}
                unit={demo === "unknown" ? "" : " lx"}
              />
              <MetricReadout label="Battery" value={demo === "unknown" ? "3.4" : "3.9"} unit="V" />
            </div>
          </Card>
        </div>
      </div>

      <Sub>Alert banners — 4 tones × 2 sizes</Sub>
      <div className="flex flex-col gap-2.5">
        <AlertBanner tone="warn" icon>
          Device hasn&apos;t reported in 4 minutes. Readings below are the last known
          values, not live.
        </AlertBanner>
        <AlertBanner tone="warn">
          This device has never been calibrated. Soil moisture readings are meaningless
          until dry and wet raw values are set.
        </AlertBanner>
        <AlertBanner tone="warn" size="sm">
          <strong>The API key is shown once.</strong> After you leave this screen, it
          cannot be retrieved again — only regenerated, which breaks the device until
          reflashed.
        </AlertBanner>
        <AlertBanner tone="danger">Pump command failed — device offline.</AlertBanner>
        <AlertBanner tone="mint">Calibration saved.</AlertBanner>
        <AlertBanner tone="neutral">No readings in the selected range.</AlertBanner>
      </div>

      <Sub>Segmented controls — 5 mechanisms</Sub>
      <Card variant="compact">
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-micro text-muted mb-2 font-mono">
              SlidingTabs · Login tabs · translateX pill, 320ms
            </div>
            <SlidingTabs
              ariaLabel="Login or claim"
              value={tab}
              onChange={setTab}
              options={[
                { value: "login", label: "Log in" },
                { value: "claim", label: "Claim your device" },
              ]}
            />
          </div>
          <div>
            <div className="text-micro text-muted mb-2 font-mono">
              PillToggle · admin role · white fill + shadow-pill
            </div>
            <PillToggle
              ariaLabel="Role"
              value={role}
              onChange={setRole}
              options={[
                { value: "super_admin", label: "Super admin" },
                { value: "support", label: "Support" },
              ]}
            />
          </div>
          <div>
            <div className="text-micro text-muted mb-2 font-mono">
              RangePills · time range · mint fill
            </div>
            <RangePills
              value={range}
              onChange={setRange}
              options={["12h", "24h", "48h", "Week", "Month"].map((v) => ({
                value: v,
                label: v,
              }))}
            />
          </div>
          <div>
            <div className="text-micro text-muted mb-2 font-mono">
              UnderlineTabs · Device Detail · 2px leaf underline
            </div>
            <UnderlineTabs
              ariaLabel="Device detail"
              value={detailTab}
              onChange={setDetailTab}
              options={[
                { value: "identity", label: "Identity" },
                { value: "live", label: "Live snapshot" },
                { value: "calibration", label: "Calibration" },
                { value: "binding", label: "Tenant binding" },
                { value: "telemetry", label: "Raw telemetry" },
                { value: "commands", label: "Commands" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Sub>Form fields — 5 sizes, mono, readonly, error</Sub>
      <Card variant="compact">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <FormField label="Phone number" type="tel" inputMode="numeric" placeholder="0244 123 456" size="lg" />
          <FormField label="Name" placeholder="Your name" size="md" />
          <FormField label="Name" defaultValue="Kwame Asante" size="sm" />
          <FormField label="Alert below" defaultValue="30" size="xs" mono />
          <FormField label="MAC address" placeholder="A4:CF:12:8E:3B:03" mono size="md" />
          <FormField
            label="Email or phone"
            defaultValue="kwame@farm.com"
            readOnly
            size="sm"
            hint="Contact support to change your login email or phone."
          />
          <FormField
            label="Verification code"
            defaultValue="9999"
            size="lg"
            mono
            error="This code has expired — resend to get a new one."
          />
          <TextareaField label="Message" rows={3} placeholder="What do you want to know?" />
        </div>
      </Card>

      <Sub>Claim code field — all 4 states</Sub>
      <Card variant="compact">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["valid", "claimed", "expired", "invalid"] as ClaimCodeState[]).map((s) => (
            <Button
              key={s}
              variant={claimState === s ? "primaryDark" : "outline"}
              size="sm"
              onClick={() => setClaimState(s)}
            >
              {s}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setClaimState(null)}>
            empty
          </Button>
        </div>
        <ClaimCodeField
          value={code}
          onChange={setCode}
          state={claimState}
          hint={
            <InlineHint tone="faint">
              Prototype codes — GG-4F82-K1 valid · GG-1111-11 already claimed ·
              GG-2222-22 expired · anything else not recognised.
            </InlineHint>
          }
        />
      </Card>

      <Sub>Stat cards & readouts</Sub>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
        <StatCard value="1" label="Total devices" />
        <StatCard value="1" label="Online" valueClassName="text-leaf" />
        <StatCard value="0" label="Offline" valueClassName="text-faint" />
        <StatCard value="0" label="Never reported" valueClassName="text-faint" />
        <StatCard value="1" label="Unclaimed" valueClassName="text-warn-text" />
        <StatCard value="0" label="Alerting now" valueClassName="text-faint" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <StatCard variant="spec" value="10s" label="reporting interval" />
        <StatCard variant="spec" value="3" label="metrics tracked — soil, temp, humidity" />
        <StatCard variant="spec" value="SMS" label="alerts, no app or data plan required" />
        <StatCard variant="spec" value="ESP32" label="solar-friendly, low-power hardware" />
      </div>

      <Sub>Table shell — scrolls horizontally below its min-width</Sub>
      <DataTable columns={TABLE_COLS} minWidth={640} caption="Irrigation events">
        {[
          ["Today, 6:14 AM", "4m 20s", "AUTO", "Soil reached 70% — target saturation"],
          ["Yesterday, 9:02 PM", "2m 05s", "MANUAL", "Stopped by user from dashboard"],
          ["3 days ago, 2:30 PM", "1m 10s", "MANUAL", "Stopped — physical switch set to MANUAL"],
        ].map(([started, duration, trigger, reason]) => (
          <TableRow key={started} columns={TABLE_COLS} minWidth={640}>
            <Cell tone="canopy">{started}</Cell>
            <Cell tone="canopy" mono>
              {duration}
            </Cell>
            <Cell>
              <StatusPill tone={trigger === "AUTO" ? "mint" : "stone"}>{trigger}</StatusPill>
            </Cell>
            <Cell>{reason}</Cell>
          </TableRow>
        ))}
      </DataTable>

      <Sub>Custom dropdown — replaces native select, with keyboard support</Sub>
      <Card variant="compact">
        <div className="flex flex-wrap gap-2.5">
          <Dropdown
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              "All statuses",
              "Online",
              "Offline",
              "Never reported",
              "Unclaimed",
              "Disabled",
            ]}
          />
          <Dropdown
            label="Tenant"
            value="All tenants"
            onChange={() => {}}
            options={["All tenants", "Kwame Asante", "Unclaimed"]}
          />
        </div>
      </Card>

      <Sub>Numbered steps</Sub>
      <div className="bg-mint rounded-hero p-panel grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <NumberedStep
          number="01"
          title="Sensor reads the soil"
          body="A probe in the ground measures moisture every 10 seconds, alongside air temperature and humidity."
        />
        <NumberedStep
          number="02"
          title="Readings reach GreenGo"
          body="The device sends each reading to your dashboard — and to its own LCD screen in the greenhouse."
        />
      </div>

      <Sub>Success, empty & loading states</Sub>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <Card>
          <SuccessPanel
            title="Phone verified — account created"
            body="Greenhouse 1 is linked to your account. Calibration starts next."
            action={
              <ButtonLink href="#" variant="primary" size="md">
                Go to your dashboard
              </ButtonLink>
            }
          />
        </Card>
        <Card>
          <SuccessPanel size="sm" title="Device provisioned" />
        </Card>
        <EmptyState
          title="Add a device"
          body="You already have an account — just enter the claim code for the next greenhouse."
          action={
            <a href="#" className="text-sm text-leaf font-semibold">
              I have a claim code
            </a>
          }
        />
        <Card variant="compact">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/3" />
            <div className="text-micro text-faint mt-1">Skeleton · DEV-004</div>
          </div>
        </Card>
      </div>

      <Sub>Informatory UI — DEV-004, no handoff reference</Sub>
      <Card variant="compact">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
            Open typed confirm
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.push({ tone: "success", title: "Thresholds saved" })}
          >
            Toast · success
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.push({
                tone: "warn",
                title: "Quiet hours active",
                body: "SMS suppressed until 5:30 AM unless soil is critically dry.",
              })
            }
          >
            Toast · warn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.push({
                tone: "danger",
                title: "Pump command failed",
                body: "Device offline — command expired before check-in.",
              })
            }
          >
            Toast · danger (persists)
          </Button>
          <Tooltip content="Raw ADC value from the resistive bridge. Stored so calibration errors stay recoverable.">
            <span className="text-sm text-leaf cursor-help font-semibold underline decoration-dotted">
              Tooltip
            </span>
          </Tooltip>
        </div>
      </Card>

      <Card variant="compact">
        <Pagination
          page={page}
          pageCount={12}
          totalRows={86400}
          pageSize={100}
          onPageChange={setPage}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal — DEV-004"
        description="Bottom sheet below 760px. Focus trapped, ESC closes, scroll locked, max-height keeps it inside the viewport."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <p className="text-md text-ink leading-body m-0">
          Geometry is borrowed from the profile-menu card so this reads as part of the
          same system: radius 12, shadow-menu, 1.5px line-soft border. Resize below
          760px to see it become a bottom sheet with the mobile panel&apos;s treatment.
        </p>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setTyped("");
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          setTyped("");
          toast.push({ tone: "danger", title: "Device unclaimed" });
        }}
        title="Unclaim this device?"
        description="Unclaiming removes this device from Kwame Asante's dashboard immediately."
        confirmPhrase="Kwame Asante"
        confirmLabel="Unclaim device"
        typedValue={typed}
        onTypedValueChange={setTyped}
      />

      <Sub>Avatar & profile menu</Sub>
      <Card variant="compact">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar initials="KA" name="Kwame Asante" />
          <Avatar initials="OP" name="Owusu Prempeh" size={30} />
          <ProfileMenu name="Owusu Prempeh" email="ops@greengo.dev" initials="OP" />
          <span className="text-micro text-faint">
            click the avatar — closes on outside click and ESC
          </span>
        </div>
      </Card>

      <Sub>Footer — 2 surfaces</Sub>
      <div className="rounded-card bg-white p-5">
        <MarketingFooter surface="light" />
      </div>
      <div className="bg-canopy bg-scrim-cta rounded-card p-5">
        <MarketingFooter surface="photo" />
      </div>

      <Sub>Card shells & headings</Sub>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {(["default", "compact", "hero", "flat"] as const).map((v) => (
          <Card key={v} variant={v}>
            <CardTitle>Card · {v}</CardTitle>
            <div className="text-meta text-muted mt-2">
              {v === "default" && "radius 20 · pad 26"}
              {v === "compact" && "radius 20 · pad 22"}
              {v === "hero" && "radius 24 · fluid pad"}
              {v === "flat" && "no border"}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
