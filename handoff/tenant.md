# Handoff spec — TENANT pages (Batch 2C)

Shared: `AppTopBar` (white, 1px `--color-hairline` bottom border, `px-topbar-x py-4`),
body bg `--color-app`. Copy verbatim.

Device id used in routes: `gh-1` (seeded `Greenhouse 1`).

---

## 1. Devices list → `/devices`   (GreenGo Devices List.dc.html)

`AppTopBar active="devices"`. **This is the reference implementation for the app
top bar's mobile variant.**

Page `p-devices-page` (`clamp(24px,4vw,48px)`):
- Header `flex justify-between items-baseline mb-6 flex-wrap gap-3`:
  - `PageTitle size="lg"` (26px) → `Your greenhouses`
  - `text-body text-muted` → `1 device`
- Grid `grid minmax(300px,1fr) gap-4.5 max-w-app` (1100px):

**Device card** — an `<a>` to `/devices/gh-1`, `bg-white border-hair border-hairline rounded-card p-6 flex flex-col gap-4 text-inherit`:
- Row `flex justify-between items-start`:
  - Left: `text-xl text-canopy` w700 mb `4px` → `Greenhouse 1`; `text-meta text-muted` → `KNUST · installed 2 months ago`
  - Right: `StatusPill tone="mint" dot size="md"` → `Online`
- `SegmentedBar count=16 height=24 surface="app" radius="sm"` percent `38`
- Row `flex justify-between items-center text-sm text-ink`:
  - `Soil ` + `<strong class="text-canopy font-mono">38%</strong>` + ` · last seen 8s ago`
  - `text-muted` → `No active alerts`

**Add-device tile** — `EmptyState`:
- title `Add a device`
- body `You already have an account — just enter the claim code for the next greenhouse.`
- action link `/devices/add` `text-sm text-leaf` w600 → `I have a claim code`

**State coverage:** confirmed only. No pending/unknown card design (MANIFEST §D.2).

---

## 2. Device dashboard → `/devices/[id]`   (GreenGo Device Dashboard.dc.html)

`AppTopBar active="devices"`. **All three states designed — the reference screen.**

Page `p-page flex flex-col gap-4.5 max-w-wide mx-auto` (1200px):

### 2.1 Header row `flex justify-between items-end flex-wrap gap-3`
- Left: `BackLink href="/devices"` → `← All devices`; `PageTitle` (24px) mt `6px` → `Greenhouse 1`
- Right: `StateSwitcher` — options `Confirmed` / `Pending` / `Unknown` (mock toggle; Phase 4 derives from `lastSeenAt`)

### 2.2 Stale banner — **only when state === unknown**
`AlertBanner tone="warn" icon live="alert"`:
> `Device hasn't reported in 4 minutes. Readings below are the last known values, not live.`

*(Handoff interpolates `{staleMinutes}` = 4.)*

### 2.3 Two-column grid `grid minmax(300px,1fr) gap-4.5`

**Left: hero card** `Card variant="hero"` `flex flex-col gap-4.5`:
- Header `flex justify-between items-center`:
  - `font-mono text-caption text-muted uppercase tracking-caps` → `Soil moisture`
  - Connection: `flex items-center gap-1.5 text-meta` w600 + 6px dot. `unknown` → `text-faint` / `Offline`; else `text-leaf` / `Connected`
- `flex items-baseline gap-3.5`: `font-mono text-64 text-canopy leading-none` w600 → `{percent}%`; `text-lg text-ink` w600 → `{describeMoisture(percent)}`
- `SegmentedBar count=24 height=40 surface="app" radius="lg"`
- `text-meta text-muted` → last-seen label:
  - `unknown` → `Last reading 4 min ago — treat as stale`
  - else → `Last updated 6s ago`
- **History block** — `border-t border-hairline pt-4.5 flex flex-col gap-3.5`:
  - Row `flex justify-between items-center`: `text-sm text-canopy` w600 → `Moisture, last 24h`; `RangePills` options `12h` `24h` `48h` `Week` `Month` (default `24h`)
  - `MoistureChart height={64}` — 24 bars. Handoff formula:
    `h = 22 + round(sin(i/2.4)*14 + (i%5)*3)`, clamped 8–100; colour `rampRgb(h/100)`
  - ⚠️ Add a link to `/devices/[id]/history` here (DEV-005 entry point — the handoff has no such link)

**Percent values:** `unknown` → `24`; otherwise → `38`.

**Right column** `flex flex-col gap-3.5`:
- `PumpControl` (component built in Phase 1 — covers all 4 branches incl. MANUAL)
  - Handoff `Mode:` pill always reads `AUTO`; MANUAL now reachable per DEV-003
