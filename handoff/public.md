# Handoff spec — PUBLIC pages (Batch 2A)

Distilled from the `.dc.html` sources so pages can be built without re-reading
them. **Copy strings are verbatim and final** — do not paraphrase. Values in
`backticks` are the literal handoff values; the token column gives the
Phase 1 equivalent.

Shared across all 5: `MarketingNav` (DEV-002 — all pages scroll-condense) and
`MarketingFooter`. Body bg `#FFFFFF`. Outer wrapper `max-width:1440px;margin:0 auto`
→ `max-w-marketing mx-auto`.

---

## 1. Landing → `/`   (source: GreenGo Landing Page.dc.html)

Nav: floating pill, `active=null`. Section order:

### 1.1 Hero — `section` pad `20px 20px 0`
- Frame: `position:relative;border-radius:28px;overflow:hidden;min-height:680px;display:flex;align-items:flex-end`
  → `rounded-hero overflow-hidden min-h-170 flex items-end`
- Image: `public/hero-field.jpg`, `absolute inset-0 w-full h-full`, object-cover
- Scrim: `absolute inset-0` + `bg-scrim-hero`, `pointer-events-none`
- Content: `relative` pad `64px clamp(24px,5vw,72px) 56px`, `w-full flex justify-between items-end gap-8 flex-wrap`

**Left column** `max-w-150` (600px), `animate-rise` + `data-gg-anim="1"`:
- Eyebrow chip: `inline-block bg-white/14 text-white`, `text-caption`, weight 600, `tracking-wide`, pad `6px 14px`, `rounded-card`, mb `18px`
  > `Built on ESP32 · one greenhouse, KNUST`
- H1 `font-display` weight 800 `text-hero-landing` `leading-hero` `text-white` `tracking-tighter`, margin `0 0 16px`:
  > `Know your soil ` + *italic span* `font-accent italic` weight 400 `text-mint-bright`: `before it's too late.`
- Para `text-xl-alt` `leading-body` `text-white/86` margin `0 0 26px` `max-w-115` (460px):
  > `GreenGo watches soil moisture, temperature and humidity every 10 seconds, texts you when the soil runs dry, and lets you switch the pump on from anywhere.`
- Buttons `flex gap-3 flex-wrap`:
  - `Button variant=primary size=md` → `Request a device` (links `/pricing`)
  - `ButtonLink variant=ghostOnPhoto` href `#live`, pad `12.5px 24px` → `See a live reading ↓`

**Right: live reading card** `id="live"`, `bg-white/92 backdrop-blur-[14px]` `rounded-card` pad `22px 24px` `min-w-70` `shadow-hero`, `animate-rise` delay `120ms`:
- Header row `flex justify-between items-center` mb `12px`:
  - `font-mono text-micro text-muted uppercase tracking-caps` → `Greenhouse 1 · live`
  - `flex items-center gap-1.5 text-micro text-leaf` weight 600 + 6px leaf dot → `Connected`
- `font-mono text-34 text-canopy` weight 600 mb `2px` → `{percent}%`
- `text-meta text-ink` mb `14px` → `{describeMoisture(p)} · updated {seconds}s ago`
- `SegmentedBar count=20 height=32 surface=marketing radius=sm animateFill`

**Behaviour:** `setInterval` 1000ms. `seconds` increments; at `>=10`, `percent += random()*6-3` clamped 0–100, `seconds=0`. Initial `percent:42, seconds:3`.
**State coverage:** confirmed only — hardcoded `Connected`. (MANIFEST §D.2)

### 1.2 Feature grid — pad `96px clamp(24px,6vw,80px)`
Mint panel `bg-mint rounded-hero p-panel-lg`, inner `grid minmax(240px,1fr) gap-5`.
3 × white card `rounded-card p-7 flex flex-col gap-3.5`:

| Icon tile | Icon | Title (`text-feature` w700 `font-display`) | Body (`text-md text-ink leading-body`) |
|---|---|---|---|
| `52px rounded-button bg-leaf text-white` | `IconMoisture` | `See the soil, not just guess` | `A sensor in the ground reports moisture, temperature and humidity every 10 seconds — day and night, whether or not you're at the farm.` |
| `52px rounded-button bg-canopy text-white` | `IconHumidity` | `Get texted when it matters` | `No app to check obsessively. When soil drops below your threshold, GreenGo sends an SMS — even on 3G, even with no data plan.` |
| `52px rounded-button bg-transparent border-hair border-leaf text-leaf` | `IconPump` | `Turn the pump on from anywhere` | `Switch irrigation on remotely, or let the device handle it automatically — a physical switch on site always has the final say.` |

### 1.3 How it works — `id="how"`, pad `20px clamp(24px,6vw,80px) 96px`
Centred header mb `48px`: `Eyebrow` → `How it works`; H2 `font-display` w800 `text-h2-lg` `text-canopy` `tracking-tight`:
> `Device → readings → alert → ` + italic `font-accent text-leaf`: `pump.`

Mint panel `bg-mint rounded-hero p-panel`, `grid minmax(220px,1fr) gap-4`, 4 × `NumberedStep`:
- `01` `Sensor reads the soil` — `A probe in the ground measures moisture every 10 seconds, alongside air temperature and humidity.`
- `02` `Readings reach GreenGo` — `The device sends each reading to your dashboard — and to its own LCD screen in the greenhouse.`
- `03` `You get an SMS if it's dry` — `Soil below your threshold triggers a text, sent from GREENGO, with the reading and time.`
- `04` `Turn on the pump` — `Reply from the dashboard, or let AUTO mode handle it — the physical switch on site always overrides remote control.`

### 1.4 Bar explainer — `id="bar"`, pad `20px clamp(24px,6vw,80px) 96px`
`bg-leaf rounded-hero p-band`, `grid minmax(300px,1fr) gap-12 items-center`:

**Left:**
- `Eyebrow tone=light` → `The same instrument, two surfaces`
- H2 `font-display` w800 `text-h2-alt text-white leading-snug` margin `0 0 14px`:
  > `The bar on your phone is the bar on the LCD in the greenhouse.`
- Para `text-md text-white/85 leading-loose`:
  > `GreenGo's device draws its readings as blocky bar graphs on a 20×4 character screen — the same shape the farmer sees standing next to the crop. We didn't design a new chart for the app. We redrew the one that's already there, so both surfaces read as one product.`

**Right:** white card `rounded-card` pad `24px 28px` `grid gap-4.5`, 3 rows. Each: label row `flex justify-between text-meta` mb `8px` (`text-canopy` w600 label + `font-mono text-canopy` value), then `SegmentedBar count=20 height=36 surface=marketing radius=sm`:
- `Dry` / `8%` / percent 8
- `Threshold` / `30%` / percent 30
- `Saturated` / `90%` / percent 90

### 1.5 Specs strip — `id="specs"`, pad `20px clamp(24px,6vw,80px) 96px`
Centred header mb `40px`: `Eyebrow` → `Honest specifics`; H2 `font-display` w800 `text-h2`:
> `One device, one greenhouse — here's exactly what it does.`

Mint panel `bg-mint rounded-hero p-panel`, `grid minmax(200px,1fr) gap-4`, 4 × `StatCard variant=spec`:
- `10s` — `reporting interval`
- `3` — `metrics tracked — soil, temp, humidity (light optional)`
- `SMS` — `alerts, no app or data plan required`
- `ESP32` — `solar-friendly, low-power hardware`

### 1.6 CTA band + footer — `id="contact"`, pad `20px 20px 56px`
Frame `relative rounded-hero overflow-hidden`. Image `public/footer-greenhouse.jpg` `absolute inset-0`. Scrim `bg-scrim-cta`.
- CTA `relative flex flex-col items-center text-center gap-5.5` pad `clamp(56px,8vw,96px) clamp(24px,6vw,64px) clamp(48px,6vw,64px)`:
  - H2 `font-display` w800 `text-cta-band text-white max-w-190 leading-cta tracking-tight`:
    > `Put a sensor in the ground. See what's actually happening.`
  - Para `text-lg-alt text-white/78 max-w-110 leading-body`:
    > `Request a device for your farm, or ask us anything about the sensors, the SMS alerts, or the pump control.`
  - `flex gap-3 flex-wrap justify-center`: `Button primary size=lg` → `Request a device`; `ButtonLink ghostOnPhoto size=lg` href `mailto:hello@greengo.dev` → `Talk to us`
