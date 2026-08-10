/* Mock data for Phase 2D admin pages, conforming to lib/types.ts.
 * Replaced by real Prisma queries in Phase 4B. */

export const MOCK_ADMIN = {
  name: "Owusu Prempeh",
  email: "ops@greengo.dev",
  initials: "OP",
};

export const MOCK_ADMIN_DEVICE = {
  id: "gh-1",
  label: "Greenhouse 1",
  mac: "A4:CF:12:8E:3B:01",
  claimCode: "GG-4F82-K1",
  claimStatus: "claimed" as const,
  firmware: "v1.4.2",
  uptime: "46d 3h",
  signalDbm: -62,
  batteryV: 3.9,
  tenantName: "Kwame Asante",
  claimedLabel: "Claimed 2 months ago",
};

export const MOCK_UNCLAIMED_DEVICE = {
  id: "gh-2-unclaimed",
  mac: "A4:CF:12:8E:3B:02",
};
