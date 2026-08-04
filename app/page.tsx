import Image from "next/image";
import { MarketingNav } from "@/components/nav/MarketingNav";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { HeroReadingCard } from "@/components/marketing/HeroReadingCard";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { NumberedStep } from "@/components/ui/Feedback";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { StatCard } from "@/components/ui/StatCard";
import { IconHumidity, IconMoisture, IconPump } from "@/components/icons";

/* Landing → / · source: GreenGo Landing Page.dc.html
 * Spec: handoff/public.md §1. Copy verbatim. */

const FEATURES = [
  {
    icon: <IconMoisture size={24} />,
    tile: "bg-leaf text-white",
    title: "See the soil, not just guess",
    body: "A sensor in the ground reports moisture, temperature and humidity every 10 seconds — day and night, whether or not you're at the farm.",
  },
  {
    icon: <IconHumidity size={24} />,
    tile: "bg-canopy text-white",
    title: "Get texted when it matters",
    body: "No app to check obsessively. When soil drops below your threshold, GreenGo sends an SMS — even on 3G, even with no data plan.",
  },
  {
    icon: <IconPump size={24} />,
    tile: "bg-transparent border-hair border-leaf text-leaf",
    title: "Turn the pump on from anywhere",
    body: "Switch irrigation on remotely, or let the device handle it automatically — a physical switch on site always has the final say.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sensor reads the soil",
    body: "A probe in the ground measures moisture every 10 seconds, alongside air temperature and humidity.",
  },
  {
    n: "02",
    title: "Readings reach GreenGo",
    body: "The device sends each reading to your dashboard — and to its own LCD screen in the greenhouse.",
  },
  {
    n: "03",
    title: "You get an SMS if it's dry",
    body: "Soil below your threshold triggers a text, sent from GREENGO, with the reading and time.",
  },
  {
    n: "04",
    title: "Turn on the pump",
    body: "Reply from the dashboard, or let AUTO mode handle it — the physical switch on site always overrides remote control.",
  },
];

const BAR_ROWS = [
  { label: "Dry", value: "8%", percent: 8 },
  { label: "Threshold", value: "30%", percent: 30 },
  { label: "Saturated", value: "90%", percent: 90 },
];

const SPECS = [
  { value: "10s", label: "reporting interval" },
  { value: "3", label: "metrics tracked — soil, temp, humidity (light optional)" },
  { value: "SMS", label: "alerts, no app or data plan required" },
  { value: "ESP32", label: "solar-friendly, low-power hardware" },
];

