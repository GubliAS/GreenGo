# Handoff spec — ADMIN pages (Batch 2D)

Shared: `AdminTopBar` (logo + `ADMIN` badge, links, role pill/toggle, profile
menu/avatar), body bg `--color-app`. Copy verbatim.

Per-screen `AdminTopBar` config observed in the handoff:

| Screen | role control | profile |
|---|---|---|
| Fleet Overview | pill `Super admin` | interactive menu |
| Devices List | pill `Super admin` | interactive menu |
| Device Detail | **toggle** (super_admin/support) | interactive menu |
| Provision Device | pill `Super admin` | interactive menu |
| Account Settings | pill `Super admin` | **static avatar** |
| Audit Log | pill `Super admin` | **static avatar** |

---

## 1. Fleet overview → `/admin`   (GreenGo Admin Fleet Overview.dc.html)

`AdminTopBar active="fleet"`. Page `p-page flex flex-col gap-5.5 max-w-wide mx-auto` (1200px).

- `PageTitle` → `Fleet overview`

### 1.1 Counts — `grid minmax(120px,1fr) gap-3`, 6 × `StatCard variant="fleet"`
| Value | Label | Value colour |
|---|---|---|
| `1` | `Total devices` | `text-canopy` |
| `1` | `Online` | `text-leaf` |
| `0` | `Offline` | `text-faint` |
| `0` | `Never reported` | `text-faint` |
| `1` | `Unclaimed` | `text-warn-text` |
| `0` | `Alerting now` | `text-faint` |

### 1.2 Live fleet strip — `bg-canopy rounded-card p-6 flex justify-between items-center gap-6 flex-wrap`
- Left: `Eyebrow tone="light"` mb `8px` → `Greenhouse 1 · live from the fleet`; then `flex items-baseline gap-2.5`: `font-mono text-36 text-white` w600 → `38%`; `text-sm text-white/75` → `soil moisture · updated 8s ago`
- Right: `SegmentedBar count=24 height=32 surface="dark" radius="sm"` percent `38`, wrapper `flex-1 min-w-55 max-w-105`

### 1.3 Bottom grid — `grid minmax(300px,1fr) gap-4`

**Recent activity** `Card` (pad 24px):
- `CardTitle` mb `4` → `Recent activity`
- Feed `flex flex-col gap-3.5`. Each row `flex gap-3 items-start`: 8px dot (`mt-1.5 shrink-0 rounded-full`), then body `text-body text-canopy` with `<strong>{actor}</strong> {text}`, and `text-label text-muted mt-0.5` timestamp.

| Dot | Actor | Text | Time |
|---|---|---|---|
| `--color-leaf` | `Kwame Asante` | `claimed device GG-4F82-K1 as "Greenhouse 1"` | `2 months ago · 09:14 GMT` |
| `--color-canopy` | `Greenhouse 1` | `pump command confirmed (AUTO, 4m 20s)` | `Today · 06:14 GMT` |
| `--color-warn` | `Greenhouse 1` | `soil alert sent — 24% (below 30% threshold)` | `Yesterday · 21:02 GMT` |
| `--color-danger` | `Unknown` | `failed login attempt for +233 24 XXX XX01` | `3 days ago · 14:47 GMT` |

⚠️ Add a link to `/admin/commands` from this card (DEV-005 entry point).

**Right column** `flex flex-col gap-4`:
- **SMS spend** `Card`: `CardTitle` mb `3.5` → `SMS spend`; two rows `flex justify-between`:
  - `text-sm text-muted` `Today` / `font-mono text-lg text-canopy` w600 `GHS 0.60`
  - `text-sm text-muted` `This month` / `font-mono text-lg text-canopy` w600 `GHS 8.40`
  - ⚠️ Add a link to `/admin/sms` (DEV-005 entry point).
- **Note tile** `bg-mint rounded-card p-6`:
  - `text-body text-canopy` w600 mb `2` → `Fleet is small on purpose`
  - `text-meta text-ink leading-body` → `One claimed device, one unclaimed unit awaiting provisioning. Every number above is exact, not a placeholder.`

