import type { Metadata } from "next";
import { MarketingNav } from "@/components/nav/MarketingNav";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { NumberedStep } from "@/components/ui/Feedback";

/* How It Works → /how-it-works · source: GreenGo How It Works.dc.html
 * Spec: handoff/public.md §2. Copy verbatim. */

export const metadata: Metadata = {
  title: "How it works — GreenGo",
  description:
    "GreenGo is a single ESP32 unit sitting in the greenhouse. Here's exactly what it measures, how it talks to you, and what happens when the soil runs dry.",
};

const STEPS = [
  {
    n: "01",
    title: "Sensor reads the soil",
    body: "A calibrated resistive bridge measures soil moisture. A DHT11 reads air temperature and humidity. An LDR adds ambient light — provisional, may be dropped.",
  },
  {
    n: "02",
    title: "It shows on the LCD, right there",
    body: "A 20×4 character screen draws each reading as a blocky bar graph, built from custom LCD segment characters — no phone required to check.",
  },
  {
    n: "03",
    title: "And reaches your dashboard",
    body: "The same reading is pushed to the web dashboard, and an SMS goes out the moment soil drops below your threshold.",
  },
  {
    n: "04",
    title: "The pump responds",
    body: "In AUTO mode the relay switches the pump on. In MANUAL, a physical switch on site has the final say — remote control is disabled and says why.",
  },
];

const HARDWARE: { lead: string; rest: string }[] = [
  {
    lead: "Soil moisture bridge",
    rest: " — resistive probe, calibrated per device in the setup wizard.",
  },
  { lead: "DHT11", rest: " — air temperature and relative humidity." },
  {
    lead: "Relay + pump",
    rest: " — switched by AUTO logic or your command, never against the physical MANUAL switch.",
  },
  { lead: "Buzzer", rest: " — sounds on site when soil crosses dry." },
  {
    lead: "Signal & battery",
    rest: " — reported every cycle, so you know when a reading is stale, not just wrong.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-marketing relative mx-auto">
      <MarketingNav active="how-it-works" />

      <section className="px-section-x pt-16 text-center">
        <div className="mb-3.5">
          <Eyebrow>How it works</Eyebrow>
        </div>
        <h1 className="font-display text-hero-how text-canopy tracking-tighter leading-tight m-0 mb-4.5 font-extrabold">
          One sensor, four things it does{" "}
          <span className="font-accent text-leaf font-normal italic">
            every 10 seconds.
          </span>
        </h1>
        <p className="text-xl text-ink leading-body m-0 mx-auto max-w-150">
          GreenGo is a single ESP32 unit sitting in the greenhouse. Here&apos;s
          exactly what it measures, how it talks to you, and what happens when the
          soil runs dry.
        </p>
      </section>

      <section className="px-section-x py-14">
        <div className="bg-mint rounded-hero p-panel grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          {STEPS.map((s) => (
            <NumberedStep key={s.n} number={s.n} title={s.title} body={s.body} />
          ))}
        </div>
      </section>

      <section className="px-section-x py-14">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-12">
          <div>
            <div className="mb-3.5">
              <Eyebrow>The hardware</Eyebrow>
            </div>
            <h2 className="font-display text-h2 text-canopy leading-snug m-0 mb-4 font-extrabold">
              An ESP32, a probe, a relay, and a switch you can trust.
            </h2>
            <div className="flex flex-col gap-3.5">
              {HARDWARE.map((h) => (
                <div key={h.lead} className="flex items-start gap-3">
                  <div
                    className="bg-leaf mt-1.75 h-2 w-2 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  <div className="text-md text-ink leading-body">
                    <strong className="text-canopy">{h.lead}</strong>
                    {h.rest}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The handoff's only genuinely empty image slot — no src provided.
              Rendered as the placeholder it is rather than inventing an image.
              MANIFEST.md §E.2 · needs real product photography. */}
          <div
            className="border-hair border-line-dashed rounded-card text-meta text-muted flex w-full items-center justify-center border-dashed bg-app p-6 text-center"
            style={{ aspectRatio: "4 / 5" }}
          >
            Photo of the device / sensor probe
            <br />
            <span className="text-label text-faint">
              placeholder — no asset in handoff
            </span>
          </div>
        </div>
      </section>

      <section className="px-section-x pt-5 pb-24">
        <div className="bg-leaf rounded-hero p-cta-band flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-h2 m-0 font-extrabold text-white">
            Want to see it running, right now?
          </h2>
          <p className="text-md m-0 max-w-105 text-white/85">
            Our one device, in our one greenhouse — a public, read-only view.
          </p>
          <ButtonLink href="/live-demo" variant="onGreen" size="md">
            See the live demo
          </ButtonLink>
        </div>
      </section>

      <section className="px-5 pt-5 pb-14">
        <MarketingFooter surface="light" />
      </section>
    </div>
  );
}
