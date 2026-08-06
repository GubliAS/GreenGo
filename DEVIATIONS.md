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

## DEV-009 — Ghost-button padding moved into the component

**Status:** APPLIED (Phase 2A)
**Type:** Faithful implementation of a detail that could not be expressed inline

The handoff gives ghost buttons on photography **less** vertical padding than the primary button beside them, so their 1.5px border does not make them taller:

| Context | primary | ghost | designed result |
|---|---|---|---|
| Landing hero | `14px 26px` | `12.5px 24px` + 1.5px border | equal height |
| Landing CTA band | `15px 28px` | `13.5px 26px` + 1.5px border | equal height |

Tailwind's spacing multiplier rejects the 3-decimal values these need (`py-3.125` and `py-3.375` generate no CSS — a silent failure). Added `--spacing-ghost-md: 12.5px` and `--spacing-ghost-lg: 13.5px`, applied inside `Button` when `variant="ghostOnPhoto"`.

Also fixed: `border-0` was being applied unconditionally in `Button`, which would have stripped the border from the `ghostOnPhoto` and `outline` variants.

**No visual deviation** — this makes the handoff's intent reproducible rather than changing it.

---

## DEV-010 — Handoff photography is too low-resolution for full-bleed use

**Status:** PENDING — needs your decision
**Type:** Asset quality

| File | Intrinsic size | Rendered at 1440 | Upscale |
|---|---|---|---|
| `hero-field.jpg` | 735 × 490 | 1400 × 680 | **~2.5×** |
| `footer-greenhouse.jpg` | 736 × 414 | 1400 × 595 | **~2.5×** |
| `login-greenhouse.jpg` | 704 × 1024 | half-screen panel | acceptable |

The two full-bleed marketing photos are being upscaled roughly 2.5× on desktop, and more on a 2× device. They will read visibly soft. At 390px wide they are fine.

The handoff README already says these are "placeholder/stock-style photos; replace with real product photography in production", so this is expected — but it is worth stating as a measured number rather than a general note, because it affects the marketing site's perceived quality most on the largest screens.

**Options:** (a) ship as-is and replace with real photography later; (b) constrain the hero's max height so the upscale factor drops; (c) source higher-resolution stock for the demo. **No action taken** — awaiting your call. Detected automatically by `scripts/screenshots.mjs`, which now flags any image rendered >1.25× its intrinsic width.

---

## Phase 5 — responsive audit + a11y floor, final accounting

