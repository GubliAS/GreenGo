import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* Seven variants, all observed in the handoff. See MANIFEST.md §C.2.
 * Several handoff "buttons" are actually <a> elements — hence ButtonLink. */

export type ButtonVariant =
  | "primary" // bg-leaf, hover bg-leaf-deep
  | "primaryDark" // bg-canopy — the pump-ON state
  | "ghostOnPhoto" // translucent white + white border, over photography
  | "outline" // white fill + hairline border (Reveal / Copy / live-tail)
  | "destructive" // bg-danger (regenerate key / unclaim)
  | "onGreen" // white fill inside green bands
  | "disabled"; // bg-stone — rendered when disabled

export type ButtonSize =
  | "nav" // 13px 22px · 13.5px — marketing nav CTA
  | "md" // 14px 26px · 14.5px — default primary
  | "lg" // 15px 28px · 15px — CTA bands
  | "admin" // 11px 20px · 13.5px — admin page actions
  | "sm" // 9px 14px · 13px — inline outline/destructive
  | "block"; // w-full 12px · 13.5px — pump control

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-leaf text-white hover:bg-leaf-deep",
  primaryDark: "bg-canopy text-white",
  ghostOnPhoto:
    "bg-white/12 border-hair border-white/50 text-white hover:bg-white/20",
  outline: "bg-white border-hair border-line text-ink hover:bg-app",
  destructive: "bg-danger text-white",
  onGreen: "bg-white text-canopy",
  disabled: "bg-stone text-faint cursor-not-allowed",
};

const SIZES: Record<ButtonSize, string> = {
  nav: "px-5.5 py-3.25 text-body rounded-button",
  md: "px-6.5 py-3.5 text-md rounded-button",
  lg: "px-7 py-3.75 text-lg rounded-button",
  admin: "px-5 py-2.75 text-body rounded-menu",
  sm: "px-3.5 py-2.25 text-sm rounded-sm",
  block: "w-full py-3 text-body rounded-menu",
};

/* Ghost buttons sit next to a primary on photography and carry a 1.5px border.
 * The handoff compensates with less vertical padding so both end up the same
 * height: 12.5px vs 14px at md, 13.5px vs 15px at lg. Only md and lg appear
 * this way in the handoff; other sizes fall through to SIZES. */
const GHOST_SIZES: Partial<Record<ButtonSize, string>> = {
  md: "px-6 py-ghost-md text-md rounded-button",
  lg: "px-6.5 py-ghost-lg text-lg rounded-button",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap " +
  "transition-colors duration-250 ease-ui cursor-pointer " +
  "disabled:cursor-not-allowed";

function classesFor(
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  className?: string,
) {
  // A disabled control always takes the stone treatment, whatever it started as.
  const v = disabled ? VARIANTS.disabled : VARIANTS[variant];
  // Ghost/outline variants keep their border; everything else has none.
  const bordered = variant === "ghostOnPhoto" || variant === "outline";
  const sizing =
    variant === "ghostOnPhoto" && !disabled ? (GHOST_SIZES[size] ?? SIZES[size]) : SIZES[size];
  return [BASE, bordered ? "" : "border-0", v, sizing, className]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className"> & { className?: string }) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={classesFor(variant, size, disabled, className)}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      {...rest}
      className={`${classesFor(variant, size, false, className)} hover:text-current`}
    >
      {children}
    </Link>
  );
}
