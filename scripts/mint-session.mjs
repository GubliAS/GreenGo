/* Mints a valid session JWT for Phase 5 responsive testing, matching
 * lib/session.ts's format exactly, so Playwright can reach pages behind
 * proxy.ts's auth check without a live database — the ~14 protected pages
 * that still render Phase 2 mock data need only a valid SESSION cookie, not
 * a live Postgres connection (only 6 pages actually call Prisma; see
 * DEVIATIONS.md's Phase 5 note for the full breakdown).
 *
 * Usage: node scripts/mint-session.mjs tenant|admin
 * Prints the cookie value to stdout. Requires SESSION_SECRET in env. */

import { SignJWT } from "jose";

const kind = process.argv[2] === "admin" ? "admin" : "tenant";
const secret = process.env.SESSION_SECRET;
if (!secret) {
  console.error("SESSION_SECRET is required");
  process.exit(1);
}

const payload =
  kind === "admin"
    ? { kind: "admin", userId: "test-admin-id", role: "SUPER_ADMIN", name: "Test Admin" }
    : { kind: "tenant", userId: "test-user-id", tenantId: "test-tenant-id", name: "Test Tenant" };

const token = await new SignJWT(payload)
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(new TextEncoder().encode(secret));

console.log(token);
