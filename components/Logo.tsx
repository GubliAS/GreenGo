import Link from "next/link";
import { DropletMark } from "./icons";

/* Appears on all 19 handoff screens at three sizes:
 *   marketing / login → 26×30 mark, 18px wordmark
 *   app / admin       → 22×26 mark, 16px wordmark
 * The wordmark is always "Green" in canopy + "Go" in leaf. */

type LogoSize = "marketing" | "app";

const SIZES: Record<LogoSize, { w: number; h: number; text: string }> = {
  marketing: { w: 26, h: 30, text: "text-2xl" },
  app: { w: 22, h: 26, text: "text-xl" },
};

export function Logo({
  size = "marketing",
  href = "/",
  withAdminBadge = false,
  asLink = true,
}: {
  size?: LogoSize;
  href?: string;
  /** The admin console appends an ADMIN chip beside the wordmark. */
  withAdminBadge?: boolean;
  /** Admin headers render the logo as a static div, not a link. */
  asLink?: boolean;
}) {
  const s = SIZES[size];

  const inner = (
    <>
      <DropletMark width={s.w} height={s.h} />
      <span
        className={`font-display ${s.text} tracking-tighter font-extrabold text-canopy`}
      >
        Green<span className="text-leaf">Go</span>
      </span>
    </>
  );

  const gap = size === "marketing" ? "gap-2.5" : "gap-2.25";

  if (!asLink) {
    return (
      <div className={`flex items-center ${gap}`}>
        {inner}
        {withAdminBadge && <AdminBadge />}
      </div>
    );
  }

  // The visual mark is intentionally small (26x30 / 22x26, per the handoff's
  // brand sizing on all 19 screens) — padding + a matching negative margin
  // grows the LINK's clickable area to the 44px floor without enlarging the
  // mark itself or shifting surrounding layout (the negative margin cancels
  // the padding's footprint in the flex row).
  const hitPad = size === "marketing" ? "py-1.75 -my-1.75" : "py-2.25 -my-2.25";

  return (
    <div className={`flex items-center ${gap}`}>
      <Link
        href={href}
        className={`flex items-center ${gap} ${hitPad} text-inherit hover:text-inherit`}
      >
        {inner}
      </Link>
      {withAdminBadge && <AdminBadge />}
    </div>
  );
}

function AdminBadge() {
  return (
    <span className="text-micro tracking-wide rounded-badge bg-mint text-canopy px-2.25 py-0.75 font-bold">
      ADMIN
    </span>
  );
}
