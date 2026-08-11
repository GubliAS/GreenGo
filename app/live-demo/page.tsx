import type { Metadata } from "next";
import { MarketingNav } from "@/components/nav/MarketingNav";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { LiveDemoReadings } from "@/components/marketing/LiveDemoReadings";
import { ButtonLink } from "@/components/ui/Button";
import { isTenantLoggedIn } from "@/lib/marketing-session";

/* Live Demo → /live-demo · source: GreenGo Live Demo.dc.html
 * Spec: handoff/public.md §3. Copy verbatim. */

export const metadata: Metadata = {
  title: "Live demo — GreenGo",
  description:
    "No login, nothing staged. The readings come from the actual sensor unit in our greenhouse, refreshed on the same 10-second cycle it reports on.",
};

export default async function LiveDemoPage() {
  const loggedIn = await isTenantLoggedIn();
  return (
    <div className="max-w-marketing relative mx-auto">
      <MarketingNav active="live-demo" loggedIn={loggedIn} />

      <section className="px-section-x pt-16 text-center">
        <div className="text-caption tracking-wide rounded-card bg-mint text-canopy mb-4.5 inline-flex items-center gap-2 px-4 py-1.75 font-semibold">
          <span className="bg-leaf h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          Public, read-only — our one greenhouse, KNUST
        </div>
        <h1 className="font-display text-hero-demo text-canopy tracking-tighter leading-tight m-0 mb-4 font-extrabold">
          This is real soil,{" "}
          <span className="font-accent text-leaf font-normal italic">
            reporting right now.
          </span>
        </h1>
        <p className="text-lg-alt text-ink leading-body m-0 mx-auto max-w-130">
          No login, nothing staged. The readings below come from the actual sensor
          unit in our greenhouse, refreshed on the same 10-second cycle it reports
          on.
        </p>
      </section>

      <section className="px-section-x pt-12 pb-24">
        <LiveDemoReadings />
      </section>

      <section className="px-section-x pt-5 pb-24">
        <div className="bg-mint rounded-hero p-panel flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-120">
            <h2 className="font-display text-h2-sm text-canopy m-0 mb-2.5 font-extrabold">
              Want this dashboard on your own farm?
            </h2>
            <p className="text-base text-ink leading-body m-0">
              The tenant dashboard adds history, alerts, and pump control for your
              device. This view is the public, read-only version of the same
              instrument.
            </p>
          </div>
          <ButtonLink href="/pricing" variant="primary" size="md">
            Request a device
          </ButtonLink>
        </div>
      </section>

      <section className="px-5 pt-5 pb-14">
        <MarketingFooter surface="light" />
      </section>
    </div>
  );
}