Tested at 380/414/768/1024/1440 via `scripts/screenshots.mjs` (Playwright), full-page screenshots + computed-layout assertions on every route. Protected routes were reached with a session JWT minted locally (matching `lib/session.ts`'s exact format) rather than a real login — see the verification-method note at the end of this section for why, and for the one class of page this couldn't reach.

### Fixed

**H-OVERFLOW at 768px — MarketingNav, AppTopBar, AdminTopBar (real bug, not a deviation).** All three top bars' desktop nav-links `<div>` is a `flex-1` flex child containing `white-space:nowrap` links; a flex child doesn't shrink below its content's natural width by default (`min-width:auto`), so at the narrow end of the desktop breakpoint (760–820px) the links collectively need more room than the bar has, and the rightmost items (login+button on marketing, or the whole row on admin/app) get pushed past the container — and the viewport — edge. The handoff's own source HTML already specifies the fix on this exact div (`flex:1;overflow-x:auto;white-space:nowrap`, verbatim in `GreenGo Landing Page.dc.html` / `GreenGo Devices List.dc.html` / `GreenGo Admin Fleet Overview.dc.html`) — I had dropped `overflow-x:auto` and its required companion `min-width:0` when porting to Tailwind. Restored on all three top bars: `min-w-0 overflow-x-auto` added to the links `<div>`. This is a faithful-porting fix, not a new deviation.

**Login/Claim tabs below 44px (`SlidingTabs`).** The handoff's literal `padding:9px 10px` renders these tabs at ~37px tall. They're a primary control (they switch the entire form mode) and the handoff's own README states "Touch targets are ≥44px on all primary buttons/inputs" — the explicit numeric requirement wins over an un-checked pixel value, the same reasoning as DEV-001. Added `min-h-11` to the tab buttons; visual padding/font untouched.

**Alerts and Config numeric/time inputs at 43px.** One pixel under the ≥44px floor from `py-2.5`. Bumped to `py-2.75` on both `/devices/[id]/alerts` and `/admin/config`.

**Logo link hit-area (all pages).** The visual mark is intentionally small (26×30 marketing / 22×26 app, per the handoff's brand sizing across all 19 screens) — inflating it would be a real design change. Instead added padding + a matching negative margin to the `<Link>` so the *clickable* area reaches 44px without enlarging the mark or shifting the surrounding flex row.

**Hero eyebrow chip contrast.** Measured (screenshot + visual check): white text on the handoff's literal `bg-white/14` glass chip, sitting over the brightest region of the hero photo (the scrim gradient is *thinnest* at the top, where this chip sits), reads well under WCAG AA. Unlike the low-resolution placeholder photography (DEV-010), this doesn't resolve itself when real photography arrives — a translucent white-on-white chip over an unconstrained photo crop is fragile by construction, not by asset quality. Changed the chip backdrop to `bg-canopy/45` (a dark, canopy-tinted glass) — same pill shape, same white text, contrast now guaranteed regardless of what's behind it.

### Reviewed and kept as designed — not a bug

The remaining touch-target findings are all **faithful to the handoff's own literal pixel values**, and the handoff's README states the ≥44px requirement specifically for "primary buttons/inputs" — these aren't that:

| Element | Measured | Reasoning |
|---|---|---|
| Footer links (marketing) | 20px tall | Decorative footer nav, handoff's own thin-text-link design; not a primary control |
| Desktop/app/admin nav links | 36–38px tall | Navigation, not "buttons/inputs"; already close to the floor and clearly tappable |
| `Remove` / `+ Add a recipient` / `Mark all as read` / `Change code` / back-links / `Forgot password?` | 16–19px tall | Secondary inline text actions throughout, matching the handoff's link-not-button treatment everywhere these appear |
| `RangePills`, `StateSwitcher`, `PillToggle` (role toggle), custom `Dropdown` filter buttons | 27–42px tall | Demo/secondary controls at their literal handoff padding (`5px 10px`, `7px 12px`); admin-side density is inherent to an operator tool, not a farmer-facing mobile surface |
| Admin/tenant avatar button | 34×34px | Matches the handoff's literal circular-avatar size on all 6 admin screens |
| `/dev/tokens` controls | various | Internal dev-only route, never shipped to a user |

This mirrors the reasoning already applied to DEV-001/DEV-003: where the handoff's literal pixels and its own stated requirement conflict, the requirement wins *for primary controls*; everything else stays faithful to the handoff as built.

### Accessibility floor — already in place, verified

- **Visible keyboard focus**: `:focus-visible { outline: 2px solid var(--color-leaf); ... }` — global, not in the handoff (which has none), added as the Phase-1 quality floor
- **`prefers-reduced-motion`**: global rule disables every `[data-gg-anim]` element plus a blanket transition-duration override — every animated element in the handoff carries `data-gg-anim="1"` specifically so this one rule can reach all of them
- **Labels tied to inputs**: `FormField` always renders a `<label htmlFor>` paired to the input's `id`
- **Alt text**: decorative photography (`hero-field.jpg`, `footer-greenhouse.jpg`, `login-greenhouse.jpg`) uses `alt=""` (correctly decorative — the surrounding heading/copy carries the meaning); no image conveys information alt text would need to carry

### Verification method — the 6 pages a session cookie alone can't reach

`middleware`/`proxy.ts` gates protected routes on a *session*, but 6 pages (`/devices`, `/devices/[id]`, `/settings`, `/admin`, `/admin/devices`, `/admin/account`) also call Prisma directly, which this environment's placeholder `DATABASE_URL` can't satisfy (see the Phase 3/4A notes above). These 6 were excluded from the automated Playwright pass — running them against a placeholder connection string doesn't fail fast per-request; it exhausts the pg pool's retry attempts and stops the *entire server* from responding, including unrelated routes, which is what caused the first audit attempt to time out completely.

Verified instead by (a) confirming all 6 use only shared, already-tested components (`AppTopBar`/`AdminTopBar` with the fixes above, `Card`, `DataTable`, the same `grid-cols-[repeat(auto-fit,minmax(...))]` pattern used throughout) with no page-specific custom CSS, and (b) grepping all 6 for arbitrary Tailwind values or raw hex — none found. Once `DATABASE_URL` points at a real Postgres, re-run `BASE=... OUT=... SESSION_SECRET=... VIEWPORTS=all node scripts/screenshots.mjs` with these 6 routes uncommented in `ALL_ROUTES` for full runtime confirmation.

---

## DEV-011 — --spacing-auth / --container-auth name collision (fixed)

**Status:** APPLIED (Phase 2B)
**Type:** Bug caught by driving the real page, not by reading code

`--spacing-auth` (the login column's fluid padding, `clamp(32px,6vw,96px)`) and `--container-auth` (600px max-width) shared the name `auth`. Tailwind v4 resolved `max-w-auth` against `--spacing-auth` instead of `--container-auth`, so the login form column rendered at **86.4px max-width instead of 600px** — text wrapped one word per line and the whole flow was visually broken.

Caught by actually loading `/login` in Playwright and measuring `getComputedStyle` — the build, typecheck, and every `grep`-based utility audit up to this point passed cleanly, because those checks confirm a class *emits some CSS*, not that it emits the *intended* CSS. A name collision between two theme namespaces is invisible to both.

**Fix:** renamed the container token to `--container-auth-form` → `max-w-auth-form`. Scanned every other `--spacing-*` name against every `--container-*` name — no remaining collisions (see commit).

**Process change going forward:** for every new page, load it in Playwright and spot-check computed layout (widths, not just presence) before considering it done — a visual screenshot alone would not have caught this, since the broken layout still "looked like a page," just a badly proportioned one on first glance.

---

## DEV-012 — Claimed/expired claim-code border reverts to green while focused

**Status:** PENDING backlog — Phase 5
**Type:** Faithful reproduction of a handoff CSS rule, flagged because it may be unintentional

The handoff's own inline CSS (`GreenGo Login.dc.html`, `GreenGo Add Device.dc.html`) has:
```css
input:focus{border-color:#2F9D46 !important}
```
This is unconditional — it overrides the claim-code field's red/amber error border while the input has focus, so a user actively editing an already-claimed or expired code sees a green (success-looking) border until they blur. The feedback box below the field still shows the correct error copy and colour throughout.

Reproduced exactly as designed. Flagging because a focus state that visually contradicts an error state below it is the kind of thing worth a deliberate call rather than an inherited accident — options are (a) leave as designed, (b) scope the `!important` focus rule to exclude erroring inputs in Phase 5's a11y pass.

---

## DEV-013 — Extrapolated status-pill tones for undesigned states

**Status:** APPLIED (Phase 2D), low-risk — cosmetic only
**Type:** Authorised expansion beyond the handoff (MANIFEST §D.2)

Two places needed tones for states the handoff's filter/status vocabulary lists but never designs a pill for:

| Field | Designed | Extrapolated (this pass) |
|---|---|---|
| `DeviceStatus` (Admin Devices List) | `online` (mint), `unclaimed` (warn) | `offline` → stone, `never_reported` → stone, `disabled` → danger |
| `CommandStatus` (Commands tables) | `confirmed` (mint), `failed` (danger) | `pending` → warn, `sent` → warn, `expired` → stone |

Reasoning: stone reads as "inert/neutral" (already used for MANUAL and other non-alarming inert states), warn reads as "in progress/needs attention" (already used for the pending pump state), danger is reserved for outcomes that are actually bad. No new colours — all four tones (mint/warn/danger/stone) already exist in `StatusPill`.

---

## Phase 3 note — migration verified offline, not against a live database

**Status:** informational, not a deviation
**Type:** verification method disclosure

Per ruling #7, no local Postgres was provisioned for this project — you're supplying `DATABASE_URL`. Docker Desktop was available on this machine but its daemon did not come up within a reasonable wait, so the schema could not be verified against a live database in this session either.

What WAS verified, and how:
- `prisma validate` — schema is syntactically and relationally valid
- `prisma generate` — the full Prisma Client generated successfully against the schema (this alone catches most relation/field errors)
- `prisma migrate diff --from-empty --to-schema` — generated the actual `CREATE TABLE`/`CREATE INDEX`/`ALTER TABLE ... ADD CONSTRAINT` SQL the schema engine would run, entirely offline (no DB connection needed for a diff against an empty baseline). Read line-by-line: both `@@index([deviceId, recordedAt(sort: Desc)])`-style indexes the brief requires are present as `DESC`-ordered composite indexes; every FK and unique constraint matches intent.
- `tsc --noEmit` on `prisma/seed.ts` against the **real generated Prisma types** — every field name, relation name, and enum value used in the seed script is checked against the actual schema, not assumed.
- The soil-moisture timeline generator was extracted and run standalone (no DB) across multiple random seeds. This caught two real bugs before they ever reached a database: the pump-rise rate was too small to ever reach saturation (soil oscillated 30–40% forever), and the fixed-index MANUAL-rejection window missed its target entirely (0 failed cycles in every run). Both are described in `prisma/seed.ts`'s doc comment on `buildSoilTimeline`.

What was **not** verified: an actual `prisma migrate dev` / `db:seed` run against a running Postgres. Run `npm run db:migrate && npm run db:seed` once `DATABASE_URL` is set — the migration is pre-generated at `prisma/migrations/20260805000000_init/`, so `migrate dev` should apply it directly rather than recomputing a diff.

---

## Phase 4A note — device endpoint verified by typecheck + logic trace, not a live run

**Status:** informational, not a deviation
**Type:** verification method disclosure (Docker still unavailable — see the Phase 3 note above)

`POST /api/telemetry`, `lib/commands.ts`, `lib/alerts.ts`, `lib/sms.ts`, and `lib/device-auth.ts` all typecheck cleanly against the real generated Prisma types (same evidentiary weight as Phase 3's seed script check — every field name, relation, and enum value used is checked against the actual schema). The full request handler was manually traced end-to-end for each interlock path (disabled device, MANUAL rejection, cooldown, daily cap, TTL expiry, SENT→CONFIRMED/FAILED reconciliation) but not executed against a live Postgres.

**Simplification, not a bug:** quiet hours are a fleet-wide default read from `QUIET_HOURS_START_HOUR`/`QUIET_HOURS_END_HOUR` env vars, not the per-device values the tenant Alerts page UI displays (9:00 PM–5:30 AM in the mock). The schema has no per-tenant quiet-hours column yet — adding one is a small follow-up, not a redesign, when this is verified live.

Once `DATABASE_URL` is set and migrated/seeded, verify with:
```
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -H "X-Device-Mac: A4:CF:12:8E:3B:01" \
  -H "X-Device-Api-Key: ggk_4f9a2c8b1e6d3f7a2c8b1e6d3f2a" \
  -d '{"soilRaw":420,"tempC":26.5,"humidityPct":61,"relayOn":false,"mode":"AUTO","signalDbm":-62,"batteryV":3.9}'
```
(API key matches the seed script's `device` record — see `prisma/seed.ts`.)

---

## Phase 4B — scope decisions on data-layer wiring

**Status:** informational — reporting what was skipped and why, per the working rules
**Type:** scope decision, not an oversight

"Wire all pages off mock data" spans ~24 routes. Given the remaining phases (5: responsive audit, 6: final verification + README) still needed real time in this session, I prioritised depth on the interactions the brief calls out explicitly, over breadth across every read page. What's real vs. what's still Phase 2 mock data:

### Fully wired (real session, real Prisma queries, real writes)
- **Session infrastructure**: `lib/session.ts` (signed httpOnly JWT cookie, jose/Edge-compatible), `proxy.ts` (route protection — tenant area requires a tenant session, admin area requires an admin session, redirect-with-`from` on failure)
- **Login**: `/login` (tenant, phone+password) and `/admin/login` (admin, email+password) — both call real endpoints with progressive delay + no-enumeration behaviour
- **Logout**: every "Log out" control (`LogoutLink`) now actually clears the session and audits the event
- **Claim redemption**: `/login`'s claim tab (`/api/auth/register`) and `/devices/add` (`/api/auth/claim-device`) — both atomic (`updateMany` with an unconsumed/unexpired WHERE clause), both check phone/tenant ownership server-side
- **Device provisioning**: `/admin/devices/provision` (`/api/admin/devices/provision`) — the admin-side counterpart to claim redemption
- **Pump control**: the Device Dashboard's toggle (`/api/devices/[id]/pump`) — the flagship interaction, running through every interlock in `lib/commands.ts`
- **Reads**: `/devices` (tenant's own devices), `/devices/[id]` (single device + latest reading + 24-point chart, ownership-checked), `/settings` (real session user), `/admin` (fleet-wide counts, live strip, activity feed, SMS spend — all real aggregates), `/admin/devices` (real device rows + real tenant names), `/admin/account` (real admin user)

### Still Phase 2 mock/static data — not wired this pass
- `/devices/[id]/alerts`, `/devices/[id]/calibration`, `/devices/[id]/history`, `/devices/[id]/irrigation`, `/notifications` — reads stay on their Phase 2C mock data; none of these have a write path either (Alerts' "Save thresholds" was already non-functional in Phase 2 — the handoff designs no validation states for these forms)
- `/admin/devices/[id]` (all 6 tabs), `/admin/tenants`, `/admin/tenants/[id]`, `/admin/commands`, `/admin/sms`, `/admin/config`, `/admin/audit` — all still render their Phase 2D mock rows
- Settings' and Admin Account's "Save changes" buttons are not wired to a write endpoint

None of the skipped pages needed new UI work — they were already built in Phase 2 to spec. The gap is purely "reads from a mock array" vs. "reads from Prisma." Converting each remaining page follows the exact pattern already established four times over (`/devices`, `/devices/[id]`, `/admin`, `/admin/devices`): make the page an async Server Component, call `db.<model>.findMany/findFirst` scoped by session, map to the same prop shapes the Phase 2 components already expect.

### OTP verification remains client-side mocked
Every claim/register flow keeps the Phase 2 mock OTP (`1234` verifies, `9999` expires, anything else fails) rather than a real SMS-delivered one-time code. Building real OTP requires a storage table (code, expiry, attempt count), delivery through `lib/sms.ts`, and resend-cooldown enforcement server-side (the client-side 30s timer today is trivially bypassable). The claim code redemption and account creation *behind* the OTP step are fully real — this only affects proof-of-phone-ownership fidelity, not data integrity.

---

## Phase 6 — final verification

### 1. Manifest walk — every row built, routed, and (almost) reachable

All 29 product routes from `MANIFEST.md` §A + §G.1 exist as `page.tsx` files and were cross-checked against the file tree — none missing, none extra (`/dev/tokens` is the one non-product route, a Phase 1 deliverable). Reachability checked by tracing every incoming `href`/`Link`:

| Route | Reachable from |
|---|---|
| All 4 marketing sub-pages, 5 tenant nav items, 5 admin nav items | `MarketingNav`/`AppTopBar`/`AdminTopBar`'s `LINKS` arrays |
| `/devices/[id]`, `/admin/devices/[id]`, `/admin/tenants/[id]` | Row/card links on their respective list pages |
| `/devices/[id]/calibration` | Settings' "Re-run calibration" |
| `/devices/[id]/history` | Device Dashboard's "View full history" |
| `/devices/add` | Devices List's empty-state "I have a claim code" |
| `/admin/devices/provision` | Admin Devices List's "+ Provision device" + unclaimed-row links |
| `/forgot-password` | Login's "Forgot password?" |
| `/admin/login` | No explicit link anywhere (admins aren't part of the public marketing audience) — reached by `proxy.ts` redirecting any unauthenticated `/admin/*` request there. Typed-URL/bookmark entry, same as most internal admin tools. |

**One genuine gap: `/set-password` has no caller.** It was built per DEV-005 for "a session that needs a password set without the full claim flow — e.g., a tenant invited directly by an admin" — but that invite flow doesn't exist, so nothing currently links here. The password-reset flow that DOES exist (`/forgot-password`) built its own final step inline rather than redirecting to this page. Reporting as instructed rather than manufacturing a link to a feature that isn't built: `/set-password` is real, functional, tested infrastructure sitting unlinked until an admin-invite flow is added.

### 2. Arbitrary Tailwind values / raw hex — 7 found, all fixed; 0 remain

`grep -rnE '\b[a-z-]+-\[[^]]+\]'` across `app/`, `components/`, `lib/` (excluding the one legitimate `grid-cols-[repeat(...)]` CSS function) found 7 arbitrary-value escapes, all missing tokens rather than deviations:

| Found | Fixed as |
|---|---|
| `backdrop-blur-[14px]` (hero card), `backdrop-blur-[10px]` (scrolled nav) | New `--blur-hero`/`--blur-nav` theme tokens → `backdrop-blur-hero`/`backdrop-blur-nav` |
| `top-[calc(100%+8px)]` (ProfileMenu), `top-[calc(100%+6px)]` (Dropdown, Tooltip ×2) | New `--spacing-menu-gap`/`--spacing-menu-gap-lg` tokens + `@utility top-menu-gap`/`top-menu-gap-lg`/`bottom-menu-gap` |
| `max-h-[92vh]`/`max-h-[85vh]` (Modal — DEV-004, no handoff reference) | `@utility max-h-modal-mobile`/`max-h-modal-desktop` (viewport-relative, so it can't live in the `--spacing-*` px/rem scale like everything else) |

Raw hex (`grep -rnE '#[0-9a-fA-F]{3,8}\b'`) found hits only in `/dev/tokens`' own reference-data arrays (the whole point of that route is to display every hex value against its token name) and in code comments documenting the ramp math — zero hits in actual applied styles. Not violations.

### 3. Three device states — verified live, one real bug found and fixed

Drove `/admin/devices/gh-1`'s Live Snapshot tab through all three states with a scripted click-through (session-only page, no live DB needed). Confirmed/Pending/Unknown all render distinctly and correctly for soil moisture, relay, and last-seen — **except** the connection dot on "Confirmed" rendered the pump's dim "off" grey instead of leaf green.

**Root cause:** `StateDot`'s `confirmed` colour depends on an `on` prop meant to distinguish pump-on from pump-off-but-connected (correct for `PumpControl`'s pump dot). `DeviceDetailTabs`' connection dot reused the same component without passing `on`, silently defaulting to `on=false` → confirmed rendered as "off" grey instead of connected green. Caught by literally clicking through the states and looking, not by reading the code — exactly the class of bug DEV-011 already warned reads well but tests wrong.

**Fix:** changed `StateDot`'s `on` default from `false` to `true` — a bare connection dot means "confirmed = connected = green" with no pump concept involved; `PumpControl` is unaffected since it always passes `on={pumpOn}` explicitly, and an explicit prop overrides a default regardless of what the default is. Verified both call sites after the fix: connection dot now green when confirmed, pump dot's on/off distinction unchanged.

The Device Dashboard's own three-state switcher (the other page with full 3-state coverage per MANIFEST §D.1) requires a live device row and couldn't be click-tested this session (see the Phase 5 verification-method note); its state-branching logic was read end-to-end in Phase 2C/4B and mirrors the now-fixed pattern exactly, using its own dedicated `pumpDotColor`/`pumpDotAnim` variables rather than `StateDot`, so it was never exposed to this particular bug.

Devices List and Fleet Overview remain confirmed-only per the handoff's own design gap (MANIFEST §D.2, not something Phase 4-6 was tasked to invent) — Phase 4B added a real online/offline distinction to both from live `lastSeenAt` data, which is more than the handoff itself designs, but not the full three-state vocabulary.

### 4. tenant_id provenance — audited, clean

Every `tenantId` in `app/api/**/*.ts` traces to one of: `session.tenantId` (the authenticated session), a `Tenant` row just created in the same request (registration), or a `Device`/`User` row looked up server-side by a server-verified identifier (device API key, phone number) — never `request.json()`, `searchParams`, or route `params`. All three tenant-scoped pages (`/devices`, `/devices/[id]`, `/settings`) call `requireTenantId(session)`, the single enforcement point in `lib/db.ts` that throws rather than returning a fallback. Admin pages read `device.tenantId` only for display/filtering on an already-fetched fleet-wide row — never as a scope filter, since admin is deliberately not tenant-scoped.

### 5. Build and typecheck

`npx tsc --noEmit` clean and `npx next build` clean throughout every phase of this build — checked after every batch, not just at the end (see each phase's commit message). Final Phase 6 rebuild after the token/StateDot fixes above: clean.

### 6. README.md

See `README.md` — setup, env vars, migration/seed commands, a curl walkthrough for the device endpoint, and the demo path.

---

## DEV-014 — PWA support (installable, offline app-shell)

**Status:** AUTHORISED (2026-08-06, requested directly)
**Type:** Authorised expansion beyond the handoff — the handoff has no PWA artifacts at all (no manifest, no service worker, no icons)

Added on request, given the product's own stated audience (Ghanaian smallholder farmers on Android, frequently on 3G) is exactly who install-to-homescreen and an offline app shell serve best.

- **`app/manifest.ts`** — Next's native manifest convention, auto-linked into every page's `<head>`. `start_url: "/devices"` (the tenant's real landing point once installed, not the marketing site). `theme_color`/`background_color` from the existing brand tokens (`--color-canopy` / white).
- **Icons** — `app/icon.tsx` (32×32 favicon) and `app/apple-icon.tsx` (180×180) use Next's automatic icon convention; `app/icon-192.png/route.tsx` and `app/icon-512.png/route.tsx` are explicit routes for the manifest's `icons` array (that convention only wires up `<link>` tags, not the manifest). All four render from one shared helper, `lib/appIcon.tsx`, using `next/og`'s `ImageResponse` — the exact droplet-mark geometry from `components/icons.tsx`'s `DropletMark` (viewBox `0 0 72 84`, the chosen "2b" option from GreenGo Logo Options), on a solid canopy-green tile with ~14% inset so the mark stays inside the safe zone a maskable icon's OS-applied mask can clip into. `ImageResponse`/satori can't read CSS custom properties, so these are the theme's raw hex values (`#17352A`/`#2F9D46`/`#EAF7EE`) written directly — the one place in this codebase hex literals belong outside `globals.css` and `/dev/tokens`, for the same reason those two are exempted in the Phase 6 raw-hex audit.
- **`public/sw.js`** — hand-written, not a plugin (`next-pwa`'s Turbopack support isn't reliably solid, and this app's caching needs don't warrant a Workbox dependency). Cache-first for static assets, network-first-with-offline-fallback for page navigations, and **`/api/*` is never intercepted at all** — telemetry, pump commands, and auth need the real device/session state on every single request; caching any of them would be actively wrong, not just stale. `app/offline/page.tsx` is the precached fallback shown when a navigation fails with nothing cached.
- **`components/PwaRegister.tsx`** — a render-nothing client component, mounted once in `app/layout.tsx`, that registers the service worker post-hydration.

Verified: typecheck clean, build clean (`/icon`, `/apple-icon`, `/manifest.webmanifest`, `/icon-192.png`, `/icon-512.png`, `/offline`, `/sw.js` all present and correctly typed/served), and the generated icons fetched and visually confirmed — correct mark, correct colours, safe-zone padding intact at both 192 and 512px.

---

## Pending — no ruling needed yet

DEV-010 (photography upscale) awaits your decision. Everything else raised during the build was either fixed inline or logged above as a scope decision — see each phase's section for detail.
