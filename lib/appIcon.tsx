import { ImageResponse } from "next/og";

/* Shared geometry for every generated app icon (favicon, apple-icon, and the
 * 192/512 PWA manifest icons — DEV-014). Satori/ImageResponse can't read CSS
 * custom properties, so these are the theme's raw hex values, not var()
 * references: --color-canopy #17352A, --color-leaf #2F9D46, --color-mint
 * #EAF7EE. Geometry is the chosen "2b" mark from GreenGo Logo Options,
 * traced from components/icons.tsx's DropletMark (viewBox 0 0 72 84).
 *
 * The mark is drawn inset within a canopy-green rounded square so every
 * icon works as a standalone home-screen tile, and the drawable area stays
 * within the ~80% "safe zone" maskable icons require — the OS may clip a
 * circle/squircle out of the full square, so content can't touch the edges. */

export function renderAppIcon(size: number) {
  const scale = size / 84; // droplet viewBox is 72x84; scale height to fit
  const w = 72 * scale;
  const h = 84 * scale;
  const inset = size * 0.14; // keeps the mark inside the maskable safe zone

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17352A",
        }}
      >
        <svg
          width={w * (1 - 0.14 * 2)}
          height={h * (1 - 0.14 * 2)}
          viewBox="0 0 72 84"
          style={{ margin: inset }}
        >
          <path
            d="M36 4 C52 28 68 45 68 58 C68 73 53.5 81 36 81 C18.5 81 4 73 4 58 C4 45 20 28 36 4 Z"
            fill="#2F9D46"
          />
          <rect x="16.5" y="52" width="9" height="16" rx="2" fill="#EAF7EE" />
          <rect x="31.5" y="42" width="9" height="26" rx="2" fill="#EAF7EE" />
          <rect x="46.5" y="52" width="9" height="16" rx="2" fill="#EAF7EE" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
