import { renderAppIcon } from "@/lib/appIcon";

/* Serves /icon-192.png for app/manifest.ts's `icons` array. Next's automatic
 * icon.tsx/apple-icon.tsx convention only wires up <link rel="icon"> and
 * apple-touch-icon — the web app manifest needs its own explicit URLs. */

export function GET() {
  return renderAppIcon(192);
}