---

## 2. Devices list → `/admin/devices`   (GreenGo Admin Devices List.dc.html)

`AdminTopBar active="devices"`. Page `p-page flex flex-col gap-4.5 max-w-wide mx-auto`.

- Header `flex justify-between items-center flex-wrap gap-3`: `PageTitle` → `Devices`; `ButtonLink primary size="admin"` href `/admin/devices/provision` → `+ Provision device`
- Filter row `flex gap-2.5 flex-wrap`:
  - Search input `flex-1 min-w-55` `size="xs"` ph `Search by MAC or label`
  - `Dropdown label="Status"` options: `All statuses` `Online` `Offline` `Never reported` `Unclaimed` `Disabled`
  - `Dropdown label="Tenant"` options: `All tenants` `Kwame Asante` `Unclaimed`
- `DataTable minWidth={820}`, columns:
  `Label 1.1fr` · `MAC address 1.3fr` · `Tenant 1.2fr` · `Status 0.9fr` · `Last seen 1fr` · `Firmware 0.8fr` · `Actions 0.8fr`

Rows (2):

| Label | MAC | Tenant | Status | Last seen | Firmware | → |
|---|---|---|---|---|---|---|
| `Greenhouse 1` | `A4:CF:12:8E:3B:01` | `Kwame Asante` | `Online` (mint) | `8s ago` | `v1.4.2` | `/admin/devices/gh-1` |
| `—` | `A4:CF:12:8E:3B:02` | `Unclaimed` | `Unclaimed` (warn) | `never` | `v1.4.2` | `/admin/devices/provision` |

Cells: Label `tone="canopy"`; MAC `mono tone="ink" text-meta`; Tenant `tone="ink"`; Status `StatusPill`; Last seen `tone="muted" text-meta`; Firmware `mono tone="ink" text-meta`; Actions link w600 → `View`.

⚠️ **Only 2 of 6 statuses have a designed row.** Offline / Never reported / Disabled / pending appear in the filter but have no row treatment — extrapolate tones (`stone` for offline/never-reported, `danger` for disabled) and log.

---

## 3. Device detail → `/admin/devices/[id]`   (GreenGo Admin Device Detail.dc.html)

`AdminTopBar active="devices" role={role} onRoleChange={setRole}` — the role
**toggle** variant. Page `p-page flex flex-col gap-4.5 max-w-app mx-auto` (1100px).

- Header: `BackLink href="/admin/devices"` → `← All devices`; `PageTitle` mt `6px` → `Greenhouse 1`
- `UnderlineTabs` — 6 tabs: `Identity` `Live snapshot` `Calibration` `Tenant binding` `Raw telemetry` `Commands`

**`canDestroy = role === 'super_admin'`.** When `support`, destructive controls are
**removed from the DOM**, not disabled — the README is explicit. Implement as
conditional render, never `disabled`.

### Tab: Identity
- Info card `Card` `grid minmax(220px,1fr) gap-5`, 6 × label/value. Label `text-label text-muted uppercase tracking-widest mb-1.25`; value `font-mono text-lg text-canopy`:
  - `MAC address` → `A4:CF:12:8E:3B:01`
  - `Claim code` → `GG-4F82-K1` + `StatusPill tone="mint" size="xs"` `Claimed` (ml `6px`)
  - `Firmware` → `v1.4.2`
  - `Uptime` → `46d 3h`
  - `Signal` → `-62 dBm`
  - `Battery` → `3.9V`
- API key card `Card` `flex flex-col gap-3.5`:
  - `CardTitle` (14px) → `Device API key`
  - Row `flex items-center gap-2.5`: value box `font-mono text-md text-canopy bg-app rounded-sm px-3.5 py-2.5 flex-1`; masked `••••••••••••••••••••••3F2A`, revealed `ggk_4f9a2c8b1e6d3f7a2c8b1e6d3f2a`; then `Button variant="outline" size="sm"` → `Reveal` / `Hide`
  - **If `canDestroy`** — `border-t border-hairline pt-3.5 flex flex-col gap-2.5`:
    - Warning `text-meta text-danger` w600 → `Regenerating breaks this device until it is reflashed with the new key.`
    - Row `flex gap-2.5 items-center`: input `flex-1` `size="inline"` ph `Type "Greenhouse 1" to confirm`; `Button variant="destructive" size="sm"` → `Regenerate key`, **disabled until input === `Greenhouse 1`** (exact match)

