# GreenGo — Phase 0 Inventory & Build Plan

**Handoff source:** `C:\Users\gsito\Downloads\Design System and Landing Page\design_handoff_greengo`
**Files read:** 19 of 19 `.dc.html` screens + `README.md` + 4 image assets. Nothing sampled — every file read in full.
**Date:** 2026-08-03
**Status:** awaiting approval. Nothing scaffolded.

---

## 0. What the handoff format actually is

Every screen is a single self-contained file in a custom templating format (`x-dc`), not React:

| Handoff construct | Meaning | React/Next translation |
|---|---|---|
| `style="…"` inline only | **All** styling is inline. Zero CSS classes except `.gg-scroll` and the Logo Options doc chrome. | Tailwind v4 utilities from `@theme` tokens |
| `style-hover="…"` / `style-active="…"` | Pseudo-state styles as attributes | `hover:` / `active:` variants |
| `<sc-if value="{{ x }}">` | Conditional render | `{x && …}` |
| `<sc-for list="{{ xs }}" as="x">` | Loop | `xs.map(…)` |
| `{{ expr }}` | Value from `renderVals()` | props / state |
| `class Component extends DCLogic` | Per-file state machine + `renderVals()` | `useState` + derived values |
| `<image-slot src shape radius placeholder>` | Image placeholder web component | `next/image` |
| `<helmet>` | Head content | `layout.tsx` / `metadata` |
| `support.js`, `image-slot.js` | **Referenced by every file but NOT shipped** — design-tool runtime | nothing to port |

Consequence: **there are no CSS media queries in the handoff** (only 4 × `prefers-reduced-motion`). All responsive behaviour is either intrinsic (`minmax()` auto-fit grids, `clamp()`) or JS-driven via `state.isMobile = window.innerWidth < 760`. Per the handoff README this must be re-expressed as real CSS breakpoints, preserving the 760px cut.

---

## A. PAGE MANIFEST

### A.1 — Screens present in the handoff (19 files)

| # | Source file | Proposed route | Area | Mobile variant designed? | Notes |
|---|---|---|---|---|---|
| 1 | `GreenGo Landing Page.dc.html` | `/` | public | **Yes** — full hamburger + panel | Scroll-condensing pill nav; 4 segmented bars; live 10s tick |
| 2 | `GreenGo How It Works.dc.html` | `/how-it-works` | public | No — desktop nav only | Has the one truly empty image slot |
| 3 | `GreenGo Live Demo.dc.html` | `/live-demo` | public | No | 72px hero readout, 24-seg bar, 10s tick |
| 4 | `GreenGo Pricing.dc.html` | `/pricing` | public | No | Deliberately unpriced + request form |
| 5 | `GreenGo Contact.dc.html` | `/contact` | public | No | Contact form incl. `<textarea>` |
| 6 | `GreenGo Login.dc.html` | `/login` | auth | Intrinsic (`minmax(300px,1fr)` split stacks) | **Two tabs + 4-step claim flow** — see A.2 |
| 7 | `GreenGo Devices List.dc.html` | `/devices` | tenant | **Yes** — full hamburger + panel | Reference impl for app top bar |
| 8 | `GreenGo Device Dashboard.dc.html` | `/devices/[id]` | tenant | No | **All 3 device states**; 64px readout; inline chart; pump control |
| 9 | `GreenGo Irrigation Log.dc.html` | `/devices/[id]/irrigation` | tenant | No — table scrolls x | 4-col table, 6 rows |
| 10 | `GreenGo Alerts.dc.html` | `/devices/[id]/alerts` | tenant | No | 4 cards: soil / temp+humidity / SMS recipients / quiet hours |
| 11 | `GreenGo Add Device.dc.html` | `/devices/add` | tenant | No | Claim code only + success step |
| 12 | `GreenGo Settings.dc.html` | `/settings` | tenant | No | Account / device / password / log out |
| 13 | `GreenGo Admin Fleet Overview.dc.html` | `/admin` | admin | No | 6 stat cards, dark live strip, activity feed, SMS spend |
| 14 | `GreenGo Admin Devices List.dc.html` | `/admin/devices` | admin | No — table scrolls x | 7-col table + 2 custom dropdowns + search |
| 15 | `GreenGo Admin Device Detail.dc.html` | `/admin/devices/[id]` | admin | No | **6 tabs**; role toggle; 2 typed confirmations; all 3 states |
| 16 | `GreenGo Admin Provision Device.dc.html` | `/admin/devices/provision` | admin | No | Form → generated creds + sticker preview |
| 17 | `GreenGo Admin Account Settings.dc.html` | `/admin/account` | admin | No | Reached from profile menu |
| 18 | `GreenGo Admin Audit Log.dc.html` | `/admin/audit` | admin | No — table scrolls x | 4-col table, 5 rows |
| 19 | `GreenGo Logo Options.dc.html` | *(not a route)* | — | n/a | **Design exploration doc**, 11 logo candidates over 3 turns. Chosen mark = option **2b** |

**Mobile nav reality check:** only 2 of 17 product screens (Landing, Devices List) have the designed hamburger. The other 15 rely on `overflow-x:auto`. The handoff README explicitly instructs applying the pattern to the rest — that is a sanctioned instruction, not my invention, but it is still net-new markup on 15 screens.

### A.2 — Screens that are *sub-states*, not separate files

The expected-set count of 24 partly resolves inside existing files:

| Expected screen | Where it actually lives |
|---|---|
| Claim device (first device) | `Login` → "Claim your device" tab → step `code` |
| Set password | `Login` → claim step `details` (name + phone + password together) |
| OTP verification | `Login` → claim step `otp` (4-digit, 30s resend cooldown, 2 error states) |
| Claim success | `Login` → claim step `success` |
| History | `Device Dashboard` → inline 24-bar chart + 12h/24h/48h/Week/Month pills |
| Command audit log | `Admin Device Detail` → "Commands" tab (per-device, not fleet-wide) |
| Calibration (read-only) | `Admin Device Detail` → "Calibration" tab |

