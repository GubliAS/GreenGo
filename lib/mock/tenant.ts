/* Mock data for Phase 2C tenant pages, conforming to lib/types.ts.
 * Replaced by real Prisma queries in Phase 4B — component props are already
 * shaped to make that swap mechanical. */

export const MOCK_DEVICE = {
  id: "gh-1",
  label: "Greenhouse 1",
  mac: "A4:CF:12:8E:3B:01",
  claimCode: "GG-4F82-K1",
  location: "KNUST",
  installedLabel: "installed 2 months ago",
  firmware: "v1.4.2",
};

export const MOCK_TENANT = {
  name: "Kwame Asante",
  initials: "KA",
  phoneMasked: "+233 24 XXX XX01",
};
