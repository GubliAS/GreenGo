import { db } from "@/lib/db";

/* Human-readable URL slugs for devices. Internal cuid stays the PK;
 * slug is what appears in /devices/[slug] and /admin/devices/[slug]. */

const RESERVED = new Set(["add", "provision", "new", "api"]);

export function slugifyLabel(input: string | null | undefined): string {
  const base = (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  if (!base || RESERVED.has(base)) return "device";
  return base;
}

/** Prefer label; fall back to a MAC-derived stub so unlabelled rows still route. */
export function slugSourceFromDevice(label: string | null | undefined, mac: string): string {
  if (label?.trim()) return label;
  return `device-${mac.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toLowerCase()}`;
}

/**
 * Returns a globally unique slug. Retries with -2, -3, … then a short suffix.
 */
export async function allocateDeviceSlug(
  label: string | null | undefined,
  opts?: { mac?: string; excludeId?: string },
): Promise<string> {
  const source = opts?.mac ? slugSourceFromDevice(label, opts.mac) : label;
  let candidate = slugifyLabel(source);
  if (RESERVED.has(candidate)) candidate = "device";

  for (let n = 0; n < 50; n++) {
    const trySlug = n === 0 ? candidate : `${candidate}-${n + 1}`;
    const existing = await db.device.findUnique({
      where: { slug: trySlug },
      select: { id: true },
    });
    if (!existing || existing.id === opts?.excludeId) return trySlug;
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${candidate}-${suffix}`;
}

/** cuid-shaped ids from Prisma (@default(cuid())). */
export function looksLikeCuid(value: string): boolean {
  return /^c[a-z0-9]{24,}$/i.test(value);
}
