import Image from "next/image";
import { Logo } from "../Logo";
import { QuoteRotator } from "./QuoteRotator";

/* Shared shell for Login, Forgot Password, Set Password, Admin Login.
 * Source: GreenGo Login.dc.html. The page itself never scrolls — only the
 * left form column does, via .gg-scroll (scrollbar hidden). Right column is
 * photo + rotating quote, stacking below the form under ~600px combined width
 * via the intrinsic minmax(300px,1fr) grid. */

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
    <div className="grid h-screen grid-cols-[repeat(auto-fit,minmax(300px,1fr))] auto-rows-[100%] overflow-hidden">
      <div className="gg-scroll p-auth mx-auto box-border flex h-full w-full max-w-auth-form flex-col justify-center overflow-y-auto">
        <div className="mb-10">
          {admin ? (
            <Logo size="marketing" href={logoHref} withAdminBadge asLink={false} />
          ) : (
            <Logo size="marketing" href={logoHref} />
          )}
        </div>
        {children}
      </div>

      <div className="bg-canopy relative overflow-hidden">
        <Image
          src="/login-greenhouse.jpg"
          alt=""
          fill
          sizes="50vw"
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