- `MarketingFooter surface="photo"` (inside the same photo frame)

---

## 2. How It Works → `/how-it-works`   (source: GreenGo How It Works.dc.html)

Nav `active="how-it-works"`. Footer `surface="light"`.

### 2.1 Header — pad `64px clamp(24px,6vw,80px) 0`, `text-center`
- `Eyebrow` mb `14px` → `How it works`
- H1 `font-display` w800 `text-hero-how text-canopy tracking-tighter leading-tight` margin `0 0 18px`:
  > `One sensor, four things it does ` + italic `font-accent text-leaf`: `every 10 seconds.`
- Para `text-xl text-ink leading-body max-w-150 mx-auto`:
  > `GreenGo is a single ESP32 unit sitting in the greenhouse. Here's exactly what it measures, how it talks to you, and what happens when the soil runs dry.`

### 2.2 Four steps — pad `56px clamp(24px,6vw,80px)`
`bg-mint rounded-hero p-panel grid minmax(220px,1fr) gap-4`, 4 × `NumberedStep`:
- `01` `Sensor reads the soil` — `A calibrated resistive bridge measures soil moisture. A DHT11 reads air temperature and humidity. An LDR adds ambient light — provisional, may be dropped.`
- `02` `It shows on the LCD, right there` — `A 20×4 character screen draws each reading as a blocky bar graph, built from custom LCD segment characters — no phone required to check.`
- `03` `And reaches your dashboard` — `The same reading is pushed to the web dashboard, and an SMS goes out the moment soil drops below your threshold.`
- `04` `The pump responds` — `In AUTO mode the relay switches the pump on. In MANUAL, a physical switch on site has the final say — remote control is disabled and says why.`

### 2.3 Hardware — pad `56px clamp(24px,6vw,80px)`
`grid minmax(280px,1fr) gap-12 items-center`:

**Left:**
- `Eyebrow` mb `14px` → `The hardware`
- H2 `font-display` w800 `text-h2 text-canopy leading-snug` margin `0 0 16px`:
  > `An ESP32, a probe, a relay, and a switch you can trust.`
- 5 bullets `flex flex-col gap-3.5`. Each: `flex gap-3 items-start`, 8px leaf dot (`mt-1.75 shrink-0 rounded-full bg-leaf`), then `text-md text-ink leading-body` with a `text-canopy` bold lead:
  - **Soil moisture bridge** — ` — resistive probe, calibrated per device in the setup wizard.`
  - **DHT11** — ` — air temperature and relative humidity.`
  - **Relay + pump** — ` — switched by AUTO logic or your command, never against the physical MANUAL switch.`
  - **Buzzer** — ` — sounds on site when soil crosses dry.`
  - **Signal & battery** — ` — reported every cycle, so you know when a reading is stale, not just wrong.`

**Right:** ⚠️ **EMPTY IMAGE SLOT** — `id="device-photo"`, `shape=rounded radius=20`, `aspect-ratio:4/5`, placeholder `Drop a photo of the device / sensor probe`. **No src in the handoff** (MANIFEST §E.2). Render as a placeholder tile, do not invent an image.

### 2.4 CTA — pad `20px clamp(24px,6vw,80px) 96px`
`bg-leaf rounded-hero` pad `clamp(32px,5vw,56px)` `text-center flex flex-col items-center gap-4`:
- H2 `font-display` w800 `text-h2 text-white` → `Want to see it running, right now?`
- Para `text-md text-white/85 max-w-105` → `Our one device, in our one greenhouse — a public, read-only view.`
- `ButtonLink variant=onGreen size=md` href `/live-demo` → `See the live demo`

---

## 3. Live Demo → `/live-demo`   (source: GreenGo Live Demo.dc.html)

Nav `active="live-demo"`. Footer `surface="light"`.

