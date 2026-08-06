import Link from "next/link";

/* Same three columns and identical copy on all five marketing pages, in two
 * surface variants:
 *   photo → Landing, sitting on the CTA photograph. White text, top rule
 *           rgba(255,255,255,.14), no top border-radius of its own.
 *   light → the other four pages. Canopy/muted text, top rule --color-line-soft.
 */

export function MarketingFooter({ surface = "light" }: { surface?: "light" | "photo" }) {
  const onPhoto = surface === "photo";

  const heading = onPhoto ? "text-white" : "text-canopy";
  const bodyText = onPhoto ? "text-white/65" : "text-muted";
  const linkText = onPhoto
    ? "text-white/72 hover:text-white"
    : "text-leaf hover:text-canopy";
  const rule = onPhoto ? "border-white/14" : "border-line-soft";

  return (
    <div
      className={`px-footer-x relative grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-8 border-t pt-9 ${rule} ${onPhoto ? "pb-10" : ""}`}
    >
      <div>
        <div className={`font-display text-2xl mb-2.5 font-bold ${heading}`}>GreenGo</div>
        <div className={`text-body leading-body ${bodyText}`}>
          A soil moisture and greenhouse monitor built on ESP32. One device, one
          greenhouse, KNUST CS Year 3 — Group 5.
        </div>
      </div>

      <div className="text-body flex flex-col gap-2.25">
        <div className={`mb-1 font-semibold ${heading}`}>Product</div>
        <Link href="/how-it-works" className={linkText}>
          How it works
        </Link>
        <Link href="/live-demo" className={linkText}>
          Live demo
        </Link>
        <Link href="/pricing" className={linkText}>
          Pricing
        </Link>
      </div>

      <div className="text-body flex flex-col gap-2.25">
        <div className={`mb-1 font-semibold ${heading}`}>Contact</div>
        <a href="mailto:hello@greengo.dev" className={linkText}>
          hello@greengo.dev
        </a>
        <span className={onPhoto ? "text-white/55" : "text-muted"}>Kumasi, Ghana</span>
      </div>
    </div>
  );
}