- Metrics card `Card variant="compact"` `grid minmax(130px,1fr) gap-3.5`, 4 × `MetricReadout`:
  | Label | confirmed/pending | unknown |
  |---|---|---|
  | `Air temp` | `26.5°C` | `—` |
  | `Humidity` | `61%` | `—` |
  | `Light` | `820 lx` | `—` |
  | `Battery` | `3.9V` | `3.4V` ← note: **not** em-dashed |

  ⚠️ Light is provisional (LDR). README: the grid "must degrade gracefully to 3 metrics". Build it so a null `lightLux` drops the tile rather than showing `—`.

---

## 3. Irrigation log → `/devices/[id]/irrigation`   (GreenGo Irrigation Log.dc.html)

`AppTopBar active="irrigation"`. Page `p-page flex flex-col gap-4.5 max-w-table mx-auto` (1000px).

- `PageTitle` → `Irrigation log — Greenhouse 1`
- `DataTable minWidth={640}` density `comfortable`, columns:
  `Started 1.1fr` · `Duration 1fr` · `Trigger 0.8fr` · `Stop reason 1.3fr`
- Rows (verbatim, 6):

| Started | Duration | Trigger | Stop reason |
|---|---|---|---|
| `Today, 6:14 AM` | `4m 20s` | AUTO | `Soil reached 70% — target saturation` |
| `Yesterday, 9:02 PM` | `2m 05s` | MANUAL | `Stopped by user from dashboard` |
| `Yesterday, 6:10 AM` | `5m 40s` | AUTO | `Soil reached 68% — target saturation` |
| `2 days ago, 6:12 AM` | `4m 55s` | AUTO | `Soil reached 71% — target saturation` |
| `3 days ago, 2:30 PM` | `1m 10s` | MANUAL | `Stopped — physical switch set to MANUAL` |
| `4 days ago, 6:08 AM` | `6m 02s` | AUTO | `Soil reached 69% — target saturation` |

Cells: Started `tone="canopy"`; Duration `tone="canopy" mono`; Trigger → `StatusPill tone={AUTO?'mint':'stone'}`; Stop reason `tone="ink"`.

**No empty state designed** — add one via `EmptyState` and log it.

---

## 4. Alerts & thresholds → `/devices/[id]/alerts`   (GreenGo Alerts.dc.html)

`AppTopBar active="alerts"`. Page `p-page flex flex-col gap-4.5 max-w-form-wide mx-auto` (800px).

- `PageTitle` → `Alerts & thresholds — Greenhouse 1`

**Card 1 — Soil moisture** `Card` `flex flex-col gap-4.5`:
- `CardTitle` → `Soil moisture`
- Field label → `Alert when soil drops below`; then `flex items-center gap-2.5`: input `w-20` `size="xs"` `mono` value `30`, then `text-base text-muted` → `%`

**Card 2 — Temperature & humidity bands**:
- `CardTitle` → `Temperature & humidity bands`
- `grid minmax(180px,1fr) gap-4`:
  - `Temp min / max (°C)` → two inputs `flex gap-2`, `size="xs" mono`, values `18` / `32`
  - `Humidity min / max (%)` → two inputs, values `40` / `85`

**Card 3 — SMS recipients** `flex flex-col gap-3.5`:
- `CardTitle` → `SMS recipients`
- Rows `flex flex-col gap-2.5`, each `flex justify-between items-center px-3.5 py-2.5 bg-app rounded-tile`:
  - `+233 24 XXX XX01 (you)` / right `text-caption text-muted` → `Primary`
  - `+233 20 XXX XX45` / right link `text-caption` w600 → `Remove`
- Link `text-sm` w600 `self-start` → `+ Add a recipient`

**Card 4 — Quiet hours** `flex flex-col gap-3.5`:
- `CardTitle` → `Quiet hours`
- Para `text-sm text-muted` → `No SMS sent in this window, unless soil is critically dry.`
- `flex gap-3 items-center`: input `w-27.5` value `9:00 PM`; `text-muted text-sm` → `to`; input `w-27.5` value `5:30 AM`

Then `Button primary size=md self-start` → `Save thresholds`

⚠️ **No validation error states designed** for any of these numeric fields.
Hysteresis (`clearThreshold`) and the daily SMS cap exist in the Phase 3 schema
but have **no UI in the handoff** — do not invent controls; note the gap.

---

## 5. Add a device → `/devices/add`   (GreenGo Add Device.dc.html)

`AppTopBar active="devices"`. Page `p-page max-w-narrow mx-auto` (520px).

