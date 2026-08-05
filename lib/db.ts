import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/* Prisma 7 requires a driver adapter — there is no built-in query engine
 * binary anymore. The connection string is read here at runtime (not baked
 * into schema.prisma; see prisma.config.ts for why).
 *
 * Standard Next.js dev-mode singleton: without this, every hot-reload of a
 * module that imports `db` would open a fresh pool, and dev would exhaust
 * Postgres' connection limit within minutes. */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/* ── Tenant scoping ─────────────────────────────────────────────────────────
 * The single most important invariant in this codebase: a tenant-scoped
 * query's tenantId comes from the session, NEVER from a request parameter or
 * request body. Route handlers must call resolveTenantId(session) and pass
 * the result down — they must never read `params.tenantId` or
 * `body.tenantId` and use it directly in a `where` clause.
 *
 * This helper exists so that invariant has exactly one call site to audit
 * (Phase 6's manifest walk checks this file and every route handler, not
 * every individual query). */

export class TenantScopeError extends Error {
  constructor() {
    super("Session has no tenantId — this route requires an authenticated tenant user.");
    this.name = "TenantScopeError";
  }
}

export function requireTenantId(session: { tenantId: string | null } | null): string {
  if (!session?.tenantId) throw new TenantScopeError();
  return session.tenantId;
}
