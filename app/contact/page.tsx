import type { Metadata } from "next";
import { MarketingNav } from "@/components/nav/MarketingNav";
import { MarketingFooter } from "@/components/nav/MarketingFooter";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { FormField, TextareaField } from "@/components/ui/FormField";

/* Contact → /contact · source: GreenGo Contact.dc.html
 * Spec: handoff/public.md §5. Copy verbatim.
 * Form is non-functional in Phase 2; wired in Phase 4B. */

export const metadata: Metadata = {
  title: "Contact — GreenGo",
  description:
    "Questions about the sensors, the SMS alerts, or getting a device on your farm — we read every message ourselves.",
};

export default function ContactPage() {
  return (
    <div className="max-w-marketing relative mx-auto">
      <MarketingNav active="contact" />

      <section className="px-section-x grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-14 pt-18 pb-24">
        <div>
          <div className="mb-3.5">
            <Eyebrow>Contact</Eyebrow>
          </div>
          <h1 className="font-display text-hero-contact text-canopy tracking-tighter leading-tight m-0 mb-4.5 font-extrabold">
            Talk to the people{" "}
            <span className="font-accent text-leaf font-normal italic">
              building it.
            </span>
          </h1>
          <p className="text-lg-alt text-ink leading-body m-0 mb-8 max-w-105">
            Questions about the sensors, the SMS alerts, or getting a device on your
            farm — we read every message ourselves.
          </p>

          <div className="flex flex-col gap-5">
            <div>
              <div className="text-caption text-muted tracking-widest mb-1 uppercase">
                Email
              </div>
              <a href="mailto:hello@greengo.dev" className="text-lg font-semibold">
                hello@greengo.dev
              </a>
            </div>
            <div>
              <div className="text-caption text-muted tracking-widest mb-1 uppercase">
                Based in
              </div>
              <div className="text-lg text-canopy font-semibold">
                Kumasi, Ghana — KNUST
              </div>
            </div>
            <div>
              <div className="text-caption text-muted tracking-widest mb-1 uppercase">
                Team
              </div>
              <div className="text-lg text-canopy font-semibold">
                CS Year 3, Group 5
              </div>
            </div>
          </div>
        </div>

        <div className="bg-mint rounded-hero p-panel">
          <form className="flex flex-col gap-4.5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <FormField label="Name" size="md" placeholder="Your name" name="name" />
              <FormField
                label="Farm / location"
                size="md"
                placeholder="e.g. Ejisu, Ashanti"
                name="location"
              />
            </div>
            <FormField
              label="Email or phone"
              size="md"
              placeholder="How we reach you"
              name="contact"
            />
            <TextareaField
              label="Message"
              rows={5}
              placeholder="What do you want to know?"
              name="message"
            />
            <Button variant="primary" size="md" type="submit" className="self-start">
              Send message
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