- `BackLink href="/devices"` → `← All devices`
- Step `form`:
  - `PageTitle` margin `14px 0 8px` → `Add a device`
  - Para `text-base text-muted` margin `0 0 24px` → `This links a new greenhouse to your existing account — no new login needed.`
  - `Card` `flex flex-col gap-2.5`: `ClaimCodeField` + hint + button `Add device`
  - ⚠️ **Different prototype code from Login**: `GG-9K21-P4` is valid here (`GG-4F82-K1` is already claimed in this scenario). Hint:
    > `Prototype codes — GG-9K21-P4 valid · GG-1111-11 already claimed · GG-2222-22 expired · anything else not recognised.`
- Step `success`: `Card` pad `32px` with `SuccessPanel` (h2, `text-21`):
  - title `Device added`
  - body `Greenhouse 2 is linked to your account. Calibration starts next.`
  - action `ButtonLink primary` (pad `13px 24px`, `text-base`) href `/devices` → `Go to your devices`

**No account fields** — this is the already-authenticated variant.

---

## 6. Settings → `/settings`   (GreenGo Settings.dc.html)

`AppTopBar active="settings"`. Page `p-page flex flex-col gap-4.5 max-w-form mx-auto` (720px).

- `PageTitle` → `Settings`

**Card 1 — Account** `flex flex-col gap-4`:
- `CardTitle` → `Account`
- `grid minmax(180px,1fr) gap-4`:
  - `Name` · `size="sm"` · value `Kwame Asante`
  - `Email or phone` · `size="sm"` · value `kwame@farm.com` · **`readOnly`** · hint:
    > `Contact support to change your login email or phone.`

**Card 2 — Device** `flex flex-col gap-3.5`:
- `CardTitle` → `Device`
- Row `flex justify-between items-center px-3.5 py-3 bg-app rounded-tile`:
  - `text-body text-canopy` → `Greenhouse 1 — claim code GG-4F82-K1`
  - `text-caption text-muted` → `Claimed 2 months ago`
- Link `text-sm` w600 `self-start` → `Re-run calibration` → **`/devices/gh-1/calibration`** (handoff has `href="#"`; DEV-005 entry point)

**Card 3 — Password** `flex flex-col gap-3.5`:
- `CardTitle` → `Password`
- `New password` · `size="sm"` · `type="password"` · ph `At least 8 characters`

**Footer row** `flex justify-between items-center`:
- `Button primary` (pad `13px 24px`, `text-base`) → `Save changes`
- Link `text-sm text-danger` w600 href `/` → `Log out`

---

## 7. `/devices/[id]/history` — NO HANDOFF DESIGN (DEV-005)

Promote the dashboard's inline history block to a full page:
- `AppTopBar active="devices"`, `max-w-app`
- `BackLink` → `← Greenhouse 1`, `PageTitle` → `Moisture history — Greenhouse 1`
- `RangePills` (same 5 options), larger `MoistureChart`
- Below: `DataTable` of readings (`Timestamp` · `Soil %` · `Soil raw` · `Temp` · `Humidity` · `Relay`) with `Pagination` — raw soil is included because the schema stores it and calibration errors are only diagnosable from raw.
- `EmptyState` when the range has no readings.

## 8. `/devices/[id]/calibration` — NO HANDOFF DESIGN (DEV-005)

Wizard. The only handoff reference is the **read-only** admin Calibration tab
(dry/wet raw values + the uncalibrated warning banner). Proposed steps:
1. **Dry reading** — "Lift the probe out of the soil and wipe it dry." Show live `soilRaw`; capture as `dryRaw`.
2. **Wet reading** — "Place the probe in thoroughly watered soil." Capture as `wetRaw`.
3. **Confirm** — show both raws + the resulting percentage for the current reading; `Save calibration`.
Reuse: `AlertBanner tone="warn"` for the uncalibrated warning, `MetricReadout` for raws, `SuccessPanel` on completion.

## 9. `/notifications` — NO HANDOFF DESIGN (DEV-005)

Inbox. Nearest reference is the Fleet Overview **activity feed** (8px coloured dot + bold actor + text + timestamp). Compose:
- `AppTopBar active="notifications"`, `max-w-table`
- `PageTitle` → `Notifications`
- Feed rows: dot colour by kind (`--color-warn` soil alert, `--color-leaf` command confirmed, `--color-danger` failed), body text, relative timestamp
- Unread affordance + `Mark all as read`
- `EmptyState` → e.g. `No notifications yet`
- `Pagination`

---

## Cross-page notes

- **Tenant nav** gains `Notifications` only (DEV-006). History and Calibration are reached from in-copy links, not nav.
- **All 5 tables/lists lack empty states** in the handoff — `EmptyState` used throughout, logged.
- Mock data must conform to the Phase 1 types in `lib/types.ts`.
- Every designed state must be reachable via a mock toggle (per the brief).