### Tab: Live snapshot — **all 3 states designed**
- Right-aligned `StateSwitcher` (`Confirmed` / `Pending` / `Unknown`)
- Card `Card` `grid minmax(140px,1fr) gap-4`, 4 readouts (label `text-label text-muted uppercase`):
  | Label | confirmed | pending | unknown |
  |---|---|---|---|
  | `Soil moisture` (`text-20`) | `38%` | `38%` | `—` |
  | `Relay` (`text-xl`) | `ON` | `Pending` | `Unknown` |
  | `Mode` (`text-xl`) | `AUTO` | `AUTO` | `AUTO` |
  | `Last seen` | dot `--color-leaf` + `8s ago` | dot `--color-pending` **+ `gg-pulse`** + `Awaiting ack` | dot `--color-faint` + `4 min ago — stale` |

  Last-seen cell: `flex items-center gap-1.5`, 8px dot, then `text-base text-canopy` w600.

### Tab: Calibration
- Right-aligned `StateSwitcher` — 2 options `Calibrated` / `Uncalibrated`
- **When uncalibrated** — `AlertBanner tone="warn"` (pad `16px 20px`):
  > `This device has never been calibrated. Soil moisture readings are meaningless until dry and wet raw values are set.`
- Values card `Card` `grid minmax(220px,1fr) gap-5`, **`opacity: 0.4` when uncalibrated**:
  - `Dry raw value` → `font-mono text-2xl` w600 `612`
  - `Wet raw value` → `198`
  - `Set by` → `text-base` `Kwame Asante`
  - `Set on` → `2 months ago`

### Tab: Tenant binding
- Current tenant `Card` `flex justify-between items-center`:
  - `Current tenant` label; `text-lg text-canopy` w600 → `Kwame Asante`; `text-meta text-muted mt-0.5` → `Claimed 2 months ago`
- **If `canDestroy`** — `Card` `flex flex-col gap-3.5`:
  - `text-base text-danger` w700 → `Destructive actions`
  - `text-meta text-muted` → `Unclaiming removes this device from Kwame Asante's dashboard immediately. Type the tenant's name to confirm.`
  - Row `flex gap-2.5`: input `flex-1` `size="inline"` ph `Type Kwame Asante to confirm`; `Button destructive size="sm"` → `Unclaim device`, disabled until input === `Kwame Asante`
  - Link `text-sm` w600 `self-start` → `Transfer to another tenant` (href `#` in handoff — no target designed)

### Tab: Raw telemetry
- Header `flex justify-between items-center`: `text-body text-muted` → `Last 100 payloads, newest first`; toggle button:
  - off: `border-line bg-white text-ink` → `Enable live-tail`
  - on: `border-leaf bg-mint text-canopy` → `● Live-tailing`
  - (`rounded-sm px-3.5 py-2 text-meta` w600)
- `DataTable minWidth={640} density="compact"`, columns `Timestamp 1.2fr` · `Soil 0.8fr` · `Temp 0.8fr` · `Humidity 0.8fr` · `Relay 0.7fr`. Rows all `font-mono text-meta text-canopy`.
- 8 generated rows, handoff formula (`i` = 0..7):
  `ts = 06:{(14-i) padded}:0{i}` · `soil = 38-i` + `%` · `temp = (26.5 - i*0.1).toFixed(1)` + `°` · `hum = 61+i` + `%` · `relay = i<2 ? 'ON' : 'OFF'`
- ⚠️ Add `Pagination` (handoff says "last 100" but renders 8 with no control).

### Tab: Commands
- `DataTable minWidth={680}`, columns `Timestamp 1.1fr` · `Actor 1fr` · `Action 0.8fr` · `Outcome 0.8fr` · `Stop reason 1.3fr`
- Rows (4):

