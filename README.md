# GreenGo

Soil moisture and greenhouse monitor built on an ESP32. Public marketing
site, a farmer-facing tenant dashboard, and a vendor admin console — one
Next.js app, one Postgres database.

Built from a static HTML design handoff. `MANIFEST.md` is the page-by-page
inventory and build plan; `DEVIATIONS.md` is every place the implementation
had to depart from, extend, or make a call the handoff didn't answer —
read that before ruling anything "wrong."

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (CSS-first `@theme`,
see `app/globals.css`) · PostgreSQL + Prisma 7 · session auth via a signed
httpOnly cookie (no NextAuth — the identifier is a phone number and the
flow is custom). Installable as a PWA (DEV-014) — a hand-written service
worker caches the static app shell for flaky-3G resilience; `/api/*` is
never cached, since telemetry/pump commands/auth always need real state.

## Setup

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and SESSION_SECRET
npm run db:migrate           # applies prisma/migrations/20260805000000_init
npm run db:seed              # 10 days of realistic telemetry + demo accounts
npm run dev
```

`SESSION_SECRET` needs a real random value, not the placeholder in
`.env.example`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`DATABASE_URL` is a standard Postgres connection string
(`postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`) — any
Postgres 14+ works, local or hosted. This repo has no `docker-compose.yml`
(see ruling #7 in `MANIFEST.md`); bring your own instance.

## Environment variables

All documented with their reasoning inline in `.env.example`. Summary:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Signs the httpOnly session cookie (`lib/session.ts`) |
| `PHONE_COUNTRY_CODE` | E.164 normalisation default (Ghana: `233`) |
| `SMS_PROVIDER` | `console` ships a logging stub — see `lib/sms.ts` |
| `SMS_SENDER_ID` | Cosmetic sender name for the stub |
| `DEVICE_STALE_AFTER_SECONDS` | Threshold for the confirmed/unknown device-state split |
| `PUMP_MAX_RUN_SECONDS` / `PUMP_COOLDOWN_SECONDS` / `PUMP_DAILY_RUNTIME_CAP_SECONDS` | Server-side pump interlocks (`lib/commands.ts`) |
| `COMMAND_TTL_SECONDS` | How long an issued command waits to be collected before it's discarded, never delivered |
| `DAILY_SMS_CAP` / `ALERT_COOLDOWN_MINUTES` | Alert dispatch limits (`lib/alerts.ts`) |
| `QUIET_HOURS_START_HOUR` / `QUIET_HOURS_END_HOUR` | Fleet-wide quiet-hours default (see DEVIATIONS.md — not yet per-tenant) |

## Database

```bash
npm run db:migrate   # prisma migrate dev — applies migrations, keeps them in sync
npm run db:push       # prisma db push — schema sync without a migration file (prototyping only)
npm run db:seed       # tsx prisma/seed.ts — safe to re-run, clears and reseeds
npm run db:studio     # prisma studio — browse the seeded data
```

The seed script generates 10 days of telemetry at the device's real 10-second
cadence (86,400 readings): a diurnal temperature curve, humidity tracking
inversely, soil moisture declining and stepping up at each irrigation cycle
(7–9 cycles, including one deliberately rejected because the device was in
MANUAL mode), plus matching commands, alerts, and SMS log rows. It also seeds:

- One admin (`ops@greengo.dev`, password `dev-admin-password`)
- One tenant (`+233241234501` / `kwame@farm.com`, password `dev-tenant-password`) with one claimed device
- One unclaimed device with an active claim code (`GG-9K21-P4`)
- A consumed claim code (`GG-1111-11`) and an expired one (`GG-2222-22`) —
  covering all four states `ClaimCodeField` renders

Exact printout (mac addresses, API keys) is logged to the console at the end
of the seed run.

## Simulating a device with curl

The device auth regime is header-based, not session-based — see
`lib/device-auth.ts`. After seeding, the primary device's credentials are:

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -H "X-Device-Mac: A4:CF:12:8E:3B:01" \
  -H "X-Device-Api-Key: ggk_4f9a2c8b1e6d3f7a2c8b1e6d3f2a" \
  -d '{
    "soilRaw": 420,
    "tempC": 26.5,
    "humidityPct": 61,
    "relayOn": false,
    "mode": "AUTO",
    "signalDbm": -62,
    "batteryV": 3.9
  }'
```

The response body carries any pending command for the device — this
poll-response pattern is the entire remote-control mechanism, since the
server can never reach the device directly:

```json
{ "ok": true, "readingId": "...", "command": { "id": "...", "action": "PUMP_ON", "maxRunSeconds": 600 } }
```

To see a command actually queued: log in as the tenant, open the device
dashboard, and toggle the pump — then run the curl command above again. The
device "collects" the command on its next check-in, exactly as an ESP32 would.

## Demo walkthrough

1. **Public site** — `/` → How it works → Live demo (a real 10-second ticking
   reading, simulated client-side) → Pricing.
2. **Tenant login** — `/login`, phone `0241234501`, password
   `dev-tenant-password`. Lands on `/devices`.
3. **Device dashboard** — `/devices/<id>` (the id from step 2's redirect).
   The state switcher in the top-right previews confirmed/pending/unknown —
   this is a designed handoff affordance, not test scaffolding. Toggle the
   pump for a real, interlocked command round-trip.
4. **Claim a second device** — `/devices/add`, code `GG-9K21-P4`.
5. **Admin console** — `/admin/login`, email `ops@greengo.dev`, password
   `dev-admin-password`. Fleet overview, then Devices → the claimed device's
   detail tabs (role toggle in the top bar switches super_admin/support —
   destructive controls disappear entirely under support, not just disabled).
6. **Provision a new device** — `/admin/devices/provision`. The generated
   API key is shown exactly once; note it before leaving the page.

## Scripts

```bash
npm run typecheck              # tsc --noEmit
npm run build                  # next build
node scripts/screenshots.mjs   # responsive/visual audit — see its own header comment for env vars
```

`scripts/mint-session.mjs` mints a valid session JWT for local testing
without a real login (`node scripts/mint-session.mjs tenant|admin`, requires
`SESSION_SECRET`) — useful for exercising session-gated pages that don't
themselves need a database read.

## What's real vs. what's demo scaffolding

Everything under `app/api/` is a real, working endpoint against Prisma —
sessions, claim redemption, pump commands, telemetry ingestion, alert
evaluation, SMS dispatch (console-logged) are all genuinely functional, not
mocked. `DEVIATIONS.md`'s Phase 4B section lists the ~14 read-only pages
that still render their Phase 2 static mock data rather than a live query —
each one is pixel-faithful to the handoff already; only the data source
differs, and converting one follows the exact pattern already used four
times over (see that section for specifics).

## Further reading

- `MANIFEST.md` — Phase 0 inventory: every screen in the handoff, every
  design token extracted, the component list, and the build plan
- `DEVIATIONS.md` — every departure from the handoff, why, and what's still
  pending your ruling (currently just DEV-010, the placeholder photography's
  resolution)
- `handoff/*.md` — per-batch distilled specs used while building, kept for
  reference against the original `.dc.html` files
