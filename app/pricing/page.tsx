import type { Metadata } from "next";
import { MarketingNav } from "@/components/nav/MarketingNav";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { isTenantLoggedIn } from "@/lib/marketing-session";

/* Pricing → /pricing · source: GreenGo Pricing.dc.html
 * Spec: handoff/public.md §4. Copy verbatim.
 * Form is non-functional in Phase 2; wired in Phase 4B. */

export const metadata: Metadata = {
  title: "Pricing — GreenGo",
  description:
    "GreenGo is one device running in one greenhouse. Before we set a price, we want it running in yours too.",
};

const INCLUDED = [
  "One ESP32 sensor unit — soil probe, DHT11, LCD, buzzer, relay",
  "Guided calibration for your specific soil",
  "SMS alerts, no data plan required",
  "Dashboard access for history and pump control",
];

export default async function PricingPage() {
  const loggedIn = await isTenantLoggedIn();
  return (
    <div className="max-w-marketing relative mx-auto">
      <MarketingNav active="pricing" loggedIn={loggedIn} />

      <section className="px-section-x pt-16 text-center">
        <div className="mb-3.5">
          <Eyebrow>Pricing</Eyebrow>
        </div>
        <h1 className="font-display text-hero-pricing text-canopy tracking-tighter leading-tight m-0 mb-4 font-extrabold">
          We haven&apos;t priced this{" "}
          <span className="font-accent text-leaf font-normal italic">
            yet — on purpose.
          </span>
        </h1>
        <p className="text-lg-alt text-ink leading-body m-0 mx-auto max-w-135">
          GreenGo is one device running in one greenhouse. Before we set a price, we
          want it running in yours too. Tell us about your farm and we&apos;ll follow
          up directly.
        </p>
      </section>

      <section className="px-section-x grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-start gap-14 pt-12 pb-24">
        {/* Left: what's included */}
        <div className="flex flex-col gap-4">
          <div className="bg-mint rounded-card p-6.5">
            <div className="text-lg text-canopy mb-2.5 font-bold">
              What comes with a device
            </div>
            <div className="flex flex-col gap-2.5">
              {INCLUDED.map((line) => (
                <div key={line} className="text-body text-ink flex gap-2.5">
                  <span className="text-leaf" aria-hidden="true">
                    ＋
                  </span>
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="border-hair border-line-soft rounded-card p-6.5">
            <div className="text-body text-muted leading-body">
              No partner network yet, no volume pricing, no subscription tiers — just
              one team building one device. Real numbers come once we&apos;ve
              installed a few more.
            </div>
          </div>
        </div>

        {/* Right: request form */}
        <div className="border-hair border-line-soft rounded-hero p-card-lg bg-white">
          <h2 className="font-display text-19 text-canopy m-0 mb-5.5 font-bold">
            Request a device
          </h2>
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-4">
              <FormField label="Name" size="md" placeholder="Your name" name="name" />
              <FormField
                label="Phone or email"
                size="md"
                placeholder="How we reach you"
                name="contact"
              />
            </div>
            <FormField
              label="Farm location"
              size="md"
              placeholder="Town / region"
              name="location"
            />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-4">
              <FormField
                label="Greenhouse size"
                size="md"
                placeholder="e.g. 200 m²"
                name="size"
              />
              <FormField
                label="Crop"
                size="md"
                placeholder="e.g. tomato, pepper"
                name="crop"
              />
            </div>
            <Button variant="primary" size="md" type="submit" className="self-start">
              Send request
            </Button>
          </form>
        </div>
      </section>

      <section className="px-5 pt-5 pb-14">
        <MarketingFooter surface="light" />
      </section>
    </div>
  );
}
