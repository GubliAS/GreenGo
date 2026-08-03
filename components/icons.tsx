/* The handoff uses no icon library — every icon is hand-drawn inline SVG.
 * Ported verbatim, preserving the 1.8px stroke weight and fill:none.
 * Only the logo mark is filled. See MANIFEST.md §C.3. */

type IconProps = {
  size?: number;
  className?: string;
};

/** Droplet + 3-bar logo mark. Chosen option "2b" from GreenGo Logo Options. */
export function DropletMark({
  width = 26,
  height = 30,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 72 84"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M36 4 C52 28 68 45 68 58 C68 73 53.5 81 36 81 C18.5 81 4 73 4 58 C4 45 20 28 36 4 Z"
        fill="var(--color-leaf)"
      />
      <rect x="16.5" y="52" width="9" height="16" rx="2" fill="var(--color-mint)" />
      <rect x="31.5" y="42" width="9" height="26" rx="2" fill="var(--color-mint)" />
      <rect x="46.5" y="52" width="9" height="16" rx="2" fill="var(--color-mint)" />
    </svg>
  );
}

/** Soil moisture / droplet, stroked. Landing feature card + Live Demo. */
export function IconMoisture({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3.5 L17 12.2 C18.5 14.8 17.6 18.2 14.8 19.5 C11.3 21.1 7.4 19 7 15.2 C6.7 12.6 8.3 10.3 12 3.5 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.6 15.5 L15.4 15.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** Humidity / greenhouse dome. Note: Live Demo omits the clapper path. */
export function IconHumidity({
  size = 24,
  className,
  withClapper = true,
}: IconProps & { withClapper?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 10 C6 6.5 8.7 4 12 4 C15.3 4 18 6.5 18 10 L18 14.5 L19.5 17 L4.5 17 L6 14.5 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {withClapper && (
        <path
          d="M10 19.5 C10 20.6 10.9 21.5 12 21.5 C13.1 21.5 14 20.6 14 19.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}

/** Pump / power arc. Landing feature card 3. */
export function IconPump({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3.5 L12 11" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7 6.2 A8 8 0 1 0 17 6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Warning triangle. Uses the dedicated --color-warn-icon stroke (#B5751F). */
export function IconWarning({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3 L22 20 L2 20 Z"
        stroke="var(--color-warn-icon)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 9.5 L12 14" stroke="var(--color-warn-icon)" strokeWidth="1.8" />
      <circle cx="12" cy="16.8" r="0.9" fill="var(--color-warn-icon)" />
    </svg>
  );
}

/** Checkmark. 2.2px stroke with round caps — heavier than the 1.8px set. */
export function IconCheck({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 12.5 L10 17.5 L19 6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Caret for dropdowns. The handoff uses a "▾" text glyph; this is the SVG
 *  equivalent at the same visual weight, so rotation animates cleanly. */
export function IconCaret({ size = 12, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.5 4.5 L6 8 L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Close affordance for Modal/Toast — DEV-004, no handoff reference.
 *  Drawn at the 1.8px weight of the handoff's icon set. */
export function IconClose({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 6 L18 18 M18 6 L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Animated hamburger → X. Each bar transitions independently: the middle
 *  fades out, top/bottom rotate ±45° and translate 7px to form the X.
 *  Ported from GreenGo Landing Page / GreenGo Devices List. */
export function Hamburger({ open, width = 22 }: { open: boolean; width?: number }) {
  const bar = "block h-0.5 rounded-segment bg-canopy transition-transform duration-250 ease-ui";
  return (
    <span className="flex flex-col justify-center gap-1.25" style={{ width }}>
      <span
        className={bar}
        style={{ width, transform: open ? "translateY(7px) rotate(45deg)" : undefined }}
      />
      <span className={bar} style={{ width, opacity: open ? 0 : 1 }} />
      <span
        className={bar}
        style={{ width, transform: open ? "translateY(-7px) rotate(-45deg)" : undefined }}
      />
    </span>
  );
}