| Timestamp | Actor | Action | Outcome | Stop reason |
|---|---|---|---|---|
| `Today 6:14 AM` | `AUTO` | `Pump on` | `Confirmed` (mint) | `Soil reached 70%` |
| `Yesterday 9:02 PM` | `Kwame Asante` | `Pump off` | `Confirmed` (mint) | `Manual stop` |
| `3 days ago 2:30 PM` | `Kwame Asante` | `Pump on` | `Failed` (danger) | `Device offline` |
| `4 days ago 6:08 AM` | `AUTO` | `Pump on` | `Confirmed` (mint) | `Soil reached 69%` |

Outcome pills `StatusPill size="xs"`. Timestamp `tone="canopy"`; Actor/Action `tone="ink"`; Stop reason `tone="muted"`.

⚠️ Only `Confirmed` and `Failed` designed — `pending`/`sent`/`expired` from the schema have no pill treatment. Extrapolate (`warn` for pending/sent, `stone` for expired) and log.

---

## 4. Provision device → `/admin/devices/provision`   (GreenGo Admin Provision Device.dc.html)

`AdminTopBar active="devices"`. Page `p-page max-w-form-sm mx-auto` (640px).

- `BackLink href="/admin/devices"` → `← All devices`
- `PageTitle` margin `8px 0 20px` → `Provision a device`

### Step `form` — `Card` `flex flex-col gap-4`
- `MAC address` · `size="md"` `mono` · ph `A4:CF:12:8E:3B:03`
- `Device label` · `size="md"` · ph `e.g. Greenhouse 2`
- **Warning BEFORE generation** — `AlertBanner tone="warn" size="sm"`:
  > **`The API key is shown once.`** ` After you leave this screen, it cannot be retrieved again — only regenerated, which breaks the device until reflashed. Copy it to the enclosure sticker or a secure note before continuing.`
  (bold lead is a `<strong>`)
- `Button primary size="md"` → `Generate device credentials`, **disabled until both MAC and label are non-empty** (trimmed)

### Step `generated` — `flex flex-col gap-4`
**Credentials card** `Card` `flex flex-col gap-4`:
- `SuccessPanel size="sm"` → `Device provisioned`
- `Device ID` → `font-mono text-base text-canopy` `dev_8a2f1c9e4b7d`
- `Claim code` → `GG-9K21-P4`
- API key block:
  - Label row `text-label text-muted uppercase tracking-widest mb-1.25` → `API key — shown once`
  - Row `flex items-center gap-2.5`: value `font-mono text-body text-canopy bg-app rounded-sm px-3.5 py-2.5 flex-1 break-all` → `ggk_e3f7a2c8b1d6e4f9a2c8b1e6d3f7a2c8`; `Button outline size="sm"` → `Copy` / `Copied` (uses `navigator.clipboard`)

**Sticker preview** `bg-canopy rounded-card p-6.5 flex flex-col gap-2.5`:
- `text-caption text-white/60 uppercase tracking-widest` w600 → `Printable enclosure sticker`
- White sticker `bg-white rounded-button p-5 flex flex-col gap-1.5 max-w-70`:
  - `font-display text-lg` w800 → `Green` + `<span class="text-leaf">Go</span>`
  - `text-sm text-ink mt-1.5` → `{label}`
  - `font-mono text-xl text-canopy` w600 `tracking-sliver` → `{claimCode}`
- `Button variant="onGreen"` `rounded-tile px-4.5 py-2.5 text-sm` `self-start` mt `1` → `Print sticker`

Then link `text-body` w600 `self-start` href `/admin/devices` → `Done — back to devices`

---

## 5. Account settings → `/admin/account`   (GreenGo Admin Account Settings.dc.html)

`AdminTopBar active={undefined} profileInteractive={false}`. Page `p-page max-w-form-sm mx-auto`.

- `BackLink href="/admin/devices"` → `← Back`
- `PageTitle` margin `8px 0 20px` → `Account settings`
- Cards `flex flex-col gap-3.5`:

