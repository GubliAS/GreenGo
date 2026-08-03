# DEVIATIONS

Every departure from the handoff HTML, for your ruling. Rule 1 of the build brief makes the handoff the specification; anything in this file is either (a) a conflict inside the handoff itself, (b) an explicitly authorised expansion, or (c) a responsive/a11y necessity the handoff does not answer.

**Status legend:** `AUTHORISED` — you ruled on it · `PENDING` — awaiting your ruling · `APPLIED` — implemented

---

## DEV-001 — Input and nav-link radius: 14px, not 10px/12px

**Status:** AUTHORISED (2026-08-03, ruling #3)
**Type:** Conflict inside the handoff

The handoff README states:

> *"Card radius: 20px. Larger feature panels/hero: 28px. Pills/tags: 20px (full). **Buttons/nav/inputs: 14px** (NOT pill-shaped — a deliberate correction from an earlier pill treatment)."*

The 19 HTML files do not honour this for inputs or nav links:

| Element | HTML renders | Occurrences |
|---|---|---|
| Text inputs | `border-radius:10px` | 85 |
| App nav links | `border-radius:10px` | 37 |
| Marketing nav links | `border-radius:12px` | 22 |
| Buttons | `border-radius:14px` | 34 ✓ matches README |
| Nav bar container | `border-radius:14px` | ✓ matches README |

**Ruling:** README wins. The phrase *"a deliberate correction from an earlier pill treatment"* indicates 14px was a decision taken after the HTML was generated, making the HTML the stale artefact.

**Applied:** `--radius-input: 14px` and `--radius-nav: 14px`. Inputs and all nav links render at 14px.
**Visible effect:** every form field and nav link across all 24 screens is 4px rounder than the handoff files render.

---

## DEV-002 — All marketing pages get the scroll-condensing nav

**Status:** AUTHORISED (2026-08-03, ruling #4)
**Type:** Inconsistency inside the handoff

`GreenGo Landing Page.dc.html` implements a two-state nav driven by `window.scrollY > 24`:

| | unscrolled | scrolled |
|---|---|---|
| background | `#FFFFFF` | `rgba(255,255,255,.92)` |
| backdrop-filter | `blur(0px)` | `blur(10px)` |
| box-shadow | `none` | `0 8px 24px rgba(20,35,25,.1)` |
| max-width | `1400px` | `1200px` |

How It Works, Live Demo, Pricing and Contact hardcode the **scrolled** values permanently and contain no scroll listener. They also lack Landing's mobile hamburger entirely.

**Ruling:** Landing is the reference implementation. All 5 marketing pages get the scroll transition and the mobile nav.
**Visible effect:** at scroll-top, the 4 secondary marketing pages are now opaque white with no shadow, where the files render them translucent and shadowed.

---

## DEV-003 — MANUAL mode copy

**Status:** AUTHORISED (2026-08-03, ruling #5)
**Type:** State present in the product model, absent from the pixels

`GreenGo Device Dashboard.dc.html` hardcodes the mode so MANUAL never renders:

```js
const mode = isUnknown ? 'AUTO' : 'AUTO';
```

The markup, however, already supports it — `Mode: {{ modeLabel }}` flows through the existing `#F0F1EC` pill, and a `{{ modeDisabledReason }}` conditional slot exists. Only the copy was never written. Meanwhile the handoff README, the How It Works step-04 copy (*"In MANUAL, a physical switch on site has the final say — remote control is disabled and says why"*), and the Phase 4 interlock requirement all demand this state.

**Ruling:** mirror the handoff's plain-spoken, reason-giving voice, matching the `unknown` state's structure.

| Slot | Copy |
|---|---|
| Mode pill | `Mode: MANUAL` *(existing component, no new styling)* |
| Pump button | `Control unavailable` *(same string the `unknown` state uses)* |
| Reason line | `The switch on the device is set to MANUAL — the pump can only be controlled on site until it's set back to AUTO.` |

**Visual treatment:** reuses the `unknown` state's disabled-button styling (`--color-stone` bg, `--color-faint-deep` fg, `cursor:not-allowed`). No page-level banner — unlike `unknown`, the readings in MANUAL are live and trustworthy, so the stale-data banner would be wrong.

---

## DEV-004 — Informatory UI layer added (modals, toasts, tooltips)

**Status:** AUTHORISED (2026-08-03, ruling #6)
**Type:** Authorised expansion beyond the handoff

The handoff contains **zero** modals, bottom sheets, toasts, tooltips, skeletons or pagination controls across all 19 files. Destructive confirmation is done inline: a text input requiring the user to type an exact string (`"Greenhouse 1"`, `"Kwame Asante"`) next to a `--color-danger` button.

**Ruling:** add modals, toasts, tooltips and whatever informatory UI the app needs.

**Constraint I am holding myself to:** every one of these is composed from §B tokens only — no new colours, radii, shadows or type sizes. Each borrows its geometry from the nearest designed analogue:

| New component | Geometry borrowed from |
|---|---|
| `<Modal>` | Profile-menu card — `--radius-menu` 12px, `--shadow-menu` |
| `<BottomSheet>` | Landing mobile-menu panel — `--radius-panel` 16px, `--shadow-panel`, `gg-rise` |
| `<Toast>` | Alert-banner colour sets (warn / danger / mint-success) + `--shadow-menu` |
| `<Tooltip>` | Dropdown menu — `--radius-sm` 8px, `--shadow-menu`, `--text-meta` |
| `<Skeleton>` | `--color-stone` fill, `gg-pulse` keyframe |
| `<EmptyState>` | Generalised from the *one* designed instance (dashed "Add a device" tile) |
| `<Pagination>` | Time-range pill selector — `--radius-sm`, `--color-mint` active |
| `<ConfirmDialog>` | **Preserves** the handoff's type-to-confirm requirement, now inside a `<Modal>` |

**Note:** `<ConfirmDialog>` does not replace the inline typed-confirmation on Admin Device Detail — those two instances stay exactly as designed. The dialog is for the 10 new pages.

---

## DEV-005 — 10 routes built with no handoff design

**Status:** AUTHORISED (2026-08-03, ruling #1)
**Type:** Authorised expansion beyond the handoff

These rows of the expected page set have no design in the handoff (evidence in `MANIFEST.md` §A.3). Ruling: build all of them.

| Route | Gap type | Nearest designed reference I will compose from |
|---|---|---|
| `/admin/login` | fully missing | `/login` split-screen layout, admin branding |
| `/forgot-password` | fully missing | `/login` claim-flow OTP step (4-digit, 30s resend cooldown, 2 error states) |
| `/set-password` | partial — only exists inside claim `details` step | Extracted from that step |
| `/devices/[id]/history` | partial — inline dashboard chart only | Dashboard chart + time-range pills, promoted to full page |
| `/devices/[id]/calibration` | fully missing | Admin Device Detail *Calibration* tab (read-only) turned into a wizard; claim-flow step pattern |
| `/notifications` | fully missing | Fleet Overview activity feed |
| `/admin/tenants` | fully missing | Admin Devices List table shell |
| `/admin/tenants/[id]` | fully missing | Admin Device Detail tab layout |
| `/admin/commands` | partial — per-device tab only | Device Detail *Commands* tab, widened to fleet scope |
| `/admin/sms` | fully missing | Table shell + status pills; Fleet Overview SMS-spend card |
| `/admin/config` | fully missing | `/alerts` card-stack form layout |

Each page will get its own entry in this file if it required a decision the references do not answer.

---

## DEV-006 — Four net-new navigation items

**Status:** AUTHORISED (2026-08-03, ruling #1 + minimal-extension)
**Type:** Consequence of DEV-005

The handoff's tenant nav has 4 items (Devices, Irrigation log, Alerts, Settings); the admin nav has 2 (Fleet, Devices). Ten new routes need entry points.

**Added:** `Notifications` (tenant) · `Tenants`, `SMS log`, `Config` (admin).
**Not added:** history, calibration, forgot-password, set-password, admin login and fleet commands all reuse existing in-copy links or redirects rather than new nav items — keeping invented navigation to the minimum.

Admin nav grows 2 → 5 items, which will need the mobile treatment (DEV-007) sooner than the 2-item original would.

---

## DEV-007 — Mobile nav added to 15 screens

**Status:** AUTHORISED — instructed by the handoff README
**Type:** Handoff instruction, recorded for completeness

Only 2 of 17 product screens (Landing, Devices List) have the designed hamburger + panel. The other 15 rely on `overflow-x:auto` horizontal scrolling. The handoff README explicitly instructs:

> *"Reference implementation: `GreenGo Landing Page.dc.html` (floating pill nav variant) and `GreenGo Devices List.dc.html` (flush app top-bar variant) — apply the same pattern to the other tenant/admin pages that currently only have the `overflow-x:auto` horizontal-scroll fallback."*

Preserving the 760px breakpoint and the 3-bar → X morph (middle bar fades, top/bottom rotate ±45° and translate 7px).

**Note:** this is net-new markup on 15 screens, sanctioned by the handoff rather than invented by me — recorded here so Phase 6 can account for it.

---

## DEV-008 — Responsive breakpoints replace JS width detection

**Status:** AUTHORISED — instructed by the handoff README
**Type:** Handoff instruction, recorded for completeness

The handoff has no CSS media queries except 4 × `prefers-reduced-motion`. Responsive behaviour is driven by `state.isMobile = window.innerWidth < 760` set on mount and `resize`, because the design system's templates use inline styles exclusively. The README instructs recreating this with real CSS breakpoints.

**Applied:** Tailwind `md:` (768px default) is **not** a match for the handoff's 760px. I am defining a custom `--breakpoint-nav: 760px` token so the cut lands exactly where designed, rather than silently drifting 8px.

---

## Pending — no ruling needed yet

Nothing outstanding. Items discovered during Phases 1–5 will be appended here with `PENDING` status and raised at the next checkpoint.