export default function LandingPage() {
  return (
    <div className="max-w-marketing relative mx-auto">
      <MarketingNav active={null} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-5 pt-5">
        <div className="rounded-hero relative flex min-h-170 items-end overflow-hidden">
          <Image
            src="/hero-field.jpg"
            alt="Soil and crops inside a greenhouse at the KNUST site"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="bg-scrim-hero pointer-events-none absolute inset-0" />

          <div className="px-hero-x relative flex w-full flex-wrap items-end justify-between gap-8 pt-16 pb-14">
            <div
              className="animate-rise max-w-150"
              data-gg-anim="1"
            >
              <div className="text-caption tracking-wide rounded-card mb-4.5 inline-block bg-white/14 px-3.5 py-1.5 font-semibold text-white">
                Built on ESP32 · one greenhouse, KNUST
              </div>
              <h1 className="font-display text-hero-landing leading-hero tracking-tighter m-0 mb-4 font-extrabold text-white">
                Know your soil{" "}
                <span className="font-accent text-mint-bright font-normal italic">
                  before it&apos;s too late.
                </span>
              </h1>
              <p className="text-xl-alt leading-body m-0 mb-6.5 max-w-115 text-white/86">
                GreenGo watches soil moisture, temperature and humidity every 10
                seconds, texts you when the soil runs dry, and lets you switch the
                pump on from anywhere.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/pricing" variant="primary" size="md">
                  Request a device
                </ButtonLink>
                <ButtonLink href="#live" variant="ghostOnPhoto" size="md">
                  See a live reading ↓
                </ButtonLink>
              </div>
            </div>

            <HeroReadingCard />
          </div>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section className="px-section-x py-24">
        <div className="bg-mint rounded-hero p-panel-lg">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-card flex flex-col gap-3.5 bg-white p-7"
              >
                <div
                  className={`rounded-button flex h-13 w-13 items-center justify-center ${f.tile}`}
                >
                  {f.icon}
                </div>
                <div className="font-display text-feature text-canopy font-bold">
                  {f.title}
                </div>
                <div className="text-md text-ink leading-body">{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="px-section-x pt-5 pb-24">
        <div className="mb-12 text-center">
          <div className="mb-2.5">
            <Eyebrow>How it works</Eyebrow>
          </div>
          <h2 className="font-display text-h2-lg text-canopy tracking-tight m-0 font-extrabold">
            Device → readings → alert →{" "}
            <span className="font-accent text-leaf font-normal italic">pump.</span>
          </h2>
        </div>
        <div className="bg-mint rounded-hero p-panel">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            {STEPS.map((s) => (
              <NumberedStep key={s.n} number={s.n} title={s.title} body={s.body} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Segmented-bar explainer ──────────────────────────────────────── */}
      <section id="bar" className="px-section-x pt-5 pb-24">
        <div className="bg-leaf rounded-hero p-band grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-12">
          <div>
            <div className="mb-3.5">
              <Eyebrow tone="light">The same instrument, two surfaces</Eyebrow>
            </div>
            <h2 className="font-display text-h2-alt leading-snug m-0 mb-3.5 font-extrabold text-white">
              The bar on your phone is the bar on the LCD in the greenhouse.
            </h2>
            <p className="text-md leading-loose m-0 text-white/85">
              GreenGo&apos;s device draws its readings as blocky bar graphs on a
              20×4 character screen — the same shape the farmer sees standing next
              to the crop. We didn&apos;t design a new chart for the app. We redrew
              the one that&apos;s already there, so both surfaces read as one
              product.
            </p>
          </div>

          <div className="rounded-card grid gap-4.5 bg-white px-7 py-6">
            {BAR_ROWS.map((r) => (
              <div key={r.label}>
                <div className="text-meta mb-2 flex justify-between">
                  <span className="text-canopy font-semibold">{r.label}</span>
                  <span className="font-mono text-canopy">{r.value}</span>
                </div>
                <SegmentedBar
                  percent={r.percent}
                  count={20}
                  height={36}
                  surface="marketing"
                  radius="sm"
                  label={`${r.label} — ${r.value}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Specs strip ──────────────────────────────────────────────────── */}
      <section id="specs" className="px-section-x pt-5 pb-24">
        <div className="mb-10 text-center">
          <div className="mb-2.5">
            <Eyebrow>Honest specifics</Eyebrow>
          </div>
          <h2 className="font-display text-h2 text-canopy m-0 font-extrabold">
            One device, one greenhouse — here&apos;s exactly what it does.
          </h2>
        </div>
        <div className="bg-mint rounded-hero p-panel">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {SPECS.map((s) => (
              <StatCard key={s.value} variant="spec" value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band + footer, both on the photograph ────────────────────── */}
      <section id="contact" className="px-5 pt-5 pb-14">
        <div className="rounded-hero relative overflow-hidden">
          <Image
            src="/footer-greenhouse.jpg"
            alt="Farmland at the edge of a greenhouse"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="bg-scrim-cta pointer-events-none absolute inset-0" />

          <div className="px-footer-x pt-cta-top pb-cta-bottom relative flex flex-col items-center gap-5.5 text-center">
            <h2 className="font-display text-cta-band leading-cta tracking-tight m-0 max-w-190 font-extrabold text-white">
              Put a sensor in the ground. See what&apos;s actually happening.
            </h2>
            <p className="text-lg-alt leading-body m-0 max-w-110 text-white/78">
              Request a device for your farm, or ask us anything about the sensors,
              the SMS alerts, or the pump control.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/pricing" variant="primary" size="lg">
                Request a device
              </ButtonLink>
              <ButtonLink href="mailto:hello@greengo.dev" variant="ghostOnPhoto" size="lg">
                Talk to us
              </ButtonLink>
            </div>
          </div>

          <MarketingFooter surface="photo" />
        </div>
      </section>
    </div>
  );
}
