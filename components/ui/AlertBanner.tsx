import type { ReactNode } from "react";
import { IconWarning } from "../icons";

/* Three instances in the handoff, all sharing the warn colour set
 * (bg --color-warn-bg / border --color-pending / text --color-warn-text):
 *   Device Dashboard stale banner  · radius 16 · 14px 18px · with triangle icon
 *   Device Detail uncalibrated     · radius 16 · 16px 20px · no icon
 *   Provision "shown once"         · radius 12 · 14px 16px · bold lead, no icon
 * The danger and mint tones are extrapolated for the DEV-005 pages, reusing
 * the claim-code feedback colour sets that already exist in the handoff. */

export type BannerTone = "warn" | "danger" | "mint" | "neutral";

const TONES: Record<BannerTone, string> = {
  warn: "bg-warn-bg border-pending text-warn-text",
  danger: "bg-danger-bg border-danger-border text-danger",
  mint: "bg-mint border-leaf text-canopy",
  neutral: "bg-stone border-line text-muted",
};

export function AlertBanner({
  tone = "warn",
  icon = false,
  size = "md",
  children,
  /** Renders as role="alert" for state changes the user must notice
   *  (a device going stale). Static page-load warnings use role="status". */
  live = "status",
}: {
  tone?: BannerTone;
  icon?: boolean;
  /** md = radius 16 / 14px 18px · sm = radius 12 / 14px 16px */
  size?: "md" | "sm";
  children: ReactNode;
  live?: "status" | "alert" | "none";
}) {
  const geometry =
    size === "md" ? "rounded-panel px-4.5 py-3.5" : "rounded-menu px-4 py-3.5";

  return (
    <div
      className={`border-hair flex items-center gap-2.5 font-semibold ${TONES[tone]} ${geometry} text-body`}
      role={live === "none" ? undefined : live}
    >
      {icon && (
        <span className="shrink-0">
          <IconWarning size={18} />
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
