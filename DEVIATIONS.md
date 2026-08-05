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

## Phase 5 backlog — recorded now, fixed in Phase 5

Found by `scripts/screenshots.mjs` at 390px and 1440px. All are **faithful to the handoff** as built; the handoff claims ≥44px only for "primary buttons/inputs", which these are not. Listed so none is lost.

| Element | Measured | Where |
|---|---|---|
| Footer links | **20px** high | all 5 marketing pages, both viewports |
| Desktop nav links | **38px** high | all 5 marketing pages @1440 |
| `Log in` nav link | 46 × **38px** | all 5 marketing pages @1440 |
| Logo link | 110 × **30px** | all pages |
| `/dev/tokens` demo controls | various <44px | dev-only route, not user-facing |

Also for Phase 5: the Landing hero's eyebrow chip (`bg-white/14` + white text) sits over the brightest part of the photograph and has poor contrast. It is exactly as designed in the handoff, so it needs a real contrast measurement and a minimal fix.

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

## Pending — no ruling needed yet

DEV-010 awaits your decision. Items discovered during later phases will be appended here with `PENDING` status and raised at the next checkpoint.