### A.3 — MISSING from the handoff (flagged, not invented)

10 rows of the expected set have no design. **I have not designed any of these.**

| Expected row | Area | Status | Evidence in handoff |
|---|---|---|---|
| **Set password** (standalone) | auth | **PARTIAL** | Only exists bundled into the claim `details` step |
| **Forgot password + OTP** | auth | **MISSING** | `Login` has `<a href="#">Forgot password?</a>` — dead link, no screen |
| **Admin log in** | auth | **MISSING** | All 6 admin screens assume an existing session |
| **History** (standalone) | tenant | **PARTIAL** | Only the inline dashboard chart exists |
| **Notifications inbox** | tenant | **MISSING** | No reference anywhere |
| **Calibration wizard** | tenant | **MISSING** | Referenced 3× in copy ("Calibration starts next" ×2, `<a href="#">Re-run calibration</a>`), never designed |
| **Tenants list** | admin | **MISSING** | Tenant appears only as a text column + a filter option |
| **Tenant detail** | admin | **MISSING** | — |
| **Command audit log** (fleet-wide) | admin | **PARTIAL** | Per-device tab only |
| **SMS log** | admin | **MISSING** | Fleet Overview shows only GHS spend totals |
| **Login audit log** (dedicated) | admin | **PARTIAL** | `Admin Audit Log` mixes login rows with device rows |
| **Global config** | admin | **MISSING** | — |

### A.4 — Present but NOT in the expected set

- `GreenGo Logo Options.dc.html` — logo exploration document. Not a product route. Recommend: extract the chosen mark (2b) as the `<Logo>` component, do not build a page. Its own chrome tokens (`#F6F4EE`, `0 1px 3px rgba(20,35,25,.06)`, `ui-monospace`) are **doc-only and excluded** from the product theme.

---

## B. TOKEN EXTRACTION

Counts are exact occurrence counts across all 19 files.

### B.1 Colour — core

| Token | Value | Uses | Role (from README + observed usage) |
|---|---|---|---|
| `--color-canopy` | `#17352A` | 341 | Deep canopy green. Dark bands, primary text, footer/CTA bg, avatar, active toggle |
| `--color-leaf` | `#2F9D46` | 157 | Primary working green. Buttons, links, active states, brand, ramp wet-end |
| `--color-leaf-deep` | `#24803B` | 9 | Primary button **hover only** |
| `--color-mint` | `#EAF7EE` | 172 | Pale green tint. Section rhythm, active nav/tab bg, success circles, pills |
| `--color-mint-deep` | `#DCEFE1` | 4 | Marketing nav link `:active` bg only |
| `--color-mint-bright` | `#B7E3BC` | 1 | Landing hero italic accent (on photo) |
| `--color-white` | `#FFFFFF` | 162 | Page bg + cards *(`#fff` ×155 and `#ffffff` ×7 are the same colour — casing only)* |
| `--color-app` | `#F7F8F5` | 22 | App/dashboard page bg + table header bg |
| `--color-stone` | `#F0F1EC` | 22 | Inert/disabled fill, tab-track bg, readonly inputs, MANUAL pill |

### B.2 Colour — text

| Token | Value | Uses | Role |
|---|---|---|---|
| `--color-body` | `#3E4A43` | 54 | Body text |
| `--color-muted` | `#64756C` | 152 | Muted/secondary text |
| `--color-faint` | `#AEB8AF` | 16 | Disabled text, placeholder hints |
| `--color-faint-deep` | `#8A968B` | 2 | Disabled **pump button** label only — ⚠️ see B.6 |

### B.3 Colour — moisture ramp & status

| Token | Value | Uses | Role |
|---|---|---|---|
| `--color-dry-critical` | `#C24A2C` | 7 | Red / critical dry |
| `--color-warn` | `#DE8A3E` | 8 | Amber / dry-warning (activity dot) |
| `--color-pending` | `#E8A951` | 8 | Pending dot, warning-banner border, indeterminate bar — ⚠️ see B.6 |
| `--color-warn-text` | `#7A4E12` | 7 | Amber text on amber bg |
| `--color-warn-icon` | `#B5751F` | 3 | Warning-triangle SVG stroke — ⚠️ see B.6 |
| `--color-warn-bg` | `#FCEFE3` | 6 | Amber banner/feedback bg |
| `--color-moist` | `#8FBE4F` | 6 | Light green / moist transition |
| `--color-leaf-soft` | `#7FBE86` | 8 | Numbered-step numerals |
| `--color-danger` | `#B0432E` | 15 | Destructive actions & error text |
| `--color-danger-border` | `#E2A296` | 3 | Error input border, claimed-code border |
| `--color-danger-bg` | `#FBEAE6` | 7 | Error feedback bg, log-out hover |

### B.4 Colour — lines & scrims (rgba)

| Token | Value | Uses | Role |
|---|---|---|---|
| `--color-hairline` | `rgba(20,35,25,.08)` | 58 | Card borders, top-bar bottom border, dividers |
| `--color-line` | `rgba(20,35,25,.14)` | 46+2 | Input borders, empty segments (app pages) |
| `--color-line-soft` | `rgba(20,35,25,.1)` | 22 | Admin card borders, dropdown menu borders, footer top border |
| `--color-hairline-soft` | `rgba(20,35,25,.06)` | 6 | Table row separators |
| `--color-line-strong` | `rgba(20,35,25,.16)` | 3 | Empty segments (marketing pages) — ⚠️ see B.6 |
| `--color-dot-off` | `rgba(20,35,25,.25)` | 2 | Pump-off status dot |
| `--color-line-dashed` | `rgba(20,35,25,.15)` | 1 | "Add a device" dashed tile |

