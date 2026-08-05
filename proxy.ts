import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

/* Route protection. Named `proxy.ts` (not `middleware.ts` — Next 16
 * deprecated that convention/export name in favour of this one) and runs on
 * the Edge runtime, so it uses jose's jwtVerify (see lib/session.ts) rather
 * than anything Node-only.
 *
 * Tenant area requires a `kind: "tenant"` session; admin area requires
 * `kind: "admin"`. Both redirect to their own login page with a `from`
 * query param, matching the handoff's forgot-password pattern
 * (`?from=%2Fdev%2Ftokens`-style redirects already used elsewhere in
 * this app). The public marketing site, /login, /admin/login, and the
 * device-authenticated /api/telemetry are never gated here. */

const TENANT_PREFIXES = ["/devices", "/settings", "/notifications"];
const ADMIN_PREFIX = "/admin";
const ADMIN_PUBLIC_PATHS = ["/admin/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsTenant = TENANT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const needsAdmin =
    (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) &&
    !ADMIN_PUBLIC_PATHS.includes(pathname);

  if (!needsTenant && !needsAdmin) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (needsTenant && session?.kind !== "tenant") {
    return redirectTo(request, "/login");
  }
  if (needsAdmin && session?.kind !== "admin") {
    return redirectTo(request, "/admin/login");
  }

  return NextResponse.next();
}

function redirectTo(request: NextRequest, loginPath: string) {
  const url = request.nextUrl.clone();
  const from = url.pathname;
  url.pathname = loginPath;
  url.search = `?from=${encodeURIComponent(from)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/devices/:path*", "/settings/:path*", "/notifications/:path*", "/admin/:path*"],
};