**Profile** `Card` `flex flex-col gap-4`:
- `CardTitle` (14px) → `Profile`
- `grid minmax(180px,1fr) gap-4`: `Name` · `size="sm"` · `Owusu Prempeh` — `Email` · `size="sm"` · `ops@greengo.dev`
- `Role` · `size="sm"` · `Super admin` · **`readOnly`**

**Password** `Card` `flex flex-col gap-3.5`:
- `CardTitle` → `Password`
- `New password` · `size="sm"` · `type="password"` · ph `At least 8 characters`

**Footer** `flex justify-between items-center`:
- `Button primary` (pad `13px 24px`, `text-base`) → `Save changes`
- Link `text-sm text-danger` w600 href `/` → `Log out`

---

## 6. Audit log → `/admin/audit`   (GreenGo Admin Audit Log.dc.html)

`AdminTopBar active={undefined} profileInteractive={false}`. Page `p-page flex flex-col gap-4.5 max-w-table mx-auto` (1000px).

- `BackLink href="/admin/devices"` → `← Back`; `PageTitle` mt `6px` → `Audit log`
- `DataTable minWidth={640}`, columns `Timestamp 1.1fr` · `Actor 1fr` · `Action 1fr` · `Details 1.4fr`

Rows (5, verbatim):

| Timestamp | Actor | Action | Details |
|---|---|---|---|
| `Today · 09:02 GMT` | `Owusu Prempeh` | `Viewed device` | `Greenhouse 1 (A4:CF:12:8E:3B:01)` |
| `Yesterday · 17:40 GMT` | `Owusu Prempeh` | `Provisioned device` | `Claim code GG-9K21-P4 generated` |
| `3 days ago · 11:15 GMT` | `Owusu Prempeh` | `Logged in` | `From 102.184.XX.XX` |
| `2 months ago · 09:14 GMT` | `Owusu Prempeh` | `Provisioned device` | `Claim code GG-4F82-K1 generated for A4:CF:12:8E:3B:01` |
| `2 months ago · 08:50 GMT` | `Owusu Prempeh` | `Logged in` | `From 102.184.XX.XX` |

Cells: Timestamp `tone="canopy"`; Actor/Action `tone="ink"`; Details `tone="muted"`.
⚠️ Add `Pagination` + filters; the handoff has neither.

---

## 7–11. DEV-005 admin routes — NO HANDOFF DESIGN

| Route | Compose from |
|---|---|
| `/admin/tenants` | Admin Devices List table shell. Columns: `Name` · `Phone` · `Devices` · `Joined` · `Actions`. Search + `Pagination` + `EmptyState`. |
| `/admin/tenants/[id]` | Device Detail's tab layout. Tabs: `Profile` · `Devices` · `SMS history` · `Login history`. Destructive actions (`support` cannot see them) behind `ConfirmDialog` with typed confirmation. |
| `/admin/commands` | Device Detail's **Commands** tab, widened to fleet scope; add a `Device` column, status filter `Dropdown` (all 5 `CommandStatus` values), `Pagination`. |
| `/admin/sms` | Table shell + status pills. Columns: `Queued` · `To` · `Device` · `Body` · `Status` · `Cost`. `SmsStatus` tones: `delivered`→mint, `sent`/`queued`→stone, `failed`/`undelivered`→danger. Plus the Fleet SMS-spend summary at the top. |
| `/admin/config` | `/alerts` card-stack form layout. Cards for: default alert thresholds, pump interlocks (`max run`, `cooldown`, `daily cap`), SMS caps + quiet-hour defaults, device staleness threshold. All values from `.env.example`. |

---

## Cross-page notes

- **Admin nav** 2 → 5 items (DEV-006: `Tenants`, `SMS log`, `Config`).
- **`support` role** must *remove* destructive controls from the DOM everywhere, not disable them. Only Device Detail demos this in the handoff; apply consistently across the new pages.
- **Provision `Copy`** uses `navigator.clipboard` — needs a secure context; keep the value selectable as a fallback.
- Every table gains `Pagination` + `EmptyState`; neither exists in the handoff.
