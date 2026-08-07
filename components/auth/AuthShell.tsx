import Image from "next/image";
import { Logo } from "../Logo";
import { QuoteRotator } from "./QuoteRotator";

/* Shared shell for Login, Forgot Password, Set Password, Admin Login.
 * Source: GreenGo Login.dc.html. The page itself never scrolls — only the
 * left form column does, via .gg-scroll (scrollbar hidden). Right column is
 * photo + rotating quote, stacking below the form under ~600px combined width
 * via the intrinsic minmax(min(300px,100%),1fr) grid. */

export function AuthShell({
  children,
  logoHref = "/",
  admin = false,
}: {
  children: React.ReactNode;
  logoHref?: string;
  admin?: boolean;
}) {
  return (
    <div className="grid h-screen grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] auto-rows-[100%] overflow-hidden">
      {/* min-w-0: grid items default to min-width:auto and won't shrink below
          fixed-width children (the 320px tabs), which ate the right padding
          on phones and clipped "Claim your device". */}
      <div className="gg-scroll p-auth mx-auto box-border flex h-full w-full min-w-0 max-w-auth-form flex-col justify-center overflow-y-auto">
        <div className="mb-10">
          {admin ? (
            <Logo size="marketing" href={logoHref} withAdminBadge asLink={false} />
          ) : (
            <Logo size="marketing" href={logoHref} />
          )}
        </div>
        {children}
      </div>

      <div className="bg-canopy relative min-w-0 overflow-hidden">
        <Image
          src="/login-greenhouse.jpg"
          alt=""
          fill
          /* Below 760px the two-column grid stacks (minmax(min(300px,100%),1fr) can't
           * fit two tracks), so the photo column becomes full-width, not half.
           * A flat "50vw" hint made the browser fetch a half-resolution source
           * and stretch it 2x on mobile — caught by the screenshot harness's
           * upscale check, not by anything that reads the JSX. */
          sizes="(max-width: 759px) 100vw, 50vw"
          className="object-cover opacity-55"
          priority
        />
        <div className="bg-scrim-login absolute inset-0" />
        <div className="p-login-photo relative box-border flex h-full flex-col justify-end">
          <div
            className="font-display text-quotemark leading-none -mb-6 text-white/16"
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <QuoteRotator />
        </div>
      </div>
    </div>
  );
}