### 3.1 Header — pad `64px clamp(24px,6vw,80px) 0`, `text-center`
- Chip `inline-flex items-center gap-2 bg-mint text-canopy text-caption` w600 `tracking-wide` pad `7px 16px` `rounded-card` mb `18px`, with 6px leaf dot:
  > `Public, read-only — our one greenhouse, KNUST`
- H1 `font-display` w800 `text-hero-demo text-canopy tracking-tighter leading-tight` margin `0 0 16px`:
  > `This is real soil, ` + italic `font-accent text-leaf`: `reporting right now.`
- Para `text-lg-alt text-ink leading-body max-w-130 mx-auto`:
  > `No login, nothing staged. The readings below come from the actual sensor unit in our greenhouse, refreshed on the same 10-second cycle it reports on.`

### 3.2 Readings — pad `48px clamp(24px,6vw,80px) 96px`, `grid minmax(280px,1fr) gap-5`

**Hero card** `Card variant=hero` (`rounded-card-sm`, pad `clamp(28px,3.5vw,40px)`), `flex flex-col gap-5`:
- Header `flex justify-between items-center`: `font-mono text-caption text-muted uppercase tracking-caps` → `Greenhouse 1 · soil moisture`; right `flex items-center gap-1.5 text-meta text-leaf` w600 + 6px leaf dot → `Connected`
- `flex items-baseline gap-3.5`: `font-mono text-72 text-canopy leading-none` w600 → `{percent}%`; `text-lg text-ink` w600 → `{describeMoisture(p)}`
- `SegmentedBar count=24 height=44 surface=marketing radius=lg animateFill`
- Scale row `flex justify-between text-caption text-muted`: `Dry` · `Threshold 30%` · `Saturated`
- `text-meta text-muted` → `Last updated {seconds}s ago · next reading in {10-seconds}s`

**Right column** `flex flex-col gap-3.5` — 3 mint tiles `bg-mint rounded-card p-5.5 flex justify-between items-center`. Each left: label `text-caption text-ink uppercase tracking-widest` mb `6px` + `font-mono text-28 text-canopy` w600 value.
- `Air temperature` / `{temp}°C` / right `IconMoisture size=28` stroke leaf
- `Humidity` / `{humidity}%` / right `IconHumidity size=28 withClapper={false}` stroke leaf
- `Pump` / `font-mono text-20` `{pumpOn ? 'Pump on' : 'Pump off'}` / right 10px dot (`bg-leaf` when on, else `bg-dot-off`)
- Note `text-caption text-muted leading-normal` pad `0 4px`:
  > `Light level is optional on this device and can be removed without changing this layout.`

**Behaviour:** 1000ms interval; at `seconds>=10`: `percent += random()*6-3` clamped; `temp += random()*1-0.5` rounded to 1dp; `humidity += random()*4-2` clamped 0–100; `pumpOn = percent < 30`. Initial `percent:38, temp:27, humidity:64, seconds:0, pumpOn:false`.
**State coverage:** confirmed only — hardcoded `Connected`. (MANIFEST §D.2)

### 3.3 CTA — pad `20px clamp(24px,6vw,80px) 96px`
`bg-mint rounded-hero p-panel flex flex-wrap gap-6 items-center justify-between`:
- Left `max-w-120`: H2 `font-display` w800 `text-h2-sm text-canopy` margin `0 0 10px` → `Want this dashboard on your own farm?`; para `text-base text-ink leading-body` → `The tenant dashboard adds history, alerts, and pump control for your device. This view is the public, read-only version of the same instrument.`
- `ButtonLink primary size=md` href `/pricing` → `Request a device`

---

## 4. Pricing → `/pricing`   (source: GreenGo Pricing.dc.html)

Nav `active="pricing"`. Footer `surface="light"`.

### 4.1 Header — pad `64px clamp(24px,6vw,80px) 0`, `text-center`
- `Eyebrow` mb `14px` → `Pricing`
- H1 `font-display` w800 `text-hero-pricing text-canopy tracking-tighter leading-tight` margin `0 0 16px`:
  > `We haven't priced this ` + italic `font-accent text-leaf`: `yet — on purpose.`
- Para `text-lg-alt text-ink leading-body max-w-135 mx-auto`:
  > `GreenGo is one device running in one greenhouse. Before we set a price, we want it running in yours too. Tell us about your farm and we'll follow up directly.`