**On-dark scrims** (23 distinct `rgba(255,255,255,·)` and `rgba(23,53,42,·)` / `rgba(15,28,21,·)` / `rgba(11,23,17,·)` / `rgba(9,19,14,·)` values). These are almost all one-off gradient stops and text opacities on photography. Proposal: express as `--color-canopy` / white with Tailwind opacity modifiers (`text-white/72`) rather than 23 tokens, **except** the 4 photo gradients which become named tokens:

| Token | Value |
|---|---|
| `--gradient-hero` | `linear-gradient(0deg,rgba(15,28,21,.72) 0%,rgba(15,28,21,.15) 55%,rgba(15,28,21,.05) 100%)` |
| `--gradient-cta` | `linear-gradient(180deg,rgba(11,23,17,.55) 0%,rgba(11,23,17,.72) 55%,rgba(9,19,14,.94) 100%)` |
| `--gradient-login` | `linear-gradient(160deg,rgba(23,53,42,.2) 0%,rgba(15,28,21,.85) 100%)` |
| `--color-segment-empty-dark` | `rgba(255,255,255,0.28)` |

### B.5 The moisture ramp — code, not CSS

`buildSegments()` / `rampRgb()` appear **verbatim identical in 5 files** (Landing, Live Demo, Device Dashboard, Devices List, Fleet Overview). Interpolation stops:

```
[0.00, rgb(193,56,46)]   = #C1382E
[0.33, rgb(184,121,30)]  = #B8791E
[0.66, rgb(47,157,70)]   = #2F9D46  ← matches --color-leaf
[1.00, rgb(23,53,42)]    = #17352A  ← matches --color-canopy
```

Fill rule: segment `i` of `count` is filled when `((i+1)/count)*100 <= percent`; its colour is `rampRgb(i/(count-1))` — **position-based, not value-based**. Empty segments get `transparent` + a 1.5px border.

> ⚠️ Ramp stops 0 and 1 (`#C1382E`, `#B8791E`) are **not** the palette's `#C24A2C` / `#DE8A3E` — they differ by ~2–6%. The README documents the ramp with the `rgb()` values, so both sets look intentional (palette = flat UI, ramp = interpolation space). Flagged in B.6 for your ruling.

### B.6 ⚠️ NEAR-DUPLICATES — I need your ruling before collapsing any of these

| # | Values | Where each is used | My read |
|---|---|---|---|
| 1 | `#DE8A3E` / `#E8A951` / `#B5751F` | activity dot / pending dot + banner border + indeterminate bar / warning-triangle stroke | **Three ambers.** Likely intentional (dot vs border vs icon) but `DE8A3E`↔`E8A951` is the suspicious pair |
| 2 | `#AEB8AF` / `#8A968B` | disabled text everywhere / disabled pump-button label only | **Probably accidental.** 2 uses, same semantic role |
| 3 | `#C24A2C` / `#B0432E` | critical-dry ramp colour / destructive-action red | **Keep both** — README separates them explicitly |
| 4 | `rgba(20,35,25,.14)` / `.16` | empty segment border on Device Dashboard + Devices List / on Landing + Live Demo | **Accidental.** Same component, two alphas, split by file. Recommend collapsing to `.14` |
| 5 | `rgba(20,35,25,.08)` / `.1` / `.06` | card borders + dividers / admin card borders + dropdowns + footer rule / table row separators | Three border alphas doing overlapping jobs |
| 6 | ramp `#C1382E`/`#B8791E` vs palette `#C24A2C`/`#DE8A3E` | segmented bar interpolation / flat UI elements | See B.5 |
| 7 | `#EAF7EE` / `#DCEFE1` | tint + active nav / nav `:active` press state | **Keep both** — hover vs press |
| 8 | `#fff` / `#ffffff` | — | Identical. Collapsing silently (casing, not design) |
| 9 | `rgba(20,35,25,.14)` / `rgba(20,35,25,0.14)` | — | Identical. Collapsing silently (formatting) |

**Excluded as document chrome, not product:** `#F6F4EE`, `#7FE28C`, `0 1px 3px rgba(20,35,25,.06)`, `ui-monospace/Menlo` — all appear only in `Logo Options`.

### B.7 Typography — families

| Token | Family | Weights in handoff | Notes |
|---|---|---|---|
| `--font-display` | Bricolage Grotesque | 700, 800 | Variable: `opsz 6..96, wght 500..800`. Headlines, wordmark, page h1 |
| `--font-accent` | Newsreader **italic** | 400 *(500 loaded, unused)* | Italic phrase inside headlines only |
| `--font-body` | Public Sans | 400, 500, 600, 700 | Body/UI default |
| `--font-mono` | IBM Plex Mono | 500, 600 | **Instrument only:** readouts, %, MAC, API keys, claim codes, timestamps. README: never for user-entered text like names/phones |

Loaded from Google Fonts CDN in the handoff → **must become self-hosted `next/font`** (3G constraint).

### B.8 Typography — fixed sizes (27 distinct)

The system's real rhythm is **0.5px steps in the 11–16px band**. Presented verbatim per Rule 1.