### 4.2 Body — pad `48px clamp(24px,6vw,80px) 96px`, `grid minmax(300px,1fr) gap-14 items-start`

**Left** `flex flex-col gap-4`:
- Mint card `bg-mint rounded-card p-6.5`: title `text-lg text-canopy` w700 mb `10px` → `What comes with a device`; then `flex flex-col gap-2.5`, each row `flex gap-2.5 text-body text-ink` with a `text-leaf` `＋` (fullwidth plus U+FF0B):
  - `One ESP32 sensor unit — soil probe, DHT11, LCD, buzzer, relay`
  - `Guided calibration for your specific soil`
  - `SMS alerts, no data plan required`
  - `Dashboard access for history and pump control`
- Outline card `border-hair border-line-soft rounded-card p-6.5`, `text-body text-muted leading-body`:
  > `No partner network yet, no volume pricing, no subscription tiers — just one team building one device. Real numbers come once we've installed a few more.`

**Right: request form** `bg-white border-hair border-line-soft rounded-hero` pad `clamp(28px,3.5vw,40px)`:
- Title `font-display text-19 text-canopy` w700 mb `5.5` → `Request a device`
- Fields `flex flex-col gap-4`, `size="md"`:
  - Row `grid minmax(180px,1fr) gap-4`: `Name` / ph `Your name` · `Phone or email` / ph `How we reach you`
  - `Farm location` / ph `Town / region`
  - Row `grid minmax(180px,1fr) gap-4`: `Greenhouse size` / ph `e.g. 200 m²` · `Crop` / ph `e.g. tomato, pepper`
  - `Button primary size=md self-start` → `Send request`

---

## 5. Contact → `/contact`   (source: GreenGo Contact.dc.html)

Nav `active="contact"`. Footer `surface="light"`.

Single section, pad `72px clamp(24px,6vw,80px) 96px`, `grid minmax(300px,1fr) gap-14 items-start`:

**Left:**
- `Eyebrow` mb `14px` → `Contact`
- H1 `font-display` w800 `text-hero-contact text-canopy tracking-tighter leading-tight` margin `0 0 18px`:
  > `Talk to the people ` + italic `font-accent text-leaf`: `building it.`
- Para `text-lg-alt text-ink leading-body max-w-105` margin `0 0 32px`:
  > `Questions about the sensors, the SMS alerts, or getting a device on your farm — we read every message ourselves.`
- 3 blocks `flex flex-col gap-5`. Each: label `text-caption text-muted uppercase tracking-widest` mb `4px`, then value `text-lg` w600:
  - `Email` → link `hello@greengo.dev` (`text-leaf`)
  - `Based in` → `Kumasi, Ghana — KNUST` (`text-canopy`)
  - `Team` → `CS Year 3, Group 5` (`text-canopy`)

**Right: message form** `bg-mint rounded-hero p-panel`, `flex flex-col gap-4.5`, fields `size="md"` with `bg-white`:
- Row `grid minmax(180px,1fr) gap-4`: `Name` / ph `Your name` · `Farm / location` / ph `e.g. Ejisu, Ashanti`
- `Email or phone` / ph `How we reach you`
- `Message` → `TextareaField rows=5` / ph `What do you want to know?`
- `Button primary size=md self-start` → `Send message`

---

## Cross-page notes

- **Footer copy** (identical on all 5): brand blurb `A soil moisture and greenhouse monitor built on ESP32. One device, one greenhouse, KNUST CS Year 3 — Group 5.` · Product column: How it works / Live demo / Pricing · Contact column: `hello@greengo.dev`, `Kumasi, Ghana`.
- **Nav CTA** `Request a device` — no handoff target; routed to `/pricing` (where the request form lives). Logged as a Phase 2A note if you disagree.
- **Landing nav login label** is `Dashboard` when `localStorage.greengo_logged_in === '1'`, else `Log in`. Replaced by the real session in Phase 4; `loggedIn` prop for now.
- **Forms are non-functional in Phase 2** — wired in Phase 4B.
- **`min-h-170`** = 680px (170 × 4px). Confirm this emits; otherwise add a token.