| Token | px | Uses | Primary role |
|---|---|---|---|
| `--text-micro` | 11 | 24 | Mono uppercase eyebrows, ADMIN badge |
| `--text-label` | 11.5 | 32 | Uppercase metric captions, status pills, hints |
| `--text-caption` | 12 | 36 | Badges, small captions, footer meta |
| `--text-meta` | 12.5 | 59 | Form labels, secondary meta, back-links |
| `--text-sm` | 13 | 68 | Dense body, table cells, step body |
| `--text-body` | 13.5 | 81 | **Default body/UI** (most used value) |
| `--text-base` | 14 | 33 | App-page inputs, admin buttons |
| `--text-md` | 14.5 | 57 | Marketing body, primary inputs/buttons |
| `--text-lg` | 15 | 27 | Emphasis body, CTA buttons |
| `--text-lg-alt` | 15.5 | 12 | Marketing lede, numbered-step titles |
| `--text-xl` | 16 | 18 | Card titles, app wordmark, How-It-Works lede |
| `--text-xl-alt` | 16.5 | 1 | Landing hero paragraph |
| `--text-feature` | 17 | 3 | Landing feature-card titles |
| `--text-2xl` | 18 | 13 | Marketing wordmark, footer heading |
| `--text-19` | 19 | 1 | Pricing form heading |
| `--text-20` | 20 | 2 | Live Demo pump readout |
| `--text-21` | 21 | 1 | Add Device success h2 |
| `--text-22` | 22 | 8 | Spec numerals, dashboard metric readouts |
| `--text-24` | 24 | 11 | App/admin page h1 |
| `--text-26` | 26 | 9 | Devices List h1, fleet stat numerals, OTP input |
| `--text-28` | 28 | 9 | Live Demo metric readouts |
| `--text-30` | 30 | 1 | Logo doc lockup *(product use: none — verify in Phase 1)* |
| `--text-34` | 34 | 2 | Landing hero-card percent |
| `--text-36` | 36 | 1 | Fleet Overview live percent |
| `--text-38` | 38 | 1 | Logo doc wordmark |
| `--text-64` | 64 | 1 | Device Dashboard hero percent |
| `--text-72` | 72 | 1 | Live Demo hero percent |

*(10px excluded — Logo Options chrome only.)*

### B.9 Typography — fluid sizes (13 distinct clamps)

| Token | Value | Where |
|---|---|---|
| `--text-hero-landing` | `clamp(34px,4.6vw,54px)` | Landing h1 |
| `--text-hero-how` | `clamp(32px,4.2vw,50px)` | How It Works h1 |
| `--text-hero-demo` | `clamp(30px,4vw,48px)` | Live Demo h1 |
| `--text-hero-pricing` | `clamp(30px,3.8vw,46px)` | Pricing h1 |
| `--text-hero-contact` | `clamp(30px,3.6vw,44px)` | Contact h1 |
| `--text-cta-band` | `clamp(28px,3.6vw,42px)` | Landing CTA band h2 |
| `--text-quote` | `clamp(28px,3vw,38px)` | Login quote rotator |
| `--text-h2-lg` | `clamp(26px,3vw,36px)` | Landing "how it works" h2 |
| `--text-h2` | `clamp(24px,2.8vw,32px)` | Section h2 (×3) |
| `--text-h2-alt` | `clamp(24px,2.6vw,32px)` | Landing bar-explainer h2 |
| `--text-h2-sm` | `clamp(22px,2.4vw,28px)` | Live Demo CTA h2 |
| `--text-auth-h1` | `clamp(24px,3vw,30px)` | Login/claim h1 (×5) |
| `--text-quotemark` | `clamp(80px,9vw,120px)` | Login decorative `"` |

### B.10 Letter-spacing (10 distinct)

`-0.03em` (1) · `-0.02em` (21) · `-0.01em` (7) · `.02em` (1) · `.03em` (1) · `.04em` (8) · `.05em` (5) · `.06em` (21) · `.07em` (4) · `.08em` (9)
*(Plus one `letter-spacing:12px` — the OTP input's digit spread, not a scale value.)*

Tokens: `--tracking-tightest -0.03em` · `--tracking-tighter -0.02em` · `--tracking-tight -0.01em` · `--tracking-wide .04em` · `--tracking-wider .05em` · `--tracking-widest .06em` · `--tracking-caps .07em` · `--tracking-caps-lg .08em` · plus `.02em`/`.03em` (1 use each).

### B.11 Radius (15 distinct)

| Token | Value | Uses | Role |
|---|---|---|---|
| `--radius-input` | 10px | 85 | **Inputs, nav links (app), status-pill-adjacent** — most used |
| `--radius-card` | 20px | 64 | Cards, pills (as full-round on small elements) |
| `--radius-menu` | 12px | 40 | Dropdown/profile menus, nav links (marketing), tab tracks |
| `--radius-button` | 14px | 34 | Buttons, sticky nav bar, icon tiles |
| `--radius-full` | 50% | 30 | Dots, avatars, success circles |
| `--radius-sm` | 8px | 24 | Small buttons, menu items, chart bar tops |
| `--radius-segment` | 2px | 14 | Segmented bar (small), burger lines |
| `--radius-panel` | 16px | 13 | Alert banners, stat cards, mobile menu panel |
| `--radius-hero` | 28px | 11 | Hero/feature panels, mint sections |
| `--radius-segment-lg` | 3px | 9 | Segmented bar (large) |
| `--radius-badge` | 6px | 6 | ADMIN badge |
| `--radius-pill-sm` | 9px | 5 | Tab-pill inner, toggle buttons |
| `--radius-card-sm` | 24px | 2 | Device Dashboard hero card, Live Demo hero card |
| `--radius-xs` | 4px, 5px | 2 | Logo doc chrome, one pill |
| — | `2px 2px 0 0` | 1 | Chart bar top-only rounding |

> ⚠️ **README/HTML conflict.** The handoff README says *"Buttons/nav/inputs: 14px (NOT pill-shaped — a deliberate correction from an earlier pill treatment)."* The HTML **contradicts this for inputs and nav**: inputs are consistently `10px` (85 uses) and nav links are `10px` (app) / `12px` (marketing). Only buttons are `14px`. Per Rule 1 I will implement **the HTML** (10px inputs) and log this in `DEVIATIONS.md` for your ruling.

### B.12 Shadow (5 product + 1 doc)

| Token | Value | Uses | Role |
|---|---|---|---|
| `--shadow-menu` | `0 8px 24px rgba(20,35,25,.14)` | 6 | Floating dropdown/profile menus |
| `--shadow-nav` | `0 8px 24px rgba(20,35,25,.1)` | 5 | Sticky/scrolled pill nav |
| `--shadow-panel` | `0 12px 32px rgba(20,35,25,.16)` | 1 | Mobile menu panel |
| `--shadow-hero` | `0 20px 48px rgba(0,0,0,.25)` | 1 | Landing hero reading card |
| `--shadow-pill` | `0 1px 3px rgba(20,35,25,.12)` | 2 | Active tab pill / active role toggle |
| *excluded* | `0 1px 3px rgba(20,35,25,.06)` | 1 | Logo doc card only |

### B.13 Spacing

Observed values are **not a clean 4pt grid** — the system uses 9, 11, 13, 22, 26 freely. Tailwind's default 4px scale covers 4/8/12/16/20/24/28/32/48/56; these need explicit tokens:

**Extra spacing tokens:** `3px` `5px` `6px` `9px` `10px` `11px` `13px` `14px` `18px` `22px` `26px` `34px` `36px` `52px` `64px`

**Most-used paddings:** `8px 14px` (37 — app nav links) · `9px 16px` (22 — marketing nav links) · `26px` (23 — standard card) · `8px 10px` (16 — menu items) · `13px 14px` (12 — primary input) · `12px 14px` (12) · `14px 26px` (11 — primary button) · `24px` (12) · `22px` (9)

**Most-used gaps:** `10px` (32) · `14px` (27) · `16px` (25) · `4px` (25) · `9px` (22) · `18px` (21) · `12px` (13)

**Fluid spacing (11 distinct clamps):**

| Token | Value | Uses | Role |
|---|---|---|---|
| `--space-page` | `clamp(20px,3.5vw,40px)` | 11 | App/admin page padding |
| `--space-nav-gap` | `clamp(10px,2vw,32px)` | 6 | Marketing nav gap |
| `--space-panel` | `clamp(28px,4vw,40px)` | 5 | Mint section panels |
| `--space-nav-links` | `clamp(4px,1vw,10px)` | 5 | Marketing nav link gap |
| `--space-card-lg` | `clamp(28px,3.5vw,40px)` | 2 | Large cards (Live Demo hero, Pricing form) |
| `--space-section-x` | `clamp(24px,6vw,80px)` | — | Marketing section horizontal (README-documented) |
| `--space-footer-x` | `clamp(24px,6vw,64px)` | — | Footer horizontal |
| `--space-topbar-x` | `clamp(20px,4vw,48px)` | — | App/admin top bar horizontal |
| `--space-auth` | `clamp(32px,6vw,96px)` | 1 | Login form column |
| `--space-band` | `clamp(32px,5vw,64px)` | 1 | Landing green band |
| *others* | `clamp(56px,8vw,96px)`, `clamp(40px,5vw,72px)`, `clamp(32px,5vw,56px)`, `clamp(32px,4vw,48px)`, `clamp(24px,4vw,48px)`, `clamp(24px,3vw,32px)`, `clamp(24px,5vw,72px)` | 1 ea | One-off section paddings |

### B.14 Layout constants

**Grid `minmax()` breakpoints:** `300px` (7 — the dominant 2-col split) · `200px` (6) · `180px` (6) · `220px` (4) · `280px` (2) · `240px` · `140px` · `130px` · `120px`

**Table `min-width` (inside `overflow-x:auto`):** `640px` (Irrigation Log, Audit Log, Device Detail telemetry) · `680px` (Device Detail commands) · `820px` (Admin Devices List)

**Container `max-width`:** `1440px` (marketing outer) · `1400px`/`1200px` (nav — unscrolled/scrolled) · `1200px` (Dashboard, Fleet, Admin Devices) · `1100px` (Devices List, Device Detail) · `1000px` (Irrigation Log, Audit Log) · `800px` (Alerts) · `720px` (Settings) · `640px` (Provision, Admin Account) · `600px`/`520px` (Login column, Add Device)

### B.15 Motion

**Keyframes (6 defined, 5 used):** `gg-rise` (fade+translateY) · `gg-fade` · `gg-pulse` (opacity 1→.35) · `gg-indeterminate` (margin-left 0→60%→0) · `gg-quote-fade` · `gg-spin` *(declared on Landing, never applied)*

**Durations:** `200ms` `220ms` `250ms` `320ms` `350ms` `520ms` `1100ms` `1400ms` `7000ms`
**Easings:** `cubic-bezier(.4,0,.2,1)` (UI) · `cubic-bezier(.65,0,.35,1)` (entrances) · `ease` · `ease-in-out` (pulse) · `ease-out` (segment colour)
**Reduced motion:** every animated element carries `data-gg-anim="1"`; 4 files declare `@media (prefers-reduced-motion: reduce){[data-gg-anim]{animation:none !important}}`. Must become global.

---

## C. COMPONENT INVENTORY

Threshold is "repeats across ≥3 screens", but I've included below-threshold items the brief names, plus anything byte-identical across 2 files.

### C.1 Shared components — build in Phase 1

| # | Component | Screens | Variants / states |
|---|---|---|---|
| 1 | `<Logo>` | **19** | 3 sizes: 26×30 (marketing/login), 22×26 (app/admin), 52×60 (doc). Optional `ADMIN` badge |
| 2 | `<MarketingNav>` | 5 | `scrolled` / unscrolled; desktop / mobile+hamburger; `Log in` vs `Dashboard` (localStorage-driven); active-link per page |
| 3 | `<MarketingFooter>` | 5 | **on-photo** (Landing: white text) / **on-light** (other 4: dark text). Same 3 columns + copy |
| 4 | `<AppTopBar>` | 6 | 4 nav links + avatar; desktop / mobile+hamburger; active-link per page |
| 5 | `<AdminTopBar>` | 6 | Role **pill** (5 screens) vs role **toggle** (Device Detail); profile menu **interactive** (4) vs **static avatar** (2) |
| 6 | `<SegmentedBar>` | 6 | `count` 16/20/24; heights 24/32/36/40/44px; radius 2px/3px; empty border light/dark. Ports `buildSegments`+`rampRgb` |
| 7 | `<StatCard>` | 5 | mono numeral + muted caption. Numeral colour varies (canopy/leaf/faint/warn-text) |
| 8 | `<StatusPill>` | 5 | Online · Unclaimed · Claimed · AUTO · MANUAL · Confirmed · Failed. bg+fg pair |
| 9 | `<DataTable>` | 5 | `overflow-x:auto` + `min-width` grid rows + `#F7F8F5` uppercase header. 4/5/7 columns |
| 10 | `<FormField>` | 8 | label 12.5/600/canopy + input r10 border 1.5px `--color-line`, focus `--color-leaf`. Variants: text · tel(numeric) · password · mono/uppercase · readonly · textarea · error |
| 11 | `<Button>` | all | **7 variants** — see C.2 |
| 12 | `<ClaimCodeField>` | 2 | **4 states**, byte-identical logic in Login + Add Device: `valid` · `claimed` · `expired` · `invalid`. Each with bg/border/title colour/sub-copy |
| 13 | `<AlertBanner>` | 3 | Warn (`FCEFE3`/`E8A951`/`7A4E12`) — with icon (Dashboard stale), without (Device Detail uncalibrated), bold-lead (Provision) |
| 14 | `<SuccessPanel>` | 3 | 52px mint circle + checkmark (Login, Add Device); 36px inline (Provision) |
| 15 | `<SegmentedControl>` | 4 uses | **sliding-pill** (Login tabs, translateX) · **3-up state switcher** (Dashboard, Device Detail live) · **2-up toggle** (role, calibration) |
| 16 | `<ProfileMenu>` | 4 | Interactive dropdown: user block + Account settings + Audit log + red Log out |
| 17 | `<NumberedStep>` | 2 (8 instances) | Mono numeral in `--color-leaf-soft` + title + body |
| 18 | `<Icon*>` | — | 6 inline SVGs — see C.3 |

### C.2 Button variants (7)

| Variant | Style |
|---|---|
| `primary` | bg `--color-leaf`, `#fff`, r14, pad 13–15px / 22–28px, hover `--color-leaf-deep` |
| `primary-dark` | bg `--color-canopy`, `#fff`, r12 — pump-ON state |
| `ghost-on-photo` | bg `white/10–12`, border 1.5px `white/40–50`, `#fff`, r14 |
| `outline` | bg `#fff`, border 1.5px `--color-line`, r8, 13px — Reveal/Copy/live-tail |
| `disabled` | bg `--color-stone`, fg `--color-faint` (or `--color-faint-deep`), `cursor:not-allowed` |
| `destructive` | bg `--color-danger`, `#fff`, r8 — regenerate key / unclaim |
| `on-green` | bg `#fff`, fg `--color-canopy`, r14 — CTA inside green bands |

### C.3 Icons — 6 hand-drawn inline SVGs, no library

`1.8px` stroke, `fill:none`, `viewBox 0 0 24 24` unless noted:
1. **Droplet logo mark** — filled, `viewBox 0 0 72 84`, 3 cutout bars (the chosen 2b mark)
2. **Droplet / moisture** — stroke + horizontal cross-line
3. **Humidity / greenhouse dome** — stroke, bell-with-base
4. **Pump / power arc** — stroke, `stroke-linecap:square`
5. **Warning triangle** — stroke + `circle r=0.9` dot, `#B5751F`
6. **Checkmark** — `2.2px` stroke, round caps

Non-SVG glyphs: `▾` caret (dropdowns), `＋` fullwidth plus (Pricing list), `←` (back links), `↓` (hero CTA), `·` separators, `—` em-dash for null readouts, `●` (live-tail active).

### C.4 Components the brief names that DO NOT EXIST in the handoff

| Brief item | Reality |
|---|---|
| **Modal / bottom sheet** | ❌ **Zero modals in 19 files.** Confirmations are *inline typed-confirmation rows* (type "Greenhouse 1" / "Kwame Asante"). No overlay, no scrim, no sheet. Building one = net-new design |
| **Empty state** | ⚠️ Only **one**: the dashed "Add a device" tile. No empty-table, zero-device, or no-results states designed |
| **Time-range selector** | ✓ Exists but on **1 screen only** (Dashboard: 12h/24h/48h/Week/Month) |
| **Pill tabs** | ✓ Exists as 3 distinct mechanisms (C.1 #15) — plus a 4th, the **underline tab bar** (Device Detail, 6 tabs, 2px `--color-leaf` bottom border) |
| **Custom dropdown** | ✓ 1 screen, 2 instances (Admin Devices List). README: prototype lacks click-outside-close; add in production |

---

## D. STATE COVERAGE CHECK

Three device states per the design system: **confirmed · pending · unknown/stale**.

### D.1 Screens with all three designed ✓

| Screen | How |
|---|---|
| **Device Dashboard** | Explicit 3-button switcher. Covers: pump dot colour + pulse anim, status text, button label + style, disabled reason copy, page-level amber banner, connection dot/label, last-seen copy, and metric values collapsing to `—` |
| **Admin Device Detail → Live snapshot** | Explicit 3-button switcher. Covers: soil value → `—`, relay label (ON/Pending/Unknown), conn dot colour + pulse, conn label (`8s ago` / `Awaiting ack` / `4 min ago — stale`) |

Exact designed values, for reference:

| | confirmed | pending | unknown |
|---|---|---|---|
| dot | `#2F9D46` (on) / `rgba(20,35,25,.25)` (off) | `#E8A951` + `gg-pulse 1.4s` | `#AEB8AF`, no anim |
| status text | `Pump on` / `Pump off` | `Turning on… (up to 10s)` | `Unknown — last seen 4 min ago` |
| button | `Turn on/off pump`, enabled | `Sending command…`, disabled | `Control unavailable`, disabled |
| extra | — | indeterminate bar `gg-indeterminate 1.1s` | reason copy + page banner |

### D.2 Screens MISSING states ❌ — listed, not invented

| Screen | Has | Missing | Notes |
|---|---|---|---|
| **Devices List** | confirmed only | pending, unknown | Card hardcodes `Online` badge + `last seen 8s ago`. No stale-card design |
| **Live Demo** | confirmed only | pending, unknown | Hardcodes `Connected`. Public page — a stale device *will* happen |
| **Landing hero card** | confirmed only | pending, unknown | Hardcodes `Connected` |
| **Admin Devices List** | Online, Unclaimed | pending, **Offline**, **Never reported**, **Disabled** | The filter dropdown offers all 6 statuses; only 2 have a designed row |
| **Fleet Overview** | confirmed only | pending, unknown | Live strip hardcoded. Counts for offline/never-reported/alerting exist but all render `0`, so their non-zero treatment is unproven |

### D.3 Other undesigned states

| Gap | Evidence | Why it matters |
|---|---|---|
| **MANUAL mode** | Device Dashboard hardcodes `const mode = isUnknown ? 'AUTO' : 'AUTO';` — MANUAL never renders | README, How It Works copy, and Phase 4's interlock spec all require rejecting commands in MANUAL with a stated reason. The mode pill and rejection copy are **undesigned**. This is the most material gap |
| Pending in list/card context | — | Only hero/detail contexts have pending |
| Empty tables | — | All 5 tables have rows hardcoded |
| Zero-device account | — | Devices List assumes ≥1 device |
| Loading / skeleton | — | None anywhere |
| Form validation errors | Only claim-code (4 states) + OTP (2 states) | Login, Alerts, Settings, Pricing, Contact, Provision forms have no error states |
| Network failure / offline UI | — | None |
| `support` role view | Device Detail only | README: destructive controls **removed from DOM**, not disabled. Only demoed on 1 screen |

---

## E. ASSET AUDIT

### E.1 Fonts — 4 families, currently CDN

| Family | Weights needed | Self-host via |
|---|---|---|
| Bricolage Grotesque | variable `opsz 6..96`, `wght 500..800` | `next/font/google` ✓ |
| Newsreader | italic 400 (*500 loaded, unused*) | `next/font/google` ✓ |
| Public Sans | 400, 500, 600, 700 | `next/font/google` ✓ |
| IBM Plex Mono | 500, 600 | `next/font/google` ✓ |

Handoff uses 3 different Google Fonts URLs (some screens omit Newsreader / Public Sans). `next/font` self-hosting makes this uniform and removes the render-blocking request — required for the 3G constraint.

### E.2 Images — 4 shipped, 1 redundant, 1 slot empty

| File | Size | Used by | Status |
|---|---|---|---|
| `hero-field-2.jpg` | 92,362 B | Landing hero | ✓ used |
| `hero-field.jpg` | 92,362 B | — | ⚠️ **Exact duplicate** of `hero-field-2.jpg` (md5 `066c3f34…` both). Unreferenced → drop |
| `footer-greenhouse.jpg` | 100,201 B | Landing CTA/footer band | ✓ used |
| `login-greenhouse.jpg` | 256,028 B | Login right panel (`opacity:.55`) | ✓ used — largest file, needs optimisation for 3G |

**Empty image slot needing a real asset:**
- `#device-photo` on How It Works — `placeholder="Drop a photo of the device / sensor probe"`, `shape="rounded" radius="20"`, `aspect-ratio:4/5`. **No src.** Genuine gap.

Per README all photography is placeholder/stock → real product photography needed for production.

### E.3 Missing assets

- **No favicon**, no app icon, no OG/social image. Logo Options ends each turn suggesting "show favicon crops" — never produced. Derivable from the 2b droplet mark.
- **`support.js` / `image-slot.js`** — referenced by all 19 files, **not shipped**. Design-tool runtime; nothing to port.

### E.4 Icons

No icon library. 6 hand-drawn inline SVGs (C.3) + text glyphs. Recommend building as typed React components to preserve the 1.8px-stroke visual weight.

---

## F. BUILD PLAN

### F.1 Recommended phase breakdown — 9 phases (your 6, split)

I recommend splitting your Phase 2 and Phase 4, because each is 2–3× the size of the others.

| Phase | Scope | Deliverable | Commit |
|---|---|---|---|
| **0** | *(this document)* | `MANIFEST.md` | ✓ |
| **1** | Scaffold Next 16 + TS + Tailwind 4.3.3 · all §B tokens into `@theme` · 4 self-hosted fonts · 18 shared components · domain types · `/dev/tokens` | `/dev/tokens` renders every token + component in every state | ✓ |
| **2A** | Public: `/`, `/how-it-works`, `/live-demo`, `/pricing`, `/contact` | 5 routes | ✓ |
| **2B** | Auth: `/login` (2 tabs × 4 claim steps, 4 code states, 2 OTP errors) | 1 route, 9 reachable states | ✓ |
| **2C** | Tenant: `/devices`, `/devices/[id]`, `/devices/[id]/irrigation`, `/devices/[id]/alerts`, `/devices/add`, `/settings` | 6 routes | ✓ |
| **2D** | Admin: `/admin`, `/admin/devices`, `/admin/devices/[id]` (6 tabs), `/admin/devices/provision`, `/admin/account`, `/admin/audit` | 6 routes | ✓ |
| **3** | Prisma schema + migrations + the 10-day telemetry seed | Schema + seeded sample output | ✓ |
| **4A** | **Device auth regime**: `POST /api/telemetry` (API-key header, poll-response command delivery, TTL expiry). Interlocks: max-run, cooldown, daily cap, MANUAL rejection | curl → reading stored → pending command returned | ✓ |
| **4B** | **User auth regime**: session cookie, E.164 normalisation, Argon2id, progressive delay, timing-equalised failures, atomic claim redemption, alert hysteresis + quiet hours + SMS cap, SMS interface + console stub, audit logging. Wire all pages off mock data | Working app | ✓ |
| **5** | Responsive audit at 380/414/768/1024/1440 + a11y floor. Includes adding the mobile nav to the 15 screens lacking it | Fix list | ✓ |
| **6** | Manifest walk · bracket-syntax + raw-hex grep · 3-state verification · tenant_id provenance audit · build + typecheck · `README.md` · `DEVIATIONS.md` | Final review | ✓ |

### F.2 Where context will run out — and where to split

I have read all 19 handoff files in this window, which is the expensive part and is now done. My honest assessment:

- **Phase 1 fits comfortably** in the remaining window.
- **Phase 2A likely fits** after Phase 1.
- **Expect a context boundary around Phase 2B/2C.** Each batch needs the source screen's exact inline styles in view.

**Mitigation I propose, to be built during Phase 1:** a `handoff/` directory in the repo containing a distilled per-screen spec (exact style values, state tables, copy strings) extracted from each `.dc.html`. Then each Phase-2 batch only needs to load 5–6 small spec files rather than re-reading 25KB HTML. This is also what makes Rule 1 auditable in Phase 6 — the spec becomes diffable.

I will flag at every checkpoint when the window is filling, and propose the split point rather than degrading quality silently.

### F.3 Stack versions verified on this machine

`node v22.22.0` · `npm 10.9.4` · `git 2.49.0` · `docker 28.5.1` · **no local `psql`**
Latest on npm: `next@16.2.12` · `tailwindcss@4.3.3` (**v4 confirmed — CSS-first `@theme`, no `tailwind.config.js`, no `@tailwind` directives**) · `prisma@7.9.1`

Postgres will come from Docker Compose since `psql` isn't installed.

---

## G. DECISIONS — RESOLVED 2026-08-03

All eight rulings received. §A–§F above remain the factual record of what the handoff *contains*; this section records what we *decided*. Where a decision departs from the handoff it is marked **DEVIATION** and carries an ID in `DEVIATIONS.md`.

| # | Question | Ruling | Effect |
|---|---|---|---|
| **1** | The 10 missing/partial screens (§A.3) | **Build all 10** | Scope +10 routes. Every design choice on these pages logged. → **DEV-005** |
| **2** | Near-duplicate colours (§B.6) | **Collapse none** | All values kept as distinct tokens, verbatim. 3 ambers, 2 disabled greys, both border alphas (`.14` *and* `.16`), and both ramp/palette red-amber sets survive as separate tokens. Only `#fff`/`#ffffff` and `.14`/`0.14` normalise (casing/formatting, not design) |
| **3** | README vs HTML radius conflict (§B.11) | **README wins — 14px** | Inputs and *all* nav links become **14px**, overriding the 85 × `10px` inputs and 12px marketing nav links the HTML renders. → **DEVIATION DEV-001** |
| **4** | Marketing nav inconsistency | **All pages get scroll behaviour** | Landing becomes the reference implementation; How It Works, Live Demo, Pricing, Contact gain the unscrolled→scrolled transition they hardcode away. → **DEVIATION DEV-002** |
| **5** | MANUAL mode copy (§D.3) | **Mirror the handoff's voice** | Button `Control unavailable`; reason `The switch on the device is set to MANUAL — the pump can only be controlled on site until it's set back to AUTO.` Uses the existing `modeLabel` pill + `modeDisabledReason` slot — markup already supports it. → **DEV-003** |
| **6** | Modal / bottom sheet (§C.4) | **Add modals, toasts, tooltips and all informatory UI needed** | Expanded past the handoff, which contains none of these. Built in the handoff's visual language from §B tokens only. → **DEVIATION DEV-004** |
| **7** | Postgres | **User supplies `DATABASE_URL`** | No `docker-compose.yml`. I ship `.env.example`, schema, migrations and seed; connection string comes from you before Phase 3 runs |
| **8** | `hero-field.jpg` duplicate | **Drop it** | Only `hero-field-2.jpg` ported |

### G.1 Navigation placement for the 10 new routes (ruling #1 + minimal-extension)

| Route | Area | Entry point |
|---|---|---|
| `/admin/login` | auth | Direct URL + redirect from admin routes when unauthenticated |
| `/forgot-password` | auth | Existing `Forgot password?` link on `/login` (currently `href="#"`) |
| `/set-password` | auth | Post-OTP step of the forgot-password flow |
| `/devices/[id]/history` | tenant | "View full history" from the dashboard chart — **not** a new nav item |
| `/devices/[id]/calibration` | tenant | Existing `Re-run calibration` link on `/settings` + post-claim "Calibration starts next" |
| `/notifications` | tenant | **New tenant nav item** — "Notifications" |
| `/admin/tenants` | admin | **New admin nav item** — "Tenants" |
| `/admin/tenants/[id]` | admin | Row link from `/admin/tenants` |
| `/admin/commands` | admin | Fleet-wide command log — linked from Fleet Overview activity feed |
| `/admin/sms` | admin | **New admin nav item** — "SMS log" |
| `/admin/config` | admin | **New admin nav item** — "Config" |

Net-new nav items: **1 tenant** (Notifications) + **3 admin** (Tenants, SMS log, Config). Everything else reuses an existing in-copy link. → **DEV-006**

### G.2 Consequent additions to Phase 1

Beyond the 18 shared components in §C.1, ruling #6 adds an informatory-UI layer with no handoff reference. Built from §B tokens, logged as **DEV-004**:

`<Modal>` (+ scrim, focus trap, ESC/click-outside, `≤viewport` height) · `<BottomSheet>` (mobile variant of Modal below 760px) · `<Toast>` + provider (success / warn / danger / info) · `<Tooltip>` (keyboard + touch accessible) · `<InlineHint>` · `<Skeleton>` · `<EmptyState>` (generalised from the one designed instance) · `<Pagination>` (the 5 tables have no designed pagination) · `<ConfirmDialog>` (wraps the handoff's typed-confirmation pattern *inside* a Modal, preserving the type-to-confirm requirement)

---

*Phase 0 closed. Proceeding to Phase 1 on these rulings.*
